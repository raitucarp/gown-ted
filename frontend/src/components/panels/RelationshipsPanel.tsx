import React from "react";
import { Box, VStack, HStack, Text, Badge, EmptyState, IconButton } from "@chakra-ui/react";
import {
  LuNetwork,
  LuArrowUpRight,
  LuArrowDownRight,
  LuGitBranch,
  LuSplit,
  LuBoxes,
  LuChevronDown,
  LuSearch,
  LuReplace,
} from "react-icons/lu";
import { PanelScrollArea } from "../ui/panel-scroll-area";
import { getPosVisual } from "../../utils/lexicalIcons";

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

interface RelationChipProps {
  word: string;
  originalWord: string;
  colorPalette: "teal" | "blue" | "purple" | "orange" | "red" | "gray";
  icon: React.ReactNode;
  onReplace?: (word: string) => void;
  onInspect: (word: string) => void;
}

const RelationChip: React.FC<RelationChipProps> = ({
  word,
  originalWord,
  colorPalette,
  icon,
  onReplace,
  onInspect,
}) => {
  return (
    <HStack
      gap="1.5"
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
      flexShrink={0}
    >
      <Box color={`${colorPalette}.300`} display="flex" alignItems="center">
        {icon}
      </Box>
      <Text fontSize="xs" fontWeight="medium" color="gray.200" lineClamp={1}>
        {word}
      </Text>
      <IconButton
        size="2xs"
        variant="ghost"
        color="gray.500"
        _hover={{ color: "blue.200", bg: "whiteAlpha.200" }}
        onClick={(e) => {
          e.stopPropagation();
          onInspect(word);
        }}
        title={`Inspect "${word}" in WordNet`}
        aria-label={`Inspect ${word}`}
        ml="0.5"
        w="16px"
        h="16px"
        minW="16px"
      >
        <LuSearch size={10} />
      </IconButton>
    </HStack>
  );
};

