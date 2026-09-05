import React from "react";
import { ScrollArea } from "@chakra-ui/react";

interface PanelScrollAreaProps {
  children: React.ReactNode;
  maxH?: string | number;
  h?: string | number;
  flex?: string | number;
  p?: string | number;
  className?: string;
}

export const PanelScrollArea: React.FC<PanelScrollAreaProps> = ({
  children,
  maxH,
  h = "100%",
  flex = "1",
  p,
  className,
}) => {
  return (
    <ScrollArea.Root
      h={h}
      maxH={maxH}
      flex={flex}
      size="xs"
      variant="hover"
      minH="0"
      w="100%"
      className={className}
    >
      <ScrollArea.Viewport style={{ height: "100%", width: "100%" }}>
        <ScrollArea.Content p={p} style={{ minWidth: "100%" }}>
          {children}
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical" bg="transparent" p="1px">
        <ScrollArea.Thumb bg="gray.700" _hover={{ bg: "gray.500" }} borderRadius="full" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
};
