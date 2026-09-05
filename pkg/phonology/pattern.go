package phonology

import (
	"strings"
	"unicode"
)

// Pattern computes the consonant/vowel pattern for a word (e.g. "bright" -> "CCVCCC").
func Pattern(word string) string {
	vowels := "aeiouyAEIOUY"
	var sb strings.Builder
	for _, ch := range word {
		if unicode.IsLetter(ch) {
			if strings.ContainsRune(vowels, ch) {
				sb.WriteRune('V')
			} else {
				sb.WriteRune('C')
			}
		}
	}
	return sb.String()
}
