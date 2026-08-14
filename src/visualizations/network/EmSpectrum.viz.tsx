import { useEffect, useRef, useId, useState } from "react";
import { type VizMeta } from "../types";
import { useAppStore } from "../../state/appStore";
import { Radio, Wifi, Sun, Sliders, Eye, EyeOff } from "lucide-react";

export const vizMeta: VizMeta = {
  key: "network-em-spectrum",
  title: "Electromagnetic Spectrum for Wireless Communication",
  category: "network",
  renderer: "svg",
  animated: true,
  params: [
    {
      key: "highlightBand",
      type: "select",
      label: "Band Focus",
      default: "none",
      options: [
        { label: "All Bands Overview", value: "none" },
        { label: "Radio Waves (3 kHz – 3 GHz)", value: "radio" },
        { label: "Microwaves (3 GHz – 300 GHz)", value: "microwave" },
        { label: "Infrared (300 GHz – 400 THz)", value: "infrared" },
        { label: "Visible Light (400 THz – 790 THz)", value: "visible" },
        { label: "Ionizing Radiation (UV / X-Ray / Gamma)", value: "ionizing" },
      ],
    },
    {
      key: "freqLog",
      type: "number",
      label: "Frequency log₁₀(f)",
      default: 9.38, // ~2.4 GHz (Wi-Fi band)
      min: 3.0,
      max: 19.0,
      step: 0.1,
    },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
  isPlaying?: boolean;
}

// Spectrum Band Definitions with Exact Logarithmic Physics Boundaries
interface BandInfo {
  id: string;
  name: string;
  rangeLabel: string;
  logMin: number;
  logMax: number;
  color: string;
  isVisibleToHumanEye: boolean;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  description: string;
  networkingUse: string;
  propagationMode: string;
}

// Exact Logarithmic Physics Bounds (Range: log f = 3.0 to 19.0, total 16 decades)
const BANDS: BandInfo[] = [
  {
    id: "radio",
    name: "Radio Waves",
    rangeLabel: "3 kHz – 3 GHz",
    logMin: 3.0,
    logMax: 9.477,
    color: "#0284c7",
    isVisibleToHumanEye: false,
    badgeBg: "bg-sky-500/10",
    badgeBorder: "border-sky-500/30",
    badgeText: "text-sky-600 dark:text-sky-400",
    description:
      "Invisible long-wavelength signals capable of bending around obstacles and travelling long distances.",
    networkingUse:
      "AM/FM Radio, TV Broadcasting, Sub-6 GHz 5G Cellular, Maritime Radio.",
    propagationMode: "Ground wave & Sky wave (Ionospheric reflection)",
  },
  {
    id: "microwave",
    name: "Microwaves",
    rangeLabel: "3 GHz – 300 GHz",
    logMin: 9.477,
    logMax: 11.477,
    color: "#d97706",
    isVisibleToHumanEye: false,
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/30",
    badgeText: "text-amber-600 dark:text-amber-400",
    description:
      "Invisible high-frequency band with substantial bandwidth, ideal for high-capacity wireless data links.",
    networkingUse:
      "Wi-Fi (2.4, 5, 6 GHz), 5G mmWave, Satellite Links, Point-to-Point Radar.",
    propagationMode: "Line-of-Sight (LOS) — Attenuated by walls and heavy rain",
  },
  {
    id: "infrared",
    name: "Infrared",
    rangeLabel: "300 GHz – 400 THz",
    logMin: 11.477,
    logMax: 14.602,
    color: "#e11d48",
    isVisibleToHumanEye: false,
    badgeBg: "bg-rose-500/10",
    badgeBorder: "border-rose-500/30",
    badgeText: "text-rose-600 dark:text-rose-400",
    description:
      "Invisible short-range thermal optical band just below visible light. Cannot penetrate solid barriers.",
    networkingUse:
      "TV Remote Controls (IrDA), Thermal Imaging, Short-range Indoor Optical Links.",
    propagationMode:
      "Line-of-Sight — Blocked completely by walls (High Security)",
  },
  {
    id: "visible",
    name: "Visible Light",
    rangeLabel: "400 THz – 790 THz",
    logMin: 14.602,
    logMax: 14.897,
    color: "#10b981",
    isVisibleToHumanEye: true,
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/30",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    description:
      "THE ONLY HUMANLY VISIBLE SPECTRUM (750 nm to 380 nm). Used for emerging high-speed optical communication.",
    networkingUse:
      "Li-Fi (Light Fidelity), Free-Space Optics (FSO), Optical Fiber LED/Laser transmitters.",
    propagationMode: "Line-of-Sight — Microsecond optical modulation",
  },
  {
    id: "ionizing",
    name: "Ionizing Radiation",
    rangeLabel: "> 790 THz",
    logMin: 14.897,
    logMax: 19.0,
    color: "#a855f7",
    isVisibleToHumanEye: false,
    badgeBg: "bg-purple-500/10",
    badgeBorder: "border-purple-500/30",
    badgeText: "text-purple-600 dark:text-purple-400",
    description:
      "Invisible extremely high energy photons (> 3.1 eV). Breaks molecular bonds and damages living cells.",
    networkingUse:
      "NOT used for open wireless communications due to severe health hazards.",
    propagationMode: "Ionizing Radiation — High penetration/absorption risk",
  },
];

// Helper: Convert log10(frequency) to exact pixel X coordinate (0 to 800px)
function logToX(logVal: number): number {
  const clampLog = Math.max(3.0, Math.min(19.0, logVal));
  return ((clampLog - 3.0) / 16.0) * 800;
}

export default function EmSpectrum({
  values,
  onChange,
  isPlaying: isPlayingProp,
}: Props) {
  const highlightBand = (values.highlightBand as string) || "none";
  const freqLog = Number(values.freqLog ?? 9.38); // ~2.4 GHz

  const activePlaying = isPlayingProp ?? true;
  const globalSpeed = useAppStore((state) => state.globalSpeedMultiplier) || 1;

  // Real-time animation hook
  const waveProgress = useWaveAnimation(activePlaying, globalSpeed);

  // SVG Unique IDs
  const rawId = useId();
  const visibleRainbowGradId = `visible-rainbow-grad-${rawId.replace(/:/g, "")}`;
  const barClipId = `bar-clip-flat-${rawId.replace(/:/g, "")}`;

  // Bidirectional Band Focus Sync: Automatically shift frequency log to band midpoint when Band Focus dropdown changes
  const targetBand = BANDS.find((b) => b.id === highlightBand);

  useEffect(() => {
    if (
      highlightBand !== "none" &&
      targetBand &&
      (freqLog < targetBand.logMin || freqLog > targetBand.logMax)
    ) {
      const midLog = Number(
        ((targetBand.logMin + targetBand.logMax) / 2).toFixed(2),
      );
      onChange?.({
        ...values,
        freqLog: midLog,
        highlightBand: targetBand.id,
      });
    }
  }, [highlightBand]);

  // Derived Physical Parameters
  const frequencyHz = Math.pow(10, freqLog);
  const SPEED_OF_LIGHT = 3e8; // m/s
  const PLANCK_EV = 4.135667e-15; // eV s

  const wavelengthMeters = SPEED_OF_LIGHT / frequencyHz;
  const photonEnergyEv = PLANCK_EV * frequencyHz;

  // Determine current active band strictly from freqLog bounds
  const currentBand =
    BANDS.find((b) => freqLog >= b.logMin && freqLog <= b.logMax) || BANDS[4];

  // Format Helper Functions
  const formatFrequency = (f: number) => {
    if (f < 1e6) return `${(f / 1e3).toFixed(1)} kHz`;
    if (f < 1e9) return `${(f / 1e6).toFixed(1)} MHz`;
    if (f < 1e12) return `${(f / 1e9).toFixed(2)} GHz`;
    if (f < 1e15) return `${(f / 1e12).toFixed(1)} THz`;
    if (f < 1e18) return `${(f / 1e15).toFixed(1)} PHz`;
    return `${(f / 1e18).toFixed(1)} EHz`;
  };

  const formatWavelength = (w: number) => {
    if (w >= 1000) return `${(w / 1000).toFixed(1)} km`;
    if (w >= 1.0) return `${w.toFixed(2)} m`;
    if (w >= 0.01) return `${(w * 100).toFixed(1)} cm`;
    if (w >= 1e-3) return `${(w * 1000).toFixed(1)} mm`;
    if (w >= 1e-6) return `${(w * 1e6).toFixed(1)} µm`;
    if (w >= 1e-9) return `${(w * 1e9).toFixed(1)} nm`;
    return `${(w * 1e12).toFixed(1)} pm`;
  };

  const formatEnergy = (e: number) => {
    if (e < 1e-6) return `${(e * 1e9).toFixed(2)} neV`;
    if (e < 1e-3) return `${(e * 1e6).toFixed(2)} µeV`;
    if (e < 1.0) return `${(e * 1000).toFixed(2)} meV`;
    if (e < 1e3) return `${e.toFixed(2)} eV`;
    if (e < 1e6) return `${(e / 1e3).toFixed(2)} keV`;
    return `${(e / 1e6).toFixed(2)} MeV`;
  };

  // Quick Preset Handlers
  const setPresetFrequency = (logVal: number, bandId: string) => {
    onChange?.({
      ...values,
      freqLog: logVal,
      highlightBand: bandId,
    });
  };

  // Dynamic Frequency Slider Handler (syncs highlightBand dynamically when sweeping!)
  const handleSliderChange = (logVal: number) => {
    const newBand =
      BANDS.find((b) => logVal >= b.logMin && logVal <= b.logMax) || BANDS[4];

    onChange?.({
      ...values,
      freqLog: logVal,
      highlightBand: newBand.id,
    });
  };

  // Spatial Wavelength in pixels for SVG rendering (scaled between 18px and 150px)
  const spatialWavelengthPx = Math.max(
    18,
    Math.min(150, 150 - (freqLog - 3.0) * 8.0),
  );

  // Pointer position on spectrum bar (0 to 800px) — GUARANTEED 100% IN SYNC WITH FREQLOG!
  const pointerX = logToX(freqLog);

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none">
      {/* TOP TOOLBAR: QUICK FREQUENCY PRESETS & TELEMETRY */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-muted/30 border border-border">
        {/* Left: Quick Band Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-500" /> Presets:
          </span>
          <button
            onClick={() => setPresetFrequency(6.0, "radio")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
              currentBand.id === "radio"
                ? "bg-sky-500 text-white border-sky-400 font-bold shadow-sm"
                : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
            }`}
          >
            Radio (1 MHz)
          </button>
          <button
            onClick={() => setPresetFrequency(9.38, "microwave")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
              currentBand.id === "microwave" && Math.abs(freqLog - 9.38) < 0.6
                ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm"
                : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
            }`}
          >
            Wi-Fi (2.4 GHz)
          </button>
          <button
            onClick={() => setPresetFrequency(10.45, "microwave")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
              currentBand.id === "microwave" && freqLog >= 10.0
                ? "bg-amber-600 text-white border-amber-500 font-bold shadow-sm"
                : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
            }`}
          >
            5G mmWave (28 GHz)
          </button>
          <button
            onClick={() => setPresetFrequency(14.3, "infrared")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
              currentBand.id === "infrared"
                ? "bg-rose-500 text-white border-rose-400 font-bold shadow-sm"
                : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
            }`}
          >
            Infrared (200 THz)
          </button>
          <button
            onClick={() => setPresetFrequency(14.75, "visible")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
              currentBand.id === "visible"
                ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-sm"
                : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
            }`}
          >
            Li-Fi (Visible Light)
          </button>
        </div>

        {/* Right: Live Telemetry Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${currentBand.badgeBg} ${currentBand.badgeBorder} ${currentBand.badgeText}`}
          >
            {currentBand.isVisibleToHumanEye ? (
              <Eye className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 opacity-70" />
            )}
            <span>
              {currentBand.name} (
              {currentBand.isVisibleToHumanEye
                ? "Human Visible 🌈"
                : "Invisible Radiation 👁️‍🗨️"}
              )
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-background border border-border text-foreground font-semibold">
              f:{" "}
              <span className="text-sky-500 font-extrabold">
                {formatFrequency(frequencyHz)}
              </span>
            </span>
            <span className="px-2 py-0.5 rounded bg-background border border-border text-foreground font-semibold">
              λ:{" "}
              <span className="text-amber-500 font-extrabold">
                {formatWavelength(wavelengthMeters)}
              </span>
            </span>
            <span className="px-2 py-0.5 rounded bg-background border border-border text-foreground font-semibold">
              E:{" "}
              <span className="text-emerald-500 font-extrabold">
                {formatEnergy(photonEnergyEv)}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* MAIN VIEWPORT CANVAS */}
      <div className="w-full border rounded-2xl bg-slate-100/90 dark:bg-slate-950/90 relative overflow-hidden shadow-inner border-border min-h-[530px] flex items-center justify-center p-4 transition-colors duration-300">
        {/* Ambient Grid Overlay */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* SVG Definitions */}
        <svg className="absolute w-0 h-0 pointer-events-none">
          <defs>
            {/* The ONLY Visible Rainbow Gradient — used strictly for the Visible Light Region */}
            <linearGradient
              id={visibleRainbowGradId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#ef4444" /> {/* Red (700 nm) */}
              <stop offset="20%" stopColor="#f97316" /> {/* Orange */}
              <stop offset="40%" stopColor="#eab308" /> {/* Yellow */}
              <stop offset="60%" stopColor="#22c55e" /> {/* Green */}
              <stop offset="80%" stopColor="#06b6d4" /> {/* Cyan */}
              <stop offset="100%" stopColor="#a855f7" /> {/* Violet (400 nm) */}
            </linearGradient>

            {/* Flat ClipPath for the continuous bar container */}
            <clipPath id={barClipId}>
              <rect x="0" y="0" width="800" height="40" rx="6" />
            </clipPath>
          </defs>
        </svg>

        <svg
          viewBox="0 0 880 540"
          className="w-full h-auto text-foreground select-none relative z-10 overflow-visible"
        >
          {/* STAGE 1: DYNAMIC DUAL-WAVE OSCILLATOR CANVAS (E-Field Oscillation) */}
          <g transform="translate(20, 15)">
            <rect
              x="0"
              y="0"
              width="840"
              height="155"
              className="fill-background/95 dark:fill-slate-900/95"
              rx="10"
              stroke="currentColor"
              strokeOpacity="0.15"
            />

            {/* Canvas Header */}
            <text
              x="20"
              y="24"
              fontSize="11"
              fontWeight="bold"
              fill="#0284c7"
              className="font-mono"
            >
              Transverse Electromagnetic Wave (E-Field) — Wavelength λ ={" "}
              {formatWavelength(wavelengthMeters)}
            </text>

            {/* Wave Center Axis */}
            <line
              x1="20"
              y1="78"
              x2="820"
              y2="78"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 3"
              opacity="0.2"
            />

            {/* Dynamic Transverse Sine Wave Path (100% Seamless Infinite Phase Propagation) */}
            <path
              d={generateWavePath(800, 78, spatialWavelengthPx, waveProgress)}
              fill="none"
              stroke={currentBand.color}
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Wavelength Dimension Bracket (λ) */}
            <g transform="translate(40, 134)">
              <line
                x1="0"
                y1="0"
                x2={spatialWavelengthPx}
                y2="0"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.7"
              />
              <line
                x1="0"
                y1="-5"
                x2="0"
                y2="5"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.7"
              />
              <line
                x1={spatialWavelengthPx}
                y1="-5"
                x2={spatialWavelengthPx}
                y2="5"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.7"
              />
              <text
                x={Math.max(55, spatialWavelengthPx / 2)}
                y="-6"
                textAnchor="middle"
                fontSize="9"
                fontWeight="extrabold"
                fill="currentColor"
                opacity="0.85"
                className="font-mono"
              >
                1 Period λ ({formatWavelength(wavelengthMeters)})
              </text>
            </g>
          </g>

          {/* STAGE 2: CONTINUOUS SPECTRUM RULER & BANDS TRACK */}
          <g transform="translate(20, 185)">
            <rect
              x="0"
              y="0"
              width="840"
              height="215"
              className="fill-background/95 dark:fill-slate-900/95"
              rx="10"
              stroke="currentColor"
              strokeOpacity="0.15"
            />

            {/* Section Header comfortably placed at y=22 */}
            <text
              x="20"
              y="22"
              fontSize="11"
              fontWeight="bold"
              fill="currentColor"
              className="font-mono"
            >
              Electromagnetic Frequency Spectrum Scale (log₁₀ Hz)
            </text>

            {/* Pointer Tooltip Badge placed at y=52 (32px gap below header text, ZERO OVERLAP EVER!) */}
            {(() => {
              const clampedX = Math.max(45, Math.min(755, pointerX));
              const arrowOffset = pointerX - clampedX;
              return (
                <g transform={`translate(${20 + clampedX}, 52)`}>
                  <rect
                    x="-42"
                    y="-16"
                    width="84"
                    height="20"
                    rx="4"
                    className="fill-slate-900 dark:fill-slate-100 shadow-md"
                  />
                  <text
                    x="0"
                    y="-3"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="extrabold"
                    className="fill-slate-100 dark:fill-slate-900 font-mono"
                  >
                    {formatFrequency(frequencyHz)}
                  </text>
                  {/* Downward Pointer Arrow matching exact white line pointerX */}
                  <polygon
                    points={`${arrowOffset},7 ${arrowOffset - 6},1 ${arrowOffset + 6},1`}
                    className="fill-slate-900 dark:fill-slate-100"
                  />
                </g>
              );
            })()}

            {/* CONTINUOUS SPECTRUM BAR TRACK (y = 95, height = 40px, ZERO OUTER BORDER, ZERO INTERNAL SEPARATION) */}
            <g transform="translate(20, 95)">
              {/* Clipped Continuous Spectrum Group */}
              <g clipPath={`url(#${barClipId})`}>
                {BANDS.map((b) => {
                  const xStart = logToX(b.logMin);
                  const xEnd = logToX(b.logMax);
                  const width = xEnd - xStart;
                  const isCurrent = currentBand.id === b.id;
                  const isHighlighted =
                    highlightBand === "none" ||
                    highlightBand === b.id ||
                    isCurrent;

                  return (
                    <rect
                      key={b.id}
                      x={xStart}
                      y="0"
                      width={width}
                      height="40"
                      fill={
                        b.isVisibleToHumanEye
                          ? `url(#${visibleRainbowGradId})`
                          : b.color
                      }
                      fillOpacity={
                        b.isVisibleToHumanEye
                          ? isHighlighted
                            ? 1.0
                            : 0.35
                          : isHighlighted
                            ? isCurrent
                              ? 0.65
                              : 0.4
                            : 0.1
                      }
                      className="cursor-pointer transition-opacity duration-200"
                      onClick={() =>
                        setPresetFrequency((b.logMin + b.logMax) / 2, b.id)
                      }
                    />
                  );
                })}

                {/* Vertical Active Pointer Line spanning full height of continuous bar */}
                <line
                  x1={pointerX}
                  y1="0"
                  x2={pointerX}
                  y2="40"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
              </g>

              {/* Clean Non-Overlapping Frequency Scale Ticks (Positioned directly under the continuous track at y=54) */}
              <g
                transform="translate(0, 54)"
                fontSize="9"
                fontWeight="bold"
                fill="currentColor"
                opacity="0.8"
                className="font-mono"
              >
                <text x={logToX(3.0)} y="0" textAnchor="start">
                  3 kHz
                </text>
                <text x={logToX(6.0)} y="0" textAnchor="middle">
                  1 MHz
                </text>
                <text x={logToX(9.477)} y="0" textAnchor="middle">
                  3 GHz
                </text>
                <text x={logToX(11.477)} y="0" textAnchor="middle">
                  300 GHz
                </text>
                <text x={logToX(16.0)} y="0" textAnchor="middle">
                  1 PHz
                </text>
                <text x={logToX(19.0)} y="0" textAnchor="end">
                  10 EHz
                </text>
              </g>
            </g>

            {/* BAND CATEGORY LABELS (y = 188) UNIFIED ALONG THE EXACT SAME VERTICAL BASELINE */}
            <g
              transform="translate(20, 188)"
              fontSize="10"
              fontWeight="bold"
              className="font-sans"
            >
              {/* Radio Waves Label */}
              <g
                transform={`translate(${(logToX(3.0) + logToX(9.477)) / 2}, 0)`}
              >
                <text x="0" y="0" textAnchor="middle" fill="#0284c7">
                  Radio Waves
                </text>
                <text
                  x="0"
                  y="12"
                  textAnchor="middle"
                  fontSize="8"
                  fill="currentColor"
                  opacity="0.5"
                  className="font-mono"
                >
                  Invisible
                </text>
              </g>

              {/* Microwaves Label */}
              <g
                transform={`translate(${(logToX(9.477) + logToX(11.477)) / 2}, 0)`}
              >
                <text x="0" y="0" textAnchor="middle" fill="#d97706">
                  Microwaves
                </text>
                <text
                  x="0"
                  y="12"
                  textAnchor="middle"
                  fontSize="8"
                  fill="currentColor"
                  opacity="0.5"
                  className="font-mono"
                >
                  Invisible
                </text>
              </g>

              {/* Infrared Label */}
              <g
                transform={`translate(${(logToX(11.477) + logToX(14.602)) / 2}, 0)`}
              >
                <text x="0" y="0" textAnchor="middle" fill="#e11d48">
                  Infrared
                </text>
                <text
                  x="0"
                  y="12"
                  textAnchor="middle"
                  fontSize="8"
                  fill="currentColor"
                  opacity="0.5"
                  className="font-mono"
                >
                  Invisible
                </text>
              </g>

              {/* Visible Light Rainbow Callout Badge perfectly baseline-aligned */}
              <g
                transform={`translate(${(logToX(14.602) + logToX(14.897)) / 2}, 0)`}
              >
                <rect
                  x="-38"
                  y="-10"
                  width="76"
                  height="28"
                  rx="6"
                  fill="#10b981"
                  fillOpacity="0.2"
                  stroke="#10b981"
                  strokeWidth="1.5"
                />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  fontSize="8.5"
                  fontWeight="extrabold"
                  fill="#10b981"
                >
                  VISIBLE 🌈
                </text>
                <text
                  x="0"
                  y="13"
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="bold"
                  fill="#10b981"
                  className="font-mono"
                >
                  400–790 THz
                </text>
              </g>

              {/* Ionizing Label */}
              <g
                transform={`translate(${(logToX(14.897) + logToX(19.0)) / 2}, 0)`}
              >
                <text x="0" y="0" textAnchor="middle" fill="#a855f7">
                  Ionizing Radiation
                </text>
                <text
                  x="0"
                  y="12"
                  textAnchor="middle"
                  fontSize="8"
                  fill="currentColor"
                  opacity="0.5"
                  className="font-mono"
                >
                  UV / X-Ray / Gamma
                </text>
              </g>
            </g>
          </g>

          {/* STAGE 3: ACTIVE BAND NETWORKING & PROPAGATION CARDS */}
          <g transform="translate(20, 412)">
            <rect
              x="0"
              y="0"
              width="840"
              height="115"
              className="fill-background/95 dark:fill-slate-900/95"
              rx="10"
              stroke="currentColor"
              strokeOpacity="0.15"
            />

            <g transform="translate(20, 20)">
              {/* Header Title */}
              <text
                x="0"
                y="0"
                fontSize="12"
                fontWeight="bold"
                fill={currentBand.color}
                className="font-sans"
              >
                {currentBand.name} ({currentBand.rangeLabel}) —{" "}
                {currentBand.isVisibleToHumanEye
                  ? "Visible Optical Spectrum 🌈"
                  : "Invisible Radiation 👁️‍🗨️"}
              </text>

              {/* Structured Details */}
              <g
                transform="translate(0, 18)"
                fontSize="11"
                className="font-sans"
              >
                <text x="0" y="12" fill="currentColor" className="font-medium">
                  <tspan fontWeight="bold" fill="currentColor">
                    Key Characteristics:{" "}
                  </tspan>
                  {currentBand.description}
                </text>

                <text x="0" y="32" fill="currentColor" className="font-medium">
                  <tspan fontWeight="bold" fill="#0284c7">
                    Networking Applications:{" "}
                  </tspan>
                  {currentBand.networkingUse}
                </text>

                <text x="0" y="52" fill="currentColor" className="font-medium">
                  <tspan fontWeight="bold" fill="#d97706">
                    Propagation Mode:{" "}
                  </tspan>
                  {currentBand.propagationMode}
                </text>
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* PARAMETER SLIDER FOR LOG FREQUENCY */}
      <div className="p-4 rounded-xl bg-card border border-border space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-foreground flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-sky-500" /> Dynamic Frequency Sweep
            (log₁₀ f)
          </span>
          <span className="font-mono text-sky-500 font-bold">
            f = {formatFrequency(frequencyHz)} | λ ={" "}
            {formatWavelength(wavelengthMeters)}
          </span>
        </div>
        <input
          type="range"
          min="3.0"
          max="19.0"
          step="0.1"
          value={freqLog}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-sky-500"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span>3.0 (3 kHz Radio)</span>
          <span>9.0 (1 GHz Sub-6)</span>
          <span>9.38 (2.4 GHz Wi-Fi)</span>
          <span>10.45 (28 GHz 5G)</span>
          <span>14.75 (560 THz Li-Fi)</span>
          <span>19.0 (Ionizing)</span>
        </div>
      </div>

      {/* PEDAGOGICAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Radio className="w-4 h-4 text-sky-500" /> Radio & Sub-6 GHz 5G
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Invisible lower frequencies (under 3 GHz) have long wavelengths that
            easily penetrate walls and bend around obstacles, making them
            essential for broad coverage cellular networks.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Wifi className="w-4 h-4 text-amber-500" /> Microwaves & 5G mmWave
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Invisible high frequencies (3 GHz to 300 GHz) offer massive data
            bandwidth (multi-gigabit speeds) but suffer from shorter range and
            atmospheric absorption by rain and foliage.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Sun className="w-4 h-4 text-emerald-500" /> Optical Wireless
            (Li-Fi)
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Uses visible light (400 to 790 THz) — the only band visible to human
            eyes — modulated at nanosecond speeds for secure indoor wireless
            links.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER HOOK: SMOOTH WAVE ANIMATION STATE
// ============================================================================
function useWaveAnimation(activePlaying: boolean, globalSpeed: number) {
  const [time, setTime] = useState(0);
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
      setTime((prev) => prev + delta * globalSpeed);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [activePlaying, globalSpeed]);

  return time;
}

// ============================================================================
// SVG PATH GENERATOR (PERFECT SEAMLESS INFINITE LOOPING WITH NO PHASE JUMPS)
// ============================================================================
function getWaveY(
  x: number,
  centerY: number,
  wavelengthPx: number,
  timeSec: number,
): number {
  const amplitude = 32;

  // Constant propagation speed (c = 120 px/s): waves travel at identical spatial speed across ALL frequencies
  const speedPxPerSec = 120;
  const travelDistPx = timeSec * speedPxPerSec;
  const phase = ((x - travelDistPx) / wavelengthPx) * Math.PI * 2;
  return centerY - Math.sin(phase) * amplitude;
}

function generateWavePath(
  width: number,
  centerY: number,
  wavelengthPx: number,
  timeSec: number,
): string {
  const points: string[] = [];
  const startX = 20;
  // Dynamic sampling step: guarantees at least 24 points per wave period so high-frequency sine waves remain smooth curves without polygonal aliasing
  const step = Math.max(0.5, Math.min(1.5, wavelengthPx / 24));

  for (let x = 0; x <= width; x += step) {
    const y = getWaveY(x, centerY, wavelengthPx, timeSec);
    const px = startX + x;
    if (x === 0) {
      points.push(`M ${px.toFixed(1)} ${y.toFixed(1)}`);
    } else {
      points.push(`L ${px.toFixed(1)} ${y.toFixed(1)}`);
    }
  }

  return points.join(" ");
}
