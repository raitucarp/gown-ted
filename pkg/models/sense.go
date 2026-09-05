package models

// WordSenseItem represents a single lexical sense for the active word.
type WordSenseItem struct {
	ID          string   `json:"id"`
	SenseNumber int      `json:"senseNumber"`
	POS         string   `json:"pos"`
	Definition  string   `json:"definition"`
	Examples    []string `json:"examples"`
	Lemma       string   `json:"lemma"`
	Lexfile     string   `json:"lexfile"`
	ILI         string   `json:"ili"`
	Confidence  float64  `json:"confidence"`
	IsSelected  bool     `json:"isSelected"`
}

// SynonymGroup groups synonyms belonging to a specific word sense.
type SynonymGroup struct {
	SenseNumber     int      `json:"senseNumber"`
	SenseDefinition string   `json:"senseDefinition"`
	POS             string   `json:"pos"`
	Words           []string `json:"words"`
}
