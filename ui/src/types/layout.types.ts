import type { DocumentStats } from "./stats.types";

export interface AppToolbarProps {
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  onNewDocument: () => void;
  onLoadSample: (sampleKey: string) => void;
  isBackendReady: boolean;
  isLeftOpen: boolean;
  onToggleLeft: () => void;
  isRightOpen: boolean;
  onToggleRight: () => void;
  isBottomOpen: boolean;
  onToggleBottom: () => void;
}

export interface AppStatusBarProps {
  stats: DocumentStats;
  isReady: boolean;
  activeWord?: string;
}

export interface ResizeHandleProps {
  orientation?: "horizontal" | "vertical";
  onResize: (delta: number) => void;
}
