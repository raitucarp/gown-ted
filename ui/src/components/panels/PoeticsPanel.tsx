import React, { useState, useEffect, useMemo, useRef } from "react";
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
  InputGroup,
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
  LuChevronUp,
  LuFeather,
  LuLayers,
  LuWaves,
  LuAudioWaveform,
  LuSlidersHorizontal,
  LuType,
} from "react-icons/lu";
import type { PhonologyInfo, PoeticSuggestionsResult } from "@types";
import { GetPoeticSuggestions } from "@bindings/github.com/raitucarp/gown-ted/service/lexicalservice.js";
import { PanelScrollArea } from "../ui/panel-scroll-area";
import { getPosVisual } from "@utils/lexicalIcons";

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
  const tabsScrollRef = useRef<HTMLDivElement>(null);

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

  const scrollTabs = (delta: number) => {
    if (tabsScrollRef.current) {
      tabsScrollRef.current.scrollBy({ top: delta, behavior: "smooth" });
    }
  };

  const poeticTabs: Array<{
    id: "rhymes" | "alliterations" | "cv";
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
    colorPalette: "purple" | "teal" | "orange";
    count: number;
  }> = [
    {
      id: "rhymes",
      label: "Rhymes",
      shortLabel: "Rhyme",
      icon: <LuMusic size={14} />,
      colorPalette: "purple",
      count: poeticsData?.rhymes?.length || 0,
    },
    {
      id: "alliterations",
      label: "Alliteration",
      shortLabel: "Allit",
      icon: <LuType size={14} />,
      colorPalette: "teal",
      count: poeticsData?.alliterations?.length || 0,
    },
    {
      id: "cv",
      label: "CV Rhythm",
      shortLabel: "Rhythm",
      icon: <LuWaves size={14} />,
      colorPalette: "orange",
      count: poeticsData?.cvSimilar?.length || 0,
    },
  ];

  const currentTab = poeticTabs.find((t) => t.id === poeticSection) || poeticTabs[0];

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
                size="xs"
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
        <Tabs.Content value="rhymes" flex="1" p="0" minH="0" display="flex" flexDirection="row" overflow="hidden">
          {/* Main Left Content */}
          <Box flex="1" minW="0" h="100%" display="flex" flexDirection="column" overflow="hidden" bg="gray.900">
            {/* Sticky Top: Search Input and Find Button */}
            <Box
              px="3"
              py="2"
              borderBottomWidth="1px"
              borderColor="gray.800"
              bg="gray.950"
              flexShrink={0}
            >
              <Group attached w="full">
                <Input
                  size="sm"
                  variant="outline"
                  borderColor="gray.750"
                  bg="gray.900"
                  px="3.5"
                  _focus={{ borderColor: "blue.500", zIndex: 1 }}
                  placeholder="Search rhymes for word..."
                  value={poeticsSearch}
                  onChange={(e) => setPoeticsSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchPoetics(poeticsSearch);
                  }}
                />
                <Button
                  size="sm"
                  variant="solid"
                  colorPalette="blue"
                  onClick={() => handleSearchPoetics(poeticsSearch)}
                  loading={poeticsLoading}
                  px="3.5"
                  fontWeight="medium"
                  flexShrink={0}
                >
                  <LuSearch size={14} />
                  Find
                </Button>
              </Group>
            </Box>

            {/* Scroll Area for Word Metrics, Category & Meter Header, and Results List */}
            <PanelScrollArea p="0">
              {/* Word & Poetic Metrics Card (if available) */}
              {poeticsData ? (
                <Box px="3" py="2" borderBottomWidth="1px" borderColor="gray.800" bg="gray.925">
                  <HStack justify="space-between" align="center" mb="1.5" minW="0">
                    <HStack gap="1.5" minW="0">
                      <LuMusic size={13} color="#F6E05E" style={{ flexShrink: 0 }} />
                      <Text fontSize="sm" fontWeight="bold" color="yellow.200" lineClamp={1} title={poeticsData.word || word}>
                        "{poeticsData.word || word}"
                      </Text>
                    </HStack>
                    <HStack gap="1" flexShrink={0}>
                      <Badge size="xs" variant="subtle" colorPalette="blue" display="inline-flex" alignItems="center" gap="1" px="1.5" py="0.5">
                        <LuLayers size={10} />
                        <Text as="span" fontSize="xs">
                          {poeticsData.syllableCount} {poeticsData.syllableCount === 1 ? "Syl" : "Syls"}
                        </Text>
                      </Badge>
                      <Badge size="xs" variant="outline" colorPalette="purple" fontFamily="monospace" display="inline-flex" alignItems="center" gap="1" px="1.5" py="0.5">
                        <LuWaves size={10} />
                        <Text as="span" fontSize="xs">{poeticsData.cvPattern}</Text>
                      </Badge>
                    </HStack>
                  </HStack>

                  <HStack gap="1.5" flexWrap="wrap">
                    {poeticsData.rhymeEnding && (
                      <Badge size="xs" variant="surface" colorPalette="purple" display="inline-flex" alignItems="center" gap="1" px="1.5" py="0.5">
                        <LuAudioWaveform size={11} />
                        <Text as="span" fontSize="xs">
                          Rime: <strong>-{poeticsData.rhymeEnding}</strong>
                        </Text>
                      </Badge>
                    )}
                    {poeticsData.onsetCluster && (
                      <Badge size="xs" variant="surface" colorPalette="teal" display="inline-flex" alignItems="center" gap="1" px="1.5" py="0.5">
                        <LuSparkles size={11} />
                        <Text as="span" fontSize="xs">
                          Onset: <strong>{poeticsData.onsetCluster}-</strong>
                        </Text>
                      </Badge>
                    )}
                  </HStack>
                </Box>
              ) : (
                word && (
                  <Box px="3" py="2" borderBottomWidth="1px" borderColor="gray.800" bg="gray.925">
                    <HStack gap="1.5">
                      <LuMusic size={13} color="#F6E05E" />
                      <Text fontSize="sm" fontWeight="bold" color="yellow.200">
                        "{word}"
                      </Text>
                    </HStack>
                  </Box>
                )
              )}

              {/* Active Category Section Header & Syllable Meter Filter (Sticky under top search bar) */}
              <Box
                position="sticky"
                top={0}
                zIndex={5}
                bg="gray.950"
                px="3"
                py="2"
                borderBottomWidth="1px"
                borderColor="gray.800"
              >
                <HStack justify="space-between" align="center" mb="1.5" minW="0">
                  <HStack gap="1.5" minW="0">
                    <Box color={`${currentTab.colorPalette}.400`} flexShrink={0}>
                      {currentTab.icon}
                    </Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.200" textTransform="uppercase" letterSpacing="0.04em" lineClamp={1}>
                      {currentTab.label}
                    </Text>
                  </HStack>
                  <Badge
                    size="xs"
                    variant="surface"
                    colorPalette={currentTab.colorPalette}
                    px="2"
                    py="0.5"
                    borderRadius="full"
                    flexShrink={0}
                  >
                    {currentTab.count} {currentTab.count === 1 ? "match" : "matches"}
                  </Badge>
                </HStack>

                {/* Syllable Meter Filter Pills */}
                <HStack
                  gap="1"
                  align="center"
                  minW="0"
                  flexWrap="nowrap"
                  overflowX="auto"
                  css={{
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                    msOverflowStyle: "none",
                  }}
                >
                  <HStack gap="1" color="gray.400" mr="0.5" flexShrink={0}>
                    <LuSlidersHorizontal size={11} />
                    <Text fontSize="xs" fontWeight="medium">Meter:</Text>
                  </HStack>
                  {(["all", 1, 2, 3] as const).map((filterVal) => {
                    const isSelected = syllableFilter === filterVal;
                    const label = filterVal === "all" ? "All" : filterVal === 3 ? "3+ Syl" : `${filterVal} Syl`;
                    return (
                      <Button
                        key={String(filterVal)}
                        size="xs"
                        variant={isSelected ? "solid" : "subtle"}
                        colorPalette={isSelected ? "blue" : "gray"}
                        onClick={() => setSyllableFilter(filterVal)}
                        px="2"
                        py="0"
                        h="20px"
                        fontSize="xs"
                        borderRadius="sm"
                        fontWeight={isSelected ? "bold" : "normal"}
                        flexShrink={0}
                      >
                        {label}
                      </Button>
                    );
                  })}
                </HStack>
              </Box>

              {/* Seamless Results List without margin and rounded borders */}
              {filteredPoeticList.length > 0 ? (
                <VStack align="stretch" gap="0">
                  {filteredPoeticList.map((item, idx) => {
                    const posVis = item.pos ? getPosVisual(item.pos) : null;
                    return (
                      <Box
                        key={`${item.word}-${idx}`}
                        px="3"
                        py="2"
                        borderBottomWidth="1px"
                        borderColor="gray.800"
                        borderRadius="0"
                        _hover={{ bg: "whiteAlpha.50" }}
                        transition="background 0.12s ease"
                      >
                        <HStack justify="space-between" align="center" mb={item.gloss ? "1" : "0"} minW="0">
                          <HStack gap="1.5" align="center" minW="0" flexWrap="wrap">
                            <Text
                              fontSize="xs"
                              fontWeight="bold"
                              color="gray.100"
                              cursor="pointer"
                              _hover={{ color: "yellow.300", textDecoration: "underline" }}
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
                                py="0.5"
                                display="inline-flex"
                                alignItems="center"
                                gap="1"
                              >
                                {posVis.icon}
                                <Text as="span" fontSize="xs">{posVis.label}</Text>
                              </Badge>
                            )}
                            <Badge
                              size="xs"
                              variant="subtle"
                              colorPalette="blue"
                              borderRadius="full"
                              px="1.5"
                              py="0.5"
                              display="inline-flex"
                              alignItems="center"
                              gap="1"
                            >
                              <LuLayers size={10} />
                              <Text as="span" fontSize="xs">
                                {item.syllableCount} {item.syllableCount === 1 ? "syl" : "syls"}
                              </Text>
                            </Badge>
                          </HStack>

                          <HStack gap="0.5" flexShrink={0}>
                            <IconButton
                              size="xs"
                              variant="ghost"
                              color="gray.400"
                              _hover={{ color: "blue.300", bg: "blue.950" }}
                              onClick={() => onInspectWord(item.word)}
                              title={`Inspect "${item.word}" in WordNet`}
                              aria-label="Inspect word"
                              w="24px"
                              h="24px"
                              minW="24px"
                            >
                              <LuSparkles size={12} />
                            </IconButton>
                            {onInsertWord && (
                              <IconButton
                                size="xs"
                                variant="ghost"
                                color="gray.400"
                                _hover={{ color: "green.300", bg: "green.950" }}
                                onClick={() => onInsertWord(item.word)}
                                title={`Insert "${item.word}" next to cursor`}
                                aria-label="Insert word"
                                w="24px"
                                h="24px"
                                minW="24px"
                              >
                                <LuPlus size={12} />
                              </IconButton>
                            )}
                            {onReplaceWord && (
                              <IconButton
                                size="xs"
                                variant="ghost"
                                color="gray.400"
                                _hover={{ color: "teal.300", bg: "teal.950" }}
                                onClick={() => onReplaceWord(item.word)}
                                title={`Replace selection with "${item.word}"`}
                                aria-label="Replace selection"
                                w="24px"
                                h="24px"
                                minW="24px"
                              >
                                <LuReplace size={12} />
                              </IconButton>
                            )}
                          </HStack>
                        </HStack>

                        {item.gloss && (
                          <Text fontSize="xs" color="gray.400" lineClamp={2} fontStyle="italic" mt="0.5">
                            "{renderHighlightedText(item.gloss, poeticsData?.rhymeEnding || poeticsData?.word)}"
                          </Text>
                        )}
                      </Box>
                    );
                  })}
                </VStack>
              ) : (
                <Box p="4">
                  <EmptyState.Root size="sm">
                    <EmptyState.Content>
                      <EmptyState.Indicator>
                        <LuMusic size={20} />
                      </EmptyState.Indicator>
                      <VStack textAlign="center">
                        <EmptyState.Title>No Poetic Matches</EmptyState.Title>
                        <EmptyState.Description>
                          {poeticsData
                            ? `No ${currentTab.label.toLowerCase()} suggestions found matching the current meter filter.`
                            : "Select or search for a word to explore rhymes and rhythm."}
                        </EmptyState.Description>
                      </VStack>
                    </EmptyState.Content>
                  </EmptyState.Root>
                </Box>
              )}
            </PanelScrollArea>
          </Box>

          {/* Right Vertical Tab Rail */}
          <Box
            w="42px"
            minW="42px"
            borderLeftWidth="1px"
            borderColor="gray.800"
            bg="gray.950"
            display="flex"
            flexDirection="column"
            overflow="hidden"
            flexShrink={0}
          >
            {/* Scrollable Tabs Container (No native scrollbar) */}
            <Box
              ref={tabsScrollRef}
              flex="1"
              display="flex"
              flexDirection="column"
              overflowY="auto"
              gap="2"
              py="1.5"
              css={{
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
              }}
            >
              {poeticTabs.map((tab) => {
                const isActive = poeticSection === tab.id;
                return (
                  <Box
                    as="button"
                    key={tab.id}
                    onClick={() => setPoeticSection(tab.id)}
                    position="relative"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    py="2.5"
                    px="1"
                    gap="2"
                    cursor="pointer"
                    borderRightWidth="2.5px"
                    borderColor={isActive ? `${tab.colorPalette}.400` : "transparent"}
                    bg={isActive ? "whiteAlpha.150" : "transparent"}
                    _hover={{
                      bg: isActive ? "whiteAlpha.200" : "whiteAlpha.50",
                    }}
                    transition="all 0.15s ease"
                    title={`${tab.label} (${tab.count})`}
                    aria-label={`${tab.label} (${tab.count})`}
                    flexShrink={0}
                  >
                    {/* Top: Rotated Badge Count */}
                    <Badge
                      size="xs"
                      variant={isActive ? "solid" : "surface"}
                      colorPalette={tab.colorPalette}
                      transform="rotate(-90deg)"
                      borderRadius="full"
                      px="1.5"
                      py="0"
                      minW="14px"
                      h="14px"
                      display="inline-flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="xs"
                      lineHeight="1"
                      letterSpacing="-0.02em"
                      pointerEvents="none"
                      boxShadow="0 1px 2px rgba(0,0,0,0.6)"
                      whiteSpace="nowrap"
                    >
                      {tab.count}
                    </Badge>

                    {/* Middle: Text written upwards */}
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      my="1"
                      style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                    >
                      <Text
                        fontSize="xs"
                        fontWeight={isActive ? "bold" : "semibold"}
                        letterSpacing="0.08em"
                        textTransform="uppercase"
                        color={isActive ? `${tab.colorPalette}.200` : "gray.400"}
                        lineHeight="1"
                      >
                        {tab.shortLabel}
                      </Text>
                    </Box>

                    {/* Bottom: Rotated Category Icon */}
                    <Box
                      color={`${tab.colorPalette}.400`}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      transform="rotate(-90deg)"
                    >
                      {tab.icon}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Bottom Scroll Navigation Arrows (Exclusively for scrolling tabs rail) */}
            <VStack
              gap="0.5"
              py="1"
              borderTopWidth="1px"
              borderColor="gray.800"
              bg="gray.950"
              flexShrink={0}
              align="center"
            >
              <IconButton
                size="xs"
                variant="ghost"
                color="gray.400"
                _hover={{ color: "white", bg: "whiteAlpha.100" }}
                onClick={() => scrollTabs(-70)}
                title="Scroll tabs up"
                aria-label="Scroll tabs up"
                w="24px"
                h="20px"
                minW="24px"
              >
                <LuChevronUp size={12} />
              </IconButton>
              <IconButton
                size="xs"
                variant="ghost"
                color="gray.400"
                _hover={{ color: "white", bg: "whiteAlpha.100" }}
                onClick={() => scrollTabs(70)}
                title="Scroll tabs down"
                aria-label="Scroll tabs down"
                w="24px"
                h="20px"
                minW="24px"
              >
                <LuChevronDown size={12} />
              </IconButton>
            </VStack>
          </Box>
        </Tabs.Content>

        {/* Phonology Tab Content */}
        <Tabs.Content value="phonology" flex="1" p="0" minH="0" display="flex" flexDirection="column">
          <PanelScrollArea p="3">
            <Text fontSize="xs" fontWeight="bold" color="teal.300" textTransform="uppercase" mb="2">
              Phonology & Syllable Metrics
            </Text>
            {phonology ? (
              <VStack align="stretch" gap="3">
                <Box p="3" bg="gray.850" borderRadius="lg" borderWidth="1px" borderColor="gray.800">
                  <Stat.Root>
                    <Stat.Label fontSize="xs" color="gray.400">Total Syllables</Stat.Label>
                    <HStack justify="space-between" mt="1">
                      <Stat.ValueText fontSize="xl" fontWeight="bold" color="teal.200">
                        {phonology.syllableCount}
                      </Stat.ValueText>
                      <Badge size="xs" variant="surface" colorPalette="teal" display="inline-flex" alignItems="center" gap="1" px="2" py="0.5">
                        <LuLayers size={11} />
                        <Text as="span" fontSize="xs">{phonology.syllableCount === 1 ? "Monosyllabic" : "Polysyllabic"}</Text>
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
                        <Badge key={i} size="xs" variant="subtle" colorPalette="cyan" borderRadius="full" px="2.5" py="0.5" display="inline-flex" alignItems="center" gap="1">
                          <LuLayers size={10} />
                          <Text as="span" fontSize="xs">{syl}</Text>
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                )}

                {phonology.cvPattern && (
                  <Box p="3" bg="gray.850" borderRadius="lg" borderWidth="1px" borderColor="gray.800">
                    <HStack justifyContent="space-between" align="center">
                      <Box>
                        <Text fontSize="xs" color="gray.400">
                          Consonant-Vowel (CV) Pattern
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Orthographic skeletal tier
                        </Text>
                      </Box>
                      <Badge size="xs" colorPalette="purple" variant="outline" fontFamily="monospace" px="2" py="0.5" display="inline-flex" alignItems="center" gap="1">
                        <LuWaves size={11} />
                        <Text as="span" fontSize="xs">{phonology.cvPattern}</Text>
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
