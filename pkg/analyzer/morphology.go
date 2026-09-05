package analyzer

import "github.com/raitucarp/gown"

// ResolveMorphology lemmatizes a word across Noun, Verb, Adjective, Adverb parts-of-speech.
func ResolveMorphology(res *gown.LexicalResource, lowerWord string) (primaryLemma string, lemmas []string, posList []string) {
	morphMap := make(map[string]bool)
	poses := []gown.POS{gown.NounPos, gown.VerbPos, gown.AdjectivePos, gown.AdverbPos}
	posNames := map[gown.POS]string{
		gown.NounPos:      "noun",
		gown.VerbPos:      "verb",
		gown.AdjectivePos: "adjective",
		gown.AdverbPos:    "adverb",
	}

	for _, pos := range poses {
		morphLemmas := res.Morphy(lowerWord, pos)
		if len(morphLemmas) > 0 {
			posList = append(posList, posNames[pos])
			for _, ml := range morphLemmas {
				if !morphMap[ml] {
					morphMap[ml] = true
					lemmas = append(lemmas, ml)
				}
			}
		}
	}

	primaryLemma = lowerWord
	if len(lemmas) > 0 {
		primaryLemma = lemmas[0]
	}
	return primaryLemma, lemmas, posList
}
