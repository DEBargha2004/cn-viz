import { useEffect, useRef } from "react";
import { type VizMeta } from "../types";
import { useAppStore } from "../../state/appStore";
import { ArrowRightLeft, Radio, Zap, ShieldCheck, Layers } from "lucide-react";

export const vizMeta: VizMeta = {
  key: "network-data-flow-modes",
  title: "Data Flow Modes (Simplex / Half / Full Duplex)",
  category: "network",
  renderer: "svg",
  animated: true,
  params: [
    {
      key: "mode",
      type: "select",
      label: "Mode",
      default: "simplex",
      options: [
        { label: "Simplex (One-Way)", value: "simplex" },
        { label: "Half-Duplex (Alternating)", value: "half-duplex" },
        { label: "Full-Duplex (Simultaneous)", value: "full-duplex" },
      ],
    },
    {
      key: "speed",
      type: "number",
      label: "Animation speed",
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
  isPlaying?: boolean;
}

export default function DataFlowModes({ values, isPlaying }: Props) {
  const mode =
    (values.mode as "simplex" | "half-duplex" | "full-duplex") || "simplex";
  const speed = Number(values.speed ?? 1);
  const globalSpeedMultiplier = useAppStore(
    (state) => state.globalSpeedMultiplier,
  );

  const packet1Ref = useRef<SVGGElement>(null);
  const packet2Ref = useRef<SVGGElement>(null);
  const stationARef = useRef<SVGRectElement>(null);
  const stationBRef = useRef<SVGRectElement>(null);

  const speedRef = useRef(speed);
  const globalSpeedMultiplierRef = useRef(globalSpeedMultiplier);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    globalSpeedMultiplierRef.current = globalSpeedMultiplier;
  }, [globalSpeedMultiplier]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const animFrameId = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const progressRef = useRef<{
    p1: number;
    p2: number;
    direction: 1 | -1;
  }>({ p1: 0, p2: 0, direction: 1 });

  useEffect(() => {
    progressRef.current = {
      p1: 0,
      p2: mode === "full-duplex" ? 0.5 : 0,
      direction: 1,
    };
    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const currentSpeed = isNaN(speedRef.current) ? 1 : speedRef.current;
      const currentGlobalSpeed = isNaN(globalSpeedMultiplierRef.current)
        ? 1
        : globalSpeedMultiplierRef.current;
      const effectiveSpeed = currentSpeed * currentGlobalSpeed;

      const baseRate = 0.35;
      const deltaProgress = isPlayingRef.current
        ? dt * baseRate * (isNaN(effectiveSpeed) ? 0 : effectiveSpeed)
        : 0;

      const prog = progressRef.current;

      if (mode === "simplex") {
        prog.p1 = (prog.p1 + deltaProgress) % 1;
        prog.p2 = 0;
      } else if (mode === "half-duplex") {
        if (prog.direction === 1) {
          prog.p1 += deltaProgress;
          if (prog.p1 >= 1) {
            prog.p1 = 1;
            prog.direction = -1;
            prog.p2 = 0;
          }
        } else {
          prog.p2 += deltaProgress;
          if (prog.p2 >= 1) {
            prog.p2 = 1;
            prog.direction = 1;
            prog.p1 = 0;
          }
        }
      } else if (mode === "full-duplex") {
        prog.p1 = (prog.p1 + deltaProgress) % 1;
        prog.p2 = (prog.p2 + deltaProgress) % 1;
      }

      const startX = 200;
      const endX = 560;
      const rangeX = endX - startX;

      const y1 = mode === "full-duplex" ? 160 : 190;
      const y2 = mode === "full-duplex" ? 220 : 190;

      if (packet1Ref.current) {
        const x = startX + prog.p1 * rangeX;
        const isVisible = mode !== "half-duplex" || prog.direction === 1;
        const safeX = isNaN(x) ? startX : x;
        packet1Ref.current.setAttribute(
          "transform",
          `translate(${safeX}, ${y1})`,
        );
        packet1Ref.current.setAttribute("opacity", isVisible ? "1" : "0");
      }

      if (packet2Ref.current) {
        const x = endX - prog.p2 * rangeX;
        const isVisible =
          mode === "full-duplex" ||
          (mode === "half-duplex" && prog.direction === -1);
        const safeX = isNaN(x) ? endX : x;
        packet2Ref.current.setAttribute(
          "transform",
          `translate(${safeX}, ${y2})`,
        );
        packet2Ref.current.setAttribute("opacity", isVisible ? "1" : "0");
      }

      if (stationARef.current) {
        const isHighlight =
          (mode === "simplex" && prog.p1 < 0.15) ||
          (mode === "half-duplex" &&
            ((prog.direction === 1 && prog.p1 < 0.15) ||
              (prog.direction === -1 && prog.p2 > 0.85))) ||
          (mode === "full-duplex" && (prog.p1 < 0.15 || prog.p2 > 0.85));

        stationARef.current.setAttribute(
          "class",
          isHighlight
            ? "fill-blue-100 dark:fill-blue-950/80 stroke-blue-500 dark:stroke-blue-400 stroke-[3px] transition-all duration-200"
            : "fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 stroke-[2px] transition-all duration-200",
        );
      }

      if (stationBRef.current) {
        const isHighlight =
          (mode === "simplex" && prog.p1 > 0.85) ||
          (mode === "half-duplex" &&
            ((prog.direction === 1 && prog.p1 > 0.85) ||
              (prog.direction === -1 && prog.p2 < 0.15))) ||
          (mode === "full-duplex" && (prog.p1 > 0.85 || prog.p2 < 0.15));

        stationBRef.current.setAttribute(
          "class",
          isHighlight
            ? "fill-blue-100 dark:fill-blue-950/80 stroke-blue-500 dark:stroke-blue-400 stroke-[3px] transition-all duration-200"
            : "fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 stroke-[2px] transition-all duration-200",
        );
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameId.current);
    };
  }, [mode]);

  return (
    <div className="flex flex-col space-y-5 p-4 sm:p-6 bg-card rounded-2xl border shadow-sm">
      {/* LARGE RESPONSIVE SVG CANVAS CONTAINER */}
      <div className="w-full border rounded-2xl bg-slate-100/80 dark:bg-slate-950/90 relative overflow-hidden shadow-inner border-slate-200/80 dark:border-slate-800 min-h-[380px] sm:min-h-[420px] transition-colors duration-300">
        {/* Ambient Grid Background */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-25 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <svg
          viewBox="0 0 760 380"
          className="w-full h-auto text-foreground relative z-10 select-none font-sans"
        >
          <defs>
            <marker
              id="flow-arrow-right"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path
                d="M 0 2 L 8 5 L 0 8 z"
                fill="currentColor"
                className="text-slate-400 dark:text-slate-500"
              />
            </marker>
          </defs>

          {/* SIMPLEX LINK */}
          {mode === "simplex" && (
            <g>
              <line
                x1="200"
                y1="190"
                x2="560"
                y2="190"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-300 dark:text-slate-700"
              />
              <path
                d="M 360 190 L 400 190"
                stroke="currentColor"
                strokeWidth="5"
                markerEnd="url(#flow-arrow-right)"
                className="text-blue-500 dark:text-blue-400"
              />
              <text
                x="380"
                y="155"
                textAnchor="middle"
                className="fill-blue-600 dark:fill-blue-400 text-xs font-bold uppercase tracking-wider"
              >
                Unidirectional Flow (Station A ➔ Station B Only)
              </text>
            </g>
          )}

          {/* HALF-DUPLEX LINK */}
          {mode === "half-duplex" && (
            <g>
              <line
                x1="200"
                y1="190"
                x2="560"
                y2="190"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-300 dark:text-slate-700"
              />
              <path
                d="M 380 190 L 420 190"
                stroke="currentColor"
                strokeWidth="5"
                markerEnd="url(#flow-arrow-right)"
                className="text-indigo-500 dark:text-indigo-400 opacity-70"
              />
              <path
                d="M 380 190 L 340 190"
                stroke="currentColor"
                strokeWidth="5"
                markerEnd="url(#flow-arrow-right)"
                className="text-indigo-500 dark:text-indigo-400 opacity-70"
              />
              <text
                x="380"
                y="155"
                textAnchor="middle"
                className="fill-indigo-600 dark:fill-indigo-400 text-xs font-bold uppercase tracking-wider"
              >
                Bidirectional Flow (One Direction at a Time)
              </text>
            </g>
          )}

          {/* FULL-DUPLEX LINKS */}
          {mode === "full-duplex" && (
            <g>
              {/* Top link A -> B */}
              <line
                x1="200"
                y1="160"
                x2="560"
                y2="160"
                stroke="currentColor"
                strokeWidth="5"
                className="text-blue-400/80 dark:text-blue-500/80"
              />
              <path
                d="M 360 160 L 400 160"
                stroke="currentColor"
                strokeWidth="4"
                markerEnd="url(#flow-arrow-right)"
                className="text-blue-500 dark:text-blue-400"
              />

              {/* Bottom link B -> A */}
              <line
                x1="200"
                y1="220"
                x2="560"
                y2="220"
                stroke="currentColor"
                strokeWidth="5"
                className="text-violet-400/80 dark:text-violet-500/80"
              />
              <path
                d="M 400 220 L 360 220"
                stroke="currentColor"
                strokeWidth="4"
                markerEnd="url(#flow-arrow-right)"
                className="text-violet-500 dark:text-violet-400"
              />

              <text
                x="380"
                y="130"
                textAnchor="middle"
                className="fill-cyan-600 dark:fill-cyan-400 text-xs font-bold uppercase tracking-wider"
              >
                Simultaneous Two-Way Channels
              </text>
            </g>
          )}

          {/* Station A (Left) */}
          <g>
            <rect
              ref={stationARef}
              x="70"
              y="145"
              width="130"
              height="90"
              rx="10"
              className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 stroke-[2px] transition-all duration-200"
            />
            <text
              x="135"
              y="198"
              textAnchor="middle"
              className="fill-slate-800 dark:fill-slate-200 font-bold text-sm"
            >
              Station A
            </text>
          </g>

          {/* Station B (Right) */}
          <g>
            <rect
              ref={stationBRef}
              x="560"
              y="145"
              width="130"
              height="90"
              rx="10"
              className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 stroke-[2px] transition-all duration-200"
            />
            <text
              x="625"
              y="198"
              textAnchor="middle"
              className="fill-slate-800 dark:fill-slate-200 font-bold text-sm"
            >
              Station B
            </text>
          </g>

          {/* Packets */}
          <g ref={packet1Ref} opacity="0">
            <rect
              x="-22"
              y="-13"
              width="44"
              height="26"
              rx="6"
              className="fill-blue-500 dark:fill-blue-400 stroke-blue-600 dark:stroke-blue-300 stroke-[1px] shadow-sm"
            />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              className="fill-white dark:fill-slate-950 text-[10px] font-extrabold"
            >
              Data A
            </text>
          </g>

          <g ref={packet2Ref} opacity="0">
            <rect
              x="-22"
              y="-13"
              width="44"
              height="26"
              rx="6"
              className="fill-violet-500 dark:fill-violet-400 stroke-violet-600 dark:stroke-violet-300 stroke-[1px] shadow-sm"
            />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              className="fill-white dark:fill-slate-950 text-[10px] font-extrabold"
            >
              Data B
            </text>
          </g>
        </svg>

        {/* HUD OVERLAY AT TOP LEFT */}
        <div className="absolute top-3 left-3 bg-background/90 dark:bg-slate-900/90 backdrop-blur-md border rounded-xl px-3 py-1.5 flex items-center gap-3 text-xs shadow-md z-20 transition-colors">
          <div className="flex items-center gap-1.5 font-semibold">
            {mode === "simplex" ? (
              <Radio className="w-4 h-4 text-blue-500" />
            ) : (
              <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
            )}
            <span>Mode: {mode.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* DETAILS GRID BELOW SVG */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Zap className="w-4 h-4 text-indigo-500" /> Directionality
          </h5>
          <p className="text-xs text-muted-foreground">
            {mode === "simplex"
              ? "Strictly one-way. One device is dedicated to sending and the other can only receive."
              : mode === "half-duplex"
              ? "Two-way communication, but devices must alternate sending and receiving one at a time."
              : "Full two-way simultaneous transmission. Signals travel in both directions at the same instant."}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" /> Channel Efficiency
          </h5>
          <p className="text-xs text-muted-foreground">
            {mode === "simplex"
              ? "Entire bandwidth is always dedicated in one direction, maxing out unidirectional throughput."
              : mode === "half-duplex"
              ? "Shared bandwidth; requires turn-taking protocols to avoid collisions on the medium."
              : "Maximum efficiency; dual links or frequency division allow 100% capacity in both directions."}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Layers className="w-4 h-4 text-indigo-500" /> Real-World Analogy
          </h5>
          <p className="text-xs text-muted-foreground">
            {mode === "simplex"
              ? "Keyboards, monitors, or radio broadcasting station sending audio to home receivers."
              : mode === "half-duplex"
              ? "Walkie-talkies (Push-to-Talk) or legacy hubs where only one party speaks at a time."
              : "Modern telephone calls or full-duplex Ethernet connections allowing simultaneous talking."}
          </p>
        </div>
      </div>
    </div>
  );
}
