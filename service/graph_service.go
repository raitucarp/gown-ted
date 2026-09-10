package service

import (
	"sort"
	"strings"
	"unicode"

	"github.com/raitucarp/gown"
	"github.com/raitucarp/gown-ted/pkg/models"
)

// getSynsetPrimaryLemma retrieves the first written lemma form of a synset.
func getSynsetPrimaryLemma(res *gown.LexicalResource, syn *gown.Synset) string {
	if syn == nil || len(syn.Members) == 0 {
		return ""
	}
	for _, mID := range syn.Members {
		if entry := res.LexicalsById()[mID]; entry != nil && entry.Lemma.WrittenForm != "" {
			return strings.ToLower(entry.Lemma.WrittenForm)
		}
	}
	return ""
}

// extractDefKeywords extracts meaningful content words from a definition string.
func extractDefKeywords(def string) []string {
	words := strings.FieldsFunc(strings.ToLower(def), func(r rune) bool {
		return !unicode.IsLetter(r)
	})
	stop := map[string]bool{
		"a": true, "an": true, "the": true, "and": true, "or": true, "of": true, "in": true, "on": true,
		"at": true, "to": true, "for": true, "with": true, "by": true, "from": true, "as": true, "is": true,
		"that": true, "which": true, "who": true, "whom": true, "this": true, "these": true, "those": true,
		"it": true, "its": true, "be": true, "are": true, "was": true, "were": true, "been": true, "being": true,
		"have": true, "has": true, "had": true, "do": true, "does": true, "did": true, "not": true, "used": true,
		"especially": true, "usually": true, "often": true, "something": true, "someone": true, "such": true,
		"into": true, "about": true, "more": true, "any": true, "other": true, "part": true, "type": true,
	}
	var res []string
	for _, w := range words {
		if len(w) >= 3 && !stop[w] {
			res = append(res, w)
		}
	}
	return res
}

