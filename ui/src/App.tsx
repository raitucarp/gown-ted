import React from "react";
import { AppLayout } from "@templates/AppLayout";
import {
  useBackendStatus,
  usePanelLayout,
  useWordAnalysis,
  useDocumentStats,
  useEditorActions,
} from "@hooks";

export default function App() {
  const { isBackendReady } = useBackendStatus();
  const panelLayout = usePanelLayout();
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
    handleNewDocument,
  } = useEditorActions(
    activeWordContext,
    setActiveWordContext,
    () => setAnalysisResult(null)
  );

  return (
    <AppLayout
      isFocusMode={panelLayout.isFocusMode}
      onToggleFocusMode={panelLayout.toggleFocusMode}
      onNewDocument={handleNewDocument}
      onLoadSample={handleLoadSample}
      isBackendReady={isBackendReady}
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
      onDocumentChange={handleDocumentChange}
      onInspectWord={inspectWord}
      onReplaceWord={handleReplaceWord}
      onInsertWord={handleInsertWord}
      // Status
      stats={stats}
    />
  );
}
