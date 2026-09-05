import React from "react";
import { Badge, HStack, Text } from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";

interface RelationWordChipProps {
  word: string;
  colorPalette?: string;
  onInspect?: (word: string) => void;
  onInsert?: (word: string) => void;
}

export const RelationWordChip: React.FC<RelationWordChipProps> = ({
  word,
  colorPalette = "gray",
  onInspect,
  onInsert,
}) => {
  return (
    <Badge
      size="sm"
      variant="surface"
      colorPalette={colorPalette}
      cursor="pointer"
      _hover={{ transform: "translateY(-1px)", filter: "brightness(1.15)" }}
      transition="all 0.15s ease"
      onClick={() => onInspect?.(word)}
      title="Click to inspect this word"
      px="2"
      py="0.5"
    >
      <HStack gap="1">
        <Text as="span">{word}</Text>
        {onInsert && (
          <Text
            as="span"
            color="gray.500"
            _hover={{ color: "blue.300" }}
            onClick={(e) => {
              e.stopPropagation();
              onInsert(word);
            }}
            title="Insert into editor"
          >
            <LuPlus size={10} />
          </Text>
        )}
      </HStack>
    </Badge>
  );
};
