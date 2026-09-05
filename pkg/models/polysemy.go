package models

// PolysemyInfo quantifies lexical ambiguity.
type PolysemyInfo struct {
	TotalSenses  int     `json:"totalSenses"`
	IsPolysemous bool    `json:"isPolysemous"`
	Entropy      float64 `json:"entropy"`
}
