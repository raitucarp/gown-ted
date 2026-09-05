package suggester

import (
	"testing"

	"github.com/raitucarp/gown-ted/pkg/models"
)

func TestIsCapitalized(t *testing.T) {
	tests := []struct {
		word     string
		expected bool
	}{
		{"apple", false},
		{"Apple", true},
		{"march", false},
		{"March", true},
		{"25 de Abril Bridge", true},
		{"10th", false},
		{"", false},
		{"   New York", true},
		{"dog", false},
	}

	for _, tt := range tests {
		got := isCapitalized(tt.word)
		if got != tt.expected {
			t.Errorf("isCapitalized(%q) = %v, expected %v", tt.word, got, tt.expected)
		}
	}
}

func TestAssembleCapitalizedAtEnd(t *testing.T) {
	prefixItems := []models.SuggestionItem{
		{Word: "March", Lemma: "march"},
		{Word: "market", Lemma: "market"},
		{Word: "Monday", Lemma: "monday"},
		{Word: "money", Lemma: "money"},
	}

	synonymItems := []models.SuggestionItem{
		{Word: "currency", Lemma: "currency"},
		{Word: "Mars", Lemma: "mars"},
	}

	results := Assemble(10, nil, prefixItems, synonymItems, nil, nil, nil)

	// Ensure all lowercase words appear before any capitalized words
	seenCapital := false
	capitalCount := 0
	for i, r := range results {
		cap := isCapitalized(r.Word)
		if cap {
			seenCapital = true
			capitalCount++
		} else if seenCapital {
			t.Errorf("Found lowercase word %q at index %d after a capitalized word", r.Word, i)
		}
	}

	if capitalCount == 0 {
		t.Errorf("Expected at least one capitalized word in results, got 0")
	}

	// First items must be lowercase
	if len(results) > 0 && isCapitalized(results[0].Word) {
		t.Errorf("Expected first suggestion to be lowercase, got %q", results[0].Word)
	}
}
