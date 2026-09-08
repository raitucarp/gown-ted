import type { DocumentStats } from "./stats.types";

export interface AppToolbarProps {
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  onLoadSample?: (sampleKey: string) => void;
  isBackendReady: boolean;
  isLeftOpen?: boolean;
  onToggleLeft?: () => void;
  isRightOpen?: boolean;
  onToggleRight?: () => void;
  isBottomOpen?: boolean;
  onToggleBottom?: () => void;
  // File menu actions
  onOpenFile: () => void;
  onOpenFolder: () => void;
  recentFiles: string[];
  recentFolders: string[];
  onSelectRecentFile: (path: string) => void;
  onSelectRecentFolder: (path: string) => void;
  onClearRecentFiles: () => void;
  onClearRecentFolders: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  // Help menu
  onOpenAbout: () => void;
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
