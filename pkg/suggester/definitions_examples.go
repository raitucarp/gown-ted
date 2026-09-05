package suggester

import (
	"strings"

	"github.com/raitucarp/gown"
	"github.com/raitucarp/gown-ted/pkg/models"
)

// FindDefinitionsAndExamples matches words where the definition or example contains the query word.
func FindDefinitionsAndExamples(res *gown.LexicalResource, clean string, seen map[string]bool) (defItems, exItems []models.SuggestionItem) {
	if res == nil {
		return nil, nil
	}

	for _, syn := range res.Lexicon.Synsets {
		if len(syn.Members) == 0 {
			continue
		}

		if len(defItems) < 10 {
			for _, def := range syn.Definitions {
				if strings.Contains(strings.ToLower(def), clean) {
					mEntry := res.LexicalsById()[syn.Members[0]]
					if mEntry != nil {
						lem := mEntry.Lemma.WrittenForm
						lemLower := strings.ToLower(lem)
						if !seen[lemLower] {
							seen[lemLower] = true
							defItems = append(defItems, models.SuggestionItem{
								Word:        lem,
								Lemma:       lemLower,
								POS:         string(syn.PartOfSpeech),
								Gloss:       def,
								SenseNumber: 1,
								Source:      "Definition",
							})
							break
						}
					}
				}
			}
		}

		if len(exItems) < 10 {
			for _, ex := range syn.Examples {
				if strings.Contains(strings.ToLower(ex.Text), clean) {
					mEntry := res.LexicalsById()[syn.Members[0]]
					if mEntry != nil {
						lem := mEntry.Lemma.WrittenForm
						lemLower := strings.ToLower(lem)
						if !seen[lemLower] {
							seen[lemLower] = true
							exItems = append(exItems, models.SuggestionItem{
								Word:        lem,
								Lemma:       lemLower,
								POS:         string(syn.PartOfSpeech),
								Gloss:       ex.Text,
								SenseNumber: 1,
								Source:      "Example",
							})
							break
						}
					}
				}
			}
		}

		if len(defItems) >= 10 && len(exItems) >= 10 {
			break
		}
	}

	return defItems, exItems
}
