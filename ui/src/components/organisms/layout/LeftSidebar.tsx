import React, { useState } from "react";
import { Box, HStack, Text, Badge, IconButton } from "@chakra-ui/react";
import {
  LuPanelLeftOpen,
  LuLayers,
  LuGitBranch,
  LuChevronDown,
  LuChevronUp,
  LuFolder,
} from "react-icons/lu";
import { FileExplorerPanel } from "@components/panels/FileExplorerPanel";
import { WordSensesPanel } from "@components/panels/WordSensesPanel";
import { RelationshipsPanel } from "@components/panels/RelationshipsPanel";
import { ResizeHandle } from "@components/layout/ResizeHandle";
import { CollapsedSidebarStrip } from "@molecules/CollapsedSidebarStrip";
import type { LexicalAnalysisResult, WordContext } from "@types";

interface LeftSidebarProps {
  leftWidth: number;
  isLeftCollapsed: boolean;
  onExpandLeft: () => void;
  onCollapseLeft: () => void;
  leftSplitTopRatio: number;
  setLeftSplitTopRatio: React.Dispatch<React.SetStateAction<number>>;
  isLeftTopCollapsed: boolean;
  setIsLeftTopCollapsed: (collapsed: boolean) => void;
  isLeftBottomCollapsed: boolean;
  setIsLeftBottomCollapsed: (collapsed: boolean) => void;
  isFileExplorerCollapsed?: boolean;
  setIsFileExplorerCollapsed?: (collapsed: boolean) => void;
  onOpenFile: (filePath: string) => void;
  activeFilePath?: string;
  currentFolder: string | null;
  onOpenFolder: () => void;
  onCloseFolder?: () => void;
  handleResizeLeft: (delta: number) => void;
  analysisResult: LexicalAnalysisResult | null;
  activeWordContext: WordContext | null;
  selectedSenseIdx: number;
  setSelectedSenseIdx: (idx: number) => void;
  analysisLoading: boolean;
  onInspectWord: (word: string) => void;
  onReplaceWord: (replacement: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  leftWidth,
  isLeftCollapsed,
  onExpandLeft,
  onCollapseLeft,
  leftSplitTopRatio,
  setLeftSplitTopRatio,
  isLeftTopCollapsed,
  setIsLeftTopCollapsed,
  isLeftBottomCollapsed,
  setIsLeftBottomCollapsed,
  isFileExplorerCollapsed: propIsFileExplorerCollapsed,
  setIsFileExplorerCollapsed: propSetIsFileExplorerCollapsed,
  onOpenFile,
  activeFilePath,
  currentFolder,
  onOpenFolder,
  onCloseFolder,
  handleResizeLeft,
  analysisResult,
  activeWordContext,
  selectedSenseIdx,
  setSelectedSenseIdx,
  analysisLoading,
  onInspectWord,
  onReplaceWord,
}) => {
  const [internalExplorerCollapsed, setInternalExplorerCollapsed] = useState(false);
  const isExplorerCollapsed =
    propIsFileExplorerCollapsed !== undefined
      ? propIsFileExplorerCollapsed
      : internalExplorerCollapsed;
  const toggleExplorerCollapsed = () => {
    if (propSetIsFileExplorerCollapsed) {
      propSetIsFileExplorerCollapsed(!isExplorerCollapsed);
    } else {
      setInternalExplorerCollapsed(!isExplorerCollapsed);
    }
  };

  if (isLeftCollapsed) {
    return (
      <CollapsedSidebarStrip
        side="left"
        expandIcon={<LuPanelLeftOpen size={16} />}
        expandTitle="Expand Left Sidebar (Files, Senses & Morphology)"
        onExpand={onExpandLeft}
        label="Files & Senses"
        items={[
          {
            icon: <LuFolder size={15} />,
            title: "File Explorer (.txt & .md)",
            color: "blue.300",
          },
          {
            icon: <LuLayers size={15} />,
            title: "Word Senses & Polysemy",
            color: "blue.400",
          },
          {
            icon: <LuGitBranch size={15} />,
            title: "Morphology & Relations",
            color: "teal.400",
          },
        ]}
      />
    );
  }

  return (
    <>
      <Box
        w={`${leftWidth}px`}
        minW="220px"
        maxW="540px"
        h="100%"
        display="flex"
        flexDirection="column"
        overflow="hidden"
        flexShrink={0}
        borderRightWidth="1px"
        borderColor="gray.800"
      >
        {/* Top: File Explorer Panel */}
        <FileExplorerPanel
          onOpenFile={onOpenFile}
          activeFilePath={activeFilePath}
          currentFolder={currentFolder}
          onOpenFolder={onOpenFolder}
          onCloseFolder={onCloseFolder}
          isCollapsed={isExplorerCollapsed}
          onToggleCollapse={toggleExplorerCollapsed}
        />

        {/* Left-Top Panel: Word Senses */}
        {isLeftTopCollapsed ? (
          <HStack
            px="3"
            py="2"
            bg="gray.950"
            borderBottomWidth="1px"
            borderColor="gray.800"
            justifyContent="space-between"
            cursor="pointer"
            onClick={() => setIsLeftTopCollapsed(false)}
            _hover={{ bg: "gray.900" }}
            flexShrink={0}
          >
            <HStack gap="1.5">
              <LuLayers color="#63B3ED" size={14} />
              <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.05em">
                Word Senses
              </Text>
              {analysisResult?.senses?.length ? (
                <Badge size="xs" colorPalette="purple" variant="surface">
                  {analysisResult.senses.length}
                </Badge>
              ) : null}
            </HStack>
            <IconButton
              size="xs"
              variant="ghost"
              color="gray.400"
              _hover={{ color: "white" }}
              onClick={(e) => {
                e.stopPropagation();
                setIsLeftTopCollapsed(false);
              }}
              title="Expand Word Senses"
              aria-label="Expand Word Senses"
            >
              <LuChevronDown size={14} />
            </IconButton>
          </HStack>
        ) : (
          <Box
            h={isLeftBottomCollapsed ? "100%" : `${leftSplitTopRatio}%`}
            flex={isLeftBottomCollapsed ? "1" : undefined}
            overflow="hidden"
          >
            <WordSensesPanel
              word={analysisResult?.word || activeWordContext?.word || ""}
              senses={analysisResult?.senses || []}
              selectedSenseIndex={selectedSenseIdx}
              recommendedSenseIndex={analysisResult?.recommendedSenseIndex || 0}
              wsdConfidence={analysisResult?.wsdConfidence || 0}
              entropy={analysisResult?.polysemy?.entropy || 0}
              totalSenses={analysisResult?.polysemy?.totalSenses || 0}
              onSelectSense={(idx) => setSelectedSenseIdx(idx)}
              loading={analysisLoading}
              onToggleCollapse={onCollapseLeft}
              onToggleSubpanel={() => setIsLeftTopCollapsed(true)}
            />
          </Box>
        )}

        {/* Vertical Splitter inside Left Sidebar */}
        {!isLeftTopCollapsed && !isLeftBottomCollapsed && (
          <ResizeHandle
            direction="vertical"
            onResize={(delta) => setLeftSplitTopRatio((prev) => Math.max(20, Math.min(80, prev + delta * 0.25)))}
            title="Drag to adjust Senses / Morphology ratio"
          />
        )}

        {/* Left-Bottom Panel: Morphology & Relationships */}
        {isLeftBottomCollapsed ? (
          <HStack
            px="3"
            py="2"
            bg="gray.950"
            borderTopWidth="1px"
            borderColor="gray.800"
            justifyContent="space-between"
            cursor="pointer"
            onClick={() => setIsLeftBottomCollapsed(false)}
            _hover={{ bg: "gray.900" }}
            flexShrink={0}
          >
            <HStack gap="1.5">
              <LuGitBranch color="#4FD1C5" size={14} />
              <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.05em">
                Morphology & Relations
              </Text>
            </HStack>
            <IconButton
              size="xs"
              variant="ghost"
              color="gray.400"
              _hover={{ color: "white" }}
              onClick={(e) => {
                e.stopPropagation();
                setIsLeftBottomCollapsed(false);
              }}
              title="Expand Morphology & Relations"
              aria-label="Expand Morphology & Relations"
            >
              <LuChevronUp size={14} />
            </IconButton>
          </HStack>
        ) : (
          <Box
            flex="1"
            h={isLeftTopCollapsed ? "100%" : undefined}
            overflow="hidden"
          >
            <RelationshipsPanel
              originalWord={analysisResult?.word || activeWordContext?.word || ""}
              lemmas={analysisResult?.morphology?.lemmas || []}
              posList={analysisResult?.morphology?.posList || []}
              hypernyms={analysisResult?.hypernyms || []}
              hyponyms={analysisResult?.hyponyms || []}
              meronyms={analysisResult?.meronyms || []}
              antonyms={analysisResult?.antonyms || []}
              onInspectWord={onInspectWord}
              onReplaceWord={onReplaceWord}
              onToggleCollapse={() => setIsLeftBottomCollapsed(true)}
            />
          </Box>
        )}
      </Box>

      {/* Left Sidebar Horizontal Resize Handle */}
      <ResizeHandle
        direction="horizontal"
        onResize={handleResizeLeft}
        onDoubleClick={onCollapseLeft}
        title="Drag to resize left sidebar (Double-click to collapse)"
      />
    </>
  );
};
