package main

import (
	"strings"
	"sync"
)

// SuggestionItem represents a single autocomplete recommendation.
type SuggestionItem struct {
	Word        string `json:"word"`
	Lemma       string `json:"lemma"`
	POS         string `json:"pos"`
	Gloss       string `json:"gloss"`
	SenseNumber int    `json:"senseNumber"`
	Source      string `json:"source,omitempty"`
}

// TrieNode is an internal node of the prefix trie.
type TrieNode struct {
	children map[rune]*TrieNode
	isEnd    bool
	item     SuggestionItem
}

// PrefixTrie is a thread-safe prefix trie for fast WordNet vocabulary lookup.
type PrefixTrie struct {
	root *TrieNode
	mu   sync.RWMutex
}

// NewPrefixTrie constructs a new prefix trie.
func NewPrefixTrie() *PrefixTrie {
	return &PrefixTrie{
		root: &TrieNode{
			children: make(map[rune]*TrieNode),
		},
	}
}

// Insert adds a word with its metadata into the trie.
func (t *PrefixTrie) Insert(word, lemma, pos, gloss string, senseNum int) {
	if word == "" {
		return
	}
	clean := strings.ToLower(strings.TrimSpace(word))
	t.mu.Lock()
	defer t.mu.Unlock()

	curr := t.root
	for _, ch := range clean {
		if curr.children == nil {
			curr.children = make(map[rune]*TrieNode)
		}
		child, exists := curr.children[ch]
		if !exists {
			child = &TrieNode{children: make(map[rune]*TrieNode)}
			curr.children[ch] = child
		}
		curr = child
	}
	if !curr.isEnd {
		curr.isEnd = true
		curr.item = SuggestionItem{
			Word:        lemma,
			Lemma:       clean,
			POS:         pos,
			Gloss:       gloss,
			SenseNumber: senseNum,
			Source:      "Lemma",
		}
	}
}

// Search retrieves up to `limit` words starting with `prefix`.
func (t *PrefixTrie) Search(prefix string, limit int) []SuggestionItem {
	if limit <= 0 {
		limit = 10
	}
	clean := strings.ToLower(strings.TrimSpace(prefix))
	if clean == "" {
		return nil
	}

	t.mu.RLock()
	defer t.mu.RUnlock()

	curr := t.root
	for _, ch := range clean {
		child, exists := curr.children[ch]
		if !exists {
			return nil
		}
		curr = child
	}

	var results []SuggestionItem
	var dfs func(node *TrieNode)
	dfs = func(node *TrieNode) {
		if len(results) >= limit {
			return
		}
		if node.isEnd {
			results = append(results, node.item)
		}
		for _, child := range node.children {
			if len(results) >= limit {
				return
			}
			dfs(child)
		}
	}

	dfs(curr)
	return results
}
