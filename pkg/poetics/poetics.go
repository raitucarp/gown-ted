package poetics

import (
	"strings"
	"unicode"

	"github.com/raitucarp/gown/phonology"
	"github.com/raitucarp/gown-ted/pkg/models"
	pkgphonology "github.com/raitucarp/gown-ted/pkg/phonology"
)

// Analyze generates rhymes, alliterations, and CV meter recommendations.
func Analyze(word string, allLemmas []models.SuggestionItem) models.PoeticSuggestionsResult {
	clean := strings.ToLower(strings.TrimSpace(word))
	clean = strings.TrimFunc(clean, func(r rune) bool {
		return unicode.IsPunct(r) || unicode.IsSpace(r)
	})

	res := models.PoeticSuggestionsResult{
		Word: clean,
	}
	if clean == "" {
		return res
	}

	res.SyllableCount = phonology.CountSyllables(clean)
	res.CVPattern = pkgphonology.Pattern(clean)

	sylls := phonology.Syllabify(clean)
	rhymeEnding := ExtractRhymeEnding(clean, sylls)
	onsetCluster := ExtractOnsetCluster(clean, sylls)

	res.RhymeEnding = rhymeEnding
	res.OnsetCluster = onsetCluster

	seenRhyme := make(map[string]bool)
	seenAllit := make(map[string]bool)
	seenCV := make(map[string]bool)

	rhymeAliases := GetRhymeAliases(rhymeEnding)

	for _, item := range allLemmas {
		candLower := strings.ToLower(item.Word)
		if candLower == clean || len(candLower) < 2 || strings.Contains(candLower, " ") || strings.Contains(candLower, "-") || strings.Contains(candLower, "_") {
			continue
		}

		if !IsPureLetters(candLower) {
			continue
		}

		candSyll := phonology.CountSyllables(candLower)
		candCV := pkgphonology.Pattern(candLower)

		// 1. Rhyme match
		isRhyme := false
		for _, alias := range rhymeAliases {
			if strings.HasSuffix(candLower, alias) {
				isRhyme = true
				break
			}
		}
		if isRhyme && !seenRhyme[candLower] {
			seenRhyme[candLower] = true
			score := 10
			if candSyll == res.SyllableCount {
				score = 20
			}
			res.Rhymes = append(res.Rhymes, models.PoeticWordItem{
				Word:          item.Word,
				POS:           item.POS,
				SyllableCount: candSyll,
				CVPattern:     candCV,
				RhymeScore:    score,
				Gloss:         item.Gloss,
			})
		}

		// 2. Alliteration match
		if len(onsetCluster) >= 1 && strings.HasPrefix(candLower, onsetCluster) && !seenAllit[candLower] {
			seenAllit[candLower] = true
			res.Alliterations = append(res.Alliterations, models.PoeticWordItem{
				Word:          item.Word,
				POS:           item.POS,
				SyllableCount: candSyll,
				CVPattern:     candCV,
				Gloss:         item.Gloss,
			})
		}

		// 3. CV Pattern Rhythm match
		if candCV == res.CVPattern && !seenCV[candLower] {
			seenCV[candLower] = true
			res.CVSimilar = append(res.CVSimilar, models.PoeticWordItem{
				Word:          item.Word,
				POS:           item.POS,
				SyllableCount: candSyll,
				CVPattern:     candCV,
				Gloss:         item.Gloss,
			})
		}
	}

	SortRhymes(res.Rhymes, res.SyllableCount)
	SortAlliterations(res.Alliterations)
	SortCVSimilar(res.CVSimilar)

	if len(res.Rhymes) > 40 {
		res.Rhymes = res.Rhymes[:40]
	}
	if len(res.Alliterations) > 35 {
		res.Alliterations = res.Alliterations[:35]
	}
	if len(res.CVSimilar) > 35 {
		res.CVSimilar = res.CVSimilar[:35]
	}

	return res
}
