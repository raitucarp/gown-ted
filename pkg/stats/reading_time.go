package stats

import "math"

// EstimateReadingTime calculates reading time in minutes (200 wpm).
func EstimateReadingTime(wordCount int) float64 {
	if wordCount == 0 {
		return 0
	}
	return math.Round((float64(wordCount)/200.0)*10) / 10
}

// EstimateSpeakingTime calculates speaking time in minutes (130 wpm).
func EstimateSpeakingTime(wordCount int) float64 {
	if wordCount == 0 {
		return 0
	}
	return math.Round((float64(wordCount)/130.0)*10) / 10
}

// CalculateRichness computes the Type-Token Ratio (vocabulary richness).
func CalculateRichness(uniqueWords, totalWords int) float64 {
	if totalWords == 0 {
		return 0
	}
	return math.Round((float64(uniqueWords)/float64(totalWords))*100) / 100
}
