package service

import (
	"fmt"
	"sort"
	"strings"

	"github.com/raitucarp/gown"
	"github.com/raitucarp/gown-ted/pkg/models"
)

// initWordNet decodes WordNet and indexes vocabulary for autocomplete.
func (s *LexicalService) initWordNet() {
	res, err := gown.ReadLexicalResource()
	if err != nil {
		fmt.Printf("Error initializing gown LexicalResource: %v\n", err)
		return
	}
	s.resource = res

	// Populate prefix trie, allLemmas, and LexFiles in background
	go func() {
		seen := make(map[string]bool)
		var lemmas []models.SuggestionItem
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
			lemmas = append(lemmas, models.SuggestionItem{
				Word:        lemma,
				Lemma:       lower,
				POS:         pos,
				Gloss:       gloss,
				SenseNumber: len(entry.Senses),
				Source:      "Lemma",
			})
		}

		// Index words by LexFile and build global word index
		lexMap := make(map[string][]models.LexFileWordItem)
		lexSeen := make(map[string]map[string]bool)
		wordIndex := make(map[string]models.LexFileWordItem)

		for i := range res.Lexicon.Synsets {
			synset := &res.Lexicon.Synsets[i]
			lf := strings.TrimSpace(synset.Lexfile)
			if lf == "" {
				continue
			}
			if lexSeen[lf] == nil {
				lexSeen[lf] = make(map[string]bool)
			}
			def := synset.PrimaryDefinition()
			var examples []string
			for _, ex := range synset.Examples {
				if ex.Text != "" {
					examples = append(examples, ex.Text)
				}
			}
			for _, memId := range synset.Members {
				mEntry := res.LexicalsById()[memId]
				if mEntry == nil {
					continue
				}
				w := mEntry.Lemma.WrittenForm
				wLower := strings.ToLower(w)
				if lexSeen[lf][wLower] {
					continue
				}
				lexSeen[lf][wLower] = true
				item := models.LexFileWordItem{
					Word:       w,
					POS:        synset.PartOfSpeech,
					Definition: def,
					SynsetID:   synset.ID,
					Examples:   examples,
					LexFile:    lf,
				}
				lexMap[lf] = append(lexMap[lf], item)
				if _, exists := wordIndex[wLower]; !exists {
					wordIndex[wLower] = item
				}
			}
		}

		// Sort words alphabetically within each lexfile
		for lf := range lexMap {
			sort.Slice(lexMap[lf], func(i, j int) bool {
				return strings.ToLower(lexMap[lf][i].Word) < strings.ToLower(lexMap[lf][j].Word)
			})
		}

		// Build sorted lexFiles list
		var lexFilesList []models.LexFileInfo
		for lf, items := range lexMap {
			lexFilesList = append(lexFilesList, models.LexFileInfo{
				Name:      lf,
				WordCount: len(items),
			})
		}
		sort.Slice(lexFilesList, func(i, j int) bool {
			return lexFilesList[i].Name < lexFilesList[j].Name
		})

		s.mu.Lock()
		s.allLemmas = lemmas
		s.lexFileWords = lexMap
		s.wordLexIndex = wordIndex
		s.lexFiles = lexFilesList
		s.ready = true
		s.mu.Unlock()
	}()
}
