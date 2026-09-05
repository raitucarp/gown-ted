package models

// PhonologyInfo provides syllable breakdown and metrics.
type PhonologyInfo struct {
	SyllableCount int      `json:"syllableCount"`
	Syllables     []string `json:"syllables"`
	CVPattern     string   `json:"cvPattern"`
}
