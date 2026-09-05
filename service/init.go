package service

import (
	"fmt"
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

	// Populate prefix trie and allLemmas with unique lemmas in background
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
		s.mu.Lock()
		s.allLemmas = lemmas
		s.ready = true
		s.mu.Unlock()
	}()
}
