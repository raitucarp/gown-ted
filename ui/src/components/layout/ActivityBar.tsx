import React from "react";
import { Flex, VStack, IconButton, Box } from "@chakra-ui/react";
import { VscFiles } from "react-icons/vsc";
import { GiBookshelf, GiMeshNetwork } from "react-icons/gi";
import { LuInfo } from "react-icons/lu";

export type ActiveView = "editor" | "wordnet" | "graph";

interface ActivityBarProps {
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
  onToggleLeft?: () => void;
  onOpenAbout?: () => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeView,
  onChangeView,
  onToggleLeft,
  onOpenAbout,
}) => {
  const navItems = [
    {
      id: "editor" as ActiveView,
      label: "Editor & Files (Explorer, Senses, Morphology)",
      icon: <VscFiles size={22} />,
    },
    {
      id: "wordnet" as ActiveView,
      label: "WordNet Lexical Explorer (LexFiles & Synsets)",
      icon: <GiBookshelf size={22} />,
    },
    {
      id: "graph" as ActiveView,
      label: "Document Word Relationship Graph",
      icon: <GiMeshNetwork size={22} />,
    },
  ];

  return (
    <Flex
      direction="column"
      w="48px"
      minW="48px"
      h="100%"
      bg="gray.950"
      borderRightWidth="1px"
      borderColor="gray.800"
      alignItems="center"
      justifyContent="space-between"
      py="2"
      zIndex="docked"
      style={{
        userSelect: "none",
      }}
    >
      {/* Top Main Navigation Items */}
      <VStack gap="1" w="100%">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <Box key={item.id} w="100%" position="relative">
              {/* Left active border indicator like VS Code */}
              {isActive && (
                <Box
                  position="absolute"
                  left="0"
                  top="15%"
                  bottom="15%"
                  w="2.5px"
                  bg="blue.400"
                  borderRightRadius="full"
                />
              )}
              <Flex justifyContent="center" w="100%">
                <IconButton
                  aria-label={item.label}
                  title={item.label}
                  size="sm"
                  variant="ghost"
                  color={isActive ? "blue.300" : "gray.400"}
                  bg={isActive ? "whiteAlpha.100" : "transparent"}
                  _hover={{
                    color: "gray.100",
                    bg: isActive ? "whiteAlpha.150" : "whiteAlpha.100",
                  }}
                  onClick={() => {
                    if (item.id === "editor" && activeView === "editor" && onToggleLeft) {
                      onToggleLeft();
                    } else {
                      onChangeView(item.id);
                    }
                  }}
                  borderRadius="md"
                  w="36px"
                  h="36px"
                >
                  {item.icon}
                </IconButton>
              </Flex>
            </Box>
          );
        })}
      </VStack>

      {/* Bottom Auxiliary Actions */}
      <VStack gap="1" w="100%">
        {onOpenAbout && (
          <IconButton
            aria-label="About Gown Text Editor"
            title="About Gown Text Editor"
            size="sm"
            variant="ghost"
            color="gray.400"
            _hover={{
              color: "gray.100",
              bg: "whiteAlpha.100",
            }}
            onClick={onOpenAbout}
            borderRadius="md"
            w="36px"
            h="36px"
          >
            <LuInfo size={20} />
          </IconButton>
        )}
      </VStack>
    </Flex>
  );
};
