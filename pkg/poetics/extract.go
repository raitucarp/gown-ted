package poetics

import (
	"strings"
	"unicode"

	"github.com/raitucarp/gown/phonology"
)

// ExtractRhymeEnding extracts the nucleus+coda of the final syllable or trailing vowel group.
func ExtractRhymeEnding(clean string, sylls []phonology.Syllable) string {
	if len(sylls) > 0 {
		lastSyl := sylls[len(sylls)-1]
		ending := strings.ToLower(lastSyl.Nucleus + lastSyl.Coda)
		if ending != "" {
			return ending
		}
	}

	vowels := "aeiouy"
	lastVowelIdx := -1
	for i := len(clean) - 1; i >= 0; i-- {
		if strings.ContainsRune(vowels, rune(clean[i])) {
			lastVowelIdx = i
			break
		}
	}
	if lastVowelIdx >= 0 {
		startVowel := lastVowelIdx
		for startVowel > 0 && strings.ContainsRune(vowels, rune(clean[startVowel-1])) {
			startVowel--
		}
		return clean[startVowel:]
	}
	return clean
}

// ExtractOnsetCluster extracts the consonant cluster preceding the first vowel.
func ExtractOnsetCluster(clean string, sylls []phonology.Syllable) string {
	if len(sylls) > 0 {
		firstSyl := sylls[0]
		onset := strings.ToLower(firstSyl.Onset)
		if onset != "" {
			return onset
		}
	}

	vowels := "aeiouy"
	firstVowelIdx := -1
	for i := 0; i < len(clean); i++ {
		if strings.ContainsRune(vowels, rune(clean[i])) {
			firstVowelIdx = i
			break
		}
	}
	if firstVowelIdx > 0 {
		return clean[:firstVowelIdx]
	}
	return ""
}

// GetRhymeAliases returns phonetic rhyme endings equivalent to the given ending.
func GetRhymeAliases(rhymeEnding string) []string {
	var aliases []string
	aliases = append(aliases, rhymeEnding)
	if rhymeEnding == "ight" {
		aliases = append(aliases, "ite")
	} else if rhymeEnding == "ite" {
		aliases = append(aliases, "ight")
	} else if rhymeEnding == "ain" {
		aliases = append(aliases, "ane")
	} else if rhymeEnding == "ane" {
		aliases = append(aliases, "ain")
	} else if rhymeEnding == "ay" {
		aliases = append(aliases, "ey")
	}
	return aliases
}

// IsPureLetters checks if word contains only alphabetic characters.
func IsPureLetters(s string) bool {
	for _, r := range s {
		if !unicode.IsLetter(r) {
			return false
		}
	}
	return true
}
