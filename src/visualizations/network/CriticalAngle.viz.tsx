import { useEffect, useRef, useId, useState } from "react";
import { type VizMeta } from "../types";
import { useAppStore } from "../../state/appStore";
import {
  Zap,
  ShieldCheck,
  Sparkles,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  RotateCw,
  Layers,
  MoveHorizontal,
} from "lucide-react";

export const vizMeta: VizMeta = {
  key: "network-critical-angle",
  title: "Critical Angle: Refraction vs Reflection",
  category: "network",
  renderer: "svg",
  animated: true,
  params: [
    {
      key: "angleCase",
      type: "select",
      label: "Angle case",
      default: "all",
      options: [
        { label: "Show all three", value: "all" },
        { label: "Less than critical (refraction)", value: "less" },
        {
          label: "Equal to critical (refraction along boundary)",
          value: "equal",
        },
        { label: "Greater than critical (reflection)", value: "greater" },
      ],
    },
    {
      key: "incidentAngle",
      type: "number",
      label: "Incident Angle θᵢ (°)",
      default: 42.5,
      min: 15,
      max: 85,
      step: 0.5,
    },
    {
      key: "n1",
      type: "number",
      label: "Core Medium Index (n₁)",
      default: 1.48,
      min: 1.3,
      max: 1.7,
      step: 0.01,
    },
    {
      key: "n2",
      type: "number",
      label: "Cladding Medium Index (n₂)",
      default: 1.0,
      min: 1.0,
      max: 1.45,
      step: 0.01,
    },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
  isPlaying?: boolean;
}

export default function CriticalAngle({
  values,
  onChange,
  isPlaying: isPlayingProp,
}: Props) {
  // Directly extract parameter values from state to ensure full reactivity with ControlPanel
  const angleCase = (values.angleCase as string) || "all";
  const incidentAngle = Number(values.incidentAngle ?? 42.5);
  const n1 = Number(values.n1 ?? 1.48);
  const n2 = Number(values.n2 ?? 1.0);

  // Helper to trigger param updates to parent state
  const updateParam = (key: string, val: unknown) => {
    if (onChange) {
      onChange({
        ...values,
        [key]: val,
      });
    }
  };

  const updateMultipleParams = (newParams: Record<string, unknown>) => {
    if (onChange) {
      onChange({
        ...values,
        ...newParams,
      });
    }
  };

  const activePlaying = isPlayingProp ?? true;
  const globalSpeed = useAppStore((state) => state.globalSpeedMultiplier) || 1;

  // Animation pulse progress hook
  const pulseProgress = usePulseAnimation(activePlaying, globalSpeed);

  // SVG Unique IDs for glow filters and gradients
  const rawId = useId();
  const glowLaserId = `laser-glow-ca-${rawId.replace(/:/g, "")}`;
  const laserGradId = `laser-grad-ca-${rawId.replace(/:/g, "")}`;

  // Physical Optics Calculations (Snell's Law & Critical Angle)
  const effectiveN1 = Math.max(n1, n2 + 0.01);
  const effectiveN2 = Math.min(n2, n1 - 0.01);

  // Critical Angle theta_c = arcsin(n2 / n1) in degrees
  const ratio = Math.min(1.0, effectiveN2 / effectiveN1);
  const criticalAngleRad = Math.asin(ratio);
  const criticalAngleDeg = (criticalAngleRad * 180) / Math.PI;

  // Determine effective incident angle based on selected angleCase preset or custom slider value
  let effectiveIncidentAngle = incidentAngle;
  if (angleCase === "less") {
    effectiveIncidentAngle = Math.max(15, Number((criticalAngleDeg - 15).toFixed(1)));
  } else if (angleCase === "equal") {
    effectiveIncidentAngle = Number(criticalAngleDeg.toFixed(1));
  } else if (angleCase === "greater") {
    effectiveIncidentAngle = Math.min(85, Number((criticalAngleDeg + 18).toFixed(1)));
  }

  // Optical State Classification using effectiveIncidentAngle
  const isRefraction = effectiveIncidentAngle < criticalAngleDeg - 0.2;
  const isCritical = Math.abs(effectiveIncidentAngle - criticalAngleDeg) <= 0.2;
  const isTIR = effectiveIncidentAngle > criticalAngleDeg + 0.2;

  // Refracted angle in medium 2 via Snell's Law: n1 * sin(theta1) = n2 * sin(theta2)
  const sinTheta2 =
    (effectiveN1 / effectiveN2) *
    Math.sin((effectiveIncidentAngle * Math.PI) / 180);
  const refractedAngleDeg =
    sinTheta2 <= 1.0 ? (Math.asin(sinTheta2) * 180) / Math.PI : 90;

  // Preset Button Handlers
  const handlePresetAll = () => {
    updateParam("angleCase", "all");
  };

  const handlePresetLess = () => {
    const targetAngle = Math.max(15, Math.round(criticalAngleDeg - 15));
    updateMultipleParams({
      angleCase: "less",
      incidentAngle: targetAngle,
    });
  };

  const handlePresetEqual = () => {
    const targetAngle = Number(criticalAngleDeg.toFixed(1));
    updateMultipleParams({
      angleCase: "equal",
      incidentAngle: targetAngle,
    });
  };

  const handlePresetGreater = () => {
    const targetAngle = Math.min(85, Math.round(criticalAngleDeg + 18));
    updateMultipleParams({
      angleCase: "greater",
      incidentAngle: targetAngle,
    });
  };

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none">
      {/* SECONDARY TOOLBAR: PRESETS & OPTICAL STATUS HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-muted/30 border border-border">
        {/* Left: Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Presets:
          </span>
          <button
            onClick={handlePresetAll}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              angleCase === "all"
                ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-xs"
                : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
            }`}
          >
            Show All 3 Cases
          </button>
          <button
            onClick={handlePresetLess}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              angleCase === "less" || (angleCase !== "all" && isRefraction)
                ? "bg-sky-500 text-white border-sky-400 font-bold shadow-xs"
                : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
            }`}
          >
            1. Refraction (θᵢ &lt; θ꜀)
          </button>
          <button
            onClick={handlePresetEqual}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              angleCase === "equal" || (angleCase !== "all" && isCritical)
                ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-xs"
                : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
            }`}
          >
            2. Critical Angle (θᵢ = θ꜀)
          </button>
          <button
            onClick={handlePresetGreater}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              angleCase === "greater" || (angleCase !== "all" && isTIR)
                ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-xs"
                : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
            }`}
          >
            3. Total Reflection (θᵢ &gt; θ꜀)
          </button>
        </div>

        {/* Right: Live Status Badge & Numeric Optics HUD */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              isTIR
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : isCritical
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30"
            }`}
          >
            {isTIR ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Total Internal Reflection (TIR)</span>
              </>
            ) : isCritical ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Critical Boundary (90° Refraction)</span>
              </>
            ) : (
              <>
                <ArrowUpRight className="w-3.5 h-3.5 text-sky-500" />
                <span>Refraction into Medium 2</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-background border border-border text-foreground font-semibold">
              θᵢ:{" "}
              <span className="text-amber-500 font-extrabold">
                {effectiveIncidentAngle}°
              </span>
            </span>
            <span className="px-2 py-0.5 rounded bg-background border border-border text-foreground font-semibold">
              θ꜀:{" "}
              <span className="text-sky-500 font-extrabold">
                {criticalAngleDeg.toFixed(1)}°
              </span>
            </span>
            {!isTIR && (
              <span className="px-2 py-0.5 rounded bg-background border border-border text-foreground font-semibold">
                θ₂:{" "}
                <span className="text-emerald-500 font-extrabold">
                  {refractedAngleDeg.toFixed(1)}°
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* MAIN VIEWPORT CANVAS */}
      <div className="w-full border rounded-2xl bg-slate-100/80 dark:bg-slate-950/90 relative overflow-hidden shadow-inner border-border min-h-[420px] flex items-center justify-center p-3 transition-colors duration-300">
        {/* Ambient Radial Grid Overlay */}
        <div
          className="absolute inset-0 opacity-25 dark:opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* CONDITION 1: SIDE-BY-SIDE 3-CASE COMPARISON VIEW */}
        {angleCase === "all" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full h-full p-1 relative z-10">
            {/* PANEL 1: Refraction */}
            <SingleRayPanel
              title="1. Refraction (θᵢ < θ꜀)"
              subtitle={`θᵢ = ${(criticalAngleDeg - 15).toFixed(1)}° < θ꜀`}
              thetaI={Math.max(15, criticalAngleDeg - 15)}
              thetaC={criticalAngleDeg}
              n1={effectiveN1}
              n2={effectiveN2}
              glowId={glowLaserId}
              pulseProgress={pulseProgress}
              isPlaying={activePlaying}
              badgeColor="sky"
              onClick={handlePresetLess}
            />

            {/* PANEL 2: Critical Angle */}
            <SingleRayPanel
              title="2. Critical Angle (θᵢ = θ꜀)"
              subtitle={`θᵢ = θ꜀ = ${criticalAngleDeg.toFixed(1)}°`}
              thetaI={criticalAngleDeg}
              thetaC={criticalAngleDeg}
              n1={effectiveN1}
              n2={effectiveN2}
              glowId={glowLaserId}
              pulseProgress={pulseProgress}
              isPlaying={activePlaying}
              badgeColor="amber"
              onClick={handlePresetEqual}
            />

            {/* PANEL 3: Total Reflection */}
            <SingleRayPanel
              title="3. Reflection (θᵢ > θ꜀)"
              subtitle={`θᵢ = ${(criticalAngleDeg + 18).toFixed(1)}° > θ꜀`}
              thetaI={Math.min(85, criticalAngleDeg + 18)}
              thetaC={criticalAngleDeg}
              n1={effectiveN1}
              n2={effectiveN2}
              glowId={glowLaserId}
              pulseProgress={pulseProgress}
              isPlaying={activePlaying}
              badgeColor="emerald"
              onClick={handlePresetGreater}
            />
          </div>
        ) : (
          /* CONDITION 2: FOCUSED INTERACTIVE SINGLE RAY CANVAS */
          <div className="w-full h-full relative z-10 flex items-center justify-center">
            <InteractiveRayCanvas
              width={800}
              height={440}
              thetaI={effectiveIncidentAngle}
              thetaC={criticalAngleDeg}
              n1={effectiveN1}
              n2={effectiveN2}
              glowId={glowLaserId}
              laserGradId={laserGradId}
              pulseProgress={pulseProgress}
              isPlaying={activePlaying}
              onAngleChange={(newAngle) =>
                updateMultipleParams({
                  incidentAngle: newAngle,
                  angleCase: "custom",
                })
              }
            />
          </div>
        )}
      </div>

      {/* PARAMETER SLIDERS & REAL-TIME CONTROLS PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Slider 1: Incident Angle theta_i */}
        <div className="p-3.5 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-foreground flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-500" /> Angle of Incidence
              (θᵢ)
            </span>
            <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
              {effectiveIncidentAngle}°
            </span>
          </div>
          <input
            type="range"
            min="15"
            max="85"
            step="0.5"
            value={effectiveIncidentAngle}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (angleCase === "all") {
                updateParam("incidentAngle", val);
              } else {
                updateMultipleParams({
                  incidentAngle: val,
                  angleCase: "custom",
                });
              }
            }}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>15° (Steep)</span>
            <span>Critical: {criticalAngleDeg.toFixed(1)}°</span>
            <span>85° (Shallow)</span>
          </div>
        </div>

        {/* Slider 2: Dense Medium Index n1 */}
        <div className="p-3.5 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-foreground flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-500" /> Core Index (n₁)
            </span>
            <span className="font-mono text-sky-500 font-bold">
              {n1.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="1.30"
            max="1.70"
            step="0.01"
            value={n1}
            onChange={(e) => updateParam("n1", Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>1.30 (Water)</span>
            <span>1.48 (Glass)</span>
            <span>1.70 (Flint)</span>
          </div>
        </div>

        {/* Slider 3: Less Dense Medium Index n2 */}
        <div className="p-3.5 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-500" /> Cladding Index
              (n₂)
            </span>
            <span className="font-mono text-blue-500 font-bold">
              {n2.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="1.00"
            max="1.45"
            step="0.01"
            value={n2}
            onChange={(e) => updateParam("n2", Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>1.00 (Air / Vacuum)</span>
            <span>1.45 (Cladding)</span>
          </div>
        </div>
      </div>

      {/* PEDAGOGICAL EXPLANATION & PHYSICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <ArrowUpRight className="w-4 h-4 text-sky-500" /> 1. Refraction (θᵢ
            &lt; θ꜀)
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            When light travels from a denser medium (
            <span className="font-semibold text-foreground">
              n₁ = {effectiveN1.toFixed(2)}
            </span>
            ) toward a less dense medium (
            <span className="font-semibold text-foreground">
              n₂ = {effectiveN2.toFixed(2)}
            </span>
            ) at an angle smaller than the critical angle (
            <span className="font-semibold text-amber-500">
              θᵢ &lt; {criticalAngleDeg.toFixed(1)}°
            </span>
            ), it speeds up and refracts{" "}
            <span className="font-bold text-sky-500">away from the normal</span>{" "}
            into Medium 2.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <RotateCw className="w-4 h-4 text-amber-500" /> 2. Critical Angle
            (θᵢ = θ꜀)
          </h5>
          <div className="text-xs font-mono bg-background p-2 rounded-lg border text-center font-bold text-amber-600 dark:text-amber-400">
            θ꜀ = arcsin(n₂ / n₁) = arcsin(
            {(effectiveN2 / effectiveN1).toFixed(4)}) ={" "}
            {criticalAngleDeg.toFixed(1)}°
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            At exactly the critical angle{" "}
            <span className="font-bold text-amber-500">
              θ꜀ = {criticalAngleDeg.toFixed(1)}°
            </span>
            , the refracted ray bends by{" "}
            <span className="font-bold text-foreground">90°</span> relative to
            the normal line, traveling directly along the boundary surface
            interface.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Zap className="w-4 h-4 text-emerald-500" /> 3. Total Reflection (θᵢ
            &gt; θ꜀)
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            When the angle of incidence exceeds the critical angle (
            <span className="font-semibold text-emerald-500">
              θᵢ &gt; {criticalAngleDeg.toFixed(1)}°
            </span>
            ),{" "}
            <span className="font-bold text-emerald-500">
              100% of light energy is reflected
            </span>{" "}
            back into the denser medium. This total internal reflection keeps
            light trapped inside optical fibers.
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
// HELPER COMPONENT: SINGLE RAY PANEL FOR SIDE-BY-SIDE 3-CASE COMPARISON
// ============================================================================
function SingleRayPanel({
  title,
  subtitle,
  thetaI,
  thetaC,
  n1,
  n2,
  glowId,
  pulseProgress,
  isPlaying,
  badgeColor,
  onClick,
}: {
  title: string;
  subtitle: string;
  thetaI: number;
  thetaC: number;
  n1: number;
  n2: number;
  glowId: string;
  pulseProgress: number;
  isPlaying: boolean;
  badgeColor: "sky" | "amber" | "emerald";
  onClick: () => void;
}) {
  // Geometry parameters (Width: 260, Height: 360)
  const w = 260;
  const h = 360;
  const cx = 130;
  const cy = 180;
  const rayLen = 125;

  const isTIR = thetaI > thetaC + 0.2;
  const isCritical = Math.abs(thetaI - thetaC) <= 0.2;

  // Incident ray geometry (Medium 1 -> Center)
  const thetaIRad = (thetaI * Math.PI) / 180;
  const incDx = -Math.sin(thetaIRad) * rayLen;
  const incDy = Math.cos(thetaIRad) * rayLen;
  const incX = cx + incDx;
  const incY = cy + incDy;

  // Reflected ray geometry (Medium 1)
  const refDx = Math.sin(thetaIRad) * rayLen;
  const refDy = Math.cos(thetaIRad) * rayLen;
  const refX = cx + refDx;
  const refY = cy + refDy;

  // Refracted ray geometry (Medium 2)
  const sinTheta2 = (n1 / n2) * Math.sin(thetaIRad);
  const theta2Rad = sinTheta2 <= 1.0 ? Math.asin(sinTheta2) : Math.PI / 2;
  const refrDx = Math.sin(theta2Rad) * rayLen;
  const refrDy = -Math.cos(theta2Rad) * rayLen;
  const refrX = cx + refrDx;
  const refrY = cy + refrDy;

  // Continuous SVG path strings for laser photon flow
  const refrRayPathD = `M ${incX} ${incY} L ${cx} ${cy} L ${refrX} ${refrY}`;
  const reflRayPathD = `M ${incX} ${incY} L ${cx} ${cy} L ${refX} ${refY}`;

  const badgeClasses = {
    sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
    amber:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    emerald:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  }[badgeColor];

  const rayColor = isTIR ? "#10b981" : isCritical ? "#f59e0b" : "#38bdf8";

  return (
    <div
      onClick={onClick}
      className="flex flex-col h-full rounded-xl border border-border bg-card/90 p-3 hover:border-amber-500/60 cursor-pointer transition-all duration-200 group relative overflow-hidden shadow-sm"
    >
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-2 border-b gap-1 flex-wrap">
        <span className="text-xs font-bold text-foreground group-hover:text-amber-500 transition-colors">
          {title}
        </span>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badgeClasses}`}
        >
          {subtitle}
        </span>
      </div>

      {/* SVG Canvas Area */}
      <div className="flex-1 w-full relative flex items-center justify-center pt-2">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full h-auto text-foreground select-none"
        >
          <defs>
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* TOP MEDIUM N2 (LESS DENSE MEDIUM) */}
          <rect
            x="10"
            y="20"
            width="240"
            height="160"
            fill="#3b82f6"
            opacity="0.08"
            rx="8"
          />
          <text
            x="20"
            y="38"
            fontSize="11"
            fontWeight="bold"
            fill="#3b82f6"
            opacity="0.9"
          >
            Medium 2 (n₂ = {n2.toFixed(2)})
          </text>

          {/* BOTTOM MEDIUM N1 (DENSER MEDIUM) */}
          <rect
            x="10"
            y="180"
            width="240"
            height="160"
            fill="#0284c7"
            opacity="0.16"
            rx="8"
          />
          <text
            x="20"
            y="328"
            fontSize="11"
            fontWeight="bold"
            fill="#0284c7"
            opacity="0.9"
          >
            Medium 1 (n₁ = {n1.toFixed(2)})
          </text>

          {/* INTERFACE BOUNDARY LINE */}
          <line
            x1="10"
            y1={cy}
            x2="250"
            y2={cy}
            stroke="#0284c7"
            strokeWidth="2"
            strokeDasharray="4 3"
            opacity="0.85"
          />

          {/* VERTICAL NORMAL LINE */}
          <line
            x1={cx}
            y1="35"
            x2={cx}
            y2="325"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity="0.65"
          />
          <rect
            x={cx + 2}
            y={cy - 10}
            width="8"
            height="8"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1"
            opacity="0.65"
          />

          {/* INCIDENT LIGHT RAY */}
          <line
            x1={incX}
            y1={incY}
            x2={cx}
            y2={cy}
            stroke="#38bdf8"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter={`url(#${glowId})`}
          />

          {/* REFRACTED LIGHT RAY */}
          {!isTIR && (
            <line
              x1={cx}
              y1={cy}
              x2={refrX}
              y2={refrY}
              stroke={isCritical ? "#f59e0b" : "#38bdf8"}
              strokeWidth={isCritical ? "4" : "3"}
              strokeLinecap="round"
              filter={`url(#${glowId})`}
            />
          )}

          {/* REFLECTED LIGHT RAY */}
          <line
            x1={cx}
            y1={cy}
            x2={refX}
            y2={refY}
            stroke={isTIR ? "#10b981" : "#38bdf8"}
            strokeWidth={isTIR ? "4" : "1.5"}
            strokeOpacity={isTIR ? "1.0" : "0.35"}
            strokeLinecap="round"
            filter={`url(#${glowId})`}
          />

          {/* BOUNDARY CENTER NODE DOT */}
          <circle
            cx={cx}
            cy={cy}
            r="4.5"
            fill={rayColor}
            stroke="#ffffff"
            strokeWidth="1.5"
            filter={`url(#${glowId})`}
          />

          {/* ANIMATED PHOTON PULSE FLOW */}
          {isPlaying && (
            <path
              d={isTIR ? reflRayPathD : refrRayPathD}
              fill="none"
              stroke="#ffffff"
              strokeWidth="5"
              strokeDasharray="14 120"
              strokeDashoffset={-pulseProgress * 240}
              strokeLinecap="round"
              filter={`url(#${glowId})`}
            />
          )}
        </svg>
      </div>

      <div className="pt-1 text-[11px] text-center text-muted-foreground font-semibold group-hover:text-amber-500 transition-colors">
        Click to focus & adjust sliders →
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENT: INTERACTIVE SINGLE RAY CANVAS WITH DIRECT POINTER DRAGGING
// ============================================================================
function InteractiveRayCanvas({
  width,
  height,
  thetaI,
  thetaC,
  n1,
  n2,
  glowId,
  laserGradId,
  pulseProgress,
  isPlaying,
  onAngleChange,
}: {
  width: number;
  height: number;
  thetaI: number;
  thetaC: number;
  n1: number;
  n2: number;
  glowId: string;
  laserGradId: string;
  pulseProgress: number;
  isPlaying: boolean;
  onAngleChange: (angle: number) => void;
}) {
  const cx = width / 2; // 400
  const cy = height / 2; // 220
  const rayLen = 175;
  const [isDragging, setIsDragging] = useState(false);

  const isTIR = thetaI > thetaC + 0.2;
  const isCritical = Math.abs(thetaI - thetaC) <= 0.2;

  // Incident ray geometry
  const thetaIRad = (thetaI * Math.PI) / 180;
  const incDx = -Math.sin(thetaIRad) * rayLen;
  const incDy = Math.cos(thetaIRad) * rayLen;
  const incX = cx + incDx;
  const incY = cy + incDy;

  // Reflected ray geometry
  const refDx = Math.sin(thetaIRad) * rayLen;
  const refDy = Math.cos(thetaIRad) * rayLen;
  const refX = cx + refDx;
  const refY = cy + refDy;

  // Refracted ray geometry
  const sinTheta2 = (n1 / n2) * Math.sin(thetaIRad);
  const theta2Rad = sinTheta2 <= 1.0 ? Math.asin(sinTheta2) : Math.PI / 2;
  const refrDx = Math.sin(theta2Rad) * rayLen;
  const refrDy = -Math.cos(theta2Rad) * rayLen;
  const refrX = cx + refrDx;
  const refrY = cy + refrDy;
  const refractedAngleDeg = (theta2Rad * 180) / Math.PI;

  // Continuous SVG path strings for laser photon flow
  const refrRayPathD = `M ${incX} ${incY} L ${cx} ${cy} L ${refrX} ${refrY}`;
  const reflRayPathD = `M ${incX} ${incY} L ${cx} ${cy} L ${refX} ${refY}`;

  // Interactive Pointer Dragging Handler
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    updateAngleFromPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    updateAngleFromPointer(e);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    setIsDragging(false);
  };

  const updateAngleFromPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const svgX = (mouseX / rect.width) * width;
    const svgY = (mouseY / rect.height) * height;

    const dx = cx - svgX;
    const dy = svgY - cy;

    if (dy > 5) {
      const angleRad = Math.atan2(dx, dy);
      const angleDeg = Math.round(((angleRad * 180) / Math.PI) * 2) / 2;
      const clamped = Math.max(15, Math.min(85, angleDeg));
      onAngleChange(clamped);
    }
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full h-auto text-foreground select-none relative z-10 overflow-visible touch-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <defs>
        {/* Glow Filter */}
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <linearGradient id={laserGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="1.0" />
        </linearGradient>
      </defs>

      {/* TOP MEDIUM N2 (LESS DENSE MEDIUM - CLADDING / AIR) */}
      <rect
        x="30"
        y="20"
        width={width - 60}
        height={cy - 20}
        fill="#3b82f6"
        opacity="0.08"
        rx="10"
      />
      <g transform="translate(50, 45)">
        <rect
          x="0"
          y="0"
          width="220"
          height="26"
          rx="6"
          fill="#1e40af"
          opacity="0.9"
        />
        <text
          x="110"
          y="17"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="#ffffff"
        >
          Less Dense Medium 2 (n₂ = {n2.toFixed(2)})
        </text>
      </g>

      {/* BOTTOM MEDIUM N1 (DENSER MEDIUM - GLASS CORE) */}
      <rect
        x="30"
        y={cy}
        width={width - 60}
        height={cy - 20}
        fill="#0284c7"
        opacity="0.16"
        rx="10"
      />
      <g transform="translate(50, 375)">
        <rect
          x="0"
          y="0"
          width="220"
          height="26"
          rx="6"
          fill="#0369a1"
          opacity="0.95"
        />
        <text
          x="110"
          y="17"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="#ffffff"
        >
          Dense Medium 1 (n₁ = {n1.toFixed(2)})
        </text>
      </g>

      {/* MEDIA INTERFACE BOUNDARY LINE */}
      <line
        x1="30"
        y1={cy}
        x2={width - 30}
        y2={cy}
        stroke="#0284c7"
        strokeWidth="2.5"
        strokeDasharray="6 4"
        opacity="0.9"
      />
      <text
        x={width - 160}
        y={cy - 8}
        fontSize="11"
        fontWeight="bold"
        fill="#0284c7"
      >
        Interface Boundary
      </text>

      {/* PERPENDICULAR NORMAL LINE */}
      <line
        x1={cx}
        y1="35"
        x2={cx}
        y2={height - 35}
        stroke="#f59e0b"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.75"
      />
      <text x={cx + 10} y="50" fontSize="11" fontWeight="bold" fill="#f59e0b">
        Normal (N)
      </text>
      <rect
        x={cx + 2}
        y={cy - 12}
        width="10"
        height="10"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="1.2"
        opacity="0.75"
      />

      {/* INCIDENT ANGLE ARC (IN MEDIUM 1) */}
      <path
        d={`M ${cx} ${cy + 45} A 45 45 0 0 1 ${cx - 45 * Math.sin(thetaIRad)} ${cy + 45 * Math.cos(thetaIRad)}`}
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2"
        strokeDasharray="3 2"
      />
      <text
        x={cx - 32 * Math.sin(thetaIRad / 2) - 16}
        y={cy + 32 * Math.cos(thetaIRad / 2) + 6}
        fontSize="12"
        fontWeight="extrabold"
        fill="#f59e0b"
      >
        θᵢ={thetaI}°
      </text>

      {/* REFRACTED ANGLE ARC (IN MEDIUM 2 IF NOT TIR) */}
      {!isTIR && (
        <g>
          <path
            d={`M ${cx} ${cy - 45} A 45 45 0 0 1 ${cx + 45 * Math.sin(theta2Rad)} ${cy - 45 * Math.cos(theta2Rad)}`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray="3 2"
          />
          <text
            x={cx + 34 * Math.sin(theta2Rad / 2) + 8}
            y={cy - 34 * Math.cos(theta2Rad / 2) - 4}
            fontSize="12"
            fontWeight="extrabold"
            fill="#38bdf8"
          >
            θ₂={refractedAngleDeg.toFixed(1)}°
          </text>
        </g>
      )}



      {/* INCIDENT LIGHT RAY */}
      <line
        x1={incX}
        y1={incY}
        x2={cx}
        y2={cy}
        stroke="#38bdf8"
        strokeWidth="4.5"
        strokeLinecap="round"
        filter={`url(#${glowId})`}
      />

      {/* REFRACTED LIGHT RAY INTO MEDIUM 2 */}
      {!isTIR && (
        <line
          x1={cx}
          y1={cy}
          x2={refrX}
          y2={refrY}
          stroke={isCritical ? "#f59e0b" : "#38bdf8"}
          strokeWidth={isCritical ? "5" : "4"}
          strokeLinecap="round"
          filter={`url(#${glowId})`}
        />
      )}

      {/* REFLECTED LIGHT RAY INTO MEDIUM 1 */}
      <line
        x1={cx}
        y1={cy}
        x2={refX}
        y2={refY}
        stroke={isTIR ? "#10b981" : "#38bdf8"}
        strokeWidth={isTIR ? "5" : "2"}
        strokeOpacity={isTIR ? "1.0" : "0.35"}
        strokeLinecap="round"
        filter={`url(#${glowId})`}
      />

      {/* BOUNDARY INTERSECTION CENTER NODE */}
      <circle
        cx={cx}
        cy={cy}
        r="6"
        fill={isTIR ? "#10b981" : isCritical ? "#f59e0b" : "#38bdf8"}
        stroke="#ffffff"
        strokeWidth="2"
        filter={`url(#${glowId})`}
      />

      {/* INTERACTIVE DRAG HANDLE ON INCIDENT LASER BEAM */}
      <g transform={`translate(${incX}, ${incY})`}>
        <circle
          cx="0"
          cy="0"
          r="16"
          fill="#f59e0b"
          fillOpacity="0.15"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="4 3"
          className="animate-spin-slow"
        />
        <foreignObject x="-24" y="-36" width="48" height="20">
          <div className="flex items-center justify-center gap-0.5 px-1 bg-amber-500 text-slate-950 text-[9px] font-extrabold rounded shadow-xs">
            <MoveHorizontal className="w-2.5 h-2.5" /> DRAG
          </div>
        </foreignObject>
      </g>

      {/* ANIMATED PHOTON FLOW ALONG LASER RAYS */}
      {isPlaying && (
        <path
          d={isTIR ? reflRayPathD : refrRayPathD}
          fill="none"
          stroke="#ffffff"
          strokeWidth="6"
          strokeDasharray="18 140"
          strokeDashoffset={-pulseProgress * 320}
          strokeLinecap="round"
          filter={`url(#${glowId})`}
        />
      )}

      {/* QUICK PRESET BUTTON FLOATING DIRECTLY ON CANVAS */}
      <foreignObject x={width - 230} y="35" width="200" height="40">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAngleChange(Number(thetaC.toFixed(1)));
          }}
          className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 shadow-md border border-amber-400 hover:bg-amber-400 transition-all flex items-center justify-center gap-1.5"
        >
          <Compass className="w-3.5 h-3.5" /> Set θᵢ = θ꜀ ({thetaC.toFixed(1)}°)
        </button>
      </foreignObject>
    </svg>
  );
}
