import React, { useState, useRef, useMemo } from "react";
import { Box, VStack, HStack, Grid, Text, Badge, EmptyState, IconButton } from "@chakra-ui/react";
import {
  LuNetwork,
  LuArrowUpRight,
  LuArrowDownRight,
  LuGitBranch,
  LuSplit,
  LuBoxes,
  LuChevronDown,
  LuChevronUp,
  LuSearch,
} from "react-icons/lu";
import { PanelScrollArea } from "../ui/panel-scroll-area";
import { getPosVisual } from "@utils/lexicalIcons";

type RelationTabId = "lemma" | "antonyms" | "hypernyms" | "hyponyms" | "meronyms";

interface RelationshipsPanelProps {
  originalWord: string;
  lemmas: string[];
  posList: string[];
  hypernyms: string[];
  hyponyms: string[];
  meronyms: string[];
  antonyms: string[];
  onInspectWord: (word: string) => void;
  onReplaceWord?: (word: string) => void;
  onToggleCollapse?: () => void;
}

/**
 * Sorts relation words alphabetically, placing long words (> 13 chars)
 * that span the full row at the end of the list.
 */
const sortRelationWords = (words: string[]): string[] => {
  if (!words || words.length === 0) return [];
  const shortWords: string[] = [];
  const longWords: string[] = [];
  for (const w of words) {
    if (w.length > 13) {
      longWords.push(w);
    } else {
      shortWords.push(w);
    }
  }
  shortWords.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  longWords.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  return [...shortWords, ...longWords];
};

interface RelationChipProps {
  word: string;
  originalWord: string;
  colorPalette: "teal" | "blue" | "purple" | "orange" | "red" | "gray";
  icon: React.ReactNode;
  onReplace?: (word: string) => void;
  onInspect: (word: string) => void;
  isFullWidth?: boolean;
}

const RelationChip: React.FC<RelationChipProps> = ({
  word,
  originalWord,
  colorPalette,
  icon,
  onReplace,
  onInspect,
  isFullWidth,
}) => {
  // Long items (> 13 characters) span full row (1 full column)
  const isLong = isFullWidth ?? (word.length > 13);

  return (
    <HStack
      gridColumn={isLong ? "1 / -1" : undefined}
      gap="1"
      px="2"
      py="1"
      bg="gray.850"
      borderWidth="1px"
      borderColor="whiteAlpha.100"
      borderRadius="md"
      cursor="pointer"
      _hover={{
        bg: `${colorPalette}.950`,
        borderColor: `${colorPalette}.600`,
        transform: "translateY(-1px)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
      }}
      transition="all 0.15s ease"
      onClick={() => {
        if (onReplace) onReplace(word);
        else onInspect(word);
      }}
      title={`Click to substitute "${originalWord}" with "${word}" in editor`}
      alignItems="center"
      justifyContent="space-between"
      w="100%"
      minW="0"
      h="30px"
    >
      <HStack gap="1.5" minW="0" flex="1" overflow="hidden">
        <Box color={`${colorPalette}.300`} display="flex" alignItems="center" flexShrink={0}>
          {icon}
        </Box>
        <Text fontSize="xs" fontWeight="medium" color="gray.200" lineClamp={1}>
          {word}
        </Text>
      </HStack>
      <IconButton
        size="xs"
        variant="ghost"
        color="gray.500"
        _hover={{ color: "blue.200", bg: "whiteAlpha.200" }}
        onClick={(e) => {
          e.stopPropagation();
          onInspect(word);
        }}
        title={`Inspect "${word}" in WordNet`}
        aria-label={`Inspect ${word}`}
        w="18px"
        h="18px"
        minW="18px"
        flexShrink={0}
      >
        <LuSearch size={12} />
      </IconButton>
    </HStack>
  );
};

