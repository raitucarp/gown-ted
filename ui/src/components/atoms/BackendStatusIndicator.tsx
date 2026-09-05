import React from "react";
import { HStack, Box, Text } from "@chakra-ui/react";

interface BackendStatusIndicatorProps {
  isReady: boolean;
}

export const BackendStatusIndicator: React.FC<BackendStatusIndicatorProps> = ({
  isReady,
}) => {
  return (
    <HStack gap="1.5" fontSize="xs" color={isReady ? "green.400" : "amber.400"}>
      <Box
        w="2"
        h="2"
        borderRadius="full"
        bg={isReady ? "green.400" : "amber.400"}
        animation={isReady ? undefined : "pulse 1.5s infinite"}
      />
      <Text>{isReady ? "WordNet Ready" : "Indexing Lexicon..."}</Text>
    </HStack>
  );
};
