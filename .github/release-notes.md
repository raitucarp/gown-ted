# gown-ted v0.2.0: The Lexical Constellation & Multi-Hop WordNet Explorer 🌌✨

Welcome to **gown-ted v0.2.0**—a monumental leap forward in transforming your writing environment into an intelligent semantic observatory. 

In this major release, we bridge the intimate act of writing with the vast, interconnected universe of the English lexicon. Whether you are crafting verse, essays, or fiction, **gown-ted** now allows you to navigate the entire 45-domain taxonomy of Princeton WordNet, visualize the hidden semantic threads connecting words in your draft through interactive multi-hop graphs, and enjoy a polished, distraction-free desktop interface built for creators.

---

## 🌟 What's New in v0.2.0

### 🚀 1. The Activity Bar (Visual Studio Code-Style Navigation)
* **Dedicated Left Dock**: A sleek 48px vertical dock on the left side of the workspace providing one-click switching between distinct creative contexts.
* **Three Core Workspaces**:
  * 📝 **Editor & Files**: Pure, focused writing canvas with document tabs, file browser, and poetics sidebars.
  * 📚 **WordNet Lexical Explorer**: Comprehensive lexicographical dictionary and ontology browser across all WordNet domains.
  * 🕸️ **Document Word Graph**: Interactive semantic graph visualizing words from your current document.
* **Streamlined Sidebar Control**: Toggle sidebars with clean collapse to 0px, maximizing screen real estate for your writing.

### 📚 2. WordNet Lexical Explorer & 45 Lexicographer Files
* **Full Lexicographer File Indexing**: Explore all 45 Princeton WordNet domain files (`noun.act`, `noun.animal`, `verb.motion`, `verb.cognition`, `adj.pert`, etc.) indexed in-memory with real-time word statistics.
* **Dynamic Vocabulary Counts**: Live badge counts reflect exact vocabulary counts in each lexical domain as you filter and search.
* **Interactive Autonavigation**: Clicking any taxonomic relation (`hypernym`, `hyponym`, `meronym`, `holonym`) or sense synonym instantly navigates to that word's exact lexicographer domain and entry.
* **Revamped Card Layouts**:
  * **Absolute Badges**: Sense numbers (`#1`, `#2`) are pinned at the top-right corner; LexFile domain categories sit pinned at the top-left corner.
  * **Vertical POS Ribbons with Icons**: Clean vertical tags indicate Part of Speech (`noun`, `verb`, `adj`, `adv`) alongside dedicated lexical icons.
  * **Protected Text Layout**: Safe padding ensures long definitions and usage examples never collide with badges or ribbons.

### 🕸️ 3. Document Word Graph (Points, Multi-Hop Paths & Edge Relations)
* **Constellation Dot Visualization**: Nodes are now rendered as crisp, delicate points/dots (radius ~2–3px) that stay sharp at any zoom level, paired with prominent, highly legible word labels.
* **Multi-Hop Semantic Traversal**: Deep pathfinding algorithm traces associative semantic chains connecting seemingly distant words across intermediate synsets and definitions (e.g. connecting *"he"* and *"home"* through conceptual lineages like *person*, *dwelling*, and *structure*).
* **Relationship Badges on Edges**: Every connection line displays an interactive badge identifying the semantic bond (`hypernym`, `hyponym`, `synonym`, `definition`, `antonym`, `path`), color-coded according to the visual legend.
* **Focused Inspection**: Selecting any node highlights all its immediate relations while gently dimming unrelated clusters for effortless comprehension.

### 💾 4. Persistent Editor State & Seamless Tab Switching
* **Zero Text Loss**: Switching between the Editor, Lexical Explorer, and Word Graph preserves your active document, cursor position, selection range, and full `Ctrl+Z` / `Ctrl+Y` undo history.
* **Instant Insert**: Insert synonyms or explored words directly into your text with a single click.

---

## 📦 Native Installers & Downloads

With **v0.2.0**, we now provide official native **installers** for all major desktop platforms alongside standalone portable archives:

| Platform | Installer Package | Portable Archive | Notes |
| :--- | :--- | :--- | :--- |
| **🪟 Windows (x64)** | **`gown-ted-amd64-installer.exe`** (NSIS Setup) | `gown-ted-windows-amd64.zip` | Full Start Menu & Desktop shortcuts, automatic WebView2 setup |
| **🍏 macOS (Apple Silicon / ARM64)** | **`gown-ted-macos-arm64.dmg`** (Disk Image) | `gown-ted-macos-arm64.tar.gz` | Drag-and-drop installer into `/Applications` |
| **🐧 Linux (x86_64)** | **`gown-ted-linux-amd64.deb`** / **`gown-ted-linux-amd64.rpm`** | `gown-ted-linux-amd64.tar.gz` | Desktop entry & icon integration (requires GTK4 & WebKitGTK 6.0) |

---

## ☕ Support the Journey

**gown-ted** is an independent, open-source endeavor built out of love for linguistics, literature, and software craft. 

If gown-ted inspires your writing, enriches your vocabulary, or enhances your creative workflow, please consider supporting its continued evolution:

👉 **[Support raitucarp on Ko-fi (Buy Me a Coffee)](https://ko-fi.com/raitucarp)**

*Thank you for writing with gown-ted!* 🖋️✨