export const RelationshipsPanel: React.FC<RelationshipsPanelProps> = ({
  originalWord,
  lemmas = [],
  posList = [],
  hypernyms = [],
  hyponyms = [],
  meronyms = [],
  antonyms = [],
  onInspectWord,
  onReplaceWord,
  onToggleCollapse,
}) => {
  const [activeTab, setActiveTab] = useState<RelationTabId>("lemma");
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  const sortedLemmas = useMemo(() => sortRelationWords(lemmas), [lemmas]);
  const sortedAntonyms = useMemo(() => sortRelationWords(antonyms), [antonyms]);
  const sortedHypernyms = useMemo(() => sortRelationWords(hypernyms), [hypernyms]);
  const sortedHyponyms = useMemo(() => sortRelationWords(hyponyms), [hyponyms]);
  const sortedMeronyms = useMemo(() => sortRelationWords(meronyms), [meronyms]);

  const scrollTabs = (delta: number) => {
    if (tabsScrollRef.current) {
      tabsScrollRef.current.scrollBy({ top: delta, behavior: "smooth" });
    }
  };

  if (!originalWord) {
    return (
      <Box p="4" h="100%" display="flex" alignItems="center" justifyContent="center">
        <EmptyState.Root size="sm">
          <EmptyState.Content>
            <EmptyState.Indicator>
              <LuNetwork size={28} />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>Morphology & Relations</EmptyState.Title>
              <EmptyState.Description>
                Base lemmas, grammatical inflections, hypernyms, hyponyms, and antonyms.
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      </Box>
    );
  }

  const lemmaCount = lemmas.length > 0 ? lemmas.length : 1;
  const antonymCount = antonyms?.length || 0;
  const hypernymCount = hypernyms?.length || 0;
  const hyponymCount = hyponyms?.length || 0;
  const meronymCount = meronyms?.length || 0;

  const allTabs: Array<{
    id: RelationTabId;
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
    colorPalette: "teal" | "red" | "blue" | "purple" | "orange";
    count: number;
    instruction: string;
  }> = [
    {
      id: "lemma",
      label: "Lemma Normalization",
      shortLabel: "Lemma",
      icon: <LuGitBranch size={16} />,
      colorPalette: "teal",
      count: lemmaCount,
      instruction: "Click lemma to substitute in editor:",
    },
    {
      id: "antonyms",
      label: "Antonyms (Opposites)",
      shortLabel: "Antonym",
      icon: <LuSplit size={16} />,
      colorPalette: "red",
      count: antonymCount,
      instruction: "Click antonym to substitute in editor:",
    },
    {
      id: "hypernyms",
      label: "Hypernyms (Broader Concepts)",
      shortLabel: "Hypernym",
      icon: <LuArrowUpRight size={16} />,
      colorPalette: "blue",
      count: hypernymCount,
      instruction: `Click any hypernym to substitute "${originalWord}" in editor:`,
    },
    {
      id: "hyponyms",
      label: "Hyponyms (Narrower Concepts)",
      shortLabel: "Hyponym",
      icon: <LuArrowDownRight size={16} />,
      colorPalette: "purple",
      count: hyponymCount,
      instruction: `Click any hyponym to substitute "${originalWord}" in editor:`,
    },
    {
      id: "meronyms",
      label: "Meronyms (Parts & Components)",
      shortLabel: "Meronym",
      icon: <LuBoxes size={16} />,
      colorPalette: "orange",
      count: meronymCount,
      instruction: "Click meronym to substitute in editor:",
    },
  ];

  // Only display tabs that have items (count > 0)
  const visibleTabs = allTabs.filter((t) => t.count > 0);

  // Fall back to first visible tab if activeTab has count 0 or is not visible
  const effectiveActiveTab: RelationTabId = visibleTabs.some((t) => t.id === activeTab)
    ? activeTab
    : visibleTabs[0]?.id || "lemma";

  const currentTab = visibleTabs.find((t) => t.id === effectiveActiveTab) || allTabs[0];

  return (
    <Box h="100%" display="flex" flexDirection="column" overflow="hidden" bg="gray.900">
      {/* Panel Header */}
      <Box px="2.5" py="1.5" borderBottomWidth="1px" borderColor="gray.800" bg="gray.950" overflow="hidden">
        <HStack justifyContent="space-between" flexWrap="nowrap" minW="0" gap="2">
          <HStack gap="1.5" minW="0">
            <LuGitBranch color="#4FD1C5" size={14} style={{ flexShrink: 0 }} />
            <Text
              fontSize="xs"
              fontWeight="bold"
              color="gray.300"
              textTransform="uppercase"
              letterSpacing="0.05em"
              lineClamp={1}
              whiteSpace="nowrap"
            >
              Morphology & Relations
            </Text>
          </HStack>
          {onToggleCollapse && (
            <IconButton
              size="xs"
              variant="ghost"
              color="gray.400"
              _hover={{ bg: "gray.800", color: "white" }}
              onClick={onToggleCollapse}
              title="Collapse Morphology & Relations Subpanel"
              aria-label="Collapse Morphology Subpanel"
              flexShrink={0}
            >
              <LuChevronDown size={14} />
            </IconButton>
          )}
        </HStack>
      </Box>

      {/* Main Body: Vertical Tabs on Left + Content on Right */}
      <HStack flex="1" gap="0" align="stretch" overflow="hidden" minH="0">
        {/* Left Vertical Tab Rail */}
        {visibleTabs.length > 0 && (
          <Box
            w="42px"
            minW="42px"
            borderRightWidth="1px"
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
              {visibleTabs.map((tab) => {
                const isActive = effectiveActiveTab === tab.id;
                return (
                  <Box
                    as="button"
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    position="relative"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    py="2.5"
                    px="1"
                    gap="2"
                    cursor="pointer"
                    borderLeftWidth="2.5px"
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
                    {/* Top: Rotated Badge Count (aligned vertically with text, colored by category) */}
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
                w="26px"
                h="20px"
                minW="26px"
              >
                <LuChevronUp size={14} />
              </IconButton>
              <IconButton
                size="xs"
                variant="ghost"
                color="gray.400"
                _hover={{ color: "white", bg: "whiteAlpha.100" }}
                onClick={() => scrollTabs(70)}
                title="Scroll tabs down"
                aria-label="Scroll tabs down"
                w="26px"
                h="20px"
                minW="26px"
              >
                <LuChevronDown size={14} />
              </IconButton>
            </VStack>
          </Box>
        )}

        {/* Active Tab Content Area (With standard smooth scroll area) */}
        <Box flex="1" minW="0" h="100%" display="flex" flexDirection="column" overflow="hidden" bg="gray.900">
          <PanelScrollArea p="2.5">
            {visibleTabs.length > 0 && currentTab ? (
              <VStack align="stretch" gap="2.5">
                {/* Tab Content Header */}
                <Box>
                  <HStack justify="space-between" mb="1" align="flex-start" gap="1.5">
                    <HStack gap="1.5" minW="0" flex="1">
                      <Box color={`${currentTab.colorPalette}.300`} mt="0.5" flexShrink={0}>
                        {currentTab.icon}
                      </Box>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color={`${currentTab.colorPalette}.300`}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                        lineHeight="short"
                      >
                        {currentTab.label}
                      </Text>
                    </HStack>
                    <Badge size="xs" variant="surface" colorPalette={currentTab.colorPalette} flexShrink={0}>
                      {currentTab.count}
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.500" mb="1.5">
                    {currentTab.instruction}
                  </Text>
                </Box>

                {/* Tab 1: Lemma Content */}
                {effectiveActiveTab === "lemma" && (
                  <VStack align="stretch" gap="3">
                    <Grid templateColumns="repeat(2, minmax(0, 1fr))" autoFlow="dense" gap="1.5">
                      {sortedLemmas.length > 0 ? (
                        sortedLemmas.map((lem, idx) => (
                          <RelationChip
                            key={`${lem}-${idx}`}
                            word={lem}
                            originalWord={originalWord}
                            colorPalette="teal"
                            icon={<LuGitBranch size={12} />}
                            onReplace={onReplaceWord}
                            onInspect={onInspectWord}
                          />
                        ))
                      ) : (
                        <RelationChip
                          word={originalWord}
                          originalWord={originalWord}
                          colorPalette="teal"
                          icon={<LuGitBranch size={12} />}
                          onReplace={onReplaceWord}
                          onInspect={onInspectWord}
                        />
                      )}
                    </Grid>

                    {posList && posList.length > 0 && (
                      <Box pt="1">
                        <Text fontSize="xs" color="gray.500" mb="1.5">
                          Parts of Speech:
                        </Text>
                        <HStack flexWrap="wrap" gap="1.5">
                          {posList.map((p, i) => {
                            const posVis = getPosVisual(p);
                            return (
                              <Badge
                                key={i}
                                size="xs"
                                variant="surface"
                                colorPalette={posVis.palette}
                                borderRadius="full"
                                px="2"
                                py="0.5"
                                display="inline-flex"
                                alignItems="center"
                                gap="1"
                              >
                                {posVis.icon}
                                <Text as="span" fontSize="xs">
                                  {posVis.label}
                                </Text>
                              </Badge>
                            );
                          })}
                        </HStack>
                      </Box>
                    )}
                  </VStack>
                )}

                {/* Tab 2: Antonyms Content */}
                {effectiveActiveTab === "antonyms" && (
                  <>
                    {sortedAntonyms && sortedAntonyms.length > 0 ? (
                      <Grid templateColumns="repeat(2, minmax(0, 1fr))" autoFlow="dense" gap="1.5">
                        {sortedAntonyms.map((ant, idx) => (
                          <RelationChip
                            key={`${ant}-${idx}`}
                            word={ant}
                            originalWord={originalWord}
                            colorPalette="red"
                            icon={<LuSplit size={12} />}
                            onReplace={onReplaceWord}
                            onInspect={onInspectWord}
                          />
                        ))}
                      </Grid>
                    ) : (
                      <Box py="6" px="2" textAlign="center" bg="whiteAlpha.50" borderRadius="md">
                        <Text fontSize="xs" color="gray.500">
                          No antonyms recorded for "{originalWord}".
                        </Text>
                      </Box>
                    )}
                  </>
                )}

                {/* Tab 3: Hypernyms Content */}
                {effectiveActiveTab === "hypernyms" && (
                  <>
                    {sortedHypernyms && sortedHypernyms.length > 0 ? (
                      <Grid templateColumns="repeat(2, minmax(0, 1fr))" autoFlow="dense" gap="1.5">
                        {sortedHypernyms.map((hyp, idx) => (
                          <RelationChip
                            key={`${hyp}-${idx}`}
                            word={hyp}
                            originalWord={originalWord}
                            colorPalette="blue"
                            icon={<LuArrowUpRight size={12} />}
                            onReplace={onReplaceWord}
                            onInspect={onInspectWord}
                          />
                        ))}
                      </Grid>
                    ) : (
                      <Box py="6" px="2" textAlign="center" bg="whiteAlpha.50" borderRadius="md">
                        <Text fontSize="xs" color="gray.500">
                          No hypernyms found for "{originalWord}".
                        </Text>
                      </Box>
                    )}
                  </>
                )}

                {/* Tab 4: Hyponyms Content */}
                {effectiveActiveTab === "hyponyms" && (
                  <>
                    {sortedHyponyms && sortedHyponyms.length > 0 ? (
                      <Grid templateColumns="repeat(2, minmax(0, 1fr))" autoFlow="dense" gap="1.5">
                        {sortedHyponyms.map((hyp, idx) => (
                          <RelationChip
                            key={`${hyp}-${idx}`}
                            word={hyp}
                            originalWord={originalWord}
                            colorPalette="purple"
                            icon={<LuArrowDownRight size={12} />}
                            onReplace={onReplaceWord}
                            onInspect={onInspectWord}
                          />
                        ))}
                      </Grid>
                    ) : (
                      <Box py="6" px="2" textAlign="center" bg="whiteAlpha.50" borderRadius="md">
                        <Text fontSize="xs" color="gray.500">
                          No hyponyms found for "{originalWord}".
                        </Text>
                      </Box>
                    )}
                  </>
                )}

                {/* Tab 5: Meronyms Content */}
                {effectiveActiveTab === "meronyms" && (
                  <>
                    {sortedMeronyms && sortedMeronyms.length > 0 ? (
                      <Grid templateColumns="repeat(2, minmax(0, 1fr))" autoFlow="dense" gap="1.5">
                        {sortedMeronyms.map((mer, idx) => (
                          <RelationChip
                            key={`${mer}-${idx}`}
                            word={mer}
                            originalWord={originalWord}
                            colorPalette="orange"
                            icon={<LuBoxes size={12} />}
                            onReplace={onReplaceWord}
                            onInspect={onInspectWord}
                          />
                        ))}
                      </Grid>
                    ) : (
                      <Box py="6" px="2" textAlign="center" bg="whiteAlpha.50" borderRadius="md">
                        <Text fontSize="xs" color="gray.500">
                          No meronyms found for "{originalWord}".
                        </Text>
                      </Box>
                    )}
                  </>
                )}
              </VStack>
            ) : (
              <Box py="8" px="3" textAlign="center">
                <Text fontSize="xs" color="gray.500">
                  No morphology or relations found for "{originalWord}".
                </Text>
              </Box>
            )}
          </PanelScrollArea>
        </Box>
      </HStack>
    </Box>
  );
};
