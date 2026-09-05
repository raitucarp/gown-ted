import { useState } from "react";
import { LAYOUT } from "@constants/layout.constants";

export function usePanelLayout() {
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Left sidebar
  const [leftWidth, setLeftWidth] = useState(LAYOUT.LEFT.DEFAULT_WIDTH);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [leftSplitTopRatio, setLeftSplitTopRatio] = useState(50);
  const [isLeftTopCollapsed, setIsLeftTopCollapsed] = useState(false);
  const [isLeftBottomCollapsed, setIsLeftBottomCollapsed] = useState(false);

  // Right sidebar
  const [rightWidth, setRightWidth] = useState(LAYOUT.RIGHT.DEFAULT_WIDTH);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [rightRatioTop, setRightRatioTop] = useState(30);
  const [rightRatioMiddle, setRightRatioMiddle] = useState(35);
  const [isRightTopCollapsed, setIsRightTopCollapsed] = useState(false);
  const [isRightMiddleCollapsed, setIsRightMiddleCollapsed] = useState(false);
  const [isRightBottomCollapsed, setIsRightBottomCollapsed] = useState(false);

  // Bottom drawer
  const [bottomHeight, setBottomHeight] = useState(LAYOUT.BOTTOM.DEFAULT_HEIGHT);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  const handleResizeLeft = (delta: number) => {
    setLeftWidth((prev) => Math.max(LAYOUT.LEFT.MIN_WIDTH, Math.min(LAYOUT.LEFT.MAX_WIDTH, prev + delta)));
  };

  const handleResizeRight = (delta: number) => {
    setRightWidth((prev) => Math.max(LAYOUT.RIGHT.MIN_WIDTH, Math.min(LAYOUT.RIGHT.MAX_WIDTH, prev - delta)));
  };

  const handleResizeBottom = (delta: number) => {
    setBottomHeight((prev) => Math.max(LAYOUT.BOTTOM.MIN_HEIGHT, Math.min(LAYOUT.BOTTOM.MAX_HEIGHT, prev - delta)));
  };

  return {
    isFocusMode,
    setIsFocusMode,
    toggleFocusMode: () => setIsFocusMode((prev) => !prev),
    // Left
    leftWidth,
    isLeftCollapsed,
    setIsLeftCollapsed,
    toggleLeft: () => setIsLeftCollapsed((prev) => !prev),
    leftSplitTopRatio,
    setLeftSplitTopRatio,
    isLeftTopCollapsed,
    setIsLeftTopCollapsed,
    isLeftBottomCollapsed,
    setIsLeftBottomCollapsed,
    handleResizeLeft,
    // Right
    rightWidth,
    isRightCollapsed,
    setIsRightCollapsed,
    toggleRight: () => setIsRightCollapsed((prev) => !prev),
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
    // Bottom
    bottomHeight,
    isBottomCollapsed,
    setIsBottomCollapsed,
    toggleBottom: () => setIsBottomCollapsed((prev) => !prev),
    handleResizeBottom,
  };
}
