package models

// FileItem represents a discovered file in the current directory.
type FileItem struct {
	Name      string `json:"name"`
	Path      string `json:"path"`
	Extension string `json:"extension"`
	Size      int64  `json:"size"`
	ModTime   int64  `json:"modTime"`
}

// DirectoryListing contains files in the current directory.
type DirectoryListing struct {
	CurrentDir string     `json:"currentDir"`
	DirName    string     `json:"dirName"`
	Files      []FileItem `json:"files"`
}

// FileContentPayload represents the retrieved content of a file.
type FileContentPayload struct {
	Name      string `json:"name"`
	Path      string `json:"path"`
	Extension string `json:"extension"`
	Content   string `json:"content"`
	Size      int64  `json:"size"`
}
