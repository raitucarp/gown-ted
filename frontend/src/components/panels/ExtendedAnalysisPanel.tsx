import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Input,
  Button,
  Tabs,
  IconButton,
  EmptyState,
  TreeView,
  createTreeCollection,
  Stat,
  Group,
} from "@chakra-ui/react";
import {
  LuBinary,
  LuVolume2,
  LuNetwork,
  LuTrendingUp,
  LuChevronRight,
  LuGitBranch,
  LuCode,
  LuListTree,
  LuCopy,
  LuCheck,
  LuFolderPlus,
  LuFolderMinus,
  LuChevronDown,
  LuReplace,
} from "react-icons/lu";
import { CalculateSimilarity } from "../../../bindings/github.com/raitucarp/gown-ted/lexicalservice.js";
import { PanelScrollArea } from "../ui/panel-scroll-area";
import { getPosVisual, getLexFileVisual } from "../../utils/lexicalIcons";

interface ExtendedAnalysisPanelProps {
  word: string;
  hierarchyTree: string;
  expansionTree?: any;
  onInspectWord: (word: string) => void;
  onReplaceWord?: (word: string) => void;
  onToggleCollapse?: () => void;
}

export interface OntologyTreeNode {
  id: string;
  name: string;
  word: string;
  primaryWord: string;
  relation: string;
  definition?: string;
  pos?: string;
  lexfile?: string;
  children?: OntologyTreeNode[];
}

function getRelationPalette(rel: string): "teal" | "blue" | "purple" | "orange" | "red" | "gray" {
  const r = (rel || "").toLowerCase();
  if (r.includes("sense")) return "blue";
  if (r.includes("hypernym")) return "teal";
  if (r.includes("hyponym")) return "purple";
  if (r.includes("meronym")) return "orange";
  if (r.includes("antonym")) return "red";
  if (r.includes("root")) return "blue";
  return "gray";
}

