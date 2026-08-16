import { useEffect, useRef, useId, useState } from "react";
import { type VizMeta } from "../types";
import { useAppStore } from "../../state/appStore";
import { Radio, Sliders, Globe, Zap } from "lucide-react";

export const vizMeta: VizMeta = {
  key: "network-frequency-bands",
  title: "Radio Frequency Bands (VLF–EHF)",
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
        { label: "VLF (3–30 kHz)", value: "vlf" },
        { label: "LF (30–300 kHz)", value: "lf" },
        { label: "MF (300 kHz–3 MHz)", value: "mf" },
        { label: "HF (3–30 MHz)", value: "hf" },
        { label: "VHF (30–300 MHz)", value: "vhf" },
        { label: "UHF (300 MHz–3 GHz)", value: "uhf" },
        { label: "SHF (3–30 GHz)", value: "shf" },
        { label: "EHF (30–300 GHz)", value: "ehf" },
      ],
    },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
  isPlaying?: boolean;
}

export interface RadioBandInfo {
  id: string;
  name: string;
  fullName: string;
  rangeLabel: string;
  logMin: number;
  logMax: number;
  wavelength: string;
  humanScale: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  propagationMode: string;
  methodType: "ground" | "sky" | "los";
  applications: string;
  description: string;
}

// 8 ITU Radio Bands — Logarithmic bounds from log10(3 kHz) = 3.477 to log10(300 GHz) = 11.477
const BANDS: RadioBandInfo[] = [
  {
    id: "vlf",
    name: "VLF",
    fullName: "Very Low Frequency",
    rangeLabel: "3 kHz – 30 kHz",
    logMin: 3.477,
    logMax: 4.477,
    wavelength: "100 km – 10 km",
    humanScale: "City / Mountain range",
    color: "#f59e0b",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/30",
    badgeText: "text-amber-600 dark:text-amber-400",
    propagationMode: "Ground Wave Propagation",
    methodType: "ground",
    applications: "Long-range radio navigation, Submarine communication",
    description:
      "Waves bend around Earth surface contours. Deep water penetration for submarine signals.",
  },
  {
    id: "lf",
    name: "LF",
    fullName: "Low Frequency",
    rangeLabel: "30 kHz – 300 kHz",
    logMin: 4.477,
    logMax: 5.477,
    wavelength: "10 km – 1 km",
    humanScale: "Mountain range / Island",
    color: "#eab308",
    badgeBg: "bg-yellow-500/10",
    badgeBorder: "border-yellow-500/30",
    badgeText: "text-yellow-600 dark:text-yellow-400",
    propagationMode: "Ground Wave Propagation",
    methodType: "ground",
    applications: "Radio beacons, Navigational locators",
    description:
      "Follows Earth surface curvature with low atmospheric attenuation over long distances.",
  },
  {
    id: "mf",
    name: "MF",
    fullName: "Medium Frequency",
    rangeLabel: "300 kHz – 3 MHz",
    logMin: 5.477,
    logMax: 6.477,
    wavelength: "1 km – 100 m",
    humanScale: "Skyscraper / Suspension Bridge",
    color: "#ec4899",
    badgeBg: "bg-pink-500/10",
    badgeBorder: "border-pink-500/30",
    badgeText: "text-pink-600 dark:text-pink-400",
    propagationMode: "Sky Wave & Ground Wave",
    methodType: "sky",
    applications: "AM Radio broadcasting, Maritime communications",
    description:
      "Absorbed by D-layer during day; reflects off ionosphere at night for long-distance skip.",
  },
  {
    id: "hf",
    name: "HF",
    fullName: "High Frequency",
    rangeLabel: "3 MHz – 30 MHz",
    logMin: 6.477,
    logMax: 7.477,
    wavelength: "100 m – 10 m",
    humanScale: "Football Field / City Block",
    color: "#d946ef",
    badgeBg: "bg-fuchsia-500/10",
    badgeBorder: "border-fuchsia-500/30",
    badgeText: "text-fuchsia-600 dark:text-fuchsia-400",
    propagationMode: "Sky Wave (Ionospheric Reflection)",
    methodType: "sky",
    applications: "Citizens Band (CB), Shortwave radio, Ship & Aircraft links",
    description:
      "Reflects repeatedly between Ionosphere and Earth surface for intercontinental reach.",
  },
  {
    id: "vhf",
    name: "VHF",
    fullName: "Very High Frequency",
    rangeLabel: "30 MHz – 300 MHz",
    logMin: 7.477,
    logMax: 8.477,
    wavelength: "10 m – 1 m",
    humanScale: "Car / Residential Room",
    color: "#06b6d4",
    badgeBg: "bg-cyan-500/10",
    badgeBorder: "border-cyan-500/30",
    badgeText: "text-cyan-600 dark:text-cyan-400",
    propagationMode: "Line-of-Sight (LOS) & Sky Wave",
    methodType: "los",
    applications: "FM Radio, VHF TV, Aviation & Air Traffic Control",
    description:
      "Passes through ionosphere; requires direct line-of-sight between transmitter and receiver.",
  },
  {
    id: "uhf",
    name: "UHF",
    fullName: "Ultrahigh Frequency",
    rangeLabel: "300 MHz – 3 GHz",
    logMin: 8.477,
    logMax: 9.477,
    wavelength: "1 m – 10 cm",
    humanScale: "Handheld / Mobile Phone",
    color: "#0284c7",
    badgeBg: "bg-sky-500/10",
    badgeBorder: "border-sky-500/30",
    badgeText: "text-sky-600 dark:text-sky-400",
    propagationMode: "Line-of-Sight (LOS)",
    methodType: "los",
    applications: "Cellular networks (4G/5G), Wi-Fi, UHF TV, GPS",
    description:
      "Straight line-of-sight propagation. Compact antennas suitable for mobile devices.",
  },
  {
    id: "shf",
    name: "SHF",
    fullName: "Superhigh Frequency",
    rangeLabel: "3 GHz – 30 GHz",
    logMin: 9.477,
    logMax: 10.477,
    wavelength: "10 cm – 1 cm",
    humanScale: "Coin / Fingernail",
    color: "#3b82f6",
    badgeBg: "bg-blue-500/10",
    badgeBorder: "border-blue-500/30",
    badgeText: "text-blue-600 dark:text-blue-400",
    propagationMode: "Line-of-Sight (LOS)",
    methodType: "los",
    applications: "Satellite communications, Microwave links, Wi-Fi 6",
    description:
      "Highly directional narrow beams; requires line-of-sight with dish reflectors.",
  },
  {
    id: "ehf",
    name: "EHF",
    fullName: "Extremely High Frequency",
    rangeLabel: "30 GHz – 300 GHz",
    logMin: 10.477,
    logMax: 11.477,
    wavelength: "1 cm – 1 mm",
    humanScale: "Raindrop / Insect",
    color: "#8b5cf6",
    badgeBg: "bg-purple-500/10",
    badgeBorder: "border-purple-500/30",
    badgeText: "text-purple-600 dark:text-purple-400",
    propagationMode: "Line-of-Sight (LOS)",
    methodType: "los",
    applications: "mmWave 5G, Satellite radar, Radio astronomy",
    description:
      "Millimeter waves with extreme bandwidth; absorbed by atmospheric rain and foliage.",
  },
];

