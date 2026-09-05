import { useState, useCallback } from "react";
import type { DocumentStats } from "@types";
import { AnalyzeDocument } from "@bindings/github.com/raitucarp/gown-ted/service/lexicalservice.js";

const DEFAULT_STATS: DocumentStats = {
  characters: 0,
  charactersNoSpaces: 0,
  words: 0,
  sentences: 0,
  paragraphs: 0,
  readingTimeMinutes: 0,
  speakingTimeMinutes: 0,
  uniqueWords: 0,
  vocabularyRichness: 0,
};

export function useDocumentStats() {
  const [stats, setStats] = useState<DocumentStats>(DEFAULT_STATS);

  const handleDocumentChange = useCallback(async (_html: string, plainText: string) => {
    try {
      const docStats = await AnalyzeDocument(plainText);
      if (docStats) {
        setStats(docStats);
      }
    } catch (err) {
      console.error("AnalyzeDocument error:", err);
    }
  }, []);

  return { stats, handleDocumentChange };
}
