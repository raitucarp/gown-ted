package suggester

import (
	"strings"

	"github.com/raitucarp/gown-ted/pkg/models"
	"github.com/raitucarp/gown-ted/pkg/trie"
)

// FindPrefix retrieves prefix completion candidates from the trie.
func FindPrefix(prefixTrie *trie.PrefixTrie, clean string, limit int, seen map[string]bool) []models.SuggestionItem {
	if prefixTrie == nil {
		return nil
	}
	searchLimit := limit * 3
	if searchLimit < 60 {
		searchLimit = 60
	}
	rawPrefix := prefixTrie.Search(clean, searchLimit)
	var prefixItems []models.SuggestionItem
	for _, item := range rawPrefix {
		wLower := strings.ToLower(item.Word)
		if !seen[wLower] {
			seen[wLower] = true
			item.Source = "Lemma"
			prefixItems = append(prefixItems, item)
		}
	}
	return prefixItems
}