// Helper: Convert log10(frequency) to exact pixel X coordinate (0 to 800px)
function logToX(logVal: number): number {
  const clampLog = Math.max(3.477, Math.min(11.477, logVal));
  return ((clampLog - 3.477) / 8.0) * 800;
}

export default function FrequencyBands({
  values,
  onChange,
  isPlaying: isPlayingProp,
}: Props) {
  const highlightBand = (values.highlightBand as string) || "none";
  const freqLog = Number(values.freqLog ?? 8.977); // ~950 MHz (UHF)

  const activePlaying = isPlayingProp ?? true;
  const globalSpeed = useAppStore((state) => state.globalSpeedMultiplier) || 1;

  // Real-time animation hook (matches EmSpectrum exactly)
  const waveProgress = useWaveAnimation(activePlaying, globalSpeed);

  // SVG Unique IDs
  const rawId = useId();
  const barClipId = `bar-clip-flat-${rawId.replace(/:/g, "")}`;

  // Sync band focus dropdown to frequency slider
  const targetBand = BANDS.find((b) => b.id === highlightBand);

  useEffect(() => {
    if (
      highlightBand !== "none" &&
      targetBand &&
      (freqLog < targetBand.logMin || freqLog > targetBand.logMax)
    ) {
      const midLog = Number(
        ((targetBand.logMin + targetBand.logMax) / 2).toFixed(3),
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
  const wavelengthMeters = SPEED_OF_LIGHT / frequencyHz;

  // Determine current active band strictly from freqLog bounds
  const currentBand =
    BANDS.find((b) => freqLog >= b.logMin && freqLog <= b.logMax) || BANDS[5];

  // Helper formatting functions
  const formatFrequency = (f: number) => {
    if (f < 1e6) return `${(f / 1e3).toFixed(1)} kHz`;
    if (f < 1e9) return `${(f / 1e6).toFixed(1)} MHz`;
    return `${(f / 1e9).toFixed(2)} GHz`;
  };

  const formatWavelength = (w: number) => {
    if (w >= 1000) return `${(w / 1000).toFixed(1)} km`;
    if (w >= 1.0) return `${w.toFixed(2)} m`;
    if (w >= 0.01) return `${(w * 100).toFixed(1)} cm`;
    return `${(w * 1000).toFixed(1)} mm`;
  };

  // Quick Preset Handlers
  const setPresetFrequency = (logVal: number, bandId: string) => {
    onChange?.({
      ...values,
      freqLog: logVal,
      highlightBand: bandId,
    });
  };

  // Dynamic Frequency Slider Handler
  const handleSliderChange = (logVal: number) => {
    const newBand =
      BANDS.find((b) => logVal >= b.logMin && logVal <= b.logMax) || BANDS[5];

    onChange?.({
      ...values,
      freqLog: logVal,
      highlightBand: newBand.id,
    });
  };

  // Spatial Wavelength in pixels for SVG rendering
  const spatialWavelengthPx = Math.max(
    18,
    Math.min(150, 150 - (freqLog - 3.477) * 16.0),
  );

  // Pointer position on spectrum bar (0 to 800px)
  const pointerX = logToX(freqLog);

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none">
      {/* TOP TOOLBAR: QUICK FREQUENCY PRESETS & TELEMETRY */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-muted/30 border border-border">
        {/* Left: Quick Band Selectors */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-500" /> Presets:
          </span>
          {BANDS.map((b) => (
            <button
              key={b.id}
              onClick={() => setPresetFrequency((b.logMin + b.logMax) / 2, b.id)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all border ${
                currentBand.id === b.id
                  ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm"
                  : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>

        {/* Right: Live Telemetry Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${currentBand.badgeBg} ${currentBand.badgeBorder} ${currentBand.badgeText}`}
          >
            <span>{currentBand.name} ({currentBand.propagationMode})</span>
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
              {formatWavelength(wavelengthMeters)} ({currentBand.humanScale})
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

            {/* Dynamic Transverse Sine Wave Path */}
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

            {/* Section Header */}
            <text
              x="20"
              y="22"
              fontSize="11"
              fontWeight="bold"
              fill="currentColor"
              className="font-mono"
            >
              ITU Radio Frequency Spectrum Scale (VLF – EHF)
            </text>

            {/* Pointer Tooltip Badge */}
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
                  <polygon
                    points={`${arrowOffset},7 ${arrowOffset - 6},1 ${arrowOffset + 6},1`}
                    className="fill-slate-900 dark:fill-slate-100"
                  />
                </g>
              );
            })()}

            {/* CONTINUOUS SPECTRUM BAR TRACK */}
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
                      fill={b.color}
                      fillOpacity={
                        isHighlighted
                          ? isCurrent
                            ? 0.9
                            : 0.5
                          : 0.15
                      }
                      className="cursor-pointer transition-opacity duration-200"
                      onClick={() =>
                        setPresetFrequency((b.logMin + b.logMax) / 2, b.id)
                      }
                    />
                  );
                })}

                {/* Vertical Active Pointer Line */}
                <line
                  x1={pointerX}
                  y1="0"
                  x2={pointerX}
                  y2="40"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
              </g>

              {/* Frequency Scale Ticks */}
              <g
                transform="translate(0, 54)"
                fontSize="9"
                fontWeight="bold"
                fill="currentColor"
                opacity="0.8"
                className="font-mono"
              >
                <text x={logToX(3.477)} y="0" textAnchor="start">
                  3 kHz
                </text>
                <text x={logToX(5.477)} y="0" textAnchor="middle">
                  300 kHz
                </text>
                <text x={logToX(7.477)} y="0" textAnchor="middle">
                  30 MHz
                </text>
                <text x={logToX(9.477)} y="0" textAnchor="middle">
                  3 GHz
                </text>
                <text x={logToX(11.477)} y="0" textAnchor="end">
                  300 GHz
                </text>
              </g>
            </g>

            {/* BAND CATEGORY LABELS UNIFIED ALONG BASELINE */}
            <g
              transform="translate(20, 188)"
              fontSize="10"
              fontWeight="bold"
              className="font-sans"
            >
              {BANDS.map((b) => {
                const midX = (logToX(b.logMin) + logToX(b.logMax)) / 2;
                const isCurrent = currentBand.id === b.id;
                return (
                  <g key={b.id} transform={`translate(${midX}, 0)`}>
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      fill={b.color}
                      fontWeight={isCurrent ? "extrabold" : "bold"}
                    >
                      {b.name}
                    </text>
                    <text
                      x="0"
                      y="12"
                      textAnchor="middle"
                      fontSize="8"
                      fill="currentColor"
                      opacity="0.6"
                      className="font-mono"
                    >
                      {b.methodType.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>

          {/* STAGE 3: ACTIVE BAND DETAILS & PROPAGATION CARDS */}
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
                {currentBand.name} ({currentBand.fullName}) — {currentBand.rangeLabel}
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
                  {currentBand.applications}
                </text>

                <text x="0" y="52" fill="currentColor" className="font-medium">
                  <tspan fontWeight="bold" fill="#d97706">
                    Propagation Mode:{" "}
                  </tspan>
                  {currentBand.propagationMode} (Scale: {currentBand.humanScale})
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
            <Sliders className="w-4 h-4 text-amber-500" /> Dynamic Radio Frequency Sweep
            (log₁₀ f)
          </span>
          <span className="font-mono text-amber-500 font-bold">
            f = {formatFrequency(frequencyHz)} | λ ={" "}
            {formatWavelength(wavelengthMeters)}
          </span>
        </div>
        <input
          type="range"
          min="3.477"
          max="11.477"
          step="0.01"
          value={freqLog}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span>3.477 (3 kHz VLF)</span>
          <span>5.477 (300 kHz MF)</span>
          <span>7.477 (30 MHz VHF)</span>
          <span>9.477 (3 GHz SHF)</span>
          <span>11.477 (300 GHz EHF)</span>
        </div>
      </div>

      {/* PEDAGOGICAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Globe className="w-4 h-4 text-amber-500" /> Ground Wave Propagation
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            VLF & LF bands (&lt; 300 kHz) follow Earth's curvature. Waves hug the ground for long distances and penetrate deep water for submarine navigation.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Zap className="w-4 h-4 text-pink-500" /> Sky Wave Propagation
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            MF & HF bands (300 kHz – 30 MHz) reflect off the ionosphere layers back to Earth, enabling international shortwave and CB radio skip communications.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Radio className="w-4 h-4 text-cyan-500" /> Line-of-Sight (LOS)
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            VHF through EHF bands (&gt; 30 MHz) pass through the ionosphere. Require direct unobstructed sight lines between towers, satellites, and mobile antennas.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER HOOK: SMOOTH WAVE ANIMATION STATE (MATCHES EMSPECTRUM 100%)
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
// SVG PATH GENERATOR (MATCHES EMSPECTRUM 100% — CONSTANT SPATIAL SPEED c = 120 px/s)
// ============================================================================
function getWaveY(
  x: number,
  centerY: number,
  wavelengthPx: number,
  timeSec: number,
): number {
  const amplitude = 32;
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
