package suggester

import (
	"strings"

	"github.com/raitucarp/gown-ted/pkg/models"
)

// FindSubstring searches for lemmas containing the query substring.
func FindSubstring(allLemmas []models.SuggestionItem, clean string, seen map[string]bool) []models.SuggestionItem {
	var substringItems []models.SuggestionItem
	for _, item := range allLemmas {
		if strings.Contains(item.Lemma, clean) && !strings.HasPrefix(item.Lemma, clean) {
			if !seen[item.Lemma] {
				seen[item.Lemma] = true
				item.Source = "Lemma"
				substringItems = append(substringItems, item)
				if len(substringItems) >= 10 {
					break
				}
			}
		}
	}
	return substringItems
}
