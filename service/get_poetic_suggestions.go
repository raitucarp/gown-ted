package service

import (
	"github.com/raitucarp/gown-ted/pkg/models"
	"github.com/raitucarp/gown-ted/pkg/poetics"
)

// GetPoeticSuggestions analyzes rhyming ending, alliterative onset, and Consonant-Vowel (CV) meter.
func (s *LexicalService) GetPoeticSuggestions(word string) models.PoeticSuggestionsResult {
	s.mu.RLock()
	lemmas := s.allLemmas
	s.mu.RUnlock()

	return poetics.Analyze(word, lemmas)
}