// GetDocumentWordGraph constructs an interactive multi-hop semantic relationship network for document words.
func (s *LexicalService) GetDocumentWordGraph(words []string) models.WordGraphResult {
	s.mu.RLock()
	res := s.resource
	s.mu.RUnlock()

	if res == nil || len(words) == 0 {
		return models.WordGraphResult{
			Nodes: []models.WordGraphNode{},
			Edges: []models.WordGraphEdge{},
		}
	}

	// 1. Clean, lowercase, count word frequencies
	freqMap := make(map[string]int)
	for _, raw := range words {
		w := strings.ToLower(strings.TrimSpace(raw))
		w = strings.TrimFunc(w, func(r rune) bool {
			return unicode.IsPunct(r) || unicode.IsSpace(r) || unicode.IsDigit(r)
		})
		if len(w) < 2 {
			continue
		}
		freqMap[w]++
	}

	if len(freqMap) == 0 {
		return models.WordGraphResult{
			Nodes: []models.WordGraphNode{},
			Edges: []models.WordGraphEdge{},
		}
	}

	// 2. Validate words against WordNet & sort by frequency
	type docWordMeta struct {
		Word        string
		Count       int
		POS         string
		Definition  string
		Synsets     []*gown.Synset
		SynsetIDs   map[string]bool
		Hypernyms   map[string]bool // target synset IDs
		Hyponyms    map[string]bool
		Meronyms    map[string]bool
		Antonyms    map[string]bool // words
		DefKeywords map[string]bool
	}

	var validWords []*docWordMeta
	for w, count := range freqMap {
		entries := res.Lookup(w)
		if len(entries) == 0 {
			continue
		}

		pos := string(entries[0].PartOfSpeech())
		meta := &docWordMeta{
			Word:        w,
			Count:       count,
			POS:         pos,
			SynsetIDs:   make(map[string]bool),
			Hypernyms:   make(map[string]bool),
			Hyponyms:    make(map[string]bool),
			Meronyms:    make(map[string]bool),
			Antonyms:    make(map[string]bool),
			DefKeywords: make(map[string]bool),
		}

		// Keep up to 4 senses to prioritize core meanings
		sensesCount := 0
		for _, e := range entries {
			for _, sense := range e.Senses {
				synset := sense.GetSynset()
				if synset == nil {
					continue
				}
				if meta.Definition == "" {
					meta.Definition = synset.PrimaryDefinition()
				}
				if !meta.SynsetIDs[synset.ID] {
					meta.SynsetIDs[synset.ID] = true
					meta.Synsets = append(meta.Synsets, synset)
					sensesCount++
				}

				// Collect keywords from definition
				for _, kw := range extractDefKeywords(synset.PrimaryDefinition()) {
					meta.DefKeywords[kw] = true
				}

				// Direct synset relations
				for _, rel := range synset.SynsetRelations {
					switch rel.RelType {
					case "hypernym", "instance_hypernym":
						meta.Hypernyms[rel.Target] = true
					case "hyponym", "instance_hyponym":
						meta.Hyponyms[rel.Target] = true
					case "meronym", "part_meronym", "member_meronym", "substance_meronym":
						meta.Meronyms[rel.Target] = true
					}
				}

				// Sense relations (e.g. Antonyms)
				for _, sRel := range sense.SenseRelations {
					if sRel.RelType == "antonym" {
						targetSense := res.SenseById()[sRel.Target]
						if targetSense != nil {
							tSyn := targetSense.GetSynset()
							if tSyn != nil {
								for _, mID := range tSyn.Members {
									if mEntry := res.LexicalsById()[mID]; mEntry != nil {
										meta.Antonyms[strings.ToLower(mEntry.Lemma.WrittenForm)] = true
									}
								}
							}
						}
					}
				}

				if sensesCount >= 4 {
					break
				}
			}
			if sensesCount >= 4 {
				break
			}
		}

		validWords = append(validWords, meta)
	}

	// Sort by frequency desc, then name asc
	sort.Slice(validWords, func(i, j int) bool {
		if validWords[i].Count != validWords[j].Count {
			return validWords[i].Count > validWords[j].Count
		}
		return validWords[i].Word < validWords[j].Word
	})

	// Limit to top 50 document words to preserve high performance
	if len(validWords) > 50 {
		validWords = validWords[:50]
	}

	// 3. Node and Edge tracking maps
	nodeMap := make(map[string]models.WordGraphNode)
	edgeMap := make(map[string]models.WordGraphEdge)

	addNode := func(n models.WordGraphNode) {
		if existing, ok := nodeMap[n.ID]; ok {
			// If updating from intermediate to document word, prioritize document word
			if n.IsDocumentWord && !existing.IsDocumentWord {
				nodeMap[n.ID] = n
			}
			return
		}
		nodeMap[n.ID] = n
	}

	addEdge := func(src, tgt, label, relType string, weight float64) {
		if src == tgt || src == "" || tgt == "" {
			return
		}
		key1 := src + "->" + tgt + ":" + relType
		key2 := tgt + "->" + src + ":" + relType
		if _, ok := edgeMap[key1]; ok {
			return
		}
		if _, ok := edgeMap[key2]; ok {
			return
		}
		edgeMap[key1] = models.WordGraphEdge{
			Source: src,
			Target: tgt,
			Label:  label,
			Type:   relType,
			Weight: weight,
		}
	}

	// Add all document words as primary nodes
	docWordSet := make(map[string]bool)
	for _, m := range validWords {
		docWordSet[m.Word] = true
		addNode(models.WordGraphNode{
			ID:             m.Word,
			Label:          m.Word,
			Type:           "word",
			POS:            m.POS,
			Count:          m.Count,
			IsDocumentWord: true,
			Definition:     m.Definition,
			Depth:          0,
		})
	}

	// 4. Trace hypernym chains for multi-hop taxonomic paths
	// For each document word, map synsetID -> chain of parent synset IDs up to depth 4
	type synsetChain struct {
		Synset *gown.Synset
		Path   []*gown.Synset
	}
	wordChains := make(map[string][]synsetChain) // word -> list of chains

	for _, m := range validWords {
		var chains []synsetChain
		for _, syn := range m.Synsets {
			// BFS up the hypernym hierarchy (depth 4)
			curr := syn
			var path []*gown.Synset
			visited := make(map[string]bool)
			for step := 0; step < 4 && curr != nil; step++ {
				if visited[curr.ID] {
					break
				}
				visited[curr.ID] = true
				path = append(path, curr)

				// Find parent hypernym
				var parent *gown.Synset
				for _, rel := range curr.SynsetRelations {
					if rel.RelType == "hypernym" || rel.RelType == "instance_hypernym" {
						if target := res.SynsetsById()[rel.Target]; target != nil {
							parent = target
							break
						}
					}
				}
				curr = parent
			}
			chains = append(chains, synsetChain{
				Synset: syn,
				Path:   path,
			})
		}
		wordChains[m.Word] = chains
	}

	intermediateNodeBudget := 55
	intermediateNodesAdded := 0

	// 5. Multi-Hop Pathfinding & Pairwise Semantic Connections
	for i := 0; i < len(validWords); i++ {
		w1 := validWords[i]
		for j := i + 1; j < len(validWords); j++ {
			w2 := validWords[j]

			// A. Direct Synonyms (share synset)
			isDirectSyn := false
			for sID := range w1.SynsetIDs {
				if w2.SynsetIDs[sID] {
					addEdge(w1.Word, w2.Word, "synonym", "synonym", 1.0)
					isDirectSyn = true
					break
				}
			}
			if isDirectSyn {
				continue
			}

			// B. Direct Antonyms
			if w1.Antonyms[w2.Word] || w2.Antonyms[w1.Word] {
				addEdge(w1.Word, w2.Word, "antonym", "antonym", 0.95)
				continue
			}

			// C. Direct Hypernym / Hyponym
			isDirectHyper := false
			for sID := range w2.SynsetIDs {
				if w1.Hypernyms[sID] {
					addEdge(w1.Word, w2.Word, "hypernym", "hypernym", 0.85)
					isDirectHyper = true
					break
				}
			}
			if !isDirectHyper {
				for sID := range w1.SynsetIDs {
					if w2.Hypernyms[sID] {
						addEdge(w2.Word, w1.Word, "hypernym", "hypernym", 0.85)
						isDirectHyper = true
						break
					}
				}
			}
			if isDirectHyper {
				continue
			}

			// D. Direct Meronym
			isDirectMero := false
			for sID := range w2.SynsetIDs {
				if w1.Meronyms[sID] {
					addEdge(w1.Word, w2.Word, "meronym", "meronym", 0.8)
					isDirectMero = true
					break
				}
			}
			if isDirectMero {
				continue
			}

			// E. Direct Definition Overlap (Gloss link)
			if w1.DefKeywords[w2.Word] {
				addEdge(w1.Word, w2.Word, "definition", "definition", 0.75)
				continue
			} else if w2.DefKeywords[w1.Word] {
				addEdge(w2.Word, w1.Word, "definition", "definition", 0.75)
				continue
			}

			// F. Multi-Hop Hypernym Traversal (Find Lowest Common Ancestor - LCA)
			// e.g. "he" -> male -> person <- resident <- "home"
			if intermediateNodesAdded < intermediateNodeBudget {
				chains1 := wordChains[w1.Word]
				chains2 := wordChains[w2.Word]

				type lcaCandidate struct {
					commonSyn *gown.Synset
					path1     []*gown.Synset
					path2     []*gown.Synset
					totalDist int
				}
				var bestCandidate *lcaCandidate

				for _, c1 := range chains1 {
					for idx1, syn1 := range c1.Path {
						for _, c2 := range chains2 {
							for idx2, syn2 := range c2.Path {
								if syn1.ID == syn2.ID {
									// Found common ancestor synset
									dist := idx1 + idx2
									// Avoid top-level abstract root if distance is too large
									lemma := getSynsetPrimaryLemma(res, syn1)
									if lemma == "entity" && dist > 4 {
										continue
									}
									if bestCandidate == nil || dist < bestCandidate.totalDist {
										bestCandidate = &lcaCandidate{
											commonSyn: syn1,
											path1:     c1.Path[:idx1+1],
											path2:     c2.Path[:idx2+1],
											totalDist: dist,
										}
									}
								}
							}
						}
					}
				}

				if bestCandidate != nil && bestCandidate.totalDist > 0 && bestCandidate.totalDist <= 6 {
					// Materialize intermediate nodes along path1
					prevNodeID := w1.Word
					for k := 0; k < len(bestCandidate.path1); k++ {
						syn := bestCandidate.path1[k]
						lemma := getSynsetPrimaryLemma(res, syn)
						if lemma == "" || lemma == w1.Word {
							continue
						}
						if lemma == w2.Word {
							addEdge(prevNodeID, w2.Word, "hypernym", "hypernym", 0.7)
							prevNodeID = w2.Word
							break
						}

						if !docWordSet[lemma] && intermediateNodesAdded < intermediateNodeBudget {
							if _, exists := nodeMap[lemma]; !exists {
								intermediateNodesAdded++
								addNode(models.WordGraphNode{
									ID:             lemma,
									Label:          lemma,
									Type:           "intermediate",
									POS:            string(syn.PartOfSpeech),
									IsDocumentWord: false,
									Definition:     syn.PrimaryDefinition(),
									Depth:          k + 1,
								})
							}
						}
						addEdge(prevNodeID, lemma, "hypernym", "hypernym", 0.65)
						prevNodeID = lemma
					}

					// Materialize intermediate nodes along path2 back to w2
					ancestorID := prevNodeID
					prevBackID := w2.Word
					for k := 0; k < len(bestCandidate.path2); k++ {
						syn := bestCandidate.path2[k]
						lemma := getSynsetPrimaryLemma(res, syn)
						if lemma == "" || lemma == w2.Word {
							continue
						}
						if lemma == ancestorID {
							addEdge(prevBackID, ancestorID, "hypernym", "hypernym", 0.65)
							prevBackID = ancestorID
							break
						}

						if !docWordSet[lemma] && intermediateNodesAdded < intermediateNodeBudget {
							if _, exists := nodeMap[lemma]; !exists {
								intermediateNodesAdded++
								addNode(models.WordGraphNode{
									ID:             lemma,
									Label:          lemma,
									Type:           "intermediate",
									POS:            string(syn.PartOfSpeech),
									IsDocumentWord: false,
									Definition:     syn.PrimaryDefinition(),
									Depth:          k + 1,
								})
							}
						}
						addEdge(prevBackID, lemma, "hypernym", "hypernym", 0.65)
						prevBackID = lemma
					}

					if prevBackID != ancestorID {
						addEdge(prevBackID, ancestorID, "hypernym", "hypernym", 0.65)
					}
				}
			}
		}
	}

	// 6. Convert maps to slices
	nodes := make([]models.WordGraphNode, 0, len(nodeMap))
	for _, n := range nodeMap {
		nodes = append(nodes, n)
	}

	// Sort nodes: document words first by count desc, then intermediate nodes by depth/alphabetical
	sort.Slice(nodes, func(i, j int) bool {
		if nodes[i].IsDocumentWord != nodes[j].IsDocumentWord {
			return nodes[i].IsDocumentWord
		}
		if nodes[i].Count != nodes[j].Count {
			return nodes[i].Count > nodes[j].Count
		}
		return nodes[i].Label < nodes[j].Label
	})

	edges := make([]models.WordGraphEdge, 0, len(edgeMap))
	for _, e := range edgeMap {
		edges = append(edges, e)
	}

	return models.WordGraphResult{
		Nodes: nodes,
		Edges: edges,
	}
}
