package models

// MorphologyInfo summarizes morphological variations and lemma resolution.
type MorphologyInfo struct {
	Original            string   `json:"original"`
	Lemmas              []string `json:"lemmas"`
	POSList             []string `json:"posList"`
	InflectedVariations []string `json:"inflectedVariations"`
}
