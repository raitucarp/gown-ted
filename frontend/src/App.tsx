import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, HStack, VStack, Flex, IconButton, Text, Badge } from "@chakra-ui/react";
import {
  LuPanelLeftOpen,
  LuPanelRightOpen,
  LuLayers,
  LuGitBranch,
  LuBookCopy,
  LuBinary,
  LuChevronUp,
  LuChevronDown,
  LuNetwork,
  LuMusic,
} from "react-icons/lu";
import { AppToolbar } from "./components/layout/AppToolbar";
import { AppStatusBar, DocumentStats } from "./components/layout/AppStatusBar";
import { ResizeHandle } from "./components/layout/ResizeHandle";
import { EditorWorkspace, WordContext } from "./components/editor/EditorWorkspace";
import { WordSensesPanel } from "./components/panels/WordSensesPanel";
import { RelationshipsPanel } from "./components/panels/RelationshipsPanel";
import { DefinitionPanel } from "./components/panels/DefinitionPanel";
import { SynonymsPanel } from "./components/panels/SynonymsPanel";
import { ExtendedAnalysisPanel } from "./components/panels/ExtendedAnalysisPanel";
import { PoeticsPanel } from "./components/panels/PoeticsPanel";

import {
  AnalyzeWord,
  AnalyzeDocument,
  IsReady,
} from "../bindings/github.com/raitucarp/gown-ted/lexicalservice.js";

const SAMPLES = {
  polysemy: `<h1>Exploring Polysemy in English</h1>
<p>The English language is rich with multiple meanings. Consider the word <strong>bank</strong>: I deposited money into the bank yesterday, but this afternoon I sat on the grassy bank of the river to watch the birds.</p>
<p>Notice also the word <strong>bright</strong>: The bright sunlight warmed the room, and she had a bright idea that solved the entire conundrum.</p>`,
  literature: `<h1>The Architecture of Human Language</h1>
<p>Words do not exist in isolation; they form complex semantic networks with delicate webs of polysemy, hypernymy, and associative relations.</p>
<p>When an author chooses an expressive word, they trigger a resonance chamber of historical connotations, conceptual hierarchies, and phonological cadence that evokes deeper understanding in the reader.</p>`,
  nature: `<h1>Canines in the Wild and Domestic Sphere</h1>
<p>The wolf roams the untamed wilderness with predatory grace, maintaining the ecological balance of northern forests.</p>
<p>Through thousands of years of selective breeding and mutual cooperation, dogs developed acute cognitive sensitivity to human social cues.</p>`,
};

