package models

import (
	"github.com/raitucarp/gown/discourse"
	"github.com/raitucarp/gown/functional"
	"github.com/raitucarp/gown/pragmatics"
)

// FunctionalInfo captures systemic functional linguistics (Theme/Rheme, Mood, Cohesion).
type FunctionalInfo struct {
	ThemeRheme   functional.ThemeRheme             `json:"themeRheme"`
	Interpersonal functional.InterpersonalAnalysis `json:"interpersonal"`
	CohesiveTies  []functional.CohesiveTie          `json:"cohesiveTies"`
}

// PragmaticsInfo captures speech acts, politeness, and indexical deixis.
type PragmaticsInfo struct {
	SpeechAct  pragmatics.IllocutionaryForce  `json:"speechAct"`
	Politeness pragmatics.PolitenessAnalysis  `json:"politeness"`
	Deixis     []pragmatics.DeicticExpression `json:"deixis"`
}

// DiscourseInfo captures thematic progression and coherence across sentences.
type DiscourseInfo struct {
	ThematicProgression []discourse.ThematicProgressionStep `json:"thematicProgression"`
}
