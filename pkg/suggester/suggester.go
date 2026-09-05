package suggester

import (
	"strings"
	"unicode"

	"github.com/raitucarp/gown"
	"github.com/raitucarp/gown-ted/pkg/models"
	"github.com/raitucarp/gown-ted/pkg/trie"
)

// GetSuggestions coordinates exact, prefix, substring, synonym, and contextual keyword suggestions.
func GetSuggestions(res *gown.LexicalResource, prefixTrie *trie.PrefixTrie, allLemmas []models.SuggestionItem, query string, limit int) []models.SuggestionItem {
	if res == nil {
		return nil
	}
	if limit <= 0 {
		limit = 20
	}
	if limit > 30 {
		limit = 30
	}

	clean := strings.ToLower(strings.TrimSpace(query))
	clean = strings.TrimFunc(clean, func(r rune) bool {
		return unicode.IsPunct(r) || unicode.IsSpace(r)
	})
	if len(clean) < 2 {
		return nil
	}

	seen := make(map[string]bool)

	// 1. Exact match lemma lookup
	exactItem, exactEntries := FindExact(res, clean, seen)

	// 2. Prefix matches from Trie
	prefixItems := FindPrefix(prefixTrie, clean, limit, seen)

	// 3. Substring matches from lemmas
	substringItems := FindSubstring(allLemmas, clean, seen)

	// 4. Synonyms
	synonymItems := FindSynonyms(res, clean, exactEntries, seen)

	// 5. Definitions & Examples containing query
	defItems, exItems := FindDefinitionsAndExamples(res, clean, seen)

	// 6. Words from definitions & examples of query itself
	qDefItems, qExItems := FindFromQueryContext(res, clean, exactEntries, seen)
	defItems = append(defItems, qDefItems...)
	exItems = append(exItems, qExItems...)

	// 7. Assemble final balanced results
	return Assemble(limit, exactItem, prefixItems, synonymItems, defItems, exItems, substringItems)
}
