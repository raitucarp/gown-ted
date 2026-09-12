import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const websiteImagesDir = path.resolve(__dirname, '../../website/static/images');
const docsImagesDir = path.resolve(__dirname, '../../docs/images');

fs.mkdirSync(websiteImagesDir, { recursive: true });
fs.mkdirSync(docsImagesDir, { recursive: true });

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.json': 'application/json',
};

const mockAnalysisResult = {
  requestId: 1,
  word: "whisper",
  found: true,
  primaryLemma: "whisper",
  senses: [
    {
      synsetOffset: 1042301,
      pos: "noun",
      lexicalFileNum: 10,
      lexicalFileName: "noun.communication",
      definition: "speaking softly without vibration of the vocal cords; a low, confidential murmur",
      examples: [
        "she spoke in a gentle whisper so as not to wake the sleeping child",
        "the wind was barely a whisper through the towering pine needles"
      ],
      lemmas: ["whisper", "whispering", "murmur", "susurrus"],
      hypernyms: ["speech", "utterance"],
      hyponyms: ["stage whisper", "sotto voce"]
    },
    {
      synsetOffset: 994812,
      pos: "verb",
      lexicalFileNum: 32,
      lexicalFileName: "verb.communication",
      definition: "to speak very softly using one's breath rather than vocal cords",
      examples: [
        "he leaned close to whisper the secret",
        "the leaves whispered in the twilight breeze"
      ],
      lemmas: ["whisper", "intimate", "confide"],
      hypernyms: ["talk", "speak"],
      hyponyms: []
    },
    {
      synsetOffset: 772109,
      pos: "noun",
      lexicalFileNum: 11,
      lexicalFileName: "noun.event",
      definition: "a slight, delicate trace or suggestion of something",
      examples: [
        "a whisper of doubt lingered in the back of his mind"
      ],
      lemmas: ["whisper", "hint", "trace", "suggestion"],
      hypernyms: ["trace", "indication"],
      hyponyms: []
    }
  ],
  recommendedSenseIndex: 0,
  wsdConfidence: 0.94,
  synonymGroups: [
    {
      senseNumber: 1,
      senseDefinition: "speaking softly without vibration of vocal cords",
      pos: "noun",
      words: ["murmur", "rustle", "susurrus", "undertone", "breath", "sigh"]
    },
    {
      senseNumber: 2,
      senseDefinition: "to speak very softly",
      pos: "verb",
      words: ["murmur", "breathe", "mutter", "intimate", "confide"]
    }
  ],
  antonyms: ["clamor", "bellow", "shout", "roar"],
  hypernyms: ["speech", "vocalization", "sound", "utterance"],
  hyponyms: ["stage whisper", "sotto voce"],
  meronyms: [],
  morphology: {
    original: "whisper",
    lemmas: ["whisper"],
    posList: ["noun", "verb"],
    inflectedVariations: ["whispers", "whispering", "whispered"]
  },
  phonology: {
    syllableCount: 2,
    syllables: ["whis", "per"],
    cvPattern: "CVCC-CVC"
  },
  polysemy: {
    polysemyCount: 3,
    level: "Moderate"
  },
  poetics: {
    word: "whisper",
    rhymeEnding: "-ɪspər",
    onsetCluster: "wh-",
    syllableCount: 2,
    cvPattern: "CVCCVC",
    rhymes: [
      { word: "crisper", syllables: 2, score: 0.98 },
      { word: "vesper", syllables: 2, score: 0.92 },
      { word: "lisper", syllables: 2, score: 0.89 },
      { word: "glimmer", syllables: 2, score: 0.78 }
    ],
    alliterations: [
      { word: "wind", syllables: 1, score: 0.95 },
      { word: "willow", syllables: 2, score: 0.94 },
      { word: "winter", syllables: 2, score: 0.93 },
      { word: "wild", syllables: 1, score: 0.91 },
      { word: "wonder", syllables: 2, score: 0.90 }
    ],
    cvSimilar: [
      { word: "shelter", syllables: 2, score: 0.88 },
      { word: "shiver", syllables: 2, score: 0.85 },
      { word: "silver", syllables: 2, score: 0.84 }
    ]
  },
  hierarchyTree: "entity -> abstraction -> communication -> speech -> whisper",
  functional: {
    themeRheme: {
      theme: "The gentle whisper",
      rheme: "carries through the pine needles"
    },
    interpersonal: {
      mood: "Declarative",
      modality: "Neutral"
    },
    cohesiveTies: [
      { type: "lexical", item: "whisper", referent: "murmur" }
    ]
  },
  pragmatics: {
    speechAct: {
      class: "Assertive",
      performative_verb: "whisper",
      confidence: 0.92
    },
    politeness: {
      strategy: "Positive Politeness",
      hedge_score: 0.28,
      mitigation_tags: ["intimate", "gentle-register"]
    },
    deixis: [
      { text: "through the pine needles", type: "Spatial", proximal: false }
    ]
  },
  discourse: {
    thematicProgression: []
  }
};

