import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Input,
  Badge,
  Spinner,
  IconButton,
  Button,
} from "@chakra-ui/react";
import ForceGraph2D from "react-force-graph-2d";
import {
  LuSearch,
  LuZoomIn,
  LuZoomOut,
  LuMaximize2,
  LuNetwork,
  LuBookOpen,
} from "react-icons/lu";
import { GetDocumentWordGraph } from "@bindings/github.com/raitucarp/gown-ted/service/lexicalservice.js";
import { PosBadge } from "@atoms";

interface GraphExplorerViewProps {
  documentText: string;
  onInspectWord?: (word: string) => void;
}

const RELATION_COLORS: Record<string, string> = {
  synonym: "#34d399",   // emerald
  hypernym: "#60a5fa",  // sky blue
  hyponym: "#a78bfa",   // violet
  antonym: "#f87171",   // red
  meronym: "#fbbf24",   // amber
  coordinate: "#fb923c", // orange
  domain: "#38bdf8",    // cyan
  definition: "#e879f9", // fuchsia
  path: "#818cf8",      // indigo
};

export const GraphExplorerView: React.FC<GraphExplorerViewProps> = ({
  documentText,
  onInspectWord,
}) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordFilter, setWordFilter] = useState("");
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: [],
  });
  const [loading, setLoading] = useState(false);
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // 1. Extract unique words from document
  const extractedWords = useMemo(() => {
    if (!documentText) return [];
    const matches = documentText.match(/\b[a-zA-Z]{2,}\b/g) || [];
    const counts: Record<string, number> = {};
    for (const m of matches) {
      const w = m.toLowerCase();
      counts[w] = (counts[w] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
  }, [documentText]);

  // 2. Fetch WordNet relationship graph
  useEffect(() => {
    if (extractedWords.length === 0) {
      setGraphData({ nodes: [], links: [] });
      return;
    }
    let active = true;
    setLoading(true);

    const wordsList = extractedWords.map((w) => w.word);
    GetDocumentWordGraph(wordsList)
      .then((res: any) => {
        if (!active) return;
        const nodes = (res?.nodes || []).map((n: any) => ({
          ...n,
          is_document_word: n.is_document_word ?? (n.type === "word"),
          val: (n.is_document_word ?? (n.type === "word")) ? 3.5 : 2.2,
        }));
        const links = (res?.edges || []).map((e: any) => ({
          source: e.source,
          target: e.target,
          label: e.label,
          type: e.type,
          weight: e.weight || 1,
        }));
        setGraphData({ nodes, links });

        // Auto select first document word if none selected
        if (nodes.length > 0 && !selectedWord) {
          const firstDocWord = nodes.find((n: any) => n.is_document_word) || nodes[0];
          setSelectedWord(firstDocWord.id);
        }
      })
      .catch((err) => console.error("GetDocumentWordGraph error:", err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [extractedWords]);

  // 3. Track container dimensions for responsive canvas
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 800,
          height: containerRef.current.clientHeight || 600,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // 4. Center and zoom to node when selected
  useEffect(() => {
    if (!selectedWord || !fgRef.current) return;
    const node = graphData.nodes.find((n) => n.id === selectedWord);
    if (node && typeof node.x === "number" && typeof node.y === "number") {
      fgRef.current.centerAt(node.x, node.y, 600);
      fgRef.current.zoom(2.2, 600);
    }
  }, [selectedWord, graphData]);

  // Connected neighbors of selected word
  const connectedInfo = useMemo(() => {
    if (!selectedWord) return { neighborIds: new Set<string>(), connectedLinks: [] };
    const neighborIds = new Set<string>();
    const connectedLinks: any[] = [];

    for (const link of graphData.links) {
      const srcId = typeof link.source === "object" ? link.source.id : link.source;
      const tgtId = typeof link.target === "object" ? link.target.id : link.target;
      if (srcId === selectedWord) {
        neighborIds.add(tgtId);
        connectedLinks.push(link);
      } else if (tgtId === selectedWord) {
        neighborIds.add(srcId);
        connectedLinks.push(link);
      }
    }
    return { neighborIds, connectedLinks };
  }, [selectedWord, graphData]);

  // Filter word list in left sidebar
  const filteredWords = extractedWords.filter((w) =>
    w.word.toLowerCase().includes(wordFilter.toLowerCase().trim())
  );

  return (
    <HStack flex="1" h="100%" gap={0} alignItems="stretch" overflow="hidden" bg="gray.950">
      {/* 1. LEFT PANEL: Document Words List */}
      <Flex
        direction="column"
        w="280px"
        minW="250px"
        h="100%"
        borderRightWidth="1px"
        borderColor="gray.800"
        bg="gray.900"
        overflow="hidden"
      >
        <Box p="3" borderBottomWidth="1px" borderColor="gray.800">
          <HStack justify="space-between" mb="2">
            <HStack gap="1.5">
              <Box color="cyan.300">
                <LuNetwork size={16} />
              </Box>
              <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="cyan.300" letterSpacing="0.05em">
                Document Words
              </Text>
            </HStack>
            <Badge size="xs" variant="outline" colorPalette="cyan">
              {extractedWords.length} words
            </Badge>
          </HStack>

          <HStack
            bg="gray.950"
            borderRadius="md"
            px="2.5"
            py="1"
            borderWidth="1px"
            borderColor="gray.800"
          >
            <LuSearch size={14} color="gray" />
            <Input
              variant="flushed"
              size="xs"
              placeholder="Search document word..."
              value={wordFilter}
              onChange={(e) => setWordFilter(e.target.value)}
              border="none"
              _focus={{ outline: "none" }}
              color="gray.100"
            />
          </HStack>
        </Box>

        {/* Scrollable Word List */}
        <Box flex="1" overflowY="auto" p="1.5">
          {filteredWords.length === 0 ? (
            <Flex justify="center" align="center" h="150px" p="4" textAlign="center">
              <Text fontSize="xs" color="gray.400">
                No words in document. Write something in the editor to see its graph!
              </Text>
            </Flex>
          ) : (
            filteredWords.map(({ word, count }) => {
              const isSelected = selectedWord === word;
              const isConnected = connectedInfo.neighborIds.has(word);

              return (
                <HStack
                  key={word}
                  justify="space-between"
                  p="2"
                  my="1"
                  borderRadius="md"
                  cursor="pointer"
                  bg={
                    isSelected
                      ? "blue.900"
                      : isConnected
                      ? "whiteAlpha.150"
                      : "transparent"
                  }
                  borderWidth="1px"
                  borderColor={
                    isSelected
                      ? "blue.400"
                      : isConnected
                      ? "cyan.500"
                      : "transparent"
                  }
                  _hover={{
                    bg: isSelected ? "blue.850" : "whiteAlpha.100",
                  }}
                  onClick={() => setSelectedWord(word)}
                  transition="all 0.15s ease"
                >
                  <HStack gap="2">
                    {/* Glowing dot when selected */}
                    <Box
                      w="7px"
                      h="7px"
                      borderRadius="full"
                      bg={
                        isSelected
                          ? "cyan.300"
                          : isConnected
                          ? "emerald.400"
                          : "gray.600"
                      }
                      boxShadow={
                        isSelected
                          ? "0 0 8px #38bdf8"
                          : isConnected
                          ? "0 0 6px #34d399"
                          : "none"
                      }
                    />
                    <Text
                      fontSize="xs"
                      fontWeight={isSelected ? "bold" : "medium"}
                      color={
                        isSelected
                          ? "white"
                          : isConnected
                          ? "cyan.200"
                          : "gray.200"
                      }
                    >
                      {word}
                    </Text>
                  </HStack>

                  <Badge size="xs" variant="subtle" colorPalette={isSelected ? "blue" : "gray"}>
                    {count}x
                  </Badge>
                </HStack>
              );
            })
          )}
        </Box>
      </Flex>

      {/* 2. RIGHT PANEL: Interactive Force-Directed Word Graph */}
      <Flex direction="column" flex="1" h="100%" position="relative" ref={containerRef} overflow="hidden">
        {/* Top Floating Controls & Legend */}
        <Flex
          position="absolute"
          top="3"
          left="3"
          right="3"
          justify="space-between"
          align="center"
          zIndex="10"
          pointerEvents="none"
        >
          {/* Relation Badges Legend */}
          <HStack
            bg="gray.900"
            borderWidth="1px"
            borderColor="gray.800"
            borderRadius="md"
            px="3"
            py="1.5"
            gap="2"
            pointerEvents="auto"
            boxShadow="md"
          >
            <Text fontSize="xs" color="gray.400" fontWeight="bold">
              RELATIONS:
            </Text>
            {Object.entries(RELATION_COLORS).map(([rel, color]) => (
              <HStack key={rel} gap="1">
                <Box w="6px" h="6px" borderRadius="full" bg={color} />
                <Text fontSize="xs" color="gray.300" textTransform="capitalize">
                  {rel}
                </Text>
              </HStack>
            ))}
          </HStack>

          {/* Zoom / View Action Controls */}
          <HStack
            bg="gray.900"
            borderWidth="1px"
            borderColor="gray.800"
            borderRadius="md"
            p="1"
            gap="1"
            pointerEvents="auto"
            boxShadow="md"
          >
            <IconButton
              size="xs"
              variant="ghost"
              aria-label="Zoom In"
              title="Zoom In"
              color="gray.300"
              _hover={{ color: "white", bg: "whiteAlpha.100" }}
              onClick={() => {
                if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() * 1.3, 300);
              }}
            >
              <LuZoomIn size={14} />
            </IconButton>
            <IconButton
              size="xs"
              variant="ghost"
              aria-label="Zoom Out"
              title="Zoom Out"
              color="gray.300"
              _hover={{ color: "white", bg: "whiteAlpha.100" }}
              onClick={() => {
                if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() / 1.3, 300);
              }}
            >
              <LuZoomOut size={14} />
            </IconButton>
            <IconButton
              size="xs"
              variant="ghost"
              aria-label="Fit Graph to Screen"
              title="Fit Graph to Screen"
              color="gray.300"
              _hover={{ color: "white", bg: "whiteAlpha.100" }}
              onClick={() => {
                if (fgRef.current) fgRef.current.zoomToFit(400, 40);
              }}
            >
              <LuMaximize2 size={14} />
            </IconButton>
          </HStack>
        </Flex>

        {/* Selected Word Info Card (Bottom Left Overlay) */}
        {selectedWord && (() => {
          const selectedNodeObj = graphData.nodes.find((n) => n.id === selectedWord);
          const isDoc = selectedNodeObj?.is_document_word ?? (selectedNodeObj?.type === "word");

          return (
            <Box
              position="absolute"
              bottom="4"
              left="4"
              zIndex="10"
              bg="gray.900"
              borderWidth="1px"
              borderColor={isDoc ? "blue.500" : "purple.500"}
              borderRadius="lg"
              p="3"
              maxW="380px"
              boxShadow="0 8px 30px rgba(0,0,0,0.7)"
            >
              <HStack justify="space-between" mb="1.5" gap="2">
                <HStack gap="2" flexWrap="wrap">
                  <Box
                    w="7px"
                    h="7px"
                    borderRadius="full"
                    bg={isDoc ? "cyan.300" : "purple.300"}
                    boxShadow={isDoc ? "0 0 8px #38bdf8" : "0 0 8px #c084fc"}
                  />
                  <Text fontSize="md" fontWeight="bold" color="white">
                    {selectedWord}
                  </Text>
                  <Badge
                    size="xs"
                    colorPalette={isDoc ? "cyan" : "purple"}
                    variant="surface"
                  >
                    {isDoc ? "Document Word" : "Intermediate Concept"}
                  </Badge>
                  {selectedNodeObj?.pos && (
                    <Badge size="xs" variant="outline" colorPalette="gray">
                      {selectedNodeObj.pos}
                    </Badge>
                  )}
                </HStack>
                {onInspectWord && isDoc && (
                  <Button
                    size="xs"
                    colorPalette="blue"
                    variant="subtle"
                    onClick={() => onInspectWord(selectedWord)}
                  >
                    <LuBookOpen size={12} />
                    Inspect Senses
                  </Button>
                )}
              </HStack>

              {selectedNodeObj?.definition && (
                <Text
                  fontSize="xs"
                  color="gray.300"
                  fontStyle="italic"
                  mb="2"
                  lineClamp={2}
                  bg="gray.950"
                  p="2"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="gray.800"
                >
                  "{selectedNodeObj.definition}"
                </Text>
              )}

              <Text fontSize="xs" color="gray.400" mb="1.5">
                Connected to {connectedInfo.neighborIds.size} path {connectedInfo.neighborIds.size === 1 ? "node" : "nodes"}:
              </Text>

              {connectedInfo.connectedLinks.length > 0 ? (
                <VStack align="stretch" gap="1" maxH="120px" overflowY="auto">
                  {connectedInfo.connectedLinks.map((link, idx) => {
                    const srcId = typeof link.source === "object" ? link.source.id : link.source;
                    const tgtId = typeof link.target === "object" ? link.target.id : link.target;
                    const otherWord = srcId === selectedWord ? tgtId : srcId;
                    const relColor = RELATION_COLORS[link.type] || "#94a3b8";

                    return (
                      <HStack
                        key={idx}
                        justify="space-between"
                        bg="gray.950"
                        p="1.5"
                        borderRadius="sm"
                        fontSize="xs"
                        cursor="pointer"
                        _hover={{ bg: "whiteAlpha.100" }}
                        onClick={() => setSelectedWord(otherWord)}
                      >
                        <Text color="gray.200" fontWeight="medium">
                          {otherWord}
                        </Text>
                        <Badge
                          size="xs"
                          variant="subtle"
                          style={{ color: relColor, borderColor: relColor }}
                        >
                          {link.label || link.type}
                        </Badge>
                      </HStack>
                    );
                  })}
                </VStack>
              ) : (
                <Text fontSize="xs" color="gray.400" fontStyle="italic">
                  No semantic path links found for this node.
                </Text>
              )}
            </Box>
          );
        })()}

        {/* Canvas Area */}
        {loading ? (
          <Flex justify="center" align="center" h="100%">
            <HStack gap="3" color="gray.300">
              <Spinner size="md" color="cyan.400" />
              <Text fontSize="sm">Traversing WordNet semantic paths...</Text>
            </HStack>
          </Flex>
        ) : graphData.nodes.length === 0 ? (
          <Flex justify="center" align="center" h="100%" direction="column" gap="3" color="gray.400">
            <LuNetwork size={48} />
            <Text fontSize="sm">Start typing words in the editor to view their WordNet graph!</Text>
          </Flex>
        ) : (
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            backgroundColor="#0b0d13"
            nodeId="id"
            nodeRelSize={2}
            nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D, globalScale: number) => {
              const scale = Math.max(0.25, globalScale);
              const clickRadius = 8 / scale;
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(node.x, node.y, clickRadius, 0, 2 * Math.PI, false);
              ctx.fill();
            }}
            onNodeClick={(node: any) => {
              setSelectedWord(node.id);
            }}
            onBackgroundClick={() => setSelectedWord(null)}
            nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
              const isSelected = selectedWord === node.id;
              const isNeighbor = connectedInfo.neighborIds.has(node.id);
              const isDoc = node.is_document_word ?? (node.type === "word");

              // Scale factor so dots & text stay consistently sized and crisp across zoom levels
              const scale = Math.max(0.25, globalScale);

              // 1. Node Dot Size (Titik: diameter ~4-7px on screen)
              const screenRadius = isSelected ? 3.5 : isDoc ? 2.6 : 1.8;
              const r = screenRadius / scale;

              ctx.save();

              // If another node is selected, dim non-connected nodes
              if (selectedWord && !isSelected && !isNeighbor) {
                ctx.globalAlpha = 0.2;
              }

              // Rendering Node as a Dot (Titik)
              if (isSelected) {
                ctx.shadowColor = "#38bdf8";
                ctx.shadowBlur = 6 / scale;

                // Delicate outer focus ring around the dot
                ctx.beginPath();
                ctx.arc(node.x, node.y, r + 2.2 / scale, 0, 2 * Math.PI, false);
                ctx.strokeStyle = "#38bdf8";
                ctx.lineWidth = 1.0 / scale;
                ctx.stroke();

                // Central bright dot
                ctx.beginPath();
                ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                ctx.fillStyle = "#ffffff";
                ctx.fill();
              } else if (isNeighbor) {
                ctx.shadowColor = isDoc ? "#34d399" : "#a78bfa";
                ctx.shadowBlur = 4 / scale;
                ctx.beginPath();
                ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                ctx.fillStyle = isDoc ? "#34d399" : "#c084fc";
                ctx.fill();
              } else {
                ctx.beginPath();
                ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                ctx.fillStyle = isDoc ? "#60a5fa" : "#94a3b8";
                ctx.fill();
              }

              // 2. Text Label beside Node (Titik)
              // Label text size is intentionally larger than the node dot (~10.5 - 13.5px on screen)
              const label = node.label || node.id;
              const showLabel = isDoc || isSelected || isNeighbor || globalScale >= 1.0 || !selectedWord;

              if (showLabel) {
                const screenFontSize = isSelected ? 13.5 : isDoc ? 11.5 : 10;
                const fontSize = screenFontSize / scale;

                ctx.font = `${isSelected ? "bold " : isDoc ? "600 " : "500 "}${fontSize}px Inter, sans-serif`;
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";

                const labelX = node.x + r + 3.5 / scale;
                const labelY = node.y;

                // High-contrast text shadow for readability
                ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
                ctx.shadowBlur = 3 / scale;
                ctx.fillStyle = isSelected
                  ? "#38bdf8"
                  : isNeighbor
                  ? (isDoc ? "#6ee7b7" : "#d8b4fe")
                  : isDoc
                  ? "#f8fafc"
                  : "#cbd5e1";

                ctx.fillText(label, labelX, labelY);
              }

              ctx.restore();
            }}
            linkWidth={(link: any) => {
              const srcId = typeof link.source === "object" ? link.source.id : link.source;
              const tgtId = typeof link.target === "object" ? link.target.id : link.target;
              if (selectedWord && (srcId === selectedWord || tgtId === selectedWord)) {
                return 1.8;
              }
              return 0.8;
            }}
            linkColor={(link: any) => {
              const srcId = typeof link.source === "object" ? link.source.id : link.source;
              const tgtId = typeof link.target === "object" ? link.target.id : link.target;
              const isSelectedConn = selectedWord && (srcId === selectedWord || tgtId === selectedWord);
              const baseColor = RELATION_COLORS[link.type] || "#64748b";

              if (selectedWord) {
                return isSelectedConn ? baseColor : "rgba(71, 85, 105, 0.12)";
              }
              return baseColor + "66";
            }}
            linkDirectionalArrowLength={3}
            linkDirectionalArrowRelPos={1}
            linkDirectionalParticles={(link: any) => {
              const srcId = typeof link.source === "object" ? link.source.id : link.source;
              const tgtId = typeof link.target === "object" ? link.target.id : link.target;
              return selectedWord && (srcId === selectedWord || tgtId === selectedWord) ? 2 : 0;
            }}
            linkDirectionalParticleWidth={1.5}
            linkDirectionalParticleSpeed={0.006}
            linkCanvasObjectMode={() => "after"}
            linkCanvasObject={(link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
              if (!link.source || !link.target) return;
              if (typeof link.source !== "object" || typeof link.target !== "object") return;
              if (typeof link.source.x !== "number" || typeof link.target.x !== "number") return;

              const srcId = link.source.id ?? link.source;
              const tgtId = link.target.id ?? link.target;
              const isSelectedConn = selectedWord ? (srcId === selectedWord || tgtId === selectedWord) : false;

              // If a node is selected, hide non-connected edge labels to avoid visual clutter
              if (selectedWord && !isSelectedConn) {
                return;
              }

              const relText = link.label || link.type || "";
              if (!relText) return;

              const startX = link.source.x;
              const startY = link.source.y;
              const endX = link.target.x;
              const endY = link.target.y;

              const scale = Math.max(0.25, globalScale);
              const screenFontSize = isSelectedConn ? 9.5 : 8;
              const fontSize = screenFontSize / scale;

              // Avoid drawing if the link is too short
              const linkLen = Math.hypot(endX - startX, endY - startY);
              const minLen = (relText.length * 5 + 12) / scale;
              if (linkLen < minLen) return;

              const midX = (startX + endX) / 2;
              const midY = (startY + endY) / 2;

              ctx.save();
              ctx.font = `600 ${fontSize}px Inter, sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";

              const textWidth = ctx.measureText(relText).width;
              const padX = 4 / scale;
              const padY = 2 / scale;
              const boxW = textWidth + padX * 2;
              const boxH = fontSize + padY * 2;

              const relColor = RELATION_COLORS[link.type] || "#94a3b8";

              // Edge label pill background
              ctx.fillStyle = "rgba(11, 13, 19, 0.9)";
              ctx.beginPath();
              if (typeof (ctx as any).roundRect === "function") {
                (ctx as any).roundRect(midX - boxW / 2, midY - boxH / 2, boxW, boxH, 3 / scale);
              } else {
                ctx.rect(midX - boxW / 2, midY - boxH / 2, boxW, boxH);
              }
              ctx.fill();

              // Subtle pill border with relation color
              ctx.strokeStyle = isSelectedConn ? relColor : relColor + "99";
              ctx.lineWidth = (isSelectedConn ? 1.0 : 0.7) / scale;
              ctx.stroke();

              // Label text
              ctx.fillStyle = isSelectedConn ? "#ffffff" : relColor;
              ctx.fillText(relText, midX, midY);

              ctx.restore();
            }}
            cooldownTicks={120}
          />
        )}
      </Flex>
    </HStack>
  );
};
