package models

// DocumentStats reports live statistical measurements of document content.
type DocumentStats struct {
	Characters          int     `json:"characters"`
	CharactersNoSpaces  int     `json:"charactersNoSpaces"`
	Words               int     `json:"words"`
	Sentences           int     `json:"sentences"`
	Paragraphs          int     `json:"paragraphs"`
	ReadingTimeMinutes  float64 `json:"readingTimeMinutes"`
	SpeakingTimeMinutes float64 `json:"speakingTimeMinutes"`
	UniqueWords         int     `json:"uniqueWords"`
	VocabularyRichness  float64 `json:"vocabularyRichness"`
}
