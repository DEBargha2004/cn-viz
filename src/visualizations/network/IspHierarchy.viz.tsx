import { type VizMeta } from '../types';
import { Network, GitFork, ShieldCheck, Zap, Layers } from 'lucide-react';

export const vizMeta: VizMeta = {
  key: 'network-isp-hierarchy',
  title: 'Internet / ISP Hierarchy',
  category: 'network',
  renderer: 'svg',
  params: [
    { key: 'showNAP', type: 'boolean', label: 'Show NAP (Network Access Point)', default: true },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function IspHierarchy({ values }: Props) {
  const showNAP = values.showNAP !== false;

  return (
    <div className="flex flex-col space-y-5 p-4 sm:p-6 bg-card rounded-2xl border shadow-sm">
      {/* LARGE RESPONSIVE SVG CANVAS CONTAINER */}
      <div className="w-full border rounded-2xl bg-slate-100/80 dark:bg-slate-950/90 relative overflow-hidden shadow-inner border-slate-200/80 dark:border-slate-800 min-h-[200px] sm:min-h-[360px] md:min-h-[420px] flex items-center justify-center p-2 sm:p-4 transition-colors duration-300">
        {/* Ambient Grid Background */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-25 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <svg viewBox="0 0 760 380" className="w-full h-auto text-foreground relative z-10 select-none font-sans">
          <defs>
            <marker
              id="isp-arrow-end"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="currentColor" />
            </marker>
            <marker
              id="isp-arrow-start"
              viewBox="0 0 10 10"
              refX="2"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 10 1.5 L 2 5 L 10 8.5 z" fill="currentColor" />
            </marker>
          </defs>

          {/* Layout 1: Single Hierarchy Tree - when showNAP is false */}
          {!showNAP && (
            <g transform="translate(0, 15)" className="transition-all duration-500 ease-in-out">
              {/* Level 1 -> Level 2 lines */}
              <line x1="380" y1="65" x2="210" y2="145" stroke="currentColor" strokeWidth="2.5" className="text-slate-300 dark:text-slate-700" />
              <line x1="380" y1="65" x2="550" y2="145" stroke="currentColor" strokeWidth="2.5" className="text-slate-300 dark:text-slate-700" />

              {/* Level 2 -> Level 3 lines */}
              <line x1="210" y1="145" x2="120" y2="235" stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-slate-700" />
              <line x1="210" y1="145" x2="300" y2="235" stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-slate-700" />
              <line x1="550" y1="145" x2="460" y2="235" stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-slate-700" />
              <line x1="550" y1="145" x2="640" y2="235" stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-slate-700" />

              {/* Customer drops */}
              {[120, 300, 460, 640].map((x, idx) => (
                <g key={`drops-${idx}`} className="text-slate-400 dark:text-slate-600 opacity-60">
                  <line x1={x} y1="260" x2={x - 25} y2="315" stroke="currentColor" strokeWidth="1.5" />
                  <line x1={x} y1="260" x2={x} y2="315" stroke="currentColor" strokeWidth="1.5" />
                  <line x1={x} y1="260" x2={x + 25} y2="315" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx={x - 25} cy="315" r="3" fill="currentColor" />
                  <circle cx={x} cy="315" r="3" fill="currentColor" />
                  <circle cx={x + 25} cy="315" r="3" fill="currentColor" />
                </g>
              ))}

              {/* Level 1: National ISP */}
              <g className="group cursor-pointer">
                <rect x="290" y="30" width="180" height="55" rx="10" className="fill-blue-600 dark:fill-blue-500 stroke-blue-700 dark:stroke-blue-400 stroke-[2px] shadow-sm" />
                <text x="380" y="57" textAnchor="middle" className="fill-white text-xs font-extrabold tracking-wider">NATIONAL / TIER-1 ISP</text>
                <text x="380" y="73" textAnchor="middle" className="fill-blue-100/90 text-[10px]">Global Backbone Provider</text>
              </g>

              {/* Level 2: Regional ISPs */}
              <g className="group cursor-pointer">
                <rect x="135" y="120" width="150" height="50" rx="8" className="fill-white dark:fill-slate-900 stroke-indigo-400 dark:stroke-indigo-500 stroke-[2px] shadow-sm" />
                <text x="210" y="145" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-xs font-bold">REGIONAL ISP A</text>
                <text x="210" y="158" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[9px]">State / District Carrier</text>
              </g>
              <g className="group cursor-pointer">
                <rect x="475" y="120" width="150" height="50" rx="8" className="fill-white dark:fill-slate-900 stroke-indigo-400 dark:stroke-indigo-500 stroke-[2px] shadow-sm" />
                <text x="550" y="145" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-xs font-bold">REGIONAL ISP B</text>
                <text x="550" y="158" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[9px]">State / District Carrier</text>
              </g>

              {/* Level 3: Local ISPs */}
              {[
                { x: 75, label: 'Local ISP 1' },
                { x: 255, label: 'Local ISP 2' },
                { x: 415, label: 'Local ISP 3' },
                { x: 595, label: 'Local ISP 4' },
              ].map((item, idx) => (
                <g key={`local-${idx}`} className="group cursor-pointer" transform={`translate(${item.x}, 215)`}>
                  <rect width="90" height="45" rx="6" className="fill-emerald-50 dark:fill-emerald-950/80 stroke-emerald-500 dark:stroke-emerald-400 stroke-[1.5px]" />
                  <text x="45" y="24" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[10px] font-bold">{item.label}</text>
                  <text x="45" y="36" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[8px]">Retail / End-User</text>
                </g>
              ))}

              <text x="380" y="350" textAnchor="middle" className="fill-slate-600 dark:fill-slate-400 text-[11px] font-semibold">End Consumers & Business Subscribers</text>
            </g>
          )}

          {/* Layout 2: Split View Tree + NAP Interconnection - when showNAP is true */}
          {showNAP && (
            <g className="transition-all duration-500 ease-in-out transform">
              {/* Left Side: ISP Tree */}
              <g transform="translate(10, 20)">
                <line x1="180" y1="75" x2="100" y2="125" stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-slate-700" />
                <line x1="180" y1="75" x2="260" y2="125" stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-slate-700" />

                <line x1="100" y1="167" x2="51" y2="210" stroke="currentColor" strokeWidth="1.5" className="text-slate-300 dark:text-slate-700" />
                <line x1="100" y1="167" x2="136" y2="210" stroke="currentColor" strokeWidth="1.5" className="text-slate-300 dark:text-slate-700" />
                <line x1="260" y1="167" x2="224" y2="210" stroke="currentColor" strokeWidth="1.5" className="text-slate-300 dark:text-slate-700" />
                <line x1="260" y1="167" x2="309" y2="210" stroke="currentColor" strokeWidth="1.5" className="text-slate-300 dark:text-slate-700" />

                {/* Level 1: National ISP */}
                <rect x="115" y="36" width="130" height="44" rx="8" className="fill-blue-600 dark:fill-blue-500 stroke-blue-700 dark:stroke-blue-400 stroke-[2px]" />
                <text x="180" y="58" textAnchor="middle" className="fill-white text-[10px] font-extrabold tracking-wider">NATIONAL ISP</text>
                <text x="180" y="70" textAnchor="middle" className="fill-blue-100/90 text-[8px]">Backbone Tier-1</text>

                {/* Level 2: Regional ISPs */}
                <rect x="40" y="125" width="120" height="42" rx="6" className="fill-white dark:fill-slate-900 stroke-indigo-400 dark:stroke-indigo-500 stroke-[2px]" />
                <text x="100" y="150" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[10px] font-bold">REGIONAL ISP A</text>

                <rect x="200" y="125" width="120" height="42" rx="6" className="fill-white dark:fill-slate-900 stroke-indigo-400 dark:stroke-indigo-500 stroke-[2px]" />
                <text x="260" y="150" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[10px] font-bold">REGIONAL ISP B</text>

                {/* Level 3: Local ISPs */}
                {[
                  { x: 15, label: 'Local 1' },
                  { x: 100, label: 'Local 2' },
                  { x: 188, label: 'Local 3' },
                  { x: 273, label: 'Local 4' },
                ].map((item, idx) => (
                  <g key={`split-local-${idx}`} transform={`translate(${item.x}, 210)`}>
                    <rect width="72" height="38" rx="5" className="fill-emerald-50 dark:fill-emerald-950/80 stroke-emerald-500 dark:stroke-emerald-400 stroke-[1.5px]" />
                    <text x="36" y="22" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[9px] font-bold">{item.label}</text>
                  </g>
                ))}

                <text x="180" y="325" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[10px]">Subscriber Endpoints</text>
              </g>

              {/* Vertical Separator Divider */}
              <line x1="380" y1="15" x2="380" y2="355" stroke="currentColor" strokeWidth="2" className="text-slate-200 dark:text-slate-800" strokeDasharray="4 4" />

              {/* Right Side: NAP Interconnection */}
              <g transform="translate(380, 20)">
                <text x="180" y="20" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400 font-bold text-xs uppercase tracking-wider">NAP Peering Point</text>

                {/* Mathematically Symmetrical Arrow Lines (Exact 50px Edge Gaps) */}
                <line x1="180" y1="110" x2="180" y2="156" stroke="currentColor" strokeWidth="3" markerStart="url(#isp-arrow-start)" markerEnd="url(#isp-arrow-end)" className="text-amber-500 dark:text-amber-400" />
                <line x1="100.3" y1="226.0" x2="140.2" y2="203.0" stroke="currentColor" strokeWidth="3" markerStart="url(#isp-arrow-start)" markerEnd="url(#isp-arrow-end)" className="text-amber-500 dark:text-amber-400" />
                <line x1="259.7" y1="226.0" x2="219.8" y2="203.0" stroke="currentColor" strokeWidth="3" markerStart="url(#isp-arrow-start)" markerEnd="url(#isp-arrow-end)" className="text-amber-500 dark:text-amber-400" />

                {/* Central NAP Node */}
                <g transform="translate(180, 180)" className="group cursor-pointer">
                  <circle cx="0" cy="0" r="28" className="fill-amber-400/20" />
                  <rect x="-45" y="-22" width="90" height="44" rx="10" className="fill-amber-500 dark:fill-amber-600 stroke-amber-600 dark:stroke-amber-400 stroke-[2px] shadow-sm" />
                  <text x="0" y="2" textAnchor="middle" className="fill-white text-xs font-extrabold">N.A.P.</text>
                  <text x="0" y="14" textAnchor="middle" className="fill-amber-100 text-[8px] font-semibold">Peering Facility</text>
                </g>

                {/* Symmetrically Positioned Surrounding National ISPs */}
                <g className="group cursor-pointer">
                  <rect x="130" y="63" width="100" height="45" rx="8" className="fill-white dark:fill-slate-900 stroke-blue-500 dark:stroke-blue-400 stroke-[2px]" />
                  <text x="180" y="86" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[9px] font-bold">National ISP 1</text>
                  <text x="180" y="98" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[7px]">Backbone A</text>
                </g>

                <g className="group cursor-pointer">
                  <rect x="9.6" y="227" width="100" height="45" rx="8" className="fill-white dark:fill-slate-900 stroke-blue-500 dark:stroke-blue-400 stroke-[2px]" />
                  <text x="59.6" y="250" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[9px] font-bold">National ISP 2</text>
                  <text x="59.6" y="262" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[7px]">Backbone B</text>
                </g>

                <g className="group cursor-pointer">
                  <rect x="250.4" y="227" width="100" height="45" rx="8" className="fill-white dark:fill-slate-900 stroke-blue-500 dark:stroke-blue-400 stroke-[2px]" />
                  <text x="300.4" y="250" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[9px] font-bold">National ISP 3</text>
                  <text x="300.4" y="262" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[7px]">Backbone C</text>
                </g>

                <text x="180" y="315" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[10px]">Direct cross-connections exchange traffic freely</text>
              </g>
            </g>
          )}
        </svg>

        {/* HUD OVERLAY AT TOP LEFT */}
        <div className="absolute top-3 left-3 bg-background/90 dark:bg-slate-900/90 backdrop-blur-md border rounded-xl px-3 py-1.5 flex items-center gap-3 text-xs shadow-md z-20 transition-colors">
          <div className="flex items-center gap-1.5 font-semibold">
            {showNAP ? <GitFork className="w-4 h-4 text-amber-500" /> : <Network className="w-4 h-4 text-blue-500" />}
            <span>View: {showNAP ? 'NAP Peering Interconnection' : 'Hierarchical Tree'}</span>
          </div>
        </div>
      </div>

      {/* DETAILS GRID BELOW SVG */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Zap className="w-4 h-4 text-indigo-500" /> Tier 1: National Backbones
          </h5>
          <p className="text-xs text-muted-foreground">
            International carriers (e.g. AT&T, Lumen, Telia) owning high-speed fiber backbones. They exchange traffic with other Tier-1 backbones without paying transit fees.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Layers className="w-4 h-4 text-indigo-500" /> Tier 2 & 3: Regional & Local
          </h5>
          <p className="text-xs text-muted-foreground">
            <strong>Tier 2 (Regional):</strong> Intermediate carriers connecting states or cities.<br />
            <strong>Tier 3 (Local):</strong> Retail ISPs providing last-mile fiber, cable, or cellular to home subscribers.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" /> NAPs & IXPs (Peering)
          </h5>
          <p className="text-xs text-muted-foreground">
            <strong>Network Access Points (NAPs):</strong> Physical facilities allowing independent national networks to route data directly between each other without single-point bottlenecks.
          </p>
        </div>
      </div>
    </div>
  );
}
