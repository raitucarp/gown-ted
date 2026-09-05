import React from "react";
import { HStack, Text, Badge, Box } from "@chakra-ui/react";
import { PanelIconButton } from "@atoms/PanelIconButton";

interface PanelHeaderProps {
  icon: React.ReactNode;
  title: string;
  count?: number;
  countLabel?: string;
  badgeColorPalette?: string;
  onToggleCollapse?: () => void;
  onToggleSubpanel?: () => void;
  subpanelIcon?: React.ReactNode;
  subpanelTitle?: string;
  collapseIcon?: React.ReactNode;
  collapseTitle?: string;
  actions?: React.ReactNode;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  icon,
  title,
  count,
  countLabel,
  badgeColorPalette = "blue",
  onToggleCollapse,
  onToggleSubpanel,
  subpanelIcon,
  subpanelTitle = "Toggle subpanel",
  collapseIcon,
  collapseTitle = "Collapse panel",
  actions,
}) => {
  return (
    <HStack
      justify="space-between"
      px="3"
      py="2"
      borderBottomWidth="1px"
      borderColor="gray.800"
      bg="gray.900"
      flexShrink={0}
    >
      <HStack gap="2">
        <Box color="blue.400">{icon}</Box>
        <Text fontSize="xs" fontWeight="semibold" color="gray.200">
          {title}
        </Text>
        {count !== undefined && (
          <Badge size="xs" variant="subtle" colorPalette={badgeColorPalette}>
            {count} {countLabel}
          </Badge>
        )}
      </HStack>

      <HStack gap="1">
        {actions}
        {onToggleSubpanel && subpanelIcon && (
          <PanelIconButton
            icon={subpanelIcon}
            title={subpanelTitle}
            aria-label={subpanelTitle}
            onClick={onToggleSubpanel}
          />
        )}
        {onToggleCollapse && collapseIcon && (
          <PanelIconButton
            icon={collapseIcon}
            title={collapseTitle}
            aria-label={collapseTitle}
            onClick={onToggleCollapse}
          />
        )}
      </HStack>
    </HStack>
  );
};
