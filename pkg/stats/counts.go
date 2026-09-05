package stats

import (
	"strings"
	"unicode"
)

// DocumentCounts holds raw frequency counts of document text.
type DocumentCounts struct {
	Characters         int
	CharactersNoSpaces int
	Words              int
	Sentences          int
	Paragraphs         int
	UniqueWords        int
}

// CountMetrics analyzes the plain text and extracts structural metrics.
func CountMetrics(text string) DocumentCounts {
	var counts DocumentCounts
	counts.Characters = len([]rune(text))

	for _, r := range text {
		if !unicode.IsSpace(r) {
			counts.CharactersNoSpaces++
		}
	}

	rawParas := strings.Split(text, "\n")
	for _, p := range rawParas {
		if strings.TrimSpace(p) != "" {
			counts.Paragraphs++
		}
	}
	if counts.Paragraphs == 0 && strings.TrimSpace(text) != "" {
		counts.Paragraphs = 1
	}

	isSentenceEnd := func(r rune) bool {
		return r == '.' || r == '!' || r == '?' || r == '…'
	}
	sentences := strings.FieldsFunc(text, isSentenceEnd)
	for _, s := range sentences {
		if strings.TrimSpace(s) != "" {
			counts.Sentences++
		}
	}
	if counts.Sentences == 0 && counts.Words > 0 {
		counts.Sentences = 1
	}

	uniqueMap := make(map[string]bool)
	words := strings.Fields(text)
	counts.Words = len(words)
	for _, w := range words {
		cleaned := strings.ToLower(strings.TrimFunc(w, func(r rune) bool {
			return unicode.IsPunct(r) || unicode.IsSpace(r)
		}))
		if cleaned != "" {
			uniqueMap[cleaned] = true
		}
	}
	counts.UniqueWords = len(uniqueMap)

	return counts
}