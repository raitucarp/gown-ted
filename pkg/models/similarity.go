package models

// SimilarityResult reports semantic proximity between two words.
type SimilarityResult struct {
	Word1  string  `json:"word1"`
	Word2  string  `json:"word2"`
	Score  float64 `json:"score"`
	Metric string  `json:"metric"`
	Error  string  `json:"error,omitempty"`
}
