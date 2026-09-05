import React from "react";
import { Badge, HStack, Text } from "@chakra-ui/react";
import type { PoeticWordItem } from "@types";

interface PoeticWordChipProps {
  item: PoeticWordItem;
  colorPalette?: string;
  onInspect?: (word: string) => void;
}

export const PoeticWordChip: React.FC<PoeticWordChipProps> = ({
  item,
  colorPalette = "purple",
  onInspect,
}) => {
  return (
    <Badge
      size="sm"
      variant="surface"
      colorPalette={colorPalette}
      cursor="pointer"
      _hover={{ transform: "translateY(-1px)", filter: "brightness(1.15)" }}
      transition="all 0.15s ease"
      onClick={() => onInspect?.(item.word)}
      title={item.gloss ? `${item.word} (${item.syllableCount} syl): ${item.gloss}` : item.word}
      px="2"
      py="0.5"
    >
      <HStack gap="1.5">
        <Text as="span" fontWeight="medium">{item.word}</Text>
        <Text as="span" fontSize="xs" color="gray.400" fontFamily="mono">
          {item.syllableCount}s
        </Text>
      </HStack>
    </Badge>
  );
};
