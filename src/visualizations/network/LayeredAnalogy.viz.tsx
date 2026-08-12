import { useState, useEffect, useRef } from 'react';
import { type VizMeta } from '../types';
import { useAppStore } from '../../state/appStore';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  FileText,
  Building2,
  Truck,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Info,
} from 'lucide-react';

export const vizMeta: VizMeta = {
  key: 'network-layered-analogy',
  title: 'Layered Tasks: Sending a Letter',
  category: 'network',
  renderer: 'svg',
  animated: false,
  params: [
    {
      key: 'showLayers',
      type: 'boolean',
      label: 'Show Layer Tiers',
      default: true,
    },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

interface Step {
  id: number;
  stage: 'higher-sender' | 'middle-sender' | 'lower-sender' | 'carrier' | 'lower-receiver' | 'middle-receiver' | 'higher-receiver';
  x: number;
  y: number;
  title: string;
  desc: string;
  action: string;
}

const ANALOGY_STEPS: Step[] = [
  {
    id: 0,
    stage: 'higher-sender',
    x: 195,
    y: 154,
    title: '1. Writer Creates & Seals Letter',
    desc: 'The sender writes a message, places it in an envelope, and writes the destination address.',
    action: 'Higher Layer (Application Content Creation)',
  },
  {
    id: 1,
    stage: 'higher-sender',
    x: 195,
    y: 182,
    title: '2. Drop in Local Mailbox',
    desc: 'The letter is dropped into a nearby public mailbox for collection.',
    action: 'Higher Layer to Middle Layer Interface',
  },
  {
    id: 2,
    stage: 'middle-sender',
    x: 195,
    y: 244,
    title: '3. Local Mail Pickup',
    desc: 'A local postal worker collects the mail from the mailbox.',
    action: 'Middle Layer (Local Handling & Transport)',
  },
  {
    id: 3,
    stage: 'middle-sender',
    x: 195,
    y: 272,
    title: '4. Transport to Local Post Office',
    desc: 'The letter is transported to the central post office sorting facility.',
    action: 'Middle Layer to Lower Layer Interface',
  },
  {
    id: 4,
    stage: 'lower-sender',
    x: 195,
    y: 334,
    title: '5. Post Office Sorting & Dispatch',
    desc: 'Post office workers sort the letter by zip code and prepare it for long-distance shipment.',
    action: 'Lower Layer (Carrier Sorting & Handover)',
  },
  {
    id: 5,
    stage: 'lower-sender',
    x: 195,
    y: 420,
    title: '6. Loaded onto Transport Truck',
    desc: 'The sorted mail bag is loaded onto a transport vehicle at the origin terminal.',
    action: 'Lower Layer to Physical Carrier Entry',
  },
  {
    id: 6,
    stage: 'carrier',
    x: 425,
    y: 420,
    title: '7. Highway Physical Transit',
    desc: 'The truck carries the parcel across the physical highway network to the destination city.',
    action: 'Physical Carrier Link (Transmission across Media)',
  },
  {
    id: 7,
    stage: 'lower-receiver',
    x: 655,
    y: 420,
    title: '8. Arrival at Destination Post Office',
    desc: 'The mail truck arrives at the destination post office and unloads the incoming parcels.',
    action: 'Physical Carrier to Destination Lower Layer Ingress',
  },
  {
    id: 8,
    stage: 'lower-receiver',
    x: 655,
    y: 334,
    title: '9. Processing at Destination Post Office',
    desc: 'Destination post office sorts the letter into local delivery routes.',
    action: 'Lower Layer Decapsulation & Route Assignment',
  },
  {
    id: 9,
    stage: 'middle-receiver',
    x: 655,
    y: 272,
    title: '10. Local Carrier Dispatch',
    desc: 'The local letter carrier receives the sorted mail and travels to the recipient’s neighborhood.',
    action: 'Lower Layer to Middle Layer Interface',
  },
  {
    id: 10,
    stage: 'middle-receiver',
    x: 655,
    y: 244,
    title: '11. Mailbox Delivery',
    desc: 'The letter carrier places the envelope into the recipient’s mailbox.',
    action: 'Middle Layer Delivery',
  },
  {
    id: 11,
    stage: 'higher-receiver',
    x: 655,
    y: 154,
    title: '12. Letter Opened & Read',
    desc: 'The recipient collects the envelope from their mailbox, opens it, and reads the delivered message!',
    action: 'Higher Layer (Application Message Receipt)',
  },
];

export default function LayeredAnalogy({ values }: Props) {
  const showLayers = values.showLayers !== false;
  const globalSpeed = useAppStore((state) => state.globalSpeedMultiplier) || 1;

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeStep = ANALOGY_STEPS[currentStepIndex];

  // Auto-advance animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      return;
    }

    const intervalMs = 1300 / globalSpeed;

    stepTimerRef.current = setTimeout(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= ANALOGY_STEPS.length - 1) {
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
    if (currentStepIndex >= ANALOGY_STEPS.length - 1) {
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
    setCurrentStepIndex((prev) => Math.min(ANALOGY_STEPS.length - 1, prev + 1));
  };

  // Helper for box highlight styling based on active stage
  const getBoxStyle = (boxStage: string, tier: 'higher' | 'middle' | 'lower') => {
    const isActive = activeStep.stage === boxStage;

    if (!showLayers) {
      return isActive
        ? 'fill-slate-300 dark:fill-slate-700 stroke-slate-500 dark:stroke-slate-400 stroke-[3px] shadow-md transition-all duration-200'
        : 'fill-slate-200 dark:fill-slate-800 stroke-slate-400 dark:stroke-slate-600 stroke-[2px] opacity-80 transition-all duration-200';
    }

    if (tier === 'higher') {
      return isActive
        ? 'fill-lime-200 dark:fill-lime-900 stroke-lime-600 dark:stroke-lime-300 stroke-[3px] shadow-md transition-all duration-200'
        : 'fill-[#a3e635] dark:fill-[#4d7c0f] stroke-[#65a30d] dark:stroke-[#84cc16] stroke-[2px] transition-all duration-200';
    }
    if (tier === 'middle') {
      return isActive
        ? 'fill-sky-200 dark:fill-sky-900 stroke-sky-600 dark:stroke-sky-300 stroke-[3px] shadow-md transition-all duration-200'
        : 'fill-[#7dd3fc] dark:fill-[#0369a1] stroke-[#0284c7] dark:stroke-[#38bdf8] stroke-[2px] transition-all duration-200';
    }
    // lower
    return isActive
      ? 'fill-amber-200 dark:fill-amber-900 stroke-amber-600 dark:stroke-amber-300 stroke-[3px] shadow-md transition-all duration-200'
      : 'fill-[#fde047] dark:fill-[#a16207] stroke-[#ca8a04] dark:stroke-[#facc15] stroke-[2px] transition-all duration-200';
  };

  const textClass = 'fill-slate-900 dark:fill-slate-100 font-medium text-[12.5px] leading-[1.35] select-none';

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none">
      {/* PLAYBACK CONTROL HUD TOOLBAR */}
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
            disabled={currentStepIndex === ANALOGY_STEPS.length - 1}
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
            <span className="text-muted-foreground">{ANALOGY_STEPS.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-lg">
            {showLayers ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>Mode: {showLayers ? 'Color Coded & Labeled' : 'Quiz Mode'}</span>
          </div>
        </div>
      </div>

      {/* SVG CANVAS CONTAINER */}
      <div className="w-full border rounded-2xl bg-slate-50 dark:bg-slate-950 relative overflow-hidden shadow-inner border-slate-200/80 dark:border-slate-800 min-h-[300px] sm:min-h-[440px] md:min-h-[520px] flex items-center justify-center p-2 sm:p-4 transition-colors duration-300">
        {/* Ambient Grid Background */}
        <div
          className="absolute inset-0 opacity-15 dark:opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <svg
          viewBox="0 0 850 530"
          className="w-full h-auto text-foreground relative z-10 select-none font-sans"
        >
          <defs>
            <filter id="box-shadow" x="-4%" y="-4%" width="108%" height="108%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.08" />
            </filter>
            <filter id="envelope-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ================= LAYER 1: PINK FLOW PIPE (BEHIND BOXES) ================= */}
          {/* Sender Down Pipe */}
          <line
            x1="195"
            y1="90"
            x2="195"
            y2="420"
            stroke="#ec4899"
            strokeWidth="10"
            strokeLinecap="square"
          />

          {/* Receiver Up Pipe */}
          <line
            x1="655"
            y1="420"
            x2="655"
            y2="90"
            stroke="#ec4899"
            strokeWidth="10"
            strokeLinecap="square"
          />

          {/* Receiver Arrow Head at Top */}
          <path d="M 644 93 L 655 73 L 666 93 Z" fill="#ec4899" />

          {/* Horizontal Connecting Pipe along Bottom */}
          <path
            d="M 190 420 L 660 420"
            fill="none"
            stroke="#ec4899"
            strokeWidth="10"
            strokeLinejoin="miter"
          />

          {/* Glowing Ping Marker behind current active packet position */}
          <circle
            cx={activeStep.x}
            cy={activeStep.y}
            r="18"
            className="fill-pink-400/50 dark:fill-pink-500/50 animate-ping"
            style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
          />

          {/* ================= LAYER 2: BOXES ================= */}

          {/* --- LEFT COLUMN (SENDER) --- */}
          {/* Top Box: Higher Layers */}
          <g>
            <rect
              x="60"
              y="120"
              width="270"
              height="68"
              rx="6"
              filter="url(#box-shadow)"
              className={getBoxStyle('higher-sender', 'higher')}
            />
            <g transform="translate(80, 143)" className="text-lime-900 dark:text-lime-100">
              <FileText width={18} height={18} className="opacity-80" />
            </g>
          </g>

          {/* Middle Box: Middle Layers */}
          <g>
            <rect
              x="60"
              y="210"
              width="270"
              height="68"
              rx="6"
              filter="url(#box-shadow)"
              className={getBoxStyle('middle-sender', 'middle')}
            />
            <g transform="translate(80, 233)" className="text-sky-900 dark:text-sky-100">
              <Building2 width={18} height={18} className="opacity-80" />
            </g>
          </g>

          {/* Bottom Box: Lower Layers */}
          <g>
            <rect
              x="60"
              y="300"
              width="270"
              height="68"
              rx="6"
              filter="url(#box-shadow)"
              className={getBoxStyle('lower-sender', 'lower')}
            />
            <g transform="translate(80, 323)" className="text-amber-900 dark:text-amber-100">
              <Truck width={18} height={18} className="opacity-80" />
            </g>
          </g>

          {/* --- RIGHT COLUMN (RECEIVER) --- */}
          {/* Top Box: Higher Layers */}
          <g>
            <rect
              x="520"
              y="120"
              width="270"
              height="68"
              rx="6"
              filter="url(#box-shadow)"
              className={getBoxStyle('higher-receiver', 'higher')}
            />
            <g transform="translate(540, 143)" className="text-lime-900 dark:text-lime-100">
              <FileText width={18} height={18} className="opacity-80" />
            </g>
          </g>

          {/* Middle Box: Middle Layers */}
          <g>
            <rect
              x="520"
              y="210"
              width="270"
              height="68"
              rx="6"
              filter="url(#box-shadow)"
              className={getBoxStyle('middle-receiver', 'middle')}
            />
            <g transform="translate(540, 233)" className="text-sky-900 dark:text-sky-100">
              <Building2 width={18} height={18} className="opacity-80" />
            </g>
          </g>

          {/* Bottom Box: Lower Layers */}
          <g>
            <rect
              x="520"
              y="300"
              width="270"
              height="68"
              rx="6"
              filter="url(#box-shadow)"
              className={getBoxStyle('lower-receiver', 'lower')}
            />
            <g transform="translate(540, 323)" className="text-amber-900 dark:text-amber-100">
              <Truck width={18} height={18} className="opacity-80" />
            </g>
          </g>

          {/* ================= LAYER 3: TEXT INSIDE BOXES ================= */}

          {/* Sender Box Texts */}
          <text x="210" y="141" textAnchor="middle" className={textClass}>
            <tspan x="210" dy="0">The letter is written,</tspan>
            <tspan x="210" dy="15">put in an envelope, and</tspan>
            <tspan x="210" dy="15">dropped in a mailbox.</tspan>
          </text>

          <text x="210" y="231" textAnchor="middle" className={textClass}>
            <tspan x="210" dy="0">The letter is carried</tspan>
            <tspan x="210" dy="15">from the mailbox</tspan>
            <tspan x="210" dy="15">to a post office.</tspan>
          </text>

          <text x="210" y="321" textAnchor="middle" className={textClass}>
            <tspan x="210" dy="0">The letter is delivered</tspan>
            <tspan x="210" dy="15">to a carrier by the post</tspan>
            <tspan x="210" dy="15">office.</tspan>
          </text>

          {/* Receiver Box Texts */}
          <text x="670" y="141" textAnchor="middle" className={textClass}>
            <tspan x="670" dy="0">The letter is picked up,</tspan>
            <tspan x="670" dy="15">removed from the</tspan>
            <tspan x="670" dy="15">envelope, and read.</tspan>
          </text>

          <text x="670" y="231" textAnchor="middle" className={textClass}>
            <tspan x="670" dy="0">The letter is carried</tspan>
            <tspan x="670" dy="15">from the post office</tspan>
            <tspan x="670" dy="15">to the mailbox.</tspan>
          </text>

          <text x="670" y="321" textAnchor="middle" className={textClass}>
            <tspan x="670" dy="0">The letter is delivered</tspan>
            <tspan x="670" dy="15">from the carrier</tspan>
            <tspan x="670" dy="15">to the post office.</tspan>
          </text>

          {/* ================= LAYER 4: SENDER & RECEIVER TOP LABELS ================= */}
          <g transform="translate(195, 45)">
            <text
              x="0"
              y="0"
              textAnchor="middle"
              className="fill-slate-800 dark:fill-slate-200 font-bold text-sm"
            >
              Sender
            </text>
            <path
              d="M -6 24 C -6 20, -3 18, 0 18 C 3 18, 6 20, 6 24 M -3 12 A 3 3 0 1 0 3 12 A 3 3 0 1 0 -3 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-slate-800 dark:text-slate-200"
            />
          </g>

          <g transform="translate(655, 45)">
            <text
              x="0"
              y="0"
              textAnchor="middle"
              className="fill-slate-800 dark:fill-slate-200 font-bold text-sm"
            >
              Receiver
            </text>
            <path
              d="M -6 24 C -6 20, -3 18, 0 18 C 3 18, 6 20, 6 24 M -3 12 A 3 3 0 1 0 3 12 A 3 3 0 1 0 -3 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-slate-800 dark:text-slate-200"
            />
          </g>

          {/* ================= LAYER 5: MIDDLE TIER LABELS ================= */}
          {showLayers && (
            <g className="font-semibold text-sm fill-slate-800 dark:fill-slate-200 select-none">
              <text x="425" y="157" textAnchor="middle">
                Higher layers
              </text>
              <text x="425" y="247" textAnchor="middle">
                Middle layers
              </text>
              <text x="425" y="337" textAnchor="middle">
                Lower layers
              </text>
            </g>
          )}

          {/* ================= LAYER 6: ELEGANT SEALED ENVELOPE PACKET ================= */}
          <g
            transform={`translate(${activeStep.x}, ${activeStep.y})`}
            className="transition-transform duration-300 ease-out"
          >
            {/* Envelope Base Box */}
            <rect
              x="-22"
              y="-15"
              width="44"
              height="30"
              rx="5"
              filter="url(#envelope-glow)"
              className="fill-pink-600 dark:fill-pink-500 stroke-pink-700 dark:stroke-pink-300 stroke-2 shadow-xl"
            />
            {/* Envelope Flap Lines */}
            <path
              d="M -20 -13 L 0 0 L 20 -13"
              fill="none"
              className="stroke-white dark:stroke-slate-900 stroke-2 stroke-linejoin-round stroke-linecap-round"
            />
            <path
              d="M -20 13 L -7 2"
              fill="none"
              className="stroke-white/70 dark:stroke-slate-900/70 stroke-[1.5px]"
            />
            <path
              d="M 20 13 L 7 2"
              fill="none"
              className="stroke-white/70 dark:stroke-slate-900/70 stroke-[1.5px]"
            />
            {/* Center Stamp */}
            <circle cx="0" cy="0" r="4" className="fill-white dark:fill-slate-900" />
          </g>

          {/* ================= LAYER 7: BOTTOM PARCEL CAPTION ================= */}
          <text
            x="425"
            y="455"
            textAnchor="middle"
            className="fill-slate-800 dark:fill-slate-200 font-medium text-sm select-none"
          >
            The parcel is carried from
          </text>
          <text
            x="425"
            y="473"
            textAnchor="middle"
            className="fill-slate-800 dark:fill-slate-200 font-medium text-sm select-none"
          >
            the source to the destination.
          </text>
        </svg>
      </div>

      {/* ACTIVE STEP DESCRIPTION CARD & DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
        {/* Active Step Highlight Card */}
        <div className="p-4 rounded-xl bg-card border border-primary/40 shadow-xs space-y-1.5 md:col-span-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-1.5">
            <Info className="w-3.5 h-3.5 text-pink-500" /> Active Stage
          </span>
          <div className="text-xs font-bold text-foreground">
            {activeStep.title}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {activeStep.desc}
          </p>
          <div className="pt-1 text-[10.5px] font-mono text-primary font-semibold flex items-center gap-1">
            <ArrowRight className="w-3 h-3" />
            <span>{activeStep.action.split(' ')[0]} Layer</span>
          </div>
        </div>

        {/* Tier Cards */}
        <div
          className={`p-4 rounded-xl border transition-all duration-200 space-y-2 ${
            activeStep.stage.includes('higher')
              ? 'bg-lime-500/15 border-lime-500/60 shadow-xs'
              : 'bg-muted/20'
          }`}
        >
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-2 flex items-center gap-1.5">
            <FileText width={15} height={15} className="text-lime-600 dark:text-lime-400" /> Higher Layers
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Written/read by end users. Creates or receives raw letter contents.
          </p>
        </div>

        <div
          className={`p-4 rounded-xl border transition-all duration-200 space-y-2 ${
            activeStep.stage.includes('middle')
              ? 'bg-sky-500/15 border-sky-500/60 shadow-xs'
              : 'bg-muted/20'
          }`}
        >
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-2 flex items-center gap-1.5">
            <Building2 width={15} height={15} className="text-sky-600 dark:text-sky-400" /> Middle Layers
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Local handling between mailboxes and post offices. Intermediate packaging.
          </p>
        </div>

        <div
          className={`p-4 rounded-xl border transition-all duration-200 space-y-2 ${
            activeStep.stage.includes('lower') || activeStep.stage === 'carrier'
              ? 'bg-amber-500/15 border-amber-500/60 shadow-xs'
              : 'bg-muted/20'
          }`}
        >
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-2 flex items-center gap-1.5">
            <Truck width={15} height={15} className="text-amber-600 dark:text-amber-400" /> Lower Layers
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Carrier delivery across physical highway link. Represents physical transmission.
          </p>
        </div>
      </div>
    </div>
  );
}
