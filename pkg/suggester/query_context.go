package suggester

import (
	"fmt"
	"strings"
	"unicode"

	"github.com/raitucarp/gown"
	"github.com/raitucarp/gown-ted/pkg/models"
)

// FindFromQueryContext extracts words found within definitions and examples of the query.
func FindFromQueryContext(res *gown.LexicalResource, clean string, exactEntries gown.LexicalEntries, seen map[string]bool) (defItems, exItems []models.SuggestionItem) {
	if res == nil || len(exactEntries) == 0 {
		return nil, nil
	}

	for _, entry := range exactEntries {
		for _, syn := range entry.Synsets() {
			if syn == nil {
				continue
			}
			for _, def := range syn.Definitions {
				words := strings.FieldsFunc(def, func(r rune) bool {
					return !unicode.IsLetter(r) && r != '-'
				})
				for _, w := range words {
					wLower := strings.ToLower(w)
					if len(wLower) >= 3 && !StopWords[wLower] && wLower != clean && !seen[wLower] {
						if dEntries := res.Lookup(wLower); len(dEntries) > 0 {
							seen[wLower] = true
							defItems = append(defItems, models.SuggestionItem{
								Word:        dEntries[0].Lemma.WrittenForm,
								Lemma:       wLower,
								POS:         string(dEntries[0].PartOfSpeech()),
								Gloss:       fmt.Sprintf("From definition: \"%s\"", def),
								SenseNumber: len(dEntries[0].Senses),
								Source:      "Definition",
							})
							break
						}
					}
				}
			}

			for _, ex := range syn.Examples {
				words := strings.FieldsFunc(ex.Text, func(r rune) bool {
					return !unicode.IsLetter(r) && r != '-'
				})
				for _, w := range words {
					wLower := strings.ToLower(w)
					if len(wLower) >= 3 && !StopWords[wLower] && wLower != clean && !seen[wLower] {
						if eEntries := res.Lookup(wLower); len(eEntries) > 0 {
							seen[wLower] = true
							exItems = append(exItems, models.SuggestionItem{
								Word:        eEntries[0].Lemma.WrittenForm,
								Lemma:       wLower,
								POS:         string(eEntries[0].PartOfSpeech()),
								Gloss:       fmt.Sprintf("From example: \"%s\"", ex.Text),
								SenseNumber: len(eEntries[0].Senses),
								Source:      "Example",
							})
							break
						}
					}
				}
			}
		}
	}

	return defItems, exItems
}