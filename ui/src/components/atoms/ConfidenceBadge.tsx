import React from "react";
import { Badge, HStack, Text } from "@chakra-ui/react";
import { LuSparkles } from "react-icons/lu";

interface ConfidenceBadgeProps {
  confidence: number;
  label?: string;
  size?: "xs" | "sm";
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  label = "WSD Fit",
  size = "xs",
}) => {
  const pct = Math.round(confidence * 100);
  const colorPalette = pct >= 70 ? "green" : pct >= 40 ? "yellow" : "gray";

  return (
    <Badge
      size={size}
      variant="subtle"
      colorPalette={colorPalette}
      fontSize="xs"
      fontFamily="mono"
      px="1.5"
      py="0.5"
    >
      <HStack gap="1">
        <LuSparkles size={10} />
        <Text as="span">
          {label}: {pct}%
        </Text>
      </HStack>
    </Badge>
  );
};
