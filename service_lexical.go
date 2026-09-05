package main

import (
	"fmt"
	"math"
	"sort"
	"strings"
	"sync"
	"unicode"

	"github.com/raitucarp/gown"
	"github.com/raitucarp/gown/discourse"
	"github.com/raitucarp/gown/expansion"
	"github.com/raitucarp/gown/functional"
	"github.com/raitucarp/gown/phonology"
	"github.com/raitucarp/gown/pragmatics"
	"github.com/raitucarp/gown/semantics"
	"github.com/raitucarp/gown/similarity"
)

// FunctionalInfo captures systemic functional linguistics (Theme/Rheme, Mood, Cohesion).
type FunctionalInfo struct {
	ThemeRheme   functional.ThemeRheme             `json:"themeRheme"`
	Interpersonal functional.InterpersonalAnalysis `json:"interpersonal"`
	CohesiveTies  []functional.CohesiveTie          `json:"cohesiveTies"`
}

// PragmaticsInfo captures speech acts, politeness, and indexical deixis.
type PragmaticsInfo struct {
	SpeechAct  pragmatics.IllocutionaryForce  `json:"speechAct"`
	Politeness pragmatics.PolitenessAnalysis  `json:"politeness"`
	Deixis     []pragmatics.DeicticExpression `json:"deixis"`
}

// DiscourseInfo captures thematic progression and coherence across sentences.
type DiscourseInfo struct {
	ThematicProgression []discourse.ThematicProgressionStep `json:"thematicProgression"`
}

// WordSenseItem represents a single lexical sense for the active word.
type WordSenseItem struct {
	ID          string   `json:"id"`
	SenseNumber int      `json:"senseNumber"`
	POS         string   `json:"pos"`
	Definition  string   `json:"definition"`
	Examples    []string `json:"examples"`
	Lemma       string   `json:"lemma"`
	Lexfile     string   `json:"lexfile"`
	ILI         string   `json:"ili"`
	Confidence  float64  `json:"confidence"`
	IsSelected  bool     `json:"isSelected"`
}

// SynonymGroup groups synonyms belonging to a specific word sense.
type SynonymGroup struct {
	SenseNumber     int      `json:"senseNumber"`
	SenseDefinition string   `json:"senseDefinition"`
	POS             string   `json:"pos"`
	Words           []string `json:"words"`
}

// MorphologyInfo summarizes morphological variations and lemma resolution.
type MorphologyInfo struct {
	Original            string   `json:"original"`
	Lemmas              []string `json:"lemmas"`
	POSList             []string `json:"posList"`
	InflectedVariations []string `json:"inflectedVariations"`
}

// PhonologyInfo provides syllable breakdown and metrics.
type PhonologyInfo struct {
	SyllableCount int      `json:"syllableCount"`
	Syllables     []string `json:"syllables"`
	CVPattern     string   `json:"cvPattern"`
}

// PolysemyInfo quantifies lexical ambiguity.
type PolysemyInfo struct {
	TotalSenses  int     `json:"totalSenses"`
	IsPolysemous bool    `json:"isPolysemous"`
	Entropy      float64 `json:"entropy"`
}

// PoeticWordItem represents a word recommendation matching rhyming, alliteration, or rhythmic criteria.
type PoeticWordItem struct {
	Word          string `json:"word"`
	POS           string `json:"pos"`
	SyllableCount int    `json:"syllableCount"`
	CVPattern     string `json:"cvPattern"`
	RhymeScore    int    `json:"rhymeScore"`
	Gloss         string `json:"gloss"`
}

// PoeticSuggestionsResult bundles rhymes, alliterations, and CV rhythm matches for creative writing.
type PoeticSuggestionsResult struct {
	Word          string           `json:"word"`
	RhymeEnding   string           `json:"rhymeEnding"`
	OnsetCluster  string           `json:"onsetCluster"`
	SyllableCount int              `json:"syllableCount"`
	CVPattern     string           `json:"cvPattern"`
	Rhymes        []PoeticWordItem `json:"rhymes"`
	Alliterations []PoeticWordItem `json:"alliterations"`
	CVSimilar     []PoeticWordItem `json:"cvSimilar"`
}

// LexicalAnalysisResult bundles all lexical, semantic, and morphological analysis.
type LexicalAnalysisResult struct {
	RequestID             int64                   `json:"requestId"`
	Word                  string                  `json:"word"`
	Found                 bool                    `json:"found"`
	PrimaryLemma          string                  `json:"primaryLemma"`
	Senses                []WordSenseItem         `json:"senses"`
	RecommendedSenseIndex int                     `json:"recommendedSenseIndex"`
	WSDConfidence         float64                 `json:"wsdConfidence"`
	SynonymGroups         []SynonymGroup          `json:"synonymGroups"`
	Antonyms              []string                `json:"antonyms"`
	Hypernyms             []string                `json:"hypernyms"`
	Hyponyms              []string                `json:"hyponyms"`
	Meronyms              []string                `json:"meronyms"`
	Morphology            MorphologyInfo          `json:"morphology"`
	Phonology             PhonologyInfo           `json:"phonology"`
	Polysemy              PolysemyInfo            `json:"polysemy"`
	Poetics               PoeticSuggestionsResult `json:"poetics"`
	HierarchyTree         string                  `json:"hierarchyTree"`
	ExpansionTree         *expansion.Node         `json:"expansionTree,omitempty"`
	Functional            FunctionalInfo          `json:"functional"`
	Pragmatics            PragmaticsInfo          `json:"pragmatics"`
	Discourse             DiscourseInfo           `json:"discourse"`
}

