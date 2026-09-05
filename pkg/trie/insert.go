package trie

import (
	"strings"

	"github.com/raitucarp/gown-ted/pkg/models"
)

// Insert adds a word with its metadata into the trie.
func (t *PrefixTrie) Insert(word, lemma, pos, gloss string, senseNum int) {
	if word == "" {
		return
	}
	clean := strings.ToLower(strings.TrimSpace(word))
	t.Mu.Lock()
	defer t.Mu.Unlock()

	curr := t.Root
	for _, ch := range clean {
		if curr.Children == nil {
			curr.Children = make(map[rune]*TrieNode)
		}
		child, exists := curr.Children[ch]
		if !exists {
			child = &TrieNode{Children: make(map[rune]*TrieNode)}
			curr.Children[ch] = child
		}
		curr = child
	}
	if !curr.IsEnd {
		curr.IsEnd = true
		curr.Item = models.SuggestionItem{
			Word:        lemma,
			Lemma:       clean,
			POS:         pos,
			Gloss:       gloss,
			SenseNumber: senseNum,
			Source:      "Lemma",
		}
	}
}
