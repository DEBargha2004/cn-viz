import { useState, useEffect, useRef, useId } from 'react';
import { type VizMeta } from '../types';
import { useAppStore } from '../../state/appStore';
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
} from 'lucide-react';

export const vizMeta: VizMeta = {
  key: 'network-topology-explorer',
  title: 'Network Topology Explorer',
  category: 'network',
  renderer: 'svg',
  animated: true,
  params: [
    {
      key: 'topology',
      type: 'select',
      label: 'Topology',
      default: 'star',
      options: [
        { label: 'Star (Central Hub)', value: 'star' },
        { label: 'Mesh (Fully Connected)', value: 'mesh' },
        { label: 'Bus (Shared Backbone)', value: 'bus' },
        { label: 'Ring (Circular Loop)', value: 'ring' },
        { label: 'Hybrid (Star-of-Buses)', value: 'hybrid' },
      ],
    },
    {
      key: 'nodeCount',
      type: 'number',
      label: 'Number of Stations',
      default: 5,
      min: 3,
      max: 8,
      step: 1,
    },
    {
      key: 'simulatedFault',
      type: 'select',
      label: 'Simulated Fault / Disruption',
      default: 'none',
      options: [
        { label: 'None (Healthy Network)', value: 'none' },
        { label: 'Station 2 Failed', value: 'station-2' },
        { label: 'Central Core / Backbone Cut', value: 'core-cut' },
      ],
    },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
  isPlaying?: boolean;
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

export default function TopologyExplorer({ values, isPlaying = false }: Props) {
  const topology = (values.topology as 'mesh' | 'star' | 'bus' | 'ring' | 'hybrid') || 'star';
  const nodeCount = Math.min(8, Math.max(3, Number(values.nodeCount ?? 5)));
  const simulatedFault = (values.simulatedFault as 'none' | 'station-2' | 'core-cut') || 'none';

  const globalSpeedMultiplier = useAppStore((state) => state.globalSpeedMultiplier);

  // SVG Unique IDs for filters and gradients
  const rawId = useId();
  const filterGlowId = `glow-${rawId.replace(/:/g, '')}`;
  const gradientPacketId = `grad-packet-${rawId.replace(/:/g, '')}`;

  // Interactive selection: Source station & Target station
  const [sourceNodeId, setSourceNodeId] = useState<number>(1);
  const [targetNodeId, setTargetNodeId] = useState<number>(3);
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);

  // Synchronize target node if nodeCount changes and target exceeds bounds
  useEffect(() => {
    const minNode = 1;
    const maxNode = nodeCount;

    if (sourceNodeId > maxNode || sourceNodeId < minNode) {
      setSourceNodeId(minNode);
    }
    if (targetNodeId > maxNode || targetNodeId < minNode || targetNodeId === sourceNodeId) {
      const nextTarget = (sourceNodeId % maxNode) + 1;
      setTargetNodeId(nextTarget === sourceNodeId ? minNode : nextTarget);
    }
  }, [nodeCount, topology, sourceNodeId, targetNodeId]);

  // Handle station click to toggle Source / Target selection
  const handleNodeClick = (nodeId: number, isHub?: boolean) => {
    if (isHub) return; // Hub cannot be source/target station
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
  const cy = 205; // Shifted downward to give top nodes ample top margin below HUD
  const R = nodeCount >= 7 ? 120 : 130; // Radius for circular layouts

  // Dynamic node sizing based on nodeCount to prevent overlap
  const w = isNaN(nodeCount) ? 74 : nodeCount >= 7 ? 62 : nodeCount >= 5 ? 68 : 74;
  const h = isNaN(nodeCount) ? 44 : nodeCount >= 7 ? 38 : nodeCount >= 5 ? 42 : 44;

  // Nodes & Edges generation
  const nodes: NodeDef[] = [];
  const edges: EdgeDef[] = [];

  if (topology === 'mesh') {
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
  } else if (topology === 'star') {
    // Central Hub
    nodes.push({ id: 0, label: 'CENTRAL HUB', x: cx, y: cy, isHub: true });
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
  } else if (topology === 'bus') {
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
  } else if (topology === 'ring') {
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
  } else if (topology === 'hybrid') {
    // Star Backbone of Buses
    nodes.push({ id: 0, label: 'MAIN SWITCH', x: cx, y: cy - 25, isHub: true });

    let stationIdCounter = 1;
    const branchCounts = [
      Math.floor(nodeCount / 3) + (nodeCount % 3 > 0 ? 1 : 0),
      Math.floor(nodeCount / 3) + (nodeCount % 3 > 1 ? 1 : 0),
      Math.floor(nodeCount / 3),
    ];

    // Branch 1: Left Bus (y = cy - 80)
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
    // Branch 2: Right Bus (y = cy - 80)
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
    // Branch 3: Bottom Bus (x = cx)
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

  // Helper to get branch index for hybrid nodes
  const getBranchIndex = (id: number) => {
    const node = nodes.find((n) => n.id === id);
    return node?.branchIdx ?? -1;
  };

  // Determine node health state
  const isNodeFaulted = (id: number, isHub?: boolean) => {
    if (simulatedFault === 'station-2' && id === 2) return true;
    if (simulatedFault === 'core-cut') {
      if (isHub) return true;
    }
    return false;
  };

  // Determine link health state
  const isEdgeFaulted = (from: number, to: number) => {
    if (simulatedFault === 'station-2' && (from === 2 || to === 2)) return true;
    if (simulatedFault === 'core-cut') {
      if (from === 0 || to === 0) return true;
      if (topology === 'ring' && ((from === 2 && to === 3) || (from === 3 && to === 2))) return true;
      if (topology === 'bus' && ((from === 2 && to === 3) || (from === 3 && to === 2))) return true;
    }
    return false;
  };

  // Packet animation engine
  const packetRef = useRef<SVGGElement>(null);
  const isPlayingRef = useRef(isPlaying);
  const globalSpeedMultiplierRef = useRef(globalSpeedMultiplier);
  const animFrameIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const progressRef = useRef<number>(0);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    globalSpeedMultiplierRef.current = globalSpeedMultiplier;
  }, [globalSpeedMultiplier]);

  useEffect(() => {
    progressRef.current = 0;
    lastTimeRef.current = performance.now();

    const srcNode = nodes.find((n) => n.id === sourceNodeId);
    const tgtNode = nodes.find((n) => n.id === targetNodeId);
    const hubNode = nodes.find((n) => n.isHub);

    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const speed = isNaN(globalSpeedMultiplierRef.current) ? 1 : globalSpeedMultiplierRef.current;
      const baseRate = 0.45;
      const delta = isPlayingRef.current ? dt * baseRate * speed : 0;

      progressRef.current = (progressRef.current + delta) % 1;
      const p = progressRef.current;

      if (packetRef.current && srcNode && tgtNode) {
        let posX = srcNode.x;
        let posY = srcNode.y;

        // Accurate Reachability & Path Waypoint Engine for each topology under simulated faults
        let isPathBlocked = false;
        let polylineWaypoints: { x: number; y: number }[] = [];

        if (simulatedFault === 'station-2' && (sourceNodeId === 2 || targetNodeId === 2)) {
          isPathBlocked = true;
        } else if (simulatedFault === 'core-cut' && topology === 'star') {
          isPathBlocked = true; // Central Hub down
        } else if (topology === 'ring') {
          const N = nodeCount;
          // Clockwise node sequence
          const cwNodes: number[] = [];
          let curr = sourceNodeId;
          while (curr !== targetNodeId) {
            cwNodes.push(curr);
            curr = (curr % N) + 1;
          }
          cwNodes.push(targetNodeId);

          // Counter-clockwise node sequence
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
              if (isEdgeFaulted(u, v) || isNodeFaulted(u) || isNodeFaulted(v)) return false;
            }
            return true;
          };

          const cwValid = checkPathValid(cwNodes);
          const ccwValid = checkPathValid(ccwNodes);

          let selectedRingNodes: number[] = [];
          if (cwValid && ccwValid) {
            selectedRingNodes = cwNodes.length <= ccwNodes.length ? cwNodes : ccwNodes;
          } else if (cwValid) {
            selectedRingNodes = cwNodes;
          } else if (ccwValid) {
            selectedRingNodes = ccwNodes;
          } else {
            isPathBlocked = true;
          }

          if (!isPathBlocked) {
            polylineWaypoints = selectedRingNodes
              .map((id) => nodes.find((n) => n.id === id))
              .filter((n): n is NodeDef => Boolean(n))
              .map((n) => ({ x: n.x, y: n.y }));
          }
        } else if (topology === 'hybrid' && hubNode) {
          const srcBranch = getBranchIndex(sourceNodeId);
          const tgtBranch = getBranchIndex(targetNodeId);

          if (simulatedFault === 'core-cut' && srcBranch !== tgtBranch) {
            isPathBlocked = true; // Main switch down: inter-branch blocked
          } else if (simulatedFault === 'station-2' && (sourceNodeId === 2 || targetNodeId === 2)) {
            isPathBlocked = true;
          } else {
            const getWaypointsToSwitch = (n: NodeDef, branch: number) => {
              if (branch === 0) {
                // Left Upper Bus (y = cy - 80): Drop to (n.x, cy - 80) -> Along bus to (cx - 70, cy - 80) -> Direct trunk to Switch (cx - 25, cy - 25)
                return [
                  { x: n.x, y: n.y },
                  { x: n.x, y: cy - 80 },
                  { x: cx - 70, y: cy - 80 },
                  { x: cx - 25, y: cy - 25 },
                ];
              } else if (branch === 1) {
                // Right Upper Bus (y = cy - 80): Drop to (n.x, cy - 80) -> Along bus to (cx + 70, cy - 80) -> Direct trunk to Switch (cx + 25, cy - 25)
                return [
                  { x: n.x, y: n.y },
                  { x: n.x, y: cy - 80 },
                  { x: cx + 70, y: cy - 80 },
                  { x: cx + 25, y: cy - 25 },
                ];
              } else {
                // Bottom Bus (x = cx): Stations at x = cx +/- 95 -> Drop to Bus Bar at (cx, n.y) -> Up to Switch (cx, cy - 25)
                return [
                  { x: n.x, y: n.y },
                  { x: cx, y: n.y },
                  { x: cx, y: cy - 25 },
                ];
              }
            };

            if (srcBranch === tgtBranch) {
              if (srcBranch === 2) {
                polylineWaypoints = [
                  { x: srcNode.x, y: srcNode.y },
                  { x: cx, y: srcNode.y },
                  { x: cx, y: tgtNode.y },
                  { x: tgtNode.x, y: tgtNode.y },
                ];
              } else {
                const busY = cy - 80;
                polylineWaypoints = [
                  { x: srcNode.x, y: srcNode.y },
                  { x: srcNode.x, y: busY },
                  { x: tgtNode.x, y: busY },
                  { x: tgtNode.x, y: tgtNode.y },
                ];
              }
            } else {
              const srcPath = getWaypointsToSwitch(srcNode, srcBranch);
              const tgtPath = getWaypointsToSwitch(tgtNode, tgtBranch).slice().reverse();
              polylineWaypoints = [...srcPath, ...tgtPath];
            }
          }
        } else if (topology === 'bus') {
          const cutBoundary = Math.floor(nodeCount / 2);
          const srcSide = sourceNodeId <= cutBoundary;
          const tgtSide = targetNodeId <= cutBoundary;
          if (simulatedFault === 'core-cut' && srcSide !== tgtSide) {
            isPathBlocked = true;
          } else {
            const backboneY = cy;
            polylineWaypoints = [
              { x: srcNode.x, y: srcNode.y },
              { x: srcNode.x, y: backboneY },
              { x: tgtNode.x, y: backboneY },
              { x: tgtNode.x, y: tgtNode.y },
            ];
          }
        } else if (topology === 'star' && hubNode) {
          polylineWaypoints = [
            { x: srcNode.x, y: srcNode.y },
            { x: hubNode.x, y: hubNode.y },
            { x: tgtNode.x, y: tgtNode.y },
          ];
        } else if (topology === 'mesh') {
          polylineWaypoints = [
            { x: srcNode.x, y: srcNode.y },
            { x: tgtNode.x, y: tgtNode.y },
          ];
        }

        if (isPathBlocked || polylineWaypoints.length < 2) {
          posX = srcNode.x;
          posY = srcNode.y;
          packetRef.current.setAttribute('opacity', isPlaying ? '0.3' : '0');
        } else {
          packetRef.current.setAttribute('opacity', isPlaying ? '1' : '0');

          // Clean consecutive duplicate waypoints
          const cleanWaypoints: { x: number; y: number }[] = [];
          for (const pt of polylineWaypoints) {
            if (
              cleanWaypoints.length === 0 ||
              Math.hypot(pt.x - cleanWaypoints[cleanWaypoints.length - 1].x, pt.y - cleanWaypoints[cleanWaypoints.length - 1].y) > 0.1
            ) {
              cleanWaypoints.push(pt);
            }
          }

          // Polyline distance interpolation
          const segLengths: number[] = [];
          let totalDist = 0;
          for (let i = 0; i < cleanWaypoints.length - 1; i++) {
            const len = Math.hypot(
              cleanWaypoints[i + 1].x - cleanWaypoints[i].x,
              cleanWaypoints[i + 1].y - cleanWaypoints[i].y
            );
            segLengths.push(len);
            totalDist += len;
          }

          const targetDist = p * totalDist;
          let accum = 0;
          let segIdx = 0;

          while (segIdx < segLengths.length - 1 && accum + segLengths[segIdx] < targetDist) {
            accum += segLengths[segIdx];
            segIdx++;
          }

          if (segLengths.length > 0 && segLengths[segIdx] > 0) {
            const segP = (targetDist - accum) / segLengths[segIdx];
            const p1 = cleanWaypoints[segIdx];
            const p2 = cleanWaypoints[segIdx + 1];
            posX = p1.x + (p2.x - p1.x) * segP;
            posY = p1.y + (p2.y - p1.y) * segP;
          } else {
            posX = srcNode.x;
            posY = srcNode.y;
          }
        }

        packetRef.current.setAttribute('transform', `translate(${posX}, ${posY})`);
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameIdRef.current);
  }, [topology, nodeCount, sourceNodeId, targetNodeId, simulatedFault, isPlaying]);

  // Topological Info Data
  const getTopologyInfo = () => {
    switch (topology) {
      case 'mesh': {
        const cables = (nodeCount * (nodeCount - 1)) / 2;
        return {
          title: 'Mesh Topology',
          cables: `${cables} Direct Links`,
          cableFormula: `N × (N - 1) / 2 = ${nodeCount} × ${nodeCount - 1} / 2 = ${cables}`,
          ports: `${nodeCount - 1} Ports per Station`,
          spof: 'No Single Point of Failure (Fully Redundant)',
          spofRisk: 'low',
          reliability: 'Extremely High (Dedicated fault isolation)',
          cost: 'Very High (Exponential cabling complexity)',
          pros: ['No traffic congestion between stations', 'Private & secure point-to-point links', 'Individual cable failures leave other stations active'],
          cons: ['High amount of cabling & expensive I/O ports', 'Complex physical installation & maintenance'],
        };
      }
      case 'star': {
        return {
          title: 'Star Topology',
          cables: `${nodeCount} Dedicated Drop Cables`,
          cableFormula: `N = ${nodeCount} Cables`,
          ports: `1 Port per Station, ${nodeCount} Ports on Central Switch`,
          spof: 'Central Hub / Switch is Single Point of Failure',
          spofRisk: 'high',
          reliability: 'Moderate (Station failure does not affect others)',
          cost: 'Moderate (Depends on central switch cost)',
          pros: ['Easy to install, reconfigure, and scale', 'Fault isolation: broken link only affects 1 station', 'Centralized network management'],
          cons: ['If Central Hub fails, the whole network stops', 'Requires more cable length than bus topology'],
        };
      }
      case 'bus': {
        return {
          title: 'Bus Topology',
          cables: `1 Shared Backbone + ${nodeCount} Drop Lines`,
          cableFormula: `1 Main Line + ${nodeCount} Drop Lines`,
          ports: '1 NIC Port per Station',
          spof: 'Shared Backbone Cable is Single Point of Failure',
          spofRisk: 'high',
          reliability: 'Low (Backbone break disables entire network)',
          cost: 'Very Low (Minimal cabling required)',
          pros: ['Inexpensive & easy to setup for small networks', 'Requires significantly less cable than star or mesh'],
          cons: ['Backbone fault shuts down all communication', 'Heavy traffic causes collisions & performance loss', 'Difficult to isolate individual faults'],
        };
      }
      case 'ring': {
        return {
          title: 'Ring Topology',
          cables: `${nodeCount} Point-to-Point Links in a loop`,
          cableFormula: `N = ${nodeCount} Ring Segment Links`,
          ports: '2 Ports per Station (Rx & Tx)',
          spof: 'Any single station or link break interrupts the ring',
          spofRisk: 'high',
          reliability: 'Low (Unidirectional ring vulnerability)',
          cost: 'Moderate',
          pros: ['Structured token-passing data flow (no collisions)', 'Equal network access for all connected stations'],
          cons: ['A single break anywhere disables the whole network', 'Reconfiguring or moving devices disrupts traffic'],
        };
      }
      case 'hybrid': {
        return {
          title: 'Hybrid Topology (Star-of-Buses)',
          cables: `${nodeCount} Drop Lines + Sub-segment trunks`,
          cableFormula: 'Star backbone connecting local bus trunks',
          ports: '1 per Station + Trunk Switch Interfaces',
          spof: 'Main Central Switch (Branch buses stay isolated)',
          spofRisk: 'medium',
          reliability: 'High (Failures confined to local bus segment)',
          cost: 'High (Requires central switches & bus taps)',
          pros: ['Extremely scalable and flexible for enterprise networks', 'Localizes network faults to individual sub-branches'],
          cons: ['Complex design, configuration, and troubleshooting', 'Higher hardware investment for switch units'],
        };
      }
    }
  };

  const info = getTopologyInfo();

  return (
    <div className="flex flex-col space-y-5 p-4 sm:p-6 bg-card rounded-2xl border shadow-sm">
      {/* LARGE RESPONSIVE SVG CANVAS CONTAINER */}
      <div className="w-full border rounded-2xl bg-slate-100/80 dark:bg-slate-950/90 relative overflow-hidden shadow-inner border-slate-200/80 dark:border-slate-800 min-h-[380px] sm:min-h-[420px] transition-colors duration-300">
        {/* Ambient Grid Background */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-25 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-foreground relative z-10 select-none">
          <defs>
            {/* Glow filter for active links and nodes */}
            <filter id={filterGlowId} x="-30%" y="-30%" width="160%" height="160%">
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
          {topology === 'bus' && (
            <g>
              <line
                x1="80"
                y1={cy}
                x2="680"
                y2={cy}
                stroke="currentColor"
                strokeWidth={simulatedFault === 'core-cut' ? '4' : '8'}
                strokeDasharray={simulatedFault === 'core-cut' ? '8 6' : undefined}
                className={`transition-all duration-300 ${
                  simulatedFault === 'core-cut'
                    ? 'text-rose-500'
                    : 'text-indigo-500/70 dark:text-indigo-400/80'
                }`}
                filter={`url(#${filterGlowId})`}
              />

              {/* Left Terminator */}
              <g transform={`translate(65, ${cy - 16})`}>
                <rect x="0" y="0" width="15" height="32" rx="3" className="fill-slate-200 dark:fill-slate-800 stroke-indigo-500 dark:stroke-indigo-400 stroke-2" />
                <text x="7.5" y="20" textAnchor="middle" className="fill-indigo-600 dark:fill-indigo-300 text-[9px] font-bold">
                  T
                </text>
              </g>

              {/* Right Terminator */}
              <g transform={`translate(680, ${cy - 16})`}>
                <rect x="0" y="0" width="15" height="32" rx="3" className="fill-slate-200 dark:fill-slate-800 stroke-indigo-500 dark:stroke-indigo-400 stroke-2" />
                <text x="7.5" y="20" textAnchor="middle" className="fill-indigo-600 dark:fill-indigo-300 text-[9px] font-bold">
                  T
                </text>
              </g>

              {/* Backbone Severed Indicator */}
              {simulatedFault === 'core-cut' && (
                <g transform={`translate(${cx - 15}, ${cy - 15})`}>
                  <circle cx="15" cy="15" r="15" className="fill-rose-100 dark:fill-rose-950 stroke-rose-500 stroke-2" />
                  <text x="15" y="20" textAnchor="middle" className="fill-rose-600 dark:fill-rose-400 font-black text-xs">
                    ⚡
                  </text>
                </g>
              )}
            </g>
          )}

          {/* HYBRID STAR BACKBONE BUS LINES */}
          {topology === 'hybrid' && (
            <g>
              {/* Left Branch Bus Dedicated Trunk */}
              <line
                x1={cx - 70}
                y1={cy - 80}
                x2={cx - 25}
                y2={cy - 25}
                stroke="currentColor"
                strokeWidth="4"
                className={simulatedFault === 'core-cut' ? 'text-rose-500/60' : 'text-slate-400 dark:text-slate-500'}
              />

              {/* Right Branch Bus Dedicated Trunk */}
              <line
                x1={cx + 70}
                y1={cy - 80}
                x2={cx + 25}
                y2={cy - 25}
                stroke="currentColor"
                strokeWidth="4"
                className={simulatedFault === 'core-cut' ? 'text-rose-500/60' : 'text-slate-400 dark:text-slate-500'}
              />

              {/* Left Upper Branch Bus Bar */}
              <line x1={cx - 70} y1={cy - 80} x2={cx - 290} y2={cy - 80} stroke="currentColor" strokeWidth="6" className="text-indigo-500/60 dark:text-indigo-400/60" />

              {/* Right Upper Branch Bus Bar */}
              <line x1={cx + 70} y1={cy - 80} x2={cx + 290} y2={cy - 80} stroke="currentColor" strokeWidth="6" className="text-indigo-500/60 dark:text-indigo-400/60" />

              {/* Bottom Branch Bus Trunk */}
              <line
                x1={cx}
                y1={cy - 25}
                x2={cx}
                y2={cy + 155}
                stroke="currentColor"
                strokeWidth="6"
                className={simulatedFault === 'core-cut' ? 'text-rose-500/60' : 'text-indigo-500/60 dark:text-indigo-400/60'}
              />
            </g>
          )}

          {/* RENDER EDGE LINKS */}
          {edges.map((e) => {
            const fn = nodes.find((n) => n.id === e.from);
            const tn = nodes.find((n) => n.id === e.to);
            if (!fn || !tn) return null;

            const isFaulted = isEdgeFaulted(e.from, e.to);
            const isPathLink =
              (e.from === sourceNodeId && e.to === targetNodeId) ||
              (e.to === sourceNodeId && e.from === targetNodeId) ||
              (topology === 'star' &&
                ((e.from === 0 && (e.to === sourceNodeId || e.to === targetNodeId)) ||
                  (e.to === 0 && (e.from === sourceNodeId || e.from === targetNodeId))));

            const isHovered = hoveredNodeId === e.from || hoveredNodeId === e.to;

            return (
              <line
                key={e.id}
                x1={fn.x}
                y1={fn.y}
                x2={tn.x}
                y2={tn.y}
                stroke="currentColor"
                strokeWidth={isPathLink ? 3.5 : isHovered ? 2.5 : 1.8}
                strokeDasharray={isFaulted ? '6 4' : undefined}
                className={`transition-all duration-300 ${
                  isFaulted
                    ? 'text-rose-500/80 dark:text-rose-400/80'
                    : isPathLink
                    ? 'text-cyan-500 dark:text-cyan-400'
                    : isHovered
                    ? 'text-sky-500 dark:text-sky-300'
                    : 'text-slate-300 dark:text-slate-700'
                }`}
                filter={isPathLink ? `url(#${filterGlowId})` : undefined}
              />
            );
          })}

          {/* BUS DROP LINES & TAPS */}
          {topology === 'bus' &&
            nodes.map((n) => {
              const isFaulted = isNodeFaulted(n.id);
              const isSelected = n.id === sourceNodeId || n.id === targetNodeId;
              return (
                <g key={`bus-tap-${n.id}`}>
                  <line
                    x1={n.x}
                    y1={n.y}
                    x2={n.x}
                    y2={cy}
                    stroke="currentColor"
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    strokeDasharray={isFaulted ? '4 3' : undefined}
                    className={`transition-all duration-300 ${
                      isFaulted ? 'text-rose-500' : isSelected ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-600'
                    }`}
                  />
                  <circle
                    cx={n.x}
                    cy={cy}
                    r="5"
                    className={`transition-all duration-300 ${
                      isFaulted
                        ? 'fill-rose-500 stroke-slate-200 dark:stroke-slate-900'
                        : isSelected
                        ? 'fill-cyan-500 dark:fill-cyan-400 stroke-cyan-200 dark:stroke-cyan-900'
                        : 'fill-indigo-500 dark:fill-indigo-400 stroke-white dark:stroke-slate-900'
                    }`}
                  />
                </g>
              );
            })}

          {/* HYBRID DROP LINES & TAPS */}
          {topology === 'hybrid' &&
            nodes
              .filter((n) => !n.isHub)
              .map((n) => {
                let dropX = n.x;
                let dropY = cy - 80;
                if (n.branchIdx === 2) {
                  dropX = cx;
                  dropY = n.y;
                }
                const isSelected = n.id === sourceNodeId || n.id === targetNodeId;

                return (
                  <g key={`hybrid-tap-${n.id}`}>
                    <line
                      x1={n.x}
                      y1={n.y}
                      x2={dropX}
                      y2={dropY}
                      stroke="currentColor"
                      strokeWidth={isSelected ? '2.5' : '1.8'}
                      className={`transition-all duration-300 ${
                        isSelected ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-600'
                      }`}
                    />
                    <circle
                      cx={dropX}
                      cy={dropY}
                      r="4.5"
                      className={`transition-all duration-300 ${
                        isSelected ? 'fill-cyan-500 dark:fill-cyan-400' : 'fill-indigo-500 dark:fill-indigo-400'
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
                        ? 'stroke-emerald-500 dark:stroke-emerald-400'
                        : isTarget
                        ? 'stroke-cyan-500 dark:stroke-cyan-400'
                        : 'stroke-sky-400/60'
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
                      ? 'fill-rose-50 dark:fill-rose-950/90 stroke-rose-500 text-rose-800 dark:text-rose-200'
                      : isHub
                      ? 'fill-amber-50 dark:fill-amber-950/90 stroke-amber-500 text-amber-900 dark:text-amber-100 shadow-sm'
                      : isSource
                      ? 'fill-emerald-50 dark:fill-emerald-950/90 stroke-emerald-500 dark:stroke-emerald-400 text-emerald-900 dark:text-emerald-100 shadow-sm'
                      : isTarget
                      ? 'fill-cyan-50 dark:fill-cyan-950/90 stroke-cyan-500 dark:stroke-cyan-400 text-cyan-900 dark:text-cyan-100 shadow-sm'
                      : isHovered
                      ? 'fill-slate-100 dark:fill-slate-800 stroke-sky-400 text-slate-900 dark:text-slate-100'
                      : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 text-slate-800 dark:text-slate-200 shadow-xs'
                  }`}
                />

                {/* Device Icon Graphic */}
                {isHub ? (
                  <g transform="translate(8, 14)" className="text-amber-500 dark:text-amber-400">
                    <rect x="0" y="0" width="22" height="18" rx="3" className="fill-amber-500/10 dark:fill-amber-500/20 stroke-amber-500 dark:stroke-amber-400 stroke-1" />
                    <circle cx="5" cy="5" r="1.5" className="fill-emerald-500 dark:fill-emerald-400" />
                    <circle cx="10" cy="5" r="1.5" className="fill-emerald-500 dark:fill-emerald-400 animate-pulse" />
                    <circle cx="15" cy="5" r="1.5" className="fill-cyan-500 dark:fill-cyan-400" />
                    <line x1="4" y1="12" x2="18" y2="12" className="stroke-amber-400 dark:stroke-amber-300 stroke-2 stroke-dasharray-[2,2]" />
                  </g>
                ) : (
                  <g transform={`translate(${nodeW < 68 ? 5 : 8}, ${nodeH < 42 ? 9 : 12})`}>
                    <rect
                      x="0"
                      y="0"
                      width="16"
                      height="12"
                      rx="2"
                      className={`stroke-1 ${
                        isFaulted
                          ? 'fill-rose-100 dark:fill-rose-900 stroke-rose-500'
                          : isSource
                          ? 'fill-emerald-100 dark:fill-emerald-900 stroke-emerald-500'
                          : isTarget
                          ? 'fill-cyan-100 dark:fill-cyan-900 stroke-cyan-500'
                          : 'fill-slate-200 dark:fill-slate-800 stroke-slate-400 dark:stroke-slate-600'
                      }`}
                    />
                    <rect x="5" y="12" width="6" height="3" className="fill-slate-400 dark:fill-slate-600" />
                    <rect x="3" y="15" width="10" height="2" rx="1" className="fill-slate-300 dark:fill-slate-500" />
                  </g>
                )}

                {/* Node Label Text */}
                <text
                  x={isHub ? 55 : nodeW < 68 ? nodeW / 2 + 8 : nodeW / 2 + 10}
                  y={nodeH / 2 + 3}
                  textAnchor="middle"
                  className={`text-[10px] font-bold tracking-tight select-none ${
                    isFaulted
                      ? 'fill-rose-700 dark:fill-rose-300 font-extrabold'
                      : isSource
                      ? 'fill-emerald-700 dark:fill-emerald-300 font-extrabold'
                      : isTarget
                      ? 'fill-cyan-700 dark:fill-cyan-300 font-extrabold'
                      : 'fill-slate-800 dark:fill-slate-200'
                  }`}
                >
                  {isHub ? (n.label.includes('SWITCH') ? 'SWITCH' : 'HUB') : `St. ${n.id}`}
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
                          ? 'fill-rose-500 animate-ping'
                          : isSource
                          ? 'fill-emerald-500 dark:fill-emerald-400'
                          : isTarget
                          ? 'fill-cyan-500 dark:fill-cyan-400'
                          : 'fill-emerald-500/80'
                      }
                      style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r="3.5"
                      className={
                        isFaulted
                          ? 'fill-rose-500'
                          : isSource
                          ? 'fill-emerald-500 dark:fill-emerald-400'
                          : isTarget
                          ? 'fill-cyan-500 dark:fill-cyan-400'
                          : 'fill-emerald-500 dark:fill-emerald-400'
                      }
                    />
                  </g>
                )}
              </g>
            );
          })}

          {/* ANIMATED PACKET GRAPHIC */}
          <g ref={packetRef} opacity="0" className="pointer-events-none">
            <circle r="10" className="fill-cyan-400/30 stroke-cyan-400 stroke-2" filter={`url(#${filterGlowId})`} />
            <circle r="5" className="fill-cyan-400 dark:fill-cyan-300" />
            <circle r="2" className="fill-white" />
          </g>
        </svg>

        {/* HUD OVERLAY AT TOP LEFT */}
        <div className="absolute top-3 left-3 bg-background/90 dark:bg-slate-900/90 backdrop-blur-md border rounded-xl px-3 py-1.5 flex items-center gap-3 text-xs shadow-md z-20 transition-colors">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            <span className="font-semibold text-foreground">Src:</span> St. {sourceNodeId}
          </div>
          <div className="flex items-center gap-1.5 border-l pl-3">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-500 dark:bg-cyan-400" />
            <span className="font-semibold text-foreground">Tgt:</span> St. {targetNodeId}
          </div>
          <div className="hidden sm:flex items-center gap-1 border-l pl-3 text-[11px] text-muted-foreground">
            <Info className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" /> Click nodes to test path
          </div>
        </div>

        {/* FAULT OVERLAY WARNING AT BOTTOM RIGHT */}
        {simulatedFault !== 'none' && (
          <div className="absolute bottom-3 right-3 bg-rose-50 dark:bg-rose-950/90 backdrop-blur-md border border-rose-300 dark:border-rose-800 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs text-rose-800 dark:text-rose-200 shadow-md z-20">
            <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
            <span className="font-semibold">Fault Active:</span> {simulatedFault === 'station-2' ? 'Station 2 Down' : 'Core Cut'}
          </div>
        )}
      </div>

      {/* TOPOLOGICAL METRICS & DETAILS GRID BELOW SVG */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* CARD 1: CABLES & PORTS */}
        <div className="p-4 rounded-xl bg-muted/20 border space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Cable className="w-4 h-4 text-indigo-500" /> Cables & Interfaces
            </h5>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border">
              N = {nodeCount}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Total Cables Required:</span>
              <span className="font-bold text-foreground text-sm">{info.cables}</span>
              <div className="text-[10px] font-mono text-muted-foreground bg-background p-1.5 rounded border mt-1">
                {info.cableFormula}
              </div>
            </div>

            <div className="pt-1 border-t">
              <span className="text-muted-foreground block text-[11px]">Station I/O Ports:</span>
              <span className="font-semibold text-foreground">{info.ports}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: FAULT TOLERANCE & SPOF */}
        <div className="p-4 rounded-xl bg-muted/20 border space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-500" /> Reliability & SPOF
            </h5>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>

          <div className="space-y-2 text-xs">
            <div
              className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                info.spofRisk === 'high'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                  : info.spofRisk === 'medium'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {info.spofRisk === 'high' ? (
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="block text-[10px] uppercase font-bold tracking-wider">Single Point of Failure:</span>
                <span className="font-semibold text-[11px]">{info.spof}</span>
              </div>
            </div>

            <div className="pt-1">
              <span className="text-muted-foreground block text-[11px]">Overall Reliability:</span>
              <span className="font-medium text-foreground">{info.reliability}</span>
            </div>
          </div>
        </div>

        {/* CARD 3: ADVANTAGES & DISADVANTAGES */}
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-2 flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-indigo-500" /> Trade-offs Summary
          </h5>

          <div className="space-y-2 text-xs">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-lg">
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Key Advantages
              </div>
              <ul className="list-disc list-inside text-[11px] space-y-0.5 pt-0.5 pl-0.5">
                {info.pros.slice(0, 2).map((pro, idx) => (
                  <li key={idx}>{pro}</li>
                ))}
              </ul>
            </div>

            <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 rounded-lg">
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400">
                <XCircle className="w-3.5 h-3.5" /> Key Disadvantages
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
