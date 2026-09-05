package similarity

import (
	"strings"

	"github.com/raitucarp/gown"
	"github.com/raitucarp/gown/similarity"
	"github.com/raitucarp/gown-ted/pkg/models"
)

// Calculate computes Wu-Palmer semantic similarity between two concepts.
func Calculate(res *gown.LexicalResource, word1, word2 string) models.SimilarityResult {
	if res == nil {
		return models.SimilarityResult{Word1: word1, Word2: word2, Error: "lexical resource not ready"}
	}
	w1 := strings.ToLower(strings.TrimSpace(word1))
	w2 := strings.ToLower(strings.TrimSpace(word2))

	score, err := similarity.Compare(res, w1, w2, similarity.WithMetric(similarity.MetricWuPalmer))
	if err != nil {
		return models.SimilarityResult{Word1: word1, Word2: word2, Error: err.Error()}
	}

	return models.SimilarityResult{
		Word1:  w1,
		Word2:  w2,
		Score:  score,
		Metric: "Wu-Palmer",
	}
}