package analyzer

import (
	"strings"
	"unicode"

	"github.com/raitucarp/gown"
	"github.com/raitucarp/gown/semantics"
	"github.com/raitucarp/gown-ted/pkg/models"
	"github.com/raitucarp/gown-ted/pkg/phonology"
	"github.com/raitucarp/gown-ted/pkg/poetics"
)

// Analyze performs deep morphological, semantic, phonetic, and contextual analysis on an active word.
func Analyze(res *gown.LexicalResource, allLemmas []models.SuggestionItem, word, sentenceContext string, requestId int64) models.LexicalAnalysisResult {
	result := models.LexicalAnalysisResult{
		RequestID: requestId,
		Word:      word,
		Found:     false,
	}

	cleanWord := strings.TrimSpace(word)
	cleanWord = strings.TrimFunc(cleanWord, func(r rune) bool {
		return unicode.IsPunct(r) || unicode.IsSpace(r)
	})
	if cleanWord == "" || res == nil {
		return result
	}

	lowerWord := strings.ToLower(cleanWord)

	// 1. Morphological Lemmatization
	primaryLemma, lemmas, posList := ResolveMorphology(res, lowerWord)
	result.PrimaryLemma = primaryLemma

	// 2. Query Lexical Entries
	entries := res.Lookup(primaryLemma)
	if len(entries) == 0 && primaryLemma != lowerWord {
		entries = res.Lookup(lowerWord)
	}

	if len(entries) == 0 {
		result.Phonology = phonology.Compute(cleanWord)
		result.Poetics = poetics.Analyze(cleanWord, allLemmas)
		result.Morphology = models.MorphologyInfo{
			Original: cleanWord,
			Lemmas:   lemmas,
			POSList:  posList,
		}
		if strings.TrimSpace(sentenceContext) != "" {
			result.Functional = AnalyzeFunctional(res, sentenceContext)
			result.Pragmatics = AnalyzePragmatics(sentenceContext)
			result.Discourse = AnalyzeDiscourse(sentenceContext)
		}
		return result
	}

	result.Found = true

	// 3. WSD & Sense/Relation Extraction
	wsdResult := semantics.DisambiguateLesk(res, primaryLemma, sentenceContext)
	sr := ExtractSensesAndRelations(res, entries, primaryLemma, wsdResult)

	result.RecommendedSenseIndex = sr.RecIndex
	result.WSDConfidence = sr.HighestConf
	result.Senses = sr.SenseItems
	result.SynonymGroups = sr.SynonymGroups
	result.Antonyms = sr.Antonyms
	result.Hypernyms = sr.Hypernyms
	result.Hyponyms = sr.Hyponyms
	result.Meronyms = sr.Meronyms

	// 4. Morphology
	result.Morphology = models.MorphologyInfo{
		Original: cleanWord,
		Lemmas:   lemmas,
		POSList:  posList,
	}

	// 5. Phonology & Poetics
	result.Phonology = phonology.Compute(cleanWord)
	result.Poetics = poetics.Analyze(cleanWord, allLemmas)

	// 6. Polysemy
	polyReport := semantics.AnalyzePolysemy(res, primaryLemma)
	result.Polysemy = models.PolysemyInfo{
		TotalSenses:  polyReport.TotalSenses,
		IsPolysemous: polyReport.IsPolysemous,
		Entropy:      polyReport.Entropy,
	}

	// 7. Expansion Tree
	result.HierarchyTree, result.ExpansionTree = BuildTrees(res, primaryLemma)

	// 8. Functional, Pragmatics, Discourse
	if strings.TrimSpace(sentenceContext) != "" {
		result.Functional = AnalyzeFunctional(res, sentenceContext)
		result.Pragmatics = AnalyzePragmatics(sentenceContext)
		result.Discourse = AnalyzeDiscourse(sentenceContext)
	}

	return result
}
