package service

import (
	"strings"

	"github.com/raitucarp/gown-ted/pkg/models"
)

// GetLexFiles returns the list of all WordNet Lexicographer Files with word counts.
func (s *LexicalService) GetLexFiles() []models.LexFileInfo {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.lexFiles
}

// GetWordsByLexFile returns alphabetically sorted words for a given LexFile, with optional search query.
func (s *LexicalService) GetWordsByLexFile(lexFile string, query string, limit int) []models.LexFileWordItem {
	s.mu.RLock()
	defer s.mu.RUnlock()

	words, exists := s.lexFileWords[lexFile]
	if !exists {
		return []models.LexFileWordItem{}
	}

	q := strings.ToLower(strings.TrimSpace(query))
	if q == "" {
		if limit > 0 && limit < len(words) {
			return words[:limit]
		}
		return words
	}

	var matched []models.LexFileWordItem
	for _, item := range words {
		if strings.Contains(strings.ToLower(item.Word), q) || strings.Contains(strings.ToLower(item.Definition), q) {
			matched = append(matched, item)
			if limit > 0 && len(matched) >= limit {
				break
			}
		}
	}
	if matched == nil {
		return []models.LexFileWordItem{}
	}
	return matched
}

// FindWordLocation locates the primary LexFile and word info for a given word or phrase.
func (s *LexicalService) FindWordLocation(word string) *models.LexFileWordItem {
	s.mu.RLock()
	defer s.mu.RUnlock()

	w := strings.ToLower(strings.TrimSpace(word))
	if item, exists := s.wordLexIndex[w]; exists {
		res := item
		return &res
	}

	// Try replacing spaces with underscores or underscores with spaces
	wUnderscore := strings.ReplaceAll(w, " ", "_")
	if item, exists := s.wordLexIndex[wUnderscore]; exists {
		res := item
		return &res
	}

	wSpace := strings.ReplaceAll(w, "_", " ")
	if item, exists := s.wordLexIndex[wSpace]; exists {
		res := item
		return &res
	}

	return nil
}
