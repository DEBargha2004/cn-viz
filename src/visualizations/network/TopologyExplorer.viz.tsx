import { useState, useEffect, useRef, useId } from "react";
import { type VizMeta } from "../types";
import { useAppStore } from "../../state/appStore";
import {
  ShieldCheck,
  AlertTriangle,
  Cable,
  CheckCircle2,
  XCircle,
  HardDrive,
  Info,
  Layers,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  ArrowRight,
} from "lucide-react";

export const vizMeta: VizMeta = {
  key: "network-topology-explorer",
  title: "Network Topology Explorer",
  category: "network",
  renderer: "svg",
  animated: false,
  params: [
    {
      key: "topology",
      type: "select",
      label: "Topology",
      default: "star",
      options: [
        { label: "Star (Central Hub)", value: "star" },
        { label: "Mesh (Fully Connected)", value: "mesh" },
        { label: "Bus (Shared Backbone)", value: "bus" },
        { label: "Ring (Circular Loop)", value: "ring" },
        { label: "Hybrid (Star-of-Buses)", value: "hybrid" },
      ],
    },
    {
      key: "nodeCount",
      type: "number",
      label: "Number of Stations",
      default: 5,
      min: 3,
      max: 8,
      step: 1,
    },
    {
      key: "simulatedFault",
      type: "select",
      label: "Simulated Fault / Disruption",
      default: "none",
      options: [
        { label: "None (Healthy Network)", value: "none" },
        { label: "Station 2 Failed", value: "station-2" },
        { label: "Central Core / Backbone Cut", value: "core-cut" },
      ],
    },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

interface NodeDef {
  id: number;
  label: string;
  x: number;
  y: number;
  isHub?: boolean;
  branchIdx?: number;
}

interface EdgeDef {
  from: number;
  to: number;
  id: string;
}

interface HopStep {
  id: number;
  x: number;
  y: number;
  title: string;
  desc: string;
  status: "ok" | "fault";
}

export default function TopologyExplorer({ values }: Props) {
  const topology =
    (values.topology as "mesh" | "star" | "bus" | "ring" | "hybrid") || "star";
  const nodeCount = Math.min(8, Math.max(3, Number(values.nodeCount ?? 5)));
  const simulatedFault =
    (values.simulatedFault as "none" | "station-2" | "core-cut") || "none";

  const globalSpeed = useAppStore((state) => state.globalSpeedMultiplier) || 1;

  // SVG Unique IDs for filters and gradients
  const rawId = useId();
  const filterGlowId = `glow-${rawId.replace(/:/g, "")}`;
  const gradientPacketId = `grad-packet-${rawId.replace(/:/g, "")}`;

  // Interactive selection: Source station & Target station
  const [sourceNodeId, setSourceNodeId] = useState<number>(1);
  const [targetNodeId, setTargetNodeId] = useState<number>(3);
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);

  // Playback animation state
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronize target node if nodeCount changes and target exceeds bounds
  useEffect(() => {
    const minNode = 1;
    const maxNode = nodeCount;

    if (sourceNodeId > maxNode || sourceNodeId < minNode) {
      setSourceNodeId(minNode);
    }
    if (
      targetNodeId > maxNode ||
      targetNodeId < minNode ||
      targetNodeId === sourceNodeId
    ) {
      const nextTarget = (sourceNodeId % maxNode) + 1;
      setTargetNodeId(nextTarget === sourceNodeId ? minNode : nextTarget);
    }
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [nodeCount, topology, sourceNodeId, targetNodeId, simulatedFault]);

  // Handle station click to toggle Source / Target selection
  const handleNodeClick = (nodeId: number, isHub?: boolean) => {
    if (isHub) return;
    if (nodeId === sourceNodeId) {
      const nextSource = (sourceNodeId % nodeCount) + 1;
      setSourceNodeId(nextSource);
    } else {
      setTargetNodeId(nodeId);
    }
  };

  // Spacious SVG dimensions with downward vertical shift
  const width = 760;
  const height = 400;
  const cx = width / 2; // 380
  const cy = 205;
  const R = nodeCount >= 7 ? 120 : 130;

  // Dynamic node sizing based on nodeCount to prevent overlap
  const w = isNaN(nodeCount)
    ? 74
    : nodeCount >= 7
      ? 62
      : nodeCount >= 5
        ? 68
        : 74;
  const h = isNaN(nodeCount)
    ? 44
    : nodeCount >= 7
      ? 38
      : nodeCount >= 5
        ? 42
        : 44;

  // Nodes & Edges generation
  const nodes: NodeDef[] = [];
  const edges: EdgeDef[] = [];

  if (topology === "mesh") {
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i * 2 * Math.PI) / nodeCount - Math.PI / 2;
      nodes.push({
        id: i + 1,
        label: `Station ${i + 1}`,
        x: cx + R * Math.cos(angle),
        y: cy + R * Math.sin(angle),
      });
    }
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        edges.push({ from: i + 1, to: j + 1, id: `e-${i + 1}-${j + 1}` });
      }
    }
  } else if (topology === "star") {
    nodes.push({ id: 0, label: "CENTRAL HUB", x: cx, y: cy, isHub: true });
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i * 2 * Math.PI) / nodeCount - Math.PI / 2;
      const sId = i + 1;
      const starR = R * (nodeCount >= 7 ? 1.15 : 1.2);
      nodes.push({
        id: sId,
        label: `Station ${sId}`,
        x: cx + starR * Math.cos(angle),
        y: cy + starR * Math.sin(angle),
      });
      edges.push({ from: 0, to: sId, id: `e-hub-${sId}` });
    }
  } else if (topology === "bus") {
    const backboneY = cy;
    const startX = 100;
    const endX = 660;
    const spacing = nodeCount > 1 ? (endX - startX) / (nodeCount - 1) : 0;

    for (let i = 0; i < nodeCount; i++) {
      const x = startX + i * spacing;
      const isTop = i % 2 === 0;
      const y = isTop ? backboneY - 80 : backboneY + 80;
      nodes.push({ id: i + 1, label: `Station ${i + 1}`, x, y });
    }
  } else if (topology === "ring") {
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i * 2 * Math.PI) / nodeCount - Math.PI / 2;
      nodes.push({
        id: i + 1,
        label: `Station ${i + 1}`,
        x: cx + R * Math.cos(angle),
        y: cy + R * Math.sin(angle),
      });
    }
    for (let i = 0; i < nodeCount; i++) {
      const fromId = i + 1;
      const toId = ((i + 1) % nodeCount) + 1;
      edges.push({ from: fromId, to: toId, id: `e-${fromId}-${toId}` });
    }
  } else if (topology === "hybrid") {
    nodes.push({ id: 0, label: "MAIN SWITCH", x: cx, y: cy - 25, isHub: true });

    let stationIdCounter = 1;
    const branchCounts = [
      Math.floor(nodeCount / 3) + (nodeCount % 3 > 0 ? 1 : 0),
      Math.floor(nodeCount / 3) + (nodeCount % 3 > 1 ? 1 : 0),
      Math.floor(nodeCount / 3),
    ];

    const branch1Span = 200;
    for (let k = 0; k < branchCounts[0]; k++) {
      const t = branchCounts[0] > 1 ? k / (branchCounts[0] - 1) : 0.5;
      const sId = stationIdCounter++;
      nodes.push({
        id: sId,
        label: `Station ${sId}`,
        x: cx - 70 - t * branch1Span,
        y: cy - 145,
        branchIdx: 0,
      });
    }

    const branch2Span = 200;
    for (let k = 0; k < branchCounts[1]; k++) {
      const t = branchCounts[1] > 1 ? k / (branchCounts[1] - 1) : 0.5;
      const sId = stationIdCounter++;
      nodes.push({
        id: sId,
        label: `Station ${sId}`,
        x: cx + 70 + t * branch2Span,
        y: cy - 145,
        branchIdx: 1,
      });
    }

    const branch3Span = 90;
    for (let k = 0; k < branchCounts[2]; k++) {
      const t = branchCounts[2] > 1 ? k / (branchCounts[2] - 1) : 0.5;
      const sId = stationIdCounter++;
      nodes.push({
        id: sId,
        label: `Station ${sId}`,
        x: cx - (k % 2 === 0 ? 95 : -95),
        y: cy + 55 + t * branch3Span,
        branchIdx: 2,
      });
    }
  }

  const getBranchIndex = (id: number) => {
    const node = nodes.find((n) => n.id === id);
    return node?.branchIdx ?? -1;
  };

  const isNodeFaulted = (id: number, isHub?: boolean) => {
    if (simulatedFault === "station-2" && id === 2) return true;
    if (simulatedFault === "core-cut") {
      if (isHub) return true;
    }
    return false;
  };

  const isEdgeFaulted = (from: number, to: number) => {
    if (simulatedFault === "station-2" && (from === 2 || to === 2)) return true;
    if (simulatedFault === "core-cut") {
      if (from === 0 || to === 0) return true;
      if (
        topology === "ring" &&
        ((from === 2 && to === 3) || (from === 3 && to === 2))
      )
        return true;
      if (
        topology === "bus" &&
        ((from === 2 && to === 3) || (from === 3 && to === 2))
      )
        return true;
    }
    return false;
  };

  // DYNAMIC HOP STEP GENERATION ENGINE
  const steps: HopStep[] = (() => {
    const srcNode = nodes.find((n) => n.id === sourceNodeId);
    const tgtNode = nodes.find((n) => n.id === targetNodeId);
    const hubNode = nodes.find((n) => n.isHub);

    if (!srcNode || !tgtNode) return [];

    const hopList: HopStep[] = [];

    // Step 0: Frame Creation
    hopList.push({
      id: 0,
      x: srcNode.x,
      y: srcNode.y,
      title: `1. Transmit Frame from Station ${sourceNodeId}`,
      desc: `Station ${sourceNodeId} formats the data packet with destination address Station ${targetNodeId}.`,
      status: "ok",
    });

    if (simulatedFault === "station-2" && sourceNodeId === 2) {
      hopList.push({
        id: 1,
        x: srcNode.x,
        y: srcNode.y,
        title: `2. Station ${sourceNodeId} Down — Transmission Failed!`,
        desc: `Station ${sourceNodeId} is experiencing hardware failure. Cannot send data frames onto media.`,
        status: "fault",
      });
      return hopList;
    }

    if (topology === "star" && hubNode) {
      if (simulatedFault === "core-cut") {
        hopList.push({
          id: 1,
          x: hubNode.x,
          y: hubNode.y,
          title: `2. Central Hub Failure — Transmission Severed!`,
          desc: `The Central Hub is offline. Packet cannot be routed to Station ${targetNodeId}.`,
          status: "fault",
        });
      } else {
        hopList.push({
          id: 1,
          x: hubNode.x,
          y: hubNode.y,
          title: `2. Frame Ingress at Central Hub`,
          desc: `Central Hub receives packet from Station ${sourceNodeId} on Port ${sourceNodeId} and inspects header.`,
          status: "ok",
        });

        if (simulatedFault === "station-2" && targetNodeId === 2) {
          hopList.push({
            id: 2,
            x: tgtNode.x,
            y: tgtNode.y,
            title: `3. Station ${targetNodeId} Down — Frame Unreachable!`,
            desc: `Central Hub forwards frame to Port ${targetNodeId}, but Station ${targetNodeId} is powered off.`,
            status: "fault",
          });
        } else {
          hopList.push({
            id: 2,
            x: tgtNode.x,
            y: tgtNode.y,
            title: `3. Frame Delivered to Station ${targetNodeId}`,
            desc: `Station ${targetNodeId} receives frame from Central Hub, validates CRC checksum, and accepts packet!`,
            status: "ok",
          });
        }
      }
    } else if (topology === "mesh") {
      if (simulatedFault === "station-2" && targetNodeId === 2) {
        hopList.push({
          id: 1,
          x: tgtNode.x,
          y: tgtNode.y,
          title: `2. Station ${targetNodeId} Down — Direct Mesh Link Failed!`,
          desc: `Direct point-to-point link reaches Station ${targetNodeId}, but target station is offline.`,
          status: "fault",
        });
      } else {
        hopList.push({
          id: 1,
          x: tgtNode.x,
          y: tgtNode.y,
          title: `2. Direct Point-to-Point Delivery to Station ${targetNodeId}`,
          desc: `Frame travels across dedicated mesh cable. Station ${targetNodeId} accepts packet immediately!`,
          status: "ok",
        });
      }
    } else if (topology === "bus") {
      const backboneY = cy;
      hopList.push({
        id: 1,
        x: srcNode.x,
        y: backboneY,
        title: `2. Signal Enters Bus Backbone Tap`,
        desc: `Station ${sourceNodeId} injects electrical signal into the shared coaxial bus cable.`,
        status: "ok",
      });

      const cutBoundary = Math.floor(nodeCount / 2);
      const srcSide = sourceNodeId <= cutBoundary;
      const tgtSide = targetNodeId <= cutBoundary;

      if (simulatedFault === "core-cut" && srcSide !== tgtSide) {
        hopList.push({
          id: 2,
          x: (srcNode.x + tgtNode.x) / 2,
          y: backboneY,
          title: `3. Bus Cut — Signal Terminated!`,
          desc: `The coaxial backbone is severed. Signal collides with broken cable end and dissipates.`,
          status: "fault",
        });
      } else if (simulatedFault === "station-2" && targetNodeId === 2) {
        hopList.push({
          id: 2,
          x: tgtNode.x,
          y: backboneY,
          title: `3. Signal Reaches Station ${targetNodeId} Tap`,
          desc: `Signal travels along bus to Station ${targetNodeId}'s BNC T-connector.`,
          status: "ok",
        });
        hopList.push({
          id: 3,
          x: tgtNode.x,
          y: tgtNode.y,
          title: `4. Station ${targetNodeId} Down — Frame Dropped!`,
          desc: `Station ${targetNodeId} is powered off and cannot acknowledge the frame.`,
          status: "fault",
        });
      } else {
        hopList.push({
          id: 2,
          x: tgtNode.x,
          y: backboneY,
          title: `3. Signal Propagates to Station ${targetNodeId} Tap`,
          desc: `Broadcast signal travels along coaxial bus to Station ${targetNodeId}'s tap.`,
          status: "ok",
        });
        hopList.push({
          id: 3,
          x: tgtNode.x,
          y: tgtNode.y,
          title: `4. Frame Accepted by Station ${targetNodeId}`,
          desc: `Station ${targetNodeId} recognizes its MAC address and copies the frame into memory.`,
          status: "ok",
        });
      }
    } else if (topology === "ring") {
      const N = nodeCount;
      const cwNodes: number[] = [];
      let curr = sourceNodeId;
      while (curr !== targetNodeId) {
        cwNodes.push(curr);
        curr = (curr % N) + 1;
      }
      cwNodes.push(targetNodeId);

      const ccwNodes: number[] = [];
      curr = sourceNodeId;
      while (curr !== targetNodeId) {
        ccwNodes.push(curr);
        curr = ((curr - 2 + N) % N) + 1;
      }
      ccwNodes.push(targetNodeId);

      const checkPathValid = (nodeSeq: number[]) => {
        for (let i = 0; i < nodeSeq.length - 1; i++) {
          const u = nodeSeq[i];
          const v = nodeSeq[i + 1];
          if (isEdgeFaulted(u, v) || isNodeFaulted(u) || isNodeFaulted(v))
            return false;
        }
        return true;
      };

      const cwValid = checkPathValid(cwNodes);
      const ccwValid = checkPathValid(ccwNodes);

      let selectedSeq: number[] = [];
      let isBlocked = false;

      if (cwValid && ccwValid) {
        selectedSeq = cwNodes.length <= ccwNodes.length ? cwNodes : ccwNodes;
      } else if (cwValid) {
        selectedSeq = cwNodes;
      } else if (ccwValid) {
        selectedSeq = ccwNodes;
      } else {
        selectedSeq = cwNodes;
        isBlocked = true;
      }

      for (let i = 1; i < selectedSeq.length; i++) {
        const stepNode = nodes.find((n) => n.id === selectedSeq[i]);
        if (!stepNode) continue;

        if (
          isBlocked &&
          (isNodeFaulted(selectedSeq[i]) ||
            isEdgeFaulted(selectedSeq[i - 1], selectedSeq[i]))
        ) {
          hopList.push({
            id: i,
            x: stepNode.x,
            y: stepNode.y,
            title: `${i + 1}. Ring Severed at Station ${selectedSeq[i]}!`,
            desc: `The circular loop is broken. Token and data frames cannot complete the ring circuit.`,
            status: "fault",
          });
          break;
        } else {
          hopList.push({
            id: i,
            x: stepNode.x,
            y: stepNode.y,
            title: `${i + 1}. Hop to Station ${selectedSeq[i]}${selectedSeq[i] === targetNodeId ? " (Target Destination)" : " (Repeat & Forward)"}`,
            desc:
              selectedSeq[i] === targetNodeId
                ? `Station ${targetNodeId} receives the token frame, matches MAC address, and accepts packet!`
                : `Station ${selectedSeq[i]} inspects frame address, confirms it is not target, and retransmits down ring.`,
            status: "ok",
          });
        }
      }
    } else if (topology === "hybrid" && hubNode) {
      const srcBranch = getBranchIndex(sourceNodeId);
      const tgtBranch = getBranchIndex(targetNodeId);
      const busY = cy - 80;

      if (srcBranch === tgtBranch) {
        // Same branch intra-bus transmission
        if (srcBranch === 2) {
          hopList.push({
            id: 1,
            x: cx,
            y: srcNode.y,
            title: `2. Enters Local Bus Tap`,
            desc: `Signal drops from Station ${sourceNodeId} onto Branch 3 bus bar.`,
            status: "ok",
          });
          hopList.push({
            id: 2,
            x: cx,
            y: tgtNode.y,
            title: `3. Propagates along Bus to Station ${targetNodeId} Tap`,
            desc: `Signal travels vertically along Branch 3 bus line.`,
            status: "ok",
          });
        } else {
          hopList.push({
            id: 1,
            x: srcNode.x,
            y: busY,
            title: `2. Enters Local Bus Tap`,
            desc: `Signal drops from Station ${sourceNodeId} onto Branch ${srcBranch + 1} upper bus bar.`,
            status: "ok",
          });
          hopList.push({
            id: 2,
            x: tgtNode.x,
            y: busY,
            title: `3. Propagates along Bus to Station ${targetNodeId} Tap`,
            desc: `Signal travels horizontally along local bus segment.`,
            status: "ok",
          });
        }

        if (simulatedFault === "station-2" && targetNodeId === 2) {
          hopList.push({
            id: 3,
            x: tgtNode.x,
            y: tgtNode.y,
            title: `4. Station ${targetNodeId} Down — Frame Dropped!`,
            desc: `Signal reaches Station ${targetNodeId} drop, but target station is offline.`,
            status: "fault",
          });
        } else {
          hopList.push({
            id: 3,
            x: tgtNode.x,
            y: tgtNode.y,
            title: `4. Delivered to Station ${targetNodeId}`,
            desc: `Station ${targetNodeId} receives frame from local bus segment and accepts packet!`,
            status: "ok",
          });
        }
      } else {
        // Inter-branch transmission via Main Switch
        // Hop to Source Bus Tap
        if (srcBranch === 0 || srcBranch === 1) {
          const trunkX = srcBranch === 0 ? cx - 70 : cx + 70;
          hopList.push({
            id: 1,
            x: srcNode.x,
            y: busY,
            title: `2. Enters Branch ${srcBranch + 1} Bus Tap`,
            desc: `Signal drops from Station ${sourceNodeId} onto local bus bar.`,
            status: "ok",
          });
          hopList.push({
            id: 2,
            x: trunkX,
            y: busY,
            title: `3. Reaches Trunk Junction`,
            desc: `Signal travels along bus bar to dedicated trunk connection.`,
            status: "ok",
          });
        } else {
          hopList.push({
            id: 1,
            x: cx,
            y: srcNode.y,
            title: `2. Enters Branch 3 Bus Tap`,
            desc: `Signal enters bottom bus bar.`,
            status: "ok",
          });
        }

        // Hop to Main Switch
        if (simulatedFault === "core-cut") {
          hopList.push({
            id: hopList.length,
            x: hubNode.x,
            y: hubNode.y,
            title: `${hopList.length + 1}. Main Switch Failure — Inter-Branch Trunk Severed!`,
            desc: `Main Switch is offline. Frame cannot cross from Branch ${srcBranch + 1} to Branch ${tgtBranch + 1}.`,
            status: "fault",
          });
        } else {
          hopList.push({
            id: hopList.length,
            x: hubNode.x,
            y: hubNode.y,
            title: `${hopList.length + 1}. Frame Forwarded through Main Switch`,
            desc: `Main Switch inspects destination address and routes frame across branch trunks.`,
            status: "ok",
          });

          // Hop from Switch to Target Bus
          if (tgtBranch === 0 || tgtBranch === 1) {
            const tgtTrunkX = tgtBranch === 0 ? cx - 70 : cx + 70;
            hopList.push({
              id: hopList.length,
              x: tgtTrunkX,
              y: busY,
              title: `${hopList.length + 1}. Enters Target Branch ${tgtBranch + 1} Bus`,
              desc: `Packet enters Branch ${tgtBranch + 1} trunk line.`,
              status: "ok",
            });
            hopList.push({
              id: hopList.length,
              x: tgtNode.x,
              y: busY,
              title: `${hopList.length + 1}. Propagates to Station ${targetNodeId} Tap`,
              desc: `Signal travels along local bus bar to target drop tap.`,
              status: "ok",
            });
          } else {
            hopList.push({
              id: hopList.length,
              x: cx,
              y: tgtNode.y,
              title: `${hopList.length + 1}. Propagates to Station ${targetNodeId} Tap`,
              desc: `Signal travels along Branch 3 bus bar to target drop tap.`,
              status: "ok",
            });
          }

          // Final Hop to Target Station
          if (simulatedFault === "station-2" && targetNodeId === 2) {
            hopList.push({
              id: hopList.length,
              x: tgtNode.x,
              y: tgtNode.y,
              title: `${hopList.length + 1}. Station ${targetNodeId} Down — Delivery Failed!`,
              desc: `Frame reaches Station ${targetNodeId}'s bus drop, but station is offline.`,
              status: "fault",
            });
          } else {
            hopList.push({
              id: hopList.length,
              x: tgtNode.x,
              y: tgtNode.y,
              title: `${hopList.length + 1}. Delivered to Station ${targetNodeId}`,
              desc: `Station ${targetNodeId} receives frame from local bus segment and accepts packet!`,
              status: "ok",
            });
          }
        }
      }
    }

    return hopList;
  })();

  const activeStep = steps[currentStepIndex] || {
    id: 0,
    x: nodes[0]?.x ?? 195,
    y: nodes[0]?.y ?? 154,
    title: "Ready",
    desc: "Select Source and Target stations to begin packet simulation.",
    status: "ok",
  };

  // Auto-advance step animation timer
  useEffect(() => {
    if (!isPlaying) {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      return;
    }

    const intervalMs = 1400 / globalSpeed;

    stepTimerRef.current = setTimeout(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    };
  }, [isPlaying, currentStepIndex, steps.length, globalSpeed]);

  const handleTogglePlay = () => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleStepPrev = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
  };

  // Topological Info Data
  const getTopologyInfo = () => {
    switch (topology) {
      case "mesh": {
        const cables = (nodeCount * (nodeCount - 1)) / 2;
        return {
          title: "Mesh Topology",
          cables: `${cables} Direct Links`,
          cableFormula: `N × (N - 1) / 2 = ${nodeCount} × ${nodeCount - 1} / 2 = ${cables}`,
          ports: `${nodeCount - 1} Ports per Station`,
          spof: "No Single Point of Failure (Fully Redundant)",
          spofRisk: "low",
          reliability: "Extremely High (Dedicated fault isolation)",
          cost: "Very High (Exponential cabling complexity)",
          pros: [
            "No traffic congestion between stations",
            "Private & secure point-to-point links",
            "Individual cable failures leave other stations active",
          ],
          cons: [
            "High amount of cabling & expensive I/O ports",
            "Complex physical installation & maintenance",
          ],
        };
      }
      case "star": {
        return {
          title: "Star Topology",
          cables: `${nodeCount} Dedicated Drop Cables`,
          cableFormula: `N = ${nodeCount} Cables`,
          ports: `1 Port per Station, ${nodeCount} Ports on Central Switch`,
          spof: "Central Hub / Switch is Single Point of Failure",
          spofRisk: "high",
          reliability: "Moderate (Station failure does not affect others)",
          cost: "Moderate (Depends on central switch cost)",
          pros: [
            "Easy to install, reconfigure, and scale",
            "Fault isolation: broken link only affects 1 station",
            "Centralized network management",
          ],
          cons: [
            "If Central Hub fails, the whole network stops",
            "Requires more cable length than bus topology",
          ],
        };
      }
      case "bus": {
        return {
          title: "Bus Topology",
          cables: `1 Shared Backbone + ${nodeCount} Drop Lines`,
          cableFormula: `1 Main Line + ${nodeCount} Drop Lines`,
          ports: "1 NIC Port per Station",
          spof: "Shared Backbone Cable is Single Point of Failure",
          spofRisk: "high",
          reliability: "Low (Backbone break disables entire network)",
          cost: "Very Low (Minimal cabling required)",
          pros: [
            "Inexpensive & easy to setup for small networks",
            "Requires significantly less cable than star or mesh",
          ],
          cons: [
            "Backbone fault shuts down all communication",
            "Heavy traffic causes collisions & performance loss",
            "Difficult to isolate individual faults",
          ],
        };
      }
      case "ring": {
        return {
          title: "Ring Topology",
          cables: `${nodeCount} Point-to-Point Links in a loop`,
          cableFormula: `N = ${nodeCount} Ring Segment Links`,
          ports: "2 Ports per Station (Rx & Tx)",
          spof: "Any single station or link break interrupts the ring",
          spofRisk: "high",
          reliability: "Low (Unidirectional ring vulnerability)",
          cost: "Moderate",
          pros: [
            "Structured token-passing data flow (no collisions)",
            "Equal network access for all connected stations",
          ],
          cons: [
            "A single break anywhere disables the whole network",
            "Reconfiguring or moving devices disrupts traffic",
          ],
        };
      }
      case "hybrid": {
        return {
          title: "Hybrid Topology (Star-of-Buses)",
          cables: `${nodeCount} Drop Lines + Sub-segment trunks`,
          cableFormula: "Star backbone connecting local bus trunks",
          ports: "1 per Station + Trunk Switch Interfaces",
          spof: "Main Central Switch (Branch buses stay isolated)",
          spofRisk: "medium",
          reliability: "High (Failures confined to local bus segment)",
          cost: "High (Requires central switches & bus taps)",
          pros: [
            "Extremely scalable and flexible for enterprise networks",
            "Localizes network faults to individual sub-branches",
          ],
          cons: [
            "Complex design, configuration, and troubleshooting",
            "Higher hardware investment for switch units",
          ],
        };
      }
    }
  };

  const info = getTopologyInfo();

  return (
    <div className="flex flex-col space-y-4 p-4 sm:p-6 bg-card rounded-2xl border shadow-sm font-sans select-none">
      {/* PLAYBACK CONTROL HUD TOOLBAR */}
      <div className="bg-card border border-border rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
            title={isPlaying ? "Pause Animation" : "Play Animation"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleStepPrev}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 disabled:opacity-40 transition-colors"
            title="Previous Hop"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={handleStepNext}
            disabled={currentStepIndex === steps.length - 1}
            className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 disabled:opacity-40 transition-colors"
            title="Next Hop"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
            title="Reset Hop Animation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-border mx-1" />

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="font-extrabold text-foreground">
              Hop {currentStepIndex + 1}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{steps.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Src: St. {sourceNodeId}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/20">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span>Tgt: St. {targetNodeId}</span>
          </div>
        </div>
      </div>

      {/* LARGE RESPONSIVE SVG CANVAS CONTAINER */}
      <div className="w-full border rounded-2xl bg-slate-100/80 dark:bg-slate-950/90 relative overflow-hidden shadow-inner border-slate-200/80 dark:border-slate-800 min-h-[200px] sm:min-h-[360px] md:min-h-[420px] flex items-center justify-center p-2 sm:p-4 transition-colors duration-300">
        {/* Ambient Grid Background */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-25 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto text-foreground relative z-10 select-none"
        >
          <defs>
            {/* Glow filter for active links and nodes */}
            <filter
              id={filterGlowId}
              filterUnits="userSpaceOnUse"
              x="-50"
              y="-50"
              width="860"
              height="500"
            >
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Dynamic Packet Gradient */}
            <radialGradient id={gradientPacketId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.85" />
            </radialGradient>
          </defs>

          {/* BUS BACKBONE & TERMINATORS */}
          {topology === "bus" && (
            <g>
              <line
                x1="80"
                y1={cy}
                x2="680"
                y2={cy}
                stroke="currentColor"
                strokeWidth={
                  simulatedFault === "core-cut"
                    ? "3.5"
                    : hoveredNodeId !== null
                      ? "5"
                      : "4.5"
                }
                strokeDasharray={
                  simulatedFault === "core-cut" ? "8 6" : undefined
                }
                className={`transition-all duration-300 ${
                  simulatedFault === "core-cut"
                    ? "text-rose-500"
                    : hoveredNodeId !== null
                      ? "text-sky-500 dark:text-sky-300"
                      : "text-slate-400 dark:text-slate-600"
                }`}
                filter={
                  hoveredNodeId !== null && simulatedFault !== "core-cut"
                    ? `url(#${filterGlowId})`
                    : undefined
                }
              />

              {/* Left Terminator */}
              <g transform={`translate(65, ${cy - 16})`}>
                <rect
                  x="0"
                  y="0"
                  width="15"
                  height="32"
                  rx="3"
                  className="fill-slate-100 dark:fill-slate-900 stroke-slate-400 dark:stroke-slate-600 stroke-2"
                />
                <text
                  x="7.5"
                  y="20"
                  textAnchor="middle"
                  className="fill-slate-600 dark:fill-slate-400 text-[9px] font-bold"
                >
                  T
                </text>
              </g>

              {/* Right Terminator */}
              <g transform={`translate(680, ${cy - 16})`}>
                <rect
                  x="0"
                  y="0"
                  width="15"
                  height="32"
                  rx="3"
                  className="fill-slate-100 dark:fill-slate-900 stroke-slate-400 dark:stroke-slate-600 stroke-2"
                />
                <text
                  x="7.5"
                  y="20"
                  textAnchor="middle"
                  className="fill-slate-600 dark:fill-slate-400 text-[9px] font-bold"
                >
                  T
                </text>
              </g>

              {/* Backbone Severed Indicator */}
              {simulatedFault === "core-cut" && (
                <g transform={`translate(${cx - 15}, ${cy - 15})`}>
                  <circle
                    cx="15"
                    cy="15"
                    r="15"
                    className="fill-rose-100 dark:fill-rose-950 stroke-rose-500 stroke-2"
                  />
                  <text
                    x="15"
                    y="20"
                    textAnchor="middle"
                    className="fill-rose-600 dark:fill-rose-400 font-black text-xs"
                  >
                    ⚡
                  </text>
                </g>
              )}
            </g>
          )}

          {/* HYBRID STAR BACKBONE BUS LINES */}
          {topology === "hybrid" &&
            (() => {
              const hoveredBranch =
                hoveredNodeId !== null ? getBranchIndex(hoveredNodeId) : -1;
              const isHoveredSwitch = hoveredNodeId === 0;
              const isB0Hovered = hoveredBranch === 0 || isHoveredSwitch;
              const isB1Hovered = hoveredBranch === 1 || isHoveredSwitch;
              const isB2Hovered = hoveredBranch === 2 || isHoveredSwitch;
              const isCoreFaulted = simulatedFault === "core-cut";

              return (
                <g>
                  {/* Left Branch Bus Dedicated Trunk */}
                  <line
                    x1={cx - 70}
                    y1={cy - 80}
                    x2={cx}
                    y2={cy - 25}
                    stroke="currentColor"
                    strokeWidth={isB0Hovered ? "4.5" : "3.5"}
                    strokeDasharray={isCoreFaulted ? "6 4" : undefined}
                    className={`transition-all duration-300 ${
                      isCoreFaulted
                        ? isB0Hovered
                          ? "text-rose-500 dark:text-rose-400"
                          : "text-rose-500/80 dark:text-rose-400/80"
                        : isB0Hovered
                          ? "text-sky-500 dark:text-sky-300"
                          : "text-slate-400 dark:text-slate-600"
                    }`}
                    filter={isB0Hovered ? `url(#${filterGlowId})` : undefined}
                  />

                  {/* Right Branch Bus Dedicated Trunk */}
                  <line
                    x1={cx + 70}
                    y1={cy - 80}
                    x2={cx}
                    y2={cy - 25}
                    stroke="currentColor"
                    strokeWidth={isB1Hovered ? "4.5" : "3.5"}
                    strokeDasharray={isCoreFaulted ? "6 4" : undefined}
                    className={`transition-all duration-300 ${
                      isCoreFaulted
                        ? isB1Hovered
                          ? "text-rose-500 dark:text-rose-400"
                          : "text-rose-500/80 dark:text-rose-400/80"
                        : isB1Hovered
                          ? "text-sky-500 dark:text-sky-300"
                          : "text-slate-400 dark:text-slate-600"
                    }`}
                    filter={isB1Hovered ? `url(#${filterGlowId})` : undefined}
                  />

                  {/* Left Upper Branch Bus Bar */}
                  <line
                    x1={cx - 70}
                    y1={cy - 80}
                    x2={cx - 290}
                    y2={cy - 80}
                    stroke="currentColor"
                    strokeWidth={isB0Hovered ? "5.5" : "4.5"}
                    className={`transition-all duration-300 ${
                      isB0Hovered
                        ? "text-sky-500 dark:text-sky-300"
                        : "text-slate-400 dark:text-slate-600"
                    }`}
                    filter={isB0Hovered ? `url(#${filterGlowId})` : undefined}
                  />

                  {/* Right Upper Branch Bus Bar */}
                  <line
                    x1={cx + 70}
                    y1={cy - 80}
                    x2={cx + 290}
                    y2={cy - 80}
                    stroke="currentColor"
                    strokeWidth={isB1Hovered ? "5.5" : "4.5"}
                    className={`transition-all duration-300 ${
                      isB1Hovered
                        ? "text-sky-500 dark:text-sky-300"
                        : "text-slate-400 dark:text-slate-600"
                    }`}
                    filter={isB1Hovered ? `url(#${filterGlowId})` : undefined}
                  />

                  {/* Bottom Branch Bus Trunk */}
                  <line
                    x1={cx}
                    y1={cy - 25}
                    x2={cx}
                    y2={cy + 155}
                    stroke="currentColor"
                    strokeWidth={isB2Hovered ? "5.5" : "4.5"}
                    strokeDasharray={isCoreFaulted ? "6 4" : undefined}
                    className={`transition-all duration-300 ${
                      isCoreFaulted
                        ? isB2Hovered
                          ? "text-rose-500 dark:text-rose-400"
                          : "text-rose-500/80 dark:text-rose-400/80"
                        : isB2Hovered
                          ? "text-sky-500 dark:text-sky-300"
                          : "text-slate-400 dark:text-slate-600"
                    }`}
                    filter={isB2Hovered ? `url(#${filterGlowId})` : undefined}
                  />
                </g>
              );
            })()}

          {/* RENDER EDGE LINKS */}
          {edges.map((e) => {
            const fn = nodes.find((n) => n.id === e.from);
            const tn = nodes.find((n) => n.id === e.to);
            if (!fn || !tn) return null;

            const isFaulted = isEdgeFaulted(e.from, e.to);
            const isHovered =
              hoveredNodeId === e.from || hoveredNodeId === e.to;

            return (
              <line
                key={e.id}
                x1={fn.x}
                y1={fn.y}
                x2={tn.x}
                y2={tn.y}
                stroke="currentColor"
                strokeWidth={isHovered ? 2.8 : 1.8}
                strokeDasharray={isFaulted ? "6 4" : undefined}
                className={`transition-all duration-300 ${
                  isFaulted
                    ? isHovered
                      ? "text-rose-500 dark:text-rose-400"
                      : "text-rose-500/80 dark:text-rose-400/80"
                    : isHovered
                      ? "text-sky-500 dark:text-sky-300"
                      : "text-slate-300 dark:text-slate-700"
                }`}
                filter={isHovered ? `url(#${filterGlowId})` : undefined}
              />
            );
          })}

          {/* BUS DROP LINES & TAPS */}
          {topology === "bus" &&
            nodes.map((n) => {
              const isFaulted = isNodeFaulted(n.id);
              const isSelected = n.id === sourceNodeId || n.id === targetNodeId;
              const isHovered = hoveredNodeId === n.id;
              return (
                <g key={`bus-tap-${n.id}`}>
                  <line
                    x1={n.x}
                    y1={n.y}
                    x2={n.x}
                    y2={cy}
                    stroke="currentColor"
                    strokeWidth={isHovered ? "2.8" : isSelected ? "2.5" : "1.5"}
                    strokeDasharray={isFaulted ? "4 3" : undefined}
                    className={`transition-all duration-300 ${
                      isFaulted
                        ? "text-rose-500 dark:text-rose-400"
                        : isHovered
                          ? "text-sky-500 dark:text-sky-300"
                          : isSelected
                            ? "text-cyan-500 dark:text-cyan-400"
                            : "text-slate-400 dark:text-slate-600"
                    }`}
                    filter={
                      isHovered && !isFaulted
                        ? `url(#${filterGlowId})`
                        : undefined
                    }
                  />
                  <circle
                    cx={n.x}
                    cy={cy}
                    r="5"
                    className={`transition-all duration-300 ${
                      isFaulted
                        ? "fill-rose-500 stroke-slate-200 dark:stroke-slate-900"
                        : isHovered
                          ? "fill-sky-500 dark:fill-sky-400 stroke-sky-200 dark:stroke-sky-900"
                          : isSelected
                            ? "fill-cyan-500 dark:fill-cyan-400 stroke-cyan-200 dark:stroke-cyan-900"
                            : "fill-indigo-500 dark:fill-indigo-400 stroke-white dark:stroke-slate-900"
                    }`}
                  />
                </g>
              );
            })}

          {/* HYBRID DROP LINES & TAPS */}
          {topology === "hybrid" &&
            nodes
              .filter((n) => !n.isHub)
              .map((n) => {
                let dropX = n.x;
                let dropY = cy - 80;
                if (n.branchIdx === 2) {
                  dropX = cx;
                  dropY = n.y;
                }
                const isSelected =
                  n.id === sourceNodeId || n.id === targetNodeId;
                const isHovered = hoveredNodeId === n.id;
                const isFaulted = isNodeFaulted(n.id);

                return (
                  <g key={`hybrid-tap-${n.id}`}>
                    <line
                      x1={n.x}
                      y1={n.y}
                      x2={dropX}
                      y2={dropY}
                      stroke="currentColor"
                      strokeWidth={
                        isHovered ? "2.8" : isSelected ? "2.5" : "1.8"
                      }
                      strokeDasharray={isFaulted ? "4 3" : undefined}
                      className={`transition-all duration-300 ${
                        isFaulted
                          ? "text-rose-500 dark:text-rose-400"
                          : isHovered
                            ? "text-sky-500 dark:text-sky-300"
                            : isSelected
                              ? "text-cyan-500 dark:text-cyan-400"
                              : "text-slate-400 dark:text-slate-600"
                      }`}
                      filter={
                        isHovered && !isFaulted
                          ? `url(#${filterGlowId})`
                          : undefined
                      }
                    />
                    <circle
                      cx={dropX}
                      cy={dropY}
                      r="4.5"
                      className={`transition-all duration-300 ${
                        isFaulted
                          ? "fill-rose-500 dark:fill-rose-400"
                          : isHovered
                            ? "fill-sky-500 dark:fill-sky-400"
                            : isSelected
                              ? "fill-cyan-500 dark:fill-cyan-400"
                              : "fill-indigo-500 dark:fill-indigo-400"
                      }`}
                    />
                  </g>
                );
              })}

          {/* RENDER NODE GRAPHICS */}
          {nodes.map((n) => {
            const isHub = n.isHub;
            const isFaulted = isNodeFaulted(n.id, isHub);
            const isSource = n.id === sourceNodeId;
            const isTarget = n.id === targetNodeId;
            const isHovered = hoveredNodeId === n.id;

            const nodeW = isHub ? 92 : w;
            const nodeH = isHub ? 48 : h;

            return (
              <g
                key={n.id}
                transform={`translate(${n.x - nodeW / 2}, ${n.y - nodeH / 2})`}
                className="cursor-pointer group"
                onClick={() => handleNodeClick(n.id, isHub)}
                onMouseEnter={() => setHoveredNodeId(n.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              >
                {/* Outer glow ring for Source / Target / Hovered */}
                {(isSource || isTarget || isHovered) && !isHub && (
                  <rect
                    x="-4"
                    y="-4"
                    width={nodeW + 8}
                    height={nodeH + 8}
                    rx="10"
                    className={`fill-none stroke-2 transition-all duration-300 ${
                      isSource
                        ? "stroke-emerald-500 dark:stroke-emerald-400"
                        : isTarget
                          ? "stroke-cyan-500 dark:stroke-cyan-400"
                          : "stroke-sky-400/60"
                    }`}
                    filter={`url(#${filterGlowId})`}
                  />
                )}

                {/* Main Node Box */}
                <rect
                  width={nodeW}
                  height={nodeH}
                  rx={isHub ? 10 : 8}
                  className={`stroke-2 transition-all duration-300 ${
                    isFaulted
                      ? "fill-rose-50 dark:fill-rose-950/90 stroke-rose-500 text-rose-800 dark:text-rose-200"
                      : isHub
                        ? "fill-amber-50 dark:fill-amber-950/90 stroke-amber-500 text-amber-900 dark:text-amber-100 shadow-sm"
                        : isSource
                          ? "fill-emerald-50 dark:fill-emerald-950/90 stroke-emerald-500 dark:stroke-emerald-400 text-emerald-900 dark:text-emerald-100 shadow-sm"
                          : isTarget
                            ? "fill-cyan-50 dark:fill-cyan-950/90 stroke-cyan-500 dark:stroke-cyan-400 text-cyan-900 dark:text-cyan-100 shadow-sm"
                            : isHovered
                              ? "fill-slate-100 dark:fill-slate-800 stroke-sky-400 text-slate-900 dark:text-slate-100"
                              : "fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 text-slate-800 dark:text-slate-200 shadow-xs"
                  }`}
                />

                {/* Device Icon Graphic */}
                {isHub ? (
                  <g
                    transform="translate(8, 14)"
                    className="text-amber-500 dark:text-amber-400"
                  >
                    <rect
                      x="0"
                      y="0"
                      width="22"
                      height="18"
                      rx="3"
                      className="fill-amber-500/10 dark:fill-amber-500/20 stroke-amber-500 dark:stroke-amber-400 stroke-1"
                    />
                    <circle
                      cx="5.5"
                      cy="5"
                      r="1.5"
                      className="fill-emerald-500 dark:fill-emerald-400"
                    />
                    <circle
                      cx="11"
                      cy="5"
                      r="1.5"
                      className="fill-emerald-500 dark:fill-emerald-400 animate-pulse"
                    />
                    <circle
                      cx="16.5"
                      cy="5"
                      r="1.5"
                      className="fill-cyan-500 dark:fill-cyan-400"
                    />
                    <line
                      x1="4"
                      y1="12"
                      x2="18"
                      y2="12"
                      className="stroke-amber-400 dark:stroke-amber-300 stroke-2 stroke-dasharray-[2,2]"
                    />
                  </g>
                ) : (
                  <g
                    transform={`translate(${nodeW < 68 ? 5 : 8}, ${nodeH < 42 ? 9 : 12})`}
                  >
                    <rect
                      x="0"
                      y="0"
                      width="16"
                      height="12"
                      rx="2"
                      className={`stroke-1 ${
                        isFaulted
                          ? "fill-rose-100 dark:fill-rose-900 stroke-rose-500"
                          : isSource
                            ? "fill-emerald-100 dark:fill-emerald-900 stroke-emerald-500"
                            : isTarget
                              ? "fill-cyan-100 dark:fill-cyan-900 stroke-cyan-500"
                              : "fill-slate-200 dark:fill-slate-800 stroke-slate-400 dark:stroke-slate-600"
                      }`}
                    />
                    <rect
                      x="5"
                      y="12"
                      width="6"
                      height="3"
                      className="fill-slate-400 dark:fill-slate-600"
                    />
                    <rect
                      x="3"
                      y="15"
                      width="10"
                      height="2"
                      rx="1"
                      className="fill-slate-300 dark:fill-slate-500"
                    />
                  </g>
                )}

                {/* Node Label Text */}
                <text
                  x={isHub ? 55 : nodeW < 68 ? nodeW / 2 + 8 : nodeW / 2 + 10}
                  y={nodeH / 2 + 3}
                  textAnchor="middle"
                  className={`text-[10px] font-bold tracking-tight select-none ${
                    isFaulted
                      ? "fill-rose-700 dark:fill-rose-300 font-extrabold"
                      : isSource
                        ? "fill-emerald-700 dark:fill-emerald-300 font-extrabold"
                        : isTarget
                          ? "fill-cyan-700 dark:fill-cyan-300 font-extrabold"
                          : "fill-slate-800 dark:fill-slate-200"
                  }`}
                >
                  {isHub
                    ? n.label.includes("SWITCH")
                      ? "SWITCH"
                      : "HUB"
                    : `St. ${n.id}`}
                </text>

                {/* Node Badge Status Indicator */}
                {!isHub && (
                  <g transform={`translate(${nodeW - 9}, 9)`}>
                    <circle
                      cx="0"
                      cy="0"
                      r="4"
                      className={
                        isFaulted
                          ? "fill-rose-500 animate-ping"
                          : isSource
                            ? "fill-emerald-500 dark:fill-emerald-400"
                            : isTarget
                              ? "fill-cyan-500 dark:fill-cyan-400"
                              : "fill-emerald-500/80"
                      }
                      style={{
                        transformOrigin: "center",
                        transformBox: "fill-box",
                      }}
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r="3.5"
                      className={
                        isFaulted
                          ? "fill-rose-500"
                          : isSource
                            ? "fill-emerald-500 dark:fill-emerald-400"
                            : isTarget
                              ? "fill-cyan-500 dark:fill-cyan-400"
                              : "fill-emerald-500 dark:fill-emerald-400"
                      }
                    />
                  </g>
                )}
              </g>
            );
          })}

          {/* DYNAMIC ANIMATED PACKET GRAPHIC */}
          <g
            transform={`translate(${activeStep.x}, ${activeStep.y})`}
            className="transition-transform duration-300 ease-out"
          >
            <circle
              r="12"
              className={
                activeStep.status === "fault"
                  ? "fill-rose-500/30 stroke-rose-500 stroke-2 animate-ping"
                  : "fill-cyan-400/30 stroke-cyan-400 stroke-2"
              }
              filter={`url(#${filterGlowId})`}
            />
            <circle
              r="6"
              className={
                activeStep.status === "fault"
                  ? "fill-rose-500 dark:fill-rose-400"
                  : "fill-cyan-400 dark:fill-cyan-300"
              }
            />
            <circle r="2.5" className="fill-white" />
          </g>
        </svg>

        {/* FAULT OVERLAY WARNING AT BOTTOM RIGHT */}
        {simulatedFault !== "none" && (
          <div className="absolute bottom-3 right-3 bg-rose-50 dark:bg-rose-950/90 backdrop-blur-md border border-rose-300 dark:border-rose-800 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs text-rose-800 dark:text-rose-200 shadow-md z-20">
            <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
            <span className="font-semibold">Fault Active:</span>{" "}
            {simulatedFault === "station-2" ? "Station 2 Down" : "Core Cut"}
          </div>
        )}
      </div>

      {/* ACTIVE STEP DESCRIPTION CARD & TOPOLOGICAL METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
        {/* ACTIVE HOP STEP CARD */}
        <div
          className={`p-4 rounded-xl border shadow-xs space-y-1.5 md:col-span-1 transition-colors ${
            activeStep.status === "fault"
              ? "bg-rose-500/10 border-rose-500/50 text-rose-800 dark:text-rose-200"
              : "bg-card border-primary/40"
          }`}
        >
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-1.5">
            {activeStep.status === "fault" ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <Info className="w-3.5 h-3.5 text-cyan-500" />
            )}
            <span>Hop Status</span>
          </span>
          <div className="text-xs font-bold text-foreground">
            {activeStep.title}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {activeStep.desc}
          </p>
          <div className="pt-1 text-[10.5px] font-mono text-primary font-semibold flex items-center gap-1">
            <ArrowRight className="w-3 h-3" />
            <span>
              {activeStep.status === "fault"
                ? "Transmission Terminated"
                : "Forwarding Next Hop"}
            </span>
          </div>
        </div>

        {/* CARD 1: CABLES & PORTS */}
        <div className="p-4 rounded-xl bg-muted/20 border space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Cable width={16} height={16} className="text-indigo-500" />{" "}
              Cables & Interfaces
            </h5>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border shrink-0">
              N = {nodeCount}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Total Cables Required:
              </span>
              <span className="font-bold text-foreground text-sm">
                {info.cables}
              </span>
              <div className="text-[10px] font-mono text-muted-foreground bg-background p-1.5 rounded border mt-1">
                {info.cableFormula}
              </div>
            </div>

            <div className="pt-1 border-t">
              <span className="text-muted-foreground block text-[11px]">
                Station I/O Ports:
              </span>
              <span className="font-semibold text-foreground">
                {info.ports}
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: FAULT TOLERANCE & SPOF */}
        <div className="p-4 rounded-xl bg-muted/20 border space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Layers width={16} height={16} className="text-indigo-500" />{" "}
              Reliability & SPOF
            </h5>
            <Sparkles width={14} height={14} className="text-amber-500" />
          </div>

          <div className="space-y-2 text-xs">
            <div
              className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                info.spofRisk === "high"
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300"
                  : info.spofRisk === "medium"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
              }`}
            >
              {info.spofRisk === "high" ? (
                <AlertTriangle
                  width={16}
                  height={16}
                  className="text-rose-500 shrink-0 mt-0.5"
                />
              ) : (
                <ShieldCheck
                  width={16}
                  height={16}
                  className="text-emerald-500 shrink-0 mt-0.5"
                />
              )}
              <div>
                <span className="block text-[10px] uppercase font-bold tracking-wider">
                  Single Point of Failure:
                </span>
                <span className="font-semibold text-[11px]">{info.spof}</span>
              </div>
            </div>

            <div className="pt-1">
              <span className="text-muted-foreground block text-[11px]">
                Overall Reliability:
              </span>
              <span className="font-medium text-foreground">
                {info.reliability}
              </span>
            </div>
          </div>
        </div>

        {/* CARD 3: ADVANTAGES & DISADVANTAGES */}
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-2 flex items-center gap-1.5">
            <HardDrive width={16} height={16} className="text-indigo-500" />{" "}
            Trade-offs Summary
          </h5>

          <div className="space-y-2 text-xs">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-lg">
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 width={14} height={14} /> Key Advantages
              </div>
              <ul className="list-disc list-inside text-[11px] space-y-0.5 pt-0.5 pl-0.5">
                {info.pros.slice(0, 2).map((pro, idx) => (
                  <li key={idx}>{pro}</li>
                ))}
              </ul>
            </div>

            <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 rounded-lg">
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400">
                <XCircle width={14} height={14} /> Key Disadvantages
              </div>
              <ul className="list-disc list-inside text-[11px] space-y-0.5 pt-0.5 pl-0.5">
                {info.cons.slice(0, 2).map((con, idx) => (
                  <li key={idx}>{con}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
