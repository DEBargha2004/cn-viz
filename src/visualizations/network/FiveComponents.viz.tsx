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
    <div className="flex flex-col space-y-5 p-4 sm:p-6 bg-card rounded-2xl border shadow-sm">
      {/* LARGE RESPONSIVE SVG CANVAS CONTAINER */}
      <div className="w-full border rounded-2xl bg-slate-100/80 dark:bg-slate-950/90 relative overflow-hidden shadow-inner border-slate-200/80 dark:border-slate-800 min-h-[380px] sm:min-h-[420px] transition-colors duration-300">
        {/* Ambient Grid Background */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-25 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <svg
          viewBox="0 0 760 380"
          className="w-full h-auto text-foreground relative z-10 select-none font-sans"
        >
          <defs>
            <marker
              id="five-comp-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path
                d="M 0 1 L 10 5 L 0 9 z"
                fill="currentColor"
                className="text-blue-500 dark:text-blue-400"
              />
            </marker>
          </defs>

          {/* Medium Line connecting Sender and Receiver */}
          <g>
            {/* Sender Drop Line */}
            <line
              x1="140"
              y1="260"
              x2="140"
              y2="295"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="4 4"
              className="text-amber-500/70 dark:text-amber-400/70"
            />
            {/* Receiver Drop Line */}
            <line
              x1="620"
              y1="260"
              x2="620"
              y2="295"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="4 4"
              className="text-amber-500/70 dark:text-amber-400/70"
            />
            {/* Main Medium Bus Line */}
            <line
              x1="140"
              y1="295"
              x2="620"
              y2="295"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray="6 6"
              className="text-amber-500 dark:text-amber-400"
            />

            {showLabels ? (
              <text
                x="380"
                y="325"
                textAnchor="middle"
                className="fill-amber-700 dark:fill-amber-300 text-xs font-bold uppercase tracking-wider"
              >
                4. Transmission Medium (Copper, Fiber, Wireless)
              </text>
            ) : (
              <text
                x="380"
                y="325"
                textAnchor="middle"
                className="fill-slate-400 dark:fill-slate-600 text-xs font-bold"
              >
                Component #4: ?
              </text>
            )}
          </g>

          {/* SENDER STACK */}
          <g className="group cursor-pointer">
            {/* Protocol Box above Sender */}
            <g transform="translate(70, 45)">
              <rect
                width="140"
                height="95"
                rx="8"
                className="fill-white dark:fill-slate-900 stroke-indigo-400 dark:stroke-indigo-600 stroke-[2px] shadow-sm transition-all group-hover:stroke-indigo-500 group-hover:stroke-[3px]"
              />
              <line
                x1="0"
                y1="30"
                x2="140"
                y2="30"
                className="stroke-slate-200 dark:stroke-slate-800"
              />
              <line
                x1="0"
                y1="62"
                x2="140"
                y2="62"
                className="stroke-slate-200 dark:stroke-slate-800"
              />
              {showLabels ? (
                <>
                  <text
                    x="70"
                    y="21"
                    textAnchor="middle"
                    className="fill-indigo-600 dark:fill-indigo-400 text-xs font-extrabold uppercase"
                  >
                    5. Protocol
                  </text>
                  <text
                    x="70"
                    y="48"
                    textAnchor="middle"
                    className="fill-slate-600 dark:fill-slate-400 text-[10px]"
                  >
                    Syntax (Format)
                  </text>
                  <text
                    x="70"
                    y="80"
                    textAnchor="middle"
                    className="fill-slate-600 dark:fill-slate-400 text-[10px]"
                  >
                    Semantics (Meaning)
                  </text>
                </>
              ) : (
                <>
                  <text
                    x="70"
                    y="21"
                    textAnchor="middle"
                    className="fill-slate-400 dark:fill-slate-600 text-xs font-bold"
                  >
                    Component #5: ?
                  </text>
                  <text
                    x="70"
                    y="50"
                    textAnchor="middle"
                    className="fill-slate-400 dark:fill-slate-600 text-[10px]"
                  >
                    ?
                  </text>
                  <text
                    x="70"
                    y="82"
                    textAnchor="middle"
                    className="fill-slate-400 dark:fill-slate-600 text-[10px]"
                  >
                    ?
                  </text>
                </>
              )}
            </g>

            {/* Sender Station Box */}
            <rect
              x="70"
              y="175"
              width="140"
              height="85"
              rx="10"
              className="fill-blue-50 dark:fill-blue-950/80 stroke-blue-500 dark:stroke-blue-400 stroke-[2px] shadow-sm transition-all group-hover:stroke-blue-600 dark:group-hover:stroke-blue-300 group-hover:stroke-[3px]"
            />
            {showLabels ? (
              <text
                x="140"
                y="223"
                textAnchor="middle"
                className="fill-blue-800 dark:fill-blue-200 font-extrabold text-sm tracking-wider"
              >
                1. SENDER
              </text>
            ) : (
              <text
                x="140"
                y="223"
                textAnchor="middle"
                className="fill-slate-400 dark:fill-slate-600 font-bold text-sm"
              >
                Component #1: ?
              </text>
            )}
          </g>

          {/* RECEIVER STACK */}
          <g className="group cursor-pointer">
            {/* Protocol Box above Receiver */}
            <g transform="translate(550, 45)">
              <rect
                width="140"
                height="95"
                rx="8"
                className="fill-white dark:fill-slate-900 stroke-indigo-400 dark:stroke-indigo-600 stroke-[2px] shadow-sm transition-all group-hover:stroke-indigo-500 group-hover:stroke-[3px]"
              />
              <line
                x1="0"
                y1="30"
                x2="140"
                y2="30"
                className="stroke-slate-200 dark:stroke-slate-800"
              />
              <line
                x1="0"
                y1="62"
                x2="140"
                y2="62"
                className="stroke-slate-200 dark:stroke-slate-800"
              />
              {showLabels ? (
                <>
                  <text
                    x="70"
                    y="21"
                    textAnchor="middle"
                    className="fill-indigo-600 dark:fill-indigo-400 text-xs font-extrabold uppercase"
                  >
                    5. Protocol
                  </text>
                  <text
                    x="70"
                    y="48"
                    textAnchor="middle"
                    className="fill-slate-600 dark:fill-slate-400 text-[10px]"
                  >
                    Syntax (Format)
                  </text>
                  <text
                    x="70"
                    y="80"
                    textAnchor="middle"
                    className="fill-slate-600 dark:fill-slate-400 text-[10px]"
                  >
                    Semantics (Meaning)
                  </text>
                </>
              ) : (
                <>
                  <text
                    x="70"
                    y="21"
                    textAnchor="middle"
                    className="fill-slate-400 dark:fill-slate-600 text-xs font-bold"
                  >
                    Component #5: ?
                  </text>
                  <text
                    x="70"
                    y="50"
                    textAnchor="middle"
                    className="fill-slate-400 dark:fill-slate-600 text-[10px]"
                  >
                    ?
                  </text>
                  <text
                    x="70"
                    y="82"
                    textAnchor="middle"
                    className="fill-slate-400 dark:fill-slate-600 text-[10px]"
                  >
                    ?
                  </text>
                </>
              )}
            </g>

            {/* Receiver Station Box */}
            <rect
              x="550"
              y="175"
              width="140"
              height="85"
              rx="10"
              className="fill-blue-50 dark:fill-blue-950/80 stroke-blue-500 dark:stroke-blue-400 stroke-[2px] shadow-sm transition-all group-hover:stroke-blue-600 dark:group-hover:stroke-blue-300 group-hover:stroke-[3px]"
            />
            {showLabels ? (
              <text
                x="620"
                y="223"
                textAnchor="middle"
                className="fill-blue-800 dark:fill-blue-200 font-extrabold text-sm tracking-wider"
              >
                2. RECEIVER
              </text>
            ) : (
              <text
                x="620"
                y="223"
                textAnchor="middle"
                className="fill-slate-400 dark:fill-slate-600 font-bold text-sm"
              >
                Component #2: ?
              </text>
            )}
          </g>

          {/* MESSAGE */}
          <g className="group cursor-pointer">
            <g transform="translate(305, 115)">
              <rect
                width="150"
                height="55"
                rx="8"
                className="fill-violet-600 dark:fill-violet-700 stroke-violet-700 dark:stroke-violet-500 stroke-[2px] shadow-md transition-all group-hover:stroke-violet-400 group-hover:stroke-[3px]"
              />
              <path
                d="M 10 10 L 75 28 L 140 10"
                fill="none"
                className="stroke-violet-200/50 dark:stroke-violet-300/40 stroke-2"
              />
              {showLabels ? (
                <text
                  x="75"
                  y="46"
                  textAnchor="middle"
                  className="fill-white font-extrabold text-xs tracking-wider"
                >
                  3. MESSAGE (Data)
                </text>
              ) : (
                <text
                  x="75"
                  y="46"
                  textAnchor="middle"
                  className="fill-white font-bold text-xs"
                >
                  Component #3: ?
                </text>
              )}
            </g>

            {/* Directional Flow Arrow */}
            <line
              x1="210"
              y1="217"
              x2="550"
              y2="217"
              stroke="currentColor"
              strokeWidth="4"
              markerEnd="url(#five-comp-arrow)"
              className="text-blue-500 dark:text-blue-400"
            />
          </g>
        </svg>

        {/* HUD OVERLAY AT TOP LEFT */}
        <div className="absolute top-3 left-3 bg-background/90 dark:bg-slate-900/90 backdrop-blur-md border rounded-xl px-3 py-1.5 flex items-center gap-3 text-xs shadow-md z-20 transition-colors">
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
