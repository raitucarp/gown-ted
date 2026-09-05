import { useState, useEffect, useRef } from "react";
import type { WordContext, LexicalAnalysisResult, WordSenseItem } from "@types";
import { AnalyzeWord } from "@bindings/github.com/raitucarp/gown-ted/service/lexicalservice.js";

export function useWordAnalysis() {
  const [activeWordContext, setActiveWordContext] = useState<WordContext | null>(null);
  const [analysisResult, setAnalysisResult] = useState<LexicalAnalysisResult | null>(null);
  const [selectedSenseIdx, setSelectedSenseIdx] = useState(0);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const requestIdRef = useRef<number>(0);
  const analyzeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!activeWordContext || !activeWordContext.word) {
      setAnalysisResult(null);
      return;
    }

    if (analyzeTimerRef.current) clearTimeout(analyzeTimerRef.current);

    analyzeTimerRef.current = setTimeout(async () => {
      const currentReqId = ++requestIdRef.current;
      setAnalysisLoading(true);
      try {
        const res = await AnalyzeWord(
          activeWordContext.word,
          activeWordContext.sentence,
          currentReqId
        );
        if (res && res.requestId === requestIdRef.current) {
          setAnalysisResult(res);
          setSelectedSenseIdx(res.recommendedSenseIndex || 0);
        }
      } catch (err) {
        console.error("AnalyzeWord error:", err);
      } finally {
        setAnalysisLoading(false);
      }
    }, 100);

    return () => {
      if (analyzeTimerRef.current) clearTimeout(analyzeTimerRef.current);
    };
  }, [activeWordContext]);

  const inspectWord = (wordToInspect: string) => {
    setActiveWordContext({
      word: wordToInspect,
      sentence: wordToInspect,
      from: 0,
      to: 0,
    });
  };

  const currentSense: WordSenseItem | null =
    analysisResult?.senses?.[selectedSenseIdx] ?? null;

  return {
    activeWordContext,
    setActiveWordContext,
    analysisResult,
    setAnalysisResult,
    selectedSenseIdx,
    setSelectedSenseIdx,
    analysisLoading,
    currentSense,
    inspectWord,
  };
}
