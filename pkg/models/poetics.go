package models

// PoeticWordItem represents a word recommendation matching rhyming, alliteration, or rhythmic criteria.
type PoeticWordItem struct {
	Word          string `json:"word"`
	POS           string `json:"pos"`
	SyllableCount int    `json:"syllableCount"`
	CVPattern     string `json:"cvPattern"`
	RhymeScore    int    `json:"rhymeScore"`
	Gloss         string `json:"gloss"`
}

// PoeticSuggestionsResult bundles rhymes, alliterations, and CV rhythm matches for creative writing.
type PoeticSuggestionsResult struct {
	Word          string           `json:"word"`
	RhymeEnding   string           `json:"rhymeEnding"`
	OnsetCluster  string           `json:"onsetCluster"`
	SyllableCount int              `json:"syllableCount"`
	CVPattern     string           `json:"cvPattern"`
	Rhymes        []PoeticWordItem `json:"rhymes"`
	Alliterations []PoeticWordItem `json:"alliterations"`
	CVSimilar     []PoeticWordItem `json:"cvSimilar"`
}
