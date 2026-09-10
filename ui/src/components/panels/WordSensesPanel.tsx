import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  EmptyState,
  Progress,
} from "@chakra-ui/react";
import {
  LuCompass,
  LuSparkles,
  LuLayers,
  LuChevronUp,
  LuChevronDown,
  LuTag,
} from "react-icons/lu";
import {
  GiCube,
  GiSwordClash,
  GiSparkles,
  GiWindyStripes,
} from "react-icons/gi";
import { PanelScrollArea } from "../ui/panel-scroll-area";
import { getLexFileVisual } from "@utils/lexicalIcons";

import type { WordSenseItem } from "@types";

interface WordSensesPanelProps {
  word: string;
  senses: WordSenseItem[];
  selectedSenseIndex: number;
  recommendedSenseIndex: number;
  wsdConfidence: number;
  entropy: number;
  totalSenses: number;
  onSelectSense: (index: number) => void;
  loading: boolean;
  onToggleSubpanel?: () => void;
}

const normalizePos = (pos?: string): string => {
  const p = (pos || "").toLowerCase();
  if (p === "n" || p === "noun") return "noun";
  if (p === "v" || p === "verb") return "verb";
  if (p === "a" || p === "adj" || p === "adjective" || p === "s" || p === "satellite" || p === "adjective satellite") return "adjective";
  if (p === "r" || p === "adv" || p === "adverb") return "adverb";
  return p || "other";
};

const POS_DEFINITIONS: Record<
  string,
  {
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
    colorPalette: "purple" | "blue" | "green" | "orange" | "gray";
  }
> = {
  adjective: {
    label: "Adjective",
    shortLabel: "Adj",
    icon: <GiSparkles size={14} />,
    colorPalette: "purple",
  },
  noun: {
    label: "Noun",
    shortLabel: "Noun",
    icon: <GiCube size={14} />,
    colorPalette: "blue",
  },
  verb: {
    label: "Verb",
    shortLabel: "Verb",
    icon: <GiSwordClash size={14} />,
    colorPalette: "green",
  },
  adverb: {
    label: "Adverb",
    shortLabel: "Adv",
    icon: <GiWindyStripes size={14} />,
    colorPalette: "orange",
  },
};

