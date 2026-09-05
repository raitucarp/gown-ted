package trie

import "sync"

// PrefixTrie is a thread-safe prefix trie for fast WordNet vocabulary lookup.
type PrefixTrie struct {
	Root *TrieNode
	Mu   sync.RWMutex
}

// NewPrefixTrie constructs a new prefix trie.
func NewPrefixTrie() *PrefixTrie {
	return &PrefixTrie{
		Root: &TrieNode{
			Children: make(map[rune]*TrieNode),
		},
	}
}
