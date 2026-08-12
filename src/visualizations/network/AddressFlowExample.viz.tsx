import { useState, useEffect, useRef, useId } from "react";
import { type VizMeta } from "../types";
import { useVizState } from "../../state/useVizState";
import { useAppStore } from "../../state/appStore";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Monitor,
  HardDrive,
  Server,
  Info,
  Network,
  Layers,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const vizMeta: VizMeta = {
  key: "network-address-flow-example",
  title: "Addressing Through a Multi-Hop Path",
  category: "network",
  renderer: "svg",
  animated: false,
  params: [
    {
      key: "addressType",
      type: "select",
      label: "Highlight Address Focus",
      default: "all",
      options: [
        { label: "Show All Address Types", value: "all" },
        { label: "Physical MAC Addresses (Changes Per Hop)", value: "physical" },
        { label: "Logical IP Addresses (End-to-End Constant)", value: "logical" },
        { label: "Port Addresses (Process End-to-End Constant)", value: "port" },
      ],
    },
    {
      key: "speed",
      type: "number",
      label: "Animation Speed Multiplier",
      default: 1,
      min: 0.25,
      max: 3,
      step: 0.25,
    },
  ],
};

interface Props {
  topicId?: string;
  scope?: "local" | "chapter" | "app";
  props?: Record<string, unknown>;
  values?: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
}

interface StepDetail {
  stepIndex: number;
  title: string;
  stageName: string;
  activeNode: "hostA" | "r1" | "r2" | "hostB" | "link1" | "link2" | "link3";
  isNodeStep: boolean;
  packetPos: { x: number; y: number };
  macSrc: string;
  macDst: string;
  ipSrc: string;
  ipDst: string;
  portSrc: string;
  portDst: string;
  macStatus: "new" | "rewritten" | "destination";
  explanation: string;
}