export const RelationshipsPanel: React.FC<RelationshipsPanelProps> = ({
  originalWord,
  lemmas,
  posList,
  hypernyms,
  hyponyms,
  meronyms,
  antonyms,
  onInspectWord,
  onReplaceWord,
  onToggleCollapse,
}) => {
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

  return (
    <Box h="100%" display="flex" flexDirection="column" overflow="hidden" bg="gray.900">
      {/* Panel Header */}
      <Box px="3" py="2" borderBottomWidth="1px" borderColor="gray.800" bg="gray.950" overflow="hidden">
        <HStack justifyContent="space-between" flexWrap="nowrap" minW="0" gap="2">
          <HStack gap="1.5" minW="0">
            <LuGitBranch color="#4FD1C5" size={14} style={{ flexShrink: 0 }} />
            <Text fontSize="xs" fontWeight="bold" color="gray.300" textTransform="uppercase" letterSpacing="0.05em" lineClamp={1} whiteSpace="nowrap">
              Morphology & Relations
            </Text>
          </HStack>
          {onToggleCollapse && (
            <IconButton
              size="2xs"
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

      {/* Scrollable Content */}
      <PanelScrollArea p="3">
        <VStack gap="4" align="stretch">
          {/* Morphology / Lemma Section */}
          <Box>
            <HStack justify="space-between" mb="1">
              <HStack gap="1.5">
                <LuGitBranch size={12} color="#4FD1C5" />
                <Text fontSize="2xs" fontWeight="bold" color="teal.300" textTransform="uppercase" letterSpacing="0.05em">
                  Lemma Normalization
                </Text>
              </HStack>
              {lemmas.length > 0 && (
                <Badge size="xs" variant="surface" colorPalette="teal">
                  {lemmas.length}
                </Badge>
              )}
            </HStack>
            <Text fontSize="2xs" color="gray.500" mb="2">
              Click lemma to substitute in editor:
            </Text>
            <HStack flexWrap="wrap" gap="2">
              {lemmas.length > 0 ? (
                lemmas.map((lem, idx) => (
                  <RelationChip
                    key={idx}
                    word={lem}
                    originalWord={originalWord}
                    colorPalette="teal"
                    icon={<LuGitBranch size={11} />}
                    onReplace={onReplaceWord}
                    onInspect={onInspectWord}
                  />
                ))
              ) : (
                <Text fontSize="xs" color="gray.500">
                  {originalWord} (base form)
                </Text>
              )}
            </HStack>
            {posList && posList.length > 0 && (
              <HStack flexWrap="wrap" gap="1.5" mt="2.5">
                <Text fontSize="2xs" color="gray.500">Parts of Speech:</Text>
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
                      <Text as="span">{posVis.label}</Text>
                    </Badge>
                  );
                })}
              </HStack>
            )}
          </Box>

          {/* Hypernyms (Broader concepts) */}
          {hypernyms && hypernyms.length > 0 && (
            <Box>
              <HStack justify="space-between" mb="1">
                <HStack gap="1.5">
                  <LuArrowUpRight size={13} color="#63B3ED" />
                  <Text fontSize="2xs" fontWeight="bold" color="blue.300" textTransform="uppercase" letterSpacing="0.05em">
                    Hypernyms (Broader Concepts)
                  </Text>
                </HStack>
                <Badge size="xs" variant="surface" colorPalette="blue">
                  {hypernyms.length}
                </Badge>
              </HStack>
              <Text fontSize="2xs" color="gray.500" mb="2">
                Click any hypernym to substitute "{originalWord}" in editor:
              </Text>
              <HStack flexWrap="wrap" gap="2">
                {hypernyms.slice(0, 16).map((hyp, idx) => (
                  <RelationChip
                    key={idx}
                    word={hyp}
                    originalWord={originalWord}
                    colorPalette="blue"
                    icon={<LuArrowUpRight size={11} />}
                    onReplace={onReplaceWord}
                    onInspect={onInspectWord}
                  />
                ))}
              </HStack>
            </Box>
          )}

          {/* Hyponyms (Narrower concepts) */}
          {hyponyms && hyponyms.length > 0 && (
            <Box>
              <HStack justify="space-between" mb="1">
                <HStack gap="1.5">
                  <LuArrowDownRight size={13} color="#B794F4" />
                  <Text fontSize="2xs" fontWeight="bold" color="purple.300" textTransform="uppercase" letterSpacing="0.05em">
                    Hyponyms (Narrower Concepts)
                  </Text>
                </HStack>
                <Badge size="xs" variant="surface" colorPalette="purple">
                  {hyponyms.length}
                </Badge>
              </HStack>
              <Text fontSize="2xs" color="gray.500" mb="2">
                Click any hyponym to substitute "{originalWord}" in editor:
              </Text>
              <HStack flexWrap="wrap" gap="2">
                {hyponyms.slice(0, 18).map((hyp, idx) => (
                  <RelationChip
                    key={idx}
                    word={hyp}
                    originalWord={originalWord}
                    colorPalette="purple"
                    icon={<LuArrowDownRight size={11} />}
                    onReplace={onReplaceWord}
                    onInspect={onInspectWord}
                  />
                ))}
              </HStack>
            </Box>
          )}

          {/* Antonyms */}
          {antonyms && antonyms.length > 0 && (
            <Box>
              <HStack justify="space-between" mb="1">
                <HStack gap="1.5">
                  <LuSplit size={13} color="#F56565" />
                  <Text fontSize="2xs" fontWeight="bold" color="red.300" textTransform="uppercase" letterSpacing="0.05em">
                    Antonyms (Opposites)
                  </Text>
                </HStack>
                <Badge size="xs" variant="surface" colorPalette="red">
                  {antonyms.length}
                </Badge>
              </HStack>
              <Text fontSize="2xs" color="gray.500" mb="2">
                Click antonym to substitute in editor:
              </Text>
              <HStack flexWrap="wrap" gap="2">
                {antonyms.map((ant, idx) => (
                  <RelationChip
                    key={idx}
                    word={ant}
                    originalWord={originalWord}
                    colorPalette="red"
                    icon={<LuSplit size={11} />}
                    onReplace={onReplaceWord}
                    onInspect={onInspectWord}
                  />
                ))}
              </HStack>
            </Box>
          )}

          {/* Meronyms (Part / Member) */}
          {meronyms && meronyms.length > 0 && (
            <Box>
              <HStack justify="space-between" mb="1">
                <HStack gap="1.5">
                  <LuBoxes size={13} color="#ED8936" />
                  <Text fontSize="2xs" fontWeight="bold" color="orange.300" textTransform="uppercase" letterSpacing="0.05em">
                    Meronyms (Parts & Components)
                  </Text>
                </HStack>
                <Badge size="xs" variant="surface" colorPalette="orange">
                  {meronyms.length}
                </Badge>
              </HStack>
              <Text fontSize="2xs" color="gray.500" mb="2">
                Click meronym to substitute in editor:
              </Text>
              <HStack flexWrap="wrap" gap="2">
                {meronyms.slice(0, 14).map((mer, idx) => (
                  <RelationChip
                    key={idx}
                    word={mer}
                    originalWord={originalWord}
                    colorPalette="orange"
                    icon={<LuBoxes size={11} />}
                    onReplace={onReplaceWord}
                    onInspect={onInspectWord}
                  />
                ))}
              </HStack>
            </Box>
          )}
        </VStack>
      </PanelScrollArea>
    </Box>
  );
};
