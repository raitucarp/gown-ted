import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
  Button,
  Tabs,
  Input,
  Group,
  Stat,
  EmptyState,
} from "@chakra-ui/react";
import {
  LuMusic,
  LuVolume2,
  LuSearch,
  LuSparkles,
  LuReplace,
  LuPlus,
  LuChevronDown,
} from "react-icons/lu";
import { PhonologyInfo, PoeticSuggestionsResult } from "../../../bindings/github.com/raitucarp/gown-ted/models.js";
import { GetPoeticSuggestions } from "../../../bindings/github.com/raitucarp/gown-ted/lexicalservice.js";
import { PanelScrollArea } from "../ui/panel-scroll-area";
import { getPosVisual } from "../../utils/lexicalIcons";

interface PoeticsPanelProps {
  word: string;
  phonology?: PhonologyInfo | null;
  poetics?: PoeticSuggestionsResult | null;
  onInspectWord: (word: string) => void;
  onReplaceWord?: (replacement: string) => void;
  onInsertWord?: (insertion: string) => void;
  onToggleCollapse?: () => void;
}

const renderHighlightedText = (text: string, query?: string) => {
  if (!text) return null;
  if (!query || query.trim().length < 2) return text;

  const q = query.trim().toLowerCase();
  const lower = text.toLowerCase();
  const matchIdx = lower.indexOf(q);

  let displayText = text;
  if (matchIdx > 40) {
    const startIdx = Math.max(0, matchIdx - 15);
    displayText = "..." + text.slice(startIdx);
  }

  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = displayText.split(regex);
  if (parts.length === 1) return displayText;

  return parts.map((part, i) => {
    if (part.toLowerCase() === q) {
      return (
        <Text
          as="span"
          key={i}
          color="yellow.200"
          bg="rgba(234, 179, 8, 0.35)"
          px="1"
          py="0.5"
          borderRadius="xs"
          fontWeight="bold"
          borderBottom="1px solid"
          borderColor="yellow.400"
        >
          {part}
        </Text>
      );
    }
    return <Text as="span" key={i}>{part}</Text>;
  });
};

