import React, { useRef, useEffect } from "react";
import { Box, HStack, Text, Badge, IconButton } from "@chakra-ui/react";
import { LuSparkles, LuX } from "react-icons/lu";
import { PanelScrollArea } from "../ui/panel-scroll-area";
import { getPosVisual } from "@utils/lexicalIcons";

import type { SuggestionItem, SuggestionPopupProps } from "@types";



const renderHighlightedGloss = (gloss: string, query?: string) => {
  if (!gloss) return null;
  if (!query || query.trim().length < 2) {
    return gloss;
  }

  const q = query.trim().toLowerCase();
  const lowerGloss = gloss.toLowerCase();
  const matchIdx = lowerGloss.indexOf(q);

  let displayText = gloss;
  // If match occurs far down the definition/example (e.g. past char 50),
  // create a snippet leading directly to the match so it is prominently visible
  if (matchIdx > 50) {
    const startIdx = Math.max(0, matchIdx - 20);
    displayText = "..." + gloss.slice(startIdx);
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
          fontStyle="normal"
        >
          {part}
        </Text>
      );
    }
    return <Text as="span" key={i}>{part}</Text>;
  });
};

const renderHighlightedWord = (word: string, query?: string) => {
  if (!word || !query || query.trim().length < 2) return word;
  const q = query.trim().toLowerCase();
  if (!word.toLowerCase().includes(q)) return word;

  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = word.split(regex);
  if (parts.length === 1) return word;

  return parts.map((part, i) => {
    if (part.toLowerCase() === q) {
      return (
        <Text as="span" key={i} color="blue.300" fontWeight="bold">
          {part}
        </Text>
      );
    }
    return <Text as="span" key={i}>{part}</Text>;
  });
};

export const SuggestionPopup: React.FC<SuggestionPopupProps> = ({
  suggestions,
  selectedIndex,
  position,
  activeQuery,
  onSelect,
  onClose,
}) => {
  const activeItemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  if (!position || suggestions.length === 0) return null;

  return (
    <Box
      position="fixed"
      top={`${position.top}px`}
      left={`${position.left}px`}
      zIndex={1000}
      bg="gray.900"
      borderColor="blue.500"
      borderWidth="1px"
      borderRadius="md"
      boxShadow="0 8px 24px rgba(0,0,0,0.6)"
      minW="340px"
      maxW="460px"
      overflow="hidden"
      animation="fadeIn 0.1s ease"
    >
      <HStack
        bg="gray.850"
        px="2.5"
        py="1.5"
        borderBottomWidth="1px"
        borderColor="gray.800"
        justifyContent="space-between"
      >
        <HStack gap="1.5">
          <LuSparkles color="#63B3ED" size={13} />
          <Text fontSize="xs" fontWeight="bold" color="blue.300" textTransform="uppercase" letterSpacing="0.05em">
            WordNet Suggestions
          </Text>
        </HStack>
        <HStack gap="2" align="center">
          <Text fontSize="xs" color="gray.500">
            ↑↓ navigate • ↵ insert
          </Text>
          <IconButton
            size="xs"
            variant="ghost"
            color="gray.400"
            _hover={{ bg: "gray.750", color: "white" }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Close suggestions (Esc)"
            aria-label="Close suggestions"
            w="18px"
            h="18px"
            minW="18px"
          >
            <LuX size={12} />
          </IconButton>
        </HStack>
      </HStack>

      <PanelScrollArea maxH="280px">
        {suggestions.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          const posVis = item.pos ? getPosVisual(item.pos) : null;
          return (
            <Box
              key={`${item.word}-${idx}`}
              ref={isSelected ? activeItemRef : undefined}
              px="3"
              py="2"
              cursor="pointer"
              bg={isSelected ? "blue.900" : "transparent"}
              borderLeftWidth={isSelected ? "3px" : "0"}
              borderColor="blue.400"
              _hover={{ bg: isSelected ? "blue.900" : "gray.800" }}
              onClick={() => onSelect(item)}
              transition="background 0.1s ease"
            >
              <HStack justifyContent="space-between" mb="1" align="center">
                <HStack gap="1.5" align="center" minW="0">
                  <Text
                    fontSize="sm"
                    fontWeight={isSelected ? "bold" : "medium"}
                    color={isSelected ? "blue.200" : "gray.100"}
                    lineClamp={1}
                  >
                    {renderHighlightedWord(item.word, activeQuery)}
                  </Text>
                  {item.source && (
                    <Badge
                      size="xs"
                      variant="surface"
                      colorPalette={
                        item.source === "Synonym"
                          ? "green"
                          : item.source === "Definition"
                          ? "purple"
                          : item.source === "Example"
                          ? "teal"
                          : "blue"
                      }
                      borderRadius="sm"
                      px="1.5"
                      whiteSpace="nowrap"
                    >
                      {item.source}
                    </Badge>
                  )}
                </HStack>

                {posVis && (
                  <Badge
                    size="xs"
                    colorPalette={posVis.palette}
                    variant="subtle"
                    borderRadius="full"
                    px="1.5"
                    display="inline-flex"
                    alignItems="center"
                    gap="1"
                    flexShrink={0}
                  >
                    {posVis.icon}
                    <Text as="span">{posVis.label}</Text>
                  </Badge>
                )}
              </HStack>
              {item.gloss && (
                <Text
                  fontSize="xs"
                  color={
                    activeQuery &&
                    activeQuery.length >= 2 &&
                    item.gloss.toLowerCase().includes(activeQuery.toLowerCase())
                      ? "gray.200"
                      : "gray.400"
                  }
                  lineClamp={2}
                  fontStyle="italic"
                  mt="0.5"
                  lineHeight="shorter"
                >
                  "{renderHighlightedGloss(item.gloss, activeQuery)}"
                </Text>
              )}
            </Box>
          );
        })}
      </PanelScrollArea>
    </Box>
  );
};
