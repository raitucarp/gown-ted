import {
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
  HStack,
  VStack,
  Text,
  Badge,
  Box,
  Link,
  Button,
  Portal,
  Image,
} from "@chakra-ui/react";
import { LuBookMarked, LuExternalLink, LuHeart, LuCode } from "react-icons/lu";
import { SiGithub, SiKofi } from "react-icons/si";
import { Browser } from "@wailsio/runtime";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CREDITS = [
  {
    name: "Go (Golang)",
    category: "Backend Engine",
    desc: "Fast, reliable systems programming language powering the core runtime.",
    url: "https://go.dev",
  },
  {
    name: "Wails v3",
    category: "Desktop Framework",
    desc: "Lightweight, cross-platform Go + Web application framework.",
    url: "https://v3.wails.io",
  },
  {
    name: "Princeton WordNet / OEWN 3.1",
    category: "Lexical Ontology",
    desc: "Princeton University's semantic dictionary of synsets and relations.",
    url: "https://wordnet.princeton.edu",
  },
  {
    name: "gown",
    category: "Go WordNet Library",
    desc: "High-performance Go WordNet library created by @raitucarp.",
    url: "https://github.com/raitucarp/gown",
  },
  {
    name: "React 19 & TypeScript",
    category: "UI Architecture",
    desc: "Declarative component hierarchy with strict end-to-end type safety.",
    url: "https://react.dev",
  },
  {
    name: "Chakra UI v3",
    category: "Design System",
    desc: "Modern, accessible, and composable atomic UI component system.",
    url: "https://chakra-ui.com",
  },
  {
    name: "TipTap & ProseMirror",
    category: "Rich Text Editor",
    desc: "Headless, battle-tested content editor foundation.",
    url: "https://tiptap.dev",
  },
  {
    name: "Marked & Turndown",
    category: "Markdown Processing",
    desc: "Bidirectional high-speed Markdown-to-HTML parser and converter.",
    url: "https://marked.js.org",
  },
  {
    name: "Lucide & React Icons",
    category: "Iconography",
    desc: "Clean, consistent typographic symbols and UI iconography.",
    url: "https://lucide.dev",
  },
];

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const handleOpenUrl = (url: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      Browser.OpenURL(url);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(e) => !e.open && onClose()}
      size="lg"
      placement="center"
    >
      <Portal>
        <DialogBackdrop bg="black/75" backdropFilter="blur(6px)" />
        <DialogPositioner>
          <DialogContent
          bg="gray.950"
          color="gray.100"
          borderColor="gray.800"
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="2xl"
          maxW="620px"
          overflow="hidden"
        >
          <DialogHeader pb="3.5" borderBottomWidth="1px" borderColor="gray.800/80">
            <HStack justify="space-between" align="center" w="100%">
              <HStack gap="3">
                <Image
                  src="/app-icon.png"
                  alt="gown-ted logo"
                  boxSize="40px"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="blue.800"
                  shadow="md"
                />
                <VStack align="start" gap="0.5">
                  <DialogTitle fontSize="lg" fontWeight="bold" color="white">
                    gown-ted
                  </DialogTitle>
                  <Text fontSize="sm" color="gray.400">
                    Go WordNet Intelligent Text Editor
                  </Text>
                </VStack>
              </HStack>
              <Badge size="sm" variant="surface" colorPalette="blue" px="2.5" py="1">
                v0.1.0 Beta
              </Badge>
            </HStack>
          </DialogHeader>

          <DialogBody py="5" px="6">
            <VStack align="stretch" gap="5">
              {/* Short description */}
              <Text fontSize="sm" color="gray.200" lineHeight="1.6">
                <strong>gown-ted</strong> is a desktop-class lexical and linguistic text editor
                designed for writers, linguists, and poets, providing real-time WordNet semantic
                relations, rhythm, and sense disambiguation right beside your cursor.
              </Text>

              {/* Creator & Support Box */}
              <Box
                p="4"
                bg="gray.900/80"
                borderRadius="md"
                borderWidth="1px"
                borderColor="gray.800"
              >
                <VStack align="stretch" gap="3">
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color="gray.400"
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                  >
                    Author & Sponsorship
                  </Text>

                  <HStack justify="space-between" wrap="wrap" gap="2.5">
                    <Link
                      href="https://github.com/raitucarp"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleOpenUrl("https://github.com/raitucarp")}
                      display="inline-flex"
                      alignItems="center"
                      gap="2"
                      px="3.5"
                      py="2"
                      bg="gray.800"
                      _hover={{ bg: "blue.950", borderColor: "blue.700", textDecoration: "none" }}
                      borderColor="gray.700"
                      borderWidth="1px"
                      borderRadius="md"
                      fontSize="sm"
                      color="blue.300"
                      fontWeight="medium"
                      transition="all 0.15s ease"
                    >
                      <SiGithub size={16} />
                      Created by @raitucarp
                      <LuExternalLink size={13} />
                    </Link>

                    <Link
                      href="https://ko-fi.com/raitucarp"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleOpenUrl("https://ko-fi.com/raitucarp")}
                      display="inline-flex"
                      alignItems="center"
                      gap="2"
                      px="3.5"
                      py="2"
                      bg="pink.950/40"
                      _hover={{ bg: "pink.950/80", borderColor: "pink.600", textDecoration: "none" }}
                      borderColor="pink.800/80"
                      borderWidth="1px"
                      borderRadius="md"
                      fontSize="sm"
                      color="pink.300"
                      fontWeight="medium"
                      transition="all 0.15s ease"
                    >
                      <SiKofi size={16} color="#FF5E5B" />
                      Support me on Ko-fi
                      <LuHeart size={13} color="#FF5E5B" />
                    </Link>
                  </HStack>
                </VStack>
              </Box>

              {/* Open Source Acknowledgements */}
              <Box>
                <HStack gap="2" mb="2.5">
                  <LuCode size={15} color="#4FD1C5" />
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color="gray.400"
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                  >
                    Open Source Credits & Dependencies
                  </Text>
                </HStack>

                <Box
                  maxH="240px"
                  overflowY="auto"
                  borderWidth="1px"
                  borderColor="gray.850"
                  borderRadius="md"
                  bg="gray.900/40"
                  p="2.5"
                  css={{
                    "&::-webkit-scrollbar": { width: "5px" },
                    "&::-webkit-scrollbar-thumb": {
                      background: "rgba(255, 255, 255, 0.15)",
                      borderRadius: "3px",
                    },
                  }}
                >
                  <VStack align="stretch" gap="2">
                    {CREDITS.map((item) => (
                      <HStack
                        key={item.name}
                        justify="space-between"
                        p="2.5"
                        borderRadius="md"
                        _hover={{ bg: "gray.850" }}
                        transition="background 0.15s ease"
                      >
                        <VStack align="start" gap="1" flex="1">
                          <HStack gap="2.5">
                            <Text fontSize="sm" fontWeight="semibold" color="gray.200">
                              {item.name}
                            </Text>
                            <Badge size="sm" px="2" py="0.5" colorPalette="gray" variant="subtle">
                              {item.category}
                            </Badge>
                          </HStack>
                          <Text fontSize="xs" color="gray.400" lineHeight="1.5">
                            {item.desc}
                          </Text>
                        </VStack>

                        <Link
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={handleOpenUrl(item.url)}
                          color="gray.400"
                          _hover={{ color: "blue.300" }}
                          p="1.5"
                          title={`Visit ${item.name}`}
                          aria-label={`Visit ${item.name}`}
                        >
                          <LuExternalLink size={15} />
                        </Link>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              </Box>
            </VStack>
          </DialogBody>

          <DialogCloseTrigger
            top="3.5"
            right="3.5"
            color="gray.400"
            _hover={{ color: "white" }}
          />
        </DialogContent>
      </DialogPositioner>
      </Portal>
    </DialogRoot>
  );
};
