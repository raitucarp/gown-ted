package service

import (
	"testing"
	"time"
)

func TestLexicalService(t *testing.T) {
	service := NewLexicalService()

	// Wait up to 5 seconds for background trie initialization
	deadline := time.Now().Add(5 * time.Second)
	for !service.IsReady() && time.Now().Before(deadline) {
		time.Sleep(100 * time.Millisecond)
	}

	if !service.IsReady() {
		t.Fatalf("LexicalService failed to initialize within deadline")
	}

	// Wait brief moment for trie indexing
	time.Sleep(500 * time.Millisecond)

	// Test Suggestions
	suggestions := service.GetSuggestions("appre", 5)
	if len(suggestions) == 0 {
		t.Errorf("expected suggestions for 'appre', got none")
	} else {
		t.Logf("Found %d suggestions for 'appre': %s", len(suggestions), suggestions[0].Word)
	}

	// Test Suggestions for full word (Definition & Example words)
	conundrumSug := service.GetSuggestions("conundrum", 10)
	t.Logf("Found %d suggestions for 'conundrum':", len(conundrumSug))
	for _, s := range conundrumSug {
		t.Logf("  - %s (%s): %s", s.Word, s.Source, s.Gloss)
	}
	if len(conundrumSug) == 0 {
		t.Errorf("expected suggestions for 'conundrum', got none")
	}

	// Test Suggestions for 'bright'
	brightSug := service.GetSuggestions("bright", 20)
	t.Logf("Found %d suggestions for 'bright':", len(brightSug))
	var hasLemma, hasSynonym, hasDefOrEx bool
	for _, s := range brightSug {
		t.Logf("  - %s (%s): %s", s.Word, s.Source, s.Gloss)
		if s.Source == "Lemma" {
			hasLemma = true
		}
		if s.Source == "Synonym" {
			hasSynonym = true
		}
		if s.Source == "Definition" || s.Source == "Example" {
			hasDefOrEx = true
		}
	}
	if !hasLemma || !hasSynonym || !hasDefOrEx {
		t.Errorf("expected 'bright' to have Lemma, Synonym, and Definition/Example suggestions; got lemma=%v, syn=%v, def/ex=%v",
			hasLemma, hasSynonym, hasDefOrEx)
	}

	// Test Suggestions for highlighted prefix 'bri'
	briSug := service.GetSuggestions("bri", 20)
	t.Logf("Found %d suggestions for 'bri':", len(briSug))
	for _, s := range briSug {
		t.Logf("  - %s (%s): %s", s.Word, s.Source, s.Gloss)
	}
	if len(briSug) == 0 {
		t.Errorf("expected suggestions for prefix 'bri', got none")
	}

	// Test Word Analysis with WSD
	analysis := service.AnalyzeWord("bank", "She deposited money in her account at the bank.", 1)
	if !analysis.Found {
		t.Fatalf("expected word 'bank' to be found")
	}
	if len(analysis.Senses) == 0 {
		t.Fatalf("expected senses for 'bank', got none")
	}
	t.Logf("Word: %s, Primary Lemma: %s, Senses: %d, WSD Confidence: %.2f",
		analysis.Word, analysis.PrimaryLemma, len(analysis.Senses), analysis.WSDConfidence)

	// Test Similarity
	sim := service.CalculateSimilarity("dog", "wolf")
	if sim.Error != "" {
		t.Errorf("unexpected error calculating similarity: %v", sim.Error)
	}
	t.Logf("Similarity dog <-> wolf: %.3f (%s)", sim.Score, sim.Metric)

	// Test Document Stats
	stats := service.AnalyzeDocument("This is a quick test sentence. And here is a second one with great vocabulary!")
	if stats.Words != 15 || stats.Sentences != 2 {
		t.Errorf("unexpected doc stats: words=%d, sentences=%d", stats.Words, stats.Sentences)
	}
	t.Logf("Doc Stats: words=%d, chars=%d, sentences=%d, readingTime=%.1f min",
		stats.Words, stats.Characters, stats.Sentences, stats.ReadingTimeMinutes)

	// Test Poetic Suggestions (Rhymes, Alliterations, CV rhythm)
	poetics := service.GetPoeticSuggestions("bright")
	t.Logf("Poetics for 'bright': RhymeEnding=%s, Onset=%s, Syllables=%d, CV=%s",
		poetics.RhymeEnding, poetics.OnsetCluster, poetics.SyllableCount, poetics.CVPattern)
	t.Logf("  Rhymes count: %d", len(poetics.Rhymes))
	for i, r := range poetics.Rhymes {
		if i < 5 {
			t.Logf("    - %s (%d syl, %s): %s", r.Word, r.SyllableCount, r.POS, r.Gloss)
		}
	}
	t.Logf("  Alliterations count: %d", len(poetics.Alliterations))
	for i, a := range poetics.Alliterations {
		if i < 5 {
			t.Logf("    - %s (%d syl): %s", a.Word, a.SyllableCount, a.Gloss)
		}
	}
	t.Logf("  CVSimilar count: %d", len(poetics.CVSimilar))

	if len(poetics.Rhymes) == 0 {
		t.Errorf("expected rhymes for 'bright', got none")
	}
	if len(poetics.Alliterations) == 0 {
		t.Errorf("expected alliterations for 'bright', got none")
	}

	// Verify words mentioned by user: "she", "the", "money"
	sheRes := service.AnalyzeWord("she", "She had a bright idea.", 1)
	if sheRes.Found {
		t.Errorf("expected 'she' not to be found in WordNet")
	}

	theRes := service.AnalyzeWord("the", "The bright sunlight warmed the room.", 2)
	if theRes.Found {
		t.Errorf("expected 'the' not to be found in WordNet")
	}

	moneyRes := service.AnalyzeWord("money", "I deposited money into the bank.", 3)
	if !moneyRes.Found {
		t.Errorf("expected 'money' to be found in WordNet")
	}
	if len(moneyRes.Senses) == 0 {
		t.Errorf("expected senses for 'money', got none")
	}

	// Test GetLexFiles
	lexFiles := service.GetLexFiles()
	t.Logf("Total LexFiles indexed: %d", len(lexFiles))
	if len(lexFiles) == 0 {
		t.Errorf("expected LexFiles to be indexed, got 0")
	}

	// Test GetWordsByLexFile
	animals := service.GetWordsByLexFile("noun.animal", "", 20)
	t.Logf("Found %d words in noun.animal", len(animals))
	if len(animals) == 0 {
		t.Errorf("expected words in noun.animal, got none")
	} else {
		t.Logf("  First animal: %s (%s) - %s", animals[0].Word, animals[0].POS, animals[0].Definition)
	}

	filteredAnimals := service.GetWordsByLexFile("noun.animal", "cat", 10)
	t.Logf("Filtered 'cat' in noun.animal: %d matches", len(filteredAnimals))
	if len(filteredAnimals) == 0 {
		t.Errorf("expected matches for 'cat' in noun.animal")
	}

	// Test GetDocumentWordGraph
	docWords := []string{"cat", "dog", "animal", "wolf", "pet", "hound", "puppy", "bark"}
	graph := service.GetDocumentWordGraph(docWords)
	t.Logf("Graph nodes: %d, edges: %d", len(graph.Nodes), len(graph.Edges))
	if len(graph.Nodes) == 0 {
		t.Errorf("expected graph nodes for docWords")
	}
	if len(graph.Edges) == 0 {
		t.Errorf("expected graph edges connecting docWords")
	}
	for i, e := range graph.Edges {
		if i < 5 {
			t.Logf("  Edge %s -[%s]-> %s", e.Source, e.Label, e.Target)
		}
	}

	// Test FindWordLocation
	loc := service.FindWordLocation("punish")
	if loc == nil {
		t.Errorf("expected to find word location for 'punish'")
	} else {
		t.Logf("Found 'punish' in LexFile: %s, POS: %s, SynsetID: %s", loc.LexFile, loc.POS, loc.SynsetID)
		if loc.LexFile == "" {
			t.Errorf("expected non-empty LexFile for 'punish'")
		}
	}

	loc2 := service.FindWordLocation("avenged")
	if loc2 == nil {
		t.Errorf("expected to find word location for 'avenged'")
	} else {
		t.Logf("Found 'avenged' in LexFile: %s, POS: %s", loc2.LexFile, loc2.POS)
		if loc2.LexFile != "adj.ppl" && loc2.LexFile != "verb.social" {
			t.Logf("Note: 'avenged' is in LexFile %s", loc2.LexFile)
		}
	}
}
