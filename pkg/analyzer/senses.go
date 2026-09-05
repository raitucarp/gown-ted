package analyzer

import (
	"math"
	"strings"

	"github.com/raitucarp/gown"
	"github.com/raitucarp/gown/semantics"
	"github.com/raitucarp/gown-ted/pkg/models"
)

// SensesAndRelations holds structured senses, synonyms, and related semantic relations.
type SensesAndRelations struct {
	SenseItems    []models.WordSenseItem
	SynonymGroups []models.SynonymGroup
	RecIndex      int
	HighestConf   float64
	Antonyms      []string
	Hypernyms     []string
	Hyponyms      []string
	Meronyms      []string
}

// ExtractSensesAndRelations iterates over entries and synsets to extract senses, synonyms, and relations.
func ExtractSensesAndRelations(res *gown.LexicalResource, entries gown.LexicalEntries, primaryLemma string, wsdResult semantics.DisambiguationResult) SensesAndRelations {
	var sr SensesAndRelations
	antonymMap := make(map[string]bool)
	hypernymMap := make(map[string]bool)
	hyponymMap := make(map[string]bool)
	meronymMap := make(map[string]bool)

	senseCounter := 1

	for _, entry := range entries {
		pos := string(entry.PartOfSpeech())
		for _, sense := range entry.Senses {
			synset := sense.GetSynset()
			if synset == nil {
				continue
			}

			definition := synset.PrimaryDefinition()
			var examples []string
			for _, ex := range synset.Examples {
				if ex.Text != "" {
					examples = append(examples, ex.Text)
				}
			}

			confidence := 0.1
			if wsdResult.BestSynset != nil && wsdResult.BestSynset.ID == synset.ID {
				if wsdResult.Score > 0 {
					confidence = math.Min(0.95, 0.5+float64(wsdResult.Score)*0.15)
				} else {
					confidence = 0.55
				}
			}

			if confidence > sr.HighestConf {
				sr.HighestConf = confidence
				sr.RecIndex = len(sr.SenseItems)
			}

			item := models.WordSenseItem{
				ID:          synset.ID,
				SenseNumber: senseCounter,
				POS:         pos,
				Definition:  definition,
				Examples:    examples,
				Lemma:       entry.Lemma.WrittenForm,
				Lexfile:     synset.Lexfile,
				ILI:         synset.Ili,
				Confidence:  confidence,
				IsSelected:  false,
			}
			sr.SenseItems = append(sr.SenseItems, item)

			// Synonyms in this synset
			var synWords []string
			for _, mId := range synset.Members {
				mEntry := res.LexicalsById()[mId]
				if mEntry != nil && !strings.EqualFold(mEntry.Lemma.WrittenForm, primaryLemma) {
					synWords = append(synWords, mEntry.Lemma.WrittenForm)
				}
			}
			if len(synWords) > 0 {
				sr.SynonymGroups = append(sr.SynonymGroups, models.SynonymGroup{
					SenseNumber:     senseCounter,
					SenseDefinition: definition,
					POS:             pos,
					Words:           synWords,
				})
			}

			// Direct Relations
			for _, rel := range synset.SynsetRelations {
				targetSyn := res.SynsetsById()[rel.Target]
				if targetSyn == nil {
					continue
				}
				for _, memId := range targetSyn.Members {
					memEntry := res.LexicalsById()[memId]
					if memEntry == nil {
						continue
					}
					form := memEntry.Lemma.WrittenForm
					switch rel.RelType {
					case "hypernym", "instance_hypernym":
						hypernymMap[form] = true
					case "hyponym", "instance_hyponym":
						hyponymMap[form] = true
					case "meronym", "part_meronym", "member_meronym", "substance_meronym":
						meronymMap[form] = true
					}
				}
			}

			// Sense relations (e.g. Antonyms)
			for _, sRel := range sense.SenseRelations {
				if sRel.RelType == "antonym" {
					targetSense := res.SenseById()[sRel.Target]
					if targetSense != nil {
						tSyn := targetSense.GetSynset()
						if tSyn != nil {
							for _, mId := range tSyn.Members {
								if mEntry := res.LexicalsById()[mId]; mEntry != nil {
									antonymMap[mEntry.Lemma.WrittenForm] = true
								}
							}
						}
					}
				}
			}

			senseCounter++
		}
	}

	if len(sr.SenseItems) > 0 {
		sr.SenseItems[sr.RecIndex].IsSelected = true
	}

	for a := range antonymMap {
		sr.Antonyms = append(sr.Antonyms, a)
	}
	for h := range hypernymMap {
		sr.Hypernyms = append(sr.Hypernyms, h)
	}
	for h := range hyponymMap {
		sr.Hyponyms = append(sr.Hyponyms, h)
	}
	for m := range meronymMap {
		sr.Meronyms = append(sr.Meronyms, m)
	}

	return sr
}
