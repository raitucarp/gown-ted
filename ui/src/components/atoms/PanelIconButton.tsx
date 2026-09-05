import React from "react";
import { IconButton } from "@chakra-ui/react";

interface PanelIconButtonProps {
  icon: React.ReactNode;
  title: string;
  "aria-label": string;
  onClick?: () => void;
  size?: "xs" | "sm";
  variant?: "ghost" | "subtle" | "outline";
  color?: string;
}

export const PanelIconButton: React.FC<PanelIconButtonProps> = ({
  icon,
  title,
  "aria-label": ariaLabel,
  onClick,
  size = "xs",
  variant = "ghost",
  color = "gray.400",
}) => {
  return (
    <IconButton
      size={size}
      variant={variant}
      color={color}
      _hover={{ bg: "gray.800", color: "gray.200" }}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
    >
      {icon}
    </IconButton>
  );
};
