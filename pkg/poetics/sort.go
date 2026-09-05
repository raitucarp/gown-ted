package poetics

import (
	"math"
	"sort"
	"unicode"

	"github.com/raitucarp/gown-ted/pkg/models"
)

// SortRhymes sorts rhyme candidates: same syllable count first, lowercase words first, shorter words first.
func SortRhymes(rhymes []models.PoeticWordItem, targetSyllables int) {
	sort.SliceStable(rhymes, func(i, j int) bool {
		diffI := int(math.Abs(float64(rhymes[i].SyllableCount - targetSyllables)))
		diffJ := int(math.Abs(float64(rhymes[j].SyllableCount - targetSyllables)))
		if diffI != diffJ {
			return diffI < diffJ
		}
		isLowerI := unicode.IsLower(rune(rhymes[i].Word[0]))
		isLowerJ := unicode.IsLower(rune(rhymes[j].Word[0]))
		if isLowerI != isLowerJ {
			return isLowerI
		}
		return len(rhymes[i].Word) < len(rhymes[j].Word)
	})
}

// SortAlliterations sorts alliteration candidates: lowercase words first, then shorter words.
func SortAlliterations(items []models.PoeticWordItem) {
	sort.SliceStable(items, func(i, j int) bool {
		isLowerI := unicode.IsLower(rune(items[i].Word[0]))
		isLowerJ := unicode.IsLower(rune(items[j].Word[0]))
		if isLowerI != isLowerJ {
			return isLowerI
		}
		return len(items[i].Word) < len(items[j].Word)
	})
}

// SortCVSimilar sorts CV rhythm matches: lowercase words first, then shorter words.
func SortCVSimilar(items []models.PoeticWordItem) {
	sort.SliceStable(items, func(i, j int) bool {
		isLowerI := unicode.IsLower(rune(items[i].Word[0]))
		isLowerJ := unicode.IsLower(rune(items[j].Word[0]))
		if isLowerI != isLowerJ {
			return isLowerI
		}
		return len(items[i].Word) < len(items[j].Word)
	})
}