const mockStats = {
  characters: 1842,
  charactersNoSpaces: 1520,
  words: 312,
  sentences: 18,
  paragraphs: 4,
  readingTimeMinutes: 1.4,
  speakingTimeMinutes: 2.1,
  uniqueWords: 148,
  vocabularyRichness: 0.47
};

const mockLexFiles = [
  { name: "noun.animal", wordCount: 3982 },
  { name: "noun.communication", wordCount: 3120 },
  { name: "noun.cognition", wordCount: 2450 },
  { name: "noun.artifact", wordCount: 8712 },
  { name: "noun.act", wordCount: 6540 },
  { name: "noun.person", wordCount: 7830 },
  { name: "noun.phenomenon", wordCount: 940 },
  { name: "noun.plant", wordCount: 4210 },
  { name: "noun.possession", wordCount: 1120 },
  { name: "noun.process", wordCount: 760 },
  { name: "noun.quantity", wordCount: 1340 },
  { name: "noun.relation", wordCount: 490 },
  { name: "noun.shape", wordCount: 320 },
  { name: "noun.state", wordCount: 3490 },
  { name: "noun.substance", wordCount: 2180 },
  { name: "noun.time", wordCount: 1420 },
  { name: "verb.body", wordCount: 1620 },
  { name: "verb.change", wordCount: 3840 },
  { name: "verb.cognition", wordCount: 2150 },
  { name: "verb.communication", wordCount: 1840 },
  { name: "verb.competition", wordCount: 740 },
  { name: "verb.consumption", wordCount: 680 },
  { name: "verb.contact", wordCount: 3210 },
  { name: "verb.creation", wordCount: 1450 },
  { name: "verb.emotion", wordCount: 820 },
  { name: "verb.motion", wordCount: 2890 },
  { name: "verb.perception", wordCount: 1130 },
  { name: "verb.possession", wordCount: 980 },
  { name: "verb.social", wordCount: 2410 },
  { name: "verb.stative", wordCount: 1540 },
  { name: "adj.all", wordCount: 7620 },
  { name: "adj.pert", wordCount: 1850 },
  { name: "adv.all", wordCount: 3120 }
];

const mockWordsAnimal = [
  {
    word: "falcon",
    pos: "noun",
    definition: "diurnal bird of prey having long pointed wings and swift, powerful flight",
    synsetId: "n01608627",
    examples: ["the peregrine falcon dived at breakneck speed across the crag"],
    lexfile: "noun.animal"
  },
  {
    word: "eagle",
    pos: "noun",
    definition: "large bird of prey noted for broad wings, keen vision, and soaring flight",
    synsetId: "n01612451",
    examples: ["an eagle circled high above the alpine meadow"],
    lexfile: "noun.animal"
  },
  {
    word: "nightingale",
    pos: "noun",
    definition: "European songbird celebrated for its rich, melodic nocturnal singing",
    synsetId: "n01569420",
    examples: ["a nightingale serenaded the starry dusk"],
    lexfile: "noun.animal"
  },
  {
    word: "raven",
    pos: "noun",
    definition: "large black bird with a heavy bill, deep croaking call, and remarkable intelligence",
    synsetId: "n01582840",
    examples: ["the raven perched solemn atop the bust of Pallas"],
    lexfile: "noun.animal"
  },
  {
    word: "swallow",
    pos: "noun",
    definition: "small migratory bird with long pointed wings and a forked tail, graceful in flight",
    synsetId: "n01575080",
    examples: ["swallows darted skimming the mirror surface of the lake"],
    lexfile: "noun.animal"
  },
  {
    word: "lynx",
    pos: "noun",
    definition: "short-tailed wildcat with tufted ears and large padded paws adapted for snow",
    synsetId: "n02127299",
    examples: ["the silent lynx moved like a phantom across the drifts"],
    lexfile: "noun.animal"
  },
  {
    word: "wolf",
    pos: "noun",
    definition: "wild carnivorous mammal of the dog family, hunting in cooperative packs",
    synsetId: "n02114100",
    examples: ["the wolf howled into the frostbitten midnight"],
    lexfile: "noun.animal"
  }
];

