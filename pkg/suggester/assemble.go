package suggester

import (
	"strings"
	"unicode"

	"github.com/raitucarp/gown-ted/pkg/models"
)

// isCapitalized returns true if the word starts with a capital letter, or contains uppercase proper noun characters.
func isCapitalized(word string) bool {
	trimmed := strings.TrimSpace(word)
	if trimmed == "" {
		return false
	}
	for _, r := range trimmed {
		if unicode.IsLetter(r) {
			return unicode.IsUpper(r)
		}
		break
	}
	for _, r := range trimmed {
		if unicode.IsUpper(r) {
			return true
		}
	}
	return false
}

// partitionByCapital separates a list of items into non-capitalized and capitalized slices.
func partitionByCapital(items []models.SuggestionItem) (normal, capitalized []models.SuggestionItem) {
	for _, it := range items {
		if isCapitalized(it.Word) {
			capitalized = append(capitalized, it)
		} else {
			normal = append(normal, it)
		}
	}
	return normal, capitalized
}

// Assemble compiles and balances suggestion candidates according to limits and category quotas.
// Lowercase words are given primary priority. Words starting with a capital letter
// are preserved and placed at the very end of the resulting list.
func Assemble(limit int, exactItem *models.SuggestionItem, prefixItems, synonymItems, defItems, exItems, substringItems []models.SuggestionItem) []models.SuggestionItem {
	var exactNormal *models.SuggestionItem
	var exactCap *models.SuggestionItem
	if exactItem != nil {
		if isCapitalized(exactItem.Word) {
			exactCap = exactItem
		} else {
			exactNormal = exactItem
		}
	}

	prefixNorm, prefixCap := partitionByCapital(prefixItems)
	synNorm, synCap := partitionByCapital(synonymItems)
	defNorm, defCap := partitionByCapital(defItems)
	exNorm, exCap := partitionByCapital(exItems)
	subNorm, subCap := partitionByCapital(substringItems)

	// Gather all capitalized candidates in category order
	var capPool []models.SuggestionItem
	if exactCap != nil {
		capPool = append(capPool, *exactCap)
	}
	capPool = append(capPool, prefixCap...)
	capPool = append(capPool, synCap...)
	capPool = append(capPool, defCap...)
	capPool = append(capPool, exCap...)
	capPool = append(capPool, subCap...)

	// Reserve up to capQuota slots (e.g. up to 3-4 items) for capitalized candidates
	// so they are not starved out by lowercase words, but placed at the very end.
	capQuota := 0
	if len(capPool) > 0 {
		capQuota = min(3, len(capPool))
		if limit >= 20 {
			capQuota = min(4, len(capPool))
		}
	}
	normalTarget := limit - capQuota

	var normalResults []models.SuggestionItem
	if exactNormal != nil {
		normalResults = append(normalResults, *exactNormal)
	}

	takePrefix := min(4, len(prefixNorm))
	normalResults = append(normalResults, prefixNorm[:takePrefix]...)
	prefixNorm = prefixNorm[takePrefix:]

	takeSyn := min(3, len(synNorm))
	normalResults = append(normalResults, synNorm[:takeSyn]...)
	synNorm = synNorm[takeSyn:]

	takeDef := min(3, len(defNorm))
	normalResults = append(normalResults, defNorm[:takeDef]...)
	defNorm = defNorm[takeDef:]

	takeEx := min(3, len(exNorm))
	normalResults = append(normalResults, exNorm[:takeEx]...)
	exNorm = exNorm[takeEx:]

	takeSub := min(2, len(subNorm))
	normalResults = append(normalResults, subNorm[:takeSub]...)
	subNorm = subNorm[takeSub:]

	for len(normalResults) < normalTarget && len(prefixNorm) > 0 {
		normalResults = append(normalResults, prefixNorm[0])
		prefixNorm = prefixNorm[1:]
	}
	for len(normalResults) < normalTarget && len(synNorm) > 0 {
		normalResults = append(normalResults, synNorm[0])
		synNorm = synNorm[1:]
	}
	for len(normalResults) < normalTarget && len(defNorm) > 0 {
		normalResults = append(normalResults, defNorm[0])
		defNorm = defNorm[1:]
	}
	for len(normalResults) < normalTarget && len(exNorm) > 0 {
		normalResults = append(normalResults, exNorm[0])
		exNorm = exNorm[1:]
	}
	for len(normalResults) < normalTarget && len(subNorm) > 0 {
		normalResults = append(normalResults, subNorm[0])
		subNorm = subNorm[1:]
	}

	// Take the allocated capitalized items to be placed at the very end
	var takenCap []models.SuggestionItem
	for len(takenCap) < capQuota && len(capPool) > 0 {
		takenCap = append(takenCap, capPool[0])
		capPool = capPool[1:]
	}

	// Fill any remaining slots if normal pools still have items
	for len(normalResults)+len(takenCap) < limit && len(prefixNorm) > 0 {
		normalResults = append(normalResults, prefixNorm[0])
		prefixNorm = prefixNorm[1:]
	}
	for len(normalResults)+len(takenCap) < limit && len(synNorm) > 0 {
		normalResults = append(normalResults, synNorm[0])
		synNorm = synNorm[1:]
	}
	for len(normalResults)+len(takenCap) < limit && len(defNorm) > 0 {
		normalResults = append(normalResults, defNorm[0])
		defNorm = defNorm[1:]
	}
	for len(normalResults)+len(takenCap) < limit && len(exNorm) > 0 {
		normalResults = append(normalResults, exNorm[0])
		exNorm = exNorm[1:]
	}
	for len(normalResults)+len(takenCap) < limit && len(subNorm) > 0 {
		normalResults = append(normalResults, subNorm[0])
		subNorm = subNorm[1:]
	}

	// If still not at limit, fill from remaining capPool
	for len(normalResults)+len(takenCap) < limit && len(capPool) > 0 {
		takenCap = append(takenCap, capPool[0])
		capPool = capPool[1:]
	}

	// Append capitalized items strictly at the end
	return append(normalResults, takenCap...)
}
