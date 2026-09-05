import React from "react";
import { HStack, Text, Badge } from "@chakra-ui/react";
import { LuCompass } from "react-icons/lu";

interface PolysemyMetricProps {
  totalSenses: number;
  entropy?: number;
  wsdConfidence?: number;
}

export const PolysemyMetric: React.FC<PolysemyMetricProps> = ({
  totalSenses,
  entropy,
  wsdConfidence,
}) => {
  return (
    <HStack
      justify="space-between"
      px="3"
      py="1.5"
      bg="gray.925"
      borderBottomWidth="1px"
      borderColor="gray.850"
      fontSize="xs"
      color="gray.400"
    >
      <HStack gap="1">
        <LuCompass size={11} />
        <Text>
          Polysemy: <Text as="span" color="gray.200" fontWeight="medium">{totalSenses}</Text> senses
        </Text>
        {entropy !== undefined && (
          <Text color="gray.500">
            (H: {entropy.toFixed(2)})
          </Text>
        )}
      </HStack>

      {wsdConfidence !== undefined && (
        <Badge size="xs" variant="outline" colorPalette="blue" fontSize="xs">
          WSD: {Math.round(wsdConfidence * 100)}%
        </Badge>
      )}
    </HStack>
  );
};
