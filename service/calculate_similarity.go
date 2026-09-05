package service

import (
	"github.com/raitucarp/gown-ted/pkg/models"
	"github.com/raitucarp/gown-ted/pkg/similarity"
)

// CalculateSimilarity measures Wu-Palmer similarity between two concepts.
func (s *LexicalService) CalculateSimilarity(word1, word2 string) models.SimilarityResult {
	s.mu.RLock()
	res := s.resource
	s.mu.RUnlock()

	return similarity.Calculate(res, word1, word2)
}
