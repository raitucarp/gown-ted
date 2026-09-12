---
title: "Getting Started with gown-ted"
description: "How to download, install, and start writing with gown-ted on Windows, macOS, and Linux."
weight: 1
---

Welcome to **gown-ted** — the intelligent desktop text editor combining distraction-free writing with real-time computational linguistics and Princeton WordNet 3.1 ontology.

![gown-ted Hero Editor](/gown-ted/images/hero-editor.png)

## System Requirements
 
 - **Windows:** Windows 10/11 64-bit (WebView2 Runtime preinstalled on modern Windows)
 - **macOS:** macOS 12+ (Apple Silicon or Intel 64-bit)
 - **Linux:** Ubuntu 22.04+, Debian 12+, Fedora 38+, Arch Linux (GTK4 & WebKitGTK 6.0)
 
 ---
 
 ## Installation
 
 ### 🪟 Windows (.exe Installer or Portable Zip)
 - **Installer (Recommended):** Download `gown-ted-amd64-installer.exe` from [GitHub Releases](https://github.com/raitucarp/gown-ted/releases/latest). Run the setup wizard to install with Start Menu and Desktop shortcuts.
 - **Portable Zip:** Download `gown-ted-windows-amd64.zip`, extract to any folder, and double-click `gown-ted.exe`.
 
 ### 🍏 macOS (Apple Silicon / ARM64 DMG)
 - **DMG Installer:** Download `gown-ted-macos-arm64.dmg` from [GitHub Releases](https://github.com/raitucarp/gown-ted/releases/latest). Double-click the DMG to open it, then drag `gown-ted.app` into your `/Applications` folder.
 - **Portable Archive:** Download `gown-ted-macos-arm64.tar.gz` and extract the `.app` bundle.
 
 ### 🐧 Linux (.deb / .rpm / Tarball)
 - **Ubuntu / Debian / Mint:** Download `gown-ted-linux-amd64.deb` and install using:
   ```bash
   sudo dpkg -i gown-ted-linux-amd64.deb
   ```
 - **Fedora / RHEL / AlmaLinux:** Download `gown-ted-linux-amd64.rpm` and install using:
   ```bash
   sudo rpm -i gown-ted-linux-amd64.rpm
   ```
 - **Standalone Archive:** Download `gown-ted-linux-amd64.tar.gz`, extract the archive, and run `./bin/gown-ted`.
 
 ---
 
 ## Navigating Workspaces (The Activity Bar)
 
 gown-ted features a modern 48px Activity Bar on the far-left border, allowing you to seamlessly switch creative contexts without losing any text or cursor positions:
 
 1. 📝 **Editor & Files:** The core writing studio. Use `Ctrl + N` (`Cmd + N` on macOS) to open new tabs, manage files, and inspect contextual word senses and poetics metrics.
 2. 📚 **WordNet Lexical Explorer:** Full dictionary and taxonomy browser spanning all 45 WordNet domain categories. Click any taxonomic tag or synonym to jump directly to its entry.
 3. 🕸️ **Document Word Graph:** An interactive semantic network that graphs every word in your active draft as a constellation of points, with clickable multi-hop pathways and edge relationship labels.
 
 ![WordNet Lexical Explorer](/gown-ted/images/wordnet-explorer.png)
 
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
