import React from "react";
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
import { LuCompass, LuSparkles, LuLayers, LuPanelLeftClose, LuChevronUp } from "react-icons/lu";
import { PanelScrollArea } from "../ui/panel-scroll-area";
import { getPosVisual, getLexFileVisual } from "../../utils/lexicalIcons";

export interface WordSenseItem {
  id: string;
  senseNumber: number;
  pos: string;
  definition: string;
  examples: string[];
  lemma: string;
  lexfile: string;
  ili: string;
  confidence: number;
  isSelected?: boolean;
}

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
  onToggleCollapse?: () => void;
  onToggleSubpanel?: () => void;
}

export const WordSensesPanel: React.FC<WordSensesPanelProps> = ({
  word,
  senses,
  selectedSenseIndex,
  recommendedSenseIndex,
  wsdConfidence,
  entropy,
  totalSenses,
  onSelectSense,
  loading,
  onToggleCollapse,
  onToggleSubpanel,
}) => {
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
                size="2xs"
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
            {onToggleCollapse && (
              <IconButton
                size="2xs"
                variant="ghost"
                color="gray.400"
                _hover={{ bg: "gray.800", color: "white" }}
                onClick={onToggleCollapse}
                title="Collapse Left Panel"
                aria-label="Collapse Left Panel"
                flexShrink={0}
              >
                <LuPanelLeftClose size={14} />
              </IconButton>
            )}
          </HStack>
        </HStack>

        <HStack justifyContent="space-between" alignItems="baseline" flexWrap="nowrap" minW="0" gap="2">
          <Text fontSize="lg" fontWeight="bold" color="blue.200" lineClamp={1} whiteSpace="nowrap" minW="0">
            {word}
          </Text>
          {entropy > 0 && (
            <Text fontSize="2xs" color="gray.400" whiteSpace="nowrap" flexShrink={0} title="Shannon Entropy of sense distribution">
              Entropy: {entropy.toFixed(2)}
            </Text>
          )}
        </HStack>

        {wsdConfidence > 0 && senses.length > 1 && (
          <Box mt="2" p="2" bg="blue.950" borderWidth="1px" borderColor="blue.800" borderRadius="md">
            <HStack justifyContent="space-between" mb="1">
              <HStack gap="1">
                <LuSparkles size={12} color="#90CDF4" />
                <Text fontSize="2xs" color="blue.200" fontWeight="semibold">
                  Contextual Disambiguation (Lesk)
                </Text>
              </HStack>
              <Text fontSize="2xs" fontWeight="bold" color="blue.300">
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

      {/* Senses List via PanelScrollArea */}
      <PanelScrollArea p="2.5">
        <VStack gap="2" align="stretch">
          {senses.length === 0 ? (
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
          ) : (
            senses.map((sense, idx) => {
              const isSelected = idx === selectedSenseIndex;
              const isRecommended = idx === recommendedSenseIndex && senses.length > 1;
              const posVis = getPosVisual(sense.pos);
              const lexVis = sense.lexfile ? getLexFileVisual(sense.lexfile) : null;

              return (
                <Box
                  key={sense.id || idx}
                  p="3"
                  borderRadius="lg"
                  cursor="pointer"
                  borderWidth="1px"
                  borderColor={
                    isSelected ? "blue.500" : isRecommended ? "teal.600" : "whiteAlpha.100"
                  }
                  bg={isSelected ? "blue.950" : "gray.850"}
                  _hover={{
                    bg: isSelected ? "blue.900" : "gray.800",
                    borderColor: isSelected ? "blue.400" : "gray.700",
                  }}
                  onClick={() => onSelectSense(idx)}
                  transition="all 0.15s ease"
                >
                  <HStack justifyContent="space-between" alignItems="center" mb="2" flexWrap="wrap" gap="1.5">
                    <HStack gap="1.5" alignItems="center">
                      <Badge
                        size="xs"
                        variant={isSelected ? "solid" : "surface"}
                        colorPalette={isSelected ? "blue" : "gray"}
                        borderRadius="sm"
                        px="1.5"
                      >
                        #{sense.senseNumber}
                      </Badge>
                      <Badge
                        size="xs"
                        colorPalette={posVis.palette}
                        variant="surface"
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
                    </HStack>
                    {isRecommended && (
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
                        flexShrink={0}
                      >
                        <LuSparkles size={11} color="#38B2AC" />
                        <Text as="span" fontSize="2xs" fontWeight="semibold">
                          Best Context Match
                        </Text>
                      </Badge>
                    )}
                  </HStack>

                  <Text
                    fontSize="xs"
                    color={isSelected ? "white" : "gray.300"}
                    lineClamp={2}
                    lineHeight="1.4"
                  >
                    {sense.definition}
                  </Text>

                  {lexVis && (
                    <Box mt="2" display="flex" alignItems="center" gap="1.5">
                      <Badge
                        size="xs"
                        variant="subtle"
                        colorPalette={lexVis.palette}
                        borderRadius="md"
                        px="1.5"
                        py="0.5"
                        display="inline-flex"
                        alignItems="center"
                        gap="1.5"
                      >
                        {lexVis.icon}
                        <Text as="span" fontSize="2xs" fontWeight="medium">
                          {lexVis.label}
                        </Text>
                      </Badge>
                    </Box>
                  )}
                </Box>
              );
            })
          )}
        </VStack>
      </PanelScrollArea>
    </Box>
  );
};