// SimilarityResult reports semantic proximity between two words.
type SimilarityResult struct {
	Word1  string  `json:"word1"`
	Word2  string  `json:"word2"`
	Score  float64 `json:"score"`
	Metric string  `json:"metric"`
	Error  string  `json:"error,omitempty"`
}

// DocumentStats reports live statistical measurements of document content.
type DocumentStats struct {
	Characters          int     `json:"characters"`
	CharactersNoSpaces  int     `json:"charactersNoSpaces"`
	Words               int     `json:"words"`
	Sentences           int     `json:"sentences"`
	Paragraphs          int     `json:"paragraphs"`
	ReadingTimeMinutes  float64 `json:"readingTimeMinutes"`
	SpeakingTimeMinutes float64 `json:"speakingTimeMinutes"`
	UniqueWords         int     `json:"uniqueWords"`
	VocabularyRichness  float64 `json:"vocabularyRichness"`
}

// LexicalService provides WordNet lexical lookups, autocomplete suggestions, and semantic calculations.
type LexicalService struct {
	resource  *gown.LexicalResource
	trie      *PrefixTrie
	allLemmas []SuggestionItem
	mu        sync.RWMutex
	ready     bool
}

// NewLexicalService constructs a new LexicalService and initializes WordNet in the background.
func NewLexicalService() *LexicalService {
	s := &LexicalService{
		trie: NewPrefixTrie(),
	}
	s.initWordNet()
	return s
}

// initWordNet decodes WordNet and indexes vocabulary for autocomplete.
func (s *LexicalService) initWordNet() {
	res, err := gown.ReadLexicalResource()
	if err != nil {
		fmt.Printf("Error initializing gown LexicalResource: %v\n", err)
		return
	}
	s.resource = res

	// Populate prefix trie and allLemmas with unique lemmas
	go func() {
		seen := make(map[string]bool)
		var lemmas []SuggestionItem
		for _, entry := range res.Lexicon.LexicalEntries {
			lemma := entry.Lemma.WrittenForm
			lower := strings.ToLower(lemma)
			if seen[lower] {
				continue
			}
			seen[lower] = true

			pos := string(entry.PartOfSpeech())
			gloss := ""
			synsets := entry.Synsets()
			if len(synsets) > 0 && synsets[0] != nil && len(synsets[0].Definitions) > 0 {
				gloss = synsets[0].Definitions[0]
			}
			s.trie.Insert(lower, lemma, pos, gloss, len(entry.Senses))
			lemmas = append(lemmas, SuggestionItem{
				Word:        lemma,
				Lemma:       lower,
				POS:         pos,
				Gloss:       gloss,
				SenseNumber: len(entry.Senses),
				Source:      "Lemma",
			})
		}
		s.mu.Lock()
		s.allLemmas = lemmas
		s.ready = true
		s.mu.Unlock()
	}()
}

// IsReady checks if the lexical resource has completed initialization.
func (s *LexicalService) IsReady() bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.resource != nil && s.ready
}

