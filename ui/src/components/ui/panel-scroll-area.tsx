import React from "react";
import { ScrollArea } from "@chakra-ui/react";

interface PanelScrollAreaProps {
  children: React.ReactNode;
  maxH?: string | number;
  h?: string | number;
  flex?: string | number;
  p?: string | number;
  className?: string;
  cursor?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  contentStyle?: React.CSSProperties;
}

export const PanelScrollArea: React.FC<PanelScrollAreaProps> = ({
  children,
  maxH,
  h = "100%",
  flex = "1",
  p,
  className,
  cursor,
  onClick,
  contentStyle,
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
      cursor={cursor}
      onClick={onClick}
    >
      <ScrollArea.Viewport style={{ height: "100%", width: "100%", cursor }}>
        <ScrollArea.Content
          p={p}
          style={{
            minWidth: "100%",
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            cursor,
            ...contentStyle,
          }}
        >
          {children}
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical" bg="transparent" p="1px">
        <ScrollArea.Thumb bg="gray.700" _hover={{ bg: "gray.500" }} borderRadius="full" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
};
