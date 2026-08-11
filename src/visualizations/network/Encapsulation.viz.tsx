import { useState, useEffect, useRef, useId } from "react";
import { type VizMeta } from "../types";
import { useAppStore } from "../../state/appStore";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  ArrowDown,
  ArrowUp,
  Layers,
  Info,
  CheckCircle2,
  Lock,
} from "lucide-react";

export const vizMeta: VizMeta = {
  key: "network-encapsulation",
  title: "Encapsulation Across OSI Layers",
  category: "network",
  renderer: "svg",
  animated: false,
  params: [
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
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

interface StepInfo {
  layerNum: number;
  layerName: string;
  pduName: string;
  phase: "encapsulation" | "medium" | "decapsulation";
  actionTitle: string;
  actionDesc: string;
  headerAdded?: string;
  trailerAdded?: string;
}

export default function Encapsulation({ values }: Props) {
  const speedParam = Number(values.speed ?? 1);

  const globalSpeed = useAppStore((state) => state.globalSpeedMultiplier) || 1;
  const effectiveSpeed = globalSpeed * speedParam;

  const rawId = useId();
  const filterGlowId = `glow-${rawId.replace(/:/g, "")}`;
  const filterArrowGlowId = `glow-arrow-${rawId.replace(/:/g, "")}`;

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // UNIFIED 15-STEP END-TO-END DATA EXCHANGE SEQUENCE (Encapsulation -> Medium -> Decapsulation)
  const fullSteps: StepInfo[] = [
    // --- ENCAPSULATION PHASE (Steps 0 - 6) ---
    {
      layerNum: 7,
      layerName: "Sender Application Layer",
      pduName: "User Data (D7)",
      phase: "encapsulation",
      actionTitle: "1. Application Data Generation",
      actionDesc:
        "Host A application creates raw user message data (D7) and prepends Application Header (H7).",
      headerAdded: "H7",
    },
    {
      layerNum: 6,
      layerName: "Sender Presentation Layer",
      pduName: "Data (D6)",
      phase: "encapsulation",
      actionTitle: "2. Formatting & Encryption",
      actionDesc:
        "Presentation layer formats, compresses, or encrypts payload and prepends Presentation Header (H6).",
      headerAdded: "H6",
    },
    {
      layerNum: 5,
      layerName: "Sender Session Layer",
      pduName: "Data (D5)",
      phase: "encapsulation",
      actionTitle: "3. Session Control",
      actionDesc:
        "Session layer inserts synchronization checkpoints and prepends Session Header (H5).",
      headerAdded: "H5",
    },
    {
      layerNum: 4,
      layerName: "Sender Transport Layer",
      pduName: "Segment (D4)",
      phase: "encapsulation",
      actionTitle: "4. Process Transport & Port Numbers",
      actionDesc:
        "Transport layer splits data into segments, assigns port numbers, and prepends Transport Header (H4).",
      headerAdded: "H4",
    },
    {
      layerNum: 3,
      layerName: "Sender Network Layer",
      pduName: "Packet (D3)",
      phase: "encapsulation",
      actionTitle: "5. Logical IP Addressing",
      actionDesc:
        "Network layer adds source/destination IP addresses and prepends Network Header (H3).",
      headerAdded: "H3",
    },
    {
      layerNum: 2,
      layerName: "Sender Data Link Layer",
      pduName: "Frame (D2)",
      phase: "encapsulation",
      actionTitle: "6. Framing & MAC Prepending",
      actionDesc:
        "Data Link layer prepends MAC physical addresses (H2) and appends Frame Check Sequence trailer (T2).",
      headerAdded: "H2",
      trailerAdded: "T2",
    },
    {
      layerNum: 1,
      layerName: "Sender Physical Layer",
      pduName: "Bitstream",
      phase: "encapsulation",
      actionTitle: "7. Bitstream Encoding",
      actionDesc:
        "Physical layer converts formatted frame into raw binary bits with synchronization preamble (010).",
    },

    // --- TRANSMISSION MEDIUM PHASE (Step 7) ---
    {
      layerNum: 0,
      layerName: "Transmission Medium",
      pduName: "Signals / Pulses",
      phase: "medium",
      actionTitle: "8. Medium Signal Transit",
      actionDesc:
        "Electrical / optical pulses travel across physical transmission medium (cable/wireless) from Host A to Host B.",
    },

    // --- DECAPSULATION PHASE (Steps 8 - 14) ---
    {
      layerNum: 1,
      layerName: "Receiver Physical Layer",
      pduName: "Bitstream",
      phase: "decapsulation",
      actionTitle: "9. Signal Pickup & Bit Sync",
      actionDesc:
        "Host B Physical layer receives incoming signals, decodes preamble (010), and passes bitstream to Data Link layer.",
    },
    {
      layerNum: 2,
      layerName: "Receiver Data Link Layer",
      pduName: "Frame (D2)",
      phase: "decapsulation",
      actionTitle: "10. MAC Address Check & Decapsulation",
      actionDesc:
        "Data Link layer verifies CRC trailer (T2), confirms MAC address, and strips H2 header & T2 trailer.",
      headerAdded: "H2 (Stripped)",
      trailerAdded: "T2 (Stripped)",
    },
    {
      layerNum: 3,
      layerName: "Receiver Network Layer",
      pduName: "Packet (D3)",
      phase: "decapsulation",
      actionTitle: "11. Destination IP Inspection",
      actionDesc:
        "Network layer verifies target IP address in IP header (H3), strips H3, and passes packet to Transport layer.",
      headerAdded: "H3 (Stripped)",
    },
    {
      layerNum: 4,
      layerName: "Receiver Transport Layer",
      pduName: "Segment (D4)",
      phase: "decapsulation",
      actionTitle: "12. Port Matching & Segment Reassembly",
      actionDesc:
        "Transport layer inspects destination port number in TCP/UDP header (H4), strips H4, and passes payload up.",
      headerAdded: "H4 (Stripped)",
    },
    {
      layerNum: 5,
      layerName: "Receiver Session Layer",
      pduName: "Data (D5)",
      phase: "decapsulation",
      actionTitle: "13. Session State Synchronization",
      actionDesc:
        "Session layer validates dialog control state, strips H5 header, and forwards payload to Presentation layer.",
      headerAdded: "H5 (Stripped)",
    },
    {
      layerNum: 6,
      layerName: "Receiver Presentation Layer",
      pduName: "Data (D6)",
      phase: "decapsulation",
      actionTitle: "14. Decryption & Syntax Decoding",
      actionDesc:
        "Presentation layer decrypts payload, decompresses data, strips H6 header, and passes D7 data to Application layer.",
      headerAdded: "H6 (Stripped)",
    },
    {
      layerNum: 7,
      layerName: "Receiver Application Layer",
      pduName: "User Data (D7)",
      phase: "decapsulation",
      actionTitle: "15. Final Data Delivery to App",
      actionDesc:
        "Final H7 header is stripped, delivering clean original user message (D7) to Host B application!",
      headerAdded: "H7 (Stripped)",
    },
  ];

  const activeStepInfo = fullSteps[currentStep] || fullSteps[0];

  // Auto-play timer loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const intervalMs = 1500 / effectiveSpeed;

    timerRef.current = setTimeout(() => {
      setCurrentStep((prev) => {
        if (prev >= fullSteps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, fullSteps.length, effectiveSpeed]);

  const handleTogglePlay = () => {
    if (currentStep >= fullSteps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleStepPrev = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(fullSteps.length - 1, prev + 1));
  };

  // FAST FORWARD / JUMP CONTROL BUTTONS
  const handleJumpToEncapsulation = () => {
    setCurrentStep(0);
    // setIsPlaying(true);
  };

  const handleJumpToDecapsulation = () => {
    setCurrentStep(7); // Jump to Transmission Medium / start of Receiver Decapsulation
    // setIsPlaying(true);
  };

  // SVG Canvas dimensions
  const width = 760;
  const height = 500;

  const senderCx = 190;
  const receiverCx = 570;

  const rowYMap: Record<number, number> = {
    7: 100, // L7 Application
    6: 140, // L6 Presentation
    5: 180, // L5 Session
    4: 220, // L4 Transport
    3: 260, // L3 Network
    2: 300, // L2 Data Link
    1: 340, // L1 Physical
    0: 425, // Medium Pipe
  };

  const headerFill = "fill-amber-500 dark:fill-amber-600";
  const headerStroke = "stroke-amber-600 dark:stroke-amber-400";

  const getLayerDataColor = (layerNum: number) => {
    switch (layerNum) {
      case 7:
      case 6:
      case 5:
        return {
          fill: "fill-[#e6c5a8] dark:fill-[#966b47]",
          stroke: "stroke-[#c49a74] dark:stroke-[#b8855a]",
          text: "fill-amber-950 dark:fill-amber-100",
        };
      case 4:
        return {
          fill: "fill-lime-400 dark:fill-lime-600",
          stroke: "stroke-lime-600 dark:stroke-lime-400",
          text: "fill-lime-950 dark:fill-lime-100",
        };
      case 3:
        return {
          fill: "fill-sky-300 dark:fill-sky-600",
          stroke: "stroke-sky-500 dark:stroke-sky-400",
          text: "fill-sky-950 dark:fill-sky-100",
        };
      case 2:
      case 1:
        return {
          fill: "fill-yellow-300 dark:fill-yellow-500",
          stroke: "stroke-yellow-500 dark:stroke-yellow-400",
          text: "fill-yellow-950 dark:fill-yellow-100",
        };
      default:
        return {
          fill: "fill-slate-200 dark:fill-slate-700",
          stroke: "stroke-slate-400 dark:stroke-slate-500",
          text: "fill-slate-900 dark:fill-slate-100",
        };
    }
  };

  // Sender stack populates from Step 0 to 6, then stays fully assembled as reference
  const isSenderLayerActive = (layerNum: number) => {
    if (currentStep < 7) {
      return currentStep >= 7 - layerNum;
    }
    return true;
  };

  // Receiver stack starts populating from Step 7/8 upwards
  const isReceiverLayerActive = (layerNum: number) => {
    if (currentStep < 7) return false;
    if (currentStep === 7) return layerNum === 0;
    return layerNum <= currentStep - 7;
  };

  const isLayerHighlighted = (layerNum: number, isSender: boolean) => {
    if (isSender && activeStepInfo.phase === "encapsulation") {
      return activeStepInfo.layerNum === layerNum;
    }
    if (!isSender && activeStepInfo.phase === "decapsulation") {
      return activeStepInfo.layerNum === layerNum;
    }
    return false;
  };

  // DYNAMIC ARROWS VISIBILITY & ILLUMINATION
  const isSenderHostArrowActive =
    currentStep === 0 ||
    (activeStepInfo.phase === "encapsulation" && activeStepInfo.layerNum === 7);
  const isSenderToMediumArrowActive = currentStep === 6 || currentStep === 7;
  const isMediumActive = currentStep === 7;
  const isMediumToReceiverArrowActive = currentStep === 7 || currentStep === 8;
  const isReceiverHostArrowActive =
    currentStep === 14 ||
    (activeStepInfo.phase === "decapsulation" && activeStepInfo.layerNum === 7);

  return (
    <div className="flex flex-col space-y-4 p-4 sm:p-6 bg-card rounded-2xl border shadow-sm font-sans select-none">
      {/* PLAYBACK CONTROL HUD TOOLBAR */}
      <div className="bg-card border border-border rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
            title={
              isPlaying ? "Pause Animation" : "Play Full Exchange Animation"
            }
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleStepPrev}
            disabled={currentStep === 0}
            className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 disabled:opacity-40 transition-colors"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={handleStepNext}
            disabled={currentStep === fullSteps.length - 1}
            className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 disabled:opacity-40 transition-colors"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
            title="Reset to Start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-border mx-1" />

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="font-extrabold text-foreground">
              Step {currentStep + 1}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{fullSteps.length}</span>
          </div>
        </div>

        {/* PHASE JUMP FAST-FORWARD CONTROLS */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border">
          <button
            onClick={handleJumpToEncapsulation}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeStepInfo.phase === "encapsulation"
                ? "bg-amber-500 text-white shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Jump to Encapsulation phase (Host A)"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>1. Send (Encapsulate)</span>
          </button>

          <button
            onClick={handleJumpToDecapsulation}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeStepInfo.phase === "decapsulation" ||
              activeStepInfo.phase === "medium"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Jump to Medium Transit & Decapsulation phase (Host B)"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>2. Receive (Decapsulate)</span>
          </button>
        </div>
      </div>

      {/* FULL-WIDTH RESPONSIVE SVG CANVAS */}
      <div className="w-full border rounded-2xl bg-slate-100/80 dark:bg-slate-950/90 relative overflow-hidden shadow-inner border-slate-200/80 dark:border-slate-800 min-h-[260px] sm:min-h-[380px] md:min-h-[460px] flex items-center justify-center p-2 sm:p-4 transition-colors duration-300">
        {/* Ambient Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-25 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto text-foreground relative z-10 select-none"
        >
          <defs>
            {/* Glow Filter for Active Layer */}
            <filter
              id={filterGlowId}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Glow Filter for Active Arrows */}
            <filter
              id={filterArrowGlowId}
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
            >
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Linear Gradients for Transmission Pipe */}
            <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#475569" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#64748b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#475569" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient
              id="pipeActiveGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#d97706" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* MAIN GRAPHICS GROUP SHIFTED DOWNWARD */}
          <g transform="translate(0, 25)">
            {/* SENDER WORKSTATION NODE (HOST A) */}
            <g transform={`translate(${senderCx - 40}, 12)`}>
              <rect
                x="0"
                y="0"
                width="80"
                height="48"
                rx="8"
                className="fill-slate-900 dark:fill-slate-900 stroke-slate-700 dark:stroke-slate-600 stroke-2 shadow-md"
              />
              <rect
                x="5"
                y="5"
                width="70"
                height="30"
                rx="4"
                className="fill-slate-950 stroke-sky-500/40 stroke-1"
              />
              <rect
                x="5"
                y="5"
                width="70"
                height="8"
                rx="2"
                className="fill-slate-800"
              />
              <circle cx="10" cy="9" r="1.5" className="fill-red-400" />
              <circle cx="15" cy="9" r="1.5" className="fill-yellow-400" />
              <circle cx="20" cy="9" r="1.5" className="fill-green-400" />
              <text
                x="40"
                y="26"
                textAnchor="middle"
                className="fill-sky-400 font-mono font-bold text-[10px] tracking-wider"
              >
                HOST A
              </text>
              <path
                d="M 32 48 L 48 48 L 54 56 L 26 56 Z"
                className="fill-slate-400 dark:fill-slate-700 stroke-slate-500 dark:stroke-slate-600"
              />
              <rect
                x="8"
                y="-18"
                width="64"
                height="14"
                rx="4"
                className="fill-slate-200 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700"
              />
              <text
                x="40"
                y="-8"
                textAnchor="middle"
                className="fill-slate-800 dark:fill-slate-200 font-black text-[9px] uppercase tracking-widest"
              >
                Sender
              </text>
            </g>

            {/* RECEIVER WORKSTATION NODE (HOST B) */}
            <g transform={`translate(${receiverCx - 40}, 12)`}>
              <rect
                x="0"
                y="0"
                width="80"
                height="48"
                rx="8"
                className="fill-slate-900 dark:fill-slate-900 stroke-slate-700 dark:stroke-slate-600 stroke-2 shadow-md"
              />
              <rect
                x="5"
                y="5"
                width="70"
                height="30"
                rx="4"
                className="fill-slate-950 stroke-emerald-500/40 stroke-1"
              />
              <rect
                x="5"
                y="5"
                width="70"
                height="8"
                rx="2"
                className="fill-slate-800"
              />
              <circle cx="10" cy="9" r="1.5" className="fill-red-400" />
              <circle cx="15" cy="9" r="1.5" className="fill-yellow-400" />
              <circle cx="20" cy="9" r="1.5" className="fill-green-400" />
              <text
                x="40"
                y="26"
                textAnchor="middle"
                className="fill-emerald-400 font-mono font-bold text-[10px] tracking-wider"
              >
                HOST B
              </text>
              <path
                d="M 32 48 L 48 48 L 54 56 L 26 56 Z"
                className="fill-slate-400 dark:fill-slate-700 stroke-slate-500 dark:stroke-slate-600"
              />
              <rect
                x="8"
                y="-18"
                width="64"
                height="14"
                rx="4"
                className="fill-slate-200 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700"
              />
              <text
                x="40"
                y="-8"
                textAnchor="middle"
                className="fill-slate-800 dark:fill-slate-200 font-black text-[9px] uppercase tracking-widest"
              >
                Receiver
              </text>
            </g>

            {/* SENDER STAIRCASE ROWS (LAYERS 7 -> 1) */}
            {[7, 6, 5, 4, 3, 2, 1].map((layerNum) => {
              const y = rowYMap[layerNum];
              const isActive = isSenderLayerActive(layerNum);
              const isHighlighted = isLayerHighlighted(layerNum, true);
              const colors = getLayerDataColor(layerNum);

              const dataWMap: Record<number, number> = {
                7: 80,
                6: 100,
                5: 120,
                4: 140,
                3: 160,
                2: 160,
                1: 184,
              };

              const headerW = 28;
              const dataW = dataWMap[layerNum];
              const trailerW = layerNum === 2 ? 28 : 0;
              const totalW =
                layerNum === 1 ? 32 + dataW : headerW + dataW + trailerW;

              const rightEdgeX = senderCx + 105;
              const startX = rightEdgeX - totalW;

              if (!isActive) return null;

              return (
                <g
                  key={`sender-l${layerNum}`}
                  transform={`translate(0, ${y - 14})`}
                  className="transition-all duration-300"
                  filter={isHighlighted ? `url(#${filterGlowId})` : undefined}
                >
                  {/* Active Layer Glowing Border */}
                  {isHighlighted && (
                    <rect
                      x={startX - 3}
                      y="-3"
                      width={totalW + 6}
                      height="34"
                      rx="6"
                      className="fill-none stroke-amber-500 stroke-2 animate-pulse"
                    />
                  )}

                  {/* Layer Number Pill Tag on Left */}
                  <g transform={`translate(${startX - 32}, 2)`}>
                    <rect
                      x="0"
                      y="0"
                      width="24"
                      height="24"
                      rx="4"
                      className={`transition-colors ${
                        isHighlighted
                          ? "fill-amber-500 text-white"
                          : "fill-slate-200 dark:fill-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    />
                    <text
                      x="12"
                      y="16"
                      textAnchor="middle"
                      className="fill-current font-mono font-bold text-[10px]"
                    >
                      L{layerNum}
                    </text>
                  </g>

                  {layerNum === 1 ? (
                    /* Layer 1: Bitstream */
                    <g>
                      {/* Preamble Chip (010) */}
                      <rect
                        x={startX}
                        y="0"
                        width="32"
                        height="28"
                        rx="4"
                        className="fill-amber-600 dark:fill-amber-700 stroke-amber-700 dark:stroke-amber-500 stroke-1.5"
                      />
                      <text
                        x={startX + 16}
                        y="18"
                        textAnchor="middle"
                        className="fill-white font-mono font-extrabold text-[10px]"
                      >
                        010
                      </text>

                      {/* Raw Bitstream Box */}
                      <rect
                        x={startX + 34}
                        y="0"
                        width={totalW - 34}
                        height="28"
                        rx="4"
                        className={`${colors.fill} ${colors.stroke} stroke-1.5`}
                      />
                      <text
                        x={startX + 34 + (totalW - 34) / 2}
                        y="18"
                        textAnchor="middle"
                        className={`${colors.text} font-mono font-bold text-[9.5px] tracking-wider`}
                      >
                        010101010101101010000010000
                      </text>
                    </g>
                  ) : (
                    /* Layers 7 - 2: Encapsulated Headers + Data */
                    <g>
                      {/* Header Block (H7..H2) */}
                      <rect
                        x={startX}
                        y="0"
                        width={headerW}
                        height="28"
                        rx="4"
                        className={`${headerFill} ${headerStroke} stroke-1.5`}
                      />
                      <text
                        x={startX + headerW / 2}
                        y="18"
                        textAnchor="middle"
                        className="fill-white font-mono font-black text-xs"
                      >
                        H{layerNum}
                      </text>

                      {/* Data Payload Block (D7..D2) */}
                      <rect
                        x={startX + headerW + 2}
                        y="0"
                        width={dataW - 2}
                        height="28"
                        rx="4"
                        className={`${colors.fill} ${colors.stroke} stroke-1.5`}
                      />
                      <text
                        x={startX + headerW + dataW / 2}
                        y="18"
                        textAnchor="middle"
                        className={`${colors.text} font-mono font-extrabold text-xs`}
                      >
                        D{layerNum}
                      </text>

                      {/* Trailer Block (T2 for Layer 2) */}
                      {layerNum === 2 && (
                        <g
                          transform={`translate(${startX + headerW + dataW + 2}, 0)`}
                        >
                          <rect
                            x="0"
                            y="0"
                            width={trailerW - 2}
                            height="28"
                            rx="4"
                            className="fill-slate-400 dark:fill-slate-600 stroke-slate-500 dark:stroke-slate-400 stroke-1.5"
                          />
                          <text
                            x={trailerW / 2}
                            y="18"
                            textAnchor="middle"
                            className="fill-white font-mono font-black text-xs"
                          >
                            T2
                          </text>
                        </g>
                      )}
                    </g>
                  )}
                </g>
              );
            })}

            {/* DYNAMIC SENDER TO TRANSMISSION MEDIUM DOWNWARD PIPE ARROW */}
            <g transform={`translate(${senderCx}, 365)`}>
              <path
                d="M 0 0 L 0 32 L 95 32 L 95 43"
                fill="none"
                stroke={
                  isSenderToMediumArrowActive ? "#f59e0b" : "currentColor"
                }
                strokeWidth={isSenderToMediumArrowActive ? "3.5" : "1.5"}
                strokeLinejoin="round"
                strokeLinecap="round"
                className={`${
                  isSenderToMediumArrowActive
                    ? "opacity-100 animate-pulse"
                    : "opacity-20 text-slate-400 dark:text-slate-600"
                } transition-all duration-300`}
                filter={
                  isSenderToMediumArrowActive
                    ? `url(#${filterArrowGlowId})`
                    : undefined
                }
              />
              <polygon
                points="90,41 100,41 95,49"
                fill={isSenderToMediumArrowActive ? "#f59e0b" : "currentColor"}
                className={`${
                  isSenderToMediumArrowActive
                    ? "opacity-100"
                    : "opacity-20 text-slate-400 dark:text-slate-600"
                } transition-all duration-300`}
              />
            </g>

            {/* TRANSMISSION MEDIUM CYLINDRICAL PIPE & DYNAMIC PULSES */}
            <g transform={`translate(${width / 2 - 100}, 412)`}>
              {/* Outer Shell */}
              <rect
                x="0"
                y="0"
                width="200"
                height="34"
                rx="17"
                className={`transition-colors duration-300 ${
                  isMediumActive
                    ? "fill-slate-800 stroke-amber-500 stroke-2"
                    : "fill-slate-300 dark:fill-slate-800 stroke-slate-400 dark:stroke-slate-700 stroke-1.5"
                }`}
              />
              {/* Inner Tube */}
              <rect
                x="3"
                y="3"
                width="194"
                height="28"
                rx="14"
                fill={
                  isMediumActive ? "url(#pipeActiveGrad)" : "url(#pipeGrad)"
                }
                className="stroke-slate-500/50 stroke-1 transition-all duration-300"
              />

              {/* Pulse Signals inside Pipe (ONLY ANIMATE WHEN DATA IS IN MEDIUM AT STEP 7) */}
              {isMediumActive && (
                <g className="animate-pulse">
                  <rect
                    x="25"
                    y="10"
                    width="12"
                    height="12"
                    rx="3"
                    fill="#ffffff"
                  />
                  <rect
                    x="60"
                    y="10"
                    width="12"
                    height="12"
                    rx="3"
                    fill="#ffffff"
                  />
                  <rect
                    x="95"
                    y="10"
                    width="12"
                    height="12"
                    rx="3"
                    fill="#ffffff"
                  />
                  <rect
                    x="130"
                    y="10"
                    width="12"
                    height="12"
                    rx="3"
                    fill="#ffffff"
                  />
                  <rect
                    x="165"
                    y="10"
                    width="12"
                    height="12"
                    rx="3"
                    fill="#ffffff"
                  />
                </g>
              )}

              {/* Pipe Label Badge */}
              <rect
                x="40"
                y="7"
                width="120"
                height="20"
                rx="5"
                className="fill-slate-950/85 backdrop-blur-xs stroke-slate-700"
              />
              <text
                x="100"
                y="21"
                textAnchor="middle"
                className="fill-slate-100 font-mono font-bold text-[9.5px] tracking-wider uppercase"
              >
                Transmission Medium
              </text>
            </g>

            {/* DYNAMIC TRANSMISSION MEDIUM TO RECEIVER UPWARD PIPE ARROW */}
            <g transform={`translate(${width / 2 + 95}, 412)`}>
              <path
                d="M 0 0 L 0 -32 L 95 -32 L 95 -45"
                fill="none"
                stroke={
                  isMediumToReceiverArrowActive ? "#10b981" : "currentColor"
                }
                strokeWidth={isMediumToReceiverArrowActive ? "3.5" : "1.5"}
                strokeLinejoin="round"
                strokeLinecap="round"
                className={`${
                  isMediumToReceiverArrowActive
                    ? "opacity-100 animate-pulse"
                    : "opacity-20 text-slate-400 dark:text-slate-600"
                } transition-all duration-300`}
                filter={
                  isMediumToReceiverArrowActive
                    ? `url(#${filterArrowGlowId})`
                    : undefined
                }
              />
              <polygon
                points="90,-43 100,-43 95,-51"
                fill={
                  isMediumToReceiverArrowActive ? "#10b981" : "currentColor"
                }
                className={`${
                  isMediumToReceiverArrowActive
                    ? "opacity-100"
                    : "opacity-20 text-slate-400 dark:text-slate-600"
                } transition-all duration-300`}
              />
            </g>

            {/* RECEIVER STAIRCASE ROWS (LAYERS 7 -> 1) */}
            {[7, 6, 5, 4, 3, 2, 1].map((layerNum) => {
              const y = rowYMap[layerNum];
              const isActive = isReceiverLayerActive(layerNum);
              const isHighlighted = isLayerHighlighted(layerNum, false);
              const colors = getLayerDataColor(layerNum);

              const dataWMap: Record<number, number> = {
                7: 80,
                6: 100,
                5: 120,
                4: 140,
                3: 160,
                2: 160,
                1: 184,
              };

              const headerW = 28;
              const dataW = dataWMap[layerNum];
              const trailerW = layerNum === 2 ? 28 : 0;
              const totalW =
                layerNum === 1 ? 32 + dataW : headerW + dataW + trailerW;

              const leftEdgeX = receiverCx - 105;

              if (!isActive) return null;

              return (
                <g
                  key={`receiver-l${layerNum}`}
                  transform={`translate(0, ${y - 14})`}
                  className="transition-all duration-300"
                  filter={isHighlighted ? `url(#${filterGlowId})` : undefined}
                >
                  {/* Active Layer Glowing Border */}
                  {isHighlighted && (
                    <rect
                      x={leftEdgeX - 3}
                      y="-3"
                      width={totalW + 6}
                      height="34"
                      rx="6"
                      className="fill-none stroke-emerald-500 stroke-2 animate-pulse"
                    />
                  )}

                  {/* Layer Number Pill Tag on Right */}
                  <g transform={`translate(${leftEdgeX + totalW + 8}, 2)`}>
                    <rect
                      x="0"
                      y="0"
                      width="24"
                      height="24"
                      rx="4"
                      className={`transition-colors ${
                        isHighlighted
                          ? "fill-emerald-500 text-white"
                          : "fill-slate-200 dark:fill-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    />
                    <text
                      x="12"
                      y="16"
                      textAnchor="middle"
                      className="fill-current font-mono font-bold text-[10px]"
                    >
                      L{layerNum}
                    </text>
                  </g>

                  {layerNum === 1 ? (
                    /* Receiver Layer 1: Bitstream (Dashed Preamble) */
                    <g>
                      <rect
                        x={leftEdgeX}
                        y="0"
                        width="32"
                        height="28"
                        rx="4"
                        strokeDasharray="3 3"
                        className="fill-amber-600/70 dark:fill-amber-700/70 stroke-amber-500 stroke-1.5"
                      />
                      <text
                        x={leftEdgeX + 16}
                        y="18"
                        textAnchor="middle"
                        className="fill-white font-mono font-extrabold text-[10px]"
                      >
                        010
                      </text>

                      <rect
                        x={leftEdgeX + 34}
                        y="0"
                        width={totalW - 34}
                        height="28"
                        rx="4"
                        className={`${colors.fill} ${colors.stroke} stroke-1.5`}
                      />
                      <text
                        x={leftEdgeX + 34 + (totalW - 34) / 2}
                        y="18"
                        textAnchor="middle"
                        className={`${colors.text} font-mono font-bold text-[9.5px] tracking-wider`}
                      >
                        010101010101101010000010000
                      </text>
                    </g>
                  ) : (
                    /* Receiver Layers 7 - 2: Headers are drawn DASHED to represent Decapsulation */
                    <g>
                      {/* Header Block H7..H2 with DASHED BORDER */}
                      <rect
                        x={leftEdgeX}
                        y="0"
                        width={headerW}
                        height="28"
                        rx="4"
                        strokeDasharray="3 3"
                        className={`${headerFill} ${headerStroke} stroke-1.5`}
                      />
                      <text
                        x={leftEdgeX + headerW / 2}
                        y="18"
                        textAnchor="middle"
                        className="fill-white font-mono font-black text-xs"
                      >
                        H{layerNum}
                      </text>

                      {/* Data Payload Block D7..D2 */}
                      <rect
                        x={leftEdgeX + headerW + 2}
                        y="0"
                        width={dataW - 2}
                        height="28"
                        rx="4"
                        className={`${colors.fill} ${colors.stroke} stroke-1.5`}
                      />
                      <text
                        x={leftEdgeX + headerW + dataW / 2}
                        y="18"
                        textAnchor="middle"
                        className={`${colors.text} font-mono font-extrabold text-xs`}
                      >
                        D{layerNum}
                      </text>

                      {/* Trailer Block T2 with DASHED BORDER */}
                      {layerNum === 2 && (
                        <g
                          transform={`translate(${leftEdgeX + headerW + dataW + 2}, 0)`}
                        >
                          <rect
                            x="0"
                            y="0"
                            width={trailerW - 2}
                            height="28"
                            rx="4"
                            strokeDasharray="3 3"
                            className="fill-slate-400/80 dark:fill-slate-600/80 stroke-slate-300 dark:stroke-slate-500 stroke-1.5"
                          />
                          <text
                            x={trailerW / 2}
                            y="18"
                            textAnchor="middle"
                            className="fill-white font-mono font-black text-xs"
                          >
                            T2
                          </text>
                        </g>
                      )}
                    </g>
                  )}
                </g>
              );
            })}

            {/* DYNAMIC SENDER DOWNWARD ARROW (Host A -> L7) — single path for Chrome compat */}
            <g transform={`translate(${senderCx}, 0)`}>
              <path
                d="M -1.5 66 L -1.5 78 L -7 78 L 0 88 L 7 78 L 1.5 78 L 1.5 66 Z"
                fill={isSenderHostArrowActive ? "#f59e0b" : "#94a3b8"}
                className={`${
                  isSenderHostArrowActive
                    ? "opacity-100 animate-pulse"
                    : "opacity-40"
                } transition-all duration-300`}
                filter={
                  isSenderHostArrowActive
                    ? `url(#${filterArrowGlowId})`
                    : undefined
                }
              />
            </g>

            {/* DYNAMIC RECEIVER UPWARD ARROW (L7 -> Host B) — single path for Chrome compat */}
            <g transform={`translate(${receiverCx}, 0)`}>
              <path
                d="M -1.5 88 L -1.5 76 L -7 76 L 0 66 L 7 76 L 1.5 76 L 1.5 88 Z"
                fill={isReceiverHostArrowActive ? "#10b981" : "#94a3b8"}
                className={`${
                  isReceiverHostArrowActive
                    ? "opacity-100 animate-pulse"
                    : "opacity-40"
                } transition-all duration-300`}
                filter={
                  isReceiverHostArrowActive
                    ? `url(#${filterArrowGlowId})`
                    : undefined
                }
              />
            </g>
          </g>
        </svg>
      </div>

      {/* STEP CONTEXT DESCRIPTION CARD & KEY ENCAPSULATION SUMMARY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {/* ACTIVE STEP CARD */}
        <div className="p-4 rounded-xl border bg-card border-primary/40 shadow-xs space-y-1.5 md:col-span-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-500" />
            <span>Active Step Processing</span>
          </span>
          <div className="text-xs font-bold text-foreground flex items-center justify-between">
            <span>{activeStepInfo.actionTitle}</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                activeStepInfo.phase === "encapsulation"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : activeStepInfo.phase === "medium"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              }`}
            >
              {activeStepInfo.layerName}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {activeStepInfo.actionDesc}
          </p>
          {(activeStepInfo.headerAdded || activeStepInfo.trailerAdded) && (
            <div className="pt-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2 border-t mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                PDU: {activeStepInfo.pduName}{" "}
                {activeStepInfo.headerAdded
                  ? `[${activeStepInfo.headerAdded}]`
                  : ""}
              </span>
            </div>
          )}
        </div>

        {/* CARD 2: ENCAPSULATION PRINCIPLES */}
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2.5">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-2 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-500" /> Encapsulation (Host
            A)
          </h5>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <span>
                <strong className="text-foreground">
                  Top-Down Prepending:
                </strong>{" "}
                Host A adds protocol headers (
                <code className="text-amber-600 font-bold">H7..H2</code>) at
                each descending layer.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
              <span>
                <strong className="text-foreground">Framing & Preamble:</strong>{" "}
                L2 adds FCS trailer (
                <code className="text-slate-500 font-bold">T2</code>); L1
                encodes the frame into raw bitstream with{" "}
                <code className="text-amber-600 font-bold">010</code> preamble.
              </span>
            </li>
          </ul>
        </div>

        {/* CARD 3: DECAPSULATION & RECOVERY */}
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2.5">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-2 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-indigo-500" /> Decapsulation (Host B)
          </h5>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>
                <strong className="text-foreground">
                  Bottom-Up Stripping:
                </strong>{" "}
                As data travels through physical medium and ascends Host B, each
                layer verifies & strips its respective header.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
              <span>
                <strong className="text-foreground">Peer Delivery:</strong> Host
                B application receives the identical, uncorrupted user data (
                <code className="text-cyan-600 font-bold">D7</code>) prepared by
                Host A!
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