export const PoeticsPanel: React.FC<PoeticsPanelProps> = ({
  word,
  phonology,
  poetics,
  onInspectWord,
  onReplaceWord,
  onInsertWord,
  onToggleCollapse,
}) => {
  const [poeticsData, setPoeticsData] = useState<PoeticSuggestionsResult | null>(poetics || null);
  const [poeticsLoading, setPoeticsLoading] = useState(false);
  const [poeticsSearch, setPoeticsSearch] = useState("");
  const [syllableFilter, setSyllableFilter] = useState<number | "all">("all");
  const [poeticSection, setPoeticSection] = useState<"rhymes" | "alliterations" | "cv">("rhymes");

  useEffect(() => {
    if (poetics) {
      setPoeticsData(poetics);
    } else if (word) {
      GetPoeticSuggestions(word).then((res) => {
        if (res) setPoeticsData(res);
      }).catch(console.error);
    }
  }, [poetics, word]);

  const handleSearchPoetics = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) return;
    setPoeticsLoading(true);
    try {
      const res = await GetPoeticSuggestions(q);
      if (res) setPoeticsData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setPoeticsLoading(false);
    }
  };

  const currentCategoryList = useMemo(() => {
    if (!poeticsData) return [];
    if (poeticSection === "rhymes") return poeticsData.rhymes || [];
    if (poeticSection === "alliterations") return poeticsData.alliterations || [];
    if (poeticSection === "cv") return poeticsData.cvSimilar || [];
    return [];
  }, [poeticsData, poeticSection]);

  const filteredPoeticList = useMemo(() => {
    if (syllableFilter === "all") return currentCategoryList;
    if (syllableFilter === 3) {
      return currentCategoryList.filter((item) => item.syllableCount >= 3);
    }
    return currentCategoryList.filter((item) => item.syllableCount === syllableFilter);
  }, [currentCategoryList, syllableFilter]);

  return (
    <Box
      h="100%"
      display="flex"
      flexDirection="column"
      bg="gray.925"
      overflow="hidden"
    >
      <Tabs.Root defaultValue="rhymes" flex="1" display="flex" flexDirection="column" minH="0">
        {/* Header Bar */}
        <Box
          px="3"
          py="1.5"
          bg="gray.950"
          borderBottomWidth="1px"
          borderColor="gray.850"
          flexShrink={0}
        >
          <HStack justify="space-between" align="center">
            <Tabs.List
              flex="1"
              borderBottom="none"
              flexWrap="nowrap"
              overflowX="auto"
              scrollbarWidth="none"
              gap="1"
            >
              <Tabs.Trigger value="rhymes" fontSize="xs" px="2.5" py="1" whiteSpace="nowrap" flexShrink={0}>
                <LuMusic size={13} style={{ flexShrink: 0 }} />
                <Text as="span" lineClamp={1} whiteSpace="nowrap">Rhythm & Rhyme</Text>
              </Tabs.Trigger>
              <Tabs.Trigger value="phonology" fontSize="xs" px="2.5" py="1" whiteSpace="nowrap" flexShrink={0}>
                <LuVolume2 size={13} style={{ flexShrink: 0 }} />
                <Text as="span" lineClamp={1} whiteSpace="nowrap">Phonology</Text>
              </Tabs.Trigger>
              <Tabs.Indicator rounded="sm" />
            </Tabs.List>
            {onToggleCollapse && (
              <IconButton
                size="2xs"
                variant="ghost"
                color="gray.400"
                _hover={{ bg: "gray.800", color: "white" }}
                onClick={onToggleCollapse}
                title="Collapse Rhythm & Poetics Subpanel"
                aria-label="Collapse Rhythm & Poetics Subpanel"
                mb="1"
                flexShrink={0}
              >
                <LuChevronDown size={14} />
              </IconButton>
            )}
          </HStack>
        </Box>

        {/* Rhythm & Rhymes Tab Content */}
        <Tabs.Content value="rhymes" flex="1" p="0" minH="0" display="flex" flexDirection="column">
          <PanelScrollArea p="3">
            <HStack justify="space-between" align="center" mb="2.5">
              <HStack gap="1.5">
                <LuMusic size={13} color="#F6E05E" />
                <Text fontSize="2xs" fontWeight="bold" color="yellow.300" textTransform="uppercase">
                  Poetics & Rhythm Explorer
                </Text>
              </HStack>
              <Badge size="xs" variant="surface" colorPalette="yellow">
                Creative Writing
              </Badge>
            </HStack>

            {/* Metric Overview Card */}
            {poeticsData && (
              <Box p="3" bg="gray.850" borderRadius="lg" borderWidth="1px" borderColor="gray.800" mb="3">
                <HStack justify="space-between" align="center" mb="2">
                  <Text fontSize="xs" fontWeight="bold" color="gray.200">
                    "{poeticsData.word || word}"
                  </Text>
                  <HStack gap="1">
                    <Badge size="xs" variant="subtle" colorPalette="blue">
                      {poeticsData.syllableCount} {poeticsData.syllableCount === 1 ? "Syl" : "Syllables"}
                    </Badge>
                    <Badge size="xs" variant="outline" colorPalette="purple" fontFamily="monospace">
                      {poeticsData.cvPattern}
                    </Badge>
                  </HStack>
                </HStack>

                <HStack gap="2" flexWrap="wrap">
                  {poeticsData.rhymeEnding && (
                    <Badge size="xs" variant="surface" colorPalette="purple" px="2" py="1">
                      Rime / Coda: <strong>-{poeticsData.rhymeEnding}</strong>
                    </Badge>
                  )}
                  {poeticsData.onsetCluster && (
                    <Badge size="xs" variant="surface" colorPalette="teal" px="2" py="1">
                      Onset: <strong>{poeticsData.onsetCluster}-</strong>
                    </Badge>
                  )}
                </HStack>
              </Box>
            )}

            {/* Custom Search Input */}
            <Group attached w="full" mb="3">
              <Input
                size="xs"
                variant="outline"
                borderColor="gray.700"
                bg="gray.950"
                _focus={{ borderColor: "yellow.500", zIndex: 1 }}
                placeholder="Search rhymes for word..."
                value={poeticsSearch}
                onChange={(e) => setPoeticsSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchPoetics(poeticsSearch);
                }}
              />
              <Button
                size="xs"
                variant="solid"
                colorPalette="yellow"
                onClick={() => handleSearchPoetics(poeticsSearch)}
                loading={poeticsLoading}
                px="3"
                flexShrink={0}
              >
                <LuSearch size={11} />
                Find
              </Button>
            </Group>

            {/* Category Selector Buttons */}
            <HStack gap="1" mb="2.5" flexWrap="wrap">
              <Button
                size="2xs"
                variant={poeticSection === "rhymes" ? "solid" : "subtle"}
                colorPalette="purple"
                onClick={() => setPoeticSection("rhymes")}
              >
                Rhymes {poeticsData?.rhymes?.length ? `(${poeticsData.rhymes.length})` : ""}
              </Button>
              <Button
                size="2xs"
                variant={poeticSection === "alliterations" ? "solid" : "subtle"}
                colorPalette="teal"
                onClick={() => setPoeticSection("alliterations")}
              >
                Alliteration {poeticsData?.alliterations?.length ? `(${poeticsData.alliterations.length})` : ""}
              </Button>
              <Button
                size="2xs"
                variant={poeticSection === "cv" ? "solid" : "subtle"}
                colorPalette="orange"
                onClick={() => setPoeticSection("cv")}
              >
                CV Rhythm {poeticsData?.cvSimilar?.length ? `(${poeticsData.cvSimilar.length})` : ""}
              </Button>
            </HStack>

            {/* Syllable Meter Filter Pills */}
            <HStack gap="1" mb="3" align="center">
              <Text fontSize="2xs" color="gray.500" mr="1">Meter:</Text>
              {(["all", 1, 2, 3] as const).map((filterVal) => (
                <Button
                  key={String(filterVal)}
                  size="2xs"
                  variant={syllableFilter === filterVal ? "solid" : "ghost"}
                  colorPalette={syllableFilter === filterVal ? "blue" : "gray"}
                  onClick={() => setSyllableFilter(filterVal)}
                  px="2"
                  py="0.5"
                  h="auto"
                >
                  {filterVal === "all" ? "All" : filterVal === 3 ? "3+ Syl" : `${filterVal} Syl`}
                </Button>
              ))}
            </HStack>

            {/* Results List */}
            {filteredPoeticList.length > 0 ? (
              <VStack align="stretch" gap="1.5">
                {filteredPoeticList.map((item, idx) => {
                  const posVis = item.pos ? getPosVisual(item.pos) : null;
                  return (
                    <Box
                      key={`${item.word}-${idx}`}
                      p="2"
                      bg="gray.850"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="gray.800"
                      _hover={{ bg: "gray.800", borderColor: "gray.700" }}
                      transition="all 0.15s ease"
                    >
                      <HStack justify="space-between" align="center" mb="1">
                        <HStack gap="1.5" align="center">
                          <Text
                            fontSize="xs"
                            fontWeight="bold"
                            color="gray.100"
                            cursor="pointer"
                            _hover={{ color: "blue.300", textDecoration: "underline" }}
                            onClick={() => onInspectWord(item.word)}
                            title={`Inspect "${item.word}" in WordNet`}
                          >
                            {item.word}
                          </Text>
                          {posVis && (
                            <Badge
                              size="xs"
                              variant="subtle"
                              colorPalette={posVis.palette}
                              borderRadius="full"
                              px="1.5"
                              display="inline-flex"
                              alignItems="center"
                              gap="1"
                            >
                              {posVis.icon}
                              <Text as="span">{posVis.label}</Text>
                            </Badge>
                          )}
                          <Badge size="xs" variant="subtle" colorPalette="blue">
                            {item.syllableCount} {item.syllableCount === 1 ? "syl" : "syls"}
                          </Badge>
                        </HStack>

                        <HStack gap="1">
                          <IconButton
                            size="2xs"
                            variant="ghost"
                            color="gray.400"
                            _hover={{ color: "blue.300", bg: "gray.750" }}
                            onClick={() => onInspectWord(item.word)}
                            title={`Inspect "${item.word}" in WordNet`}
                            aria-label="Inspect word"
                            w="18px"
                            h="18px"
                            minW="18px"
                          >
                            <LuSparkles size={11} />
                          </IconButton>
                          {onInsertWord && (
                            <IconButton
                              size="2xs"
                              variant="ghost"
                              color="gray.400"
                              _hover={{ color: "green.300", bg: "gray.750" }}
                              onClick={() => onInsertWord(item.word)}
                              title={`Insert "${item.word}" next to cursor`}
                              aria-label="Insert word"
                              w="18px"
                              h="18px"
                              minW="18px"
                            >
                              <LuPlus size={11} />
                            </IconButton>
                          )}
                          {onReplaceWord && (
                            <IconButton
                              size="2xs"
                              variant="ghost"
                              color="gray.400"
                              _hover={{ color: "teal.300", bg: "gray.750" }}
                              onClick={() => onReplaceWord(item.word)}
                              title={`Replace selection with "${item.word}"`}
                              aria-label="Replace selection"
                              w="18px"
                              h="18px"
                              minW="18px"
                            >
                              <LuReplace size={11} />
                            </IconButton>
                          )}
                        </HStack>
                      </HStack>

                      {item.gloss && (
                        <Text fontSize="2xs" color="gray.300" lineClamp={2} fontStyle="italic">
                          "{renderHighlightedText(item.gloss, poeticsData?.rhymeEnding || poeticsData?.word)}"
                        </Text>
                      )}
                    </Box>
                  );
                })}
              </VStack>
            ) : (
              <EmptyState.Root size="sm">
                <EmptyState.Content>
                  <EmptyState.Indicator>
                    <LuMusic size={20} />
                  </EmptyState.Indicator>
                  <VStack textAlign="center">
                    <EmptyState.Title>No Poetic Matches</EmptyState.Title>
                    <EmptyState.Description>
                      {poeticsData
                        ? `No ${poeticSection} suggestions found matching the current meter filter.`
                        : "Select or search for a word to explore rhymes and rhythm."}
                    </EmptyState.Description>
                  </VStack>
                </EmptyState.Content>
              </EmptyState.Root>
            )}
          </PanelScrollArea>
        </Tabs.Content>

        {/* Phonology Tab Content */}
        <Tabs.Content value="phonology" flex="1" p="0" minH="0" display="flex" flexDirection="column">
          <PanelScrollArea p="3">
            <Text fontSize="2xs" fontWeight="bold" color="teal.300" textTransform="uppercase" mb="2">
              Phonology & Syllable Metrics
            </Text>
            {phonology ? (
              <VStack align="stretch" gap="3">
                <Box p="3" bg="gray.850" borderRadius="lg" borderWidth="1px" borderColor="gray.800">
                  <Stat.Root>
                    <Stat.Label fontSize="2xs" color="gray.400">Total Syllables</Stat.Label>
                    <HStack justify="space-between" mt="1">
                      <Stat.ValueText fontSize="xl" fontWeight="bold" color="teal.200">
                        {phonology.syllableCount}
                      </Stat.ValueText>
                      <Badge size="sm" variant="surface" colorPalette="teal">
                        {phonology.syllableCount === 1 ? "Monosyllabic" : "Polysyllabic"}
                      </Badge>
                    </HStack>
                  </Stat.Root>
                </Box>

                {phonology.syllables && phonology.syllables.length > 0 && (
                  <Box p="3" bg="gray.850" borderRadius="lg" borderWidth="1px" borderColor="gray.800">
                    <Text fontSize="xs" color="gray.400" mb="2">
                      Syllable Breakdown (SSP)
                    </Text>
                    <HStack flexWrap="wrap" gap="1.5">
                      {phonology.syllables.map((syl, i) => (
                        <Badge key={i} size="sm" variant="subtle" colorPalette="cyan" borderRadius="full" px="2.5">
                          {syl}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                )}

                {phonology.cvPattern && (
                  <Box p="3" bg="gray.850" borderRadius="lg" borderWidth="1px" borderColor="gray.800">
                    <HStack justifyContent="space-between">
                      <Box>
                        <Text fontSize="xs" color="gray.400">
                          Consonant-Vowel (CV) Pattern
                        </Text>
                        <Text fontSize="2xs" color="gray.500">
                          Orthographic skeletal tier
                        </Text>
                      </Box>
                      <Badge size="sm" colorPalette="purple" variant="outline" fontFamily="monospace" px="2">
                        {phonology.cvPattern}
                      </Badge>
                    </HStack>
                  </Box>
                )}
              </VStack>
            ) : (
              <EmptyState.Root size="sm">
                <EmptyState.Content>
                  <EmptyState.Indicator>
                    <LuVolume2 size={20} />
                  </EmptyState.Indicator>
                  <VStack textAlign="center">
                    <EmptyState.Title>No Phonology Data</EmptyState.Title>
                    <EmptyState.Description>
                      Phonological analysis is not available for this entry.
                    </EmptyState.Description>
                  </VStack>
                </EmptyState.Content>
              </EmptyState.Root>
            )}
          </PanelScrollArea>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};
