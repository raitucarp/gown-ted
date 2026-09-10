package models

// LexFileInfo describes a WordNet Lexicographer File domain with word count.
type LexFileInfo struct {
	Name      string `json:"name"`
	WordCount int    `json:"wordCount"`
}

// LexFileWordItem represents an individual word entry belonging to a LexFile.
type LexFileWordItem struct {
	Word       string   `json:"word"`
	POS        string   `json:"pos"`
	Definition string   `json:"definition"`
	SynsetID   string   `json:"synsetId"`
	Examples   []string `json:"examples,omitempty"`
	LexFile    string   `json:"lexfile,omitempty"`
}
