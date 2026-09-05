package suggester

import (
	"strings"

	"github.com/raitucarp/gown"
	"github.com/raitucarp/gown-ted/pkg/models"
)

// FindSynonyms locates synonyms of the exact query or its morphological root.
func FindSynonyms(res *gown.LexicalResource, clean string, exactEntries gown.LexicalEntries, seen map[string]bool) []models.SuggestionItem {
	if res == nil {
		return nil
	}

	searchEntries := exactEntries
	if len(searchEntries) == 0 {
		for _, pos := range []gown.POS{gown.NounPos, gown.VerbPos, gown.AdjectivePos, gown.AdverbPos} {
			morphLemmas := res.Morphy(clean, pos)
			if len(morphLemmas) > 0 {
				searchEntries = res.Lookup(morphLemmas[0])
				if len(searchEntries) > 0 {
					break
				}
			}
		}
	}

	if len(searchEntries) == 0 {
		return nil
	}

	var synonymItems []models.SuggestionItem
	for _, entry := range searchEntries {
		for _, syn := range entry.Synsets() {
			if syn == nil {
				continue
			}
			for _, mId := range syn.Members {
				mEntry := res.LexicalsById()[mId]
				if mEntry != nil {
					lem := mEntry.Lemma.WrittenForm
					lemLower := strings.ToLower(lem)
					if lemLower != clean && !seen[lemLower] && len(lemLower) >= 3 {
						seen[lemLower] = true
						synonymItems = append(synonymItems, models.SuggestionItem{
							Word:        lem,
							Lemma:       lemLower,
							POS:         string(syn.PartOfSpeech),
							Gloss:       "Synonym of " + clean,
							SenseNumber: 1,
							Source:      "Synonym",
						})
					}
				}
			}
		}
	}
	return synonymItems
}