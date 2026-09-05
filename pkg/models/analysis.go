package models

import (
	"github.com/raitucarp/gown/expansion"
)

// LexicalAnalysisResult bundles all lexical, semantic, and morphological analysis.
type LexicalAnalysisResult struct {
	RequestID             int64                   `json:"requestId"`
	Word                  string                  `json:"word"`
	Found                 bool                    `json:"found"`
	PrimaryLemma          string                  `json:"primaryLemma"`
	Senses                []WordSenseItem         `json:"senses"`
	RecommendedSenseIndex int                     `json:"recommendedSenseIndex"`
	WSDConfidence         float64                 `json:"wsdConfidence"`
	SynonymGroups         []SynonymGroup          `json:"synonymGroups"`
	Antonyms              []string                `json:"antonyms"`
	Hypernyms             []string                `json:"hypernyms"`
	Hyponyms              []string                `json:"hyponyms"`
	Meronyms              []string                `json:"meronyms"`
	Morphology            MorphologyInfo          `json:"morphology"`
	Phonology             PhonologyInfo           `json:"phonology"`
	Polysemy              PolysemyInfo            `json:"polysemy"`
	Poetics               PoeticSuggestionsResult `json:"poetics"`
	HierarchyTree         string                  `json:"hierarchyTree"`
	ExpansionTree         *expansion.Node         `json:"expansionTree,omitempty"`
	Functional            FunctionalInfo          `json:"functional"`
	Pragmatics            PragmaticsInfo          `json:"pragmatics"`
	Discourse             DiscourseInfo           `json:"discourse"`
}
