package phonology

import (
	"github.com/raitucarp/gown/phonology"
	"github.com/raitucarp/gown-ted/pkg/models"
)

// Compute calculates syllable count, syllables breakdown, and CV pattern.
func Compute(word string) models.PhonologyInfo {
	count := phonology.CountSyllables(word)
	sylls := phonology.Syllabify(word)

	var sylStrings []string
	for _, sy := range sylls {
		part := sy.Onset + sy.Nucleus + sy.Coda
		if part != "" {
			sylStrings = append(sylStrings, part)
		}
	}

	return models.PhonologyInfo{
		SyllableCount: count,
		Syllables:     sylStrings,
		CVPattern:     Pattern(word),
	}
}
