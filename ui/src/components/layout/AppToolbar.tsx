import React from "react";
import {
  HStack,
  Text,
  Button,
  Badge,
  IconButton,
  Box,
  Portal,
  MenuRoot,
  MenuTrigger,
  MenuPositioner,
  MenuContent,
  MenuItem,
  MenuItemText,
  MenuItemCommand,
  MenuSeparator,
  MenuTriggerItem,
  Image,
} from "@chakra-ui/react";
import {
  LuBookMarked,
  LuFileText,
  LuFolderOpen,
  LuHistory,
  LuFolderClock,
  LuSave,
  LuLogOut,
  LuInfo,
  LuChevronRight,
  LuTrash2,
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
import { Window, Application } from "@wailsio/runtime";

interface AppToolbarProps {
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  onLoadSample?: (sampleKey: string) => void;
  isBackendReady: boolean;
  isLeftOpen?: boolean;
  onToggleLeft?: () => void;
  isRightOpen?: boolean;
  onToggleRight?: () => void;
  isBottomOpen?: boolean;
  onToggleBottom?: () => void;
  // File menu actions
  onOpenFile: () => void;
  onOpenFolder: () => void;
  recentFiles: string[];
  recentFolders: string[];
  onSelectRecentFile: (path: string) => void;
  onSelectRecentFolder: (path: string) => void;
  onClearRecentFiles: () => void;
  onClearRecentFolders: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  // Help menu
  onOpenAbout: () => void;
}

export const AppToolbar: React.FC<AppToolbarProps> = ({
  isFocusMode,
  onToggleFocusMode,
  onLoadSample,
  isBackendReady,
  isLeftOpen = true,
  onToggleLeft,
  isRightOpen = true,
  onToggleRight,
  isBottomOpen = true,
  onToggleBottom,
  onOpenFile,
  onOpenFolder,
  recentFiles,
  recentFolders,
  onSelectRecentFile,
  onSelectRecentFolder,
  onClearRecentFiles,
  onClearRecentFolders,
  onSave,
  onSaveAs,
  onOpenAbout,
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

  const handleExit = () => {
    try {
      Application.Quit();
    } catch {
      Window.Close().catch(console.error);
    }
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
          <Image src="/app-icon.png" alt="gown-ted icon" boxSize="18px" borderRadius="xs" />
          <Text fontSize="sm" fontWeight="bold" color="blue.200" letterSpacing="-0.01em">
            gown-ted
          </Text>
        </HStack>
        <Badge size="sm" variant="surface" colorPalette="blue" px="2">
          WordNet Editor
        </Badge>
        {isBackendReady ? (
          <Badge size="sm" colorPalette="green" variant="subtle" px="2">
            OEWN 3.1
          </Badge>
        ) : (
          <Badge size="sm" colorPalette="yellow" variant="subtle" px="2">
            Initializing...
          </Badge>
        )}

        {/* File Menu */}
        <MenuRoot size="sm" positioning={{ placement: "bottom-start", gutter: 4 }}>
          <MenuTrigger asChild>
            <Button
              size="xs"
              variant="ghost"
              color="gray.300"
              bg="transparent"
              px="2.5"
              h="24px"
              fontSize="xs"
              fontWeight="medium"
              borderRadius="sm"
              cursor="pointer"
              _hover={{ bg: "whiteAlpha.150", color: "white" }}
              _active={{ bg: "whiteAlpha.200", color: "white" }}
              _open={{ bg: "whiteAlpha.200", color: "white" }}
              _focus={{ outline: "none", boxShadow: "none" }}
              _focusVisible={{ outline: "none", boxShadow: "none", ring: "1px", ringColor: "blue.400" }}
            >
              File
            </Button>
          </MenuTrigger>
          <Portal>
            <MenuPositioner>
              <MenuContent
                bg="gray.900"
                borderColor="gray.750"
                borderWidth="1px"
                color="gray.200"
                minW="250px"
                p="1.5"
                borderRadius="md"
                boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)"
                zIndex={200}
              >
                <MenuItem
                  value="open-file"
                  onClick={onOpenFile}
                  cursor="pointer"
                  px="2.5"
                  py="1.5"
                  borderRadius="sm"
                  gap="2.5"
                  _hover={{ bg: "whiteAlpha.150", color: "white" }}
                  _highlighted={{ bg: "whiteAlpha.150", color: "white" }}
                >
                  <LuFileText size={15} color="#A0AEC0" />
                  <MenuItemText fontSize="xs" fontWeight="medium">
                    Open File...
                  </MenuItemText>
                  <MenuItemCommand fontSize="xs" color="gray.400" pr="1.5">
                    Ctrl+O
                  </MenuItemCommand>
                </MenuItem>

                <MenuItem
                  value="open-folder"
                  onClick={onOpenFolder}
                  cursor="pointer"
                  px="2.5"
                  py="1.5"
                  borderRadius="sm"
                  gap="2.5"
                  _hover={{ bg: "whiteAlpha.150", color: "white" }}
                  _highlighted={{ bg: "whiteAlpha.150", color: "white" }}
                >
                  <LuFolderOpen size={15} color="#A0AEC0" />
                  <MenuItemText fontSize="xs" fontWeight="medium">
                    Open Folder...
                  </MenuItemText>
                </MenuItem>

                <MenuSeparator my="1" borderColor="gray.800" />

                {/* Open Recent Files */}
                <MenuRoot size="sm" positioning={{ placement: "right-start", gutter: 4 }}>
                  <MenuTriggerItem
                    cursor="pointer"
                    px="2.5"
                    py="1.5"
                    borderRadius="sm"
                    gap="2.5"
                    _hover={{ bg: "whiteAlpha.150", color: "white" }}
                    _highlighted={{ bg: "whiteAlpha.150", color: "white" }}
                  >
                    <LuHistory size={15} color="#A0AEC0" />
                    <MenuItemText fontSize="xs" fontWeight="medium">
                      Open Recent
                    </MenuItemText>
                    <LuChevronRight size={13} color="#718096" style={{ marginRight: "2px" }} />
                  </MenuTriggerItem>
                  <Portal>
                    <MenuPositioner>
                      <MenuContent
                        bg="gray.900"
                        borderColor="gray.750"
                        borderWidth="1px"
                        color="gray.200"
                        minW="260px"
                        p="1.5"
                        borderRadius="md"
                        boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)"
                        zIndex={201}
                      >
                        {recentFiles.length === 0 ? (
                          <MenuItem value="empty-recent-files" disabled px="2.5" py="1.5">
                            <MenuItemText color="gray.500" fontStyle="italic" fontSize="xs">
                              No Recent Files
                            </MenuItemText>
                          </MenuItem>
                        ) : (
                          <>
                            {recentFiles.map((path) => (
                              <MenuItem
                                key={path}
                                value={path}
                                onClick={() => onSelectRecentFile(path)}
                                cursor="pointer"
                                px="2.5"
                                py="1.5"
                                borderRadius="sm"
                                gap="2.5"
                                _hover={{ bg: "whiteAlpha.150", color: "white" }}
                                _highlighted={{ bg: "whiteAlpha.150", color: "white" }}
                              >
                                <LuFileText size={14} color="#718096" />
                                <MenuItemText truncate title={path} fontSize="xs">
                                  {path.split(/[/\\]/).pop()}
                                </MenuItemText>
                              </MenuItem>
                            ))}
                            <MenuSeparator my="1" borderColor="gray.800" />
                            <MenuItem
                              value="clear-recent-files"
                              onClick={onClearRecentFiles}
                              cursor="pointer"
                              px="2.5"
                              py="1.5"
                              borderRadius="sm"
                              gap="2.5"
                              color="red.400"
                              _hover={{ bg: "red.950/50", color: "red.300" }}
                              _highlighted={{ bg: "red.950/50", color: "red.300" }}
                            >
                              <LuTrash2 size={14} />
                              <MenuItemText fontSize="xs">Clear Recent Files</MenuItemText>
                            </MenuItem>
                          </>
                        )}
                      </MenuContent>
                    </MenuPositioner>
                  </Portal>
                </MenuRoot>

                {/* Open Recent Folders */}
                <MenuRoot size="sm" positioning={{ placement: "right-start", gutter: 4 }}>
                  <MenuTriggerItem
                    cursor="pointer"
                    px="2.5"
                    py="1.5"
                    borderRadius="sm"
                    gap="2.5"
                    _hover={{ bg: "whiteAlpha.150", color: "white" }}
                    _highlighted={{ bg: "whiteAlpha.150", color: "white" }}
                  >
                    <LuFolderClock size={15} color="#A0AEC0" />
                    <MenuItemText fontSize="xs" fontWeight="medium">
                      Open Recent Folder
                    </MenuItemText>
                    <LuChevronRight size={13} color="#718096" style={{ marginRight: "2px" }} />
                  </MenuTriggerItem>
                  <Portal>
                    <MenuPositioner>
                      <MenuContent
                        bg="gray.900"
                        borderColor="gray.750"
                        borderWidth="1px"
                        color="gray.200"
                        minW="260px"
                        p="1.5"
                        borderRadius="md"
                        boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)"
                        zIndex={201}
                      >
                        {recentFolders.length === 0 ? (
                          <MenuItem value="empty-recent-folders" disabled px="2.5" py="1.5">
                            <MenuItemText color="gray.500" fontStyle="italic" fontSize="xs">
                              No Recent Folders
                            </MenuItemText>
                          </MenuItem>
                        ) : (
                          <>
                            {recentFolders.map((folder) => (
                              <MenuItem
                                key={folder}
                                value={folder}
                                onClick={() => onSelectRecentFolder(folder)}
                                cursor="pointer"
                                px="2.5"
                                py="1.5"
                                borderRadius="sm"
                                gap="2.5"
                                _hover={{ bg: "whiteAlpha.150", color: "white" }}
                                _highlighted={{ bg: "whiteAlpha.150", color: "white" }}
                              >
                                <LuFolderOpen size={14} color="#718096" />
                                <MenuItemText truncate title={folder} fontSize="xs">
                                  {folder.split(/[/\\]/).pop() || folder}
                                </MenuItemText>
                              </MenuItem>
                            ))}
                            <MenuSeparator my="1" borderColor="gray.800" />
                            <MenuItem
                              value="clear-recent-folders"
                              onClick={onClearRecentFolders}
                              cursor="pointer"
                              px="2.5"
                              py="1.5"
                              borderRadius="sm"
                              gap="2.5"
                              color="red.400"
                              _hover={{ bg: "red.950/50", color: "red.300" }}
                              _highlighted={{ bg: "red.950/50", color: "red.300" }}
                            >
                              <LuTrash2 size={14} />
                              <MenuItemText fontSize="xs">Clear Recent Folders</MenuItemText>
                            </MenuItem>
                          </>
                        )}
                      </MenuContent>
                    </MenuPositioner>
                  </Portal>
                </MenuRoot>

                <MenuSeparator my="1" borderColor="gray.800" />

                <MenuItem
                  value="save"
                  onClick={onSave}
                  cursor="pointer"
                  px="2.5"
                  py="1.5"
                  borderRadius="sm"
                  gap="2.5"
                  _hover={{ bg: "whiteAlpha.150", color: "white" }}
                  _highlighted={{ bg: "whiteAlpha.150", color: "white" }}
                >
                  <LuSave size={15} color="#A0AEC0" />
                  <MenuItemText fontSize="xs" fontWeight="medium">
                    Save
                  </MenuItemText>
                  <MenuItemCommand fontSize="xs" color="gray.400" pr="1.5">
                    Ctrl+S
                  </MenuItemCommand>
                </MenuItem>

                <MenuItem
                  value="save-as"
                  onClick={onSaveAs}
                  cursor="pointer"
                  px="2.5"
                  py="1.5"
                  borderRadius="sm"
                  gap="2.5"
                  _hover={{ bg: "whiteAlpha.150", color: "white" }}
                  _highlighted={{ bg: "whiteAlpha.150", color: "white" }}
                >
                  <LuSave size={15} color="#A0AEC0" />
                  <MenuItemText fontSize="xs" fontWeight="medium">
                    Save As...
                  </MenuItemText>
                  <MenuItemCommand fontSize="xs" color="gray.400" pr="1.5">
                    Ctrl+Shift+S
                  </MenuItemCommand>
                </MenuItem>

                <MenuSeparator my="1" borderColor="gray.800" />

                <MenuItem
                  value="exit"
                  onClick={handleExit}
                  cursor="pointer"
                  px="2.5"
                  py="1.5"
                  borderRadius="sm"
                  gap="2.5"
                  color="red.400"
                  _hover={{ bg: "red.950/50", color: "red.300" }}
                  _highlighted={{ bg: "red.950/50", color: "red.300" }}
                >
                  <LuLogOut size={15} color="#F56565" />
                  <MenuItemText fontSize="xs" fontWeight="medium">
                    Exit
                  </MenuItemText>
                </MenuItem>
              </MenuContent>
            </MenuPositioner>
          </Portal>
        </MenuRoot>

        {/* Help Menu */}
        <MenuRoot size="sm" positioning={{ placement: "bottom-start", gutter: 4 }}>
          <MenuTrigger asChild>
            <Button
              size="xs"
              variant="ghost"
              color="gray.300"
              bg="transparent"
              px="2.5"
              h="24px"
              fontSize="xs"
              fontWeight="medium"
              borderRadius="sm"
              cursor="pointer"
              _hover={{ bg: "whiteAlpha.150", color: "white" }}
              _active={{ bg: "whiteAlpha.200", color: "white" }}
              _open={{ bg: "whiteAlpha.200", color: "white" }}
              _focus={{ outline: "none", boxShadow: "none" }}
              _focusVisible={{ outline: "none", boxShadow: "none", ring: "1px", ringColor: "blue.400" }}
            >
              Help
            </Button>
          </MenuTrigger>
          <Portal>
            <MenuPositioner>
              <MenuContent
                bg="gray.900"
                borderColor="gray.750"
                borderWidth="1px"
                color="gray.200"
                minW="200px"
                p="1.5"
                borderRadius="md"
                boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)"
                zIndex={200}
              >
                <MenuItem
                  value="about"
                  onClick={onOpenAbout}
                  cursor="pointer"
                  px="2.5"
                  py="1.5"
                  borderRadius="sm"
                  gap="2.5"
                  _hover={{ bg: "whiteAlpha.150", color: "white" }}
                  _highlighted={{ bg: "whiteAlpha.150", color: "white" }}
                >
                  <LuInfo size={15} color="#A0AEC0" />
                  <MenuItemText fontSize="xs" fontWeight="medium">
                    About gown-ted
                  </MenuItemText>
                </MenuItem>
              </MenuContent>
            </MenuPositioner>
          </Portal>
        </MenuRoot>
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