function formatRelationLabel(rel: string): string {
  if (!rel) return "";
  if (rel === "instance_hypernym") return "Instance Hypernym";
  if (rel === "instance_hyponym") return "Instance Hyponym";
  if (rel === "root") return "Target Word";
  return rel.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseHierarchyTree(treeStr: string, rootWord: string): OntologyTreeNode {
  const defaultRoot: OntologyTreeNode = {
    id: "root",
    name: rootWord || "Word",
    word: rootWord || "Word",
    primaryWord: rootWord || "Word",
    relation: "root",
  };

  if (!treeStr || !treeStr.trim()) {
    return defaultRoot;
  }

  const lines = treeStr.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return defaultRoot;
  }

  const parseLine = (rawLine: string, index: number): { depth: number; node: OntologyTreeNode } => {
    const matchIndent = rawLine.match(/^([│├└─\s]*)/);
    const prefix = matchIndent ? matchIndent[1] : "";
    const clean = rawLine.slice(prefix.length).trim();
    const depth = Math.max(0, Math.round(prefix.length / 2));

    const relMatch = clean.match(/^\[([a-zA-Z_]+)\]\s*(.*?)(?::\s*"([^"]*)")?$/);
    let relation = "";
    let wordText = clean;
    let definition = "";

    if (relMatch) {
      relation = relMatch[1];
      wordText = relMatch[2].trim();
      definition = relMatch[3] ? relMatch[3].trim() : "";
    } else {
      const defIdx = clean.indexOf(':"');
      if (defIdx !== -1) {
        wordText = clean.slice(0, defIdx).trim();
        definition = clean.slice(defIdx + 2).replace(/"$/, "").trim();
      }
    }

    const primaryWord = wordText.split(/[,(]/)[0].trim() || wordText;

    return {
      depth,
      node: {
        id: `node-${index}-${primaryWord || "item"}`,
        name: primaryWord || wordText,
        word: wordText,
        primaryWord,
        relation,
        definition,
        children: [],
      },
    };
  };

  const first = parseLine(lines[0], 0);
  const rootNode: OntologyTreeNode = {
    ...first.node,
    id: "root",
    relation: first.node.relation || "root",
    children: [],
  };

  const stack: { node: OntologyTreeNode; depth: number }[] = [{ node: rootNode, depth: 0 }];

  for (let i = 1; i < lines.length; i++) {
    const parsed = parseLine(lines[i], i);
    if (!parsed.node.word && !parsed.node.primaryWord) continue;

    while (stack.length > 1 && stack[stack.length - 1].depth >= parsed.depth) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    if (!parent.children) {
      parent.children = [];
    }
    parent.children.push(parsed.node);
    stack.push({ node: parsed.node, depth: parsed.depth });
  }

  const cleanEmptyChildren = (node: OntologyTreeNode) => {
    if (node.children && node.children.length === 0) {
      delete node.children;
    } else if (node.children) {
      node.children.forEach(cleanEmptyChildren);
    }
  };
  cleanEmptyChildren(rootNode);

  return rootNode;
}

function convertExpansionNode(exp: any, index = 0): OntologyTreeNode {
  const words = exp.word || "";
  const primaryWord = words.split(/[,(]/)[0].trim() || words;
  const rawChildren = (exp.children || []).filter(Boolean);
  const children = rawChildren.map((child: any, idx: number) => convertExpansionNode(child, idx));
  return {
    id: exp.id || `exp-${index}-${primaryWord}`,
    name: primaryWord || words,
    word: words,
    primaryWord,
    relation: exp.relation || (exp.type === "word" ? "root" : exp.type) || "",
    definition: exp.definition || "",
    pos: exp.pos || "",
    lexfile: exp.lexfile || exp.lex_file || "",
    children: children.length > 0 ? children : undefined,
  };
}

function getAllBranchIds(node: OntologyTreeNode): string[] {
  const ids: string[] = [];
  if (node.children && node.children.length > 0) {
    ids.push(node.id);
    for (const child of node.children) {
      ids.push(...getAllBranchIds(child));
    }
  }
  return ids;
}

export const ExtendedAnalysisPanel: React.FC<ExtendedAnalysisPanelProps> = ({
  word,
  hierarchyTree,
  expansionTree,
  onInspectWord,
  onReplaceWord,
  onToggleCollapse,
}) => {
  const [compareWord, setCompareWord] = useState("");
  const [simResult, setSimResult] = useState<{ score: number; metric: string } | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"interactive" | "ascii">("interactive");
  const [copied, setCopied] = useState(false);

  // Parse hierarchy tree
  const rootNode = useMemo(() => {
    let parsed: OntologyTreeNode;
    if (expansionTree) {
      parsed = convertExpansionNode(expansionTree);
    } else {
      parsed = parseHierarchyTree(hierarchyTree, word);
    }
    // Wrap inside a container root so that the target word itself is rendered as top-level tree node
    return {
      id: "TREE_ROOT",
      name: "ROOT",
      word: "",
      primaryWord: "",
      relation: "",
      children: [parsed],
    };
  }, [expansionTree, hierarchyTree, word]);

  const allBranchIds = useMemo(() => getAllBranchIds(rootNode), [rootNode]);
  const [expandedIds, setExpandedIds] = useState<string[]>(allBranchIds);

  useEffect(() => {
    setExpandedIds(allBranchIds);
  }, [allBranchIds]);

  const treeCollection = useMemo(() => {
    return createTreeCollection<OntologyTreeNode>({
      nodeToValue: (n) => n.id,
      nodeToString: (n) => n.name,
      rootNode,
    });
  }, [rootNode]);

  const handleCalculateSimilarity = async () => {
    if (!word || !compareWord.trim()) return;
    setSimLoading(true);
    try {
      const res = await CalculateSimilarity(word, compareWord.trim());
      if (res && !res.error) {
        setSimResult({ score: res.score, metric: res.metric });
      }
    } catch (err) {
      console.error("Similarity calculation error:", err);
    } finally {
      setSimLoading(false);
    }
  };

  const handleCopyTree = () => {
    if (!hierarchyTree) return;
    navigator.clipboard.writeText(hierarchyTree);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!word) {
    return (
      <Box p="4" h="100%" display="flex" alignItems="center" justifyContent="center">
        <EmptyState.Root size="sm">
          <EmptyState.Content>
            <EmptyState.Indicator>
              <LuBinary size={28} />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>Extended Analysis</EmptyState.Title>
              <EmptyState.Description>
                Hypernym ontology trees, phonetics, and semantic similarity.
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      </Box>
    );
  }

  return (
    <Box h="100%" display="flex" flexDirection="column" overflow="hidden" bg="gray.900">
      <Tabs.Root defaultValue="tree" variant="subtle" size="sm" colorPalette="blue" h="100%" display="flex" flexDirection="column">
        <Box borderBottomWidth="1px" borderColor="gray.800" bg="gray.950" px="2" pt="1" overflow="hidden">
          <HStack justify="space-between" align="center" flexWrap="nowrap" gap="2" minW="0">
            <Tabs.List
              gap="1"
              flexWrap="nowrap"
              overflowX="auto"
              flexShrink={1}
              minW="0"
              css={{
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              <Tabs.Trigger value="tree" fontSize="xs" px="2.5" py="1" whiteSpace="nowrap" flexShrink={0}>
                <LuNetwork size={13} style={{ flexShrink: 0 }} />
                <Text as="span" lineClamp={1} whiteSpace="nowrap">Ontology Tree</Text>
              </Tabs.Trigger>
              <Tabs.Trigger value="similarity" fontSize="xs" px="2.5" py="1" whiteSpace="nowrap" flexShrink={0}>
                <LuTrendingUp size={13} style={{ flexShrink: 0 }} />
                <Text as="span" lineClamp={1} whiteSpace="nowrap">Similarity</Text>
              </Tabs.Trigger>
              <Tabs.Indicator rounded="sm" />
            </Tabs.List>
            {onToggleCollapse && (
              <IconButton
                size="2xs"
                variant="ghost"
                color="gray.400"
                _hover={{ bg: "gray.800", color: "white" }}
                onClick={onToggleCollapse}
                title="Collapse Extended Analysis Subpanel"
                aria-label="Collapse Extended Analysis Subpanel"
                mb="1"
                flexShrink={0}
              >
                <LuChevronDown size={14} />
              </IconButton>
            )}
          </HStack>
        </Box>

        {/* Tree Content */}
        <Tabs.Content value="tree" flex="1" p="0" minH="0" display="flex" flexDirection="column">
          <HStack justify="space-between" px="3" py="2" borderBottomWidth="1px" borderColor="gray.850" flexWrap="nowrap" gap="2">
            <HStack gap="1.5" minW="0">
              <LuNetwork size={12} color="#63B3ED" style={{ flexShrink: 0 }} />
              <Text fontSize="2xs" fontWeight="bold" color="blue.300" textTransform="uppercase" lineClamp={1} whiteSpace="nowrap">
                Ontology Tree
              </Text>
            </HStack>

            <HStack gap="1">
              {viewMode === "interactive" && (
                <>
                  <IconButton
                    size="2xs"
                    variant="ghost"
                    color="gray.400"
                    title="Expand all branches"
                    aria-label="Expand all"
                    onClick={() => setExpandedIds(allBranchIds)}
                  >
                    <LuFolderPlus size={12} />
                  </IconButton>
                  <IconButton
                    size="2xs"
                    variant="ghost"
                    color="gray.400"
                    title="Collapse all branches"
                    aria-label="Collapse all"
                    onClick={() => setExpandedIds([])}
                  >
                    <LuFolderMinus size={12} />
                  </IconButton>
                </>
              )}
              <IconButton
                size="2xs"
                variant={viewMode === "interactive" ? "subtle" : "ghost"}
                colorPalette="blue"
                title={viewMode === "interactive" ? "View Raw ASCII Tree" : "View Interactive Tree"}
                aria-label="Toggle Tree View"
                onClick={() => setViewMode(viewMode === "interactive" ? "ascii" : "interactive")}
              >
                {viewMode === "interactive" ? <LuListTree size={12} /> : <LuCode size={12} />}
              </IconButton>
              <IconButton
                size="2xs"
                variant="ghost"
                color={copied ? "green.300" : "gray.400"}
                title="Copy Tree"
                aria-label="Copy Tree"
                onClick={handleCopyTree}
              >
                {copied ? <LuCheck size={12} /> : <LuCopy size={12} />}
              </IconButton>
            </HStack>
          </HStack>

          <PanelScrollArea p="3">
            {hierarchyTree ? (
              viewMode === "interactive" ? (
                <TreeView.Root
                  collection={treeCollection}
                  size="xs"
                  colorPalette="blue"
                  expandedValue={expandedIds}
                  onExpandedChange={(e) => setExpandedIds(e.expandedValue)}
                  expandOnClick
                  css={{
                    "--tree-indent-size": "24px",
                    "--tree-icon-size": "14px",
                    "--tree-padding-inline": "8px",
                    "--tree-padding-block": "4px",
                    "--tree-indentation": "24px",
                    "--tree-item-gap": "6px",
                  }}
                >
                  <TreeView.Tree
                    css={{
                      "--tree-indent-size": "24px",
                      "--tree-icon-size": "14px",
                      "--tree-padding-inline": "8px",
                      "--tree-padding-block": "4px",
                      "--tree-indentation": "24px",
                      "--tree-item-gap": "6px",
                    }}
                  >
                    <TreeView.Node<OntologyTreeNode>
                      indentGuide={<TreeView.BranchIndentGuide />}
                      render={({ node, nodeState }) => {
                        const isBranch = nodeState.isBranch;
                        const posVis = node.pos ? getPosVisual(node.pos) : null;
                        const lexVis = node.lexfile ? getLexFileVisual(node.lexfile) : null;
                        const depth = Math.max(1, nodeState.depth ?? 1);
                        const indentPx = (depth - 1) * 24 + 8;
                        return isBranch ? (
                          <TreeView.BranchControl
                            py="1"
                            pe="2"
                            style={{ paddingInlineStart: `${indentPx}px` }}
                            borderRadius="md"
                            _hover={{ bg: "gray.850" }}
                            transition="background 0.15s ease"
                            gap="2"
                            alignItems="flex-start"
                          >
                            <Box pt="0.5">
                              <TreeView.BranchTrigger>
                                <TreeView.BranchIndicator asChild>
                                  <LuChevronRight size={13} color="#A0AEC0" />
                                </TreeView.BranchIndicator>
                              </TreeView.BranchTrigger>
                            </Box>
                            <Box flex="1" minW="0">
                              <HStack gap="1.5" align="center" flexWrap="wrap">
                                {node.relation && (
                                  <Badge
                                    size="xs"
                                    variant="surface"
                                    colorPalette={getRelationPalette(node.relation)}
                                    borderRadius="sm"
                                  >
                                    {formatRelationLabel(node.relation)}
                                  </Badge>
                                )}
                                {posVis && (
                                  <Badge
                                    size="xs"
                                    variant="subtle"
                                    colorPalette={posVis.palette}
                                    borderRadius="full"
                                    px="1.5"
                                    py="0.5"
                                    display="inline-flex"
                                    alignItems="center"
                                    gap="1"
                                  >
                                    {posVis.icon}
                                    <Text as="span">{posVis.label}</Text>
                                  </Badge>
                                )}
                                {lexVis && (
                                  <Badge
                                    size="xs"
                                    variant="subtle"
                                    colorPalette={lexVis.palette}
                                    borderRadius="md"
                                    px="1.5"
                                    py="0.5"
                                    display="inline-flex"
                                    alignItems="center"
                                    gap="1"
                                  >
                                    {lexVis.icon}
                                    <Text as="span">{lexVis.label}</Text>
                                  </Badge>
                                )}
                                <Text
                                  fontSize="xs"
                                  fontWeight="semibold"
                                  color="blue.200"
                                  cursor="pointer"
                                  _hover={{ color: "blue.100", textDecoration: "underline" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onInspectWord(node.primaryWord);
                                  }}
                                  title={`Click to inspect "${node.primaryWord}"`}
                                >
                                  {node.primaryWord}
                                </Text>
                                {node.word !== node.primaryWord && (
                                  <Text fontSize="2xs" color="gray.500" lineClamp={1}>
                                    ({node.word.replace(node.primaryWord, "").replace(/^[,\s]+/, "")})
                                  </Text>
                                )}
                                {onReplaceWord && node.primaryWord && (
                                  <IconButton
                                    size="2xs"
                                    variant="ghost"
                                    color="gray.500"
                                    _hover={{ color: "teal.300", bg: "gray.800" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onReplaceWord(node.primaryWord);
                                    }}
                                    title={`Replace active word with "${node.primaryWord}"`}
                                    aria-label="Replace word"
                                    ml="auto"
                                    w="16px"
                                    h="16px"
                                    minW="16px"
                                  >
                                    <LuReplace size={10} />
                                  </IconButton>
                                )}
                              </HStack>
                              {node.definition && (
                                <Text fontSize="2xs" color="gray.400" fontStyle="italic" lineClamp={2} mt="0.5">
                                  "{node.definition}"
                                </Text>
                              )}
                            </Box>
                          </TreeView.BranchControl>
                        ) : (
                          <TreeView.Item
                            py="1"
                            pe="2"
                            style={{ paddingInlineStart: `${indentPx}px` }}
                            borderRadius="md"
                            _hover={{ bg: "gray.850" }}
                            transition="background 0.15s ease"
                            gap="2"
                            alignItems="flex-start"
                          >
                            <Box w="13px" pt="0.5" display="flex" justifyContent="center">
                              {posVis ? (
                                <Box color={`${posVis.palette}.400`} display="flex" alignItems="center">
                                  {posVis.icon}
                                </Box>
                              ) : (
                                <LuGitBranch size={11} color="#4FD1C5" />
                              )}
                            </Box>
                            <Box flex="1" minW="0">
                              <HStack gap="1.5" align="center" flexWrap="wrap">
                                {node.relation && (
                                  <Badge
                                    size="xs"
                                    variant="surface"
                                    colorPalette={getRelationPalette(node.relation)}
                                    borderRadius="sm"
                                  >
                                    {formatRelationLabel(node.relation)}
                                  </Badge>
                                )}
                                {posVis && (
                                  <Badge
                                    size="xs"
                                    variant="subtle"
                                    colorPalette={posVis.palette}
                                    borderRadius="full"
                                    px="1.5"
                                    py="0.5"
                                    display="inline-flex"
                                    alignItems="center"
                                    gap="1"
                                  >
                                    {posVis.icon}
                                    <Text as="span">{posVis.label}</Text>
                                  </Badge>
                                )}
                                {lexVis && (
                                  <Badge
                                    size="xs"
                                    variant="subtle"
                                    colorPalette={lexVis.palette}
                                    borderRadius="md"
                                    px="1.5"
                                    py="0.5"
                                    display="inline-flex"
                                    alignItems="center"
                                    gap="1"
                                  >
                                    {lexVis.icon}
                                    <Text as="span">{lexVis.label}</Text>
                                  </Badge>
                                )}
                                <Text
                                  fontSize="xs"
                                  fontWeight="medium"
                                  color="gray.200"
                                  cursor="pointer"
                                  _hover={{ color: "blue.300", textDecoration: "underline" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onInspectWord(node.primaryWord);
                                  }}
                                  title={`Click to inspect "${node.primaryWord}"`}
                                >
                                  {node.primaryWord}
                                </Text>
                                {node.word !== node.primaryWord && (
                                  <Text fontSize="2xs" color="gray.500" lineClamp={1}>
                                    ({node.word.replace(node.primaryWord, "").replace(/^[,\s]+/, "")})
                                  </Text>
                                )}
                                {onReplaceWord && node.primaryWord && (
                                  <IconButton
                                    size="2xs"
                                    variant="ghost"
                                    color="gray.500"
                                    _hover={{ color: "teal.300", bg: "gray.800" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onReplaceWord(node.primaryWord);
                                    }}
                                    title={`Replace active word with "${node.primaryWord}"`}
                                    aria-label="Replace word"
                                    ml="auto"
                                    w="16px"
                                    h="16px"
                                    minW="16px"
                                  >
                                    <LuReplace size={10} />
                                  </IconButton>
                                )}
                              </HStack>
                              {node.definition && (
                                <Text fontSize="2xs" color="gray.400" fontStyle="italic" lineClamp={2} mt="0.5">
                                  "{node.definition}"
                                </Text>
                              )}
                            </Box>
                          </TreeView.Item>
                        );
                      }}
                    />
                  </TreeView.Tree>
                </TreeView.Root>
              ) : (
                <Box
                  as="pre"
                  p="3"
                  bg="gray.950"
                  borderRadius="md"
                  fontSize="xs"
                  fontFamily="monospace"
                  color="blue.100"
                  lineHeight="1.5"
                  overflowX="auto"
                  whiteSpace="pre"
                  borderWidth="1px"
                  borderColor="gray.800"
                >
                  {hierarchyTree}
                </Box>
              )
            ) : (
              <EmptyState.Root size="sm">
                <EmptyState.Content>
                  <EmptyState.Indicator>
                    <LuNetwork size={20} />
                  </EmptyState.Indicator>
                  <VStack textAlign="center">
                    <EmptyState.Title>No Expansion Tree</EmptyState.Title>
                    <EmptyState.Description>
                      No hypernym hierarchy available for this word.
                    </EmptyState.Description>
                  </VStack>
                </EmptyState.Content>
              </EmptyState.Root>
            )}
          </PanelScrollArea>
        </Tabs.Content>

        {/* Similarity Calculator */}
        <Tabs.Content value="similarity" flex="1" p="0" minH="0" display="flex" flexDirection="column">
          <PanelScrollArea p="3">
            <Text fontSize="2xs" fontWeight="bold" color="purple.300" textTransform="uppercase" mb="2">
              Semantic Distance & Similarity
            </Text>
            <VStack align="stretch" gap="3">
              <Text fontSize="xs" color="gray.400">
                Compare semantic distance between <strong style={{ color: "#63B3ED" }}>"{word}"</strong> and:
              </Text>
              <Group attached w="full">
                <Input
                  size="sm"
                  variant="outline"
                  borderColor="gray.700"
                  bg="gray.950"
                  _focus={{ borderColor: "blue.500", zIndex: 1 }}
                  placeholder="e.g. canine, wolf, bank"
                  value={compareWord}
                  onChange={(e) => setCompareWord(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCalculateSimilarity();
                  }}
                />
                <Button
                  size="sm"
                  variant="solid"
                  colorPalette="blue"
                  onClick={handleCalculateSimilarity}
                  loading={simLoading}
                  px="4"
                  flexShrink={0}
                >
                  <LuTrendingUp size={13} />
                  Compare
                </Button>
              </Group>

              {simResult && (
                <Box p="3" bg="gray.850" borderRadius="lg" borderWidth="1px" borderColor="purple.700">
                  <Stat.Root>
                    <Stat.Label fontSize="2xs" color="gray.400">{simResult.metric} Metric</Stat.Label>
                    <HStack justify="space-between" mt="1">
                      <Stat.ValueText fontSize="xl" fontWeight="bold" color="purple.200">
                        {(simResult.score * 100).toFixed(1)}%
                      </Stat.ValueText>
                      <Badge size="sm" variant="surface" colorPalette="purple">
                        {simResult.score > 0.7 ? "High Similarity" : simResult.score > 0.4 ? "Moderate" : "Low Similarity"}
                      </Badge>
                    </HStack>
                    <Text fontSize="2xs" color="gray.450" mt="1.5">
                      Subsumption depth in WordNet hypernym ontology.
                    </Text>
                  </Stat.Root>
                </Box>
              )}
            </VStack>
          </PanelScrollArea>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};
