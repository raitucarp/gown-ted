package service

import (
	"github.com/raitucarp/gown-ted/pkg/models"
	"github.com/raitucarp/gown-ted/pkg/stats"
)

// AnalyzeDocument computes realtime statistical measurements for the editor status bar.
func (s *LexicalService) AnalyzeDocument(text string) models.DocumentStats {
	return stats.Analyze(text)
}
