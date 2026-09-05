import type { SuggestionItem } from "@bindings/github.com/raitucarp/gown-ted/pkg/models/models";
import type { Editor } from "@tiptap/react";

export type { SuggestionItem };

export interface WordContext {
  word: string;
  sentence: string;
  from: number;
  to: number;
}

export interface EditorWorkspaceProps {
  initialContent?: string;
  onActiveWordChange: (ctx: WordContext | null) => void;
  onDocumentChange: (html: string, text: string) => void;
  onEditorReady?: (editor: Editor) => void;
  editorRef?: React.MutableRefObject<any>;
}

export interface SuggestionPopupProps {
  suggestions: SuggestionItem[];
  selectedIndex: number;
  position: { top: number; left: number } | null;
  activeQuery?: string;
  onSelect: (item: SuggestionItem) => void;
  onClose: () => void;
}
