import { useState, useEffect, useRef } from 'react';
import { type VizMeta } from '../types';
import { useAppStore } from '../../state/appStore';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Globe,
  FileCode,
  Handshake,
  ShieldCheck,
  Network,
  Binary,
  Zap,
  Monitor,
  HardDrive,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const vizMeta: VizMeta = {
  key: 'network-peer-to-peer',
  title: 'Peer-to-Peer Protocol Interaction Across Intermediate Nodes',
  category: 'network',
  renderer: 'svg',
  params: [
    {
      key: 'highlightLayer',
      type: 'select',
      label: 'Highlight layer',
      default: 'none',
      options: [
        { label: 'None (Show All)', value: 'none' },
        { label: 'Application (Layer 7)', value: 'application' },
        { label: 'Presentation (Layer 6)', value: 'presentation' },
        { label: 'Session (Layer 5)', value: 'session' },
        { label: 'Transport (Layer 4)', value: 'transport' },
        { label: 'Network (Layer 3)', value: 'network' },
        { label: 'Data Link (Layer 2)', value: 'data-link' },
        { label: 'Physical (Layer 1)', value: 'physical' },
      ],
    },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

// Layer definition standard across OSI visualizations
const LAYERS_INFO = [
  {
    num: 7,
    key: 'application',
    name: 'Application',
    pdu: 'Data',
    icon: Globe,
    color: '#a855f7',
    bgClass: 'fill-purple-500/15 stroke-purple-400',
    textClass: 'fill-purple-600 dark:fill-purple-400',
    highlightBg: 'fill-purple-600 dark:fill-purple-500',
    isEndToEnd: true,
  },
  {
    num: 6,
    key: 'presentation',
    name: 'Presentation',
    pdu: 'Data',
    icon: FileCode,
    color: '#6366f1',
    bgClass: 'fill-indigo-500/15 stroke-indigo-400',
    textClass: 'fill-indigo-600 dark:fill-indigo-400',
    highlightBg: 'fill-indigo-600 dark:fill-indigo-500',
    isEndToEnd: true,
  },
  {
    num: 5,
    key: 'session',
    name: 'Session',
    pdu: 'Data',
    icon: Handshake,
    color: '#8b5cf6',
    bgClass: 'fill-violet-500/15 stroke-violet-400',
    textClass: 'fill-violet-600 dark:fill-violet-400',
    highlightBg: 'fill-violet-600 dark:fill-violet-500',
    isEndToEnd: true,
  },
  {
    num: 4,
    key: 'transport',
    name: 'Transport',
    pdu: 'Segment',
    icon: ShieldCheck,
    color: '#10b981',
    bgClass: 'fill-emerald-500/15 stroke-emerald-400',
    textClass: 'fill-emerald-600 dark:fill-emerald-400',
    highlightBg: 'fill-emerald-600 dark:fill-emerald-500',
    isEndToEnd: true,
  },
  {
    num: 3,
    key: 'network',
    name: 'Network',
    pdu: 'Packet',
    icon: Network,
    color: '#0ea5e9',
    bgClass: 'fill-sky-500/15 stroke-sky-400',
    textClass: 'fill-sky-600 dark:fill-sky-400',
    highlightBg: 'fill-sky-600 dark:fill-sky-500',
    isEndToEnd: false,
  },
  {
    num: 2,
    key: 'data-link',
    name: 'Data Link',
    pdu: 'Frame',
    icon: Binary,
    color: '#f59e0b',
    bgClass: 'fill-amber-500/15 stroke-amber-400',
    textClass: 'fill-amber-600 dark:fill-amber-400',
    highlightBg: 'fill-amber-600 dark:fill-amber-500',
    isEndToEnd: false,
  },
  {
    num: 1,
    key: 'physical',
    name: 'Physical',
    pdu: 'Bits',
    icon: Zap,
    color: '#f43f5e',
    bgClass: 'fill-rose-500/15 stroke-rose-400',
    textClass: 'fill-rose-600 dark:fill-rose-400',
    highlightBg: 'fill-rose-600 dark:fill-rose-500',
    isEndToEnd: false,
  },
];

// Helper to calculate exact layer Y position on canvas (shifted downward for top header row)
const getLayerY = (layerNum: number) => 95 + (7 - layerNum) * 42;

// X centers for 4 node stacks
const X_CENTERS = {
  deviceA: 100,
  router1: 310,
  router2: 520,
  deviceB: 730,
};

const PHYSICAL_CABLE_Y = 440;

interface Step {
  id: number;
  node: 'deviceA' | 'router1' | 'router2' | 'deviceB' | 'link1' | 'link2' | 'link3';
  layerNum: number;
  x: number;
  y: number;
  title: string;
  desc: string;
  pdu: string;
  action: 'encapsulate' | 'decapsulate' | 'route' | 'transmit';
}

// 29-Step Trajectory tracing complete down-across-up physical and logical path
const TRAJECTORY_STEPS: Step[] = [
  // DEVICE A ENCAPSULATION (STEPS 0-6)
  { id: 0, node: 'deviceA', layerNum: 7, x: X_CENTERS.deviceA, y: getLayerY(7) + 17, title: 'Device A — Application Layer', desc: 'Application generates raw user message payload.', pdu: 'Data', action: 'encapsulate' },
  { id: 1, node: 'deviceA', layerNum: 6, x: X_CENTERS.deviceA, y: getLayerY(6) + 17, title: 'Device A — Presentation Layer', desc: 'Translates syntax and encrypts payload (H6 header added).', pdu: 'Data (Formatted)', action: 'encapsulate' },
  { id: 2, node: 'deviceA', layerNum: 5, x: X_CENTERS.deviceA, y: getLayerY(5) + 17, title: 'Device A — Session Layer', desc: 'Establishes host dialog session (H5 header added).', pdu: 'Data (Session)', action: 'encapsulate' },
  { id: 3, node: 'deviceA', layerNum: 4, x: X_CENTERS.deviceA, y: getLayerY(4) + 17, title: 'Device A — Transport Layer', desc: 'Appends source & destination port numbers (H4 header added).', pdu: 'Segment', action: 'encapsulate' },
  { id: 4, node: 'deviceA', layerNum: 3, x: X_CENTERS.deviceA, y: getLayerY(3) + 17, title: 'Device A — Network Layer', desc: 'Appends logical IP source & destination addresses (H3 header added).', pdu: 'Packet', action: 'encapsulate' },
  { id: 5, node: 'deviceA', layerNum: 2, x: X_CENTERS.deviceA, y: getLayerY(2) + 17, title: 'Device A — Data Link Layer', desc: 'Appends MAC header & CRC error trailer (H2/T2 added).', pdu: 'Frame', action: 'encapsulate' },
  { id: 6, node: 'deviceA', layerNum: 1, x: X_CENTERS.deviceA, y: getLayerY(1) + 17, title: 'Device A — Physical Layer', desc: 'Converts bit stream into electrical/optical signals for transmission.', pdu: 'Bit Stream', action: 'transmit' },

  // WIRE TRANSIT HOP 1 (STEPS 7-8)
  { id: 7, node: 'link1', layerNum: 1, x: X_CENTERS.deviceA, y: PHYSICAL_CABLE_Y, title: 'Physical Egress (Device A)', desc: 'Signals drop down interface onto physical transmission cable.', pdu: 'Signal', action: 'transmit' },
  { id: 8, node: 'link1', layerNum: 1, x: X_CENTERS.router1, y: PHYSICAL_CABLE_Y, title: 'Physical Link 1 (Hop 1 Transit)', desc: 'Signals travel across physical cable to Intermediate Router 1.', pdu: 'Signal', action: 'transmit' },

  // ROUTER 1 PROCESSING (STEPS 9-13)
  { id: 9, node: 'router1', layerNum: 1, x: X_CENTERS.router1, y: getLayerY(1) + 17, title: 'Router 1 — Physical Layer', desc: 'Ingress interface receives signals and converts them into a bit stream.', pdu: 'Bit Stream', action: 'decapsulate' },
  { id: 10, node: 'router1', layerNum: 2, x: X_CENTERS.router1, y: getLayerY(2) + 17, title: 'Router 1 — Data Link Layer', desc: 'Validates frame CRC trailer and strips L2 MAC header.', pdu: 'Frame -> Packet', action: 'decapsulate' },
  { id: 11, node: 'router1', layerNum: 3, x: X_CENTERS.router1, y: getLayerY(3) + 17, title: 'Router 1 — Network Layer', desc: 'Inspects destination IP and looks up routing table for next hop.', pdu: 'Packet (Route Lookup)', action: 'route' },
  { id: 12, node: 'router1', layerNum: 2, x: X_CENTERS.router1, y: getLayerY(2) + 17, title: 'Router 1 — Data Link Layer', desc: 'Re-encapsulates packet into new outbound frame with Router 2 MAC.', pdu: 'Packet -> Frame', action: 'encapsulate' },
  { id: 13, node: 'router1', layerNum: 1, x: X_CENTERS.router1, y: getLayerY(1) + 17, title: 'Router 1 — Physical Layer', desc: 'Egress interface converts bit stream into physical signals.', pdu: 'Bit Stream', action: 'transmit' },

  // WIRE TRANSIT HOP 2 (STEPS 14-15)
  { id: 14, node: 'link2', layerNum: 1, x: X_CENTERS.router1, y: PHYSICAL_CABLE_Y, title: 'Physical Egress (Router 1)', desc: 'Signals drop down interface onto intermediate physical cable.', pdu: 'Signal', action: 'transmit' },
  { id: 15, node: 'link2', layerNum: 1, x: X_CENTERS.router2, y: PHYSICAL_CABLE_Y, title: 'Physical Link 2 (Hop 2 Transit)', desc: 'Signals travel across physical cable to Intermediate Router 2.', pdu: 'Signal', action: 'transmit' },

  // ROUTER 2 PROCESSING (STEPS 16-20)
  { id: 16, node: 'router2', layerNum: 1, x: X_CENTERS.router2, y: getLayerY(1) + 17, title: 'Router 2 — Physical Layer', desc: 'Ingress interface receives signals and converts them into a bit stream.', pdu: 'Bit Stream', action: 'decapsulate' },
  { id: 17, node: 'router2', layerNum: 2, x: X_CENTERS.router2, y: getLayerY(2) + 17, title: 'Router 2 — Data Link Layer', desc: 'Checks frame integrity and passes packet up to Network layer.', pdu: 'Frame -> Packet', action: 'decapsulate' },
  { id: 18, node: 'router2', layerNum: 3, x: X_CENTERS.router2, y: getLayerY(3) + 17, title: 'Router 2 — Network Layer', desc: 'Identifies Device B as target host on directly connected subnet.', pdu: 'Packet (Route Lookup)', action: 'route' },
  { id: 19, node: 'router2', layerNum: 2, x: X_CENTERS.router2, y: getLayerY(2) + 17, title: 'Router 2 — Data Link Layer', desc: 'Appends final Hop 3 MAC header and CRC trailer for Device B.', pdu: 'Packet -> Frame', action: 'encapsulate' },
  { id: 20, node: 'router2', layerNum: 1, x: X_CENTERS.router2, y: getLayerY(1) + 17, title: 'Router 2 — Physical Layer', desc: 'Converts bit stream into signals and transmits over physical media.', pdu: 'Bit Stream', action: 'transmit' },

  // WIRE TRANSIT HOP 3 (STEPS 21-22)
  { id: 21, node: 'link3', layerNum: 1, x: X_CENTERS.router2, y: PHYSICAL_CABLE_Y, title: 'Physical Egress (Router 2)', desc: 'Signals drop down interface onto final physical cable.', pdu: 'Signal', action: 'transmit' },
  { id: 22, node: 'link3', layerNum: 1, x: X_CENTERS.deviceB, y: PHYSICAL_CABLE_Y, title: 'Physical Link 3 (Hop 3 Transit)', desc: 'Signals travel across physical cable to destination Device B.', pdu: 'Signal', action: 'transmit' },

  // DEVICE B DECAPSULATION (STEPS 23-28)
  { id: 23, node: 'deviceB', layerNum: 1, x: X_CENTERS.deviceB, y: getLayerY(1) + 17, title: 'Device B — Physical Layer', desc: 'Receives signals, converts to bit stream, and passes to Data Link layer.', pdu: 'Bit Stream', action: 'decapsulate' },
  { id: 24, node: 'deviceB', layerNum: 2, x: X_CENTERS.deviceB, y: getLayerY(2) + 17, title: 'Device B — Data Link Layer', desc: 'Validates frame CRC trailer and strips L2 MAC header.', pdu: 'Frame -> Packet', action: 'decapsulate' },
  { id: 25, node: 'deviceB', layerNum: 3, x: X_CENTERS.deviceB, y: getLayerY(3) + 17, title: 'Device B — Network Layer', desc: 'Verifies IP address matches host and strips L3 IP header.', pdu: 'Packet -> Segment', action: 'decapsulate' },
  { id: 26, node: 'deviceB', layerNum: 4, x: X_CENTERS.deviceB, y: getLayerY(4) + 17, title: 'Device B — Transport Layer', desc: 'Verifies port number, reassembles segment, and strips L4 header.', pdu: 'Segment -> Data', action: 'decapsulate' },
  { id: 27, node: 'deviceB', layerNum: 5, x: X_CENTERS.deviceB, y: getLayerY(5) + 17, title: 'Device B — Session Layer', desc: 'Processes session tokens and passes payload to Presentation layer.', pdu: 'Data', action: 'decapsulate' },
  { id: 28, node: 'deviceB', layerNum: 6, x: X_CENTERS.deviceB, y: getLayerY(6) + 17, title: 'Device B — Presentation Layer', desc: 'Decrypts and decompresses payload data.', pdu: 'Data', action: 'decapsulate' },
  { id: 29, node: 'deviceB', layerNum: 7, x: X_CENTERS.deviceB, y: getLayerY(7) + 17, title: 'Device B — Application Layer', desc: 'Delivers raw application message payload to client software!', pdu: 'Data (Delivered)', action: 'decapsulate' },
];

export default function PeerToPeer({ values }: Props) {
  const globalSpeed = useAppStore((state) => state.globalSpeedMultiplier) || 1;
  const highlightParam = (values.highlightLayer as string) || 'none';

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeStep = TRAJECTORY_STEPS[currentStepIndex];

  // Auto-advance animation when playing
  useEffect(() => {
    if (!isPlaying) {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      return;
    }

    const intervalMs = 1100 / globalSpeed;

    stepTimerRef.current = setTimeout(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= TRAJECTORY_STEPS.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    };
  }, [isPlaying, currentStepIndex, globalSpeed]);

  const handleTogglePlay = () => {
    if (currentStepIndex >= TRAJECTORY_STEPS.length - 1) {
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
    setCurrentStepIndex((prev) => Math.min(TRAJECTORY_STEPS.length - 1, prev + 1));
  };

  // Determine active status for layers and peer lines
  const isLayerActive = (nodeKey: string, layerNum: number) => {
    if (highlightParam !== 'none') {
      const match = LAYERS_INFO.find((l) => l.key === highlightParam);
      return match ? match.num === layerNum : false;
    }
    return activeStep.node === nodeKey && activeStep.layerNum === layerNum;
  };

  const isPeerLineActive = (layerNum: number) => {
    if (highlightParam !== 'none') {
      const match = LAYERS_INFO.find((l) => l.key === highlightParam);
      return match ? match.num === layerNum : false;
    }
    return activeStep.layerNum === layerNum;
  };

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none">
      {/* PLAYBACK HUD & TOOLBAR ABOVE CANVAS */}
      <div className="bg-card border border-border rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
            title={isPlaying ? 'Pause Animation' : 'Play Animation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={handleStepPrev}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 disabled:opacity-40 transition-colors"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={handleStepNext}
            disabled={currentStepIndex === TRAJECTORY_STEPS.length - 1}
            className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 disabled:opacity-40 transition-colors"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
            title="Reset Animation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-border mx-1" />

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="font-extrabold text-foreground">
              Step {currentStepIndex + 1}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{TRAJECTORY_STEPS.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          {highlightParam !== 'none' && (
            <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
              <Layers className="w-3.5 h-3.5" />
              <span>Layer Filter: {highlightParam.toUpperCase()}</span>
            </div>
          )}
          <div className="text-muted-foreground font-mono text-[11px] hidden sm:block">
            {activeStep.title}
          </div>
        </div>
      </div>

      {/* SVG CANVAS CONTAINER */}
      <div className="relative w-full rounded-2xl bg-card border border-border shadow-sm overflow-hidden p-2 sm:p-4 transition-colors">
        <svg
          viewBox="0 0 840 500"
          className="w-full h-auto overflow-visible"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern
              id="p2p-grid"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="2"
                cy="2"
                r="1"
                className="fill-slate-300 dark:fill-slate-700/60"
              />
            </pattern>

            {/* Shadows & Glow */}
            <filter id="p2p-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodOpacity="0.08" />
            </filter>
            <filter id="p2p-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid */}
          <rect width="840" height="500" fill="url(#p2p-grid)" opacity="0.75" />

          {/* ========================================================================= */}
          {/* TOP ALIGNED DEVICE HEADERS (Device A, Router 1, Router 2, Device B) */}
          {/* ========================================================================= */}

          {/* Device A Header */}
          <g transform="translate(45, 18)">
            <rect
              x="0"
              y="0"
              width="110"
              height="36"
              rx="8"
              className="fill-slate-100 dark:fill-slate-800/90 stroke-slate-300 dark:stroke-slate-700 stroke-1"
            />
            <Monitor width={14} height={14} x={10} y={11} className="text-indigo-500" />
            <text x="32" y="17" className="text-[10.5px] font-extrabold fill-foreground">
              Device A
            </text>
            <text x="32" y="28" className="text-[8.5px] font-semibold fill-muted-foreground">
              Source Host
            </text>
          </g>

          {/* Router 1 Header */}
          <g transform="translate(255, 18)">
            <rect
              x="0"
              y="0"
              width="110"
              height="36"
              rx="8"
              className="fill-slate-100 dark:fill-slate-800/90 stroke-slate-300 dark:stroke-slate-700 stroke-1"
            />
            <HardDrive width={14} height={14} x={10} y={11} className="text-sky-500" />
            <text x="32" y="17" className="text-[10.5px] font-extrabold fill-foreground">
              Router 1
            </text>
            <text x="32" y="28" className="text-[8.5px] font-semibold fill-muted-foreground">
              Intermediate Node
            </text>
          </g>

          {/* Router 2 Header */}
          <g transform="translate(465, 18)">
            <rect
              x="0"
              y="0"
              width="110"
              height="36"
              rx="8"
              className="fill-slate-100 dark:fill-slate-800/90 stroke-slate-300 dark:stroke-slate-700 stroke-1"
            />
            <HardDrive width={14} height={14} x={10} y={11} className="text-sky-500" />
            <text x="32" y="17" className="text-[10.5px] font-extrabold fill-foreground">
              Router 2
            </text>
            <text x="32" y="28" className="text-[8.5px] font-semibold fill-muted-foreground">
              Intermediate Node
            </text>
          </g>

          {/* Device B Header */}
          <g transform="translate(675, 18)">
            <rect
              x="0"
              y="0"
              width="110"
              height="36"
              rx="8"
              className="fill-slate-100 dark:fill-slate-800/90 stroke-slate-300 dark:stroke-slate-700 stroke-1"
            />
            <Monitor width={14} height={14} x={10} y={11} className="text-emerald-500" />
            <text x="32" y="17" className="text-[10.5px] font-extrabold fill-foreground">
              Device B
            </text>
            <text x="32" y="28" className="text-[8.5px] font-semibold fill-muted-foreground">
              Destination Host
            </text>
          </g>

          {/* Vertical Bus Drop Lines from Header to Stacks */}
          <line x1="100" y1="54" x2="100" y2="95" className="stroke-slate-300 dark:stroke-slate-700 stroke-1 stroke-dasharray-[3,3]" />
          <line x1="310" y1="54" x2="310" y2={getLayerY(3)} className="stroke-slate-300 dark:stroke-slate-700 stroke-1 stroke-dasharray-[3,3]" />
          <line x1="520" y1="54" x2="520" y2={getLayerY(3)} className="stroke-slate-300 dark:stroke-slate-700 stroke-1 stroke-dasharray-[3,3]" />
          <line x1="730" y1="54" x2="730" y2="95" className="stroke-slate-300 dark:stroke-slate-700 stroke-1 stroke-dasharray-[3,3]" />

          {/* ========================================================================= */}
          {/* LOGICAL PEER-TO-PEER PROTOCOL DASHED LINES (LAYERS 7 to 1) */}
          {/* ========================================================================= */}
          <g opacity="0.95">
            {LAYERS_INFO.map((layer) => {
              const y = getLayerY(layer.num) + 17;
              const active = isPeerLineActive(layer.num);

              if (layer.isEndToEnd) {
                // End-to-End Peer Lines (Layers 7, 6, 5, 4): Device A -> Device B
                return (
                  <g key={`peer-${layer.num}`} className="transition-all duration-300">
                    <line
                      x1="155"
                      y1={y}
                      x2="675"
                      y2={y}
                      stroke={layer.color}
                      strokeWidth={active ? "2.5" : "1.25"}
                      strokeDasharray={active ? undefined : "5 4"}
                      opacity={active ? 1 : 0.35}
                      className="transition-all duration-200"
                    />
                    {/* Peer Protocol Badge Label */}
                    <rect
                      x="350"
                      y={y - 10}
                      width="140"
                      height="20"
                      rx="10"
                      fill="currentColor"
                      className={`${
                        active
                          ? "fill-background stroke-2 text-foreground shadow-xs"
                          : "fill-background/90 dark:fill-slate-900/90 text-muted-foreground stroke-1"
                      } stroke-border transition-colors`}
                    />
                    <text
                      x="420"
                      y={y + 3.5}
                      textAnchor="middle"
                      className={`text-[9px] font-bold tracking-tight ${
                        active ? "fill-foreground font-extrabold" : "fill-slate-500 dark:fill-slate-400"
                      }`}
                    >
                      {layer.name} Peer Protocol
                    </text>
                  </g>
                );
              } else {
                // Hop-by-Hop Peer Lines (Layers 3, 2, 1): A <-> Router 1 <-> Router 2 <-> B
                const hops = [
                  { x1: 155, x2: 255, labelX: 205, name: 'H1' },
                  { x1: 365, x2: 465, labelX: 415, name: 'H2' },
                  { x1: 575, x2: 675, labelX: 625, name: 'H3' },
                ];

                return (
                  <g key={`peer-${layer.num}`} className="transition-all duration-300">
                    {hops.map((hop, idx) => (
                      <g key={`hop-${layer.num}-${idx}`}>
                        <line
                          x1={hop.x1}
                          y1={y}
                          x2={hop.x2}
                          y2={y}
                          stroke={layer.color}
                          strokeWidth={active ? "2.5" : "1.25"}
                          strokeDasharray={active ? undefined : "4 3"}
                          opacity={active ? 1 : 0.4}
                        />
                        <circle
                          cx={hop.labelX}
                          cy={y}
                          r="5.5"
                          className={`${
                            active
                              ? "fill-primary text-primary-foreground"
                              : "fill-background stroke-border stroke-1 text-muted-foreground"
                          }`}
                        />
                        <text
                          x={hop.labelX}
                          y={y + 2.5}
                          textAnchor="middle"
                          className={`text-[7.5px] font-extrabold ${
                            active ? "fill-primary-foreground" : "fill-slate-600 dark:fill-slate-400"
                          }`}
                        >
                          {hop.name}
                        </text>
                      </g>
                    ))}
                  </g>
                );
              }
            })}
          </g>

          {/* ========================================================================= */}
          {/* PHYSICAL MEDIA BASE LINE & CABLE DROPS (LAYER 1 BASE) */}
          {/* ========================================================================= */}
          <g>
            {/* Cable Vertical Drop Lines from Node Physical Layer Boxes down to Physical Cable */}
            {[X_CENTERS.deviceA, X_CENTERS.router1, X_CENTERS.router2, X_CENTERS.deviceB].map((xPos, i) => (
              <line
                key={`drop-${i}`}
                x1={xPos}
                y1={getLayerY(1) + 34}
                x2={xPos}
                y2={PHYSICAL_CABLE_Y}
                className="stroke-rose-500 dark:stroke-rose-600 stroke-[2px] stroke-dasharray-[3,3]"
              />
            ))}

            {/* Main Horizontal Physical Cable Line */}
            <line
              x1={X_CENTERS.deviceA}
              y1={PHYSICAL_CABLE_Y}
              x2={X_CENTERS.deviceB}
              y2={PHYSICAL_CABLE_Y}
              className="stroke-rose-500 dark:stroke-rose-600 stroke-[3.5px] stroke-round"
            />

            {/* Center Physical Cable Badge */}
            <rect
              x="340"
              y={PHYSICAL_CABLE_Y - 11}
              width="160"
              height="22"
              rx="6"
              className="fill-rose-50 dark:fill-rose-950/90 stroke-rose-300 dark:stroke-rose-800 stroke-1 shadow-2xs"
            />
            <text
              x="420"
              y={PHYSICAL_CABLE_Y + 3.5}
              textAnchor="middle"
              className="fill-rose-700 dark:fill-rose-300 text-[9.5px] font-mono font-extrabold"
            >
              Physical Communication Link
            </text>
          </g>

          {/* ========================================================================= */}
          {/* LAYER BOXES FOR ALL 4 NODES (Device A, Router 1, Router 2, Device B) */}
          {/* ========================================================================= */}
          {LAYERS_INFO.map((layer) => {
            const y = getLayerY(layer.num);
            const Icon = layer.icon;

            const activeA = isLayerActive('deviceA', layer.num);
            const activeB = isLayerActive('deviceB', layer.num);
            const activeR1 = layer.num <= 3 && isLayerActive('router1', layer.num);
            const activeR2 = layer.num <= 3 && isLayerActive('router2', layer.num);

            return (
              <g key={`layers-group-${layer.num}`}>
                {/* Layer Number Left Margin (Device A) */}
                <text
                  x="28"
                  y={y + 21}
                  textAnchor="end"
                  className="text-[10px] font-black fill-slate-400 dark:fill-slate-500 select-none"
                >
                  {layer.num}
                </text>

                {/* DEVICE A LAYER BOX */}
                <g transform={`translate(45, ${y})`} className="cursor-pointer">
                  <rect
                    x="0"
                    y="0"
                    width="110"
                    height="34"
                    rx="6"
                    filter="url(#p2p-shadow)"
                    className={`transition-all duration-200 ${
                      activeA
                        ? `${layer.highlightBg} stroke-2 stroke-primary shadow-md`
                        : `${layer.bgClass} stroke-1`
                    }`}
                  />
                  <Icon
                    width={12}
                    height={12}
                    x={8}
                    y={11}
                    className={activeA ? 'text-white' : layer.textClass}
                  />
                  <text
                    x="25"
                    y="21"
                    className={`text-[10px] font-extrabold ${
                      activeA
                        ? 'fill-white font-black'
                        : 'fill-slate-800 dark:fill-slate-100'
                    }`}
                  >
                    {layer.name}
                  </text>
                </g>

                {/* ROUTER 1 LAYER BOX (Layers 1..3 only) */}
                {layer.num <= 3 && (
                  <g transform={`translate(255, ${y})`} className="cursor-pointer">
                    <rect
                      x="0"
                      y="0"
                      width="110"
                      height="34"
                      rx="6"
                      filter="url(#p2p-shadow)"
                      className={`transition-all duration-200 ${
                        activeR1
                          ? `${layer.highlightBg} stroke-2 stroke-primary shadow-md`
                          : `${layer.bgClass} stroke-1`
                      }`}
                    />
                    <Icon
                      width={12}
                      height={12}
                      x={8}
                      y={11}
                      className={activeR1 ? 'text-white' : layer.textClass}
                    />
                    <text
                      x="25"
                      y="21"
                      className={`text-[10px] font-extrabold ${
                        activeR1
                          ? 'fill-white font-black'
                          : 'fill-slate-800 dark:fill-slate-100'
                      }`}
                    >
                      {layer.name}
                    </text>
                  </g>
                )}

                {/* ROUTER 2 LAYER BOX (Layers 1..3 only) */}
                {layer.num <= 3 && (
                  <g transform={`translate(465, ${y})`} className="cursor-pointer">
                    <rect
                      x="0"
                      y="0"
                      width="110"
                      height="34"
                      rx="6"
                      filter="url(#p2p-shadow)"
                      className={`transition-all duration-200 ${
                        activeR2
                          ? `${layer.highlightBg} stroke-2 stroke-primary shadow-md`
                          : `${layer.bgClass} stroke-1`
                      }`}
                    />
                    <Icon
                      width={12}
                      height={12}
                      x={8}
                      y={11}
                      className={activeR2 ? 'text-white' : layer.textClass}
                    />
                    <text
                      x="25"
                      y="21"
                      className={`text-[10px] font-extrabold ${
                        activeR2
                          ? 'fill-white font-black'
                          : 'fill-slate-800 dark:fill-slate-100'
                      }`}
                    >
                      {layer.name}
                    </text>
                  </g>
                )}

                {/* DEVICE B LAYER BOX */}
                <g transform={`translate(675, ${y})`} className="cursor-pointer">
                  <rect
                    x="0"
                    y="0"
                    width="110"
                    height="34"
                    rx="6"
                    filter="url(#p2p-shadow)"
                    className={`transition-all duration-200 ${
                      activeB
                        ? `${layer.highlightBg} stroke-2 stroke-primary shadow-md`
                        : `${layer.bgClass} stroke-1`
                    }`}
                  />
                  <Icon
                    width={12}
                    height={12}
                    x={8}
                    y={11}
                    className={activeB ? 'text-white' : layer.textClass}
                  />
                  <text
                    x="25"
                    y="21"
                    className={`text-[10px] font-extrabold ${
                      activeB
                        ? 'fill-white font-black'
                        : 'fill-slate-800 dark:fill-slate-100'
                    }`}
                  >
                    {layer.name}
                  </text>
                </g>

                {/* Layer Number Right Margin (Device B) */}
                <text
                  x="800"
                  y={y + 21}
                  textAnchor="start"
                  className="text-[10px] font-black fill-slate-400 dark:fill-slate-500 select-none"
                >
                  {layer.num}
                </text>
              </g>
            );
          })}

          {/* ========================================================================= */}
          {/* ANIMATED PACKET PULSE POINT & PDU BADGE */}
          {/* ========================================================================= */}
          <g
            transform={`translate(${activeStep.x}, ${activeStep.y})`}
            className="transition-transform duration-300 ease-out z-30"
          >
            {/* Outer Glowing Ripple */}
            <circle
              r="12"
              className="fill-primary/25 animate-ping"
              filter="url(#p2p-glow)"
            />
            {/* Pulse Outer Ring */}
            <circle r="8" className="fill-primary/50 stroke-primary stroke-2" />
            {/* Central Core Point */}
            <circle r="4" className="fill-primary-foreground stroke-primary stroke-1" />

            {/* PDU Badge Label Offset to Right Side to Prevent Text Overlap */}
            <g transform="translate(14, -18)">
              <rect
                x="0"
                y="0"
                width="76"
                height="18"
                rx="9"
                className="fill-slate-950/90 dark:fill-slate-900/95 stroke-primary stroke-1.5 shadow-md"
              />
              <text
                x="38"
                y="12"
                textAnchor="middle"
                className="fill-slate-100 text-[8.5px] font-mono font-black"
              >
                PDU: {activeStep.pdu.split(' ')[0]}
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* BOTTOM SPECIFICATIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Active Trajectory Step */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-border pb-2">
            <Info className="w-4 h-4 text-sky-500" /> Active Step Description
          </span>
          <div className="space-y-1">
            <div className="text-xs font-extrabold text-foreground">
              {activeStep.title}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {activeStep.desc}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-between text-[11px] font-mono border-t border-border/60">
            <span className="text-muted-foreground">Active PDU:</span>
            <span className="font-bold text-primary">{activeStep.pdu}</span>
          </div>
        </div>

        {/* Card 2: End-to-End vs Hop-by-Hop Communication */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-border pb-2">
            <Network className="w-4 h-4 text-emerald-500" /> Communication Scope
          </span>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground">End-to-End (Layers 4–7):</span>
                <span className="text-muted-foreground ml-1">
                  Virtual peer dialog directly between Source Device A and Destination Device B.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground">Hop-by-Hop (Layers 1–3):</span>
                <span className="text-muted-foreground ml-1">
                  Physical routing and framing processed at every intermediate node/router.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Peer Protocol Rules */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-border pb-2">
            <ArrowRight className="w-4 h-4 text-purple-500" /> Peer Protocol Rules
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Peer layers cannot transfer data directly across thin air. Every layer relies on adjacent lower layers to pass headers down the source stack, across physical media, and back up the destination stack.
          </p>
        </div>
      </div>
    </div>
  );
}
