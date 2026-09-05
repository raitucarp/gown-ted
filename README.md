# gown-ted

**gown-ted** (*Go WordNet Text Editor*) is an advanced, desktop-class lexical and linguistic text editor built with **Go** ([Wails v3](https://v3.wails.io/)), [Princeton WordNet](https://wordnet.princeton.edu/) (via [gown](https://github.com/raitucarp/gown)), and **React 19 / TypeScript / Chakra UI v3**.

Designed for writers, linguists, language researchers, poets, and students, gown-ted transforms writing by providing deep lexical insights, sense disambiguation, semantic relations, phonological rhythm, and systemic functional grammar right beside your cursor in real time.

---

## Key Features

### 1. Distraction-Free Rich Text Editor
* **Modern Editor Workspace**: Built on TipTap & ProseMirror with clean typographic hierarchy, custom headings, formatting, and responsive selection handling.
* **Focus Mode**: Hide all sidebars and drawers with a single click or shortcut to immerse yourself entirely in writing.
* **Sample Texts**: Instant access to built-in linguistic corpus samples (Polysemy in English, Architectural Semantics, Nature & Zoology).
* **Live Document Analytics**: Real-time word count, character count, sentence count, paragraph count, estimated reading time, speaking time, and lexical richness (**Type-Token Ratio / TTR**).

### 2. Multimodal Autocomplete & Word Suggestions
* **Thread-Safe Prefix Trie**: Instant searching across ~150,000+ WordNet lemmas and synonyms.
* **Balanced Suggestion Engine**: Blends exact lemma completions, direct synonyms, definition keyword matches, and usage example contexts into a single unified suggestion popup.
* **Intelligent Proper Noun Ranking**: Capitalized words (proper nouns like *March*, *Monday*, *America*) are automatically positioned at the end of suggestion lists so common words take precedence without losing access to named entities.
* **Full Keyboard Navigation**: Navigate suggestions with `ArrowUp`, `ArrowDown`, `Enter`, `Tab`, and dismiss with `Escape`.

### 3. Word Senses & Polysemy Navigator
* **POS Vertical Tabs**: Browse lexical senses categorized cleanly by Part of Speech (*Noun*, *Verb*, *Adjective*, *Adverb*) via an intuitive vertical tab rail with rotated count badges and icons.
* **Word Sense Disambiguation (WSD)**: Automatically detects and highlights the recommended sense in context using the Lesk algorithm against the surrounding sentence.
* **Sense Breakdown**: Detailed definitions, Lexfile semantic domains, Interlingual Index (ILI) references, and confidence scores.
* **Seamless Sense List**: Compact, border-separated list without unnecessary margins for maximum reading density.

### 4. Synonyms by Sense (Synonym Studio)
* **Sense-Partitioned Tabs**: Vertical tab rail on the right side organized per sense (`Sense #1`, `Sense #2`, etc.) with POS-thematic color palettes.
* **Seamless Action-Oriented List**:
  * **Replace Selection**: Substitute the active word with the selected synonym in the editor.
  * **Insert Adjacent**: Insert the synonym right after the active word.
  * **Copy to Clipboard**: Quick copy with visual confirmation.
  * **Inspect in WordNet**: Drill down into the synonym's own lexical entry.

### 5. Morphology & Semantic Relationships
* **Cross-POS Morphological Lemmatization**: Automatically resolves inflected forms (*running* &rarr; *run*, *geese* &rarr; *goose*, *better* &rarr; *good*).
* **Relational Vertical Rail**:
  * **Lemma Normalization**: Base stems and canonical forms.
  * **Antonyms**: Opposites and contrasting concepts.
  * **Hypernyms**: Broader taxonomic categories (*dog* &rarr; *canine* &rarr; *carnivore*).
  * **Hyponyms**: More specific sub-concepts (*money* &rarr; *cash*, *currency*, *dough*).
  * **Meronyms**: Constituent parts and member components (*car* &rarr; *accelerator*, *engine*).
* Direct substitution buttons for all relational concepts.

### 6. Rhythm, Rhymes & Poetics Explorer
* **Sticky-Top Search Bar**: Quick rhyme and poetic search bar fixed at the top of the panel, remaining accessible while scrolling through long match lists.
* **Rhyme Discovery**: Phonetic ending (rime/coda) matching with highlighted rhyme segments.
* **Alliteration Discovery**: Onset consonant cluster matching.
* **Consonant-Vowel (CV) Rhythm Meter**: Cadence and syllable structure similarity matching.
* **Syllable Filters**: Instant meter filtering (`All`, `1 Syl`, `2 Syl`, `3+ Syl`).
* **Seamless Poetic List**: Compact rows with word inspection, insertion, and replacement actions.

### 7. Linguistic & Deep Semantic Analysis
* **Systemic Functional Linguistics (SFL)**: Clause information structure breakdown into **Theme** (starting point) and **Rheme** (new information).
* **Pragmatics & Speech Acts**: Automatic illocutionary act categorization, politeness markers, epistemic modality, and sentiment polarity.
* **Discourse & Cohesion**: Detection of logical connectors, transitional phrases, lexical repetition, and grammatical cohesion.
* **Definition & Usage Examples**: Side-by-side horizontal cards displaying formal definitions and attested usage quotations.

### 8. Semantic Similarity Calculator
* Computes **Wu-Palmer Semantic Similarity** between any two words using taxonomy depth and least common subsumer path lengths in the WordNet ontology.

---

## Architecture & Technology Stack

```
gown-ted/
├── pkg/                      # Modular Golang Domain Packages
│   ├── analyzer/             # Morphological, sense, WSD, and discourse orchestrator
│   ├── models/               # Domain models and DTOs
│   ├── phonology/            # Syllables and Consonant-Vowel (CV) pattern analysis
│   ├── poetics/              # Rhyme endings, onsets, and candidate ranking
│   ├── similarity/           # Wu-Palmer semantic similarity
│   ├── stats/                # Document counts, reading time, and lexical richness
│   ├── suggester/            # Multimodal autocomplete and suggestion quotas
│   └── trie/                 # Thread-safe prefix trie
├── service/                  # Exported Wails Service Handlers
│   ├── analyze_document.go   # Document statistics
│   ├── analyze_word.go       # Deep word analysis
│   ├── calculate_similarity.go # Semantic similarity
│   ├── get_poetic_suggestions.go # Rhymes and cadence
│   ├── get_suggestions.go    # Autocomplete suggestions
│   └── init.go               # WordNet background indexing
├── ui/                       # Atomic React 19 / TypeScript Frontend
│   ├── bindings/             # Auto-generated Wails v3 bindings
│   └── src/
│       ├── components/
│       │   ├── atoms/        # Micro UI elements (Resize handles, status indicators)
│       │   ├── editor/       # TipTap editor workspace and suggestion popup
│       │   ├── layout/       # App toolbar, status bar, and container frames
│       │   ├── organisms/    # Bottom drawer and composite widgets
│       │   ├── panels/       # Definition, Senses, Synonyms, Poetics, Relations
│       │   └── ui/           # Chakra UI v3 components & custom scroll areas
│       ├── hooks/            # Custom hooks (word analysis, stats, editor actions)
│       ├── utils/            # Lexical icon helpers and formatters
│       ├── constants/        # Sample texts and app configurations
│       └── types/            # TypeScript interfaces and domain types
└── main.go                   # Wails v3 application entry point
```

### Core Technologies:
* **Backend**: [Go](https://golang.org/) 1.23+, [Wails v3](https://v3.wails.io/), [gown](https://github.com/raitucarp/gown) (Pure Go Princeton WordNet 3.1 parser).
* **Frontend**: [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [Chakra UI v3](https://chakra-ui.com/), [TipTap](https://tiptap.dev/), [Lucide Icons](https://lucide.dev/).

---

## Getting Started

### Prerequisites
* **Go**: Version 1.23 or newer.
* **Node.js**: Version 20.x or newer (with `npm`).
* **Wails v3 CLI**: Installed and accessible in your `PATH`.

### Development Mode

1. Install frontend dependencies:
   ```bash
   cd ui
   npm install
   cd ..
   ```

2. Run the application with hot-reloading:
   ```bash
   wails3 dev
   ```

### Building for Production

Compile a native standalone desktop executable:
```bash
wails3 build
```
The resulting binary will be generated in the `build/bin` directory.

### Running Tests

Run the full Go test suite:
```bash
go test -v ./...
```

Run frontend typecheck and build validation:
```bash
cd ui
npm run build
```

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
Princeton WordNet is subject to the [WordNet 3.0 License](https://wordnet.princeton.edu/license-and-commercial-use).
