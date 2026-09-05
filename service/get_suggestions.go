package service

import (
	"github.com/raitucarp/gown-ted/pkg/models"
	"github.com/raitucarp/gown-ted/pkg/suggester"
)

// GetSuggestions returns rich vocabulary completion candidates including exact, prefix, synonym, and contextual matches.
func (s *LexicalService) GetSuggestions(query string, limit int) []models.SuggestionItem {
	s.mu.RLock()
	lemmas := s.allLemmas
	res := s.resource
	t := s.trie
	s.mu.RUnlock()

	return suggester.GetSuggestions(res, t, lemmas, query, limit)
}
