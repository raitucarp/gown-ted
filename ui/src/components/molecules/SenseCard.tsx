import React from "react";
import { Box, HStack, VStack, Text, Badge } from "@chakra-ui/react";
import { PosBadge } from "@atoms/PosBadge";
import { LexFileBadge } from "@atoms/LexFileBadge";
import { ConfidenceBadge } from "@atoms/ConfidenceBadge";
import type { WordSenseItem } from "@types";

interface SenseCardProps {
  sense: WordSenseItem;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
}

export const SenseCard: React.FC<SenseCardProps> = ({
  sense,
  isSelected,
  isRecommended,
  onSelect,
}) => {
  return (
    <Box
      p="3"
      borderRadius="md"
      borderWidth="1px"
      borderColor={isSelected ? "blue.500" : "gray.800"}
      bg={isSelected ? "gray.850" : "gray.900"}
      _hover={{ borderColor: isSelected ? "blue.400" : "gray.700", cursor: "pointer" }}
      transition="all 0.15s ease"
      onClick={onSelect}
    >
      <HStack justify="space-between" mb="1.5" wrap="wrap" gap="1">
        <HStack gap="1.5">
          <Badge
            size="xs"
            variant={isSelected ? "solid" : "subtle"}
            colorPalette={isSelected ? "blue" : "gray"}
            fontFamily="mono"
          >
            #{sense.senseNumber}
          </Badge>
          <PosBadge pos={sense.pos} />
          {isRecommended && (
            <Badge size="xs" colorPalette="amber" variant="subtle">
              Context Fit
            </Badge>
          )}
        </HStack>

        <ConfidenceBadge confidence={sense.confidence} />
      </HStack>

      <Text fontSize="xs" color={isSelected ? "gray.100" : "gray.300"} lineHeight="1.5" mb="1.5">
        {sense.definition}
      </Text>

      {sense.examples && sense.examples.length > 0 && (
        <VStack align="stretch" gap="1" pl="2" borderLeftWidth="2px" borderColor="gray.750" mt="1.5">
          {sense.examples.slice(0, 2).map((ex, exIdx) => (
            <Text key={exIdx} fontSize="xs" color="gray.400" fontStyle="italic">
              &ldquo;{ex}&rdquo;
            </Text>
          ))}
        </VStack>
      )}

      {sense.lexfile && (
        <Box mt="2">
          <LexFileBadge lexfile={sense.lexfile} />
        </Box>
      )}
    </Box>
  );
};
