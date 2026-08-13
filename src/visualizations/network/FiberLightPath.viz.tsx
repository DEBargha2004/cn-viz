import { useState, useEffect, useRef, useId } from "react";
import { type VizMeta } from "../types";
import { useAppStore } from "../../state/appStore";
import {
  Zap,
  ShieldCheck,
  Layers,
  Sparkles,
  Activity,
  Compass,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const vizMeta: VizMeta = {
  key: "network-fiber-light-path",
  title: "Light Path Through Core & Cladding",
  category: "network",
  renderer: "svg",
  animated: true,
  params: [
    {
      key: "launchAngle",
      type: "number",
      label: "Angle of Incidence θᵢ (°)",
      default: 78,
      min: 40,
      max: 88,
      step: 1,
    },
    {
      key: "n1",
      type: "number",
      label: "Core Refractive Index (n₁)",
      default: 1.48,
      min: 1.40,
      max: 1.65,
      step: 0.01,
    },
    {
      key: "n2",
      type: "number",
      label: "Cladding Refractive Index (n₂)",
      default: 1.45,
      min: 1.30,
      max: 1.47,
      step: 0.01,
    },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
  isPlaying?: boolean;
}

interface BouncePoint {
  x: number;
  y: number;
  isTop: boolean;
}

export default function FiberLightPath({ values, isPlaying: isPlayingProp }: Props) {
  // Read params or fallback to defaults
  const paramAngle = Number(values.launchAngle ?? 78);
  const paramN1 = Number(values.n1 ?? 1.48);
  const paramN2 = Number(values.n2 ?? 1.45);

  // Controlled UI states with preset triggers
  const [launchAngle, setLaunchAngle] = useState<number>(paramAngle);
  const [n1, setN1] = useState<number>(paramN1);
  const [n2, setN2] = useState<number>(paramN2);
  const [pulseProgress, setPulseProgress] = useState<number>(0);

  // Sync animation play state with parent VisualizationHeader action button
  const activePlaying = isPlayingProp ?? true;

  // Keep local state in sync with control panel param changes
  useEffect(() => {
    setLaunchAngle(paramAngle);
  }, [paramAngle]);

  useEffect(() => {
    setN1(paramN1);
  }, [paramN1]);

  useEffect(() => {
    setN2(paramN2);
  }, [paramN2]);

  const globalSpeed = useAppStore((state) => state.globalSpeedMultiplier) || 1;

  // SVG Unique IDs for glow filters and gradients
  const rawId = useId();
  const glowLaserId = `laser-glow-${rawId.replace(/:/g, "")}`;
  const laserGradId = `laser-grad-${rawId.replace(/:/g, "")}`;

  // Physical Optics Calculations (Snell's Law & Total Internal Reflection)
  const effectiveN1 = Math.max(n1, n2 + 0.01);
  const effectiveN2 = Math.min(n2, n1 - 0.01);

  // Critical Angle theta_c = arcsin(n2 / n1) in degrees
  const criticalAngleRad = Math.asin(effectiveN2 / effectiveN1);
  const criticalAngleDeg = (criticalAngleRad * 180) / Math.PI;

  // Numerical Aperture NA = sqrt(n1^2 - n2^2)
  const numericalAperture = Math.sqrt(
    Math.pow(effectiveN1, 2) - Math.pow(effectiveN2, 2)
  );

  // Maximum Acceptance Angle in Air theta_a = arcsin(NA)
  const acceptanceAngleRad = Math.asin(Math.min(1.0, numericalAperture));
  const acceptanceAngleDeg = (acceptanceAngleRad * 180) / Math.PI;

  // Angle of Incidence theta_i relative to normal line
  const thetaI = launchAngle;
  const isTotalInternalReflection = thetaI >= criticalAngleDeg;

  // Angle relative to horizontal axis inside core alpha = 90 - thetaI
  const alphaDeg = Math.max(1, 90 - thetaI);
  const alphaRad = (alphaDeg * Math.PI) / 180;

  // Refracted Angle in Cladding if thetaI < criticalAngleDeg
  const sinThetaT = (effectiveN1 / effectiveN2) * Math.sin((thetaI * Math.PI) / 180);
  const thetaTDeg = sinThetaT <= 1.0 ? (Math.asin(sinThetaT) * 180) / Math.PI : 90;

  // Geometry Setup (Canvas 800 x 360)
  const width = 800;
  const height = 360;
  const coreYTop = 110;
  const coreYBottom = 250;
  const coreHeight = coreYBottom - coreYTop; // 140px
  const coreCenterY = (coreYTop + coreYBottom) / 2; // 180px
  const startX = 140;
  const endX = 760;

  // Calculate bounce points along the core
  const bounces: BouncePoint[] = [];
  const tanAlpha = Math.tan(alphaRad);

  const dxHalf = (coreHeight / 2) / tanAlpha;
  const dxFull = coreHeight / tanAlpha;

  let currentX = startX + dxHalf;
  let isTop = true;

  while (currentX < endX) {
    bounces.push({ x: currentX, y: isTop ? coreYTop : coreYBottom, isTop });
    currentX += dxFull;
    isTop = !isTop;
  }

  // Build full light ray path string
  let rayPathD = `M 35 ${coreCenterY} L ${startX} ${coreCenterY}`;
  let prevX = startX;
  let prevY = coreCenterY;

  for (let i = 0; i < bounces.length; i++) {
    const b = bounces[i];
    rayPathD += ` L ${b.x} ${b.y}`;
    prevX = b.x;
    prevY = b.y;
  }

  // Extend final segment to the end of the fiber core
  if (prevX < endX) {
    const remainingDx = endX - prevX;
    const dy = remainingDx * tanAlpha * (bounces.length % 2 === 1 ? 1 : -1);
    const finalY = Math.min(coreYBottom, Math.max(coreYTop, prevY + dy));
    rayPathD += ` L ${endX} ${finalY} L ${endX + 25} ${finalY}`;
  }

  // Animation Loop for Photon Pulse
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
      setPulseProgress((prev) => (prev + delta * 0.35 * globalSpeed) % 1.0);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [activePlaying, globalSpeed]);

  // Preset Handlers
  const handlePresetTIR = () => {
    setLaunchAngle(78);
    setN1(1.48);
    setN2(1.45);
  };

  const handlePresetSteep = () => {
    setLaunchAngle(55);
    setN1(1.48);
    setN2(1.45);
  };

  const handlePresetHighBounce = () => {
    setLaunchAngle(68);
    setN1(1.52);
    setN2(1.40);
  };

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none">
      {/* SECONDARY TOOLBAR: PRESETS & OPTICAL STATS (ALIGNED WITH CABLECUTAWAY & RJ45) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-muted/30 border border-border">
        {/* Left: Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Presets:
          </span>
          <button
            onClick={handlePresetTIR}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              isTotalInternalReflection && launchAngle === 78
                ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-xs"
                : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
            }`}
          >
            Guided Ray (TIR)
          </button>
          <button
            onClick={handlePresetSteep}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              !isTotalInternalReflection
                ? "bg-rose-500 text-white border-rose-400 font-bold shadow-xs"
                : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
            }`}
          >
            Steep Ray (Leaking)
          </button>
          <button
            onClick={handlePresetHighBounce}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              launchAngle === 68
                ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-xs"
                : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
            }`}
          >
            High Reflections
          </button>
        </div>

        {/* Right: Ray Status Badge & Live Numeric Stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              isTotalInternalReflection
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
            }`}
          >
            {isTotalInternalReflection ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Guided Ray (TIR)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Leaking Ray (Refracted)</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-background border border-border text-foreground font-semibold">
              θᵢ: <span className="text-amber-500 font-extrabold">{thetaI}°</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-background border border-border text-foreground font-semibold">
              θ꜀: <span className="text-sky-500 font-extrabold">{criticalAngleDeg.toFixed(1)}°</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-background border border-border text-foreground font-semibold">
              NA: <span className="text-emerald-500 font-extrabold">{numericalAperture.toFixed(3)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* MAIN SVG CANVAS VIEWPORT (THEME-AWARE CONTAINER) */}
      <div className="w-full border rounded-2xl bg-slate-100/80 dark:bg-slate-950/90 relative overflow-hidden shadow-inner border-border h-[380px] sm:h-[400px] flex items-center justify-center p-2 transition-colors duration-300">
        {/* Ambient Radial Grid Overlay */}
        <div
          className="absolute inset-0 opacity-25 dark:opacity-30 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto text-foreground relative z-10 select-none"
        >
          <defs>
            {/* Laser Glow Filter */}
            <filter id={glowLaserId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Glowing Cyan Laser Gradient */}
            <linearGradient id={laserGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="1.0" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* OUTER PROTECTIVE BUFFER JACKET */}
          <rect
            x="130"
            y="25"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 4"
            width="640"
            height="310"
            rx="14"
            fill="currentColor"
            opacity="0.04"
          />

          {/* TOP CLADDING LAYER */}
          <rect x="140" y="45" width="620" height="65" fill="#3b82f6" opacity="0.12" rx="4" />

          {/* BOTTOM CLADDING LAYER */}
          <rect x="140" y="250" width="620" height="65" fill="#3b82f6" opacity="0.12" rx="4" />

          {/* CENTRAL GLASS CORE CHANNEL */}
          <rect x="140" y="110" width="620" height="140" fill="#0284c7" opacity="0.14" />

          {/* CORE-CLADDING BOUNDARY INTERFACE DASHED LINES */}
          <line
            x1="140"
            y1={coreYTop}
            x2="760"
            y2={coreYTop}
            stroke="#0284c7"
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity="0.8"
          />
          <line
            x1="140"
            y1={coreYBottom}
            x2="760"
            y2={coreYBottom}
            stroke="#0284c7"
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity="0.8"
          />

          {/* CENTER LINE OF CORE */}
          <line
            x1="140"
            y1={coreCenterY}
            x2="760"
            y2={coreCenterY}
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.3"
          />

          {/* ENTRY ACCEPTANCE CONE AT CORE FACE (X = 140) */}
          <g transform={`translate(${startX}, ${coreCenterY})`}>
            {/* Translucent Acceptance Cone Wedge */}
            <polygon
              points={`0,0 -40,${-Math.tan((acceptanceAngleRad * 0.85)) * 40} -40,${Math.tan((acceptanceAngleRad * 0.85)) * 40}`}
              fill="#38bdf8"
              opacity="0.25"
              stroke="#0284c7"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          </g>

          {/* INPUT LIGHT SOURCE DIODE (LASER TRANSMITTER - LEFT OUTSIDE FIBER) */}
          <g transform={`translate(20, ${coreCenterY - 26})`}>
            <rect x="0" y="0" width="80" height="52" rx="8" fill="#0f172a" stroke="#0284c7" strokeWidth="2" />
            <circle cx="40" cy="26" r="12" fill="#38bdf8" filter={`url(#${glowLaserId})`} />
            <text x="40" y="-8" textAnchor="middle" fontSize="10" fontWeight="extrabold" fill="#0284c7" letterSpacing="0.5">
              LASER SOURCE
            </text>
          </g>

          {/* NORMAL LINES & ANGLE ARCS AT BOUNCE POINTS */}
          {bounces.map((b, idx) => {
            const normalLen = 40;
            const yNormalStart = b.isTop ? b.y - 10 : b.y + 10;
            const yNormalEnd = b.isTop ? b.y + normalLen : b.y - normalLen;

            return (
              <g key={idx}>
                {/* Vertical Normal Line (Perpendicular to Core-Cladding Interface) */}
                <line
                  x1={b.x}
                  y1={yNormalStart}
                  x2={b.x}
                  y2={yNormalEnd}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.7"
                />

                {/* Normal Angle Marker (Right Angle Symbol) */}
                <rect
                  x={b.x + (b.isTop ? 2 : -10)}
                  y={b.y + (b.isTop ? 2 : -10)}
                  width="8"
                  height="8"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1"
                  opacity="0.7"
                />

                {/* Reflection Node Dot */}
                <circle
                  cx={b.x}
                  cy={b.y}
                  r="4.5"
                  fill={isTotalInternalReflection ? "#38bdf8" : "#f43f5e"}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  filter={`url(#${glowLaserId})`}
                />

                {/* Refracted / Escaping Light Ray if thetaI < criticalAngle */}
                {!isTotalInternalReflection && (
                  <g>
                    {/* Leaked ray penetrating into cladding */}
                    <line
                      x1={b.x}
                      y1={b.y}
                      x2={b.x + 55}
                      y2={b.isTop ? b.y - 50 : b.y + 50}
                      stroke="#f43f5e"
                      strokeWidth="3.5"
                      strokeDasharray="5 3"
                      filter={`url(#${glowLaserId})`}
                    />
                  </g>
                )}
              </g>
            );
          })}

          {/* CORE LIGHT RAY (MAIN GUIDED BEAM) */}
          <path
            d={rayPathD}
            fill="none"
            stroke={isTotalInternalReflection ? "#38bdf8" : "#f43f5e"}
            strokeWidth={isTotalInternalReflection ? "4" : "2.5"}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${glowLaserId})`}
          />

          {/* CORE INNER GLOW LINE */}
          <path
            d={rayPathD}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />

          {/* ANIMATED PHOTON PULSE ALONG RAY */}
          {activePlaying && (
            <path
              d={rayPathD}
              fill="none"
              stroke="#e0f2fe"
              strokeWidth="6"
              strokeDasharray="20 120"
              strokeDashoffset={-pulseProgress * 280}
              strokeLinecap="round"
              filter={`url(#${glowLaserId})`}
            />
          )}

          {/* ANCHORED SECTION CALLOUT BADGES AT NON-OVERLAPPING POSITIONS */}
          {/* Top Cladding Badge */}
          <g transform="translate(620, 60)">
            <rect x="0" y="0" width="130" height="22" rx="6" fill="#1e40af" opacity="0.9" />
            <text x="65" y="15" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">
              Cladding (n₂ = {effectiveN2.toFixed(2)})
            </text>
          </g>

          {/* Core Channel Badge */}
          <g transform="translate(620, 168)">
            <rect x="0" y="0" width="130" height="24" rx="6" fill="#0369a1" opacity="0.95" />
            <text x="65" y="16" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">
              Core (n₁ = {effectiveN1.toFixed(2)})
            </text>
          </g>

          {/* Bottom Cladding Badge */}
          <g transform="translate(620, 265)">
            <rect x="0" y="0" width="130" height="22" rx="6" fill="#1e40af" opacity="0.9" />
            <text x="65" y="15" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">
              Cladding (n₂ = {effectiveN2.toFixed(2)})
            </text>
          </g>
        </svg>
      </div>

      {/* PARAMETER SLIDERS & REAL-TIME CONTROLS PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Slider 1: Launch Angle */}
        <div className="p-3.5 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-foreground flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-500" /> Angle of Incidence (θᵢ)
            </span>
            <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
              {launchAngle}°
            </span>
          </div>
          <input
            type="range"
            min="40"
            max="88"
            step="1"
            value={launchAngle}
            onChange={(e) => setLaunchAngle(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>40° (Steep)</span>
            <span>Critical: {criticalAngleDeg.toFixed(1)}°</span>
            <span>88° (Shallow)</span>
          </div>
        </div>

        {/* Slider 2: Core Refractive Index n1 */}
        <div className="p-3.5 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-foreground flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-500" /> Core Index (n₁)
            </span>
            <span className="font-mono text-sky-500 font-bold">{n1.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="1.40"
            max="1.65"
            step="0.01"
            value={n1}
            onChange={(e) => setN1(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>1.40 (Fused Silica)</span>
            <span>1.65 (Dense Flint)</span>
          </div>
        </div>

        {/* Slider 3: Cladding Refractive Index n2 */}
        <div className="p-3.5 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-500" /> Cladding Index (n₂)
            </span>
            <span className="font-mono text-blue-500 font-bold">{n2.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="1.30"
            max="1.47"
            step="0.01"
            value={n2}
            onChange={(e) => setN2(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>1.30 (Low-Index Polymer)</span>
            <span>1.47 (Standard Glass)</span>
          </div>
        </div>
      </div>

      {/* PEDAGOGICAL EXPLANATION & PHYSICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Zap className="w-4 h-4 text-amber-500" /> Total Internal Reflection (TIR)
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            When light travels from a higher refractive index core (<span className="font-semibold text-foreground">n₁ = {effectiveN1.toFixed(2)}</span>) toward a lower refractive index cladding (<span className="font-semibold text-foreground">n₂ = {effectiveN2.toFixed(2)}</span>) at an angle of incidence <span className="font-semibold text-amber-500">θᵢ ≥ θ꜀</span>, 100% of the light energy is reflected back into the core without escaping.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Activity className="w-4 h-4 text-sky-500" /> Critical Angle Formula
          </h5>
          <div className="text-xs font-mono bg-background p-2 rounded-lg border text-center font-bold text-sky-600 dark:text-sky-400">
            θ꜀ = arcsin(n₂ / n₁) = arcsin({(effectiveN2 / effectiveN1).toFixed(4)}) = {criticalAngleDeg.toFixed(1)}°
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            If the launch angle drops below <span className="font-bold text-rose-500">{criticalAngleDeg.toFixed(1)}°</span>, Snell's law forces a portion of the light to refract out into the cladding (<span className="font-bold text-rose-500">θₜ = {thetaTDeg.toFixed(1)}°</span>), causing severe signal attenuation.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Acceptance Cone & NA
          </h5>
          <div className="text-xs font-mono bg-background p-2 rounded-lg border text-center font-bold text-emerald-600 dark:text-emerald-400">
            NA = √(n₁² - n₂²) = {numericalAperture.toFixed(3)} (θₐ = {acceptanceAngleDeg.toFixed(1)}°)
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Numerical Aperture (NA) measures the light-gathering ability of the fiber. Light rays launched into the core at angles within the acceptance cone (<span className="font-semibold text-foreground">±{acceptanceAngleDeg.toFixed(1)}°</span>) will undergo continuous TIR down the fiber length.
          </p>
        </div>
      </div>
    </div>
  );
}