const mockFalconAnalysis = {
  ...mockAnalysisResult,
  word: "falcon",
  primaryLemma: "falcon",
  senses: [
    {
      synsetOffset: 1608627,
      pos: "noun",
      lexicalFileNum: 5,
      lexicalFileName: "noun.animal",
      definition: "diurnal bird of prey having long pointed wings and swift, powerful flight; formerly trained for hunting",
      examples: [
        "the peregrine falcon dived at breakneck speed across the crag",
        "the falconer released the hood, allowing the falcon to survey the open sky"
      ],
      lemmas: ["falcon"],
      hypernyms: ["bird of prey", "raptor", "hawk"],
      hyponyms: ["peregrine", "kestrel", "gyrfalcon", "merlin"]
    }
  ],
  recommendedSenseIndex: 0,
  wsdConfidence: 0.98,
  hierarchyTree: "entity -> physical object -> organism -> animal -> vertebrate -> bird -> raptor -> falcon",
  synonymGroups: [
    {
      senseNumber: 1,
      senseDefinition: "diurnal bird of prey having long pointed wings",
      pos: "noun",
      words: ["peregrine", "kestrel", "raptor", "tiercel"]
    }
  ],
  antonyms: [],
  hypernyms: ["bird of prey", "raptor", "hawk"],
  hyponyms: ["peregrine", "kestrel", "gyrfalcon", "merlin"]
};

