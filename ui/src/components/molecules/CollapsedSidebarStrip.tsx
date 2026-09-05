import React from "react";
import { Box, VStack, Text } from "@chakra-ui/react";
import { PanelIconButton } from "@atoms/PanelIconButton";

interface ActionItem {
  icon: React.ReactNode;
  title: string;
  color?: string;
  onClick?: () => void;
}

interface CollapsedSidebarStripProps {
  side: "left" | "right";
  expandIcon: React.ReactNode;
  expandTitle: string;
  onExpand: () => void;
  label: string;
  items?: ActionItem[];
}

export const CollapsedSidebarStrip: React.FC<CollapsedSidebarStripProps> = ({
  side,
  expandIcon,
  expandTitle,
  onExpand,
  label,
  items = [],
}) => {
  const isLeft = side === "left";

  return (
    <Box
      w="38px"
      h="100%"
      bg="gray.950"
      borderRightWidth={isLeft ? "1px" : "0"}
      borderLeftWidth={!isLeft ? "1px" : "0"}
      borderColor="gray.800"
      display="flex"
      flexDirection="column"
      alignItems="center"
      py="2"
      gap="2.5"
      flexShrink={0}
    >
      <PanelIconButton
        icon={expandIcon}
        title={expandTitle}
        aria-label={expandTitle}
        onClick={onExpand}
      />

      {items.map((item, idx) => (
        <PanelIconButton
          key={idx}
          icon={item.icon}
          title={item.title}
          aria-label={item.title}
          color={item.color}
          onClick={item.onClick || onExpand}
        />
      ))}

      <Box
        flex="1"
        display="flex"
        alignItems="center"
        justifyContent="center"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        <Text fontSize="xs" color="gray.600" letterSpacing="0.08em" textTransform="uppercase">
          {label}
        </Text>
      </Box>
    </Box>
  );
};
