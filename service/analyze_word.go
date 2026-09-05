package service

import (
	"github.com/raitucarp/gown-ted/pkg/analyzer"
	"github.com/raitucarp/gown-ted/pkg/models"
)

// AnalyzeWord performs morphological, sense, contextual disambiguation, and relationship analysis.
func (s *LexicalService) AnalyzeWord(word string, sentenceContext string, requestId int64) models.LexicalAnalysisResult {
	s.mu.RLock()
	res := s.resource
	lemmas := s.allLemmas
	s.mu.RUnlock()

	return analyzer.Analyze(res, lemmas, word, sentenceContext, requestId)
}