const mockGraphData = {
  nodes: [
    { id: "whisper", label: "whisper", type: "word", pos: "noun", is_document_word: true, definition: "speaking softly without vocal cord vibration" },
    { id: "syllables", label: "syllables", type: "word", pos: "noun", is_document_word: true, definition: "units of spoken language consisting of single uninterrupted sound" },
    { id: "resonance", label: "resonance", type: "word", pos: "noun", is_document_word: true, definition: "richness or musical depth of sound or feeling" },
    { id: "verse", label: "verse", type: "word", pos: "noun", is_document_word: true, definition: "a line or stanza of metrical poetic writing" },
    { id: "echo", label: "echo", type: "word", pos: "noun", is_document_word: true, definition: "repetition of sound by reflection of sound waves" },
    { id: "pine", label: "pine", type: "word", pos: "noun", is_document_word: true, definition: "evergreen coniferous tree with needle-shaped leaves" },
    { id: "dawn", label: "dawn", type: "word", pos: "noun", is_document_word: true, definition: "the first appearance of daylight in the morning" },
    { id: "spirit", label: "spirit", type: "word", pos: "noun", is_document_word: true, definition: "the vital principle or animating essence of a person" },
    { id: "tapestry", label: "tapestry", type: "word", pos: "noun", is_document_word: true, definition: "a rich, complex fabric or interwoven composite" },
    { id: "sound", label: "sound", type: "intermediate", pos: "noun", is_document_word: false, definition: "auditory sensations produced by acoustic vibrations" },
    { id: "speech", label: "speech", type: "intermediate", pos: "noun", is_document_word: false, definition: "communication through spoken language" },
    { id: "communication", label: "communication", type: "intermediate", pos: "noun", is_document_word: false, definition: "the exchange or transmission of information" },
    { id: "poetry", label: "poetry", type: "intermediate", pos: "noun", is_document_word: false, definition: "creative literature crafted in metrical or rhythmic form" }
  ],
  edges: [
    { source: "whisper", target: "speech", label: "hypernym", type: "hypernym", weight: 2 },
    { source: "speech", target: "communication", label: "hypernym", type: "hypernym", weight: 2 },
    { source: "whisper", target: "sound", label: "domain", type: "domain", weight: 1.5 },
    { source: "syllables", target: "speech", label: "path", type: "path", weight: 1.5 },
    { source: "resonance", target: "sound", label: "definition", type: "definition", weight: 1.5 },
    { source: "echo", target: "sound", label: "hypernym", type: "hypernym", weight: 2 },
    { source: "verse", target: "poetry", label: "hyponym", type: "hyponym", weight: 2 },
    { source: "verse", target: "syllables", label: "path", type: "path", weight: 1.5 },
    { source: "echo", target: "whisper", label: "synonym", type: "synonym", weight: 1.8 },
    { source: "tapestry", target: "resonance", label: "path", type: "path", weight: 1.2 },
    { source: "spirit", target: "verse", label: "path", type: "path", weight: 1.2 }
  ]
};

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/wails/runtime')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let parsed = {};
      try { parsed = JSON.parse(body); } catch(e) {}
      let resp = true;

      const methodId = parsed.method || (parsed.args && parsed.args.methodID);
      if (methodId === 3193888781) {
        resp = true;
      } else if (methodId === 774512167) {
        resp = mockStats;
      } else if (methodId === 210490654) {
        const queryWord = parsed.args?.args?.[0] || "";
        if (queryWord === "falcon") {
          resp = mockFalconAnalysis;
        } else {
          resp = mockAnalysisResult;
        }
      } else if (methodId === 1137991401) {
        resp = { word1: "whisper", word2: "murmur", score: 0.88, lowestCommonAncestor: "vocalization.n.01" };
      } else if (methodId === 2109872559) {
        resp = mockAnalysisResult.poetics;
      } else if (methodId === 3036513803) {
        resp = [
          { word: "whisper", lemma: "whisper", pos: "n", gloss: "speaking softly without vocal cords", senseNumber: 1, source: "exact" },
          { word: "whispering", lemma: "whisper", pos: "v", gloss: "speaking gently in low tones", senseNumber: 1, source: "morphology" },
          { word: "whispers", lemma: "whisper", pos: "n", gloss: "plural of whisper", senseNumber: 1, source: "morphology" }
        ];
      } else if (methodId === 3561151394) {
        resp = mockLexFiles;
      } else if (methodId === 38440605) {
        resp = mockWordsAnimal;
      } else if (methodId === 371324934) {
        resp = mockWordsAnimal[0];
      } else if (methodId === 4077261957) {
        resp = mockGraphData;
      } else if (methodId === 3265971228) {
        resp = "C:/Users/Poet/Documents/Verses";
      } else if (methodId === 2157397385) {
        resp = {
          currentDir: "C:/Users/Poet/Documents/Verses",
          dirName: "Verses",
          files: [
            { name: "nocturne_in_cyan.md", path: "C:/Users/Poet/Documents/Verses/nocturne_in_cyan.md", extension: ".md", size: 1842, modTime: 1757342400 },
            { name: "soliloquy_autumn.txt", path: "C:/Users/Poet/Documents/Verses/soliloquy_autumn.txt", extension: ".txt", size: 940, modTime: 1757256000 },
            { name: "lexical_draft.md", path: "C:/Users/Poet/Documents/Verses/lexical_draft.md", extension: ".md", size: 2410, modTime: 1757169600 }
          ]
        };
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(resp));
    });
    return;
  }

  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(distDir, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const indexHtml = path.join(distDir, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexHtml).pipe(res);
  }
});

