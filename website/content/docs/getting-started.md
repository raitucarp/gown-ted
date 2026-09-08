---
title: "Getting Started with gown-ted"
description: "How to download, install, and start writing with gown-ted on Windows, macOS, and Linux."
weight: 1
---

Welcome to **gown-ted** — the intelligent desktop text editor combining distraction-free writing with real-time computational linguistics and Princeton WordNet 3.1 ontology.

![gown-ted Hero Editor](/gown-ted/images/hero-editor.png)

## System Requirements

- **Windows:** Windows 10/11 64-bit (WebView2 Runtime preinstalled on modern Windows)
- **macOS:** macOS 12+ (Apple Silicon or Intel)
- **Linux:** Ubuntu 22.04+, Fedora 38+, Arch Linux (WebKit2GTK 4.1)

---

## Installation

### Windows (.exe / Portable Zip)
1. Download the latest `gown-ted-windows-amd64.zip` from [GitHub Releases](https://github.com/raitucarp/gown-ted/releases/latest).
2. Extract the archive to any folder (e.g. `C:\Program Files\gown-ted` or your portable apps folder).
3. Double-click `gown-ted.exe` to run. No external internet connection or configuration required!

### macOS & Linux (Building from Source)
If you are developing or running on macOS/Linux:

```bash
# Clone the repository
git clone https://github.com/raitucarp/gown-ted.git
cd gown-ted

# Install frontend dependencies
cd ui && npm install && npm run build && cd ..

# Run with Wails v3
wails3 dev
# Or build a standalone binary
wails3 build
```

---

## First Steps in the Editor

1. **Create or Open a File:** Use `Ctrl + N` (`Cmd + N` on macOS) to open a new document tab, or `Ctrl + O` to open existing `.md` or `.txt` files.
2. **Type or Paste Your Prose:** Start writing. The status bar at the bottom will immediately update with live word count, character metrics, reading time, and vocabulary richness.
3. **Inspect Any Word:** Double-click or move your cursor to any English word. The left sidebar immediately displays:
   - Part of Speech breakdown (`Noun`, `Verb`, `Adjective`, `Adverb`)
   - Recommended synset sense resolved by the Lesk WSD algorithm
   - Lemmatized base forms
4. **Explore Rhymes & Poetics:** Check the right sidebar to instantly see matching rhymes, alliteration clusters, and syllable counts.
5. **Expand Linguistic Analysis:** Click **"Expand Panel"** at the bottom to explore deep Theme/Rheme sentence functional grammar and Pragmatic speech acts.
