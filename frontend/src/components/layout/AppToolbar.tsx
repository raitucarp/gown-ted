import React from "react";
import { HStack, Text, Button, Badge, IconButton, Box } from "@chakra-ui/react";
import {
  LuBookMarked,
  LuFileText,
  LuMaximize2,
  LuMinimize2,
  LuMinus,
  LuSquare,
  LuX,
  LuPanelLeft,
  LuPanelLeftClose,
  LuPanelRight,
  LuPanelRightClose,
  LuPanelBottom,
  LuPanelBottomClose,
} from "react-icons/lu";
import { Window } from "@wailsio/runtime";

interface AppToolbarProps {
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  onNewDocument: () => void;
  isBackendReady: boolean;
  isLeftOpen?: boolean;
  onToggleLeft?: () => void;
  isRightOpen?: boolean;
  onToggleRight?: () => void;
  isBottomOpen?: boolean;
  onToggleBottom?: () => void;
}

export const AppToolbar: React.FC<AppToolbarProps> = ({
  isFocusMode,
  onToggleFocusMode,
  onNewDocument,
  isBackendReady,
  isLeftOpen = true,
  onToggleLeft,
  isRightOpen = true,
  onToggleRight,
  isBottomOpen = true,
  onToggleBottom,
}) => {
  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    Window.Minimise().catch(console.error);
  };

  const handleToggleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    Window.ToggleMaximise().catch(console.error);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    Window.Close().catch(console.error);
  };

  const handleDragMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      const wails = (window as any)._wails;
      if (wails && typeof wails.invoke === "function") {
        wails.invoke("wails:drag");
      }
    }
  };

  const handleTitleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    Window.ToggleMaximise().catch(console.error);
  };

  return (
    <HStack
      px="3"
      h="40px"
      justifyContent="space-between"
      bg="gray.950"
      borderBottomWidth="1px"
      borderColor="gray.800"
      zIndex={100}
      userSelect="none"
      onMouseDown={handleDragMouseDown}
      onDoubleClick={handleTitleDoubleClick}
      cursor="default"
      style={{
        ["--wails-draggable" as string]: "drag",
        WebkitAppRegion: "drag",
        ["--wails-non-client-region" as string]: "caption",
      } as React.CSSProperties}
    >
      {/* Brand & Left Controls (no drag) */}
      <HStack
        gap="2.5"
        alignItems="center"
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          ["--wails-draggable" as string]: "no-drag",
          WebkitAppRegion: "no-drag",
          ["--wails-non-client-region" as string]: "none",
        } as React.CSSProperties}
      >
        <HStack gap="1.5">
          <LuBookMarked color="#63B3ED" size={17} />
          <Text fontSize="sm" fontWeight="bold" color="blue.200" letterSpacing="-0.01em">
            gown-ted
          </Text>
        </HStack>
        <Badge size="xs" variant="surface" colorPalette="blue">
          WordNet Editor
        </Badge>
        {isBackendReady ? (
          <Badge size="xs" colorPalette="green" variant="subtle">
            OEWN 3.1
          </Badge>
        ) : (
          <Badge size="xs" colorPalette="yellow" variant="subtle">
            Initializing...
          </Badge>
        )}

        <Button
          size="xs"
          variant="subtle"
          colorPalette="gray"
          onClick={onNewDocument}
          title="Create New Blank Document"
          ml="1"
        >
          <LuFileText size={13} />
          New
        </Button>
      </HStack>

      {/* Draggable Center Area with Title */}
      <HStack
        flex="1"
        h="100%"
        justifyContent="center"
        alignItems="center"
        onMouseDown={handleDragMouseDown}
        onDoubleClick={handleTitleDoubleClick}
        cursor="move"
        style={{
          ["--wails-draggable" as string]: "drag",
          WebkitAppRegion: "drag",
          ["--wails-non-client-region" as string]: "caption",
        } as React.CSSProperties}
      >
        <Text fontSize="xs" color="gray.400" fontWeight="medium">
          gown-ted — Golang WordNet Text Editor
        </Text>
      </HStack>

      {/* Right Controls & Window Actions (no drag) */}
      <HStack
        gap="1"
        alignItems="center"
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          ["--wails-draggable" as string]: "no-drag",
          WebkitAppRegion: "no-drag",
          ["--wails-non-client-region" as string]: "none",
        } as React.CSSProperties}
      >
        {/* Panel Toggles */}
        {onToggleLeft && (
          <IconButton
            size="xs"
            variant={isLeftOpen ? "subtle" : "ghost"}
            colorPalette={isLeftOpen ? "blue" : "gray"}
            color={isLeftOpen ? "blue.200" : "gray.400"}
            onClick={onToggleLeft}
            title={isLeftOpen ? "Hide Left Sidebar (Senses & Morphology)" : "Show Left Sidebar"}
            aria-label="Toggle Left Sidebar"
          >
            {isLeftOpen ? <LuPanelLeftClose size={14} /> : <LuPanelLeft size={14} />}
          </IconButton>
        )}

        {onToggleBottom && (
          <IconButton
            size="xs"
            variant={isBottomOpen ? "subtle" : "ghost"}
            colorPalette={isBottomOpen ? "blue" : "gray"}
            color={isBottomOpen ? "blue.200" : "gray.400"}
            onClick={onToggleBottom}
            title={isBottomOpen ? "Hide Definition Explorer" : "Show Definition Explorer"}
            aria-label="Toggle Definition Explorer"
          >
            {isBottomOpen ? <LuPanelBottomClose size={14} /> : <LuPanelBottom size={14} />}
          </IconButton>
        )}

        {onToggleRight && (
          <IconButton
            size="xs"
            variant={isRightOpen ? "subtle" : "ghost"}
            colorPalette={isRightOpen ? "blue" : "gray"}
            color={isRightOpen ? "blue.200" : "gray.400"}
            onClick={onToggleRight}
            title={isRightOpen ? "Hide Right Sidebar (Synonyms & Tree)" : "Show Right Sidebar"}
            aria-label="Toggle Right Sidebar"
          >
            {isRightOpen ? <LuPanelRightClose size={14} /> : <LuPanelRight size={14} />}
          </IconButton>
        )}

        <Box w="1px" h="14px" bg="gray.800" mx="1" />

        {/* Focus Mode */}
        <IconButton
          size="xs"
          variant={isFocusMode ? "solid" : "ghost"}
          colorPalette="blue"
          onClick={onToggleFocusMode}
          title={isFocusMode ? "Exit Focus Mode" : "Distraction-Free Focus Mode"}
          aria-label="Focus mode"
          mr="2"
        >
          {isFocusMode ? <LuMinimize2 size={14} /> : <LuMaximize2 size={14} />}
        </IconButton>

        {/* Window Controls: Minimize, Maximize/Restore, Close */}
        <IconButton
          size="xs"
          variant="ghost"
          onClick={handleMinimize}
          title="Minimize Window"
          aria-label="Minimize"
          color="gray.300"
          _hover={{ bg: "gray.800", color: "white" }}
          w="30px"
          h="28px"
        >
          <LuMinus size={14} />
        </IconButton>

        <IconButton
          size="xs"
          variant="ghost"
          onClick={handleToggleMaximize}
          title="Maximize / Restore Window"
          aria-label="Maximize"
          color="gray.300"
          _hover={{ bg: "gray.800", color: "white" }}
          w="30px"
          h="28px"
        >
          <LuSquare size={12} />
        </IconButton>

        <IconButton
          size="xs"
          variant="ghost"
          onClick={handleClose}
          title="Close Window"
          aria-label="Close"
          color="gray.300"
          _hover={{ bg: "red.600", color: "white" }}
          w="30px"
          h="28px"
        >
          <LuX size={15} />
        </IconButton>
      </HStack>
    </HStack>
  );
};
