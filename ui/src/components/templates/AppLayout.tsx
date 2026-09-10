import React from "react";
import { Flex, HStack, Box } from "@chakra-ui/react";
import { AppToolbar } from "@components/layout/AppToolbar";
import { AppStatusBar } from "@components/layout/AppStatusBar";
import { EditorTabBar } from "@components/layout/EditorTabBar";
import { ActivityBar, type ActiveView } from "@components/layout/ActivityBar";
import { EditorWorkspace } from "@components/editor/EditorWorkspace";
import { LeftSidebar } from "@organisms/layout/LeftSidebar";
import { RightSidebar } from "@organisms/layout/RightSidebar";
import { BottomDrawer } from "@organisms/layout/BottomDrawer";
import { AboutModal } from "@components/dialogs/AboutModal";
import { WordNetExplorerView } from "@components/views/WordNetExplorerView";
import { GraphExplorerView } from "@components/views/GraphExplorerView";
import type {
  LexicalAnalysisResult,
  WordContext,
  WordSenseItem,
  DocumentStats,
  EditorTab,
} from "@types";

interface AppLayoutProps {
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
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
  // Tabs & File Explorer
  tabs: EditorTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onNewTab: () => void;
  onOpenFileFromExplorer: (filePath: string) => void;
  activeFilePath?: string;
  currentFolder: string | null;
  onOpenFolder: () => void;
  onCloseFolder?: () => void;
  isPlainMode?: boolean;
  // Toolbar File & Help actions
  onOpenFile: () => void;
  recentFiles: string[];
  recentFolders: string[];
  onSelectRecentFile: (path: string) => void;
  onSelectRecentFolder: (path: string) => void;
  onClearRecentFiles: () => void;
  onClearRecentFolders: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  // About dialog
  isAboutOpen: boolean;
  onOpenAbout: () => void;
  onCloseAbout: () => void;
  // Status
  stats: DocumentStats;
  // Activity Bar & Views
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
  documentPlainText: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  isFocusMode,
  activeView,
  onChangeView,
  documentPlainText,
  onToggleFocusMode,
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
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onOpenFileFromExplorer,
  activeFilePath,
  currentFolder,
  onOpenFolder,
  onCloseFolder,
  isPlainMode = false,
  onOpenFile,
  recentFiles,
  recentFolders,
  onSelectRecentFile,
  onSelectRecentFolder,
  onClearRecentFiles,
  onClearRecentFolders,
  onSave,
  onSaveAs,
  isAboutOpen,
  onOpenAbout,
  onCloseAbout,
  stats,
}) => {
  const activeTab = tabs?.find((t) => t.id === activeTabId) || tabs?.[0];

  return (
    <Flex direction="column" h="100vh" w="100vw" overflow="hidden" bg="gray.950" color="gray.100">
      <AppToolbar
        isFocusMode={isFocusMode}
        onToggleFocusMode={onToggleFocusMode}
        onLoadSample={onLoadSample}
        isBackendReady={isBackendReady}
        isLeftOpen={!isLeftCollapsed}
        onToggleLeft={() => (isLeftCollapsed ? onExpandLeft() : onCollapseLeft())}
        isRightOpen={!isRightCollapsed}
        onToggleRight={() => (isRightCollapsed ? onExpandRight() : onCollapseRight())}
        isBottomOpen={!isBottomCollapsed}
        onToggleBottom={() => (isBottomCollapsed ? onExpandBottom() : onCollapseBottom())}
        onOpenFile={onOpenFile}
        onOpenFolder={onOpenFolder}
        recentFiles={recentFiles}
        recentFolders={recentFolders}
        onSelectRecentFile={onSelectRecentFile}
        onSelectRecentFolder={onSelectRecentFolder}
        onClearRecentFiles={onClearRecentFiles}
        onClearRecentFolders={onClearRecentFolders}
        onSave={onSave}
        onSaveAs={onSaveAs}
        onOpenAbout={onOpenAbout}
      />

      <HStack flex="1" gap={0} alignItems="stretch" overflow="hidden">
        {!isFocusMode && (
          <ActivityBar
            activeView={activeView}
            onChangeView={onChangeView}
            onToggleLeft={() => (isLeftCollapsed ? onExpandLeft() : onCollapseLeft())}
            onOpenAbout={onOpenAbout}
          />
        )}

        {/* 1. EDITOR VIEW (Persisted in DOM: hidden via display: none to prevent state loss when switching views) */}
        <Flex
          flex="1"
          direction="row"
          h="100%"
          overflow="hidden"
          alignItems="stretch"
          display={activeView === "editor" ? "flex" : "none"}
        >
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
              onOpenFile={onOpenFileFromExplorer}
              activeFilePath={activeFilePath}
              currentFolder={currentFolder}
              onOpenFolder={onOpenFolder}
              onCloseFolder={onCloseFolder}
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
            <EditorTabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onSelectTab={onSelectTab}
              onCloseTab={onCloseTab}
              onNewTab={onNewTab}
            />

            <Box flex="1" overflow="hidden">
              <EditorWorkspace
                initialContent={activeTab?.content || ""}
                isPlainMode={isPlainMode}
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
        </Flex>

        {/* 2. WORDNET LEXICAL EXPLORER VIEW */}
        {activeView === "wordnet" && (
          <WordNetExplorerView onInsertWord={onInsertWord} />
        )}

        {/* 3. DOCUMENT WORD GRAPH EXPLORER VIEW */}
        {activeView === "graph" && (
          <GraphExplorerView
            documentText={documentPlainText}
            onInspectWord={onInspectWord}
          />
        )}
      </HStack>

      <AppStatusBar
        stats={stats}
        activeWord={activeWordContext?.word || ""}
        activeLemma={analysisResult?.primaryLemma || ""}
      />

      <AboutModal isOpen={isAboutOpen} onClose={onCloseAbout} />
    </Flex>
  );
};
