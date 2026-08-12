import { type VizMeta } from '../types';
import { LayoutGrid, Binary, Clock } from 'lucide-react';

export const vizMeta: VizMeta = {
  key: 'network-protocol-elements',
  title: 'Elements of a Protocol',
  category: 'network',
  renderer: 'svg',
  params: [
    {
      key: 'highlight',
      type: 'select',
      label: 'Highlight Element',
      default: 'syntax',
      options: [
        { label: 'Syntax (Format)', value: 'syntax' },
        { label: 'Semantics (Meaning)', value: 'semantics' },
        { label: 'Timing (Speed)', value: 'timing' },
      ],
    },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function ProtocolElements({ values }: Props) {
  const highlight = (values.highlight as 'syntax' | 'semantics' | 'timing') || 'syntax';

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none">
      {/* LARGE RESPONSIVE SVG CANVAS CONTAINER */}
      <div className="w-full border rounded-2xl bg-slate-100/80 dark:bg-slate-950/90 relative overflow-hidden shadow-inner border-slate-200/80 dark:border-slate-800 min-h-[200px] sm:min-h-[360px] md:min-h-[420px] transition-colors duration-300 flex items-center justify-center p-2 sm:p-4">
        {/* Ambient Grid Background */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-25 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <svg viewBox="0 0 780 370" className="w-full h-auto text-foreground relative z-10 select-none font-sans">
          <defs>
            <marker
              id="protocol-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="currentColor" />
            </marker>
          </defs>

          {/* 1. SYNTAX CARD */}
          <g
            className={`transition-all duration-300 origin-[136px_185px] ${
              highlight === 'syntax' ? 'scale-[1.02] opacity-100' : 'opacity-50'
            }`}
          >
            {/* Card Frame */}
            <rect
              x="18"
              y="20"
              width="236"
              height="330"
              rx="12"
              className={`fill-card stroke-2 transition-colors duration-300 ${
                highlight === 'syntax' ? 'stroke-blue-500 dark:stroke-blue-400 shadow-md' : 'stroke-slate-200 dark:stroke-slate-800'
              }`}
            />
            <text x="136" y="52" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-extrabold text-sm tracking-wider">SYNTAX</text>
            <text x="136" y="68" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[10px] font-medium">Data Format & Structure</text>

            {/* Packet Field Diagram */}
            <g transform="translate(34, 95)">
              <rect width="204" height="42" rx="6" className="fill-slate-50 dark:fill-slate-950 stroke-slate-200 dark:stroke-slate-800 stroke-[1.5px]" />
              <line x1="58" y1="0" x2="58" y2="42" className="stroke-slate-200 dark:stroke-slate-800 stroke-[1.5px]" />
              <line x1="110" y1="0" x2="110" y2="42" className="stroke-slate-200 dark:stroke-slate-800 stroke-[1.5px]" />
              <line x1="162" y1="0" x2="162" y2="42" className="stroke-slate-200 dark:stroke-slate-800 stroke-[1.5px]" />

              <text x="29" y="25" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[10px] font-bold">Address</text>
              <text x="84" y="25" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[10px] font-bold">Control</text>
              <text x="136" y="25" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[10px] font-bold">Data</text>
              <text x="183" y="25" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[10px] font-bold">CRC</text>

              <text x="29" y="56" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[8px] font-medium">8 bits</text>
              <text x="84" y="56" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[8px] font-medium">8 bits</text>
              <text x="136" y="56" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[8px] font-medium">Variable</text>
              <text x="183" y="56" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[8px] font-medium">16 bits</text>
            </g>

            {/* Connecting Arrow */}
            <path d="M 136 170 L 136 205" stroke="currentColor" strokeWidth="2" markerEnd="url(#protocol-arrow)" className="text-blue-500 dark:text-blue-400" />

            {/* Explanation Box */}
            <g transform="translate(28, 215)">
              <rect width="216" height="115" rx="8" className="fill-slate-50/80 dark:fill-slate-900/60 stroke-slate-200 dark:stroke-slate-800/80 stroke-[1px]" />
              <text x="14" y="24" className="fill-blue-600 dark:fill-blue-400 text-[11px] font-extrabold">What Syntax Defines:</text>

              <text x="14" y="46" className="fill-slate-700 dark:fill-slate-300 text-[10px]">• Field order & byte alignment</text>
              <text x="14" y="66" className="fill-slate-700 dark:fill-slate-300 text-[10px]">• Payload & header offsets</text>
              <text x="14" y="86" className="fill-slate-700 dark:fill-slate-300 text-[10px]">• Checksum field placement</text>
            </g>
          </g>

          {/* 2. SEMANTICS CARD */}
          <g
            className={`transition-all duration-300 origin-[390px_185px] ${
              highlight === 'semantics' ? 'scale-[1.02] opacity-100' : 'opacity-50'
            }`}
          >
            {/* Card Frame */}
            <rect
              x="272"
              y="20"
              width="236"
              height="330"
              rx="12"
              className={`fill-card stroke-2 transition-colors duration-300 ${
                highlight === 'semantics' ? 'stroke-violet-500 dark:stroke-violet-400 shadow-md' : 'stroke-slate-200 dark:stroke-slate-800'
              }`}
            />
            <text x="390" y="52" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-extrabold text-sm tracking-wider">SEMANTICS</text>
            <text x="390" y="68" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[10px] font-medium">Meaning & Action of Bits</text>

            {/* Bit Pattern & Action Mapping */}
            <g transform="translate(286, 95)">
              {/* Bit pattern received */}
              <rect x="0" y="10" width="76" height="34" rx="6" className="fill-slate-50 dark:fill-slate-950 stroke-slate-300 dark:stroke-slate-700 stroke-[1.5px]" />
              <text x="38" y="31" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 font-mono text-[10px] font-bold">01101011</text>
              <text x="38" y="56" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[8px] font-medium">(Pattern Received)</text>

              {/* Arrow */}
              <path d="M 82 27 L 116 27" stroke="currentColor" strokeWidth="2" markerEnd="url(#protocol-arrow)" className="text-violet-500 dark:text-violet-400" />

              {/* Expected Action */}
              <rect x="124" y="10" width="82" height="34" rx="6" className="fill-violet-500 dark:fill-violet-600 stroke-violet-600 dark:stroke-violet-400 stroke-[1.5px] shadow-sm" />
              <text x="165" y="31" textAnchor="middle" className="fill-white font-extrabold text-[10px] tracking-wide">SEND ACK</text>
              <text x="165" y="56" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[8px] font-medium">(Expected Action)</text>
            </g>

            {/* Connecting Arrow */}
            <path d="M 390 170 L 390 205" stroke="currentColor" strokeWidth="2" markerEnd="url(#protocol-arrow)" className="text-violet-500 dark:text-violet-400" />

            {/* Explanation Box */}
            <g transform="translate(282, 215)">
              <rect width="216" height="115" rx="8" className="fill-slate-50/80 dark:fill-slate-900/60 stroke-slate-200 dark:stroke-slate-800/80 stroke-[1px]" />
              <text x="14" y="24" className="fill-violet-600 dark:fill-violet-400 text-[11px] font-extrabold">What Semantics Defines:</text>

              <text x="14" y="46" className="fill-slate-700 dark:fill-slate-300 text-[10px]">• Meaning of control bit patterns</text>
              <text x="14" y="66" className="fill-slate-700 dark:fill-slate-300 text-[10px]">• Actions triggered per section</text>
              <text x="14" y="86" className="fill-slate-700 dark:fill-slate-300 text-[10px]">• Error handling procedures</text>
            </g>
          </g>

          {/* 3. TIMING CARD */}
          <g
            className={`transition-all duration-300 origin-[644px_185px] ${
              highlight === 'timing' ? 'scale-[1.02] opacity-100' : 'opacity-50'
            }`}
          >
            {/* Card Frame */}
            <rect
              x="526"
              y="20"
              width="236"
              height="330"
              rx="12"
              className={`fill-card stroke-2 transition-colors duration-300 ${
                highlight === 'timing' ? 'stroke-amber-500 dark:stroke-amber-400 shadow-md' : 'stroke-slate-200 dark:stroke-slate-800'
              }`}
            />
            <text x="644" y="52" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-extrabold text-sm tracking-wider">TIMING</text>
            <text x="644" y="68" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 text-[10px] font-medium">Speed Matching & Order</text>

            {/* Sequence Diagram */}
            <g transform="translate(536, 95)">
              <line x1="30" y1="20" x2="30" y2="72" stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-slate-700" />
              <line x1="186" y1="20" x2="186" y2="72" stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-slate-700" />
              <text x="30" y="12" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[9px] font-extrabold">TX</text>
              <text x="186" y="12" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[9px] font-extrabold">RX</text>

              {/* Data line */}
              <line x1="30" y1="28" x2="180" y2="46" stroke="currentColor" strokeWidth="2" markerEnd="url(#protocol-arrow)" className="text-blue-500 dark:text-blue-400" />
              <text x="108" y="34" textAnchor="middle" className="fill-blue-600 dark:fill-blue-400 text-[8px] font-bold">Data (100 Mbps)</text>

              {/* ACK line */}
              <line x1="186" y1="54" x2="36" y2="70" stroke="currentColor" strokeWidth="2" markerEnd="url(#protocol-arrow)" className="text-emerald-500 dark:text-emerald-400" />
              <text x="108" y="60" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[8px] font-bold">ACK</text>
            </g>

            {/* Connecting Arrow */}
            <path d="M 644 170 L 644 205" stroke="currentColor" strokeWidth="2" markerEnd="url(#protocol-arrow)" className="text-amber-500 dark:text-amber-400" />

            {/* Explanation Box */}
            <g transform="translate(536, 215)">
              <rect width="216" height="115" rx="8" className="fill-slate-50/80 dark:fill-slate-900/60 stroke-slate-200 dark:stroke-slate-800/80 stroke-[1px]" />
              <text x="14" y="24" className="fill-amber-600 dark:fill-amber-400 text-[11px] font-extrabold">What Timing Defines:</text>

              <text x="14" y="46" className="fill-slate-700 dark:fill-slate-300 text-[10px]">• When data should be sent</text>
              <text x="14" y="66" className="fill-slate-700 dark:fill-slate-300 text-[10px]">• Flow control & speed matching</text>
              <text x="14" y="86" className="fill-slate-700 dark:fill-slate-300 text-[10px]">• Timeout & retransmission rules</text>
            </g>
          </g>
        </svg>
      </div>

      {/* PEDAGOGICAL DETAILS GRID BELOW SVG */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <LayoutGrid className="w-4 h-4 text-blue-500" /> 1. Syntax (Structure)
          </h5>
          <p className="text-xs text-muted-foreground">
            Defines the exact structure, layout, and byte format of incoming data packets—specifying control headers, payload offsets, and checksum boundaries.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Binary className="w-4 h-4 text-violet-500" /> 2. Semantics (Meaning)
          </h5>
          <p className="text-xs text-muted-foreground">
            Specifies the interpretation of specific bit patterns and the exact actions or state changes a receiver must execute upon reading them.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Clock className="w-4 h-4 text-amber-500" /> 3. Timing (Speed & Order)
          </h5>
          <p className="text-xs text-muted-foreground">
            Determines when data packets should be transmitted and how fast data can be sent so the receiver is not overwhelmed (flow control).
          </p>
        </div>
      </div>
    </div>
  );
}
