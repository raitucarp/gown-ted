package models

// WordGraphNode represents a node in the document word network.
type WordGraphNode struct {
	ID             string `json:"id"`
	Label          string `json:"label"`
	Type           string `json:"type"` // "word", "intermediate", "synset"
	POS            string `json:"pos,omitempty"`
	Count          int    `json:"count,omitempty"`
	IsDocumentWord bool   `json:"is_document_word"`
	Definition     string `json:"definition,omitempty"`
	Depth          int    `json:"depth,omitempty"`
}

// WordGraphEdge represents a semantic relation connecting two nodes.
type WordGraphEdge struct {
	Source string  `json:"source"`
	Target string  `json:"target"`
	Label  string  `json:"label"` // "synonym", "hypernym", "hyponym", "antonym", "meronym", "similar", "same_lexfile"
	Type   string  `json:"type"`
	Weight float64 `json:"weight,omitempty"`
}

// WordGraphResult holds nodes and edges for the document word graph.
type WordGraphResult struct {
	Nodes []WordGraphNode `json:"nodes"`
	Edges []WordGraphEdge `json:"edges"`
}