// GetSuggestions returns rich vocabulary completion candidates including:
// 1. Exact lemma match and prefix matches from WordNet Trie
// 2. Lemmas containing the query as a substring
// 3. Synonyms if the query is a word
// 4. Words whose definitions contain the query (or words from query's definitions)
// 5. Words whose examples contain the query (or words from query's examples)
func (s *LexicalService) GetSuggestions(query string, limit int) []SuggestionItem {
	if s.resource == nil {
		return nil
	}
	if limit <= 0 {
		limit = 20
	}
	if limit > 30 {
		limit = 30
	}

	clean := strings.ToLower(strings.TrimSpace(query))
	clean = strings.TrimFunc(clean, func(r rune) bool {
		return unicode.IsPunct(r) || unicode.IsSpace(r)
	})
	if len(clean) < 2 {
		return nil
	}

	seen := make(map[string]bool)

	// Buckets to collect items
	var exactItem *SuggestionItem
	var prefixItems []SuggestionItem
	var substringItems []SuggestionItem
	var synonymItems []SuggestionItem
	var defItems []SuggestionItem
	var exItems []SuggestionItem

	// 1. Exact match lemma lookup
	exactEntries := s.resource.Lookup(clean)
	if len(exactEntries) > 0 {
		entry := exactEntries[0]
		gloss := ""
		if syns := entry.Synsets(); len(syns) > 0 && syns[0] != nil && len(syns[0].Definitions) > 0 {
			gloss = syns[0].Definitions[0]
		}
		exactItem = &SuggestionItem{
			Word:        entry.Lemma.WrittenForm,
			Lemma:       clean,
			POS:         string(entry.PartOfSpeech()),
			Gloss:       gloss,
			SenseNumber: len(entry.Senses),
			Source:      "Lemma",
		}
		seen[clean] = true
	}

	// 2. Prefix matches from Trie (e.g. "bright" -> "brighten", "brightness", "brightly"...)
	rawPrefix := s.trie.Search(clean, limit)
	for _, item := range rawPrefix {
		wLower := strings.ToLower(item.Word)
		if !seen[wLower] {
			seen[wLower] = true
			item.Source = "Lemma"
			prefixItems = append(prefixItems, item)
		}
	}

	// 3. Substring matches (lemmas containing query e.g. "sunbright", "eyebright", "hybrid")
	s.mu.RLock()
	allLemmas := s.allLemmas
	s.mu.RUnlock()

	for _, item := range allLemmas {
		if strings.Contains(item.Lemma, clean) && !strings.HasPrefix(item.Lemma, clean) {
			if !seen[item.Lemma] {
				seen[item.Lemma] = true
				item.Source = "Lemma"
				substringItems = append(substringItems, item)
				if len(substringItems) >= 10 {
					break
				}
			}
		}
	}

	// 4. Synonyms (if exact word or morph root exists)
	searchEntries := exactEntries
	if len(searchEntries) == 0 {
		for _, pos := range []gown.POS{gown.NounPos, gown.VerbPos, gown.AdjectivePos, gown.AdverbPos} {
			morphLemmas := s.resource.Morphy(clean, pos)
			if len(morphLemmas) > 0 {
				searchEntries = s.resource.Lookup(morphLemmas[0])
				if len(searchEntries) > 0 {
					break
				}
			}
		}
	}

	if len(searchEntries) > 0 {
		for _, entry := range searchEntries {
			for _, syn := range entry.Synsets() {
				if syn == nil {
					continue
				}
				for _, mId := range syn.Members {
					mEntry := s.resource.LexicalsById()[mId]
					if mEntry != nil {
						lem := mEntry.Lemma.WrittenForm
						lemLower := strings.ToLower(lem)
						if lemLower != clean && !seen[lemLower] && len(lemLower) >= 3 {
							seen[lemLower] = true
							synonymItems = append(synonymItems, SuggestionItem{
								Word:        lem,
								Lemma:       lemLower,
								POS:         string(syn.PartOfSpeech),
								Gloss:       "Synonym of " + clean,
								SenseNumber: 1,
								Source:      "Synonym",
							})
						}
					}
				}
			}
		}
	}

	// 5. Definitions & Examples containing `clean`
	for _, syn := range s.resource.Lexicon.Synsets {
		if len(syn.Members) == 0 {
			continue
		}

		// Check definitions
		if len(defItems) < 10 {
			for _, def := range syn.Definitions {
				if strings.Contains(strings.ToLower(def), clean) {
					mEntry := s.resource.LexicalsById()[syn.Members[0]]
					if mEntry != nil {
						lem := mEntry.Lemma.WrittenForm
						lemLower := strings.ToLower(lem)
						if !seen[lemLower] {
							seen[lemLower] = true
							defItems = append(defItems, SuggestionItem{
								Word:        lem,
								Lemma:       lemLower,
								POS:         string(syn.PartOfSpeech),
								Gloss:       def,
								SenseNumber: 1,
								Source:      "Definition",
							})
							break
						}
					}
				}
			}
		}

		// Check examples
		if len(exItems) < 10 {
			for _, ex := range syn.Examples {
				if strings.Contains(strings.ToLower(ex.Text), clean) {
					mEntry := s.resource.LexicalsById()[syn.Members[0]]
					if mEntry != nil {
						lem := mEntry.Lemma.WrittenForm
						lemLower := strings.ToLower(lem)
						if !seen[lemLower] {
							seen[lemLower] = true
							exItems = append(exItems, SuggestionItem{
								Word:        lem,
								Lemma:       lemLower,
								POS:         string(syn.PartOfSpeech),
								Gloss:       ex.Text,
								SenseNumber: 1,
								Source:      "Example",
							})
							break
						}
					}
				}
			}
		}

		if len(defItems) >= 10 && len(exItems) >= 10 {
			break
		}
	}

	// 6. Words from definitions and examples of the query itself
	stopWords := map[string]bool{
		"a": true, "an": true, "the": true, "in": true, "on": true, "at": true,
		"by": true, "for": true, "with": true, "about": true, "against": true,
		"between": true, "into": true, "through": true, "during": true, "before": true,
		"after": true, "above": true, "below": true, "to": true, "from": true,
		"up": true, "down": true, "of": true, "off": true, "over": true, "under": true,
		"again": true, "further": true, "then": true, "once": true, "here": true,
		"there": true, "when": true, "where": true, "why": true, "how": true,
		"all": true, "any": true, "both": true, "each": true, "few": true,
		"more": true, "most": true, "other": true, "some": true, "such": true,
		"no": true, "nor": true, "not": true, "only": true, "own": true,
		"same": true, "so": true, "than": true, "too": true, "very": true,
		"is": true, "are": true, "was": true, "were": true, "be": true,
		"been": true, "being": true, "have": true, "has": true, "had": true,
		"having": true, "do": true, "does": true, "did": true, "doing": true,
		"would": true, "should": true, "could": true, "ought": true,
		"and": true, "but": true, "if": true, "or": true, "because": true,
		"as": true, "until": true, "while": true, "that": true, "which": true,
		"who": true, "whom": true, "this": true, "these": true, "those": true,
		"one": true, "used": true, "especially": true, "usually": true, "often": true,
	}

	if len(exactEntries) > 0 {
		for _, entry := range exactEntries {
			for _, syn := range entry.Synsets() {
				if syn == nil {
					continue
				}
				for _, def := range syn.Definitions {
					words := strings.FieldsFunc(def, func(r rune) bool {
						return !unicode.IsLetter(r) && r != '-'
					})
					for _, w := range words {
						wLower := strings.ToLower(w)
						if len(wLower) >= 3 && !stopWords[wLower] && wLower != clean && !seen[wLower] {
							if dEntries := s.resource.Lookup(wLower); len(dEntries) > 0 {
								seen[wLower] = true
								defItems = append(defItems, SuggestionItem{
									Word:        dEntries[0].Lemma.WrittenForm,
									Lemma:       wLower,
									POS:         string(dEntries[0].PartOfSpeech()),
									Gloss:       "From definition: \"" + def + "\"",
									SenseNumber: len(dEntries[0].Senses),
									Source:      "Definition",
								})
								break
							}
						}
					}
				}

				for _, ex := range syn.Examples {
					words := strings.FieldsFunc(ex.Text, func(r rune) bool {
						return !unicode.IsLetter(r) && r != '-'
					})
					for _, w := range words {
						wLower := strings.ToLower(w)
						if len(wLower) >= 3 && !stopWords[wLower] && wLower != clean && !seen[wLower] {
							if eEntries := s.resource.Lookup(wLower); len(eEntries) > 0 {
								seen[wLower] = true
								exItems = append(exItems, SuggestionItem{
									Word:        eEntries[0].Lemma.WrittenForm,
									Lemma:       wLower,
									POS:         string(eEntries[0].PartOfSpeech()),
									Gloss:       "From example: \"" + ex.Text + "\"",
									SenseNumber: len(eEntries[0].Senses),
									Source:      "Example",
								})
								break
							}
						}
					}
				}
			}
		}
	}

	// 7. Assemble final results with balanced representation
	var results []SuggestionItem

	// (A) Exact match comes first if exists
	if exactItem != nil {
		results = append(results, *exactItem)
	}

	// (B) Initial balanced allotment:
	// - Up to 4 prefix lemmas
	takePrefix := 4
	if len(prefixItems) < takePrefix {
		takePrefix = len(prefixItems)
	}
	results = append(results, prefixItems[:takePrefix]...)
	prefixItems = prefixItems[takePrefix:]

	// - Up to 3 synonyms
	takeSyn := 3
	if len(synonymItems) < takeSyn {
		takeSyn = len(synonymItems)
	}
	results = append(results, synonymItems[:takeSyn]...)
	synonymItems = synonymItems[takeSyn:]

	// - Up to 3 definition items
	takeDef := 3
	if len(defItems) < takeDef {
		takeDef = len(defItems)
	}
	results = append(results, defItems[:takeDef]...)
	defItems = defItems[takeDef:]

	// - Up to 3 example items
	takeEx := 3
	if len(exItems) < takeEx {
		takeEx = len(exItems)
	}
	results = append(results, exItems[:takeEx]...)
	exItems = exItems[takeEx:]

	// - Up to 2 substring lemmas
	takeSub := 2
	if len(substringItems) < takeSub {
		takeSub = len(substringItems)
	}
	results = append(results, substringItems[:takeSub]...)
	substringItems = substringItems[takeSub:]

	// (C) Fill remaining capacity up to limit in priority order:
	// 1. More prefix lemmas
	for len(results) < limit && len(prefixItems) > 0 {
		results = append(results, prefixItems[0])
		prefixItems = prefixItems[1:]
	}
	// 2. More synonyms
	for len(results) < limit && len(synonymItems) > 0 {
		results = append(results, synonymItems[0])
		synonymItems = synonymItems[1:]
	}
	// 3. More definitions
	for len(results) < limit && len(defItems) > 0 {
		results = append(results, defItems[0])
		defItems = defItems[1:]
	}
	// 4. More examples
	for len(results) < limit && len(exItems) > 0 {
		results = append(results, exItems[0])
		exItems = exItems[1:]
	}
	// 5. More substring lemmas
	for len(results) < limit && len(substringItems) > 0 {
		results = append(results, substringItems[0])
		substringItems = substringItems[1:]
	}

	return results
}

