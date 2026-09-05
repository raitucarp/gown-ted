import React, { useState } from "react";
import { Box, HStack, Text, Input, Button, Progress, Badge } from "@chakra-ui/react";
import { LuBinary } from "react-icons/lu";
import { CalculateSimilarity } from "@bindings/github.com/raitucarp/gown-ted/service/lexicalservice.js";
import type { SimilarityResult } from "@types";

interface SimilarityCalculatorProps {
  activeWord: string;
}

export const SimilarityCalculator: React.FC<SimilarityCalculatorProps> = ({
  activeWord,
}) => {
  const [compareWord, setCompareWord] = useState("");
  const [similarity, setSimilarity] = useState<SimilarityResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (!activeWord || !compareWord.trim()) return;
    setLoading(true);
    try {
      const res = await CalculateSimilarity(activeWord, compareWord.trim());
      setSimilarity(res);
    } catch (err) {
      console.error("CalculateSimilarity error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p="3" bg="gray.925" borderRadius="md" borderWidth="1px" borderColor="gray.800">
      <HStack gap="1.5" mb="2">
        <LuBinary size={13} color="#60a5fa" />
        <Text fontSize="xs" fontWeight="semibold" color="gray.200">
          Wu-Palmer Semantic Proximity
        </Text>
      </HStack>

      <HStack gap="2" mb="2">
        <Input
          size="xs"
          placeholder="Compare against word..."
          value={compareWord}
          onChange={(e) => setCompareWord(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
          bg="gray.900"
          borderColor="gray.750"
        />
        <Button
          size="xs"
          colorPalette="blue"
          onClick={handleCalculate}
          loading={loading}
          disabled={!activeWord || !compareWord.trim()}
        >
          Compare
        </Button>
      </HStack>

      {similarity && (
        <Box mt="2" p="2" bg="gray.900" borderRadius="md" borderWidth="1px" borderColor="gray.800">
          <HStack justify="space-between" mb="1">
            <Text fontSize="xs" color="gray.400">
              {similarity.word1} &harr; {similarity.word2}
            </Text>
            {similarity.error ? (
              <Badge size="xs" colorPalette="red">
                {similarity.error}
              </Badge>
            ) : (
              <Badge size="xs" colorPalette="blue" fontFamily="mono">
                {(similarity.score * 100).toFixed(1)}%
              </Badge>
            )}
          </HStack>
          {!similarity.error && (
            <Progress.Root value={similarity.score * 100} size="xs" colorPalette="blue">
              <Progress.Track bg="gray.800">
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          )}
        </Box>
      )}
    </Box>
  );
};
