import { type VizMeta } from "../types";
import { Network, Share2, ShieldCheck, Zap, Layers } from "lucide-react";

export const vizMeta: VizMeta = {
  key: "network-connection-types",
  title: "Types of Connections",
  category: "network",
  renderer: "svg",
  params: [
    {
      key: "connectionType",
      type: "select",
      label: "Connection Type",
      default: "point-to-point",
      options: [
        { label: "Point-to-Point (Dedicated)", value: "point-to-point" },
        { label: "Multipoint (Shared)", value: "multipoint" },
      ],
    },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function ConnectionTypes({ values }: Props) {
  const connectionType =
    (values.connectionType as "point-to-point" | "multipoint") ||
    "point-to-point";

  const isPtP = connectionType === "point-to-point";

  return (
    <div className="flex flex-col space-y-5 p-4 sm:p-6 bg-card rounded-2xl border shadow-sm">
      {/* LARGE RESPONSIVE SVG CANVAS CONTAINER */}
      <div className="w-full border rounded-2xl bg-slate-100/80 dark:bg-slate-950/90 relative overflow-hidden shadow-inner border-slate-200/80 dark:border-slate-800 min-h-[200px] sm:min-h-[360px] md:min-h-[420px] flex items-center justify-center p-2 sm:p-4 transition-colors duration-300">
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
          {/* Point-to-Point View */}
          <g
            className={`transition-all duration-500 transform origin-center ${
              isPtP
                ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                : "opacity-0 translate-y-4 scale-95 pointer-events-none"
            }`}
          >
            {/* Dedicated Link Line */}
            <line
              x1="220"
              y1="190"
              x2="540"
              y2="190"
              className="stroke-blue-500 dark:stroke-blue-400 stroke-[6px]"
              strokeLinecap="round"
            />

            <text
              x="380"
              y="135"
              textAnchor="middle"
              className="fill-blue-600 dark:fill-blue-400 text-xs font-bold uppercase tracking-wider"
            >
              100% Dedicated Channel Capacity
            </text>
            <text
              x="380"
              y="285"
              textAnchor="middle"
              className="fill-slate-600 dark:fill-slate-400 text-xs font-medium"
            >
              Entire channel bandwidth is exclusively reserved for Station A &
              Station B
            </text>

            {/* Station A */}
            <g className="group cursor-pointer">
              <rect
                x="110"
                y="150"
                width="110"
                height="80"
                rx="8"
                className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 stroke-[2px] transition-all group-hover:stroke-blue-500 group-hover:shadow-md"
              />
              <rect
                x="118"
                y="158"
                width="94"
                height="50"
                rx="4"
                className="fill-slate-100 dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700"
              />
              <circle
                cx="128"
                cy="168"
                r="3"
                className="fill-emerald-500 dark:fill-emerald-400"
              />
              <text
                x="165"
                y="250"
                textAnchor="middle"
                className="fill-slate-800 dark:fill-slate-200 text-xs font-bold"
              >
                Station A
              </text>
            </g>

            {/* Station B */}
            <g className="group cursor-pointer">
              <rect
                x="540"
                y="150"
                width="110"
                height="80"
                rx="8"
                className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 stroke-[2px] transition-all group-hover:stroke-blue-500 group-hover:shadow-md"
              />
              <rect
                x="548"
                y="158"
                width="94"
                height="50"
                rx="4"
                className="fill-slate-100 dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700"
              />
              <circle
                cx="558"
                cy="168"
                r="3"
                className="fill-emerald-500 dark:fill-emerald-400"
              />
              <text
                x="595"
                y="250"
                textAnchor="middle"
                className="fill-slate-800 dark:fill-slate-200 text-xs font-bold"
              >
                Station B
              </text>
            </g>
          </g>

          {/* Multipoint View */}
          <g
            className={`transition-all duration-500 transform origin-center ${
              !isPtP
                ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
            }`}
          >
            {/* Shared Backbone Line */}
            <line
              x1="90"
              y1="250"
              x2="670"
              y2="250"
              className="stroke-teal-500 dark:stroke-teal-400 stroke-[8px]"
              strokeLinecap="round"
            />
            <text
              x="380"
              y="285"
              textAnchor="middle"
              className="fill-teal-700 dark:fill-teal-300 text-xs font-bold uppercase tracking-wider"
            >
              Shared Transmission Medium (Time/Spatially Shared)
            </text>
            <text
              x="380"
              y="305"
              textAnchor="middle"
              className="fill-slate-600 dark:fill-slate-400 text-[11px]"
            >
              Capacity of single main cable is distributed among multiple
              stations concurrently
            </text>

            {/* Mainframe (Left) */}
            <g className="group cursor-pointer">
              <rect
                x="40"
                y="200"
                width="110"
                height="100"
                rx="10"
                className="fill-teal-600 dark:fill-teal-700 stroke-teal-700 dark:stroke-teal-500 stroke-[2px] transition-all group-hover:stroke-teal-400 group-hover:stroke-[3px]"
              />
              <rect
                x="50"
                y="212"
                width="90"
                height="16"
                rx="3"
                className="fill-teal-900/40"
              />
              <circle cx="62" cy="220" r="3" className="fill-emerald-400" />
              <rect
                x="50"
                y="234"
                width="90"
                height="16"
                rx="3"
                className="fill-teal-900/40"
              />
              <circle cx="62" cy="242" r="3" className="fill-emerald-400" />
              <rect
                x="50"
                y="256"
                width="90"
                height="16"
                rx="3"
                className="fill-teal-900/40"
              />
              <circle cx="62" cy="264" r="3" className="fill-emerald-400" />
              <text
                x="95"
                y="288"
                textAnchor="middle"
                className="fill-teal-50 dark:fill-teal-100 text-[10px] font-bold tracking-wider"
              >
                MAINFRAME
              </text>
            </g>

            {/* Station 1 */}
            <g className="group cursor-pointer">
              <line
                x1="250"
                y1="250"
                x2="250"
                y2="185"
                className="stroke-slate-400 dark:stroke-slate-600 stroke-[3px]"
              />
              <circle
                cx="250"
                cy="250"
                r="6"
                className="fill-teal-500 dark:fill-teal-400 stroke-white dark:stroke-slate-900 stroke-[2px]"
              />
              <rect
                x="205"
                y="115"
                width="90"
                height="60"
                rx="8"
                className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 stroke-[2px]"
              />
              <rect
                x="210"
                y="120"
                width="80"
                height="42"
                rx="4"
                className="fill-slate-100 dark:fill-slate-800"
              />
              <text
                x="250"
                y="103"
                textAnchor="middle"
                className="fill-slate-700 dark:fill-slate-300 text-[11px] font-bold"
              >
                Station 1
              </text>
            </g>

            {/* Station 2 */}
            <g className="group cursor-pointer">
              <line
                x1="430"
                y1="250"
                x2="430"
                y2="185"
                className="stroke-slate-400 dark:stroke-slate-600 stroke-[3px]"
              />
              <circle
                cx="430"
                cy="250"
                r="6"
                className="fill-teal-500 dark:fill-teal-400 stroke-white dark:stroke-slate-900 stroke-[2px]"
              />
              <rect
                x="385"
                y="115"
                width="90"
                height="60"
                rx="8"
                className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 stroke-[2px]"
              />
              <rect
                x="390"
                y="120"
                width="80"
                height="42"
                rx="4"
                className="fill-slate-100 dark:fill-slate-800"
              />
              <text
                x="430"
                y="103"
                textAnchor="middle"
                className="fill-slate-700 dark:fill-slate-300 text-[11px] font-bold"
              >
                Station 2
              </text>
            </g>

            {/* Station 3 */}
            <g className="group cursor-pointer">
              <line
                x1="610"
                y1="250"
                x2="610"
                y2="185"
                className="stroke-slate-400 dark:stroke-slate-600 stroke-[3px]"
              />
              <circle
                cx="610"
                cy="250"
                r="6"
                className="fill-teal-500 dark:fill-teal-400 stroke-white dark:stroke-slate-900 stroke-[2px]"
              />
              <rect
                x="565"
                y="115"
                width="90"
                height="60"
                rx="8"
                className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 stroke-[2px]"
              />
              <rect
                x="570"
                y="120"
                width="80"
                height="42"
                rx="4"
                className="fill-slate-100 dark:fill-slate-800"
              />
              <text
                x="610"
                y="103"
                textAnchor="middle"
                className="fill-slate-700 dark:fill-slate-300 text-[11px] font-bold"
              >
                Station 3
              </text>
            </g>
          </g>
        </svg>

        {/* HUD OVERLAY AT TOP LEFT */}
        <div className="absolute top-3 left-3 bg-background/90 dark:bg-slate-900/90 backdrop-blur-md border rounded-xl px-3 py-1.5 flex items-center gap-3 text-xs shadow-md z-20 transition-colors">
          <div className="flex items-center gap-1.5 font-semibold">
            {isPtP ? (
              <Network className="w-4 h-4 text-blue-500" />
            ) : (
              <Share2 className="w-4 h-4 text-teal-500" />
            )}
            <span>
              Mode:{" "}
              {isPtP ? "Point-to-Point (Dedicated)" : "Multipoint (Shared)"}
            </span>
          </div>
        </div>
      </div>

      {/* DETAILS GRID BELOW SVG */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Zap className="w-4 h-4 text-indigo-500" /> Bandwidth Allocation
          </h5>
          <p className="text-xs text-muted-foreground">
            {isPtP
              ? "100% of link capacity is dedicated exclusively between two end nodes. Guarantees maximum throughput without contention."
              : "Multiple devices share the link capacity either simultaneously (spatial sharing) or sequentially (time sharing)."}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" /> Practical Use
            Cases
          </h5>
          <p className="text-xs text-muted-foreground">
            {isPtP
              ? "Direct microwave links, serial cable connecting a PC to a modem, or dedicated fiber connections between data centers."
              : "Legacy Ethernet bus topology, Wi-Fi wireless medium shared by mobile clients, or mainframe drop-line terminals."}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Layers className="w-4 h-4 text-indigo-500" /> Cost & Complexity
          </h5>
          <p className="text-xs text-muted-foreground">
            {isPtP
              ? "Higher cabling cost per node pair, but simpler media access control since collisions cannot occur."
              : "Lower overall cabling investment, but requires media access control (MAC) protocols like CSMA/CD to manage sharing."}
          </p>
        </div>
      </div>
    </div>
  );
}
