import React, { useEffect, useRef, useState, useCallback } from "react";
import { Box } from "@chakra-ui/react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { SuggestionPopup } from "./SuggestionPopup";
import { GetSuggestions } from "@bindings/github.com/raitucarp/gown-ted/service/lexicalservice.js";
import type { WordContext, EditorWorkspaceProps, SuggestionItem } from "@types";



export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
  initialContent = "",
  isPlainMode = false,
  onActiveWordChange,
  onDocumentChange,
  editorRef,
}) => {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [selectedSugIndex, setSelectedSugIndex] = useState(0);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const [currentPrefixRange, setCurrentPrefixRange] = useState<{ from: number; to: number } | null>(null);
  const [currentQuery, setCurrentQuery] = useState("");

  const suggestionsRef = useRef<SuggestionItem[]>([]);
  suggestionsRef.current = suggestions;

  const selectedSugIndexRef = useRef<number>(0);
  selectedSugIndexRef.current = selectedSugIndex;

  const currentPrefixRangeRef = useRef<{ from: number; to: number } | null>(null);
  currentPrefixRangeRef.current = currentPrefixRange;

  const currentQueryRef = useRef<string>("");
  currentQueryRef.current = currentQuery;

  const dismissedKeyRef = useRef<string>("");

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const extractWordAndSentence = useCallback(
    (view: any) => {
      const { state } = view;
      const { selection } = state;
      const { from, to, empty } = selection;

      let targetWord = "";
      let wordFrom = from;
      let wordTo = to;

      if (!empty) {
        targetWord = state.doc.textBetween(from, to, " ").trim();
      } else {
        // Resolve word boundaries around cursor
        const $pos = state.selection.$from;
        const start = $pos.start();
        const parentText = $pos.parent.textContent;
        const offset = from - start;

        if (parentText && offset >= 0 && offset <= parentText.length) {
          let left = offset;
          let right = offset;

          while (left > 0 && /\w/.test(parentText[left - 1])) {
            left--;
          }
          while (right < parentText.length && /\w/.test(parentText[right])) {
            right++;
          }

          if (left < right) {
            targetWord = parentText.slice(left, right);
            wordFrom = start + left;
            wordTo = start + right;
          }
        }
      }

      // Extract surrounding sentence
      let sentence = "";
      if (targetWord) {
        const fullDoc = state.doc.textBetween(0, state.doc.content.size, "\n");
        const matchIdx = fullDoc.indexOf(targetWord, Math.max(0, wordFrom - 50));
        if (matchIdx !== -1) {
          let sStart = matchIdx;
          let sEnd = matchIdx + targetWord.length;
          while (sStart > 0 && !/[.!?\n]/.test(fullDoc[sStart - 1])) {
            sStart--;
          }
          while (sEnd < fullDoc.length && !/[.!?\n]/.test(fullDoc[sEnd])) {
            sEnd++;
          }
          sentence = fullDoc.slice(sStart, sEnd).trim();
        }
        if (!sentence) {
          sentence = targetWord;
        }

        onActiveWordChange({
          word: targetWord,
          sentence,
          from: wordFrom,
          to: wordTo,
        });
      } else {
        onActiveWordChange(null);
      }
    },
    [onActiveWordChange]
  );

  const handleAutocompleteCheck = useCallback((view: any) => {
    const { state } = view;
    const { from, to, empty } = state.selection;

    let targetText = "";
    let rangeFrom = from;
    let rangeTo = to;
    let popupPosTarget = from;

    if (!empty) {
      // Text is selected / blocked
      const selText = state.doc.textBetween(from, to, " ").trim();
      // Only suggest if selected text is 1-3 words (no giant multi-paragraph blocks)
      if (selText.length >= 2 && selText.length <= 40 && !/[\n\r]/.test(selText)) {
        targetText = selText;
        rangeFrom = from;
        rangeTo = to;
        popupPosTarget = to;
      } else {
        setSuggestions([]);
        setPopupPos(null);
        return;
      }
    } else {
      const $pos = state.selection.$from;
      const start = $pos.start();
      const parentText = $pos.parent.textContent;
      const offset = from - start;

      if (offset > 0) {
        let left = offset;
        while (left > 0 && /[a-zA-Z]/.test(parentText[left - 1])) {
          left--;
        }
        const prefix = parentText.slice(left, offset);
        if (prefix.length >= 2) {
          targetText = prefix;
          rangeFrom = start + left;
          rangeTo = from;
          popupPosTarget = from;
        }
      }
    }

    if (targetText.length >= 2) {
      const dismissedKey = `${rangeFrom}-${rangeTo}-${targetText.toLowerCase()}`;
      if (dismissedKeyRef.current === dismissedKey) {
        return;
      }
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(async () => {
        try {
          const results = await GetSuggestions(targetText.toLowerCase(), 20);
          if (results && results.length > 0) {
            // Ensure words starting with a capital letter are placed at the very end
            const normal = results.filter((item) => {
              const trimmed = (item?.word || "").trim();
              if (!trimmed) return true;
              const first = trimmed.charAt(0);
              return !(first >= "A" && first <= "Z");
            });
            const capitalized = results.filter((item) => {
              const trimmed = (item?.word || "").trim();
              if (!trimmed) return false;
              const first = trimmed.charAt(0);
              return first >= "A" && first <= "Z";
            });
            const ordered = [...normal, ...capitalized];
            setSuggestions(ordered as SuggestionItem[]);
            setSelectedSugIndex(0);
            setCurrentPrefixRange({ from: rangeFrom, to: rangeTo });
            setCurrentQuery(targetText);

            if (view && !view.isDestroyed && view.dom) {
              try {
                const coords = view.coordsAtPos(popupPosTarget);
                if (coords) {
                  setPopupPos({
                    top: coords.bottom + 6,
                    left: Math.max(10, coords.left - 20),
                  });
                }
              } catch {
                // Ignore coordinates lookup if DOM position is not yet rendered
              }
            }
          } else {
            setSuggestions([]);
            setPopupPos(null);
            setCurrentQuery("");
          }
        } catch (err) {
          console.error("Autocomplete fetch error:", err);
        }
      }, 120);
      return;
    }

    setSuggestions([]);
    setPopupPos(null);
    setCurrentQuery("");
  }, []);

  const handleCloseSuggestions = useCallback(() => {
    const prefixRange = currentPrefixRangeRef.current;
    const q = currentQueryRef.current;
    if (prefixRange) {
      dismissedKeyRef.current = `${prefixRange.from}-${prefixRange.to}-${q.toLowerCase()}`;
    }
    setSuggestions([]);
    setPopupPos(null);
    setCurrentQuery("");
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Subscript,
      Superscript,
      Placeholder.configure({
        placeholder: "Your writing here...",
      }),
      CharacterCount,
    ],
    content: initialContent,
    shouldRerenderOnTransaction: true,
    editorProps: {
      handleKeyDown: (view, event) => {
        const currentList = suggestionsRef.current;
        if (currentList.length > 0) {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setSelectedSugIndex((prev) => (prev + 1) % currentList.length);
            return true;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setSelectedSugIndex((prev) => (prev - 1 + currentList.length) % currentList.length);
            return true;
          }
          if (event.key === "Enter" || event.key === "Tab") {
            event.preventDefault();
            const curIdx = selectedSugIndexRef.current;
            const chosen = currentList[curIdx] || currentList[0];
            const prefixRange = currentPrefixRangeRef.current;
            if (chosen && prefixRange) {
              view.dispatch(
                view.state.tr.replaceWith(
                  prefixRange.from,
                  prefixRange.to,
                  view.state.schema.text(chosen.word + " ")
                )
              );
              handleCloseSuggestions();
              return true;
            }
          }
          if (event.key === "Escape") {
            event.preventDefault();
            handleCloseSuggestions();
            return true;
          }
        }
        return false;
      },
    },
    onSelectionUpdate: ({ editor: ed }) => {
      extractWordAndSentence(ed.view);
      handleAutocompleteCheck(ed.view);
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      const text = ed.getText();
      onDocumentChange(html, text);
      extractWordAndSentence(ed.view);
      handleAutocompleteCheck(ed.view);
    },
  });

  // Global window listener for Escape key to guarantee suggestions close
  useEffect(() => {
    if (suggestions.length === 0) return;
    const handleGlobalEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleCloseSuggestions();
      }
    };
    window.addEventListener("keydown", handleGlobalEsc, true);
    return () => {
      window.removeEventListener("keydown", handleGlobalEsc, true);
    };
  }, [suggestions.length, handleCloseSuggestions]);

  if (editorRef && editor) {
    editorRef.current = editor;
  }

  const handleSelectSuggestion = (item: SuggestionItem) => {
    if (editor && currentPrefixRange) {
      editor
        .chain()
        .focus()
        .deleteRange(currentPrefixRange)
        .insertContent(item.word + " ")
        .run();
      handleCloseSuggestions();
    }
  };

  return (
    <Box position="relative" height="100%" display="flex" flexDirection="column" bg="gray.950">
      <RichTextEditor.Root editor={editor}>
        <RichTextEditor.ToolbarControls isPlainMode={isPlainMode} />
        <RichTextEditor.Content />
      </RichTextEditor.Root>

      <SuggestionPopup
        suggestions={suggestions}
        selectedIndex={selectedSugIndex}
        position={popupPos}
        activeQuery={currentQuery}
        onSelect={handleSelectSuggestion}
        onClose={handleCloseSuggestions}
      />
    </Box>
  );
};
