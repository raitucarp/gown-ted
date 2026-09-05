package trie

import (
	"strings"

	"github.com/raitucarp/gown-ted/pkg/models"
)

// Search retrieves up to `limit` words starting with `prefix`.
func (t *PrefixTrie) Search(prefix string, limit int) []models.SuggestionItem {
	if limit <= 0 {
		limit = 10
	}
	clean := strings.ToLower(strings.TrimSpace(prefix))
	if clean == "" {
		return nil
	}

	t.Mu.RLock()
	defer t.Mu.RUnlock()

	curr := t.Root
	for _, ch := range clean {
		child, exists := curr.Children[ch]
		if !exists {
			return nil
		}
		curr = child
	}

	var results []models.SuggestionItem
	var dfs func(node *TrieNode)
	dfs = func(node *TrieNode) {
		if len(results) >= limit {
			return
		}
		if node.IsEnd {
			results = append(results, node.Item)
		}
		for _, child := range node.Children {
			if len(results) >= limit {
				return
			}
			dfs(child)
		}
	}

	dfs(curr)
	return results
}
