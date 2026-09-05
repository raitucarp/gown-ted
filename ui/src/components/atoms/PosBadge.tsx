import React from "react";
import { Badge, HStack, Text } from "@chakra-ui/react";
import { getPosVisual } from "@utils/lexicalIcons";

interface PosBadgeProps {
  pos: string;
  size?: "xs" | "sm" | "md";
}

export const PosBadge: React.FC<PosBadgeProps> = ({ pos, size = "xs" }) => {
  const visual = getPosVisual(pos);

  return (
    <Badge
      size={size}
      variant="surface"
      colorPalette={visual.palette}
      fontFamily="mono"
      px="1.5"
      py="0.5"
      borderRadius="md"
    >
      <HStack gap="1">
        {visual.icon}
        <Text as="span">{visual.label}</Text>
      </HStack>
    </Badge>
  );
};
