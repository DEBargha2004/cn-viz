import { type VizMeta } from "../types";
import {
  Layers,
  HelpCircle,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react";

export const vizMeta: VizMeta = {
  key: "network-five-components",
  title: "Five Components of Data Communication",
  category: "network",
  renderer: "svg",
  params: [
    { key: "showLabels", type: "boolean", label: "Show labels", default: true },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function FiveComponents({ values }: Props) {
  const showLabels = values.showLabels !== false;

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none">
      {/* SVG CANVAS CONTAINER */}
      <div className="w-full border rounded-2xl bg-slate-50/50 dark:bg-slate-950/80 relative overflow-hidden shadow-inner border-slate-200/80 dark:border-slate-800 min-h-[200px] sm:min-h-[340px] md:min-h-[380px] flex items-center justify-center p-2 sm:p-4 transition-colors duration-300">
        {/* Ambient Subtle Grid */}
        <div
          className="absolute inset-0 opacity-15 dark:opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <svg
          viewBox="0 0 760 300"
          className="w-full h-auto text-foreground relative z-10 select-none font-sans"
        >
          <defs>
            {/* Single Arrowhead marker pointing right - compact & precise */}
            <marker
              id="five-comp-arrow-single"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5.5"
              markerHeight="5.5"
              orient="auto"
            >
              <path
                d="M 0 1.5 L 10 5 L 0 8.5 z"
                fill="currentColor"
                className="text-blue-600 dark:text-blue-400"
              />
            </marker>
          </defs>

          {/* VERTICAL PROTOCOL CONNECTORS */}
          <line
            x1="140"
            y1="105"
            x2="140"
            y2="145"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="text-indigo-400/80 dark:text-indigo-500/80"
          />
          <line
            x1="620"
            y1="105"
            x2="620"
            y2="145"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="text-indigo-400/80 dark:text-indigo-500/80"
          />

          {/* SENDER PROTOCOL */}
          <g transform="translate(65, 20)" className="group cursor-pointer">
            <rect
              width="150"
              height="85"
              rx="10"
              className="fill-white dark:fill-slate-900 stroke-indigo-200 dark:stroke-indigo-800 stroke-[1.5px] shadow-xs transition-all duration-200 group-hover:stroke-indigo-500 dark:group-hover:stroke-indigo-400 group-hover:stroke-[3px] group-hover:shadow-md"
            />
            {showLabels ? (
              <>
                <text
                  x="75"
                  y="20"
                  textAnchor="middle"
                  className="fill-indigo-600 dark:fill-indigo-400 text-[11px] font-bold tracking-wider uppercase"
                >
                  5. PROTOCOL
                </text>
                {/* Syntax Pill */}
                <rect
                  x="12"
                  y="28"
                  width="126"
                  height="20"
                  rx="4"
                  className="fill-slate-100 dark:fill-slate-800/60 transition-colors duration-200 group-hover:fill-indigo-50 dark:group-hover:fill-indigo-950/60"
                />
                <text
                  x="75"
                  y="42"
                  textAnchor="middle"
                  className="fill-slate-600 dark:fill-slate-300 text-[10px] font-medium"
                >
                  Syntax (Format)
                </text>
                {/* Semantics Pill */}
                <rect
                  x="12"
                  y="53"
                  width="126"
                  height="20"
                  rx="4"
                  className="fill-slate-100 dark:fill-slate-800/60 transition-colors duration-200 group-hover:fill-indigo-50 dark:group-hover:fill-indigo-950/60"
                />
                <text
                  x="75"
                  y="67"
                  textAnchor="middle"
                  className="fill-slate-600 dark:fill-slate-300 text-[10px] font-medium"
                >
                  Semantics (Meaning)
                </text>
              </>
            ) : (
              <>
                <text
                  x="75"
                  y="20"
                  textAnchor="middle"
                  className="fill-slate-400 dark:fill-slate-500 text-[11px] font-bold"
                >
                  Component #5: ?
                </text>
                <rect
                  x="12"
                  y="32"
                  width="126"
                  height="38"
                  rx="4"
                  className="fill-slate-50 dark:fill-slate-800/40 stroke-slate-200 dark:stroke-slate-800 stroke-1"
                />
                <text
                  x="75"
                  y="55"
                  textAnchor="middle"
                  className="fill-slate-400 dark:fill-slate-500 text-xs font-semibold"
                >
                  ?
                </text>
              </>
            )}
          </g>

          {/* RECEIVER PROTOCOL */}
          <g transform="translate(545, 20)" className="group cursor-pointer">
            <rect
              width="150"
              height="85"
              rx="10"
              className="fill-white dark:fill-slate-900 stroke-indigo-200 dark:stroke-indigo-800 stroke-[1.5px] shadow-xs transition-all duration-200 group-hover:stroke-indigo-500 dark:group-hover:stroke-indigo-400 group-hover:stroke-[3px] group-hover:shadow-md"
            />
            {showLabels ? (
              <>
                <text
                  x="75"
                  y="20"
                  textAnchor="middle"
                  className="fill-indigo-600 dark:fill-indigo-400 text-[11px] font-bold tracking-wider uppercase"
                >
                  5. PROTOCOL
                </text>
                {/* Syntax Pill */}
                <rect
                  x="12"
                  y="28"
                  width="126"
                  height="20"
                  rx="4"
                  className="fill-slate-100 dark:fill-slate-800/60 transition-colors duration-200 group-hover:fill-indigo-50 dark:group-hover:fill-indigo-950/60"
                />
                <text
                  x="75"
                  y="42"
                  textAnchor="middle"
                  className="fill-slate-600 dark:fill-slate-300 text-[10px] font-medium"
                >
                  Syntax (Format)
                </text>
                {/* Semantics Pill */}
                <rect
                  x="12"
                  y="53"
                  width="126"
                  height="20"
                  rx="4"
                  className="fill-slate-100 dark:fill-slate-800/60 transition-colors duration-200 group-hover:fill-indigo-50 dark:group-hover:fill-indigo-950/60"
                />
                <text
                  x="75"
                  y="67"
                  textAnchor="middle"
                  className="fill-slate-600 dark:fill-slate-300 text-[10px] font-medium"
                >
                  Semantics (Meaning)
                </text>
              </>
            ) : (
              <>
                <text
                  x="75"
                  y="20"
                  textAnchor="middle"
                  className="fill-slate-400 dark:fill-slate-500 text-[11px] font-bold"
                >
                  Component #5: ?
                </text>
                <rect
                  x="12"
                  y="32"
                  width="126"
                  height="38"
                  rx="4"
                  className="fill-slate-50 dark:fill-slate-800/40 stroke-slate-200 dark:stroke-slate-800 stroke-1"
                />
                <text
                  x="75"
                  y="55"
                  textAnchor="middle"
                  className="fill-slate-400 dark:fill-slate-500 text-xs font-semibold"
                >
                  ?
                </text>
              </>
            )}
          </g>

          {/* SINGLE DIRECTIONAL FLOW ARROW (LOWERED TO Y=133 WITH REFINED SCALE & EXACT POINTER TIP) */}
          <line
            x1="275"
            y1="143"
            x2="485"
            y2="143"
            stroke="currentColor"
            strokeWidth="2"
            markerEnd="url(#five-comp-arrow-single)"
            className="text-blue-600 dark:text-blue-400"
          />

          {/* MESSAGE (DATA) PILL (LOWERED TO Y=115, CENTER Y=133) */}
          <g transform="translate(310, 125)" className="group cursor-pointer">
            <rect
              width="140"
              height="36"
              rx="8"
              className="fill-indigo-600 dark:fill-indigo-700 stroke-indigo-400 dark:stroke-indigo-500 stroke-[1.5px] shadow-sm transition-all duration-200 group-hover:stroke-indigo-200 dark:group-hover:stroke-indigo-300 group-hover:stroke-[3px] group-hover:shadow-md"
            />
            {showLabels ? (
              <text
                x="70"
                y="22"
                textAnchor="middle"
                className="fill-white font-extrabold text-xs tracking-wide"
              >
                3. MESSAGE (Data)
              </text>
            ) : (
              <text
                x="70"
                y="22"
                textAnchor="middle"
                className="fill-white font-bold text-xs"
              >
                Component #3: ?
              </text>
            )}
          </g>

          {/* DIRECT TRANSMISSION MEDIUM CABLE CONNECTING SENDER TO RECEIVER */}
          <line
            x1="215"
            y1="187.5"
            x2="545"
            y2="187.5"
            stroke="currentColor"
            strokeWidth="5"
            className="text-amber-400 dark:text-amber-500"
          />

          {/* SENDER NODE */}
          <g transform="translate(65, 145)" className="group cursor-pointer">
            <rect
              width="150"
              height="85"
              rx="12"
              className="fill-blue-50/70 dark:fill-blue-950/50 stroke-blue-400 dark:stroke-blue-600 stroke-[1.5px] shadow-xs transition-all duration-200 group-hover:stroke-blue-600 dark:group-hover:stroke-blue-300 group-hover:stroke-[3px] group-hover:shadow-md"
            />
            <rect
              x="12"
              y="10"
              width="126"
              height="65"
              rx="8"
              className="fill-white/80 dark:fill-slate-900/80 stroke-blue-200 dark:stroke-blue-900 stroke-1 transition-colors duration-200 group-hover:stroke-blue-400 dark:group-hover:stroke-blue-500"
            />
            {showLabels ? (
              <>
                <text
                  x="75"
                  y="40"
                  textAnchor="middle"
                  className="fill-blue-900 dark:fill-blue-100 font-extrabold text-xs tracking-wider"
                >
                  1. SENDER
                </text>
                <text
                  x="75"
                  y="56"
                  textAnchor="middle"
                  className="fill-blue-600 dark:fill-blue-400 font-medium text-[10px]"
                >
                  (Source Node)
                </text>
              </>
            ) : (
              <text
                x="75"
                y="48"
                textAnchor="middle"
                className="fill-slate-400 dark:fill-slate-500 font-bold text-xs"
              >
                Component #1: ?
              </text>
            )}
          </g>

          {/* RECEIVER NODE */}
          <g transform="translate(545, 145)" className="group cursor-pointer">
            <rect
              width="150"
              height="85"
              rx="12"
              className="fill-blue-50/70 dark:fill-blue-950/50 stroke-blue-400 dark:stroke-blue-600 stroke-[1.5px] shadow-xs transition-all duration-200 group-hover:stroke-blue-600 dark:group-hover:stroke-blue-300 group-hover:stroke-[3px] group-hover:shadow-md"
            />
            <rect
              x="12"
              y="10"
              width="126"
              height="65"
              rx="8"
              className="fill-white/80 dark:fill-slate-900/80 stroke-blue-200 dark:stroke-blue-900 stroke-1 transition-colors duration-200 group-hover:stroke-blue-400 dark:group-hover:stroke-blue-500"
            />
            {showLabels ? (
              <>
                <text
                  x="75"
                  y="40"
                  textAnchor="middle"
                  className="fill-blue-900 dark:fill-blue-100 font-extrabold text-xs tracking-wider"
                >
                  2. RECEIVER
                </text>
                <text
                  x="75"
                  y="56"
                  textAnchor="middle"
                  className="fill-blue-600 dark:fill-blue-400 font-medium text-[10px]"
                >
                  (Destination Node)
                </text>
              </>
            ) : (
              <text
                x="75"
                y="48"
                textAnchor="middle"
                className="fill-slate-400 dark:fill-slate-500 font-bold text-xs"
              >
                Component #2: ?
              </text>
            )}
          </g>

          {/* TRANSMISSION MEDIUM LABEL PILL (BELOW MEDIUM LINE) */}
          {showLabels ? (
            <g transform="translate(380, 240)" className="group cursor-pointer">
              <rect
                x="-165"
                y="-14"
                width="330"
                height="28"
                rx="8"
                className="fill-amber-50/95 dark:fill-amber-950/80 stroke-amber-300 dark:stroke-amber-800 stroke-1 shadow-2xs transition-all duration-200 group-hover:stroke-amber-500 dark:group-hover:stroke-amber-400 group-hover:stroke-[2.5px] group-hover:shadow-md"
              />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                className="fill-amber-800 dark:fill-amber-300 text-[10.5px] font-extrabold uppercase tracking-wide"
              >
                4. Transmission Medium (Copper, Fiber, Wireless)
              </text>
            </g>
          ) : (
            <g transform="translate(380, 240)" className="group cursor-pointer">
              <rect
                x="-85"
                y="-14"
                width="170"
                height="28"
                rx="8"
                className="fill-slate-100 dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 stroke-1 transition-all duration-200 group-hover:stroke-amber-500 dark:group-hover:stroke-amber-400 group-hover:stroke-[2.5px] group-hover:shadow-md"
              />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                className="fill-slate-500 dark:fill-slate-400 text-[11px] font-semibold"
              >
                Component #4: ?
              </text>
            </g>
          )}
        </svg>

        {/* HUD OVERLAY AT TOP LEFT */}
        <div className="absolute top-3 left-3 bg-background/90 dark:bg-slate-900/90 backdrop-blur-md border rounded-xl px-3 py-1.5 flex items-center gap-3 text-xs shadow-xs z-20 transition-colors">
          <div className="flex items-center gap-1.5 font-semibold">
            {showLabels ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <HelpCircle className="w-4 h-4 text-amber-500 animate-pulse" />
            )}
            <span>
              Mode: {showLabels ? "Labels Visible" : "Self-Test / Quiz Mode"}
            </span>
          </div>
        </div>
      </div>

      {/* DETAILS GRID BELOW SVG */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Zap className="w-4 h-4 text-indigo-500" /> Endpoints (Sender &
            Receiver)
          </h5>
          <p className="text-xs text-muted-foreground">
            <strong>Sender:</strong> Device that originates the data message
            (computer, workstation, phone, camera).
            <br />
            <strong>Receiver:</strong> Target device that accepts the
            transmitted message.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Layers className="w-4 h-4 text-indigo-500" /> Content & Carrier
            (Message & Medium)
          </h5>
          <p className="text-xs text-muted-foreground">
            <strong>Message:</strong> Information/data (text, numbers, images,
            audio, video).
            <br />
            <strong>Medium:</strong> Physical path (twisted-pair wire, coaxial
            cable, fiber optic, radio waves).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" /> Protocol Rules
            (Governing Agreement)
          </h5>
          <p className="text-xs text-muted-foreground">
            Set of rules governing communication consisting of:{" "}
            <strong>Syntax</strong> (structure/format),{" "}
            <strong>Semantics</strong> (meaning of bits), and{" "}
            <strong>Timing</strong> (speed & synchronization).
          </p>
        </div>
      </div>
    </div>
  );
}
