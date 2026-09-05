package trie

import "testing"

func TestTrie(t *testing.T) {
	tr := NewPrefixTrie()
	tr.Insert("apple", "apple", "noun", "a fruit", 1)
	tr.Insert("application", "application", "noun", "software", 2)
	tr.Insert("apply", "apply", "verb", "to put to use", 1)

	res := tr.Search("app", 10)
	if len(res) != 3 {
		t.Fatalf("expected 3 results for 'app', got %d", len(res))
	}

	resLimited := tr.Search("app", 2)
	if len(resLimited) != 2 {
		t.Fatalf("expected 2 results for limit 2, got %d", len(resLimited))
	}

	none := tr.Search("xyz", 10)
	if len(none) != 0 {
		t.Fatalf("expected 0 results for 'xyz', got %d", len(none))
	}
}