server.listen(5199, '127.0.0.1', async () => {
  console.log('Static preview server running on http://127.0.0.1:5199');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });

  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to app...');
  await page.goto('http://127.0.0.1:5199');
  await page.waitForTimeout(2000);

  // Click on editor, type sample prose
  console.log('Typing sample prose into editor...');
  const editorLocator = page.locator('.ProseMirror');
  await editorLocator.click();
  await page.keyboard.type("In the quiet corridors of dawn, syllables awaken.\nA gentle whisper carries through the pine needles,\nweaving lexical resonance into the tapestry of thought.\nWords are not mere vessels of sound; they are coordinates\nmapping the vast topography of the human spirit.\n\nThrough meter, cadence, and polysemic depth,\nevery verse discovers its hidden echo.");
  await page.waitForTimeout(1000);

  // Double click on the word "whisper"
  console.log('Selecting word "whisper"...');
  await page.evaluate(() => {
    const walker = document.createTreeWalker(document.querySelector('.ProseMirror'), NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const idx = node.textContent.indexOf('whisper');
      if (idx !== -1) {
        const range = document.createRange();
        range.setStart(node, idx);
        range.setEnd(node, idx + 'whisper'.length);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        node.parentElement.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        break;
      }
    }
  });

  await page.waitForTimeout(1500);

  // 1. Hero Screenshot: Full editor overview with sidebar
  console.log('Capturing hero-editor.png...');
  await page.screenshot({ path: path.join(websiteImagesDir, 'hero-editor.png') });
  await page.screenshot({ path: path.join(docsImagesDir, 'hero-editor.png') });

  // 2. Pragmatics & Acts tab on bottom drawer
  console.log('Switching to Pragmatics & Acts tab...');
  const pragmaticsTab = page.locator('button', { hasText: 'Pragmatics & Acts' });
  if (await pragmaticsTab.count() > 0) {
    await pragmaticsTab.first().click();
    await page.waitForTimeout(500);
    console.log('Capturing linguistic-analysis.png...');
    await page.screenshot({ path: path.join(websiteImagesDir, 'linguistic-analysis.png') });
    await page.screenshot({ path: path.join(docsImagesDir, 'linguistic-analysis.png') });
  }

  // 3. Poetics Panel
  console.log('Capturing poetics-suite.png...');
  const poeticsTab = page.locator('button', { hasText: 'Phonology' });
  if (await poeticsTab.count() > 0) {
    await poeticsTab.first().click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: path.join(websiteImagesDir, 'poetics-suite.png') });
  await page.screenshot({ path: path.join(docsImagesDir, 'poetics-suite.png') });

  // 4. WordNet Lexical Explorer View (ActivityBar icon 2)
  console.log('Switching to WordNet Lexical Explorer view...');
  const wordnetBtn = page.locator('button[aria-label="WordNet Lexical Explorer (LexFiles & Synsets)"]');
  if (await wordnetBtn.count() > 0) {
    await wordnetBtn.first().click();
    await page.waitForTimeout(1500);

    // Click on 'falcon' word item to show rich sense card
    const falconItem = page.locator('text="falcon"');
    if (await falconItem.count() > 0) {
      await falconItem.first().click();
      await page.waitForTimeout(800);
    }

    console.log('Capturing wordnet-explorer.png...');
    await page.screenshot({ path: path.join(websiteImagesDir, 'wordnet-explorer.png') });
    await page.screenshot({ path: path.join(docsImagesDir, 'wordnet-explorer.png') });
  }

  // 5. Document Word Graph View (ActivityBar icon 3)
  console.log('Switching to Document Word Graph view...');
  const graphBtn = page.locator('button[aria-label="Document Word Relationship Graph"]');
  if (await graphBtn.count() > 0) {
    await graphBtn.first().click();
    await page.waitForTimeout(2500); // Allow force graph layout to settle

    console.log('Capturing word-graph.png...');
    await page.screenshot({ path: path.join(websiteImagesDir, 'word-graph.png') });
    await page.screenshot({ path: path.join(docsImagesDir, 'word-graph.png') });
  }

  // 6. Open About Dialog via Help menu
  console.log('Switching back to Editor view...');
  const editorBtn = page.locator('button[aria-label="Editor & Files (Explorer, Senses, Morphology)"]');
  if (await editorBtn.count() > 0) {
    await editorBtn.first().click();
    await page.waitForTimeout(800);
  }

  console.log('Opening Help menu...');
  const helpMenuBtn = page.locator('button', { hasText: 'Help' });
  if (await helpMenuBtn.count() > 0) {
    await helpMenuBtn.first().click();
    await page.waitForTimeout(500);
    const aboutOption = page.locator('text="About gown-ted"');
    if (await aboutOption.count() > 0) {
      await aboutOption.first().click();
      await page.waitForTimeout(1000);
      console.log('Capturing about-dialog.png...');
      await page.screenshot({ path: path.join(websiteImagesDir, 'about-dialog.png') });
      await page.screenshot({ path: path.join(docsImagesDir, 'about-dialog.png') });
    }
  }

  console.log('Screenshots generation complete!');
  await browser.close();
  server.close();
  process.exit(0);
});
