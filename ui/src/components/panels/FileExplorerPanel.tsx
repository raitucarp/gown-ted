import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
  Button,
  Spinner,
} from "@chakra-ui/react";
import {
  LuFolder,
  LuFolderOpen,
  LuFileText,
  LuFileCode,
  LuRefreshCw,
  LuChevronDown,
  LuChevronUp,
  LuX,
} from "react-icons/lu";
import { PanelScrollArea } from "@components/ui/panel-scroll-area";
import { ListFiles } from "@bindings/github.com/raitucarp/gown-ted/service/fileservice.js";
import type { FileItem, DirectoryListing } from "@types";

interface FileExplorerPanelProps {
  onOpenFile: (filePath: string) => void;
  activeFilePath?: string;
  currentFolder: string | null;
  onOpenFolder: () => void;
  onCloseFolder?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const FileExplorerPanel: React.FC<FileExplorerPanelProps> = ({
  onOpenFile,
  activeFilePath,
  currentFolder,
  onOpenFolder,
  onCloseFolder,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [listing, setListing] = useState<DirectoryListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    if (!currentFolder) {
      setListing(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await ListFiles(currentFolder);
      setListing(res);
    } catch (err: any) {
      console.error("Error listing files:", err);
      setError(err?.message || "Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [currentFolder]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      bg="gray.950"
      borderBottomWidth="1px"
      borderColor="gray.800"
      overflow="hidden"
      flexShrink={0}
      transition="max-height 0.2s ease"
    >
      {/* Header */}
      <HStack
        px="3"
        py="2"
        bg="gray.900/60"
        borderBottomWidth={isCollapsed ? "0" : "1px"}
        borderColor="gray.800/80"
        justifyContent="space-between"
        cursor="pointer"
        onClick={onToggleCollapse}
        _hover={{ bg: "gray.900" }}
        userSelect="none"
      >
        <HStack gap="1.5" overflow="hidden">
          {isCollapsed ? (
            <LuFolder size={14} color="#63B3ED" />
          ) : (
            <LuFolderOpen size={14} color="#63B3ED" />
          )}
          <Text
            fontSize="xs"
            fontWeight="bold"
            color="gray.300"
            textTransform="uppercase"
            letterSpacing="0.05em"
            truncate
          >
            Explorer
          </Text>
          {listing?.dirName && (
            <Text fontSize="xs" color="gray.400" truncate maxW="120px">
              ({listing.dirName})
            </Text>
          )}
          {listing?.files?.length !== undefined && (
            <Badge size="xs" colorPalette="blue" variant="subtle" px="1.5">
              {listing.files.length}
            </Badge>
          )}
        </HStack>

        <HStack gap="1" onClick={(e) => e.stopPropagation()}>
          {currentFolder && (
            <>
              <IconButton
                size="xs"
                variant="ghost"
                color="gray.400"
                _hover={{ color: "white" }}
                onClick={fetchFiles}
                title="Refresh folder files"
                aria-label="Refresh folder files"
              >
                <LuRefreshCw size={13} className={loading ? "spin" : ""} />
              </IconButton>

              {onCloseFolder && (
                <IconButton
                  size="xs"
                  variant="ghost"
                  color="gray.400"
                  _hover={{ color: "red.300" }}
                  onClick={onCloseFolder}
                  title="Close current folder"
                  aria-label="Close current folder"
                >
                  <LuX size={13} />
                </IconButton>
              )}
            </>
          )}

          {onToggleCollapse && (
            <IconButton
              size="xs"
              variant="ghost"
              color="gray.400"
              _hover={{ color: "white" }}
              onClick={onToggleCollapse}
              title={isCollapsed ? "Expand Explorer" : "Collapse Explorer"}
              aria-label={isCollapsed ? "Expand Explorer" : "Collapse Explorer"}
            >
              {isCollapsed ? <LuChevronDown size={14} /> : <LuChevronUp size={14} />}
            </IconButton>
          )}
        </HStack>
      </HStack>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <Box maxH="220px" minH="80px" overflow="hidden" display="flex" flexDirection="column">
          {!currentFolder ? (
            /* Default empty state: No folder opened */
            <VStack py="4" px="3" gap="1.5" textAlign="center" justify="center" flex="1">
              <LuFolder size={22} color="#718096" />
              <Text fontSize="sm" color="gray.300" fontWeight="medium">
                No folder opened
              </Text>
              <Text fontSize="xs" color="gray.400" maxW="220px">
                Open a folder to browse .txt and .md files
              </Text>
              <Button
                size="xs"
                variant="subtle"
                colorPalette="blue"
                onClick={onOpenFolder}
                mt="1"
              >
                <LuFolderOpen size={13} />
                Open Folder
              </Button>
            </VStack>
          ) : loading && !listing ? (
            <HStack justify="center" py="4" gap="2">
              <Spinner size="xs" color="blue.400" />
              <Text fontSize="xs" color="gray.400">
                Scanning folder...
              </Text>
            </HStack>
          ) : error ? (
            <Box px="3" py="3">
              <Text fontSize="xs" color="red.400">
                {error}
              </Text>
            </Box>
          ) : !listing?.files || listing.files.length === 0 ? (
            <VStack py="4" px="3" gap="1.5" textAlign="center" justify="center" flex="1">
              <Text fontSize="xs" color="gray.400" fontStyle="italic">
                No .txt or .md files in this folder
              </Text>
              <Button
                size="xs"
                variant="ghost"
                color="blue.400"
                onClick={onOpenFolder}
              >
                Change Folder
              </Button>
            </VStack>
          ) : (
            <PanelScrollArea flex="1" p="1">
              <VStack align="stretch" gap="0.5">
                {listing.files.map((file: FileItem) => {
                  const isSelected = activeFilePath === file.path;
                  const isMd = file.extension === "md";

                  return (
                    <HStack
                      key={file.path}
                      px="2.5"
                      py="1.5"
                      borderRadius="md"
                      cursor="pointer"
                      bg={isSelected ? "blue.950/60" : "transparent"}
                      borderColor={isSelected ? "blue.800" : "transparent"}
                      borderWidth="1px"
                      _hover={{
                        bg: isSelected ? "blue.950/80" : "gray.900",
                      }}
                      onClick={() => onOpenFile(file.path)}
                      justifyContent="space-between"
                      transition="background 0.15s ease"
                    >
                      <HStack gap="2" overflow="hidden">
                        {isMd ? (
                          <LuFileCode size={14} color="#63B3ED" />
                        ) : (
                          <LuFileText size={14} color="#F6E05E" />
                        )}
                        <Text
                          fontSize="xs"
                          color={isSelected ? "blue.200" : "gray.300"}
                          fontWeight={isSelected ? "semibold" : "normal"}
                          truncate
                        >
                          {file.name}
                        </Text>
                      </HStack>

                      <HStack gap="1.5" flexShrink={0}>
                        <Text fontSize="xs" color="gray.400">
                          {formatFileSize(file.size)}
                        </Text>
                        <Badge
                          size="xs"
                          fontSize="xs"
                          px="1.5"
                          py="0.5"
                          colorPalette={isMd ? "blue" : "yellow"}
                          variant="surface"
                        >
                          .{file.extension}
                        </Badge>
                      </HStack>
                    </HStack>
                  );
                })}
              </VStack>
            </PanelScrollArea>
          )}
        </Box>
      )}
    </Box>
  );
};
