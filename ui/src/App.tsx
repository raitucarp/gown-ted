import React, { useState, useEffect } from "react";
import { AppLayout } from "@templates/AppLayout";
import {
  useBackendStatus,
  usePanelLayout,
  useWordAnalysis,
  useDocumentStats,
  useEditorActions,
  useTabManager,
  useRecentItems,
} from "@hooks";

export default function App() {
  const { isBackendReady } = useBackendStatus();
  const panelLayout = usePanelLayout();
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const {
    activeWordContext,
    setActiveWordContext,
    analysisResult,
    setAnalysisResult,
    selectedSenseIdx,
    setSelectedSenseIdx,
    analysisLoading,
    currentSense,
    inspectWord,
  } = useWordAnalysis();

  const { stats, handleDocumentChange } = useDocumentStats();

  const {
    editorRef,
    handleReplaceWord,
    handleInsertWord,
    handleLoadSample,
  } = useEditorActions(
    activeWordContext,
    setActiveWordContext,
    () => setAnalysisResult(null)
  );

  const {
    recentFiles,
    recentFolders,
    addRecentFile,
    addRecentFolder,
    clearRecentFiles,
    clearRecentFolders,
  } = useRecentItems();

  const {
    tabs,
    activeTabId,
    isPlainMode,
    activeFilePath,
    currentExploredFolder,
    setCurrentExploredFolder,
    switchTab,
    openFile,
    openFileDialog,
    openFolderDialog,
    saveCurrentTab,
    saveCurrentTabAs,
    newTab,
    closeTab,
    updateActiveTabContent,
  } = useTabManager(editorRef, () => {
    setActiveWordContext(null);
    setAnalysisResult(null);
  });

  const handleDocChange = (html: string, plainText: string) => {
    handleDocumentChange(html, plainText);
    updateActiveTabContent(html);
  };

  const handleSampleSelect = (sampleKey: string) => {
    handleLoadSample(sampleKey);
    if (editorRef.current) {
      updateActiveTabContent(editorRef.current.getHTML());
    }
  };

  const handleOpenFileFromExplorer = (filePath: string) => {
    openFile(filePath);
    addRecentFile(filePath);
  };

  const handleOpenFileDialog = () => {
    openFileDialog((path) => {
      addRecentFile(path);
    });
  };

  const handleOpenFolderDialog = () => {
    openFolderDialog((folder) => {
      addRecentFolder(folder);
    });
  };

  const handleSelectRecentFile = (filePath: string) => {
    openFile(filePath);
    addRecentFile(filePath);
  };

  const handleSelectRecentFolder = (folderPath: string) => {
    setCurrentExploredFolder(folderPath);
    addRecentFolder(folderPath);
  };

  const handleCloseFolder = () => {
    setCurrentExploredFolder(null);
  };

  const handleSave = () => {
    saveCurrentTab((savedPath) => {
      addRecentFile(savedPath);
    });
  };

  const handleSaveAs = () => {
    saveCurrentTabAs((savedPath) => {
      addRecentFile(savedPath);
    });
  };

  // Global keyboard shortcuts (Ctrl+S, Ctrl+Shift+S, Ctrl+O)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (e.shiftKey) {
          handleSaveAs();
        } else {
          handleSave();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "o") {
        e.preventDefault();
        handleOpenFileDialog();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handleSaveAs, handleOpenFileDialog]);

  return (
    <AppLayout
      isFocusMode={panelLayout.isFocusMode}
      onToggleFocusMode={panelLayout.toggleFocusMode}
      onLoadSample={handleSampleSelect}
      isBackendReady={isBackendReady}
      // Tabs & File Explorer
      tabs={tabs}
      activeTabId={activeTabId}
      onSelectTab={switchTab}
      onCloseTab={closeTab}
      onNewTab={newTab}
      onOpenFileFromExplorer={handleOpenFileFromExplorer}
      activeFilePath={activeFilePath}
      currentFolder={currentExploredFolder}
      onOpenFolder={handleOpenFolderDialog}
      onCloseFolder={handleCloseFolder}
      isPlainMode={isPlainMode}
      // Toolbar File & Help actions
      onOpenFile={handleOpenFileDialog}
      recentFiles={recentFiles}
      recentFolders={recentFolders}
      onSelectRecentFile={handleSelectRecentFile}
      onSelectRecentFolder={handleSelectRecentFolder}
      onClearRecentFiles={clearRecentFiles}
      onClearRecentFolders={clearRecentFolders}
      onSave={handleSave}
      onSaveAs={handleSaveAs}
      isAboutOpen={isAboutOpen}
      onOpenAbout={() => setIsAboutOpen(true)}
      onCloseAbout={() => setIsAboutOpen(false)}
      // Left sidebar
      leftWidth={panelLayout.leftWidth}
      isLeftCollapsed={panelLayout.isLeftCollapsed}
      onExpandLeft={() => panelLayout.setIsLeftCollapsed(false)}
      onCollapseLeft={() => panelLayout.setIsLeftCollapsed(true)}
      leftSplitTopRatio={panelLayout.leftSplitTopRatio}
      setLeftSplitTopRatio={panelLayout.setLeftSplitTopRatio}
      isLeftTopCollapsed={panelLayout.isLeftTopCollapsed}
      setIsLeftTopCollapsed={panelLayout.setIsLeftTopCollapsed}
      isLeftBottomCollapsed={panelLayout.isLeftBottomCollapsed}
      setIsLeftBottomCollapsed={panelLayout.setIsLeftBottomCollapsed}
      handleResizeLeft={panelLayout.handleResizeLeft}
      // Right sidebar
      rightWidth={panelLayout.rightWidth}
      isRightCollapsed={panelLayout.isRightCollapsed}
      onExpandRight={() => panelLayout.setIsRightCollapsed(false)}
      onCollapseRight={() => panelLayout.setIsRightCollapsed(true)}
      rightRatioTop={panelLayout.rightRatioTop}
      setRightRatioTop={panelLayout.setRightRatioTop}
      rightRatioMiddle={panelLayout.rightRatioMiddle}
      setRightRatioMiddle={panelLayout.setRightRatioMiddle}
      isRightTopCollapsed={panelLayout.isRightTopCollapsed}
      setIsRightTopCollapsed={panelLayout.setIsRightTopCollapsed}
      isRightMiddleCollapsed={panelLayout.isRightMiddleCollapsed}
      setIsRightMiddleCollapsed={panelLayout.setIsRightMiddleCollapsed}
      isRightBottomCollapsed={panelLayout.isRightBottomCollapsed}
      setIsRightBottomCollapsed={panelLayout.setIsRightBottomCollapsed}
      handleResizeRight={panelLayout.handleResizeRight}
      // Bottom drawer
      bottomHeight={panelLayout.bottomHeight}
      isBottomCollapsed={panelLayout.isBottomCollapsed}
      onExpandBottom={() => panelLayout.setIsBottomCollapsed(false)}
      onCollapseBottom={() => panelLayout.setIsBottomCollapsed(true)}
      handleResizeBottom={panelLayout.handleResizeBottom}
      // Editor & Analysis
      editorRef={editorRef}
      activeWordContext={activeWordContext}
      analysisResult={analysisResult}
      selectedSenseIdx={selectedSenseIdx}
      setSelectedSenseIdx={setSelectedSenseIdx}
      analysisLoading={analysisLoading}
      currentSense={currentSense}
      onActiveWordChange={setActiveWordContext}
      onDocumentChange={handleDocChange}
      onInspectWord={inspectWord}
      onReplaceWord={handleReplaceWord}
      onInsertWord={handleInsertWord}
      // Status
      stats={stats}
    />
  );
}
