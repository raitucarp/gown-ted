package service

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/raitucarp/gown-ted/pkg/models"
)

// FileService provides local filesystem operations for text and markdown documents.
type FileService struct{}

// NewFileService creates a new FileService instance.
func NewFileService() *FileService {
	return &FileService{}
}

// GetWorkingDir returns the current working directory path.
func (s *FileService) GetWorkingDir() (string, error) {
	wd, err := os.Getwd()
	if err != nil {
		return "", err
	}
	return wd, nil
}

// ListFiles lists .txt and .md files in the specified directory.
// If dirPath is empty, returns an empty listing (default state).
func (s *FileService) ListFiles(dirPath string) (*models.DirectoryListing, error) {
	targetDir := strings.TrimSpace(dirPath)
	if targetDir == "" {
		return &models.DirectoryListing{
			CurrentDir: "",
			DirName:    "",
			Files:      make([]models.FileItem, 0),
		}, nil
	}

	entries, err := os.ReadDir(targetDir)
	if err != nil {
		return nil, fmt.Errorf("failed to read directory %q: %w", targetDir, err)
	}

	files := make([]models.FileItem, 0)
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		ext := strings.ToLower(filepath.Ext(entry.Name()))
		if ext == ".txt" || ext == ".md" {
			info, err := entry.Info()
			if err != nil {
				continue
			}
			cleanExt := strings.TrimPrefix(ext, ".")
			files = append(files, models.FileItem{
				Name:      entry.Name(),
				Path:      filepath.Join(targetDir, entry.Name()),
				Extension: cleanExt,
				Size:      info.Size(),
				ModTime:   info.ModTime().Unix(),
			})
		}
	}

	return &models.DirectoryListing{
		CurrentDir: targetDir,
		DirName:    filepath.Base(targetDir),
		Files:      files,
	}, nil
}

// ReadFile reads the content of a .txt or .md file from the specified path.
func (s *FileService) ReadFile(filePath string) (*models.FileContentPayload, error) {
	ext := strings.ToLower(filepath.Ext(filePath))
	if ext != ".txt" && ext != ".md" {
		return nil, fmt.Errorf("unsupported file extension %q, only .txt and .md are supported", ext)
	}

	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	info, err := os.Stat(filePath)
	var size int64
	if err == nil {
		size = info.Size()
	} else {
		size = int64(len(data))
	}

	return &models.FileContentPayload{
		Name:      filepath.Base(filePath),
		Path:      filePath,
		Extension: strings.TrimPrefix(ext, "."),
		Content:   string(data),
		Size:      size,
	}, nil
}

// WriteFile writes the given content to a file at filePath.
func (s *FileService) WriteFile(filePath string, content string) error {
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	if err := os.WriteFile(filePath, []byte(content), 0644); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	return nil
}
