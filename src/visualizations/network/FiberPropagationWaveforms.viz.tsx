import { useEffect, useRef, useId, useState } from "react";
import { type VizMeta } from "../types";
import { useAppStore } from "../../state/appStore";
import {
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  Maximize2,
  Radio,
} from "lucide-react";

export const vizMeta: VizMeta = {
  key: "network-fiber-propagation-waveforms",
  title: "Signal Distortion by Propagation Mode",
  category: "network",
  renderer: "svg",
  animated: true,
  params: [
    {
      key: "mode",
      type: "select",
      label: "Propagation mode",
      default: "all",
      options: [
        { label: "Show all three modes", value: "all" },
        { label: "Multimode, step index", value: "step" },
        { label: "Multimode, graded index", value: "graded" },
        { label: "Single mode", value: "single" },
      ],
    },
    {
      key: "cableLength",
      type: "number",
      label: "Cable Length (km)",
      default: 5.0,
      min: 1.0,
      max: 10.0,
      step: 0.5,
    },
    {
      key: "pulseWidth",
      type: "number",
      label: "Input Pulse Width T₀ (ns)",
      default: 20.0,
      min: 5.0,
      max: 50.0,
      step: 1.0,
    },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
  isPlaying?: boolean;
}

export default function FiberPropagationWaveforms({
  values,
  onChange,
  isPlaying: isPlayingProp,
}: Props) {
  // Read params directly from values for full reactivity
  const mode = (values.mode as string) || "all";
  const cableLength = Number(values.cableLength ?? 5.0);
  const pulseWidth = Number(values.pulseWidth ?? 20.0);

  // Helper to trigger param updates to parent state
  const updateParam = (key: string, val: unknown) => {
    if (onChange) {
      onChange({
        ...values,
        [key]: val,
      });
    }
  };

  const activePlaying = isPlayingProp ?? true;
  const globalSpeed = useAppStore((state) => state.globalSpeedMultiplier) || 1;

  // Animation pulse progress hook
  const pulseProgress = usePulseAnimation(activePlaying, globalSpeed);

  // SVG Unique IDs
  const rawId = useId();
  const gradedGradId = `graded-grad-fpw-${rawId.replace(/:/g, "")}`;

  // Physical Optics & Modal Delay Calculations
  const skewStepNs = Number((cableLength * 6.5).toFixed(1));
  const skewGradedNs = Number((cableLength * 0.8).toFixed(1));
  const skewSingleNs = 0.0;

  // Active delay skew calculation
  let activeSkewNs = skewStepNs;
  if (mode === "graded") activeSkewNs = skewGradedNs;
  else if (mode === "single") activeSkewNs = skewSingleNs;

  const isHighISI = mode === "step" && activeSkewNs >= pulseWidth * 0.5;
  const isModerateISI = mode === "graded" && activeSkewNs >= pulseWidth * 0.5;

  // Preset Handlers
  const handlePresetAll = () => updateParam("mode", "all");
  const handlePresetStep = () => updateParam("mode", "step");
  const handlePresetGraded = () => updateParam("mode", "graded");
  const handlePresetSingle = () => updateParam("mode", "single");

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none">
      {/* TOP TOOLBAR: PRESETS & REAL-TIME OPTICS HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-muted/30 border border-border">
        {/* Left: Mode Preset Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-500" /> Presets:
          </span>
          <button
            onClick={handlePresetAll}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              mode === "all"
                ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-xs"
                : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
            }`}
          >
            Show All 3 Modes
          </button>
          <button
            onClick={handlePresetStep}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              mode === "step"
                ? "bg-rose-500 text-white border-rose-400 font-bold shadow-xs"
                : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
            }`}
          >
            1. Multimode (Step-Index)
          </button>
          <button
            onClick={handlePresetGraded}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              mode === "graded"
                ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-xs"
                : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
            }`}
          >
            2. Multimode (Graded-Index)
          </button>
          <button
            onClick={handlePresetSingle}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              mode === "single"
                ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-xs"
                : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
            }`}
          >
            3. Single-Mode Fiber
          </button>
        </div>

        {/* Right: Live Status Badges & Telemetry HUD */}
        <div className="flex items-center gap-2 flex-wrap">
          {mode !== "all" && (
            <div
              className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                isHighISI
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  : isModerateISI
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              }`}
            >
              {isHighISI ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Severe Pulse Broadening (High ISI)</span>
                </>
              ) : isModerateISI ? (
                <>
                  <Activity className="w-3.5 h-3.5 text-amber-500" />
                  <span>Moderate Broadening (Low ISI)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Zero Modal Dispersion (Pristine)</span>
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-1 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-background border border-border text-foreground font-semibold">
              Length:{" "}
              <span className="text-amber-500 font-extrabold">
                {cableLength} km
              </span>
            </span>
            <span className="px-2 py-0.5 rounded bg-background border border-border text-foreground font-semibold">
              T₀:{" "}
              <span className="text-sky-500 font-extrabold">
                {pulseWidth} ns
              </span>
            </span>
            {mode !== "all" && (
              <span className="px-2 py-0.5 rounded bg-background border border-border text-foreground font-semibold">
                Δt:{" "}
                <span className="text-emerald-500 font-extrabold">
                  +{activeSkewNs} ns
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* MAIN VIEWPORT CANVAS */}
      <div className="w-full border rounded-2xl bg-slate-100/90 dark:bg-slate-950/90 relative overflow-hidden shadow-inner border-border min-h-[480px] flex items-center justify-center p-4 transition-colors duration-300">
        {/* Ambient Radial Grid Overlay */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Global SVG Definitions */}
        <svg className="absolute w-0 h-0 pointer-events-none">
          <defs>
            <linearGradient id={gradedGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.08" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.08" />
            </linearGradient>
          </defs>
        </svg>

        {/* CONDITION 1: SIDE-BY-SIDE 3-MODE COMPARISON VIEW */}
        {mode === "all" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full h-full p-1 relative z-10">
            <SingleModePanel
              title="1. Multimode (Step-Index)"
              subtitle="Uniform Index Core (50–100 μm)"
              modeType="step"
              skewNs={skewStepNs}
              pulseWidth={pulseWidth}
              cableLength={cableLength}
              gradedGradId={gradedGradId}
              pulseProgress={pulseProgress}
              isPlaying={activePlaying}
              badgeColor="rose"
              onClick={handlePresetStep}
            />

            <SingleModePanel
              title="2. Multimode (Graded-Index)"
              subtitle="Parabolic Index Core (50–62.5 μm)"
              modeType="graded"
              skewNs={skewGradedNs}
              pulseWidth={pulseWidth}
              cableLength={cableLength}
              gradedGradId={gradedGradId}
              pulseProgress={pulseProgress}
              isPlaying={activePlaying}
              badgeColor="amber"
              onClick={handlePresetGraded}
            />

            <SingleModePanel
              title="3. Single-Mode Fiber"
              subtitle="Ultra-Narrow Core (8–10 μm)"
              modeType="single"
              skewNs={skewSingleNs}
              pulseWidth={pulseWidth}
              cableLength={cableLength}
              gradedGradId={gradedGradId}
              pulseProgress={pulseProgress}
              isPlaying={activePlaying}
              badgeColor="emerald"
              onClick={handlePresetSingle}
            />
          </div>
        ) : (
          /* CONDITION 2: FOCUSED INTERACTIVE SINGLE MODE CANVAS */
          <div className="w-full h-full relative z-10 flex items-center justify-center">
            <InteractiveWaveformCanvas
              width={900}
              height={510}
              modeType={mode as "step" | "graded" | "single"}
              skewNs={activeSkewNs}
              pulseWidth={pulseWidth}
              cableLength={cableLength}
              gradedGradId={gradedGradId}
              pulseProgress={pulseProgress}
              isPlaying={activePlaying}
            />
          </div>
        )}
      </div>

      {/* PARAMETER SLIDERS & CONTROLS PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Slider 1: Cable Length L */}
        <div className="p-3.5 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-foreground flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-500" /> Cable Transmission
              Length (L)
            </span>
            <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
              {cableLength.toFixed(1)} km
            </span>
          </div>
          <input
            type="range"
            min="1.0"
            max="10.0"
            step="0.5"
            value={cableLength}
            onChange={(e) => updateParam("cableLength", Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>1.0 km (Short Link)</span>
            <span>5.0 km (Campus LAN)</span>
            <span>10.0 km (Metro Fiber)</span>
          </div>
        </div>

        {/* Slider 2: Input Pulse Width T0 */}
        <div className="p-3.5 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-foreground flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-sky-500" /> Input Pulse Width
              (T₀)
            </span>
            <span className="font-mono text-sky-500 font-bold">
              {pulseWidth.toFixed(1)} ns
            </span>
          </div>
          <input
            type="range"
            min="5.0"
            max="50.0"
            step="1.0"
            value={pulseWidth}
            onChange={(e) => updateParam("pulseWidth", Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>5.0 ns (High Data Rate)</span>
            <span>20.0 ns (Standard)</span>
            <span>50.0 ns (Low Data Rate)</span>
          </div>
        </div>
      </div>

      {/* PEDAGOGICAL EXPLANATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <TrendingDown className="w-4 h-4 text-rose-500" /> 1. Multimode
            (Step-Index)
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Light rays entering at steep angles bounce many times and travel a
            longer physical path than axial rays. In a uniform core index
            ($n_1$), this path difference creates severe modal delay (
            <span className="font-semibold text-rose-500">
              Δt ≈ {skewStepNs} ns
            </span>
            ), causing digital pulses to overlap.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Activity className="w-4 h-4 text-amber-500" /> 2. Multimode
            (Graded-Index)
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Features a parabolic refractive index core profile $n(r)$. Outer
            rays travel longer curved paths but move faster through lower-index
            material, equalizing transit times (
            <span className="font-semibold text-amber-500">
              Δt ≈ {skewGradedNs} ns
            </span>
            ) and minimizing distortion.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Zap className="w-4 h-4 text-emerald-500" /> 3. Single-Mode Fiber
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            By shrinking core diameter to{" "}
            <span className="font-semibold text-foreground">8–10 μm</span>, only
            the fundamental axial mode ($HE_{11}$) propagates. With{" "}
            <span className="font-bold text-emerald-500">
              zero modal dispersion (Δt = 0 ns)
            </span>
            , digital pulses remain sharp over multi-kilometer backbones.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER HOOK: SMOOTH ANIMATION PULSE STATE
// ============================================================================
function usePulseAnimation(activePlaying: boolean, globalSpeed: number) {
  const [pulseProgress, setPulseProgress] = useState(0);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activePlaying) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    let lastTime = performance.now();
    const animate = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      setPulseProgress((prev) => (prev + delta * 0.45 * globalSpeed) % 1.0);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [activePlaying, globalSpeed]);

  return pulseProgress;
}

// ============================================================================
// HELPER COMPONENT: SINGLE MODE PANEL FOR 3-PANEL COMPARISON VIEW
// ============================================================================
function SingleModePanel({
  title,
  subtitle,
  modeType,
  skewNs,
  pulseWidth,
  gradedGradId,
  pulseProgress,
  isPlaying,
  badgeColor,
  onClick,
}: {
  title: string;
  subtitle: string;
  modeType: "step" | "graded" | "single";
  skewNs: number;
  pulseWidth: number;
  cableLength: number;
  gradedGradId: string;
  pulseProgress: number;
  isPlaying: boolean;
  badgeColor: "rose" | "amber" | "emerald";
  onClick: () => void;
}) {
  const w = 260;
  const h = 390;

  const badgeClasses = {
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    amber:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    emerald:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  }[badgeColor];

  const rayColor =
    modeType === "single"
      ? "#10b981"
      : modeType === "graded"
        ? "#d97706"
        : "#dc2626";

  // Dynamic pulse pixel width
  const pulsePx = Math.max(12, Math.min(45, (pulseWidth / 50) * 35));

  return (
    <div
      onClick={onClick}
      className="flex flex-col h-full rounded-xl border border-border bg-card p-3 hover:border-amber-500/60 cursor-pointer transition-colors duration-200 group relative overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b gap-1 flex-wrap">
        <span className="text-xs font-bold text-foreground group-hover:text-amber-500 transition-colors flex items-center gap-1">
          {title}
        </span>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badgeClasses}`}
        >
          Δt = +{skewNs} ns
        </span>
      </div>

      <div className="pt-1 text-[10px] text-muted-foreground font-medium">
        {subtitle}
      </div>

      {/* SVG Flow Canvas */}
      <div className="flex-1 w-full relative flex items-center justify-center pt-2">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full h-auto text-foreground select-none"
        >
          {/* STAGE 1: INPUT PULSE GRAPH */}
          <g transform="translate(15, 15)">
            <rect
              x="0"
              y="0"
              width="230"
              height="70"
              className="fill-background/95 dark:fill-slate-900/95"
              rx="6"
              stroke="currentColor"
              strokeOpacity="0.15"
            />
            <text
              x="12"
              y="20"
              fontSize="9"
              fontWeight="bold"
              fill="#0284c7"
              className="font-mono"
            >
              Input Vin(t) — T₀ = {pulseWidth} ns
            </text>

            <line
              x1="15"
              y1="52"
              x2="215"
              y2="52"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeDasharray="3 2"
              opacity="0.2"
            />

            <path
              d={`M 15 52 L 35 52 L 35 28 L ${35 + pulsePx} 28 L ${35 + pulsePx} 52 L 215 52`}
              fill="none"
              stroke="#0284c7"
              strokeWidth="2"
            />
          </g>

          {/* STAGE 2: FIBER CORE CUTAWAY */}
          <g transform="translate(15, 98)">
            <rect
              x="0"
              y="0"
              width="230"
              height="120"
              fill="#3b82f6"
              opacity="0.08"
              rx="8"
            />

            {modeType === "single" ? (
              <rect
                x="0"
                y="54"
                width="230"
                height="12"
                fill="#0284c7"
                opacity="0.4"
                rx="2"
              />
            ) : modeType === "graded" ? (
              <rect
                x="0"
                y="25"
                width="230"
                height="70"
                fill={`url(#${gradedGradId})`}
                rx="4"
              />
            ) : (
              <rect
                x="0"
                y="25"
                width="230"
                height="70"
                fill="#0284c7"
                opacity="0.2"
                rx="4"
              />
            )}

            {modeType === "single" ? (
              <>
                <line
                  x1="0"
                  y1="54"
                  x2="230"
                  y2="54"
                  stroke="#0284c7"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                  opacity="0.6"
                />
                <line
                  x1="0"
                  y1="66"
                  x2="230"
                  y2="66"
                  stroke="#0284c7"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                  opacity="0.6"
                />
              </>
            ) : (
              <>
                <line
                  x1="0"
                  y1="25"
                  x2="230"
                  y2="25"
                  stroke="#0284c7"
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                  opacity="0.7"
                />
                <line
                  x1="0"
                  y1="95"
                  x2="230"
                  y2="95"
                  stroke="#0284c7"
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                  opacity="0.7"
                />
              </>
            )}

            {modeType === "single" ? (
              <line
                x1="0"
                y1="60"
                x2="230"
                y2="60"
                stroke="#10b981"
                strokeWidth="2.5"
              />
            ) : modeType === "graded" ? (
              <>
                <line
                  x1="0"
                  y1="60"
                  x2="230"
                  y2="60"
                  stroke="#0284c7"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                  opacity="0.4"
                />
                <path
                  d="M 0 60 Q 57.5 28 115 60 T 230 60"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2"
                />
              </>
            ) : (
              <>
                <line
                  x1="0"
                  y1="60"
                  x2="230"
                  y2="60"
                  stroke="#0284c7"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                  opacity="0.4"
                />
                <path
                  d="M 0 60 L 38 27 L 115 93 L 192 27 L 230 60"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2"
                />
              </>
            )}

            {isPlaying && (
              <path
                d={
                  modeType === "single"
                    ? "M 0 60 L 230 60"
                    : modeType === "graded"
                      ? "M 0 60 Q 57.5 28 115 60 T 230 60"
                      : "M 0 60 L 38 27 L 115 93 L 192 27 L 230 60"
                }
                fill="none"
                stroke="#ffffff"
                strokeWidth="4"
                strokeDasharray="12 100"
                strokeDashoffset={-pulseProgress * 200}
                strokeLinecap="round"
              />
            )}
          </g>

          {/* STAGE 3: OUTPUT PULSE GRAPH */}
          <g transform="translate(15, 232)">
            <rect
              x="0"
              y="0"
              width="230"
              height="90"
              className="fill-background/95 dark:fill-slate-900/95"
              rx="6"
              stroke="currentColor"
              strokeOpacity="0.15"
            />
            <text
              x="12"
              y="20"
              fontSize="9"
              fontWeight="bold"
              fill={rayColor}
              className="font-mono"
            >
              Output Vout(t) — Δt: +{skewNs} ns
            </text>

            <line
              x1="15"
              y1="68"
              x2="215"
              y2="68"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeDasharray="3 2"
              opacity="0.2"
            />

            <path
              d={`M 15 68 L 35 68 L 35 35 L ${35 + pulsePx} 35 L ${35 + pulsePx} 68 L 215 68`}
              fill="none"
              stroke="#0284c7"
              strokeWidth="1.2"
              strokeDasharray="3 2"
              opacity="0.4"
            />

            {modeType === "single" ? (
              <path
                d={`M 15 68 L 35 68 L 35 35 L ${35 + pulsePx} 35 L ${35 + pulsePx} 68 L 215 68`}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
              />
            ) : modeType === "graded" ? (
              <path
                d={`M 15 68 L 35 68 Q ${35 + (pulsePx + skewNs * 0.8) / 2} 32 ${Math.min(215, 35 + pulsePx + skewNs * 0.8)} 68 L 215 68`}
                fill="none"
                stroke="#d97706"
                strokeWidth="2"
              />
            ) : (
              <path
                d={`M 15 68 L 35 68 Q ${35 + (pulsePx + skewNs * 1.5) / 2} 35 ${Math.min(215, 35 + pulsePx + skewNs * 1.5)} 68 L 215 68`}
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
              />
            )}
          </g>
        </svg>
      </div>

      <div className="pt-1 text-[11px] text-center text-muted-foreground font-semibold group-hover:text-amber-500 transition-colors flex items-center justify-center gap-1">
        <Maximize2 className="w-3 h-3" /> Focus & adjust sliders →
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENT: FOCUSED INTERACTIVE SINGLE MODE CANVAS
// ============================================================================
function InteractiveWaveformCanvas({
  width,
  height,
  modeType,
  skewNs,
  pulseWidth,
  cableLength,
  gradedGradId,
  pulseProgress,
  isPlaying,
}: {
  width: number;
  height: number;
  modeType: "step" | "graded" | "single";
  skewNs: number;
  pulseWidth: number;
  cableLength: number;
  gradedGradId: string;
  pulseProgress: number;
  isPlaying: boolean;
}) {
  const modeTitles = {
    step: "Multimode, Step-Index Fiber",
    graded: "Multimode, Graded-Index Fiber",
    single: "Single-Mode Optical Fiber",
  }[modeType];

  const coreLabel = {
    step: "Step-Index Core (50–100 μm, Uniform Index n₁)",
    graded: "Graded-Index Core (50–62.5 μm, Parabolic Index Profile n(r))",
    single: "Single-Mode Core (8–10 μm, Fundamental Mode)",
  }[modeType];

  const rayColor =
    modeType === "single"
      ? "#10b981"
      : modeType === "graded"
        ? "#d97706"
        : "#dc2626";

  // Pulse width in pixels: T0 (range 5ns..50ns -> 25px..60px)
  const pulsePx = Math.max(25, Math.min(60, (pulseWidth / 50) * 50));

  // Physical alignment: Bit 1 #1 starts at 35px. Bit 0 starts at (35 + pulsePx).
  // Bit 1 #2 starts EXACTLY at (35 + 2 * pulsePx), matching real digital bit timing (T_bit = T0)!
  const p1Start = 35;
  const p1End = p1Start + pulsePx;
  const p2Start = p1Start + 2 * pulsePx;
  const p2End = p2Start + pulsePx;

  // Skew in pixels: proportional to modal delay Δt relative to pulsePx
  // In step mode, skewPx easily exceeds pulsePx (meaning Δt > T0 -> ISI overlap!)
  const skewPx =
    modeType === "single"
      ? 0
      : Math.min(90, (skewNs / pulseWidth) * pulsePx * 1.1);

  // Out pulse width for each pulse after dispersion broadening
  const outPulseWidthPx = pulsePx + skewPx;

  // Actual end of broadened Pulse 1
  const outPulse1End = p1Start + outPulseWidthPx;
  const outPulse2End = Math.min(370, p2Start + outPulseWidthPx);

  // Is ISI occurring? (Pulse 1 broadened tail extends past the start of Pulse 2!)
  const isISI = modeType === "step" && outPulse1End > p2Start;

  // Single continuous path string builder for Received Waveform (0 to 370px)
  const getReceivedWaveformPath = () => {
    if (modeType === "single") {
      return `M 20 130 L ${p1Start} 130 L ${p1Start} 65 L ${p1End} 65 L ${p1End} 130 L ${p2Start} 130 L ${p2Start} 65 L ${p2End} 65 L ${p2End} 130 L 370 130`;
    }

    if (!isISI) {
      // Non-overlapping pulses: two separate smooth bell curves connected by flat baseline
      return `M 20 130 L ${p1Start} 130 Q ${p1Start + outPulseWidthPx / 2} 65 ${outPulse1End} 130 L ${p2Start} 130 Q ${p2Start + outPulseWidthPx / 2} 65 ${outPulse2End} 130 L 370 130`;
    } else {
      // Overlapping pulses (ISI!): Pulses physically merge into a single continuous waveform with elevated Bit 0 baseline!
      const overlapX = Math.round((outPulse1End + p2Start) / 2);

      // Baseline rises up higher as skew increases (e.g. from 130 down to 85)
      const overlapExtent = Math.min(1.0, (outPulse1End - p2Start) / pulsePx);
      const overlapY = Math.round(130 - overlapExtent * 42);

      return `M 20 130 L ${p1Start} 130 Q ${p1Start + outPulseWidthPx / 2} 65 ${overlapX} ${overlapY} Q ${p2Start + outPulseWidthPx / 2} 65 ${outPulse2End} 130 L 370 130`;
    }
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto text-foreground select-none relative z-10 overflow-visible"
    >
      {/* TOP HEADER TITLE */}
      <g transform="translate(30, 15)">
        <rect
          x="0"
          y="0"
          width="340"
          height="28"
          rx="6"
          fill="currentColor"
          fillOpacity="0.06"
          stroke="currentColor"
          strokeOpacity="0.1"
        />
        <text x="14" y="18" fontSize="12" fontWeight="bold" fill="currentColor">
          Mode: <tspan fill={rayColor}>{modeTitles}</tspan>
        </text>
      </g>

      {/* STAGE 1: INPUT WAVEFORM GRAPH (LEFT) */}
      <g transform="translate(30, 55)">
        <rect
          x="0"
          y="0"
          width="165"
          height="155"
          className="fill-background/95 dark:fill-slate-900/95"
          rx="8"
          stroke="currentColor"
          strokeOpacity="0.15"
        />
        <text
          x="82.5"
          y="24"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="#0284c7"
          className="font-mono"
        >
          Input Pulse Vin(t)
        </text>

        {/* Graph Axes */}
        <line
          x1="20"
          y1="130"
          x2="150"
          y2="130"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 2"
          opacity="0.25"
        />
        <line
          x1="25"
          y1="55"
          x2="25"
          y2="135"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 2"
          opacity="0.25"
        />

        {/* Input Pulse Geometry */}
        <path
          d={`M 25 130 L 45 130 L 45 70 L ${45 + pulsePx} 70 L ${45 + pulsePx} 130 L 155 130`}
          fill="none"
          stroke="#0284c7"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* T0 Arrow Line & Label */}
        <g transform="translate(0, 5)">
          <line
            x1="45"
            y1="54"
            x2={45 + pulsePx}
            y2="54"
            stroke="#0284c7"
            strokeWidth="1.5"
          />
          <line
            x1="45"
            y1="50"
            x2="45"
            y2="58"
            stroke="#0284c7"
            strokeWidth="1.5"
          />
          <line
            x1={45 + pulsePx}
            y1="50"
            x2={45 + pulsePx}
            y2="58"
            stroke="#0284c7"
            strokeWidth="1.5"
          />
          <text
            x={45 + pulsePx / 2}
            y="44"
            textAnchor="middle"
            fontSize="9"
            fontWeight="bold"
            fill="#0284c7"
            className="font-mono"
          >
            T₀ = {pulseWidth} ns
          </text>
        </g>
      </g>

      {/* STAGE 2: FIBER CORE CUTAWAY (CENTER) */}
      <g transform="translate(215, 55)">
        {/* Outer Cladding Area */}
        <rect
          x="0"
          y="0"
          width="390"
          height="155"
          fill="#3b82f6"
          opacity="0.08"
          rx="10"
        />

        {/* Core Geometry */}
        {modeType === "single" ? (
          <rect
            x="0"
            y="70"
            width="390"
            height="15"
            fill="#0284c7"
            opacity="0.4"
            rx="3"
          />
        ) : modeType === "graded" ? (
          <rect
            x="0"
            y="30"
            width="390"
            height="95"
            fill={`url(#${gradedGradId})`}
            rx="6"
          />
        ) : (
          <rect
            x="0"
            y="30"
            width="390"
            height="95"
            fill="#0284c7"
            opacity="0.2"
            rx="6"
          />
        )}

        {/* Core Boundaries */}
        {modeType === "single" ? (
          <>
            <line
              x1="0"
              y1="70"
              x2="390"
              y2="70"
              stroke="#0284c7"
              strokeWidth="1.2"
              strokeDasharray="4 3"
              opacity="0.7"
            />
            <line
              x1="0"
              y1="85"
              x2="390"
              y2="85"
              stroke="#0284c7"
              strokeWidth="1.2"
              strokeDasharray="4 3"
              opacity="0.7"
            />
          </>
        ) : (
          <>
            <line
              x1="0"
              y1="30"
              x2="390"
              y2="30"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeDasharray="5 3"
              opacity="0.8"
            />
            <line
              x1="0"
              y1="125"
              x2="390"
              y2="125"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeDasharray="5 3"
              opacity="0.8"
            />
          </>
        )}

        {/* Core Title Label */}
        <text
          x="195"
          y="20"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill="#0284c7"
          className="font-mono"
        >
          {coreLabel}
        </text>

        {/* Ray Paths */}
        {modeType === "single" ? (
          <line
            x1="0"
            y1="77.5"
            x2="390"
            y2="77.5"
            stroke="#10b981"
            strokeWidth="2.5"
          />
        ) : modeType === "graded" ? (
          <>
            <line
              x1="0"
              y1="77.5"
              x2="390"
              y2="77.5"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeDasharray="3 2"
              opacity="0.4"
            />
            <path
              d="M 0 77.5 Q 97.5 32 195 77.5 T 390 77.5"
              fill="none"
              stroke="#d97706"
              strokeWidth="2.5"
            />
            <path
              d="M 0 77.5 Q 97.5 122 195 77.5 T 390 77.5"
              fill="none"
              stroke="#0284c7"
              strokeWidth="1.8"
              opacity="0.6"
            />
          </>
        ) : (
          <>
            <line
              x1="0"
              y1="77.5"
              x2="390"
              y2="77.5"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeDasharray="3 2"
              opacity="0.4"
            />
            <path
              d="M 0 77.5 L 64 32 L 195 122 L 325 32 L 390 77.5"
              fill="none"
              stroke="#dc2626"
              strokeWidth="2.5"
            />
          </>
        )}

        {/* Photon Particle Flow */}
        {isPlaying && (
          <path
            d={
              modeType === "single"
                ? "M 0 77.5 L 390 77.5"
                : modeType === "graded"
                  ? "M 0 77.5 Q 97.5 32 195 77.5 T 390 77.5"
                  : "M 0 77.5 L 64 32 L 195 122 L 325 32 L 390 77.5"
            }
            fill="none"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeDasharray="16 130"
            strokeDashoffset={-pulseProgress * 300}
            strokeLinecap="round"
          />
        )}
      </g>

      {/* STAGE 3: OUTPUT WAVEFORM GRAPH (RIGHT) */}
      <g transform="translate(625, 55)">
        <rect
          x="0"
          y="0"
          width="245"
          height="155"
          className="fill-background/95 dark:fill-slate-900/95"
          rx="8"
          stroke="currentColor"
          strokeOpacity="0.15"
        />
        <text
          x="122.5"
          y="24"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill={rayColor}
          className="font-mono"
        >
          Output Vout(t)
        </text>
        <text
          x="122.5"
          y="38"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill={rayColor}
          className="font-mono"
        >
          Delay Skew Δt = +{skewNs} ns
        </text>

        {/* Graph Axes */}
        <line
          x1="15"
          y1="130"
          x2="230"
          y2="130"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 2"
          opacity="0.25"
        />
        <line
          x1="35"
          y1="55"
          x2="35"
          y2="135"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 2"
          opacity="0.25"
        />

        {/* Reference Input Pulse (Dashed Outline aligned at x=35) */}
        <path
          d={`M 15 130 L 35 130 L 35 70 L ${35 + pulsePx} 70 L ${35 + pulsePx} 130 L 230 130`}
          fill="none"
          stroke="#0284c7"
          strokeWidth="1.5"
          strokeDasharray="3 2"
          opacity="0.4"
        />

        {/* Broadened Output Pulse Curve */}
        {modeType === "single" ? (
          <path
            d={`M 15 130 L 35 130 L 35 70 L ${35 + pulsePx} 70 L ${35 + pulsePx} 130 L 230 130`}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ) : modeType === "graded" ? (
          <path
            d={`M 15 130 L 35 130 Q ${35 + outPulseWidthPx / 2} 60 ${Math.min(230, 35 + outPulseWidthPx)} 130 L 230 130`}
            fill="none"
            stroke="#d97706"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ) : (
          <path
            d={`M 15 130 L 35 130 Q ${35 + outPulseWidthPx / 2} 70 ${Math.min(230, 35 + outPulseWidthPx)} 130 L 230 130`}
            fill="none"
            stroke="#dc2626"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}
      </g>

      {/* DETAILED WAVEFORM COMPARISON DIAGRAM (BOTTOM SECTION) */}
      <g transform="translate(30, 230)">
        <rect
          x="0"
          y="0"
          width={width - 60}
          height="260"
          fill="currentColor"
          fillOpacity="0.02"
          rx="10"
          stroke="currentColor"
          strokeOpacity="0.1"
        />

        {/* Section Title */}
        <text
          x="20"
          y="24"
          fontSize="12"
          fontWeight="bold"
          fill="currentColor"
          className="font-sans"
        >
          Pulse Broadening & Inter-Symbol Interference (ISI) Analysis — Cable
          Length L = {cableLength} km
        </text>

        {/* Sub-Diagram Left: Input Bitstream (1 0 1) */}
        <g transform="translate(20, 38)">
          <rect
            x="0"
            y="0"
            width="390"
            height="170"
            className="fill-background/95 dark:fill-slate-900/95"
            rx="6"
            stroke="currentColor"
            strokeOpacity="0.15"
          />
          <text
            x="195"
            y="24"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill="#0284c7"
            className="font-mono"
          >
            Transmitted Binary Stream (Bit 1 — Bit 0 — Bit 1)
          </text>

          <line
            x1="20"
            y1="130"
            x2="370"
            y2="130"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 2"
            opacity="0.25"
          />

          {/* Physically exact 1 0 1 Bitstream: Bit duration T_bit = pulsePx */}
          <path
            d={`M 20 130 L ${p1Start} 130 L ${p1Start} 65 L ${p1End} 65 L ${p1End} 130 L ${p2Start} 130 L ${p2Start} 65 L ${p2End} 65 L ${p2End} 130 L 370 130`}
            fill="none"
            stroke="#0284c7"
            strokeWidth="2.5"
          />

          <text
            x={p1Start + pulsePx / 2}
            y="55"
            textAnchor="middle"
            fontSize="10"
            fontWeight="extrabold"
            fill="#0284c7"
            className="font-mono"
          >
            BIT 1
          </text>
          <text
            x={p1End + pulsePx / 2}
            y="124"
            textAnchor="middle"
            fontSize="10"
            fontWeight="extrabold"
            fill="currentColor"
            opacity="0.5"
            className="font-mono"
          >
            BIT 0
          </text>
          <text
            x={p2Start + pulsePx / 2}
            y="55"
            textAnchor="middle"
            fontSize="10"
            fontWeight="extrabold"
            fill="#0284c7"
            className="font-mono"
          >
            BIT 1
          </text>
        </g>

        {/* Sub-Diagram Right: Received Bitstream Overlay */}
        <g transform="translate(430, 38)">
          <rect
            x="0"
            y="0"
            width="390"
            height="170"
            className="fill-background/95 dark:fill-slate-900/95"
            rx="6"
            stroke="currentColor"
            strokeOpacity="0.15"
          />
          <text
            x="195"
            y="24"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill={rayColor}
            className="font-mono"
          >
            Received Waveform at L = {cableLength} km (T₀ = {pulseWidth} ns)
          </text>

          <line
            x1="20"
            y1="130"
            x2="370"
            y2="130"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 2"
            opacity="0.25"
          />

          {/* SINGLE CONTINUOUS WAVEFORM PATH FOR RECEIVED BITSTREAM */}
          <path
            d={getReceivedWaveformPath()}
            fill="none"
            stroke={rayColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Inter-Symbol Interference (ISI) Highlight badge centered over Bit 0 when pulses physically merge */}
          {isISI && (
            <g
              transform={`translate(${Math.round(p1End + pulsePx / 2 - 37.5)}, 70)`}
            >
              <rect
                x="0"
                y="0"
                width="75"
                height="26"
                fill="#dc2626"
                fillOpacity="0.15"
                rx="4"
                stroke="#dc2626"
                strokeWidth="1"
                strokeDasharray="3 2"
              />
              <text
                x="37.5"
                y="17"
                textAnchor="middle"
                fontSize="9"
                fontWeight="extrabold"
                fill="#dc2626"
                className="font-mono"
              >
                ISI OVERLAP!
              </text>
            </g>
          )}

          {/* Status Label */}
          <text
            x="195"
            y="152"
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fill={rayColor}
            className="font-mono"
          >
            {modeType === "single"
              ? "✓ Zero ISI: Bit 1 and Bit 0 clearly separated"
              : modeType === "graded"
                ? "⚡ Minor Broadening: Bit 0 detectable"
                : isISI
                  ? "⚠ Severe ISI: Pulses merge, causing bit errors at receiver"
                  : "✓ Low ISI: Pulses sufficiently separated for T₀"}
          </text>
        </g>
      </g>
    </svg>
  );
}
