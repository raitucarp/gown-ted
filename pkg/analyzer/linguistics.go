package analyzer

import (
	"github.com/raitucarp/gown"
	"github.com/raitucarp/gown/discourse"
	"github.com/raitucarp/gown/functional"
	"github.com/raitucarp/gown/pragmatics"
	"github.com/raitucarp/gown-ted/pkg/models"
)

// AnalyzeFunctional performs Systemic Functional Linguistics analysis.
func AnalyzeFunctional(res *gown.LexicalResource, clause string) models.FunctionalInfo {
	var info models.FunctionalInfo
	info.ThemeRheme = functional.SplitThemeRheme(clause)
	info.Interpersonal = functional.AnalyzeInterpersonal(clause)
	if res != nil {
		info.CohesiveTies = functional.AnalyzeCohesion(res, clause)
	}
	return info
}

// AnalyzePragmatics classifies speech acts, politeness, and indexical deixis.
func AnalyzePragmatics(utterance string) models.PragmaticsInfo {
	var info models.PragmaticsInfo
	info.SpeechAct = pragmatics.ClassifySpeechAct(utterance)
	info.Politeness = pragmatics.AnalyzePoliteness(utterance)
	info.Deixis = pragmatics.IdentifyDeixis(utterance)
	return info
}

// AnalyzeDiscourse tracks thematic progression across clauses.
func AnalyzeDiscourse(text string) models.DiscourseInfo {
	var info models.DiscourseInfo
	info.ThematicProgression = discourse.AnalyzeThemeProgression(text)
	return info
}
