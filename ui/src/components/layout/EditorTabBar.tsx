import React from "react";
import { HStack, Box, Text, IconButton } from "@chakra-ui/react";
import { LuPlus, LuX, LuFileText, LuFileCode } from "react-icons/lu";
import type { EditorTab } from "@types";

interface EditorTabBarProps {
  tabs: EditorTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onNewTab: () => void;
}

export const EditorTabBar: React.FC<EditorTabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
}) => {
  return (
    <HStack
      w="100%"
      h="36px"
      bg="gray.950"
      borderBottomWidth="1px"
      borderColor="gray.800"
      px="2"
      gap="1"
      overflowX="auto"
      overflowY="hidden"
      flexShrink={0}
      userSelect="none"
      css={{
        "&::-webkit-scrollbar": {
          height: "3px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "2px",
        },
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const isMd = tab.fileType === "md";
        const isTxt = tab.fileType === "txt";

        return (
          <HStack
            key={tab.id}
            px="3"
            h="28px"
            borderRadius="sm"
            cursor="pointer"
            bg={isActive ? "gray.900" : "transparent"}
            color={isActive ? "gray.100" : "gray.400"}
            borderTopWidth={isActive ? "2px" : "2px"}
            borderTopColor={isActive ? "blue.400" : "transparent"}
            borderWidth="1px"
            borderColor={isActive ? "gray.800" : "transparent"}
            _hover={{
              bg: isActive ? "gray.900" : "gray.900/50",
              color: "gray.200",
            }}
            onClick={() => onSelectTab(tab.id)}
            gap="2"
            maxW="200px"
            flexShrink={0}
            transition="all 0.15s ease"
          >
            {isMd ? (
              <LuFileCode size={13} color={isActive ? "#63B3ED" : "#4A5568"} />
            ) : isTxt ? (
              <LuFileText size={13} color={isActive ? "#F6E05E" : "#4A5568"} />
            ) : (
              <LuFileText size={13} color={isActive ? "#A0AEC0" : "#4A5568"} />
            )}

            <Text fontSize="xs" fontWeight={isActive ? "medium" : "normal"} truncate>
              {tab.title}
            </Text>

            <Box
              as="span"
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="sm"
              p="0.5"
              ml="1"
              color="gray.500"
              _hover={{
                bg: "gray.800",
                color: "gray.200",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              title="Close tab"
            >
              <LuX size={12} />
            </Box>
          </HStack>
        );
      })}

      {/* New Tab Button */}
      <IconButton
        size="xs"
        variant="ghost"
        color="gray.400"
        _hover={{ color: "white", bg: "gray.900" }}
        onClick={onNewTab}
        title="New Tab"
        aria-label="New Tab"
        flexShrink={0}
      >
        <LuPlus size={15} />
      </IconButton>
    </HStack>
  );
};
