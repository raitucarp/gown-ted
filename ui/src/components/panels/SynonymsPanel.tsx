import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  EmptyState,
} from "@chakra-ui/react";
import {
  LuBookCheck,
  LuReplace,
  LuPlus,
  LuCopy,
  LuCheck,
  LuSearch,
  LuPanelRightClose,
  LuChevronUp,
  LuChevronDown,
} from "react-icons/lu";
import { PanelScrollArea } from "../ui/panel-scroll-area";
import { getPosVisual } from "@utils/lexicalIcons";

import type { SynonymGroup } from "@types";

interface SynonymsPanelProps {
  word: string;
  synonymGroups: SynonymGroup[];
  totalSynonyms?: number;
  onReplaceWord: (synonym: string) => void;
  onInsertWord: (synonym: string) => void;
  onInspectWord: (synonym: string) => void;
  onToggleCollapse?: () => void;
  onToggleSubpanel?: () => void;
}

export const SynonymsPanel: React.FC<SynonymsPanelProps> = ({
  word,
  synonymGroups,
  totalSynonyms,
  onReplaceWord,
  onInsertWord,
  onInspectWord,
  onToggleCollapse,
  onToggleSubpanel,
}) => {
  const [copiedWord, setCopiedWord] = useState<string | null>(null);
  const [activeSenseIndex, setActiveSenseIndex] = useState<number>(0);
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  const countSynonyms =
    totalSynonyms ??
    synonymGroups.reduce((acc, g) => acc + (g.words ? g.words.length : 0), 0);

  const scrollTabs = (delta: number) => {
    if (tabsScrollRef.current) {
      tabsScrollRef.current.scrollBy({ top: delta, behavior: "smooth" });
    }
  };

  const handleCopy = (syn: string) => {
    navigator.clipboard.writeText(syn);
    setCopiedWord(syn);
    setTimeout(() => setCopiedWord(null), 1500);
  };

  // Reset active sense index if out of range when synonymGroups change
  useEffect(() => {
    if (activeSenseIndex >= synonymGroups.length) {
      setActiveSenseIndex(0);
    }
  }, [synonymGroups, activeSenseIndex]);

  const senseTabs = useMemo(() => {
    return synonymGroups.map((group, index) => {
      const posVis =
        group.pos && group.pos.trim().length > 0
          ? getPosVisual(group.pos)
          : { palette: "green", icon: <LuBookCheck size={14} />, label: "Sense" };

      return {
        index,
        senseNumber: group.senseNumber,
        label: `Sense #${group.senseNumber}`,
        shortLabel: `#${group.senseNumber}`,
        count: group.words?.length || 0,
        pos: group.pos,
        posVis,
        colorPalette: posVis.palette || "green",
        definition: group.senseDefinition,
        words: group.words || [],
      };
    });
  }, [synonymGroups]);

  const effectiveIndex =
    activeSenseIndex >= 0 && activeSenseIndex < synonymGroups.length
      ? activeSenseIndex
      : 0;

  const activeGroup = synonymGroups[effectiveIndex];
  const activeTab = senseTabs[effectiveIndex];

  if (!word) {
    return (
      <Box p="4" h="100%" display="flex" alignItems="center" justifyContent="center">
        <EmptyState.Root size="sm">
          <EmptyState.Content>
            <EmptyState.Indicator>
              <LuBookCheck size={28} />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>Synonym Studio</EmptyState.Title>
              <EmptyState.Description>
                Explore sense-partitioned synonyms to substitute or augment your vocabulary.
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
      <Box px="3" py="2" borderBottomWidth="1px" borderColor="gray.800" bg="gray.950" overflow="hidden" flexShrink={0}>
        <HStack justifyContent="space-between" flexWrap="nowrap" minW="0" gap="1.5">
          <HStack gap="1.5" minW="0">
            <LuBookCheck color="#48BB78" size={14} style={{ flexShrink: 0 }} />
            <Text fontSize="xs" fontWeight="bold" color="gray.300" textTransform="uppercase" letterSpacing="0.05em" lineClamp={1} whiteSpace="nowrap">
              Synonyms by Sense
            </Text>
          </HStack>
          <HStack gap="1.5" flexShrink={0}>
            <Badge size="xs" colorPalette="green" variant="surface" whiteSpace="nowrap">
              {countSynonyms} {countSynonyms === 1 ? "Synonym" : "Synonyms"}
            </Badge>
            {onToggleSubpanel && (
              <IconButton
                size="xs"
                variant="ghost"
                color="gray.400"
                _hover={{ bg: "gray.800", color: "white" }}
                onClick={onToggleSubpanel}
                title="Collapse Synonyms Subpanel"
                aria-label="Collapse Synonyms Subpanel"
                flexShrink={0}
              >
                <LuChevronUp size={14} />
              </IconButton>
            )}
            {onToggleCollapse && (
              <IconButton
                size="xs"
                variant="ghost"
                color="gray.400"
                _hover={{ bg: "gray.800", color: "white" }}
                onClick={onToggleCollapse}
                title="Collapse Right Panel"
                aria-label="Collapse Right Panel"
                flexShrink={0}
              >
                <LuPanelRightClose size={14} />
              </IconButton>
            )}
          </HStack>
        </HStack>
        <Text fontSize="xs" color="gray.500" mt="0.5">
          Click a synonym to replace active word.
        </Text>
      </Box>

      {/* Main Content Area with Right Vertical Tab Rail */}
      <HStack gap="0" align="stretch" flex="1" overflow="hidden" minH="0">
        {/* Left: Active Sense Content */}
        <Box flex="1" minW="0" h="100%" display="flex" flexDirection="column" overflow="hidden" bg="gray.900">
          {/* Active Sense Header (Pinned) */}
          {activeGroup && (
            <Box px="3" py="2" borderBottomWidth="1px" borderColor="gray.800" bg="gray.950" flexShrink={0}>
              <HStack justify="space-between" align="center" mb="1" gap="1.5">
                <HStack gap="1.5" minW="0">
                  <Badge size="xs" variant="surface" colorPalette={activeTab?.colorPalette || "green"}>
                    Sense #{activeGroup.senseNumber}
                  </Badge>
                  {activeGroup.pos && activeGroup.pos.trim().length > 0 && activeTab?.posVis && (
                    <Badge
                      size="xs"
                      variant="surface"
                      colorPalette={activeTab.posVis.palette}
                      borderRadius="full"
                      px="2"
                      py="0.5"
                      display="inline-flex"
                      alignItems="center"
                      gap="1"
                    >
                      {activeTab.posVis.icon}
                      <Text as="span">{activeTab.posVis.label}</Text>
                    </Badge>
                  )}
                </HStack>
                <Badge size="xs" variant="surface" colorPalette={activeTab?.colorPalette || "green"}>
                  {activeGroup.words?.length || 0} {activeGroup.words?.length === 1 ? "Synonym" : "Synonyms"}
                </Badge>
              </HStack>
              {activeGroup.senseDefinition && (
                <Text fontSize="xs" color="gray.300" lineClamp={2} fontStyle="italic">
                  "{activeGroup.senseDefinition}"
                </Text>
              )}
            </Box>
          )}

          {/* Seamless List with Separators */}
          <PanelScrollArea p="0">
            {synonymGroups.length === 0 ? (
              <Box p="4">
                <EmptyState.Root size="sm" py="6">
                  <EmptyState.Content>
                    <EmptyState.Indicator>
                      <LuBookCheck size={24} />
                    </EmptyState.Indicator>
                    <VStack textAlign="center">
                      <EmptyState.Title>No Synonyms Found</EmptyState.Title>
                      <EmptyState.Description>
                        No synonyms registered for "{word}".
                      </EmptyState.Description>
                    </VStack>
                  </EmptyState.Content>
                </EmptyState.Root>
              </Box>
            ) : !activeGroup || !activeGroup.words || activeGroup.words.length === 0 ? (
              <Box p="4">
                <EmptyState.Root size="sm" py="4">
                  <EmptyState.Content>
                    <EmptyState.Indicator>
                      <LuBookCheck size={20} />
                    </EmptyState.Indicator>
                    <VStack textAlign="center">
                      <EmptyState.Title>No Synonyms in Sense</EmptyState.Title>
                      <EmptyState.Description>
                        No synonyms available for this sense.
                      </EmptyState.Description>
                    </VStack>
                  </EmptyState.Content>
                </EmptyState.Root>
              </Box>
            ) : (
              <VStack gap="0" align="stretch">
                {activeGroup.words.map((syn, sIdx) => {
                  const isCopied = copiedWord === syn;
                  return (
                    <HStack
                      key={sIdx}
                      justifyContent="space-between"
                      px="3"
                      py="2"
                      borderBottomWidth="1px"
                      borderColor="gray.800"
                      borderRadius="0"
                      _hover={{ bg: "whiteAlpha.50" }}
                      transition="background 0.12s ease"
                    >
                      <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        color="green.200"
                        cursor="pointer"
                        title="Click to replace active word"
                        onClick={() => onReplaceWord(syn)}
                        _hover={{ color: "green.300", textDecoration: "underline" }}
                      >
                        {syn}
                      </Text>

                      <HStack gap="0.5">
                        <IconButton
                          size="xs"
                          variant="ghost"
                          color="gray.400"
                          _hover={{ color: "blue.300", bg: "blue.950" }}
                          title="Replace active word"
                          aria-label="Replace active word"
                          onClick={() => onReplaceWord(syn)}
                          w="24px"
                          h="24px"
                          minW="24px"
                        >
                          <LuReplace size={12} />
                        </IconButton>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          color="gray.400"
                          _hover={{ color: "teal.300", bg: "teal.950" }}
                          title="Insert next to word"
                          aria-label="Insert next to word"
                          onClick={() => onInsertWord(syn)}
                          w="24px"
                          h="24px"
                          minW="24px"
                        >
                          <LuPlus size={12} />
                        </IconButton>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          color={isCopied ? "green.300" : "gray.400"}
                          _hover={{ color: "yellow.300", bg: "yellow.950" }}
                          title={isCopied ? "Copied!" : "Copy synonym"}
                          aria-label="Copy synonym"
                          onClick={() => handleCopy(syn)}
                          w="24px"
                          h="24px"
                          minW="24px"
                        >
                          {isCopied ? <LuCheck size={12} color="#48BB78" /> : <LuCopy size={12} />}
                        </IconButton>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          color="gray.400"
                          _hover={{ color: "purple.300", bg: "purple.950" }}
                          title="Inspect in WordNet"
                          aria-label="Inspect in WordNet"
                          onClick={() => onInspectWord(syn)}
                          w="24px"
                          h="24px"
                          minW="24px"
                        >
                          <LuSearch size={12} />
                        </IconButton>
                      </HStack>
                    </HStack>
                  );
                })}
              </VStack>
            )}
          </PanelScrollArea>
        </Box>

        {/* Right: Vertical Tab Rail */}
        {synonymGroups.length > 0 && (
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
            {/* Scrollable Tabs Container */}
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
              {senseTabs.map((tab) => {
                const isActive = effectiveIndex === tab.index;
                return (
                  <Box
                    as="button"
                    key={tab.index}
                    onClick={() => setActiveSenseIndex(tab.index)}
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

                    {/* Bottom: Rotated POS Icon */}
                    <Box
                      color={`${tab.colorPalette}.400`}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      transform="rotate(-90deg)"
                    >
                      {tab.posVis.icon}
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
        )}
      </HStack>
    </Box>
  );
};
