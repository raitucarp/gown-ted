package service

import (
	"sync"

	"github.com/raitucarp/gown"
	"github.com/raitucarp/gown-ted/pkg/models"
	"github.com/raitucarp/gown-ted/pkg/trie"
)

// LexicalService provides WordNet lexical lookups, autocomplete suggestions, and semantic calculations.
type LexicalService struct {
	resource     *gown.LexicalResource
	trie         *trie.PrefixTrie
	allLemmas    []models.SuggestionItem
	lexFiles     []models.LexFileInfo
	lexFileWords map[string][]models.LexFileWordItem
	wordLexIndex map[string]models.LexFileWordItem
	mu           sync.RWMutex
	ready        bool
}

// NewLexicalService constructs a new LexicalService and initializes WordNet in the background.
func NewLexicalService() *LexicalService {
	s := &LexicalService{
		trie: trie.NewPrefixTrie(),
	}
	s.initWordNet()
	return s
}
