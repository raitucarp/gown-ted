package models

// SuggestionItem represents a single autocomplete recommendation.
type SuggestionItem struct {
	Word        string `json:"word"`
	Lemma       string `json:"lemma"`
	POS         string `json:"pos"`
	Gloss       string `json:"gloss"`
	SenseNumber int    `json:"senseNumber"`
	Source      string `json:"source,omitempty"`
}
