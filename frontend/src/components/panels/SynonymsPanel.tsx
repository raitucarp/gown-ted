import React, { useState } from "react";
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
} from "react-icons/lu";
import { PanelScrollArea } from "../ui/panel-scroll-area";
import { getPosVisual } from "../../utils/lexicalIcons";

export interface SynonymGroup {
  senseNumber: number;
  pos: string;
  senseDefinition: string;
  words: string[];
}

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
  const countSynonyms = totalSynonyms ?? synonymGroups.reduce((acc, g) => acc + g.words.length, 0);

  const handleCopy = (syn: string) => {
    navigator.clipboard.writeText(syn);
    setCopiedWord(syn);
    setTimeout(() => setCopiedWord(null), 1500);
  };

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
      <Box px="3" py="2" borderBottomWidth="1px" borderColor="gray.800" bg="gray.950" overflow="hidden">
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
                size="2xs"
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
                size="2xs"
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
        <Text fontSize="2xs" color="gray.500" mt="0.5">
          Click a synonym to replace active word.
        </Text>
      </Box>

      {/* Groups List via PanelScrollArea */}
      <PanelScrollArea p="2.5">
        <VStack gap="2.5" align="stretch">
          {synonymGroups.length === 0 ? (
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
          ) : (
            synonymGroups.map((group, gIdx) => (
              <Box
                key={gIdx}
                p="2.5"
                bg="gray.850"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="whiteAlpha.100"
              >
                <HStack justifyContent="space-between" mb="1.5">
                  <HStack gap="1.5">
                    <Badge size="xs" variant="surface" colorPalette="green">
                      Sense #{group.senseNumber}
                    </Badge>
                    {group.pos && group.pos.trim().length > 0 && (() => {
                      const posVis = getPosVisual(group.pos);
                      return (
                        <Badge
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
                          <Text as="span">{posVis.label}</Text>
                        </Badge>
                      );
                    })()}
                  </HStack>
                </HStack>

                <Text fontSize="2xs" color="gray.400" lineClamp={1} mb="2" fontStyle="italic">
                  {group.senseDefinition}
                </Text>

                <VStack align="stretch" gap="1.5">
                  {group.words.map((syn, sIdx) => {
                    const isCopied = copiedWord === syn;
                    return (
                      <HStack
                        key={sIdx}
                        justifyContent="space-between"
                        px="2.5"
                        py="1.5"
                        bg="gray.900"
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="whiteAlpha.050"
                        _hover={{ bg: "gray.800", borderColor: "green.700" }}
                        transition="all 0.15s ease"
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
                            size="2xs"
                            variant="ghost"
                            color="gray.400"
                            _hover={{ color: "blue.300", bg: "blue.950" }}
                            title="Replace active word"
                            aria-label="Replace active word"
                            onClick={() => onReplaceWord(syn)}
                          >
                            <LuReplace size={12} />
                          </IconButton>
                          <IconButton
                            size="2xs"
                            variant="ghost"
                            color="gray.400"
                            _hover={{ color: "teal.300", bg: "teal.950" }}
                            title="Insert next to word"
                            aria-label="Insert next to word"
                            onClick={() => onInsertWord(syn)}
                          >
                            <LuPlus size={12} />
                          </IconButton>
                          <IconButton
                            size="2xs"
                            variant="ghost"
                            color={isCopied ? "green.300" : "gray.400"}
                            _hover={{ color: "yellow.300", bg: "yellow.950" }}
                            title={isCopied ? "Copied!" : "Copy synonym"}
                            aria-label="Copy synonym"
                            onClick={() => handleCopy(syn)}
                          >
                            {isCopied ? <LuCheck size={12} color="#48BB78" /> : <LuCopy size={12} />}
                          </IconButton>
                          <IconButton
                            size="2xs"
                            variant="ghost"
                            color="gray.400"
                            _hover={{ color: "purple.300", bg: "purple.950" }}
                            title="Inspect in WordNet"
                            aria-label="Inspect in WordNet"
                            onClick={() => onInspectWord(syn)}
                          >
                            <LuSearch size={12} />
                          </IconButton>
                        </HStack>
                      </HStack>
                    );
                  })}
                </VStack>
              </Box>
            ))
          )}
        </VStack>
      </PanelScrollArea>
    </Box>
  );
};
