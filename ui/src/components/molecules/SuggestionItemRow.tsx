import React from "react";
import { HStack, VStack, Text, Badge, Box } from "@chakra-ui/react";
import { PosBadge } from "@atoms/PosBadge";
import type { SuggestionItem } from "@types";

interface SuggestionItemRowProps {
  item: SuggestionItem;
  isSelected: boolean;
  activeQuery?: string;
  onClick: () => void;
}

export const SuggestionItemRow: React.FC<SuggestionItemRowProps> = ({
  item,
  isSelected,
  activeQuery,
  onClick,
}) => {
  const renderHighlightedGloss = (gloss: string, query?: string) => {
    if (!gloss) return null;
    if (!query || query.trim().length < 2) return gloss;

    const q = query.trim().toLowerCase();
    const lower = gloss.toLowerCase();
    const matchIdx = lower.indexOf(q);

    let displayText = gloss;
    if (matchIdx > 50) {
      const startIdx = Math.max(0, matchIdx - 20);
      displayText = "..." + gloss.slice(startIdx);
    }

    const subLower = displayText.toLowerCase();
    const subMatch = subLower.indexOf(q);
    if (subMatch === -1) return displayText;

    const before = displayText.slice(0, subMatch);
    const match = displayText.slice(subMatch, subMatch + q.length);
    const after = displayText.slice(subMatch + q.length);

    return (
      <>
        {before}
        <Text as="span" color="amber.300" fontWeight="bold" bg="amber.950" px="0.5" borderRadius="sm">
          {match}
        </Text>
        {after}
      </>
    );
  };

  const getSourceBadge = (source?: string) => {
    switch (source) {
      case "Synonym":
        return <Badge size="xs" colorPalette="teal" variant="subtle">Synonym</Badge>;
      case "Definition":
        return <Badge size="xs" colorPalette="amber" variant="subtle">Def</Badge>;
      case "Example":
        return <Badge size="xs" colorPalette="purple" variant="subtle">Ex</Badge>;
      default:
        return null;
    }
  };

  return (
    <HStack
      px="3"
      py="2"
      justify="space-between"
      bg={isSelected ? "blue.950" : "transparent"}
      _hover={{ bg: isSelected ? "blue.900" : "gray.850", cursor: "pointer" }}
      borderBottomWidth="1px"
      borderColor="gray.850"
      transition="all 0.1s ease"
      onClick={onClick}
    >
      <VStack align="start" gap="0.5" flex="1" overflow="hidden">
        <HStack gap="2">
          <Text fontSize="xs" fontWeight="semibold" color={isSelected ? "blue.200" : "gray.200"}>
            {item.word}
          </Text>
          {item.pos && <PosBadge pos={item.pos} size="xs" />}
          {getSourceBadge(item.source)}
        </HStack>

        {item.gloss && (
          <Text fontSize="xs" color="gray.400" lineClamp={1} w="100%">
            {renderHighlightedGloss(item.gloss, activeQuery)}
          </Text>
        )}
      </VStack>

      {item.senseNumber > 0 && (
        <Badge size="xs" variant="outline" colorPalette="gray" fontSize="xs" flexShrink={0}>
          {item.senseNumber} senses
        </Badge>
      )}
    </HStack>
  );
};