export const WordSensesPanel: React.FC<WordSensesPanelProps> = ({
  word,
  senses = [],
  selectedSenseIndex,
  recommendedSenseIndex,
  wsdConfidence,
  entropy,
  totalSenses,
  onSelectSense,
  loading,
  onToggleSubpanel,
}) => {
  const [activePos, setActivePos] = useState<string>("");
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (delta: number) => {
    if (tabsScrollRef.current) {
      tabsScrollRef.current.scrollBy({ top: delta, behavior: "smooth" });
    }
  };

  const sensesWithOriginalIndex = useMemo(() => {
    return (senses || []).map((s, idx) => ({ ...s, originalIndex: idx }));
  }, [senses]);

  const posCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of senses || []) {
      const p = normalizePos(s.pos);
      counts[p] = (counts[p] || 0) + 1;
    }
    return counts;
  }, [senses]);

  const visibleTabs = useMemo(() => {
    const knownKeys = ["adjective", "noun", "verb", "adverb"];
    const tabs: Array<{
      id: string;
      label: string;
      shortLabel: string;
      icon: React.ReactNode;
      colorPalette: "purple" | "blue" | "green" | "orange" | "gray";
      count: number;
    }> = [];

    // Add known POS if they have senses
    for (const k of knownKeys) {
      const count = posCounts[k] || 0;
      if (count > 0) {
        const def = POS_DEFINITIONS[k];
        tabs.push({
          id: k,
          label: def.label,
          shortLabel: def.shortLabel,
          icon: def.icon,
          colorPalette: def.colorPalette,
          count,
        });
      }
    }

    // Add any unknown/other POS
    for (const [k, count] of Object.entries(posCounts)) {
      if (!knownKeys.includes(k) && count > 0) {
        tabs.push({
          id: k,
          label: k.charAt(0).toUpperCase() + k.slice(1),
          shortLabel: k.slice(0, 4).toUpperCase(),
          icon: <LuTag size={14} />,
          colorPalette: "gray",
          count,
        });
      }
    }

    return tabs;
  }, [posCounts]);

  const effectiveActiveTab = useMemo(() => {
    if (visibleTabs.length === 0) return "";
    if (visibleTabs.some((t) => t.id === activePos)) return activePos;
    return visibleTabs[0].id;
  }, [visibleTabs, activePos]);

  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.some((t) => t.id === activePos)) {
      const recPos = senses[recommendedSenseIndex]
        ? normalizePos(senses[recommendedSenseIndex].pos)
        : undefined;
      if (recPos && visibleTabs.some((t) => t.id === recPos)) {
        setActivePos(recPos);
      } else {
        setActivePos(visibleTabs[0].id);
      }
    }
  }, [visibleTabs, senses, recommendedSenseIndex, activePos]);

  useEffect(() => {
    if (senses[selectedSenseIndex]) {
      const selPos = normalizePos(senses[selectedSenseIndex].pos);
      if (selPos && visibleTabs.some((t) => t.id === selPos)) {
        setActivePos(selPos);
      }
    }
  }, [selectedSenseIndex, senses, visibleTabs]);

  const currentSenses = useMemo(() => {
    if (!effectiveActiveTab) return sensesWithOriginalIndex;
    return sensesWithOriginalIndex.filter(
      (s) => normalizePos(s.pos) === effectiveActiveTab
    );
  }, [sensesWithOriginalIndex, effectiveActiveTab]);

  const currentTab = useMemo(() => {
    return visibleTabs.find((t) => t.id === effectiveActiveTab) || visibleTabs[0];
  }, [visibleTabs, effectiveActiveTab]);

  if (!word) {
    return (
      <Box p="4" h="100%" display="flex" alignItems="center" justifyContent="center">
        <EmptyState.Root size="sm">
          <EmptyState.Content>
            <EmptyState.Indicator>
              <LuCompass size={28} />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>Word Sense Navigator</EmptyState.Title>
              <EmptyState.Description>
                Place cursor or select any word to inspect lexical senses and polysemy.
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      </Box>
    );
  }

  return (
    <Box h="100%" display="flex" flexDirection="column" overflow="hidden" bg="gray.900">
      {/* Panel Header */}
      <Box px="3" py="2" borderBottomWidth="1px" borderColor="gray.800" bg="gray.950" overflow="hidden">
        <HStack justifyContent="space-between" mb="1" flexWrap="nowrap" minW="0" gap="1.5">
          <HStack gap="1.5" minW="0">
            <LuLayers color="#63B3ED" size={15} style={{ flexShrink: 0 }} />
            <Text fontSize="xs" fontWeight="bold" color="gray.300" textTransform="uppercase" letterSpacing="0.05em" lineClamp={1} whiteSpace="nowrap">
              Word Senses & Polysemy
            </Text>
          </HStack>
          <HStack gap="1.5" flexShrink={0}>
            <Badge size="xs" colorPalette={totalSenses > 1 ? "purple" : "gray"} variant="surface" whiteSpace="nowrap">
              {totalSenses} {totalSenses === 1 ? "Sense" : "Senses"}
            </Badge>
            {onToggleSubpanel && (
              <IconButton
                size="xs"
                variant="ghost"
                color="gray.400"
                _hover={{ bg: "gray.800", color: "white" }}
                onClick={onToggleSubpanel}
                title="Collapse Word Senses Subpanel"
                aria-label="Collapse Word Senses Subpanel"
                flexShrink={0}
              >
                <LuChevronUp size={14} />
              </IconButton>
            )}
          </HStack>
        </HStack>

        <HStack justifyContent="space-between" alignItems="baseline" flexWrap="nowrap" minW="0" gap="2">
          <Text fontSize="lg" fontWeight="bold" color="blue.200" lineClamp={1} whiteSpace="nowrap" minW="0">
            {word}
          </Text>
          {entropy > 0 && (
            <Text fontSize="xs" color="gray.400" whiteSpace="nowrap" flexShrink={0} title="Shannon Entropy of sense distribution">
              Entropy: {entropy.toFixed(2)}
            </Text>
          )}
        </HStack>

        {wsdConfidence > 0 && senses.length > 1 && (
          <Box mt="2" p="2" bg="blue.950" borderWidth="1px" borderColor="blue.800" borderRadius="md">
            <HStack justifyContent="space-between" mb="1">
              <HStack gap="1">
                <LuSparkles size={12} color="#90CDF4" />
                <Text fontSize="xs" color="blue.200" fontWeight="semibold">
                  Contextual Disambiguation (Lesk)
                </Text>
              </HStack>
              <Text fontSize="xs" fontWeight="bold" color="blue.300">
                {(wsdConfidence * 100).toFixed(0)}%
              </Text>
            </HStack>
            <Progress.Root value={wsdConfidence * 100} size="xs" colorPalette="blue" variant="subtle">
              <Progress.Track bg="gray.800" borderRadius="full">
                <Progress.Range borderRadius="full" />
              </Progress.Track>
            </Progress.Root>
          </Box>
        )}
      </Box>

      {/* Main Body: Vertical POS Tabs on Left + Senses Content on Right */}
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
                    onClick={() => setActivePos(tab.id)}
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
                    {/* Top: Rotated Badge Count (aligned vertically with text, colored by POS category) */}
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

            {/* Bottom Scroll Navigation Arrows */}
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

        {/* Senses Content Area on Right */}
        <Box flex="1" minW="0" h="100%" display="flex" flexDirection="column" overflow="hidden" bg="gray.900">
          {/* Active POS Header (Pinned) */}
          {currentTab && (
            <Box px="3" py="2" borderBottomWidth="1px" borderColor="gray.800" bg="gray.950" flexShrink={0}>
              <HStack justify="space-between" align="center" gap="1.5">
                <HStack gap="1.5" minW="0">
                  <Box color={`${currentTab.colorPalette}.300`}>{currentTab.icon}</Box>
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color={`${currentTab.colorPalette}.300`}
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                    lineClamp={1}
                  >
                    {currentTab.label} Senses
                  </Text>
                </HStack>
                <Badge size="xs" variant="surface" colorPalette={currentTab.colorPalette}>
                  {currentSenses.length} {currentSenses.length === 1 ? "Sense" : "Senses"}
                </Badge>
              </HStack>
            </Box>
          )}

          <PanelScrollArea p="0">
            {senses.length === 0 ? (
              <Box p="4">
                <EmptyState.Root size="sm" py="6">
                  <EmptyState.Content>
                    <EmptyState.Indicator>
                      <LuCompass size={24} />
                    </EmptyState.Indicator>
                    <VStack textAlign="center">
                      <EmptyState.Title>No Senses Found</EmptyState.Title>
                      <EmptyState.Description>
                        {loading ? "Analyzing WordNet entries..." : `No WordNet entries found for "${word}".`}
                      </EmptyState.Description>
                    </VStack>
                  </EmptyState.Content>
                </EmptyState.Root>
              </Box>
            ) : (
              <VStack gap="0" align="stretch">
                {currentSenses.map((sense) => {
                  const isSelected = sense.originalIndex === selectedSenseIndex;
                  const isRecommended =
                    sense.originalIndex === recommendedSenseIndex && senses.length > 1;
                  const lexVis = sense.lexfile ? getLexFileVisual(sense.lexfile) : null;

                  return (
                    <Box
                      key={sense.id || sense.originalIndex}
                      position="relative"
                      px="3"
                      py="2.5"
                      cursor="pointer"
                      borderBottomWidth="1px"
                      borderColor="gray.800"
                      borderLeftWidth="3.5px"
                      borderLeftColor={
                        isSelected ? "blue.400" : isRecommended ? "teal.400" : "transparent"
                      }
                      bg={
                        isSelected
                          ? "blue.950"
                          : isRecommended
                          ? "teal.950/25"
                          : "transparent"
                      }
                      _hover={{
                        bg: isSelected ? "blue.900/50" : "whiteAlpha.50",
                      }}
                      onClick={() => onSelectSense(sense.originalIndex)}
                      transition="background-color 0.15s ease"
                    >
                      {/* Absolute Top-Right Sense Number Badge */}
                      <Badge
                        position="absolute"
                        top="2.5"
                        right="3"
                        size="xs"
                        variant={isSelected ? "solid" : "surface"}
                        colorPalette={isSelected ? "blue" : "gray"}
                        borderRadius="sm"
                        px="1.5"
                        py="0"
                        fontSize="xs"
                        fontWeight="bold"
                        lineHeight="1.2"
                      >
                        #{sense.senseNumber}
                      </Badge>

                      {/* Best Context Match Badge if recommended */}
                      {isRecommended && (
                        <Box mb="1.5" pr="8">
                          <Badge
                            size="xs"
                            colorPalette="teal"
                            variant="surface"
                            borderRadius="full"
                            px="2"
                            py="0.5"
                            display="inline-flex"
                            alignItems="center"
                            gap="1"
                          >
                            <LuSparkles size={11} color="#38B2AC" />
                            <Text as="span" fontSize="xs" fontWeight="semibold">
                              Best Context Match
                            </Text>
                          </Badge>
                        </Box>
                      )}

                      {/* Definition text (without redundant POS tag) */}
                      <Text
                        fontSize="xs"
                        color={isSelected ? "white" : "gray.200"}
                        lineClamp={3}
                        lineHeight="1.5"
                        pr={isRecommended ? "0" : "8"}
                      >
                        {sense.definition}
                      </Text>

                      {/* Lexical Category / Domain Tag */}
                      {lexVis && (
                        <Box mt="1.5" display="flex" alignItems="center" gap="1.5">
                          <Badge
                            size="xs"
                            variant="subtle"
                            colorPalette={lexVis.palette}
                            borderRadius="sm"
                            px="1.5"
                            py="0.5"
                            display="inline-flex"
                            alignItems="center"
                            gap="1"
                          >
                            {lexVis.icon}
                            <Text as="span" fontSize="xs" fontWeight="medium">
                              {lexVis.label}
                            </Text>
                          </Badge>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </VStack>
            )}
          </PanelScrollArea>
        </Box>
      </HStack>
    </Box>
  );
};
