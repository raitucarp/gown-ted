package trie

import "github.com/raitucarp/gown-ted/pkg/models"

// TrieNode is an internal node of the prefix trie.
type TrieNode struct {
	Children map[rune]*TrieNode
	IsEnd    bool
	Item     models.SuggestionItem
}
