import React, { useState, useEffect, useCallback } from "react";
import { Box } from "@chakra-ui/react";

interface ResizeHandleProps {
  direction?: "horizontal" | "vertical";
  onResize: (delta: number) => void;
  onDoubleClick?: () => void;
  title?: string;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  direction = "horizontal",
  onResize,
  onDoubleClick,
  title = "Drag to resize (Double-click to collapse/expand)",
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    let lastPos = direction === "horizontal" ? -1 : -1;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const currentPos = direction === "horizontal" ? e.clientX : e.clientY;
      if (lastPos !== -1) {
        const delta = currentPos - lastPos;
        onResize(delta);
      }
      lastPos = currentPos;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, direction, onResize]);

  return (
    <Box
      position="relative"
      w={direction === "horizontal" ? "6px" : "100%"}
      h={direction === "horizontal" ? "100%" : "6px"}
      bg={isDragging ? "blue.500" : "transparent"}
      cursor={direction === "horizontal" ? "col-resize" : "row-resize"}
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
      title={title}
      zIndex={30}
      flexShrink={0}
      transition="background 0.15s ease"
      _hover={{
        bg: "blue.500",
        "& > .resize-indicator": { opacity: 1 },
      }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        className="resize-indicator"
        position="absolute"
        bg={isDragging ? "blue.300" : "gray.600"}
        borderRadius="full"
        opacity={isDragging ? 1 : 0}
        transition="opacity 0.15s ease, background 0.15s ease"
        {...(direction === "horizontal"
          ? { w: "2px", h: "32px" }
          : { h: "2px", w: "32px" })}
      />
    </Box>
  );
};
