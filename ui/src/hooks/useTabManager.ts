import { useState, useRef, useCallback } from "react";
import { marked } from "marked";
import TurndownService from "turndown";
import {
  ReadFile,
  WriteFile,
} from "@bindings/github.com/raitucarp/gown-ted/service/fileservice.js";
import { Dialogs } from "@wailsio/runtime";
import type { EditorTab } from "@types";

function textToHtml(raw: string): string {
  if (!raw) return "<p></p>";
  return raw
    .split(/\r?\n/)
    .map((line) => {
      const escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<p>${escaped || "<br>"}</p>`;
    })
    .join("");
}

export function useTabManager(
  editorRef: React.MutableRefObject<any>,
  onResetAnalysis: () => void
) {
  const [tabs, setTabs] = useState<EditorTab[]>([
    {
      id: "tab-1",
      title: "Untitled 1",
      fileType: "plain",
      content: "",
      isPlainMode: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("tab-1");
  const [currentExploredFolder, setCurrentExploredFolder] = useState<string | null>(null);
  const counterRef = useRef(1);

  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;

  const activeTabIdRef = useRef(activeTabId);
  activeTabIdRef.current = activeTabId;

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Save active tab's content when editor content changes
  const updateActiveTabContent = useCallback((html: string) => {
    const currentId = activeTabIdRef.current;
    setTabs((prev) =>
      prev.map((tab) => (tab.id === currentId ? { ...tab, content: html } : tab))
    );
  }, []);

  // Switch to a different tab
  const switchTab = useCallback(
    (targetTabId: string) => {
      if (targetTabId === activeTabIdRef.current) return;

      const currentEditor = editorRef.current;
      // Save current content first
      if (currentEditor) {
        const currentHtml = currentEditor.getHTML();
        setTabs((prev) =>
          prev.map((t) =>
            t.id === activeTabIdRef.current ? { ...t, content: currentHtml } : t
          )
        );
      }

      const targetTab = tabsRef.current.find((t) => t.id === targetTabId);
      if (!targetTab) return;

      setActiveTabId(targetTabId);
      onResetAnalysis();

      if (currentEditor) {
        currentEditor.commands.setContent(targetTab.content || "<p></p>");
        currentEditor.commands.focus();
      }
    },
    [editorRef, onResetAnalysis]
  );

  // Open file from explorer or path
  const openFile = useCallback(
    async (filePath: string) => {
      // 1. Check if already open
      const existing = tabsRef.current.find((t) => t.filePath === filePath);
      if (existing) {
        switchTab(existing.id);
        return;
      }

      // 2. Read from disk
      try {
        const payload = await ReadFile(filePath);
        if (!payload) return;

        const isMd = payload.extension === "md";
        const isTxt = payload.extension === "txt";

        let htmlContent = "";
        if (isMd) {
          const parsed = marked.parse(payload.content, { async: false });
          htmlContent = typeof parsed === "string" ? parsed : String(parsed);
        } else {
          htmlContent = textToHtml(payload.content);
        }

        const newTabObj: EditorTab = {
          id: `tab-${Date.now()}`,
          title: payload.name,
          filePath: payload.path,
          fileType: isMd ? "md" : isTxt ? "txt" : "plain",
          content: htmlContent,
          isPlainMode: isTxt,
        };

        const currentActive = tabsRef.current.find(
          (t) => t.id === activeTabIdRef.current
        );
        const isCurrentEmptyUntitled =
          currentActive &&
          !currentActive.filePath &&
          currentActive.title.startsWith("Untitled") &&
          (!currentActive.content ||
            currentActive.content === "<p></p>" ||
            currentActive.content.trim() === "");

        if (isCurrentEmptyUntitled) {
          // Replace current tab with the loaded file
          setTabs((prev) =>
            prev.map((t) => (t.id === currentActive.id ? newTabObj : t))
          );
          setActiveTabId(newTabObj.id);
        } else {
          // Save current tab content and append new tab
          if (editorRef.current) {
            const currentHtml = editorRef.current.getHTML();
            setTabs((prev) => [
              ...prev.map((t) =>
                t.id === activeTabIdRef.current ? { ...t, content: currentHtml } : t
              ),
              newTabObj,
            ]);
          } else {
            setTabs((prev) => [...prev, newTabObj]);
          }
          setActiveTabId(newTabObj.id);
        }

        onResetAnalysis();

        if (editorRef.current) {
          editorRef.current.commands.setContent(htmlContent || "<p></p>");
          editorRef.current.commands.focus();
        }
      } catch (err) {
        console.error("Failed to open file:", err);
      }
    },
    [editorRef, switchTab, onResetAnalysis]
  );

  // Open file via native dialog
  const openFileDialog = useCallback(
    async (onFileOpened?: (path: string) => void) => {
      try {
        const selected = await Dialogs.OpenFile({
          CanChooseFiles: true,
          CanChooseDirectories: false,
          Filters: [
            { DisplayName: "Text & Markdown (*.txt, *.md)", Pattern: "*.txt;*.md" },
          ],
        });
        if (selected && typeof selected === "string" && selected.trim()) {
          await openFile(selected);
          if (onFileOpened) onFileOpened(selected);
        }
      } catch (err) {
        console.error("Open file dialog error:", err);
      }
    },
    [openFile]
  );

  // Open folder via native dialog
  const openFolderDialog = useCallback(
    async (onFolderOpened?: (path: string) => void) => {
      try {
        const selected = await Dialogs.OpenFile({
          CanChooseDirectories: true,
          CanChooseFiles: false,
          Title: "Select Folder to Explore",
        });
        if (selected && typeof selected === "string" && selected.trim()) {
          setCurrentExploredFolder(selected);
          if (onFolderOpened) onFolderOpened(selected);
        }
      } catch (err) {
        console.error("Open folder dialog error:", err);
      }
    },
    []
  );

  // Create a brand new blank tab
  const newTab = useCallback(() => {
    counterRef.current += 1;
    const newId = `tab-${Date.now()}`;
    const newTabObj: EditorTab = {
      id: newId,
      title: `Untitled ${counterRef.current}`,
      fileType: "plain",
      content: "",
      isPlainMode: false,
    };

    if (editorRef.current) {
      const currentHtml = editorRef.current.getHTML();
      setTabs((prev) => [
        ...prev.map((t) =>
          t.id === activeTabIdRef.current ? { ...t, content: currentHtml } : t
        ),
        newTabObj,
      ]);
      editorRef.current.commands.setContent("<p></p>");
      editorRef.current.commands.focus();
    } else {
      setTabs((prev) => [...prev, newTabObj]);
    }

    setActiveTabId(newId);
    onResetAnalysis();
  }, [editorRef, onResetAnalysis]);

  // Close a tab
  const closeTab = useCallback(
    (tabId: string) => {
      const currentTabs = tabsRef.current;
      if (currentTabs.length <= 1) {
        // Reset the single tab to empty
        counterRef.current += 1;
        const resetTab: EditorTab = {
          id: `tab-${Date.now()}`,
          title: `Untitled ${counterRef.current}`,
          fileType: "plain",
          content: "",
          isPlainMode: false,
        };
        setTabs([resetTab]);
        setActiveTabId(resetTab.id);
        onResetAnalysis();
        if (editorRef.current) {
          editorRef.current.commands.setContent("<p></p>");
        }
        return;
      }

      const closingIndex = currentTabs.findIndex((t) => t.id === tabId);
      const remaining = currentTabs.filter((t) => t.id !== tabId);

      if (tabId === activeTabIdRef.current) {
        // Switch active tab to next or previous
        const nextIndex = Math.min(closingIndex, remaining.length - 1);
        const nextTab = remaining[nextIndex];
        setTabs(remaining);
        setActiveTabId(nextTab.id);
        onResetAnalysis();
        if (editorRef.current) {
          editorRef.current.commands.setContent(nextTab.content || "<p></p>");
          editorRef.current.commands.focus();
        }
      } else {
        setTabs(remaining);
      }
    },
    [editorRef, onResetAnalysis]
  );

  // Serialize content based on tab type
  const serializeContent = (fileType: string): string => {
    if (!editorRef.current) return "";
    if (fileType === "txt") {
      return editorRef.current.getText();
    }
    const html = editorRef.current.getHTML();
    const turndown = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
    });
    return turndown.turndown(html);
  };

  // Save current active tab as a new file
  const saveCurrentTabAs = useCallback(
    async (onSaved?: (path: string) => void) => {
      try {
        const current = tabsRef.current.find((t) => t.id === activeTabIdRef.current);
        const defaultName =
          current?.title && (current.title.endsWith(".md") || current.title.endsWith(".txt"))
            ? current.title
            : "document.md";

        const selectedPath = await Dialogs.SaveFile({
          Filename: defaultName,
          Filters: [
            { DisplayName: "Markdown (*.md)", Pattern: "*.md" },
            { DisplayName: "Plain Text (*.txt)", Pattern: "*.txt" },
          ],
        });

        if (!selectedPath) return;

        const isMd = selectedPath.toLowerCase().endsWith(".md");
        const isTxt = selectedPath.toLowerCase().endsWith(".txt");
        const fileType = isMd ? "md" : isTxt ? "txt" : "plain";

        const contentToSave = serializeContent(fileType);
        await WriteFile(selectedPath, contentToSave);

        const filename = selectedPath.split(/[/\\]/).pop() || selectedPath;

        setTabs((prev) =>
          prev.map((t) =>
            t.id === activeTabIdRef.current
              ? {
                  ...t,
                  title: filename,
                  filePath: selectedPath,
                  fileType,
                  isPlainMode: isTxt,
                  content: editorRef.current ? editorRef.current.getHTML() : t.content,
                }
              : t
          )
        );

        if (onSaved) onSaved(selectedPath);
      } catch (err) {
        console.error("Save as error:", err);
      }
    },
    [editorRef]
  );

  // Save current active tab (direct write if has filePath, else Save As)
  const saveCurrentTab = useCallback(
    async (onSaved?: (path: string) => void) => {
      const current = tabsRef.current.find((t) => t.id === activeTabIdRef.current);
      if (!current?.filePath) {
        return saveCurrentTabAs(onSaved);
      }

      try {
        const contentToSave = serializeContent(current.fileType);
        await WriteFile(current.filePath, contentToSave);
        if (onSaved) onSaved(current.filePath);
      } catch (err) {
        console.error("Save error:", err);
      }
    },
    [saveCurrentTabAs, editorRef]
  );

  return {
    tabs,
    activeTabId,
    activeTab,
    isPlainMode: activeTab?.isPlainMode || false,
    activeFilePath: activeTab?.filePath,
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
  };
}