// AnalyzeWord performs morphological, sense, contextual disambiguation, and relationship analysis.
func (s *LexicalService) AnalyzeWord(word string, sentenceContext string, requestId int64) LexicalAnalysisResult {
	result := LexicalAnalysisResult{
		RequestID: requestId,
		Word:      word,
		Found:     false,
	}

	cleanWord := strings.TrimSpace(word)
	cleanWord = strings.TrimFunc(cleanWord, func(r rune) bool {
		return unicode.IsPunct(r) || unicode.IsSpace(r)
	})
	if cleanWord == "" || s.resource == nil {
		return result
	}

	lowerWord := strings.ToLower(cleanWord)

	// 1. Morphological Lemmatization across all 4 POS
	morphMap := make(map[string]bool)
	var lemmas []string
	var posList []string

	poses := []gown.POS{gown.NounPos, gown.VerbPos, gown.AdjectivePos, gown.AdverbPos}
	posNames := map[gown.POS]string{
		gown.NounPos:      "noun",
		gown.VerbPos:      "verb",
		gown.AdjectivePos: "adjective",
		gown.AdverbPos:    "adverb",
	}

	for _, pos := range poses {
		morphLemmas := s.resource.Morphy(lowerWord, pos)
		if len(morphLemmas) > 0 {
			posList = append(posList, posNames[pos])
			for _, ml := range morphLemmas {
				if !morphMap[ml] {
					morphMap[ml] = true
					lemmas = append(lemmas, ml)
				}
			}
		}
	}

	primaryLemma := lowerWord
	if len(lemmas) > 0 {
		primaryLemma = lemmas[0]
	}
	result.PrimaryLemma = primaryLemma

	// 2. Query Lexical Entries
	entries := s.resource.Lookup(primaryLemma)
	if len(entries) == 0 && primaryLemma != lowerWord {
		entries = s.resource.Lookup(lowerWord)
	}

	if len(entries) == 0 {
		// Try phonology even if not in WordNet
		result.Phonology = s.computePhonology(cleanWord)
		result.Poetics = s.GetPoeticSuggestions(cleanWord)
		result.Morphology = MorphologyInfo{
			Original: cleanWord,
			Lemmas:   lemmas,
			POSList:  posList,
		}
		if strings.TrimSpace(sentenceContext) != "" {
			result.Functional = s.analyzeFunctional(sentenceContext)
			result.Pragmatics = s.analyzePragmatics(sentenceContext)
			result.Discourse = s.analyzeDiscourse(sentenceContext)
		}
		return result
	}

	result.Found = true

	// 3. Word Senses & Contextual Disambiguation
	wsdResult := semantics.DisambiguateLesk(s.resource, primaryLemma, sentenceContext)

	var senseItems []WordSenseItem
	var synonymGroups []SynonymGroup
	antonymMap := make(map[string]bool)
	hypernymMap := make(map[string]bool)
	hyponymMap := make(map[string]bool)
	meronymMap := make(map[string]bool)

	senseCounter := 1
	recIdx := 0
	highestConf := 0.0

	for _, entry := range entries {
		pos := string(entry.PartOfSpeech())
		for _, sense := range entry.Senses {
			synset := sense.GetSynset()
			if synset == nil {
				continue
			}

			definition := synset.PrimaryDefinition()
			var examples []string
			for _, ex := range synset.Examples {
				if ex.Text != "" {
					examples = append(examples, ex.Text)
				}
			}

			confidence := 0.1
			if wsdResult.BestSynset != nil && wsdResult.BestSynset.ID == synset.ID {
				if wsdResult.Score > 0 {
					confidence = math.Min(0.95, 0.5+float64(wsdResult.Score)*0.15)
				} else {
					confidence = 0.55
				}
			}

			if confidence > highestConf {
				highestConf = confidence
				recIdx = len(senseItems)
			}

			item := WordSenseItem{
				ID:          synset.ID,
				SenseNumber: senseCounter,
				POS:         pos,
				Definition:  definition,
				Examples:    examples,
				Lemma:       entry.Lemma.WrittenForm,
				Lexfile:     synset.Lexfile,
				ILI:         synset.Ili,
				Confidence:  confidence,
				IsSelected:  false,
			}
			senseItems = append(senseItems, item)

			// Synonyms in this synset
			var synWords []string
			for _, mId := range synset.Members {
				mEntry := s.resource.LexicalsById()[mId]
				if mEntry != nil && !strings.EqualFold(mEntry.Lemma.WrittenForm, primaryLemma) {
					synWords = append(synWords, mEntry.Lemma.WrittenForm)
				}
			}
			if len(synWords) > 0 {
				synonymGroups = append(synonymGroups, SynonymGroup{
					SenseNumber:     senseCounter,
					SenseDefinition: definition,
					POS:             pos,
					Words:           synWords,
				})
			}

			// Direct Relations
			for _, rel := range synset.SynsetRelations {
				targetSyn := s.resource.SynsetsById()[rel.Target]
				if targetSyn == nil {
					continue
				}
				for _, memId := range targetSyn.Members {
					memEntry := s.resource.LexicalsById()[memId]
					if memEntry == nil {
						continue
					}
					form := memEntry.Lemma.WrittenForm
					switch rel.RelType {
					case "hypernym", "instance_hypernym":
						hypernymMap[form] = true
					case "hyponym", "instance_hyponym":
						hyponymMap[form] = true
					case "meronym", "part_meronym", "member_meronym", "substance_meronym":
						meronymMap[form] = true
					}
				}
			}

			// Sense relations (e.g. Antonyms)
			for _, sRel := range sense.SenseRelations {
				if sRel.RelType == "antonym" {
					targetSense := s.resource.SenseById()[sRel.Target]
					if targetSense != nil {
						tSyn := targetSense.GetSynset()
						if tSyn != nil {
							for _, mId := range tSyn.Members {
								if mEntry := s.resource.LexicalsById()[mId]; mEntry != nil {
									antonymMap[mEntry.Lemma.WrittenForm] = true
								}
							}
						}
					}
				}
			}

			senseCounter++
		}
	}

	if len(senseItems) > 0 {
		senseItems[recIdx].IsSelected = true
		result.RecommendedSenseIndex = recIdx
		result.WSDConfidence = highestConf
	}
	result.Senses = senseItems
	result.SynonymGroups = synonymGroups

	for a := range antonymMap {
		result.Antonyms = append(result.Antonyms, a)
	}
	for h := range hypernymMap {
		result.Hypernyms = append(result.Hypernyms, h)
	}
	for h := range hyponymMap {
		result.Hyponyms = append(result.Hyponyms, h)
	}
	for m := range meronymMap {
		result.Meronyms = append(result.Meronyms, m)
	}

	// 4. Morphology
	result.Morphology = MorphologyInfo{
		Original: cleanWord,
		Lemmas:   lemmas,
		POSList:  posList,
	}

	// 5. Phonology
	result.Phonology = s.computePhonology(cleanWord)
	result.Poetics = s.GetPoeticSuggestions(cleanWord)

	// 6. Polysemy
	polyReport := semantics.AnalyzePolysemy(s.resource, primaryLemma)
	result.Polysemy = PolysemyInfo{
		TotalSenses:  polyReport.TotalSenses,
		IsPolysemous: polyReport.IsPolysemous,
		Entropy:      polyReport.Entropy,
	}

	// 7. Expansion Tree
	tree, err := expansion.Expand(s.resource, primaryLemma, expansion.WithMaxDepth(3), expansion.WithMaxNodes(20))
	if err == nil && tree != nil {
		result.HierarchyTree = tree.Render()
		result.ExpansionTree = tree.Root
	}

	// 8. Functional Grammar, Pragmatics & Discourse (if sentence is present)
	if strings.TrimSpace(sentenceContext) != "" {
		result.Functional = s.analyzeFunctional(sentenceContext)
		result.Pragmatics = s.analyzePragmatics(sentenceContext)
		result.Discourse = s.analyzeDiscourse(sentenceContext)
	}

	return result
}

