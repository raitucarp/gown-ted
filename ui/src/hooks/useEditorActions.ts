import { useRef } from "react";
import type { WordContext } from "@types";
import { SAMPLES } from "@constants/samples";

export function useEditorActions(
  activeWordContext: WordContext | null,
  setActiveWordContext: (ctx: WordContext | null) => void,
  clearAnalysis: () => void
) {
  const editorRef = useRef<any>(null);

  const handleReplaceWord = (replacement: string) => {
    if (!editorRef.current || !activeWordContext) return;
    const { from, to } = activeWordContext;
    editorRef.current
      .chain()
      .focus()
      .deleteRange({ from, to })
      .insertContent(replacement)
      .run();
  };

  const handleInsertWord = (insertion: string) => {
    if (!editorRef.current || !activeWordContext) return;
    const { to } = activeWordContext;
    editorRef.current
      .chain()
      .focus()
      .setTextSelection(to)
      .insertContent(" " + insertion)
      .run();
  };

  const handleLoadSample = (sampleKey: string) => {
    const content = SAMPLES[sampleKey as keyof typeof SAMPLES];
    if (content && editorRef.current) {
      editorRef.current.commands.setContent(content);
    }
  };

  const handleNewDocument = () => {
    if (editorRef.current) {
      editorRef.current.commands.setContent("<p></p>");
      setActiveWordContext(null);
      clearAnalysis();
    }
  };

  return {
    editorRef,
    handleReplaceWord,
    handleInsertWord,
    handleLoadSample,
    handleNewDocument,
  };
}
