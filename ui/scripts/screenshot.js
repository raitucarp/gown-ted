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
        resp = mockAnalysisResult;
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

  // 4. Open About Dialog via Help menu
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
