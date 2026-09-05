package suggester

import (
	"github.com/raitucarp/gown"
	"github.com/raitucarp/gown-ted/pkg/models"
)

// FindExact locates exact lemma matches in the lexical resource.
func FindExact(res *gown.LexicalResource, clean string, seen map[string]bool) (*models.SuggestionItem, gown.LexicalEntries) {
	exactEntries := res.Lookup(clean)
	if len(exactEntries) == 0 {
		return nil, exactEntries
	}

	entry := exactEntries[0]
	gloss := ""
	if syns := entry.Synsets(); len(syns) > 0 && syns[0] != nil && len(syns[0].Definitions) > 0 {
		gloss = syns[0].Definitions[0]
	}

	seen[clean] = true
	item := &models.SuggestionItem{
		Word:        entry.Lemma.WrittenForm,
		Lemma:       clean,
		POS:         string(entry.PartOfSpeech()),
		Gloss:       gloss,
		SenseNumber: len(entry.Senses),
		Source:      "Lemma",
	}
	return item, exactEntries
}