import React from "react";
import { Box, HStack, Text, Badge, IconButton } from "@chakra-ui/react";
import {
  LuPanelRightOpen,
  LuBookCopy,
  LuNetwork,
  LuMusic,
  LuChevronDown,
  LuChevronUp,
} from "react-icons/lu";
import { SynonymsPanel } from "@components/panels/SynonymsPanel";
import { ExtendedAnalysisPanel } from "@components/panels/ExtendedAnalysisPanel";
import { PoeticsPanel } from "@components/panels/PoeticsPanel";
import { ResizeHandle } from "@components/layout/ResizeHandle";
import { CollapsedSidebarStrip } from "@molecules/CollapsedSidebarStrip";
import type { LexicalAnalysisResult, WordContext } from "@types";

interface RightSidebarProps {
  rightWidth: number;
  isRightCollapsed: boolean;
  onExpandRight: () => void;
  onCollapseRight: () => void;
  rightRatioTop: number;
  setRightRatioTop: React.Dispatch<React.SetStateAction<number>>;
  rightRatioMiddle: number;
  setRightRatioMiddle: React.Dispatch<React.SetStateAction<number>>;
  isRightTopCollapsed: boolean;
  setIsRightTopCollapsed: (collapsed: boolean) => void;
  isRightMiddleCollapsed: boolean;
  setIsRightMiddleCollapsed: (collapsed: boolean) => void;
  isRightBottomCollapsed: boolean;
  setIsRightBottomCollapsed: (collapsed: boolean) => void;
  handleResizeRight: (delta: number) => void;
  analysisResult: LexicalAnalysisResult | null;
  activeWordContext: WordContext | null;
  onInspectWord: (word: string) => void;
  onReplaceWord: (replacement: string) => void;
  onInsertWord: (insertion: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  rightWidth,
  isRightCollapsed,
  onExpandRight,
  onCollapseRight,
  rightRatioTop,
  setRightRatioTop,
  rightRatioMiddle,
  setRightRatioMiddle,
  isRightTopCollapsed,
  setIsRightTopCollapsed,
  isRightMiddleCollapsed,
  setIsRightMiddleCollapsed,
  isRightBottomCollapsed,
  setIsRightBottomCollapsed,
  handleResizeRight,
  analysisResult,
  activeWordContext,
  onInspectWord,
  onReplaceWord,
  onInsertWord,
}) => {
  if (isRightCollapsed) {
    return (
      <CollapsedSidebarStrip
        side="right"
        expandIcon={<LuPanelRightOpen size={16} />}
        expandTitle="Expand Right Sidebar (Synonyms & Analysis)"
        onExpand={onExpandRight}
        label="Synonyms, Hierarchy & Poetics"
        items={[
          {
            icon: <LuBookCopy size={15} />,
            title: "Synonyms Explorer",
            color: "green.400",
            onClick: () => {
              onExpandRight();
              setIsRightTopCollapsed(false);
            },
          },
          {
            icon: <LuNetwork size={15} />,
            title: "Ontology & Hierarchy",
            color: "blue.400",
            onClick: () => {
              onExpandRight();
              setIsRightMiddleCollapsed(false);
            },
          },
          {
            icon: <LuMusic size={15} />,
            title: "Rhythm & Poetics",
            color: "yellow.400",
            onClick: () => {
              onExpandRight();
              setIsRightBottomCollapsed(false);
            },
          },
        ]}
      />
    );
  }

  return (
    <>
      <ResizeHandle
        direction="horizontal"
        onResize={handleResizeRight}
        onDoubleClick={onCollapseRight}
        title="Drag to resize right sidebar (Double-click to collapse)"
      />

      <Box
        w={`${rightWidth}px`}
        minW="260px"
        maxW="600px"
        h="100%"
        display="flex"
        flexDirection="column"
        overflow="hidden"
        flexShrink={0}
        borderLeftWidth="1px"
        borderColor="gray.800"
      >
        {/* 1. Right-Top Panel: Synonyms */}
        {isRightTopCollapsed ? (
          <HStack
            px="3"
            py="2"
            bg="gray.950"
            borderBottomWidth="1px"
            borderColor="gray.800"
            justifyContent="space-between"
            cursor="pointer"
            onClick={() => setIsRightTopCollapsed(false)}
            _hover={{ bg: "gray.900" }}
            flexShrink={0}
          >
            <HStack gap="1.5">
              <LuBookCopy color="#48BB78" size={14} />
              <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.05em">
                Synonyms
              </Text>
            </HStack>
            <IconButton
              size="xs"
              variant="ghost"
              color="gray.400"
              _hover={{ color: "white" }}
              onClick={(e) => {
                e.stopPropagation();
                setIsRightTopCollapsed(false);
              }}
              title="Expand Synonyms"
              aria-label="Expand Synonyms"
            >
              <LuChevronDown size={14} />
            </IconButton>
          </HStack>
        ) : (
          <Box
            h={
              isRightMiddleCollapsed && isRightBottomCollapsed
                ? "100%"
                : `${rightRatioTop}%`
            }
            flex={
              isRightMiddleCollapsed && isRightBottomCollapsed
                ? "1"
                : undefined
            }
            overflow="hidden"
          >
            <SynonymsPanel
              word={analysisResult?.word || activeWordContext?.word || ""}
              synonymGroups={analysisResult?.synonymGroups || []}
              onReplaceWord={onReplaceWord}
              onInsertWord={onInsertWord}
              onInspectWord={onInspectWord}
              onToggleCollapse={onCollapseRight}
              onToggleSubpanel={() => setIsRightTopCollapsed(true)}
            />
          </Box>
        )}

        {/* Vertical Splitter 1: Between Top and Middle */}
        {!isRightTopCollapsed && (!isRightMiddleCollapsed || !isRightBottomCollapsed) && (
          <ResizeHandle
            direction="vertical"
            onResize={(delta) =>
              setRightRatioTop((prev) => Math.max(15, Math.min(60, prev + delta * 0.25)))
            }
            title="Drag to adjust Synonyms / Hierarchy ratio"
          />
        )}

        {/* 2. Right-Middle Panel: Ontology & Hierarchy */}
        {isRightMiddleCollapsed ? (
          <HStack
            px="3"
            py="2"
            bg="gray.950"
            borderTopWidth="1px"
            borderBottomWidth="1px"
            borderColor="gray.800"
            justifyContent="space-between"
            cursor="pointer"
            onClick={() => setIsRightMiddleCollapsed(false)}
            _hover={{ bg: "gray.900" }}
            flexShrink={0}
          >
            <HStack gap="1.5">
              <LuNetwork color="#63B3ED" size={14} />
              <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.05em">
                Ontology Tree
              </Text>
            </HStack>
            <IconButton
              size="xs"
              variant="ghost"
              color="gray.400"
              _hover={{ color: "white" }}
              onClick={(e) => {
                e.stopPropagation();
                setIsRightMiddleCollapsed(false);
              }}
              title="Expand Ontology Tree"
              aria-label="Expand Ontology Tree"
            >
              <LuChevronDown size={14} />
            </IconButton>
          </HStack>
        ) : (
          <Box
            h={
              !isRightBottomCollapsed
                ? `${rightRatioMiddle}%`
                : undefined
            }
            flex={
              isRightTopCollapsed && isRightBottomCollapsed
                ? "1"
                : isRightBottomCollapsed
                ? "1"
                : undefined
            }
            overflow="hidden"
          >
            <ExtendedAnalysisPanel
              word={analysisResult?.word || activeWordContext?.word || ""}
              hierarchyTree={analysisResult?.hierarchyTree || ""}
              expansionTree={analysisResult?.expansionTree || null}
              onInspectWord={onInspectWord}
              onReplaceWord={onReplaceWord}
              onToggleCollapse={() => setIsRightMiddleCollapsed(true)}
            />
          </Box>
        )}

        {/* Vertical Splitter 2: Between Middle and Bottom */}
        {!isRightMiddleCollapsed && !isRightBottomCollapsed && (
          <ResizeHandle
            direction="vertical"
            onResize={(delta) =>
              setRightRatioMiddle((prev) => Math.max(15, Math.min(60, prev + delta * 0.25)))
            }
            title="Drag to adjust Hierarchy / Poetics ratio"
          />
        )}

        {/* 3. Right-Bottom Panel: Rhythm & Poetics */}
        {isRightBottomCollapsed ? (
          <HStack
            px="3"
            py="2"
            bg="gray.950"
            borderTopWidth="1px"
            borderColor="gray.800"
            justifyContent="space-between"
            cursor="pointer"
            onClick={() => setIsRightBottomCollapsed(false)}
            _hover={{ bg: "gray.900" }}
            flexShrink={0}
          >
            <HStack gap="1.5">
              <LuMusic color="#F6E05E" size={14} />
              <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.05em">
                Rhythm & Poetics
              </Text>
            </HStack>
            <IconButton
              size="xs"
              variant="ghost"
              color="gray.400"
              _hover={{ color: "white" }}
              onClick={(e) => {
                e.stopPropagation();
                setIsRightBottomCollapsed(false);
              }}
              title="Expand Rhythm & Poetics"
              aria-label="Expand Rhythm & Poetics"
            >
              <LuChevronUp size={14} />
            </IconButton>
          </HStack>
        ) : (
          <Box
            flex="1"
            h={
              isRightTopCollapsed && isRightMiddleCollapsed
                ? "100%"
                : undefined
            }
            overflow="hidden"
          >
            <PoeticsPanel
              word={analysisResult?.word || activeWordContext?.word || ""}
              phonology={analysisResult?.phonology || null}
              poetics={analysisResult?.poetics || null}
              onInspectWord={onInspectWord}
              onReplaceWord={onReplaceWord}
              onInsertWord={onInsertWord}
              onToggleCollapse={() => setIsRightBottomCollapsed(true)}
            />
          </Box>
        )}
      </Box>
    </>
  );
};
