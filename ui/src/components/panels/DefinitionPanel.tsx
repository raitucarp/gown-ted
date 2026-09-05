import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  EmptyState,
  Tabs,
  Stat,
} from "@chakra-ui/react";
import {
  LuBookOpen,
  LuQuote,
  LuTag,
  LuSparkles,
  LuGlobe,
  LuPanelBottomClose,
  LuSplit,
  LuMessageSquare,
  LuGitCommitHorizontal,
  LuActivity,
  LuShieldCheck,
  LuCompass,
  LuAnchor,
} from "react-icons/lu";
import type { WordSenseItem, FunctionalInfo, PragmaticsInfo, DiscourseInfo } from "@types";
import { PanelScrollArea } from "../ui/panel-scroll-area";
import { getPosVisual, getLexFileVisual } from "@utils/lexicalIcons";

interface DefinitionPanelProps {
  word: string;
  activeSense: WordSenseItem | null;
  sentenceContext: string;
  totalSenses: number;
  functional?: FunctionalInfo | null;
  pragmatics?: PragmaticsInfo | null;
  discourse?: DiscourseInfo | null;
  onToggleCollapse?: () => void;
  onInspectWord?: (word: string) => void;
}

export const DefinitionPanel: React.FC<DefinitionPanelProps> = ({
  word,
  activeSense,
  sentenceContext,
  totalSenses,
  functional,
  pragmatics,
  discourse,
  onToggleCollapse,
  onInspectWord,
}) => {
  if (!word && !sentenceContext) {
    return (
      <Box p="4" h="100%" display="flex" alignItems="center" justifyContent="center">
        <EmptyState.Root size="sm">
          <EmptyState.Content>
            <EmptyState.Indicator>
              <LuBookOpen size={28} />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>Linguistic & Semantic Explorer</EmptyState.Title>
              <EmptyState.Description>
                Explore lexical definitions, systemic functional grammar (Theme/Rheme), pragmatics, and discourse coherence.
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      </Box>
    );
  }

  const getPosPalette = (pos: string) => {
    switch (pos?.toLowerCase()) {
      case "n":
      case "noun":
        return "teal";
      case "v":
      case "verb":
        return "purple";
      case "a":
      case "adj":
      case "adjective":
        return "orange";
      case "r":
      case "adv":
      case "adverb":
        return "cyan";
      default:
        return "gray";
    }
  };

  return (
    <Box h="100%" display="flex" flexDirection="column" overflow="hidden" bg="gray.925">
      <Tabs.Root
        defaultValue="definition"
        variant="subtle"
        size="sm"
        colorPalette="blue"
        h="100%"
        display="flex"
        flexDirection="column"
      >
        {/* Top Header & Tab Navigation Bar */}
        <Box px="3" pt="1.5" pb="0.5" borderBottomWidth="1px" borderColor="gray.800" bg="gray.950" overflow="hidden">
          <HStack justifyContent="space-between" alignItems="center" flexWrap="nowrap" gap="2" minW="0">
            <Tabs.List
              gap="1"
              flexWrap="nowrap"
              overflowX="auto"
              flexShrink={1}
              minW="0"
              css={{
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              <Tabs.Trigger value="definition" fontSize="xs" px="2" py="1" whiteSpace="nowrap" flexShrink={0}>
                <LuBookOpen size={13} style={{ flexShrink: 0 }} />
                <Text as="span" lineClamp={1} whiteSpace="nowrap">Definition & Examples</Text>
              </Tabs.Trigger>
              <Tabs.Trigger value="functional" fontSize="xs" px="2" py="1" whiteSpace="nowrap" flexShrink={0}>
                <LuSplit size={13} style={{ flexShrink: 0 }} />
                <Text as="span" lineClamp={1} whiteSpace="nowrap">Theme & Rheme (SFL)</Text>
              </Tabs.Trigger>
              <Tabs.Trigger value="pragmatics" fontSize="xs" px="2" py="1" whiteSpace="nowrap" flexShrink={0}>
                <LuMessageSquare size={13} style={{ flexShrink: 0 }} />
                <Text as="span" lineClamp={1} whiteSpace="nowrap">Pragmatics & Acts</Text>
              </Tabs.Trigger>
              <Tabs.Trigger value="discourse" fontSize="xs" px="2" py="1" whiteSpace="nowrap" flexShrink={0}>
                <LuGitCommitHorizontal size={13} style={{ flexShrink: 0 }} />
                <Text as="span" lineClamp={1} whiteSpace="nowrap">Discourse & Cohesion</Text>
              </Tabs.Trigger>
              <Tabs.Indicator rounded="sm" />
            </Tabs.List>

            <HStack gap="2" flexShrink={0} ml="auto">
              {word && activeSense && (
                <HStack gap="1.5" display={{ base: "none", sm: "flex" }} flexShrink={0}>
                  <Text fontSize="xs" fontWeight="bold" color="blue.200" lineClamp={1} maxW="120px" whiteSpace="nowrap">
                    {word}
                  </Text>
                  <Badge size="xs" variant="surface" colorPalette="blue" borderRadius="full" whiteSpace="nowrap">
                    Sense #{activeSense.senseNumber} of {totalSenses}
                  </Badge>
                </HStack>
              )}
              {onToggleCollapse && (
                <IconButton
                  size="xs"
                  variant="ghost"
                  color="gray.400"
                  _hover={{ bg: "gray.800", color: "white" }}
                  onClick={onToggleCollapse}
                  title="Collapse Definition Panel"
                  aria-label="Collapse Definition Panel"
                  flexShrink={0}
                >
                  <LuPanelBottomClose size={14} />
                </IconButton>
              )}
            </HStack>
          </HStack>
        </Box>

        {/* Tab 1: Definition & Examples */}
        <Tabs.Content value="definition" flex="1" p="0" minH="0" display="flex" flexDirection="column">
          <PanelScrollArea p="3.5">
            {activeSense ? (
              <Box>
                <HStack justifyContent="space-between" mb="2.5" flexWrap="wrap" gap="2">
                  <HStack gap="2" alignItems="center">
                    <Text fontSize="md" fontWeight="bold" color="blue.200">
                      {word}
                    </Text>
                    {(() => {
                      const posVis = getPosVisual(activeSense.pos);
                      return (
                        <Badge
                          size="xs"
                          variant="surface"
                          colorPalette={posVis.palette}
                          borderRadius="full"
                          px="2.5"
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
                    <Badge size="xs" variant="surface" colorPalette="blue" borderRadius="full" px="2">
                      Sense #{activeSense.senseNumber} of {totalSenses}
                    </Badge>
                  </HStack>

                  <HStack gap="2.5" alignItems="center">
                    {activeSense.lexfile && (() => {
                      const lexVis = getLexFileVisual(activeSense.lexfile);
                      return (
                        <Badge
                          size="xs"
                          variant="subtle"
                          colorPalette={lexVis.palette}
                          borderRadius="md"
                          px="2"
                          py="0.5"
                          display="inline-flex"
                          alignItems="center"
                          gap="1.5"
                        >
                          {lexVis.icon}
                          <Text as="span" fontSize="xs" fontWeight="medium">
                            {lexVis.label}
                          </Text>
                        </Badge>
                      );
                    })()}
                    {activeSense.ili && (
                      <HStack gap="1" color="gray.450" fontSize="xs">
                        <LuGlobe size={12} color="#4FD1C5" />
                        <Text>{activeSense.ili}</Text>
                      </HStack>
                    )}
                  </HStack>
                </HStack>

                {/* Horizontal Side-by-Side: Definition (Left) & Usage Examples (Right) */}
                <HStack align="stretch" gap="3" mb="3" flexWrap={{ base: "wrap", md: "nowrap" }}>
                  {/* Left Column: Definition */}
                  <Box flex="1" minW="260px" display="flex" flexDirection="column">
                    <HStack gap="1.5" mb="1.5" align="center">
                      <LuBookOpen size={13} color="#63B3ED" />
                      <Text fontSize="xs" fontWeight="bold" color="blue.300" textTransform="uppercase" letterSpacing="0.05em">
                        Definition
                      </Text>
                    </HStack>
                    <Box
                      p="3"
                      bg="gray.850"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="gray.800"
                      flex="1"
                      display="flex"
                      alignItems="center"
                    >
                      <Text fontSize="sm" fontWeight="medium" color="gray.100" lineHeight="1.6">
                        {activeSense.definition}
                      </Text>
                    </Box>
                  </Box>

                  {/* Right Column: Usage Examples */}
                  <Box flex="1" minW="260px" display="flex" flexDirection="column">
                    <HStack gap="1.5" mb="1.5" align="center">
                      <LuQuote size={13} color="#4FD1C5" />
                      <Text fontSize="xs" fontWeight="bold" color="teal.300" textTransform="uppercase" letterSpacing="0.05em">
                        Usage Examples
                      </Text>
                      {activeSense.examples && activeSense.examples.length > 0 && (
                        <Badge size="xs" variant="surface" colorPalette="teal">
                          {activeSense.examples.length}
                        </Badge>
                      )}
                    </HStack>
                    {activeSense.examples && activeSense.examples.length > 0 ? (
                      <VStack align="stretch" gap="1.5" flex="1" justify="center">
                        {activeSense.examples.map((ex, idx) => (
                          <HStack
                            key={idx}
                            alignItems="flex-start"
                            p="2.5"
                            bg="gray.850"
                            borderRadius="md"
                            borderLeftWidth="3px"
                            borderColor="teal.500"
                            borderWidth="1px"
                            borderRightColor="gray.800"
                            borderTopColor="gray.800"
                            borderBottomColor="gray.800"
                          >
                            <LuQuote size={12} color="#4FD1C5" style={{ flexShrink: 0, marginTop: "2px" }} />
                            <Text fontSize="xs" color="gray.200" fontStyle="italic" lineHeight="1.5">
                              "{ex}"
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    ) : (
                      <Box
                        p="3"
                        bg="gray.850"
                        borderRadius="md"
                        borderWidth="1px"
                        borderStyle="dashed"
                        borderColor="gray.800"
                        flex="1"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize="xs" color="gray.500" fontStyle="italic">
                          No usage examples recorded for this sense.
                        </Text>
                      </Box>
                    )}
                  </Box>
                </HStack>

                {/* Active Sentence Context */}
                {sentenceContext && sentenceContext !== word && (
                  <Box p="2.5" bg="gray.850" borderRadius="md" borderWidth="1px" borderColor="gray.800">
                    <HStack gap="1" mb="1">
                      <LuSparkles size={12} color="#63B3ED" />
                      <Text fontSize="xs" fontWeight="bold" color="blue.300" textTransform="uppercase">
                        Active Sentence Context
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.400" fontStyle="italic">
                      "{sentenceContext}"
                    </Text>
                  </Box>
                )}
              </Box>
            ) : (
              <EmptyState.Root size="sm" py="6">
                <EmptyState.Content>
                  <EmptyState.Indicator>
                    <LuBookOpen size={24} />
                  </EmptyState.Indicator>
                  <VStack textAlign="center">
                    <EmptyState.Title>No Sense Selected</EmptyState.Title>
                    <EmptyState.Description>
                      Select a word or choose a sense in the left navigator to view its dictionary definition and usage.
                    </EmptyState.Description>
                  </VStack>
                </EmptyState.Content>
              </EmptyState.Root>
            )}
          </PanelScrollArea>
        </Tabs.Content>

        {/* Tab 2: Functional Grammar (Systemic Functional Linguistics - SFL) */}
        <Tabs.Content value="functional" flex="1" p="0" minH="0" display="flex" flexDirection="column">
          <PanelScrollArea p="3.5">
            {functional && (functional.themeRheme.theme || functional.themeRheme.rheme) ? (
              <VStack align="stretch" gap="3.5">
                {/* Theme / Rheme Splitter */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="teal.300" textTransform="uppercase" mb="2">
                    Clause Information Structure (Theme / Rheme)
                  </Text>
                  <HStack align="stretch" gap="3">
                    {/* Theme */}
                    <Box
                      flex="1"
                      p="3"
                      bg="teal.950"
                      borderWidth="1px"
                      borderColor="teal.700"
                      borderRadius="lg"
                    >
                      <HStack justify="space-between" mb="1.5">
                        <Badge size="xs" colorPalette="teal" variant="solid" borderRadius="full">
                          THEME (GIVEN)
                        </Badge>
                        <Text fontSize="xs" color="teal.300">
                          Point of Departure
                        </Text>
                      </HStack>
                      <Text fontSize="sm" fontWeight="semibold" color="teal.100">
                        {functional.themeRheme.theme || "(implicit)"}
                      </Text>
                    </Box>

                    {/* Rheme */}
                    <Box
                      flex="2"
                      p="3"
                      bg="blue.950"
                      borderWidth="1px"
                      borderColor="blue.700"
                      borderRadius="lg"
                    >
                      <HStack justify="space-between" mb="1.5">
                        <Badge size="xs" colorPalette="blue" variant="solid" borderRadius="full">
                          RHEME (NEW)
                        </Badge>
                        <Text fontSize="xs" color="blue.300">
                          Core Informational Message
                        </Text>
                      </HStack>
                      <Text fontSize="sm" fontWeight="semibold" color="blue.100">
                        {functional.themeRheme.rheme || "(none)"}
                      </Text>
                    </Box>
                  </HStack>
                </Box>

                {/* Interpersonal Metafunction */}
                <Box p="3" bg="gray.850" borderRadius="lg" borderWidth="1px" borderColor="gray.800">
                  <Text fontSize="xs" fontWeight="bold" color="purple.300" textTransform="uppercase" mb="2">
                    Interpersonal Metafunction
                  </Text>
                  <HStack flexWrap="wrap" gap="4">
                    <Box>
                      <Text fontSize="xs" color="gray.400">Clause Mood</Text>
                      <Badge size="sm" variant="surface" colorPalette="purple" mt="0.5">
                        {functional.interpersonal.mood || "declarative"}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.400">Speech Function</Text>
                      <Badge size="sm" variant="surface" colorPalette="blue" mt="0.5">
                        {functional.interpersonal.speech_function || "statement"}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.400">Polarity</Text>
                      <Badge
                        size="sm"
                        variant="subtle"
                        colorPalette={functional.interpersonal.polarity === "negative" ? "red" : "green"}
                        mt="0.5"
                      >
                        {functional.interpersonal.polarity || "positive"}
                      </Badge>
                    </Box>
                    {functional.interpersonal.modality && (
                      <Box>
                        <Text fontSize="xs" color="gray.400">Modality Stance</Text>
                        <Badge size="sm" variant="outline" colorPalette="cyan" mt="0.5">
                          {functional.interpersonal.modality}
                        </Badge>
                      </Box>
                    )}
                  </HStack>
                </Box>

                {/* Cohesive Ties */}
                {functional.cohesiveTies && functional.cohesiveTies.length > 0 && (
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="cyan.300" textTransform="uppercase" mb="1.5">
                      Cohesive Ties in Context
                    </Text>
                    <HStack flexWrap="wrap" gap="2">
                      {functional.cohesiveTies.map((tie, idx) => (
                        <Badge key={idx} size="sm" variant="subtle" colorPalette="cyan" borderRadius="full" px="2.5">
                          {tie.word1} ↔ {tie.word2} ({tie.type})
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                )}
              </VStack>
            ) : (
              <EmptyState.Root size="sm" py="6">
                <EmptyState.Content>
                  <EmptyState.Indicator>
                    <LuSplit size={24} />
                  </EmptyState.Indicator>
                  <VStack textAlign="center">
                    <EmptyState.Title>No Clause Context</EmptyState.Title>
                    <EmptyState.Description>
                      Place the cursor inside a complete clause or sentence in the editor to analyze its Theme/Rheme information structure and interpersonal mood.
                    </EmptyState.Description>
                  </VStack>
                </EmptyState.Content>
              </EmptyState.Root>
            )}
          </PanelScrollArea>
        </Tabs.Content>

        {/* Tab 3: Pragmatics & Speech Acts */}
        <Tabs.Content value="pragmatics" flex="1" p="0" minH="0" display="flex" flexDirection="column">
          <PanelScrollArea p="3.5">
            {pragmatics && (pragmatics.speechAct.class || pragmatics.politeness.strategy) ? (
              <VStack align="stretch" gap="3.5">
                {/* Illocutionary Force */}
                <Box p="3" bg="gray.850" borderRadius="lg" borderWidth="1px" borderColor="gray.800">
                  <Stat.Root>
                    <Stat.Label fontSize="xs" color="gray.400">Illocutionary Force & Speech Act Class</Stat.Label>
                    <HStack justify="space-between" mt="1.5">
                      <HStack gap="2">
                        <Stat.ValueText fontSize="md" fontWeight="bold" color="purple.200" textTransform="capitalize">
                          {pragmatics.speechAct.class || "Assertive"}
                        </Stat.ValueText>
                        {pragmatics.speechAct.performative_verb && (
                          <Badge size="xs" variant="outline" colorPalette="purple">
                            verb: {pragmatics.speechAct.performative_verb}
                          </Badge>
                        )}
                      </HStack>
                      <Badge size="sm" colorPalette="purple" variant="surface">
                        {(pragmatics.speechAct.confidence * 100).toFixed(0)}% Confidence
                      </Badge>
                    </HStack>
                  </Stat.Root>
                </Box>

                {/* Politeness & Hedging Analysis */}
                <Box p="3" bg="gray.850" borderRadius="lg" borderWidth="1px" borderColor="gray.800">
                  <HStack justify="space-between" mb="2">
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="teal.300" textTransform="uppercase">
                        Interpersonal Politeness Strategy
                      </Text>
                      <Badge size="sm" variant="subtle" colorPalette="teal" mt="1">
                        {pragmatics.politeness.strategy || "Standard Communication"}
                      </Badge>
                    </Box>
                    <Box textAlign="right">
                      <Text fontSize="xs" color="gray.400">Hedge / Mitigation Score</Text>
                      <Text fontSize="sm" fontWeight="bold" color="teal.200">
                        {(pragmatics.politeness.hedge_score * 100).toFixed(0)}%
                      </Text>
                    </Box>
                  </HStack>

                  {pragmatics.politeness.mitigation_tags && pragmatics.politeness.mitigation_tags.length > 0 && (
                    <Box mt="2">
                      <Text fontSize="xs" color="gray.400" mb="1">Mitigation Elements Detected:</Text>
                      <HStack flexWrap="wrap" gap="1.5">
                        {pragmatics.politeness.mitigation_tags.map((tag, i) => (
                          <Badge key={i} size="xs" colorPalette="cyan" variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                  )}
                </Box>

                {/* Indexical Deixis */}
                {pragmatics.deixis && pragmatics.deixis.length > 0 && (
                  <Box>
                    <HStack gap="1" mb="2">
                      <LuCompass size={13} color="#63B3ED" />
                      <Text fontSize="xs" fontWeight="bold" color="blue.300" textTransform="uppercase">
                        Deictic Indexical Expressions ({pragmatics.deixis.length})
                      </Text>
                    </HStack>
                    <HStack flexWrap="wrap" gap="2">
                      {pragmatics.deixis.map((item, idx) => (
                        <Badge
                          key={idx}
                          size="sm"
                          variant="subtle"
                          colorPalette={
                            item.type === "person"
                              ? "blue"
                              : item.type === "spatial"
                              ? "teal"
                              : item.type === "temporal"
                              ? "purple"
                              : "gray"
                          }
                          borderRadius="full"
                          px="2.5"
                        >
                          <LuAnchor size={10} style={{ marginRight: 3, display: "inline" }} />
                          {item.word} ({item.type} {item.proximity ? `• ${item.proximity}` : ""})
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                )}
              </VStack>
            ) : (
              <EmptyState.Root size="sm" py="6">
                <EmptyState.Content>
                  <EmptyState.Indicator>
                    <LuMessageSquare size={24} />
                  </EmptyState.Indicator>
                  <VStack textAlign="center">
                    <EmptyState.Title>No Pragmatic Data</EmptyState.Title>
                    <EmptyState.Description>
                      Place the cursor inside an utterance to analyze illocutionary speech acts, politeness hedging, and indexical deixis.
                    </EmptyState.Description>
                  </VStack>
                </EmptyState.Content>
              </EmptyState.Root>
            )}
          </PanelScrollArea>
        </Tabs.Content>

        {/* Tab 4: Discourse & Cohesion */}
        <Tabs.Content value="discourse" flex="1" p="0" minH="0" display="flex" flexDirection="column">
          <PanelScrollArea p="3.5">
            {discourse && discourse.thematicProgression && discourse.thematicProgression.length > 0 ? (
              <VStack align="stretch" gap="3">
                <Text fontSize="xs" fontWeight="bold" color="orange.300" textTransform="uppercase">
                  Thematic Progression & Transitions
                </Text>
                {discourse.thematicProgression.map((step, idx) => (
                  <Box
                    key={idx}
                    p="2.5"
                    bg="gray.850"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="gray.800"
                  >
                    <HStack justify="space-between" mb="1">
                      <Badge size="xs" variant="surface" colorPalette="orange">
                        Clause #{step.sentence_id}
                      </Badge>
                      <Badge size="xs" colorPalette="cyan" variant="subtle">
                        Progression: {step.type}
                      </Badge>
                    </HStack>
                    <HStack gap="2" mt="1">
                      <Text fontSize="xs" color="teal.200" fontWeight="semibold">
                        Theme: "{step.theme}"
                      </Text>
                      <Text fontSize="xs" color="gray.500">→</Text>
                      <Text fontSize="xs" color="blue.200">
                        Rheme: "{step.rheme}"
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            ) : (
              <EmptyState.Root size="sm" py="6">
                <EmptyState.Content>
                  <EmptyState.Indicator>
                    <LuGitCommitHorizontal size={24} />
                  </EmptyState.Indicator>
                  <VStack textAlign="center">
                    <EmptyState.Title>Discourse Cohesion</EmptyState.Title>
                    <EmptyState.Description>
                      Write multi-sentence paragraphs to analyze thematic progression models (Constant Theme, Linear Rheme) and discourse coherence.
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