export default function AddressFlowExample({
  topicId = "tcpip-addressing",
  scope = "local",
  values: propsValues,
  onChange,
}: Props) {
  const defaults: Record<string, unknown> = {
    addressType: "all",
    speed: 1,
  };

  const [stateValues, setStateValues] = useVizState<Record<string, unknown>>(
    topicId,
    scope,
    defaults
  );
  const values = propsValues ?? stateValues;

  // LOCAL STATE SYNCED WITH CONTROL PANEL DROPDOWN
  const [addressTypeFilter, setAddressTypeFilter] = useState<string>(
    (values.addressType as string) || "all"
  );

  useEffect(() => {
    if (values.addressType) {
      setAddressTypeFilter(values.addressType as string);
    }
  }, [values.addressType]);

  const speedParam = Number(values.speed ?? 1);
  const globalSpeed = useAppStore((state) => state.globalSpeedMultiplier) || 1;
  const effectiveSpeed = globalSpeed * speedParam;

  const rawId = useId();
  const shadowId = `flow-shadow-${rawId.replace(/:/g, "")}`;

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setFilter = (typeKey: string) => {
    setAddressTypeFilter(typeKey);
    const next = { ...values, addressType: typeKey };
    setStateValues(next);
    if (onChange) onChange(next);
  };

  // MULTI-HOP TOPOLOGY ADDRESS DATA (Forouzan Figures 2.20 & 2.21 Parity)
  const nodeA = { name: "Host A", ip: "10.0.0.10", mac: "00:1A:2B:00:00:10", port: "753" };
  const routerR1 = {
    name: "Router R1",
    if1: { ip: "10.0.0.1", mac: "00:1A:2B:00:00:01" },
    if2: { ip: "15.0.0.1", mac: "00:1A:2B:15:00:01" },
  };
  const routerR2 = {
    name: "Router R2",
    if1: { ip: "15.0.0.2", mac: "00:1A:2B:15:00:02" },
    if2: { ip: "20.0.0.1", mac: "00:1A:2B:20:00:01" },
  };
  const nodeB = { name: "Host B", ip: "20.0.0.20", mac: "00:1A:2B:20:00:87", port: "80" };

  // SPACIOUS X CENTERS FOR CANVAS NODES (ViewBox 920x240, Wire Y = 135)
  const X_CENTERS = {
    hostA: 90,
    r1: 320,
    r2: 600,
    hostB: 830,
  };

  // 7-STAGE MULTI-HOP TRAVERSAL STEPS
  const steps: StepDetail[] = [
    {
      stepIndex: 0,
      title: "1. Frame Assembly at Source Host A",
      stageName: "Host A (Source)",
      activeNode: "hostA",
      isNodeStep: true,
      packetPos: { x: X_CENTERS.hostA, y: 135 },
      macSrc: nodeA.mac,
      macDst: routerR1.if1.mac,
      ipSrc: nodeA.ip,
      ipDst: nodeB.ip,
      portSrc: "753",
      portDst: "80",
      macStatus: "new",
      explanation:
        "Host A prepares a message for Host B. Because Host B is on remote LAN 3 (20.0.0.0/24), Host A sets the Destination MAC to its local gateway: Router R1 Interface 1.",
    },
    {
      stepIndex: 1,
      title: "2. Hop 1: Host A ➔ Router R1 (LAN 1 Transit)",
      stageName: "Link 1 (LAN 1)",
      activeNode: "link1",
      isNodeStep: false,
      packetPos: { x: (X_CENTERS.hostA + X_CENTERS.r1) / 2, y: 135 },
      macSrc: nodeA.mac,
      macDst: routerR1.if1.mac,
      ipSrc: nodeA.ip,
      ipDst: nodeB.ip,
      portSrc: "753",
      portDst: "80",
      macStatus: "new",
      explanation:
        "The Ethernet frame travels across LAN 1 media. Router R1 accepts the frame on Interface 1 matching physical MAC address 00:1A:2B:00:00:01.",
    },
    {
      stepIndex: 2,
      title: "3. Router R1 Decapsulation & MAC Rewriting",
      stageName: "Router R1 Gateway",
      activeNode: "r1",
      isNodeStep: true,
      packetPos: { x: X_CENTERS.r1, y: 135 },
      macSrc: routerR1.if2.mac,
      macDst: routerR2.if1.mac,
      ipSrc: nodeA.ip,
      ipDst: nodeB.ip,
      portSrc: "753",
      portDst: "80",
      macStatus: "rewritten",
      explanation:
        "Router R1 strips Link 1 MAC header. It inspects Destination IP (20.0.0.20), looks up its routing table, and encapsulates the packet in a new Link 2 MAC header (Src MAC: R1 Intf 2, Dst MAC: R2 Intf 1). IP & Port headers remain constant!",
    },
    {
      stepIndex: 3,
      title: "4. Hop 2: Router R1 ➔ Router R2 (LAN 2 Transit)",
      stageName: "Link 2 (LAN 2 Transit WAN)",
      activeNode: "link2",
      isNodeStep: false,
      packetPos: { x: (X_CENTERS.r1 + X_CENTERS.r2) / 2, y: 135 },
      macSrc: routerR1.if2.mac,
      macDst: routerR2.if1.mac,
      ipSrc: nodeA.ip,
      ipDst: nodeB.ip,
      portSrc: "753",
      portDst: "80",
      macStatus: "rewritten",
      explanation:
        "The frame travels across intermediate transit network LAN 2. Router R2 receives the frame on Interface 1.",
    },
    {
      stepIndex: 4,
      title: "5. Router R2 Decapsulation & MAC Rewriting",
      stageName: "Router R2 Gateway",
      activeNode: "r2",
      isNodeStep: true,
      packetPos: { x: X_CENTERS.r2, y: 135 },
      macSrc: routerR2.if2.mac,
      macDst: nodeB.mac,
      ipSrc: nodeA.ip,
      ipDst: nodeB.ip,
      portSrc: "753",
      portDst: "80",
      macStatus: "rewritten",
      explanation:
        "Router R2 strips Link 2 MAC header. Seeing Host B is directly connected on LAN 3, Router R2 rewrites MAC header (Src MAC: R2 Intf 2, Dst MAC: Host B MAC). IP & Port headers remain constant!",
    },
    {
      stepIndex: 5,
      title: "6. Hop 3: Router R2 ➔ Host B (LAN 3 Transit)",
      stageName: "Link 3 (LAN 3)",
      activeNode: "link3",
      isNodeStep: false,
      packetPos: { x: (X_CENTERS.r2 + X_CENTERS.hostB) / 2, y: 135 },
      macSrc: routerR2.if2.mac,
      macDst: nodeB.mac,
      ipSrc: nodeA.ip,
      ipDst: nodeB.ip,
      portSrc: "753",
      portDst: "80",
      macStatus: "destination",
      explanation:
        "The frame travels across LAN 3. Host B's network interface card receives the frame matching its physical MAC address.",
    },
    {
      stepIndex: 6,
      title: "7. Delivery to Target Process at Destination Host B",
      stageName: "Host B (Destination)",
      activeNode: "hostB",
      isNodeStep: true,
      packetPos: { x: X_CENTERS.hostB, y: 135 },
      macSrc: routerR2.if2.mac,
      macDst: nodeB.mac,
      ipSrc: nodeA.ip,
      ipDst: nodeB.ip,
      portSrc: "753",
      portDst: "80",
      macStatus: "destination",
      explanation:
        "Host B strips physical & logical IP headers. Transport layer inspects Destination Port 80 and delivers payload to web server Process 'j'. Multi-hop delivery complete!",
    },
  ];

  const activeStep = steps[currentStep];

  // AUTOMATED ANIMATION TIMER LOOP
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const stepDelay = Math.max(1200 / effectiveSpeed, 400);
    timerRef.current = setTimeout(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, stepDelay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, effectiveSpeed, steps.length]);

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none">
      {/* ========================================================================= */}
      {/* CLEAN TOP PLAYBACK HUD */}
      {/* ========================================================================= */}
      <div className="bg-card border border-border rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (currentStep >= steps.length - 1) setCurrentStep(0);
              setIsPlaying(!isPlaying);
            }}
            className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
            title={isPlaying ? "Pause Animation" : "Play Path Animation"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStep((p) => Math.max(0, p - 1));
            }}
            disabled={currentStep === 0}
            className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 disabled:opacity-40 transition-colors"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStep((p) => Math.min(steps.length - 1, p + 1));
            }}
            disabled={currentStep === steps.length - 1}
            className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 disabled:opacity-40 transition-colors"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStep(0);
            }}
            className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
            title="Reset Path"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-border mx-1" />

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="font-extrabold text-foreground">
              Step {currentStep + 1}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{steps.length}</span>
          </div>
        </div>

        {/* INTERACTIVE LAYER FOCUS PILLS */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <span className="text-muted-foreground text-[11px] font-mono mr-1 hidden sm:flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Layer Focus:
          </span>
          {[
            { label: "All Addresses", key: "all" },
            { label: "Physical (MAC)", key: "physical" },
            { label: "Logical (IP)", key: "logical" },
            { label: "Port Address", key: "port" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
                addressTypeFilter === item.key
                  ? "bg-primary text-primary-foreground font-bold border-primary shadow-2xs"
                  : "bg-muted/60 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SVG NETWORK TOPOLOGY CANVAS (SPACIOUS 920x240, ZERO TRANSPARENCY, GENEROUS LINK BADGE PADDING) */}
      {/* ========================================================================= */}
      <div className="relative w-full rounded-2xl bg-card border border-border shadow-sm overflow-hidden p-2 sm:p-4 transition-colors">
        <svg viewBox="0 0 920 240" className="w-full h-auto overflow-visible font-sans">
          <defs>
            <pattern id="flow-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" className="fill-slate-300 dark:fill-slate-700/60" />
            </pattern>
            <filter id={shadowId} x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* Background Dot Grid */}
          <rect width="920" height="240" fill="url(#flow-grid)" opacity="0.75" />

          {/* ========================================================================= */}
          {/* CONNECTING LINK LINES & CLEAN UNCLUTTERED LINK SEGMENT BADGES */}
          {/* ========================================================================= */}
          {/* LAN 1 Link: Host A -> Router R1 */}
          <line
            x1={X_CENTERS.hostA}
            y1="135"
            x2={X_CENTERS.r1}
            y2="135"
            className={`stroke-2 transition-colors ${
              activeStep.activeNode === "link1"
                ? "stroke-primary stroke-[4px]"
                : "stroke-slate-400 dark:stroke-slate-600 stroke-dasharray-[4,4]"
            }`}
          />
          <g transform={`translate(${(X_CENTERS.hostA + X_CENTERS.r1) / 2}, 68)`}>
            <rect
              x="-68"
              y="-12"
              width="136"
              height="24"
              rx="12"
              className={`transition-colors ${
                activeStep.activeNode === "link1"
                  ? "fill-primary text-primary-foreground stroke-primary shadow-xs"
                  : "fill-card stroke-border stroke-1 shadow-2xs text-muted-foreground"
              }`}
            />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              className={`text-[9.5px] font-mono font-bold ${
                activeStep.activeNode === "link1" ? "fill-primary-foreground" : "fill-foreground"
              }`}
            >
              LAN 1 (10.0.0.0/24)
            </text>
          </g>

          {/* LAN 2 Link: Router R1 -> Router R2 */}
          <line
            x1={X_CENTERS.r1}
            y1="135"
            x2={X_CENTERS.r2}
            y2="135"
            className={`stroke-2 transition-colors ${
              activeStep.activeNode === "link2"
                ? "stroke-primary stroke-[4px]"
                : "stroke-slate-400 dark:stroke-slate-600 stroke-dasharray-[4,4]"
            }`}
          />
          <g transform={`translate(${(X_CENTERS.r1 + X_CENTERS.r2) / 2}, 68)`}>
            <rect
              x="-88"
              y="-12"
              width="176"
              height="24"
              rx="12"
              className={`transition-colors ${
                activeStep.activeNode === "link2"
                  ? "fill-primary text-primary-foreground stroke-primary shadow-xs"
                  : "fill-card stroke-border stroke-1 shadow-2xs text-muted-foreground"
              }`}
            />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              className={`text-[9.5px] font-mono font-bold ${
                activeStep.activeNode === "link2" ? "fill-primary-foreground" : "fill-foreground"
              }`}
            >
              LAN 2 Transit (15.0.0.0/24)
            </text>
          </g>

          {/* LAN 3 Link: Router R2 -> Host B */}
          <line
            x1={X_CENTERS.r2}
            y1="135"
            x2={X_CENTERS.hostB}
            y2="135"
            className={`stroke-2 transition-colors ${
              activeStep.activeNode === "link3"
                ? "stroke-primary stroke-[4px]"
                : "stroke-slate-400 dark:stroke-slate-600 stroke-dasharray-[4,4]"
            }`}
          />
          <g transform={`translate(${(X_CENTERS.r2 + X_CENTERS.hostB) / 2}, 68)`}>
            <rect
              x="-68"
              y="-12"
              width="136"
              height="24"
              rx="12"
              className={`transition-colors ${
                activeStep.activeNode === "link3"
                  ? "fill-primary text-primary-foreground stroke-primary shadow-xs"
                  : "fill-card stroke-border stroke-1 shadow-2xs text-muted-foreground"
              }`}
            />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              className={`text-[9.5px] font-mono font-bold ${
                activeStep.activeNode === "link3" ? "fill-primary-foreground" : "fill-foreground"
              }`}
            >
              LAN 3 (20.0.0.0/24)
            </text>
          </g>

          {/* ========================================================================= */}
          {/* SOLID TOPOLOGY NODE CARDS (ZERO TRANSPARENCY, HIGH CONTRAST) */}
          {/* ========================================================================= */}
          {/* NODE 1: HOST A (SENDER) */}
          <g transform={`translate(${X_CENTERS.hostA}, 135)`}>
            <rect
              x="-62"
              y="-46"
              width="124"
              height="116"
              rx="14"
              filter={`url(#${shadowId})`}
              className={`transition-all duration-200 fill-card ${
                activeStep.activeNode === "hostA"
                  ? "stroke-emerald-500 stroke-[2.5px] shadow-lg"
                  : "stroke-border stroke-1"
              }`}
            />
            <Monitor width={22} height={22} x={-11} y={-34} className="text-emerald-600 dark:text-emerald-400" />
            <text x="0" y="-2" textAnchor="middle" className="text-[11px] font-extrabold fill-foreground">
              Host A
            </text>

            {/* SELF-CONTAINED INTEGRATED NODE DETAILS */}
            <line x1="-50" y1="9" x2="50" y2="9" className="stroke-border stroke-1 opacity-70" />
            <text x="0" y="23" textAnchor="middle" className="text-[9px] font-mono fill-emerald-600 dark:fill-emerald-400 font-bold">
              IP: {nodeA.ip}
            </text>
            <text x="0" y="38" textAnchor="middle" className="text-[8.5px] font-mono fill-muted-foreground">
              MAC: ..00:10
            </text>
            <text x="0" y="53" textAnchor="middle" className="text-[8.5px] font-mono fill-sky-600 dark:fill-sky-400 font-bold">
              Port 753 (Process a)
            </text>
          </g>

          {/* NODE 2: ROUTER R1 */}
          <g transform={`translate(${X_CENTERS.r1}, 135)`}>
            <rect
              x="-80"
              y="-46"
              width="160"
              height="116"
              rx="14"
              filter={`url(#${shadowId})`}
              className={`transition-all duration-200 fill-card ${
                activeStep.activeNode === "r1"
                  ? "stroke-indigo-500 stroke-[2.5px] shadow-lg"
                  : "stroke-border stroke-1"
              }`}
            />
            <HardDrive width={22} height={22} x={-11} y={-34} className="text-indigo-600 dark:text-indigo-400" />
            <text x="0" y="-2" textAnchor="middle" className="text-[11px] font-extrabold fill-foreground">
              Router R1
            </text>

            {/* SELF-CONTAINED INTEGRATED INTERFACE DETAILS */}
            <line x1="-68" y1="9" x2="68" y2="9" className="stroke-border stroke-1 opacity-70" />
            <text x="0" y="23" textAnchor="middle" className="text-[8.5px] font-mono fill-indigo-600 dark:fill-indigo-400 font-bold">
              Int1: 10.0.0.1 (MAC ..00:01)
            </text>
            <text x="0" y="38" textAnchor="middle" className="text-[8.5px] font-mono fill-indigo-600 dark:fill-indigo-400 font-bold">
              Int2: 15.0.0.1 (MAC ..15:01)
            </text>
            <text x="0" y="53" textAnchor="middle" className="text-[8px] font-mono fill-muted-foreground">
              Gateway LAN 1 ➔ LAN 2
            </text>
          </g>

          {/* NODE 3: ROUTER R2 */}
          <g transform={`translate(${X_CENTERS.r2}, 135)`}>
            <rect
              x="-80"
              y="-46"
              width="160"
              height="116"
              rx="14"
              filter={`url(#${shadowId})`}
              className={`transition-all duration-200 fill-card ${
                activeStep.activeNode === "r2"
                  ? "stroke-indigo-500 stroke-[2.5px] shadow-lg"
                  : "stroke-border stroke-1"
              }`}
            />
            <HardDrive width={22} height={22} x={-11} y={-34} className="text-indigo-600 dark:text-indigo-400" />
            <text x="0" y="-2" textAnchor="middle" className="text-[11px] font-extrabold fill-foreground">
              Router R2
            </text>

            {/* SELF-CONTAINED INTEGRATED INTERFACE DETAILS */}
            <line x1="-68" y1="9" x2="68" y2="9" className="stroke-border stroke-1 opacity-70" />
            <text x="0" y="23" textAnchor="middle" className="text-[8.5px] font-mono fill-indigo-600 dark:fill-indigo-400 font-bold">
              Int1: 15.0.0.2 (MAC ..15:02)
            </text>
            <text x="0" y="38" textAnchor="middle" className="text-[8.5px] font-mono fill-indigo-600 dark:fill-indigo-400 font-bold">
              Int2: 20.0.0.1 (MAC ..20:01)
            </text>
            <text x="0" y="53" textAnchor="middle" className="text-[8px] font-mono fill-muted-foreground">
              Gateway LAN 2 ➔ LAN 3
            </text>
          </g>

          {/* NODE 4: HOST B (RECEIVER) */}
          <g transform={`translate(${X_CENTERS.hostB}, 135)`}>
            <rect
              x="-62"
              y="-46"
              width="124"
              height="116"
              rx="14"
              filter={`url(#${shadowId})`}
              className={`transition-all duration-200 fill-card ${
                activeStep.activeNode === "hostB"
                  ? "stroke-emerald-500 stroke-[2.5px] shadow-lg"
                  : "stroke-border stroke-1"
              }`}
            />
            <Server width={22} height={22} x={-11} y={-34} className="text-emerald-600 dark:text-emerald-400" />
            <text x="0" y="-2" textAnchor="middle" className="text-[11px] font-extrabold fill-foreground">
              Host B
            </text>

            {/* SELF-CONTAINED INTEGRATED NODE DETAILS */}
            <line x1="-50" y1="9" x2="50" y2="9" className="stroke-border stroke-1 opacity-70" />
            <text x="0" y="23" textAnchor="middle" className="text-[9px] font-mono fill-emerald-600 dark:fill-emerald-400 font-bold">
              IP: {nodeB.ip}
            </text>
            <text x="0" y="38" textAnchor="middle" className="text-[8.5px] font-mono fill-muted-foreground">
              MAC: ..00:87
            </text>
            <text x="0" y="53" textAnchor="middle" className="text-[8.5px] font-mono fill-sky-600 dark:fill-sky-400 font-bold">
              Port 80 (Process j)
            </text>
          </g>

          {/* ========================================================================= */}
          {/* ANIMATED PACKET PULSE POINT (CLEAN SOLID GLOW) */}
          {/* ========================================================================= */}
          <g
            transform={`translate(${activeStep.packetPos.x}, ${activeStep.packetPos.y})`}
            className="transition-transform duration-500 ease-out z-20"
          >
            <circle r="14" className="fill-primary/30 animate-ping" />
            <circle r="9" className="fill-primary stroke-primary-foreground stroke-2 shadow-md" />
            <circle r="4.5" className="fill-primary-foreground" />
          </g>
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM SPECIFICATIONS GRID */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Active Trajectory Step */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-border pb-2">
            <Info className="w-4 h-4 text-sky-500" /> Step Explanation
          </span>
          <div className="space-y-1">
            <div className="text-xs font-extrabold text-foreground">
              {activeStep.title}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {activeStep.explanation}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-between text-[11px] font-mono border-t border-border/60">
            <span className="text-muted-foreground">Hop Stage:</span>
            <span className="font-bold text-primary">{activeStep.stageName}</span>
          </div>
        </div>

        {/* Card 2: Physical MAC Rewriting vs End-to-End Scope */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-border pb-2">
            <Network className="w-4 h-4 text-emerald-500" /> Address Rewriting Rule
          </span>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground">Physical MAC (Hop-by-Hop):</span>
                <span className="text-muted-foreground ml-1">
                  Rewritten at every router interface. Current:{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-[10.5px] font-mono">
                    {activeStep.macSrc.slice(-5)} ➔ {activeStep.macDst.slice(-5)}
                  </code>
                </span>
              </div>
            </div>
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground">Logical IP (End-to-End):</span>
                <span className="text-muted-foreground ml-1">
                  Stays constant across all hops:{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-[10.5px] font-mono">
                    {activeStep.ipSrc} ➔ {activeStep.ipDst}
                  </code>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Address Layer Focus Inspector */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-border pb-2">
            <Layers className="w-4 h-4 text-purple-500" /> Layer Address Focus
          </span>
          <div className="space-y-1.5 text-xs font-mono">
            <div className={`p-1.5 rounded border transition-all ${
              addressTypeFilter === "physical" || addressTypeFilter === "all"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                : "opacity-40 border-border"
            }`}>
              <div className="font-bold flex items-center justify-between">
                <span>MAC: {activeStep.macSrc.slice(-5)} ➔ {activeStep.macDst.slice(-5)}</span>
                <span className="text-[9px] uppercase px-1 rounded bg-amber-500/20">
                  {activeStep.macStatus}
                </span>
              </div>
            </div>

            <div className={`p-1.5 rounded border transition-all ${
              addressTypeFilter === "logical" || addressTypeFilter === "all"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "opacity-40 border-border"
            }`}>
              <div className="font-bold flex items-center justify-between">
                <span>IP: {activeStep.ipSrc} ➔ {activeStep.ipDst}</span>
                <span className="text-[9px] uppercase px-1 rounded bg-emerald-500/20">Constant</span>
              </div>
            </div>

            <div className={`p-1.5 rounded border transition-all ${
              addressTypeFilter === "port" || addressTypeFilter === "all"
                ? "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400"
                : "opacity-40 border-border"
            }`}>
              <div className="font-bold flex items-center justify-between">
                <span>Port: {activeStep.portSrc} ➔ {activeStep.portDst}</span>
                <span className="text-[9px] uppercase px-1 rounded bg-sky-500/20">Constant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
