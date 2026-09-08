package service

import (
	"os"
	"path/filepath"
	"testing"
)

func TestFileService_ListFiles(t *testing.T) {
	fs := NewFileService()

	// 1. Default should be empty when dirPath is ""
	emptyListing, err := fs.ListFiles("")
	if err != nil {
		t.Fatalf("unexpected error with empty dirPath: %v", err)
	}
	if len(emptyListing.Files) != 0 {
		t.Errorf("expected 0 files for empty dirPath, got %d", len(emptyListing.Files))
	}

	// 2. Test with specific directory
	tempDir, err := os.MkdirTemp("", "gown_ted_test_*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	txtFile := filepath.Join(tempDir, "sample.txt")
	mdFile := filepath.Join(tempDir, "notes.md")
	ignoredFile := filepath.Join(tempDir, "data.json")

	if err := os.WriteFile(txtFile, []byte("plain text content"), 0644); err != nil {
		t.Fatalf("failed to write txt file: %v", err)
	}
	if err := os.WriteFile(mdFile, []byte("# Markdown Header"), 0644); err != nil {
		t.Fatalf("failed to write md file: %v", err)
	}
	if err := os.WriteFile(ignoredFile, []byte(`{"key": "val"}`), 0644); err != nil {
		t.Fatalf("failed to write json file: %v", err)
	}

	listing, err := fs.ListFiles(tempDir)
	if err != nil {
		t.Fatalf("unexpected error listing files in tempDir: %v", err)
	}

	if len(listing.Files) != 2 {
		t.Fatalf("expected 2 files (.txt and .md), got %d", len(listing.Files))
	}

	names := make(map[string]string)
	for _, f := range listing.Files {
		names[f.Name] = f.Extension
	}

	if ext, ok := names["sample.txt"]; !ok || ext != "txt" {
		t.Errorf("expected sample.txt with extension txt, got %q (ok: %v)", ext, ok)
	}
	if ext, ok := names["notes.md"]; !ok || ext != "md" {
		t.Errorf("expected notes.md with extension md, got %q (ok: %v)", ext, ok)
	}
	if _, ok := names["data.json"]; ok {
		t.Errorf("data.json should NOT be included in listing")
	}
}

func TestFileService_ReadFile_WriteFile(t *testing.T) {
	fs := NewFileService()

	tempDir, err := os.MkdirTemp("", "gown_ted_write_*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	filePath := filepath.Join(tempDir, "saved_notes.md")
	writeContent := "# Saved via FileService\n\nContent line 1."

	// Test WriteFile
	if err := fs.WriteFile(filePath, writeContent); err != nil {
		t.Fatalf("failed to write file: %v", err)
	}

	// Test ReadFile
	payload, err := fs.ReadFile(filePath)
	if err != nil {
		t.Fatalf("failed to read back file: %v", err)
	}

	if payload.Content != writeContent {
		t.Errorf("expected content %q, got %q", writeContent, payload.Content)
	}
	if payload.Extension != "md" {
		t.Errorf("expected extension md, got %q", payload.Extension)
	}
	if payload.Name != "saved_notes.md" {
		t.Errorf("expected name saved_notes.md, got %q", payload.Name)
	}

	// Test WriteFile to nested directory
	nestedPath := filepath.Join(tempDir, "sub", "folder", "test.txt")
	if err := fs.WriteFile(nestedPath, "nested text"); err != nil {
		t.Fatalf("failed to write nested file: %v", err)
	}
	nestedPayload, err := fs.ReadFile(nestedPath)
	if err != nil {
		t.Fatalf("failed to read nested file: %v", err)
	}
	if nestedPayload.Content != "nested text" {
		t.Errorf("expected nested content, got %q", nestedPayload.Content)
	}
}
