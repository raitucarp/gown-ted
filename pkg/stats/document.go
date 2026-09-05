package stats

import "github.com/raitucarp/gown-ted/pkg/models"

// Analyze computes realtime statistical measurements for document text.
func Analyze(text string) models.DocumentStats {
	if text == "" {
		return models.DocumentStats{}
	}

	counts := CountMetrics(text)

	return models.DocumentStats{
		Characters:          counts.Characters,
		CharactersNoSpaces:  counts.CharactersNoSpaces,
		Words:               counts.Words,
		Sentences:           counts.Sentences,
		Paragraphs:          counts.Paragraphs,
		ReadingTimeMinutes:  EstimateReadingTime(counts.Words),
		SpeakingTimeMinutes: EstimateSpeakingTime(counts.Words),
		UniqueWords:         counts.UniqueWords,
		VocabularyRichness:  CalculateRichness(counts.UniqueWords, counts.Words),
	}
}
