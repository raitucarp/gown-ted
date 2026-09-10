import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Input,
  Badge,
  Spinner,
  Button,
} from "@chakra-ui/react";
import { LuSearch, LuBookOpen, LuQuote, LuCopy, LuSparkles } from "react-icons/lu";
import {
  GetLexFiles,
  GetWordsByLexFile,
  AnalyzeWord,
  FindWordLocation,
} from "@bindings/github.com/raitucarp/gown-ted/service/lexicalservice.js";
import type {
  LexFileInfo,
  LexFileWordItem,
  LexicalAnalysisResult,
} from "@bindings/github.com/raitucarp/gown-ted/pkg/models/models.js";
import { getLexFileVisual, getPosVisual } from "@utils/lexicalIcons";
import { PosBadge, LexFileBadge } from "@atoms";

interface WordNetExplorerViewProps {
  onInsertWord?: (word: string) => void;
}

export const WordNetExplorerView: React.FC<WordNetExplorerViewProps> = ({
  onInsertWord,
}) => {
  const [lexFiles, setLexFiles] = useState<LexFileInfo[]>([]);
  const [lexFilter, setLexFilter] = useState("");
  const [selectedLexFile, setSelectedLexFile] = useState<string | null>(null);

  const [words, setWords] = useState<LexFileWordItem[]>([]);
  const [wordFilter, setWordFilter] = useState("");
  const [selectedWord, setSelectedWord] = useState<LexFileWordItem | null>(null);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(100);

  const [wordDetail, setWordDetail] = useState<LexicalAnalysisResult | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const pendingTargetWordRef = useRef<string | null>(null);

  // Load all LexFiles on mount
  useEffect(() => {
    let active = true;
    GetLexFiles()
      .then((res: LexFileInfo[] | null) => {
        if (!active) return;
        const items = res || [];
        setLexFiles(items);
        if (items.length > 0 && !selectedLexFile) {
          // Default select noun.animal or first lexfile
          const defaultLf = items.find((l) => l.name === "noun.animal") || items[0];
          setSelectedLexFile(defaultLf.name);
        }
      })
      .catch((err: any) => console.error("GetLexFiles error:", err));
    return () => {
      active = false;
    };
  }, []);

  // Load words whenever selectedLexFile or wordFilter changes
  useEffect(() => {
    if (!selectedLexFile) {
      setWords([]);
      return;
    }
    let active = true;
    setWordsLoading(true);

    const timer = setTimeout(() => {
      // Pass 0 to fetch all words in this LexFile dynamically
      GetWordsByLexFile(selectedLexFile, wordFilter, 0)
        .then((res: LexFileWordItem[] | null) => {
          if (!active) return;
          const items = res || [];
          setWords(items);
          setVisibleCount(100);

          if (pendingTargetWordRef.current) {
            const target = pendingTargetWordRef.current.toLowerCase();
            const targetItem = items.find((it) => it.word.toLowerCase() === target);
            if (targetItem) {
              setSelectedWord(targetItem);
              const idx = items.findIndex((it) => it.word.toLowerCase() === target);
              if (idx !== -1 && idx >= 100) {
                setVisibleCount(idx + 50);
              }
              setTimeout(() => {
                const el = document.getElementById(`word-item-${target}`);
                el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
              }, 100);
            }
            pendingTargetWordRef.current = null;
          } else if (items.length > 0) {
            if (!selectedWord || !items.some((it) => it.word.toLowerCase() === selectedWord.word.toLowerCase())) {
              setSelectedWord(items[0]);
            }
          } else {
            setSelectedWord(null);
            setWordDetail(null);
          }
        })
        .catch((err: any) => console.error("GetWordsByLexFile error:", err))
        .finally(() => {
          if (active) setWordsLoading(false);
        });
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [selectedLexFile, wordFilter]);

  // Load word detail analysis when selectedWord changes
  useEffect(() => {
    if (!selectedWord) {
      setWordDetail(null);
      return;
    }
    let active = true;
    setDetailLoading(true);

    AnalyzeWord(selectedWord.word, selectedWord.definition || selectedWord.word, 1)
      .then((res: LexicalAnalysisResult) => {
        if (!active) return;
        setWordDetail(res);
      })
      .catch((err: any) => console.error("AnalyzeWord error:", err))
      .finally(() => {
        if (active) setDetailLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedWord]);

  // Autonavigation handler when clicking words in Taxonomic Relations or Synonyms
  const handleNavigateToWord = async (rawWord: string) => {
    if (!rawWord) return;
    const target = rawWord.trim().toLowerCase();

    // 1. If word exists in current lexfile words, jump to it directly
    const existingIdx = words.findIndex((w) => w.word.toLowerCase() === target);
    if (existingIdx !== -1) {
      const item = words[existingIdx];
      setSelectedWord(item);
      if (existingIdx >= visibleCount) {
        setVisibleCount(existingIdx + 50);
      }
      setTimeout(() => {
        const el = document.getElementById(`word-item-${target}`);
        el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }, 50);
      return;
    }

    // 2. Query backend to find primary LexFile and word info
    try {
      const loc = await FindWordLocation(target);
      if (!loc) return;

      pendingTargetWordRef.current = target;

      if (loc.lexfile && loc.lexfile !== selectedLexFile) {
        setWordFilter("");
        setSelectedLexFile(loc.lexfile);
        setTimeout(() => {
          const lexEl = document.getElementById(`lexfile-${loc.lexfile}`);
          lexEl?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }, 100);
      }
      setSelectedWord(loc);
    } catch (err) {
      console.error("Failed to autonavigate to word:", err);
    }
  };

  // Filter lexFiles by search
  const filteredLexFiles = lexFiles.filter((lf) => {
    if (!lexFilter.trim()) return true;
    const q = lexFilter.toLowerCase();
    const visual = getLexFileVisual(lf.name);
    return lf.name.toLowerCase().includes(q) || visual.label.toLowerCase().includes(q);
  });

  const visibleWords = useMemo(() => {
    return words.slice(0, visibleCount);
  }, [words, visibleCount]);

  return (
    <HStack flex="1" h="100%" gap={0} alignItems="stretch" overflow="hidden" bg="gray.950">
      {/* 1. LEFT PANEL: LexFiles List (45 categories) */}
      <Flex
        direction="column"
        w="270px"
        minW="240px"
        h="100%"
        borderRightWidth="1px"
        borderColor="gray.800"
        bg="gray.900"
        overflow="hidden"
      >
        <Box p="3" borderBottomWidth="1px" borderColor="gray.800">
          <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="blue.300" letterSpacing="0.05em" mb="2">
            Lexicographer Files ({lexFiles.length})
          </Text>
          <HStack
            bg="gray.950"
            borderRadius="md"
            px="2.5"
            py="1"
            borderWidth="1px"
            borderColor="gray.800"
          >
            <LuSearch size={14} color="gray" />
            <Input
              variant="flushed"
              size="xs"
              placeholder="Filter LexFiles..."
              value={lexFilter}
              onChange={(e) => setLexFilter(e.target.value)}
              border="none"
              _focus={{ outline: "none" }}
              color="gray.100"
            />
          </HStack>
        </Box>

        {/* Scrollable LexFiles List */}
        <Box flex="1" overflowY="auto" p="1.5">
          {filteredLexFiles.map((lf) => {
            const visual = getLexFileVisual(lf.name);
            const isSelected = selectedLexFile === lf.name;

            return (
              <HStack
                id={`lexfile-${lf.name}`}
                key={lf.name}
                gap="2.5"
                p="2"
                my="0.5"
                borderRadius="md"
                cursor="pointer"
                bg={isSelected ? "blue.900" : "transparent"}
                color={isSelected ? "white" : "gray.300"}
                _hover={{
                  bg: isSelected ? "blue.850" : "whiteAlpha.50",
                  color: "white",
                }}
                onClick={() => {
                  setSelectedLexFile(lf.name);
                  setWordFilter("");
                }}
                transition="all 0.15s ease"
              >
                <Box color={isSelected ? "blue.200" : `${visual.palette}.400`} fontSize="md">
                  {visual.icon}
                </Box>
                <VStack align="start" gap={0} flex="1" overflow="hidden">
                  <Text fontSize="xs" fontWeight={isSelected ? "semibold" : "medium"} truncate maxW="150px">
                    {visual.label}
                  </Text>
                  <Text fontSize="xs" color={isSelected ? "blue.200" : "gray.400"}>
                    {lf.name}
                  </Text>
                </VStack>
                <Badge size="xs" variant="subtle" colorPalette={isSelected ? "blue" : "gray"}>
                  {lf.wordCount.toLocaleString()}
                </Badge>
              </HStack>
            );
          })}
        </Box>
      </Flex>

      {/* 2. MIDDLE PANEL: Words List in selected LexFile */}
      <Flex
        direction="column"
        w="340px"
        minW="280px"
        h="100%"
        borderRightWidth="1px"
        borderColor="gray.800"
        bg="gray.925"
        overflow="hidden"
      >
        <Box p="3" borderBottomWidth="1px" borderColor="gray.800">
          <HStack justify="space-between" mb="2">
            <HStack gap="1.5">
              {selectedLexFile && (
                <Box color="blue.300" fontSize="sm">
                  {getLexFileVisual(selectedLexFile).icon}
                </Box>
              )}
              <Text fontSize="xs" fontWeight="bold" color="gray.200" truncate maxW="200px">
                {selectedLexFile ? getLexFileVisual(selectedLexFile).label : "Vocabulary"}
              </Text>
            </HStack>
            <Badge size="xs" variant="outline" colorPalette="blue">
              {wordFilter.trim()
                ? `${words.length.toLocaleString()} found`
                : `${words.length.toLocaleString()} words`}
            </Badge>
          </HStack>

          <HStack
            bg="gray.950"
            borderRadius="md"
            px="2.5"
            py="1"
            borderWidth="1px"
            borderColor="gray.800"
          >
            <LuSearch size={14} color="gray" />
            <Input
              variant="flushed"
              size="xs"
              placeholder={`Search in ${selectedLexFile || "domain"}...`}
              value={wordFilter}
              onChange={(e) => setWordFilter(e.target.value)}
              border="none"
              _focus={{ outline: "none" }}
              color="gray.100"
            />
          </HStack>
        </Box>

        {/* Scrollable Word List (A-Z) */}
        <Box
          flex="1"
          overflowY="auto"
          p="1.5"
          onScroll={(e) => {
            const target = e.currentTarget;
            if (target.scrollHeight - target.scrollTop - target.clientHeight < 300) {
              if (visibleCount < words.length) {
                setVisibleCount((prev) => Math.min(prev + 100, words.length));
              }
            }
          }}
        >
          {wordsLoading ? (
            <Flex justify="center" align="center" h="150px">
              <HStack gap="2" color="gray.400" fontSize="xs">
                <Spinner size="xs" color="blue.400" />
                <Text>Loading vocabulary...</Text>
              </HStack>
            </Flex>
          ) : words.length === 0 ? (
            <Flex justify="center" align="center" h="150px" p="4" textAlign="center">
              <Text fontSize="xs" color="gray.300">
                No words match your filter.
              </Text>
            </Flex>
          ) : (
            <>
              {visibleWords.map((item) => {
                const isSelected = selectedWord?.word.toLowerCase() === item.word.toLowerCase();
                return (
                  <Box
                    id={`word-item-${item.word.toLowerCase()}`}
                    key={`${item.word}-${item.synsetId || item.definition}`}
                    p="2"
                    my="1"
                    borderRadius="md"
                    cursor="pointer"
                    bg={isSelected ? "blue.950" : "whiteAlpha.50"}
                    borderWidth="1px"
                    borderColor={isSelected ? "blue.500" : "transparent"}
                    _hover={{
                      bg: isSelected ? "blue.950" : "whiteAlpha.100",
                      borderColor: isSelected ? "blue.400" : "gray.800",
                    }}
                    onClick={() => setSelectedWord(item)}
                    transition="all 0.15s ease"
                  >
                    <HStack justify="space-between" mb="0.5">
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color={isSelected ? "blue.200" : "gray.100"}
                        truncate
                      >
                        {item.word}
                      </Text>
                      <PosBadge pos={item.pos} size="xs" />
                    </HStack>
                    <Text
                      fontSize="xs"
                      color="gray.400"
                      lineClamp={2}
                      lineHeight="1.4"
                    >
                      {item.definition || "No definition available"}
                    </Text>
                  </Box>
                );
              })}
              {visibleCount < words.length && (
                <Flex justify="center" py="2">
                  <Text fontSize="xs" color="gray.500">
                    Showing {visibleWords.length} of {words.length.toLocaleString()} words (scroll for more)
                  </Text>
                </Flex>
              )}
            </>
          )}
        </Box>
      </Flex>

      {/* 3. RIGHT PANEL: Selected Word Definitions, Examples & Relations */}
      <Flex direction="column" flex="1" h="100%" bg="gray.950" overflow="hidden">
        {selectedWord ? (
          <Flex direction="column" h="100%" overflowY="auto" p="5">
            {/* Header / Title */}
            <Flex justify="space-between" align="center" mb="4" pb="3" borderBottomWidth="1px" borderColor="gray.800">
              <VStack align="start" gap="1">
                <HStack gap="2" align="baseline">
                  <Text fontSize="2xl" fontWeight="bold" color="gray.100" letterSpacing="-0.02em">
                    {selectedWord.word}
                  </Text>
                  <PosBadge pos={selectedWord.pos} size="sm" />
                  {selectedLexFile && <LexFileBadge lexfile={selectedLexFile} size="sm" />}
                </HStack>
                <Text fontSize="xs" color="gray.300">
                  Synset ID: {selectedWord.synsetId}
                </Text>
              </VStack>

              {onInsertWord && (
                <Button
                  size="xs"
                  colorPalette="blue"
                  variant="surface"
                  onClick={() => onInsertWord(selectedWord.word)}
                >
                  <LuCopy size={13} />
                  Insert Word to Editor
                </Button>
              )}
            </Flex>

            {detailLoading ? (
              <Flex justify="center" align="center" py="10">
                <HStack gap="2" color="gray.400" fontSize="xs">
                  <Spinner size="sm" color="blue.400" />
                  <Text>Fetching lexical analysis & examples...</Text>
                </HStack>
              </Flex>
            ) : (
              <VStack align="stretch" gap="4">
                {/* Upper Section: Definitions & Senses side-by-side with Synonyms by Sense */}
                <HStack align="start" gap="5" w="100%">
                  {/* Left Column: Definitions & Senses */}
                  <Box flex={wordDetail?.synonymGroups && wordDetail.synonymGroups.length > 0 ? "1.15" : "1"} minW="0">
                    <HStack gap="1.5" mb="3">
                      <LuBookOpen size={16} color="#60a5fa" />
                      <Text fontSize="sm" fontWeight="bold" color="gray.200">
                        Definitions & Senses
                      </Text>
                    </HStack>

                    {wordDetail?.senses && wordDetail.senses.length > 0 ? (
                      <VStack align="stretch" gap="2.5">
                        {wordDetail.senses.map((sense, idx) => {
                          const lexVis = sense.lexfile ? getLexFileVisual(sense.lexfile) : null;
                          const posVis = getPosVisual(sense.pos);

                          return (
                            <Box
                              key={sense.id || idx}
                              position="relative"
                              overflow="hidden"
                              bg="gray.900"
                              borderRadius="md"
                              borderWidth="1px"
                              borderColor="gray.800"
                            >
                              {/* Top-Right: Sense number absolute at right: 0, top: 0 with large number */}
                              <Box
                                position="absolute"
                                top="0"
                                right="0"
                                px="3"
                                py="1"
                                bg="blue.950"
                                borderBottomLeftRadius="lg"
                                borderLeftWidth="1px"
                                borderBottomWidth="1px"
                                borderColor="blue.800"
                                zIndex={2}
                              >
                                <Text
                                  fontSize="lg"
                                  fontWeight="black"
                                  color="blue.300"
                                  lineHeight="1"
                                >
                                  #{sense.senseNumber || idx + 1}
                                </Text>
                              </Box>

                              {/* Top-Left: LexFile label absolute at left: 0, top: 0 */}
                              {lexVis && (
                                <Box
                                  position="absolute"
                                  top="0"
                                  left="0"
                                  px="2.5"
                                  py="1"
                                  bg={`${lexVis.palette}.950`}
                                  borderBottomRightRadius="md"
                                  borderRightWidth="1px"
                                  borderBottomWidth="1px"
                                  borderColor={`${lexVis.palette}.800`}
                                  zIndex={2}
                                >
                                  <HStack gap="1.5" color={`${lexVis.palette}.300`} fontSize="xs" fontWeight="semibold">
                                    {lexVis.icon}
                                    <Text as="span">{lexVis.label}</Text>
                                  </HStack>
                                </Box>
                              )}

                              {/* Left-Middle: Vertical POS badge with icon and label */}
                              <Box
                                position="absolute"
                                left="0"
                                top="50%"
                                transform="translateY(-50%)"
                                bg={`${posVis.palette}.950`}
                                borderRightWidth="1px"
                                borderTopRightRadius="md"
                                borderBottomRightRadius="md"
                                borderColor={`${posVis.palette}.800`}
                                py="2.5"
                                px="1.5"
                                zIndex={2}
                                boxShadow="sm"
                              >
                                <VStack gap="1" align="center" color={`${posVis.palette}.300`}>
                                  <Box fontSize="sm" color={`${posVis.palette}.300`} display="flex" alignItems="center">
                                    {posVis.icon}
                                  </Box>
                                  <Text
                                    fontSize="xs"
                                    fontWeight="bold"
                                    textTransform="uppercase"
                                    letterSpacing="0.1em"
                                    lineHeight="1"
                                    style={{
                                      writingMode: "vertical-rl",
                                      textOrientation: "mixed",
                                    }}
                                  >
                                    {posVis.label}
                                  </Text>
                                </VStack>
                              </Box>

                              {/* Main Content Area: Offset cleanly from absolute badges */}
                              <Box pl="56px" pr="52px" pt="38px" pb="3.5">
                                <Text fontSize="md" color="gray.100" mb="2.5" lineHeight="1.6">
                                  {sense.definition}
                                </Text>

                                {/* Examples */}
                                {sense.examples && sense.examples.length > 0 && (
                                  <VStack align="stretch" gap="1.5" mt="3" pt="2.5" borderTopWidth="1px" borderTopStyle="dashed" borderColor="gray.800">
                                    <HStack gap="1.5" color="gray.400">
                                      <LuQuote size={13} color="#90CDF4" />
                                      <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="0.05em" color="gray.400">
                                        Examples:
                                      </Text>
                                    </HStack>
                                    {sense.examples.map((ex, exIdx) => (
                                      <HStack key={exIdx} align="start" gap="2" pl="1">
                                        <Text fontSize="sm" color="blue.200" fontStyle="italic" lineHeight="1.5">
                                          "{ex}"
                                        </Text>
                                      </HStack>
                                    ))}
                                  </VStack>
                                )}
                              </Box>
                            </Box>
                          );
                        })}
                      </VStack>
                    ) : (
                      <Box
                        position="relative"
                        overflow="hidden"
                        bg="gray.900"
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="gray.800"
                      >
                        <Box
                          position="absolute"
                          top="0"
                          right="0"
                          px="3"
                          py="1"
                          bg="blue.950"
                          borderBottomLeftRadius="lg"
                          borderLeftWidth="1px"
                          borderBottomWidth="1px"
                          borderColor="blue.800"
                          zIndex={2}
                        >
                          <Text fontSize="lg" fontWeight="black" color="blue.300" lineHeight="1">
                            #1
                          </Text>
                        </Box>

                        {selectedLexFile && (() => {
                          const lexVis = getLexFileVisual(selectedLexFile);
                          return (
                            <Box
                              position="absolute"
                              top="0"
                              left="0"
                              px="2.5"
                              py="1"
                              bg={`${lexVis.palette}.950`}
                              borderBottomRightRadius="md"
                              borderRightWidth="1px"
                              borderBottomWidth="1px"
                              borderColor={`${lexVis.palette}.800`}
                              zIndex={2}
                            >
                              <HStack gap="1.5" color={`${lexVis.palette}.300`} fontSize="xs" fontWeight="semibold">
                                {lexVis.icon}
                                <Text as="span">{lexVis.label}</Text>
                              </HStack>
                            </Box>
                          );
                        })()}

                        {(() => {
                          const posVis = getPosVisual(selectedWord.pos);
                          return (
                            <Box
                              position="absolute"
                              left="0"
                              top="50%"
                              transform="translateY(-50%)"
                              bg={`${posVis.palette}.950`}
                              borderRightWidth="1px"
                              borderTopRightRadius="md"
                              borderBottomRightRadius="md"
                              borderColor={`${posVis.palette}.800`}
                              py="2.5"
                              px="1.5"
                              zIndex={2}
                              boxShadow="sm"
                            >
                              <VStack gap="1" align="center" color={`${posVis.palette}.300`}>
                                <Box fontSize="sm" color={`${posVis.palette}.300`} display="flex" alignItems="center">
                                  {posVis.icon}
                                </Box>
                                <Text
                                  fontSize="xs"
                                  fontWeight="bold"
                                  textTransform="uppercase"
                                  letterSpacing="0.1em"
                                  lineHeight="1"
                                  style={{
                                    writingMode: "vertical-rl",
                                    textOrientation: "mixed",
                                  }}
                                >
                                  {posVis.label}
                                </Text>
                              </VStack>
                            </Box>
                          );
                        })()}

                        {/* Main Content Area */}
                        <Box pl="56px" pr="52px" pt="38px" pb="3.5">
                          <Text fontSize="md" color="gray.100" lineHeight="1.6">
                            {selectedWord.definition}
                          </Text>
                          {selectedWord.examples && selectedWord.examples.length > 0 && (
                            <VStack align="stretch" gap="1.5" mt="3" pt="2.5" borderTopWidth="1px" borderTopStyle="dashed" borderColor="gray.800">
                              <HStack gap="1.5" color="gray.400">
                                <LuQuote size={13} color="#90CDF4" />
                                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="0.05em" color="gray.400">
                                  Examples:
                                </Text>
                              </HStack>
                              {selectedWord.examples.map((ex, exIdx) => (
                                <Text key={exIdx} fontSize="sm" color="blue.200" fontStyle="italic" pl="1" lineHeight="1.5">
                                  "{ex}"
                                </Text>
                              ))}
                            </VStack>
                          )}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Right Column: Synonyms by Sense */}
                  {wordDetail?.synonymGroups && wordDetail.synonymGroups.length > 0 && (
                    <Box flex="0.85" minW="0">
                      <HStack gap="1.5" mb="3">
                        <LuSparkles size={16} color="#34d399" />
                        <Text fontSize="sm" fontWeight="bold" color="gray.200">
                          Synonyms by Sense
                        </Text>
                      </HStack>
                      <VStack align="stretch" gap="2.5">
                        {wordDetail.synonymGroups.map((grp, gIdx) => (
                          <Box
                            key={gIdx}
                            position="relative"
                            overflow="hidden"
                            p="3.5"
                            pt="3"
                            bg="gray.900"
                            borderRadius="md"
                            borderWidth="1px"
                            borderColor="gray.800"
                          >
                            {/* Top-Right: Sense #N absolute at right: 0, top: 0 with color */}
                            <Box
                              position="absolute"
                              top="0"
                              right="0"
                              px="3"
                              py="1"
                              bg="green.950"
                              borderBottomLeftRadius="md"
                              borderLeftWidth="1px"
                              borderBottomWidth="1px"
                              borderColor="green.800"
                              zIndex={2}
                            >
                              <Text fontSize="xs" fontWeight="bold" color="green.300">
                                Sense #{grp.senseNumber}
                              </Text>
                            </Box>

                            {/* Definition text with larger font size */}
                            <Text
                              fontSize="sm"
                              color="gray.200"
                              mb="3"
                              fontWeight="medium"
                              lineHeight="1.5"
                              pr="20"
                            >
                              {grp.senseDefinition}
                            </Text>

                            <Flex wrap="wrap" gap="2">
                              {grp.words?.map((w, wIdx) => (
                                <Badge
                                  key={wIdx}
                                  size="sm"
                                  colorPalette="green"
                                  variant="subtle"
                                  px="2.5"
                                  py="1"
                                  borderRadius="md"
                                  cursor="pointer"
                                  transition="all 0.15s ease"
                                  _hover={{
                                    bg: "green.800",
                                    color: "green.100",
                                    transform: "translateY(-1px)",
                                  }}
                                  title={`Click to navigate to "${w}"`}
                                  onClick={() => handleNavigateToWord(w)}
                                >
                                  {w}
                                </Badge>
                              ))}
                            </Flex>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </HStack>

                {/* Lower Section: Taxonomic Relations (Spanning full width) */}
                {((wordDetail?.hypernyms && wordDetail.hypernyms.length > 0) ||
                  (wordDetail?.hyponyms && wordDetail.hyponyms.length > 0)) && (
                  <Box mt="2">
                    <HStack justify="space-between" mb="3">
                      <Text fontSize="sm" fontWeight="bold" color="gray.200">
                        Taxonomic Relations
                      </Text>
                      <Text fontSize="xs" color="gray.450">
                        (Click any word to autonavigate)
                      </Text>
                    </HStack>
                    <HStack align="start" gap="4">
                      {wordDetail?.hypernyms && wordDetail.hypernyms.length > 0 && (
                        <Box flex="1" p="3.5" bg="gray.900" borderRadius="md" borderWidth="1px" borderColor="gray.800">
                          <Text fontSize="xs" color="purple.300" fontWeight="semibold" mb="2.5">
                            Hypernyms (Broader)
                          </Text>
                          <Flex wrap="wrap" gap="2">
                            {wordDetail.hypernyms.map((h, i) => (
                              <Badge
                                key={i}
                                size="sm"
                                colorPalette="purple"
                                variant="subtle"
                                borderRadius="md"
                                cursor="pointer"
                                px="2.5"
                                py="1"
                                transition="all 0.15s ease"
                                _hover={{
                                  bg: "purple.800",
                                  color: "purple.100",
                                  transform: "translateY(-1px)",
                                }}
                                title={`Click to navigate to "${h}"`}
                                onClick={() => handleNavigateToWord(h)}
                              >
                                {h}
                              </Badge>
                            ))}
                          </Flex>
                        </Box>
                      )}
                      {wordDetail?.hyponyms && wordDetail.hyponyms.length > 0 && (
                        <Box flex="1" p="3.5" bg="gray.900" borderRadius="md" borderWidth="1px" borderColor="gray.800">
                          <Text fontSize="xs" color="teal.300" fontWeight="semibold" mb="2.5">
                            Hyponyms (Specific)
                          </Text>
                          <Flex wrap="wrap" gap="2">
                            {wordDetail.hyponyms.slice(0, 20).map((h, i) => (
                              <Badge
                                key={i}
                                size="sm"
                                colorPalette="teal"
                                variant="subtle"
                                borderRadius="md"
                                cursor="pointer"
                                px="2.5"
                                py="1"
                                transition="all 0.15s ease"
                                _hover={{
                                  bg: "teal.800",
                                  color: "teal.100",
                                  transform: "translateY(-1px)",
                                }}
                                title={`Click to navigate to "${h}"`}
                                onClick={() => handleNavigateToWord(h)}
                              >
                                {h}
                              </Badge>
                            ))}
                          </Flex>
                        </Box>
                      )}
                    </HStack>
                  </Box>
                )}
              </VStack>
            )}
          </Flex>
        ) : (
          <Flex justify="center" align="center" h="100%" color="gray.300" direction="column" gap="3">
            <LuBookOpen size={42} />
            <Text fontSize="sm">Select a word from the list to explore definitions and examples.</Text>
          </Flex>
        )}
      </Flex>
    </HStack>
  );
};