// analyzeFunctional performs Systemic Functional Linguistics analysis (Theme/Rheme, Mood, Cohesion).
func (s *LexicalService) analyzeFunctional(clause string) FunctionalInfo {
	var info FunctionalInfo
	info.ThemeRheme = functional.SplitThemeRheme(clause)
	info.Interpersonal = functional.AnalyzeInterpersonal(clause)
	if s.resource != nil {
		info.CohesiveTies = functional.AnalyzeCohesion(s.resource, clause)
	}
	return info
}

// analyzePragmatics classifies speech acts, politeness, and indexical deixis.
func (s *LexicalService) analyzePragmatics(utterance string) PragmaticsInfo {
	var info PragmaticsInfo
	info.SpeechAct = pragmatics.ClassifySpeechAct(utterance)
	info.Politeness = pragmatics.AnalyzePoliteness(utterance)
	info.Deixis = pragmatics.IdentifyDeixis(utterance)
	return info
}

// analyzeDiscourse tracks thematic progression across clauses.
func (s *LexicalService) analyzeDiscourse(text string) DiscourseInfo {
	var info DiscourseInfo
	info.ThematicProgression = discourse.AnalyzeThemeProgression(text)
	return info
}

// computePhonology computes syllables and patterns.
func (s *LexicalService) computePhonology(word string) PhonologyInfo {
	count := phonology.CountSyllables(word)
	sylls := phonology.Syllabify(word)

	var sylStrings []string
	for _, sy := range sylls {
		part := sy.Onset + sy.Nucleus + sy.Coda
		if part != "" {
			sylStrings = append(sylStrings, part)
		}
	}

	return PhonologyInfo{
		SyllableCount: count,
		Syllables:     sylStrings,
		CVPattern:     phonologyPattern(word),
	}
}

