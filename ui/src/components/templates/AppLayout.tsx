import React from "react";
import { Flex, HStack, Box } from "@chakra-ui/react";
import { AppToolbar } from "@components/layout/AppToolbar";
import { AppStatusBar } from "@components/layout/AppStatusBar";
import { EditorWorkspace } from "@components/editor/EditorWorkspace";
import { LeftSidebar } from "@organisms/layout/LeftSidebar";
import { RightSidebar } from "@organisms/layout/RightSidebar";
import { BottomDrawer } from "@organisms/layout/BottomDrawer";
import { SAMPLES } from "@constants/samples";
import type {
  LexicalAnalysisResult,
  WordContext,
  WordSenseItem,
  DocumentStats,
} from "@types";

interface AppLayoutProps {
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  onNewDocument: () => void;
  onLoadSample: (key: string) => void;
  isBackendReady: boolean;
  // Left sidebar
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
  handleResizeLeft: (delta: number) => void;
  // Right sidebar
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
  // Bottom drawer
  bottomHeight: number;
  isBottomCollapsed: boolean;
  onExpandBottom: () => void;
  onCollapseBottom: () => void;
  handleResizeBottom: (delta: number) => void;
  // Editor and analysis
  editorRef: React.MutableRefObject<any>;
  activeWordContext: WordContext | null;
  analysisResult: LexicalAnalysisResult | null;
  selectedSenseIdx: number;
  setSelectedSenseIdx: (idx: number) => void;
  analysisLoading: boolean;
  currentSense: WordSenseItem | null;
  onActiveWordChange: (ctx: WordContext | null) => void;
  onDocumentChange: (html: string, plainText: string) => void;
  onInspectWord: (word: string) => void;
  onReplaceWord: (replacement: string) => void;
  onInsertWord: (insertion: string) => void;
  // Status
  stats: DocumentStats;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  isFocusMode,
  onToggleFocusMode,
  onNewDocument,
  onLoadSample,
  isBackendReady,
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
  handleResizeLeft,
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
  bottomHeight,
  isBottomCollapsed,
  onExpandBottom,
  onCollapseBottom,
  handleResizeBottom,
  editorRef,
  activeWordContext,
  analysisResult,
  selectedSenseIdx,
  setSelectedSenseIdx,
  analysisLoading,
  currentSense,
  onActiveWordChange,
  onDocumentChange,
  onInspectWord,
  onReplaceWord,
  onInsertWord,
  stats,
}) => {
  return (
    <Flex direction="column" h="100vh" w="100vw" overflow="hidden" bg="gray.950" color="gray.100">
      <AppToolbar
        isFocusMode={isFocusMode}
        onToggleFocusMode={onToggleFocusMode}
        onNewDocument={onNewDocument}
        onLoadSample={onLoadSample}
        isBackendReady={isBackendReady}
        isLeftOpen={!isLeftCollapsed}
        onToggleLeft={() => (isLeftCollapsed ? onExpandLeft() : onCollapseLeft())}
        isRightOpen={!isRightCollapsed}
        onToggleRight={() => (isRightCollapsed ? onExpandRight() : onCollapseRight())}
        isBottomOpen={!isBottomCollapsed}
        onToggleBottom={() => (isBottomCollapsed ? onExpandBottom() : onCollapseBottom())}
      />

      <HStack flex="1" gap={0} alignItems="stretch" overflow="hidden">
        {!isFocusMode && (
          <LeftSidebar
            leftWidth={leftWidth}
            isLeftCollapsed={isLeftCollapsed}
            onExpandLeft={onExpandLeft}
            onCollapseLeft={onCollapseLeft}
            leftSplitTopRatio={leftSplitTopRatio}
            setLeftSplitTopRatio={setLeftSplitTopRatio}
            isLeftTopCollapsed={isLeftTopCollapsed}
            setIsLeftTopCollapsed={setIsLeftTopCollapsed}
            isLeftBottomCollapsed={isLeftBottomCollapsed}
            setIsLeftBottomCollapsed={setIsLeftBottomCollapsed}
            handleResizeLeft={handleResizeLeft}
            analysisResult={analysisResult}
            activeWordContext={activeWordContext}
            selectedSenseIdx={selectedSenseIdx}
            setSelectedSenseIdx={setSelectedSenseIdx}
            analysisLoading={analysisLoading}
            onInspectWord={onInspectWord}
            onReplaceWord={onReplaceWord}
          />
        )}

        <Flex flex="1" direction="column" h="100%" overflow="hidden">
          <Box flex="1" overflow="hidden">
            <EditorWorkspace
              initialContent={SAMPLES.polysemy}
              onActiveWordChange={onActiveWordChange}
              onDocumentChange={onDocumentChange}
              editorRef={editorRef}
            />
          </Box>

          {!isFocusMode && (
            <BottomDrawer
              bottomHeight={bottomHeight}
              isBottomCollapsed={isBottomCollapsed}
              onExpandBottom={onExpandBottom}
              onCollapseBottom={onCollapseBottom}
              handleResizeBottom={handleResizeBottom}
              analysisResult={analysisResult}
              activeWordContext={activeWordContext}
              currentSense={currentSense}
              onInspectWord={onInspectWord}
            />
          )}
        </Flex>

        {!isFocusMode && (
          <RightSidebar
            rightWidth={rightWidth}
            isRightCollapsed={isRightCollapsed}
            onExpandRight={onExpandRight}
            onCollapseRight={onCollapseRight}
            rightRatioTop={rightRatioTop}
            setRightRatioTop={setRightRatioTop}
            rightRatioMiddle={rightRatioMiddle}
            setRightRatioMiddle={setRightRatioMiddle}
            isRightTopCollapsed={isRightTopCollapsed}
            setIsRightTopCollapsed={setIsRightTopCollapsed}
            isRightMiddleCollapsed={isRightMiddleCollapsed}
            setIsRightMiddleCollapsed={setIsRightMiddleCollapsed}
            isRightBottomCollapsed={isRightBottomCollapsed}
            setIsRightBottomCollapsed={setIsRightBottomCollapsed}
            handleResizeRight={handleResizeRight}
            analysisResult={analysisResult}
            activeWordContext={activeWordContext}
            onInspectWord={onInspectWord}
            onReplaceWord={onReplaceWord}
            onInsertWord={onInsertWord}
          />
        )}
      </HStack>

      <AppStatusBar
        stats={stats}
        activeWord={activeWordContext?.word || ""}
        activeLemma={analysisResult?.primaryLemma || ""}
      />
    </Flex>
  );
};
