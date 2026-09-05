import React from "react";
import { Box, HStack, Text, Badge } from "@chakra-ui/react";
import { LuChevronUp } from "react-icons/lu";
import { DefinitionPanel } from "@components/panels/DefinitionPanel";
import { ResizeHandle } from "@components/layout/ResizeHandle";
import type { LexicalAnalysisResult, WordContext, WordSenseItem } from "@types";

interface BottomDrawerProps {
  bottomHeight: number;
  isBottomCollapsed: boolean;
  onExpandBottom: () => void;
  onCollapseBottom: () => void;
  handleResizeBottom: (delta: number) => void;
  analysisResult: LexicalAnalysisResult | null;
  activeWordContext: WordContext | null;
  currentSense: WordSenseItem | null;
  onInspectWord: (word: string) => void;
}

export const BottomDrawer: React.FC<BottomDrawerProps> = ({
  bottomHeight,
  isBottomCollapsed,
  onExpandBottom,
  onCollapseBottom,
  handleResizeBottom,
  analysisResult,
  activeWordContext,
  currentSense,
  onInspectWord,
}) => {
  if (isBottomCollapsed) {
    return (
      <HStack
        px="3"
        py="1"
        bg="gray.925"
        borderTopWidth="1px"
        borderColor="gray.800"
        justifyContent="space-between"
        cursor="pointer"
        onClick={onExpandBottom}
        _hover={{ bg: "gray.850" }}
        transition="background 0.15s ease"
      >
        <HStack gap="2">
          <LuChevronUp size={14} color="#63B3ED" />
          <Text fontSize="xs" color="gray.400" fontWeight="medium">
            Definition & Examples Explorer {activeWordContext?.word ? `("${activeWordContext.word}")` : ""}
          </Text>
        </HStack>
        <Badge size="xs" variant="surface" colorPalette="blue">
          Expand Panel
        </Badge>
      </HStack>
    );
  }

  return (
    <>
      <ResizeHandle
        direction="vertical"
        onResize={handleResizeBottom}
        onDoubleClick={onCollapseBottom}
        title="Drag to resize definition panel (Double-click to collapse)"
      />
      <Box
        h={`${bottomHeight}px`}
        minH="140px"
        maxH="460px"
        overflow="hidden"
        borderTopWidth="1px"
        borderColor="gray.800"
      >
        <DefinitionPanel
          word={analysisResult?.word || activeWordContext?.word || ""}
          activeSense={currentSense}
          sentenceContext={activeWordContext?.sentence || ""}
          totalSenses={analysisResult?.senses?.length || 0}
          functional={analysisResult?.functional || null}
          pragmatics={analysisResult?.pragmatics || null}
          discourse={analysisResult?.discourse || null}
          onInspectWord={onInspectWord}
          onToggleCollapse={onCollapseBottom}
        />
      </Box>
    </>
  );
};