func phonologyPattern(word string) string {
	vowels := "aeiouyAEIOUY"
	var sb strings.Builder
	for _, ch := range word {
		if unicode.IsLetter(ch) {
			if strings.ContainsRune(vowels, ch) {
				sb.WriteRune('V')
			} else {
				sb.WriteRune('C')
			}
		}
	}
	return sb.String()
}

// GetPoeticSuggestions analyzes rhyming ending, alliterative onset, and Consonant-Vowel (CV) meter.
func (s *LexicalService) GetPoeticSuggestions(word string) PoeticSuggestionsResult {
	clean := strings.ToLower(strings.TrimSpace(word))
	clean = strings.TrimFunc(clean, func(r rune) bool {
		return unicode.IsPunct(r) || unicode.IsSpace(r)
	})

	res := PoeticSuggestionsResult{
		Word: clean,
	}
	if clean == "" {
		return res
	}

	res.SyllableCount = phonology.CountSyllables(clean)
	res.CVPattern = phonologyPattern(clean)

	sylls := phonology.Syllabify(clean)
	rhymeEnding := ""
	onsetCluster := ""

	if len(sylls) > 0 {
		lastSyl := sylls[len(sylls)-1]
		rhymeEnding = strings.ToLower(lastSyl.Nucleus + lastSyl.Coda)
		firstSyl := sylls[0]
		onsetCluster = strings.ToLower(firstSyl.Onset)
	}

	vowels := "aeiouy"
	if rhymeEnding == "" {
		lastVowelIdx := -1
		for i := len(clean) - 1; i >= 0; i-- {
			if strings.ContainsRune(vowels, rune(clean[i])) {
				lastVowelIdx = i
				break
			}
		}
		if lastVowelIdx >= 0 {
			startVowel := lastVowelIdx
			for startVowel > 0 && strings.ContainsRune(vowels, rune(clean[startVowel-1])) {
				startVowel--
			}
			rhymeEnding = clean[startVowel:]
		} else {
			rhymeEnding = clean
		}
	}

	if onsetCluster == "" {
		firstVowelIdx := -1
		for i := 0; i < len(clean); i++ {
			if strings.ContainsRune(vowels, rune(clean[i])) {
				firstVowelIdx = i
				break
			}
		}
		if firstVowelIdx > 0 {
			onsetCluster = clean[:firstVowelIdx]
		}
	}

	res.RhymeEnding = rhymeEnding
	res.OnsetCluster = onsetCluster

	s.mu.RLock()
	allLemmas := s.allLemmas
	s.mu.RUnlock()

	seenRhyme := make(map[string]bool)
	seenAllit := make(map[string]bool)
	seenCV := make(map[string]bool)

	// Phonetic rhyme aliases for common English digraphs
	var rhymeAliases []string
	rhymeAliases = append(rhymeAliases, rhymeEnding)
	if rhymeEnding == "ight" {
		rhymeAliases = append(rhymeAliases, "ite")
	} else if rhymeEnding == "ite" {
		rhymeAliases = append(rhymeAliases, "ight")
	} else if rhymeEnding == "ain" {
		rhymeAliases = append(rhymeAliases, "ane")
	} else if rhymeEnding == "ane" {
		rhymeAliases = append(rhymeAliases, "ain")
	} else if rhymeEnding == "ay" {
		rhymeAliases = append(rhymeAliases, "ey")
	}

	for _, item := range allLemmas {
		candLower := strings.ToLower(item.Word)
		if candLower == clean || len(candLower) < 2 || strings.Contains(candLower, " ") || strings.Contains(candLower, "-") || strings.Contains(candLower, "_") {
			continue
		}

		isPureLetters := true
		for _, r := range candLower {
			if !unicode.IsLetter(r) {
				isPureLetters = false
				break
			}
		}
		if !isPureLetters {
			continue
		}

		candSyll := phonology.CountSyllables(candLower)
		candCV := phonologyPattern(candLower)

		// 1. Rhyme match
		isRhyme := false
		for _, alias := range rhymeAliases {
			if strings.HasSuffix(candLower, alias) {
				isRhyme = true
				break
			}
		}
		if isRhyme && !seenRhyme[candLower] {
			seenRhyme[candLower] = true
			score := 10
			if candSyll == res.SyllableCount {
				score = 20
			}
			res.Rhymes = append(res.Rhymes, PoeticWordItem{
				Word:          item.Word,
				POS:           item.POS,
				SyllableCount: candSyll,
				CVPattern:     candCV,
				RhymeScore:    score,
				Gloss:         item.Gloss,
			})
		}

		// 2. Alliteration match
		if len(onsetCluster) >= 1 && strings.HasPrefix(candLower, onsetCluster) && !seenAllit[candLower] {
			seenAllit[candLower] = true
			res.Alliterations = append(res.Alliterations, PoeticWordItem{
				Word:          item.Word,
				POS:           item.POS,
				SyllableCount: candSyll,
				CVPattern:     candCV,
				Gloss:         item.Gloss,
			})
		}

		// 3. CV Pattern Rhythm match
		if candCV == res.CVPattern && !seenCV[candLower] {
			seenCV[candLower] = true
			res.CVSimilar = append(res.CVSimilar, PoeticWordItem{
				Word:          item.Word,
				POS:           item.POS,
				SyllableCount: candSyll,
				CVPattern:     candCV,
				Gloss:         item.Gloss,
			})
		}
	}

	// Sort Rhymes: 1) Same syllable count first, 2) Lowercase common words first, 3) Shorter words
	sort.SliceStable(res.Rhymes, func(i, j int) bool {
		diffI := int(math.Abs(float64(res.Rhymes[i].SyllableCount - res.SyllableCount)))
		diffJ := int(math.Abs(float64(res.Rhymes[j].SyllableCount - res.SyllableCount)))
		if diffI != diffJ {
			return diffI < diffJ
		}
		isLowerI := unicode.IsLower(rune(res.Rhymes[i].Word[0]))
		isLowerJ := unicode.IsLower(rune(res.Rhymes[j].Word[0]))
		if isLowerI != isLowerJ {
			return isLowerI
		}
		return len(res.Rhymes[i].Word) < len(res.Rhymes[j].Word)
	})

	// Sort Alliterations: Lowercase common words first, then shorter words
	sort.SliceStable(res.Alliterations, func(i, j int) bool {
		isLowerI := unicode.IsLower(rune(res.Alliterations[i].Word[0]))
		isLowerJ := unicode.IsLower(rune(res.Alliterations[j].Word[0]))
		if isLowerI != isLowerJ {
			return isLowerI
		}
		return len(res.Alliterations[i].Word) < len(res.Alliterations[j].Word)
	})

	// Sort CVSimilar: Lowercase first, then shorter words
	sort.SliceStable(res.CVSimilar, func(i, j int) bool {
		isLowerI := unicode.IsLower(rune(res.CVSimilar[i].Word[0]))
		isLowerJ := unicode.IsLower(rune(res.CVSimilar[j].Word[0]))
		if isLowerI != isLowerJ {
			return isLowerI
		}
		return len(res.CVSimilar[i].Word) < len(res.CVSimilar[j].Word)
	})

	if len(res.Rhymes) > 40 {
		res.Rhymes = res.Rhymes[:40]
	}
	if len(res.Alliterations) > 35 {
		res.Alliterations = res.Alliterations[:35]
	}
	if len(res.CVSimilar) > 35 {
		res.CVSimilar = res.CVSimilar[:35]
	}

	return res
}

