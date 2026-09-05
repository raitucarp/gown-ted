import React from "react";
import { Badge, HStack, Text } from "@chakra-ui/react";
import { getLexFileVisual } from "@utils/lexicalIcons";

interface LexFileBadgeProps {
  lexfile: string;
  size?: "xs" | "sm";
}

export const LexFileBadge: React.FC<LexFileBadgeProps> = ({ lexfile, size = "xs" }) => {
  if (!lexfile) return null;
  const visual = getLexFileVisual(lexfile);

  return (
    <Badge
      size={size}
      variant="outline"
      colorPalette={visual.palette}
      fontSize="xs"
      px="1.5"
      py="0.5"
    >
      <HStack gap="1">
        {visual.icon}
        <Text as="span">{visual.label}</Text>
      </HStack>
    </Badge>
  );
};
