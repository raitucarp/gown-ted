---
title: "Key Features & Capabilities"
description: "Explore the comprehensive lexical, semantic, and linguistic features built into gown-ted."
weight: 2
---

gown-ted transforms text editing from passive typing into active linguistic exploration. Here is an overview of its core features:

![gown-ted Features Overview](/gown-ted/images/linguistic-analysis.png)

## 1. Modern Activity Bar & Multi-Workspace Architecture

gown-ted introduces a flexible workspace model powered by a 48px vertical dock on the far left:
- 📝 **Editor & Files:** Write with live syntax, auto-saving, tabs, and real-time contextual poetics sidebars.
- 📚 **WordNet Lexical Explorer:** Full dictionary and taxonomy browser spanning all 45 WordNet domain categories.
- 🕸️ **Document Word Graph:** Interactive constellation graph visualizing semantic relationships across your draft.
- **Zero State Loss:** Switching between workspaces preserves your active document, cursor location, text selections, and undo/redo stacks (`Ctrl + Z` / `Ctrl + Y`).

---

## 2. WordNet Lexical Explorer (45 Lexicographer Domains)

- **Complete Lexicographer Indexing:** Browse all 45 Princeton WordNet domain files (`noun.act`, `noun.animal`, `verb.motion`, `verb.cognition`, `adj.pert`, etc.) indexed in-memory.
- **Dynamic Vocabulary Counts:** Live badge statistics reflect the exact number of words matching your search filters in real time.
- **Interactive Autonavigation:** Clicking any taxonomic relation (`hypernym`, `hyponym`, `meronym`, `holonym`) or sense synonym instantly navigates to that word's exact lexicographer domain and entry.
- **Redesigned Sense Cards:** Sense numbers (`#1`, `#2`) are pinned to the top-right corner, domain categories are pinned to the top-left, and vertical POS ribbons feature dedicated lexical icons with clean typography spacing.

![WordNet Lexical Explorer](/gown-ted/images/wordnet-explorer.png)

---

## 3. Interactive Document Word Graph

- **Constellation Point Visualization:** Words are rendered as crisp, delicate points/dots (radius ~2–3px) that maintain ideal proportions across all zoom levels, paired with prominent, readable labels.
- **Multi-Hop Semantic Traversal:** Deep pathfinding traces associative semantic chains connecting seemingly distant words across intermediate synsets and definitions (e.g. connecting *"he"* and *"home"* through conceptual lineages like *person*, *dwelling*, and *structure*).
- **Relationship Badges on Edges:** Every connection line displays an interactive badge identifying the semantic bond (`hypernym`, `hyponym`, `synonym`, `definition`, `antonym`, `path`), color-coded according to the visual legend.
- **Focused Inspection:** Selecting any node highlights all its immediate relations while gently dimming unrelated clusters for effortless comprehension.

![Interactive Document Word Graph](/gown-ted/images/word-graph.png)

---

## 4. WordNet Lexical Intelligence & Disambiguation

- **Princeton WordNet 3.1 & OEWN Integration:** Built-in offline dictionary of over 117,000 synsets and semantic relations.
- **Contextual Sense Disambiguation (Lesk Algorithm):** gown-ted analyzes the surrounding sentence context to automatically rank and recommend the intended word sense with a percentage confidence metric.
- **Polysemy Indicator:** See how many distinct senses a word has, helping you avoid ambiguity or intentionally layer double meanings.
- **Morphological Normalization:** Inflected verbs and plural nouns are resolved to their root lemmas.

---

## 5. Semantic Relations & Ontology Navigator

- **Synonyms by Sense:** Explore synonyms organized by exact meaning rather than a flat, confusing list.
- **Antonyms & Opposites:** Quickly find contrasting vocabulary.
- **Hypernyms & Hyponyms:** Navigate from specific terms up to general abstractions (e.g. *whisper* → *speech* → *communication* → *abstraction* → *entity*).
- **Wu-Palmer Semantic Similarity:** Compute conceptual distance and find the lowest common ancestor between any two concepts.

---

## 6. Real-Time Document Statistics

The status bar at the bottom provides essential metrics for writers and public speakers:
- **Live Counts:** Words, characters (with and without spaces), sentences, and paragraphs.
- **Estimated Reading & Speaking Time:** Accurately gauge presentation length.
- **Vocabulary Richness:** Type-Token Ratio (TTR) measuring lexical diversity and repetition.

---

## 7. Distraction-Free Focus Mode

Press `Ctrl + Shift + F` to collapse all sidebars and toolbars, leaving only your text and your thoughts. Toggle it anytime to bring back the linguistic analysis suite.

