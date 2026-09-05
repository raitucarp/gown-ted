import React from "react";
import { HStack, Text, Badge } from "@chakra-ui/react";
import { LuClock, LuFileText, LuActivity } from "react-icons/lu";

import type { DocumentStats } from "@types";

interface AppStatusBarProps {
  stats: DocumentStats;
  activeWord: string;
  activeLemma: string;
}

export const AppStatusBar: React.FC<AppStatusBarProps> = ({
  stats,
  activeWord,
  activeLemma,
}) => {
  return (
    <HStack
      px="4"
      py="1.5"
      justifyContent="space-between"
      bg="gray.950"
      borderTopWidth="1px"
      borderColor="gray.800"
      fontSize="xs"
      color="gray.400"
      zIndex={10}
    >
      {/* Left: Document Counts */}
      <HStack gap="4">
        <HStack gap="1.5">
          <LuFileText size={13} color="#63B3ED" />
          <Text>
            Words: <strong style={{ color: "#E2E8F0" }}>{stats.words}</strong>
          </Text>
        </HStack>

        <Text>
          Chars: <strong style={{ color: "#E2E8F0" }}>{stats.characters}</strong>
          <span style={{ opacity: 0.6, fontSize: "0.85em" }}> ({stats.charactersNoSpaces} no spaces)</span>
        </Text>

        <Text>
          Sentences: <strong style={{ color: "#E2E8F0" }}>{stats.sentences}</strong>
        </Text>

        <Text>
          Paragraphs: <strong style={{ color: "#E2E8F0" }}>{stats.paragraphs}</strong>
        </Text>

        {stats.vocabularyRichness > 0 && (
          <Text title="Vocabulary Richness (Type-Token Ratio)">
            Richness: <strong style={{ color: "#4FD1C5" }}>{(stats.vocabularyRichness * 100).toFixed(0)}%</strong>
          </Text>
        )}
      </HStack>

      {/* Right: Reading Time & Active Word Indicator */}
      <HStack gap="4">
        {stats.words > 0 && (
          <HStack gap="1.5">
            <LuClock size={13} color="#CBD5E0" />
            <Text>
              Read: ~{stats.readingTimeMinutes} min
            </Text>
          </HStack>
        )}

        {activeWord ? (
          <HStack gap="1.5">
            <LuActivity size={12} color="#48BB78" />
            <Text fontSize="xs" color="gray.450">
              Active:
            </Text>
            <Badge size="xs" colorPalette="blue" variant="subtle" borderRadius="full" px="2">
              {activeWord}
            </Badge>
            {activeLemma && activeLemma !== activeWord && (
              <Badge size="xs" colorPalette="teal" variant="surface" borderRadius="full" px="2">
                → {activeLemma}
              </Badge>
            )}
          </HStack>
        ) : (
          <Text fontSize="xs" color="gray.550">
            No active word
          </Text>
        )}
      </HStack>
    </HStack>
  );
};
