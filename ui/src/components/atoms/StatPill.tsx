import React from "react";
import { HStack, Text, Box } from "@chakra-ui/react";

interface StatPillProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
}

export const StatPill: React.FC<StatPillProps> = ({
  icon,
  label,
  value,
  highlight = false,
}) => {
  return (
    <HStack
      gap="1.5"
      px="2"
      py="1"
      bg={highlight ? "blue.950" : "gray.900"}
      borderWidth="1px"
      borderColor={highlight ? "blue.800" : "gray.800"}
      borderRadius="md"
      fontSize="xs"
    >
      {icon && <Box color={highlight ? "blue.400" : "gray.400"}>{icon}</Box>}
      <Text color="gray.400">{label}:</Text>
      <Text fontWeight="semibold" color={highlight ? "blue.200" : "gray.200"}>
        {value}
      </Text>
    </HStack>
  );
};