// CalculateSimilarity measures Wu-Palmer similarity between two concepts.
func (s *LexicalService) CalculateSimilarity(word1, word2 string) SimilarityResult {
	if s.resource == nil {
		return SimilarityResult{Word1: word1, Word2: word2, Error: "lexical resource not ready"}
	}
	w1 := strings.ToLower(strings.TrimSpace(word1))
	w2 := strings.ToLower(strings.TrimSpace(word2))

	score, err := similarity.Compare(s.resource, w1, w2, similarity.WithMetric(similarity.MetricWuPalmer))
	if err != nil {
		return SimilarityResult{Word1: word1, Word2: word2, Error: err.Error()}
	}

	return SimilarityResult{
		Word1:  w1,
		Word2:  w2,
		Score:  score,
		Metric: "Wu-Palmer",
	}
}

// AnalyzeDocument computes realtime statistical measurements for the editor status bar.
func (s *LexicalService) AnalyzeDocument(text string) DocumentStats {
	stats := DocumentStats{}
	if strings.TrimSpace(text) == "" {
		return stats
	}

	stats.Characters = len([]rune(text))
	var nonSpaceCount int
	for _, r := range text {
		if !unicode.IsSpace(r) {
			nonSpaceCount++
		}
	}
	stats.CharactersNoSpaces = nonSpaceCount

	paragraphs := strings.Split(text, "\n")
	var pCount int
	for _, p := range paragraphs {
		if strings.TrimSpace(p) != "" {
			pCount++
		}
	}
	stats.Paragraphs = pCount

	wordsList := strings.Fields(text)
	stats.Words = len(wordsList)

	uniqueWords := make(map[string]bool)
	for _, w := range wordsList {
		cleaned := strings.ToLower(strings.TrimFunc(w, unicode.IsPunct))
		if cleaned != "" {
			uniqueWords[cleaned] = true
		}
	}
	stats.UniqueWords = len(uniqueWords)
	if stats.Words > 0 {
		stats.VocabularyRichness = math.Round((float64(stats.UniqueWords)/float64(stats.Words))*100) / 100
	}

	// Approximate sentences count
	var sCount int
	for _, r := range text {
		if r == '.' || r == '!' || r == '?' {
			sCount++
		}
	}
	if sCount == 0 && stats.Words > 0 {
		sCount = 1
	}
	stats.Sentences = sCount

	// Reading time: avg 220 words per minute
	stats.ReadingTimeMinutes = math.Round((float64(stats.Words)/220.0)*10) / 10
	// Speaking time: avg 130 words per minute
	stats.SpeakingTimeMinutes = math.Round((float64(stats.Words)/130.0)*10) / 10

	return stats
}