export default function App() {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isBackendReady, setIsBackendReady] = useState(false);

  // Panel resizing and collapse states
  const [leftWidth, setLeftWidth] = useState(290);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [leftSplitTopRatio, setLeftSplitTopRatio] = useState(50);
  const [isLeftTopCollapsed, setIsLeftTopCollapsed] = useState(false);
  const [isLeftBottomCollapsed, setIsLeftBottomCollapsed] = useState(false);

  const [rightWidth, setRightWidth] = useState(330);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [rightRatioTop, setRightRatioTop] = useState(30);
  const [rightRatioMiddle, setRightRatioMiddle] = useState(35);
  const [isRightTopCollapsed, setIsRightTopCollapsed] = useState(false);
  const [isRightMiddleCollapsed, setIsRightMiddleCollapsed] = useState(false);
  const [isRightBottomCollapsed, setIsRightBottomCollapsed] = useState(false);

  const [bottomHeight, setBottomHeight] = useState(220);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  const handleResizeLeft = (delta: number) => {
    setLeftWidth((prev) => Math.max(220, Math.min(540, prev + delta)));
  };

  const handleResizeRight = (delta: number) => {
    setRightWidth((prev) => Math.max(240, Math.min(580, prev - delta)));
  };

  const handleResizeBottom = (delta: number) => {
    setBottomHeight((prev) => Math.max(140, Math.min(460, prev - delta)));
  };

  // Active word and sentence context
  const [activeWordContext, setActiveWordContext] = useState<WordContext | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedSenseIdx, setSelectedSenseIdx] = useState(0);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Document statistics
  const [stats, setStats] = useState<DocumentStats>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    readingTimeMinutes: 0,
    speakingTimeMinutes: 0,
    uniqueWords: 0,
    vocabularyRichness: 0,
  });

  const editorRef = useRef<any>(null);
  const requestIdRef = useRef<number>(0);
  const analyzeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Poll backend ready status on mount
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const checkReady = async () => {
      try {
        const ready = await IsReady();
        if (ready) {
          setIsBackendReady(true);
          clearInterval(interval);
        }
      } catch (e) {
        // Retry
      }
    };
    checkReady();
    interval = setInterval(checkReady, 500);
    return () => clearInterval(interval);
  }, []);

  // Debounced Word Analysis on Active Word Change
  useEffect(() => {
    if (!activeWordContext || !activeWordContext.word) {
      setAnalysisResult(null);
      return;
    }

    if (analyzeTimerRef.current) clearTimeout(analyzeTimerRef.current);

    analyzeTimerRef.current = setTimeout(async () => {
      const currentReqId = ++requestIdRef.current;
      setAnalysisLoading(true);
      try {
        const res = await AnalyzeWord(
          activeWordContext.word,
          activeWordContext.sentence,
          currentReqId
        );
        // Only apply if this is still the newest request (avoids race conditions)
        if (res && res.requestId === requestIdRef.current) {
          setAnalysisResult(res);
          setSelectedSenseIdx(res.recommendedSenseIndex || 0);
        }
      } catch (err) {
        console.error("AnalyzeWord error:", err);
      } finally {
        setAnalysisLoading(false);
      }
    }, 100);

    return () => {
      if (analyzeTimerRef.current) clearTimeout(analyzeTimerRef.current);
    };
  }, [activeWordContext]);

  // Handle Document Text Changes for Live Statistics
  const handleDocumentChange = useCallback(async (_html: string, plainText: string) => {
    try {
      const docStats = await AnalyzeDocument(plainText);
      if (docStats) {
        setStats(docStats as DocumentStats);
      }
    } catch (err) {
      console.error("AnalyzeDocument error:", err);
    }
  }, []);

  // Replace active word with selected synonym
  const handleReplaceWord = (replacement: string) => {
    if (!editorRef.current || !activeWordContext) return;
    const { from, to } = activeWordContext;
    editorRef.current
      .chain()
      .focus()
      .deleteRange({ from, to })
      .insertContent(replacement)
      .run();
  };

  // Insert synonym directly adjacent to active word
  const handleInsertWord = (insertion: string) => {
    if (!editorRef.current || !activeWordContext) return;
    const { to } = activeWordContext;
    editorRef.current
      .chain()
      .focus()
      .setTextSelection(to)
      .insertContent(" " + insertion)
      .run();
  };

  // Explicitly inspect any word clicked in panels
  const handleInspectWord = (wordToInspect: string) => {
    setActiveWordContext({
      word: wordToInspect,
      sentence: wordToInspect,
      from: 0,
      to: 0,
    });
  };

  // Load sample content
  const handleLoadSample = (sampleKey: string) => {
    const content = SAMPLES[sampleKey as keyof typeof SAMPLES];
    if (content && editorRef.current) {
      editorRef.current.commands.setContent(content);
    }
  };

  // New clean document
  const handleNewDocument = () => {
    if (editorRef.current) {
      editorRef.current.commands.setContent("<p></p>");
      setActiveWordContext(null);
      setAnalysisResult(null);
    }
  };

  const currentSense =
    analysisResult && analysisResult.senses && analysisResult.senses[selectedSenseIdx]
      ? analysisResult.senses[selectedSenseIdx]
      : null;

  return (
    <Flex direction="column" h="100vh" w="100vw" overflow="hidden" bg="gray.950" color="gray.100">
      {/* Top Application Toolbar */}
      <AppToolbar
        isFocusMode={isFocusMode}
        onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
        onNewDocument={handleNewDocument}
        isBackendReady={isBackendReady}
        isLeftOpen={!isLeftCollapsed}
        onToggleLeft={() => setIsLeftCollapsed(!isLeftCollapsed)}
        isRightOpen={!isRightCollapsed}
        onToggleRight={() => setIsRightCollapsed(!isRightCollapsed)}
        isBottomOpen={!isBottomCollapsed}
        onToggleBottom={() => setIsBottomCollapsed(!isBottomCollapsed)}
      />

      {/* Main Multi-Panel Workspace */}
      <HStack flex="1" gap={0} alignItems="stretch" overflow="hidden">
        {/* Left Sidebar (Word Senses + Relationships) */}
        {!isFocusMode && (
          isLeftCollapsed ? (
            <Box
              w="38px"
              h="100%"
              bg="gray.950"
              borderRightWidth="1px"
              borderColor="gray.800"
              display="flex"
              flexDirection="column"
              alignItems="center"
              py="2"
              gap="2.5"
              flexShrink={0}
            >
              <IconButton
                size="xs"
                variant="ghost"
                color="gray.400"
                _hover={{ bg: "gray.800", color: "white" }}
                onClick={() => setIsLeftCollapsed(false)}
                title="Expand Left Sidebar (Senses & Morphology)"
                aria-label="Expand Left Sidebar"
              >
                <LuPanelLeftOpen size={16} />
              </IconButton>

              <IconButton
                size="xs"
                variant="ghost"
                color="blue.400"
                _hover={{ bg: "gray.800" }}
                onClick={() => setIsLeftCollapsed(false)}
                title="Word Senses & Polysemy"
                aria-label="Word Senses"
              >
                <LuLayers size={15} />
              </IconButton>

              <IconButton
                size="xs"
                variant="ghost"
                color="teal.400"
                _hover={{ bg: "gray.800" }}
                onClick={() => setIsLeftCollapsed(false)}
                title="Morphology & Relations"
                aria-label="Morphology & Relations"
              >
                <LuGitBranch size={15} />
              </IconButton>

              <Box
                flex="1"
                display="flex"
                alignItems="center"
                justifyContent="center"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                <Text fontSize="2xs" color="gray.600" letterSpacing="0.08em" textTransform="uppercase">
                  Senses & Relations
                </Text>
              </Box>
            </Box>
          ) : (
            <>
              <Box
                w={`${leftWidth}px`}
                minW="220px"
                maxW="540px"
                h="100%"
                display="flex"
                flexDirection="column"
                overflow="hidden"
                flexShrink={0}
                borderRightWidth="1px"
                borderColor="gray.800"
              >
                {/* Left-Top Panel: Word Senses */}
                {isLeftTopCollapsed ? (
                  <HStack
                    px="3"
                    py="2"
                    bg="gray.950"
                    borderBottomWidth="1px"
                    borderColor="gray.800"
                    justifyContent="space-between"
                    cursor="pointer"
                    onClick={() => setIsLeftTopCollapsed(false)}
                    _hover={{ bg: "gray.900" }}
                    flexShrink={0}
                  >
                    <HStack gap="1.5">
                      <LuLayers color="#63B3ED" size={14} />
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.05em">
                        Word Senses
                      </Text>
                      {analysisResult?.senses?.length ? (
                        <Badge size="xs" colorPalette="purple" variant="surface">
                          {analysisResult.senses.length}
                        </Badge>
                      ) : null}
                    </HStack>
                    <IconButton
                      size="2xs"
                      variant="ghost"
                      color="gray.400"
                      _hover={{ color: "white" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLeftTopCollapsed(false);
                      }}
                      title="Expand Word Senses"
                      aria-label="Expand Word Senses"
                    >
                      <LuChevronDown size={14} />
                    </IconButton>
                  </HStack>
                ) : (
                  <Box
                    h={isLeftBottomCollapsed ? "100%" : `${leftSplitTopRatio}%`}
                    flex={isLeftBottomCollapsed ? "1" : undefined}
                    overflow="hidden"
                  >
                    <WordSensesPanel
                      word={analysisResult?.word || activeWordContext?.word || ""}
                      senses={analysisResult?.senses || []}
                      selectedSenseIndex={selectedSenseIdx}
                      recommendedSenseIndex={analysisResult?.recommendedSenseIndex || 0}
                      wsdConfidence={analysisResult?.wsdConfidence || 0}
                      entropy={analysisResult?.polysemy?.entropy || 0}
                      totalSenses={analysisResult?.polysemy?.totalSenses || 0}
                      onSelectSense={(idx) => setSelectedSenseIdx(idx)}
                      loading={analysisLoading}
                      onToggleCollapse={() => setIsLeftCollapsed(true)}
                      onToggleSubpanel={() => setIsLeftTopCollapsed(true)}
                    />
                  </Box>
                )}

                {/* Vertical Splitter inside Left Sidebar (only when both subpanels are expanded) */}
                {!isLeftTopCollapsed && !isLeftBottomCollapsed && (
                  <ResizeHandle
                    direction="vertical"
                    onResize={(delta) => setLeftSplitTopRatio((prev) => Math.max(20, Math.min(80, prev + delta * 0.25)))}
                    title="Drag to adjust Senses / Morphology ratio"
                  />
                )}

                {/* Left-Bottom Panel: Morphology & Relationships */}
                {isLeftBottomCollapsed ? (
                  <HStack
                    px="3"
                    py="2"
                    bg="gray.950"
                    borderTopWidth="1px"
                    borderColor="gray.800"
                    justifyContent="space-between"
                    cursor="pointer"
                    onClick={() => setIsLeftBottomCollapsed(false)}
                    _hover={{ bg: "gray.900" }}
                    flexShrink={0}
                  >
                    <HStack gap="1.5">
                      <LuGitBranch color="#4FD1C5" size={14} />
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.05em">
                        Morphology & Relations
                      </Text>
                    </HStack>
                    <IconButton
                      size="2xs"
                      variant="ghost"
                      color="gray.400"
                      _hover={{ color: "white" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLeftBottomCollapsed(false);
                      }}
                      title="Expand Morphology & Relations"
                      aria-label="Expand Morphology & Relations"
                    >
                      <LuChevronUp size={14} />
                    </IconButton>
                  </HStack>
                ) : (
                  <Box
                    flex="1"
                    h={isLeftTopCollapsed ? "100%" : undefined}
                    overflow="hidden"
                  >
                    <RelationshipsPanel
                      originalWord={analysisResult?.word || activeWordContext?.word || ""}
                      lemmas={analysisResult?.morphology?.lemmas || []}
                      posList={analysisResult?.morphology?.posList || []}
                      hypernyms={analysisResult?.hypernyms || []}
                      hyponyms={analysisResult?.hyponyms || []}
                      meronyms={analysisResult?.meronyms || []}
                      antonyms={analysisResult?.antonyms || []}
                      onInspectWord={handleInspectWord}
                      onReplaceWord={handleReplaceWord}
                      onToggleCollapse={() => setIsLeftBottomCollapsed(true)}
                    />
                  </Box>
                )}
              </Box>

              {/* Left Sidebar Horizontal Resize Handle */}
              <ResizeHandle
                direction="horizontal"
                onResize={handleResizeLeft}
                onDoubleClick={() => setIsLeftCollapsed(true)}
                title="Drag to resize left sidebar (Double-click to collapse)"
              />
            </>
          )
        )}

        {/* Central Workspace (Rich Text Editor + Definition Explorer) */}
        <Flex flex="1" direction="column" h="100%" overflow="hidden">
          {/* Central-Top: Rich Text Editor */}
          <Box flex="1" overflow="hidden">
            <EditorWorkspace
              initialContent={SAMPLES.polysemy}
              onActiveWordChange={(ctx) => setActiveWordContext(ctx)}
              onDocumentChange={handleDocumentChange}
              editorRef={editorRef}
            />
          </Box>

          {/* Central-Bottom: Definition Explorer or Collapsed Bar */}
          {!isFocusMode && (
            isBottomCollapsed ? (
              <HStack
                px="3"
                py="1"
                bg="gray.925"
                borderTopWidth="1px"
                borderColor="gray.800"
                justifyContent="space-between"
                cursor="pointer"
                onClick={() => setIsBottomCollapsed(false)}
                _hover={{ bg: "gray.850" }}
                transition="background 0.15s ease"
              >
                <HStack gap="2">
                  <LuChevronUp size={14} color="#63B3ED" />
                  <Text fontSize="xs" color="gray.400" fontWeight="medium">
                    Definition & Examples Explorer {activeWordContext?.word ? `("${activeWordContext.word}")` : ""}
                  </Text>
                </HStack>
                <Badge size="xs" variant="surface" colorPalette="blue">
                  Expand Panel
                </Badge>
              </HStack>
            ) : (
              <>
                <ResizeHandle
                  direction="vertical"
                  onResize={handleResizeBottom}
                  onDoubleClick={() => setIsBottomCollapsed(true)}
                  title="Drag to resize definition panel (Double-click to collapse)"
                />
                <Box
                  h={`${bottomHeight}px`}
                  minH="140px"
                  maxH="460px"
                  overflow="hidden"
                  borderTopWidth="1px"
                  borderColor="gray.800"
                >
                  <DefinitionPanel
                    word={analysisResult?.word || activeWordContext?.word || ""}
                    activeSense={currentSense}
                    sentenceContext={activeWordContext?.sentence || ""}
                    totalSenses={analysisResult?.senses?.length || 0}
                    functional={analysisResult?.functional || null}
                    pragmatics={analysisResult?.pragmatics || null}
                    discourse={analysisResult?.discourse || null}
                    onInspectWord={handleInspectWord}
                    onToggleCollapse={() => setIsBottomCollapsed(true)}
                  />
                </Box>
              </>
            )
          )}
        </Flex>

        {/* Right Sidebar (Synonyms + Extended Analysis) */}
        {!isFocusMode && (
          isRightCollapsed ? (
            <Box
              w="38px"
              h="100%"
              bg="gray.950"
              borderLeftWidth="1px"
              borderColor="gray.800"
              display="flex"
              flexDirection="column"
              alignItems="center"
              py="2"
              gap="2.5"
              flexShrink={0}
            >
              <IconButton
                size="xs"
                variant="ghost"
                color="gray.400"
                _hover={{ bg: "gray.800", color: "white" }}
                onClick={() => setIsRightCollapsed(false)}
                title="Expand Right Sidebar (Synonyms & Analysis)"
                aria-label="Expand Right Sidebar"
              >
                <LuPanelRightOpen size={16} />
              </IconButton>

              <IconButton
                size="xs"
                variant="ghost"
                color="green.400"
                _hover={{ bg: "gray.800" }}
                onClick={() => {
                  setIsRightCollapsed(false);
                  setIsRightTopCollapsed(false);
                }}
                title="Synonyms Explorer"
                aria-label="Synonyms Explorer"
              >
                <LuBookCopy size={15} />
              </IconButton>

              <IconButton
                size="xs"
                variant="ghost"
                color="blue.400"
                _hover={{ bg: "gray.800" }}
                onClick={() => {
                  setIsRightCollapsed(false);
                  setIsRightMiddleCollapsed(false);
                }}
                title="Ontology & Hierarchy"
                aria-label="Ontology & Hierarchy"
              >
                <LuNetwork size={15} />
              </IconButton>

              <IconButton
                size="xs"
                variant="ghost"
                color="yellow.400"
                _hover={{ bg: "gray.800" }}
                onClick={() => {
                  setIsRightCollapsed(false);
                  setIsRightBottomCollapsed(false);
                }}
                title="Rhythm & Poetics"
                aria-label="Rhythm & Poetics"
              >
                <LuMusic size={15} />
              </IconButton>

              <Box
                flex="1"
                display="flex"
                alignItems="center"
                justifyContent="center"
                style={{ writingMode: "vertical-rl" }}
              >
                <Text fontSize="2xs" color="gray.600" letterSpacing="0.08em" textTransform="uppercase">
                  Synonyms, Hierarchy & Poetics
                </Text>
              </Box>
            </Box>
          ) : (
            <>
              {/* Right Sidebar Horizontal Resize Handle */}
              <ResizeHandle
                direction="horizontal"
                onResize={handleResizeRight}
                onDoubleClick={() => setIsRightCollapsed(true)}
                title="Drag to resize right sidebar (Double-click to collapse)"
              />

              <Box
                w={`${rightWidth}px`}
                minW="260px"
                maxW="600px"
                h="100%"
                display="flex"
                flexDirection="column"
                overflow="hidden"
                flexShrink={0}
                borderLeftWidth="1px"
                borderColor="gray.800"
              >
                {/* 1. Right-Top Panel: Synonyms */}
                {isRightTopCollapsed ? (
                  <HStack
                    px="3"
                    py="2"
                    bg="gray.950"
                    borderBottomWidth="1px"
                    borderColor="gray.800"
                    justifyContent="space-between"
                    cursor="pointer"
                    onClick={() => setIsRightTopCollapsed(false)}
                    _hover={{ bg: "gray.900" }}
                    flexShrink={0}
                  >
                    <HStack gap="1.5">
                      <LuBookCopy color="#48BB78" size={14} />
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.05em">
                        Synonyms
                      </Text>
                      {analysisResult?.synonyms?.length ? (
                        <Badge size="xs" colorPalette="green" variant="surface">
                          {analysisResult.synonyms.length}
                        </Badge>
                      ) : null}
                    </HStack>
                    <IconButton
                      size="2xs"
                      variant="ghost"
                      color="gray.400"
                      _hover={{ color: "white" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRightTopCollapsed(false);
                      }}
                      title="Expand Synonyms"
                      aria-label="Expand Synonyms"
                    >
                      <LuChevronDown size={14} />
                    </IconButton>
                  </HStack>
                ) : (
                  <Box
                    h={
                      isRightMiddleCollapsed && isRightBottomCollapsed
                        ? "100%"
                        : `${rightRatioTop}%`
                    }
                    flex={
                      isRightMiddleCollapsed && isRightBottomCollapsed
                        ? "1"
                        : undefined
                    }
                    overflow="hidden"
                  >
                    <SynonymsPanel
                      word={analysisResult?.word || activeWordContext?.word || ""}
                      synonymGroups={analysisResult?.synonymGroups || []}
                      totalSynonyms={analysisResult?.synonyms?.length}
                      onReplaceWord={handleReplaceWord}
                      onInsertWord={handleInsertWord}
                      onInspectWord={handleInspectWord}
                      onToggleCollapse={() => setIsRightCollapsed(true)}
                      onToggleSubpanel={() => setIsRightTopCollapsed(true)}
                    />
                  </Box>
                )}

                {/* Vertical Splitter 1: Between Top and Middle */}
                {!isRightTopCollapsed && (!isRightMiddleCollapsed || !isRightBottomCollapsed) && (
                  <ResizeHandle
                    direction="vertical"
                    onResize={(delta) =>
                      setRightRatioTop((prev) => Math.max(15, Math.min(60, prev + delta * 0.25)))
                    }
                    title="Drag to adjust Synonyms / Hierarchy ratio"
                  />
                )}

                {/* 2. Right-Middle Panel: Ontology & Hierarchy */}
                {isRightMiddleCollapsed ? (
                  <HStack
                    px="3"
                    py="2"
                    bg="gray.950"
                    borderTopWidth="1px"
                    borderBottomWidth="1px"
                    borderColor="gray.800"
                    justifyContent="space-between"
                    cursor="pointer"
                    onClick={() => setIsRightMiddleCollapsed(false)}
                    _hover={{ bg: "gray.900" }}
                    flexShrink={0}
                  >
                    <HStack gap="1.5">
                      <LuNetwork color="#63B3ED" size={14} />
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.05em">
                        Ontology Tree
                      </Text>
                    </HStack>
                    <IconButton
                      size="2xs"
                      variant="ghost"
                      color="gray.400"
                      _hover={{ color: "white" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRightMiddleCollapsed(false);
                      }}
                      title="Expand Ontology Tree"
                      aria-label="Expand Ontology Tree"
                    >
                      <LuChevronDown size={14} />
                    </IconButton>
                  </HStack>
                ) : (
                  <Box
                    h={
                      !isRightBottomCollapsed
                        ? `${rightRatioMiddle}%`
                        : undefined
                    }
                    flex={
                      isRightTopCollapsed && isRightBottomCollapsed
                        ? "1"
                        : isRightBottomCollapsed
                        ? "1"
                        : undefined
                    }
                    overflow="hidden"
                  >
                    <ExtendedAnalysisPanel
                      word={analysisResult?.word || activeWordContext?.word || ""}
                      hierarchyTree={analysisResult?.hierarchyTree || ""}
                      expansionTree={analysisResult?.expansionTree || null}
                      onInspectWord={handleInspectWord}
                      onReplaceWord={handleReplaceWord}
                      onToggleCollapse={() => setIsRightMiddleCollapsed(true)}
                    />
                  </Box>
                )}

                {/* Vertical Splitter 2: Between Middle and Bottom */}
                {!isRightMiddleCollapsed && !isRightBottomCollapsed && (
                  <ResizeHandle
                    direction="vertical"
                    onResize={(delta) =>
                      setRightRatioMiddle((prev) => Math.max(15, Math.min(60, prev + delta * 0.25)))
                    }
                    title="Drag to adjust Hierarchy / Poetics ratio"
                  />
                )}

                {/* 3. Right-Bottom Panel: Rhythm & Poetics */}
                {isRightBottomCollapsed ? (
                  <HStack
                    px="3"
                    py="2"
                    bg="gray.950"
                    borderTopWidth="1px"
                    borderColor="gray.800"
                    justifyContent="space-between"
                    cursor="pointer"
                    onClick={() => setIsRightBottomCollapsed(false)}
                    _hover={{ bg: "gray.900" }}
                    flexShrink={0}
                  >
                    <HStack gap="1.5">
                      <LuMusic color="#F6E05E" size={14} />
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.05em">
                        Rhythm & Poetics
                      </Text>
                    </HStack>
                    <IconButton
                      size="2xs"
                      variant="ghost"
                      color="gray.400"
                      _hover={{ color: "white" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRightBottomCollapsed(false);
                      }}
                      title="Expand Rhythm & Poetics"
                      aria-label="Expand Rhythm & Poetics"
                    >
                      <LuChevronUp size={14} />
                    </IconButton>
                  </HStack>
                ) : (
                  <Box
                    flex="1"
                    h={
                      isRightTopCollapsed && isRightMiddleCollapsed
                        ? "100%"
                        : undefined
                    }
                    overflow="hidden"
                  >
                    <PoeticsPanel
                      word={analysisResult?.word || activeWordContext?.word || ""}
                      phonology={analysisResult?.phonology || null}
                      poetics={analysisResult?.poetics || null}
                      onInspectWord={handleInspectWord}
                      onReplaceWord={handleReplaceWord}
                      onInsertWord={handleInsertWord}
                      onToggleCollapse={() => setIsRightBottomCollapsed(true)}
                    />
                  </Box>
                )}
              </Box>
            </>
          )
        )}
      </HStack>

      {/* Persistent Bottom Status Bar */}
      <AppStatusBar
        stats={stats}
        activeWord={activeWordContext?.word || ""}
        activeLemma={analysisResult?.primaryLemma || ""}
      />
    </Flex>
  );
}
