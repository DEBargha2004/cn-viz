import { useId } from "react";
import { type VizMeta } from "../types";
import {
  Globe,
  FileCode,
  Handshake,
  ShieldCheck,
  Network,
  Binary,
  Zap,
  CheckCircle2,
  Layers,
  Sparkles,
  Cpu,
  HardDrive,
  Radio,
} from "lucide-react";

export const vizMeta: VizMeta = {
  key: "network-osi-stack",
  title: "The Seven OSI Layers",
  category: "network",
  renderer: "svg",
  animated: false,
  params: [
    {
      key: "mode",
      type: "select",
      label: "View Mode",
      default: "architecture",
      options: [
        { label: "Architecture View", value: "architecture" },
        { label: "Summary Callouts", value: "summary" },
      ],
    },
    {
      key: "highlightLayer",
      type: "select",
      label: "Highlight Layer",
      default: "none",
      options: [
        { label: "None (All)", value: "none" },
        { label: "Layer 7: Application", value: "application" },
        { label: "Layer 6: Presentation", value: "presentation" },
        { label: "Layer 5: Session", value: "session" },
        { label: "Layer 4: Transport", value: "transport" },
        { label: "Layer 3: Network", value: "network" },
        { label: "Layer 2: Data Link", value: "data-link" },
        { label: "Layer 1: Physical", value: "physical" },
      ],
    },
  ],
};

interface LayerItem {
  key: string;
  num: number;
  name: string;
  shortName: string;
  pdu: string;
  group: "upper" | "transport" | "lower";
  summaryTitle: string;
  summaryDesc: string;
  icon: typeof Globe;
  styles: {
    accentColor: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    highlightBorder: string;
    highlightBg: string;
    pduBg: string;
    pduText: string;
  };
  details: {
    addressing: string;
    protocols: string[];
    description: string;
    keyFunctions: string[];
  };
}

const OSI_LAYERS: LayerItem[] = [
  {
    key: "application",
    num: 7,
    name: "Application Layer",
    shortName: "Application",
    pdu: "Data / Message",
    group: "upper",
    summaryTitle: "Application Services",
    summaryDesc: "Direct network interfaces & APIs for client software",
    icon: Globe,
    styles: {
      accentColor: "purple",
      border: "stroke-purple-300 dark:stroke-purple-800",
      text: "fill-purple-950 dark:fill-purple-200 text-purple-600 dark:text-purple-400",
      badgeBg: "fill-purple-600 dark:fill-purple-500",
      badgeText: "fill-white",
      highlightBorder: "stroke-purple-500 dark:stroke-purple-400",
      highlightBg: "fill-purple-50 dark:fill-purple-950/70",
      pduBg:
        "fill-purple-100/80 dark:fill-purple-950/80 stroke-purple-200 dark:stroke-purple-800",
      pduText: "fill-purple-700 dark:fill-purple-300",
    },
    details: {
      addressing: "Domain Names (FQDN) / User APIs",
      protocols: ["HTTP", "HTTPS", "FTP", "DNS", "SMTP", "SSH"],
      description:
        "Provides direct network interfaces and end-user services to client applications like browsers and email clients.",
      keyFunctions: [
        "Network virtual terminal & file access",
        "Directory services & email routing",
        "User authentication & application requests",
      ],
    },
  },
  {
    key: "presentation",
    num: 6,
    name: "Presentation Layer",
    shortName: "Presentation",
    pdu: "Formatted Data",
    group: "upper",
    summaryTitle: "Data Translation",
    summaryDesc: "Syntax translation, TLS encryption & compression",
    icon: FileCode,
    styles: {
      accentColor: "indigo",
      border: "stroke-indigo-300 dark:stroke-indigo-800",
      text: "fill-indigo-950 dark:fill-indigo-200 text-indigo-600 dark:text-indigo-400",
      badgeBg: "fill-indigo-600 dark:fill-indigo-500",
      badgeText: "fill-white",
      highlightBorder: "stroke-indigo-500 dark:stroke-indigo-400",
      highlightBg: "fill-indigo-50 dark:fill-indigo-950/70",
      pduBg:
        "fill-indigo-100/80 dark:fill-indigo-950/80 stroke-indigo-200 dark:stroke-indigo-800",
      pduText: "fill-indigo-700 dark:fill-indigo-300",
    },
    details: {
      addressing: "Data Syntax / Encoding Schemas",
      protocols: ["SSL/TLS", "JPEG", "ASCII", "MIME", "ASN.1"],
      description:
        "Acts as data translator between application formats and machine-independent network syntax.",
      keyFunctions: [
        "Character code conversion (ASCII/Unicode)",
        "Data encryption & decryption (TLS/SSL)",
        "Data compression & decompression",
      ],
    },
  },
  {
    key: "session",
    num: 5,
    name: "Session Layer",
    shortName: "Session",
    pdu: "Dialog Data",
    group: "upper",
    summaryTitle: "Session Management",
    summaryDesc: "Establishes, maintains & synchronizes host dialogs",
    icon: Handshake,
    styles: {
      accentColor: "violet",
      border: "stroke-violet-300 dark:stroke-violet-800",
      text: "fill-violet-950 dark:fill-violet-200 text-violet-600 dark:text-violet-400",
      badgeBg: "fill-violet-600 dark:fill-violet-500",
      badgeText: "fill-white",
      highlightBorder: "stroke-violet-500 dark:stroke-violet-400",
      highlightBg: "fill-violet-50 dark:fill-violet-950/70",
      pduBg:
        "fill-violet-100/80 dark:fill-violet-950/80 stroke-violet-200 dark:stroke-violet-800",
      pduText: "fill-violet-700 dark:fill-violet-300",
    },
    details: {
      addressing: "Session IDs / Token Handles",
      protocols: ["NetBIOS", "RPC", "PPTP", "Sockets"],
      description:
        "Establishes, maintains, synchronizes, and terminates active communication sessions between hosts.",
      keyFunctions: [
        "Dialog control (half-duplex or full-duplex)",
        "Session checkpointing & synchronization",
        "Graceful connection teardown & recovery",
      ],
    },
  },
  {
    key: "transport",
    num: 4,
    name: "Transport Layer",
    shortName: "Transport",
    pdu: "Segment / Datagram",
    group: "transport",
    summaryTitle: "Process Delivery",
    summaryDesc: "Process-to-process delivery, flow control & error check",
    icon: ShieldCheck,
    styles: {
      accentColor: "emerald",
      border: "stroke-emerald-300 dark:stroke-emerald-800",
      text: "fill-emerald-950 dark:fill-emerald-200 text-emerald-600 dark:text-emerald-400",
      badgeBg: "fill-emerald-600 dark:fill-emerald-500",
      badgeText: "fill-white",
      highlightBorder: "stroke-emerald-500 dark:stroke-emerald-400",
      highlightBg: "fill-emerald-50 dark:fill-emerald-950/70",
      pduBg:
        "fill-emerald-100/80 dark:fill-emerald-950/80 stroke-emerald-200 dark:stroke-emerald-800",
      pduText: "fill-emerald-700 dark:fill-emerald-300",
    },
    details: {
      addressing: "Port Numbers (16-bit: e.g. Port 80, 443)",
      protocols: ["TCP", "UDP", "SCTP"],
      description:
        "Ensures complete end-to-end data delivery from source process to destination process across networks.",
      keyFunctions: [
        "Service-point (Port) addressing",
        "Segmentation & sequence reassembly",
        "Connection control, flow control & retransmission",
      ],
    },
  },
  {
    key: "network",
    num: 3,
    name: "Network Layer",
    shortName: "Network",
    pdu: "Packet / Datagram",
    group: "lower",
    summaryTitle: "Routing & IP",
    summaryDesc: "Logical IP addressing & packet routing across networks",
    icon: Network,
    styles: {
      accentColor: "sky",
      border: "stroke-sky-300 dark:stroke-sky-800",
      text: "fill-sky-950 dark:fill-sky-200 text-sky-600 dark:text-sky-400",
      badgeBg: "fill-sky-600 dark:fill-sky-500",
      badgeText: "fill-white",
      highlightBorder: "stroke-sky-500 dark:stroke-sky-400",
      highlightBg: "fill-sky-50 dark:fill-sky-950/70",
      pduBg:
        "fill-sky-100/80 dark:fill-sky-950/80 stroke-sky-200 dark:stroke-sky-800",
      pduText: "fill-sky-700 dark:fill-sky-300",
    },
    details: {
      addressing: "Logical IP Address (IPv4 / IPv6)",
      protocols: ["IP (IPv4/IPv6)", "ICMP", "IGMP", "OSPF", "BGP"],
      description:
        "Routes packets across distinct networks from initial origin to final destination host.",
      keyFunctions: [
        "Logical source-to-destination host addressing",
        "Routing path selection across intermediate routers",
        "Packetizing and fragmentation handling",
      ],
    },
  },
  {
    key: "data-link",
    num: 2,
    name: "Data Link Layer",
    shortName: "Data Link",
    pdu: "Frame",
    group: "lower",
    summaryTitle: "Hop Framing & MAC",
    summaryDesc: "Hop-to-hop frame delivery, MAC addressing & error check",
    icon: Binary,
    styles: {
      accentColor: "amber",
      border: "stroke-amber-300 dark:stroke-amber-800",
      text: "fill-amber-950 dark:fill-amber-200 text-amber-600 dark:text-amber-400",
      badgeBg: "fill-amber-600 dark:fill-amber-500",
      badgeText: "fill-white",
      highlightBorder: "stroke-amber-500 dark:stroke-amber-400",
      highlightBg: "fill-amber-50 dark:fill-amber-950/70",
      pduBg:
        "fill-amber-100/80 dark:fill-amber-950/80 stroke-amber-200 dark:stroke-amber-800",
      pduText: "fill-amber-700 dark:fill-amber-300",
    },
    details: {
      addressing: "Physical MAC Address (48-bit)",
      protocols: ["Ethernet (802.3)", "Wi-Fi (802.11)", "PPP", "HDLC"],
      description:
        "Transforms a raw physical transmission channel into a reliable hop-to-hop link.",
      keyFunctions: [
        "Framing & physical hardware MAC addressing",
        "Hop-to-hop node delivery",
        "Flow control, CRC error trailer & media access control",
      ],
    },
  },
  {
    key: "physical",
    num: 1,
    name: "Physical Layer",
    shortName: "Physical",
    pdu: "Bit Stream",
    group: "lower",
    summaryTitle: "Physical Media",
    summaryDesc: "Raw bit transmission over copper, fiber & wireless media",
    icon: Zap,
    styles: {
      accentColor: "rose",
      border: "stroke-rose-300 dark:stroke-rose-800",
      text: "fill-rose-950 dark:fill-rose-200 text-rose-600 dark:text-rose-400",
      badgeBg: "fill-rose-600 dark:fill-rose-500",
      badgeText: "fill-white",
      highlightBorder: "stroke-rose-500 dark:stroke-rose-400",
      highlightBg: "fill-rose-50 dark:fill-rose-950/70",
      pduBg:
        "fill-rose-100/80 dark:fill-rose-950/80 stroke-rose-200 dark:stroke-rose-800",
      pduText: "fill-rose-700 dark:fill-rose-300",
    },
    details: {
      addressing: "None (Electrical Signals / Optical Pulses)",
      protocols: ["RS-232", "100BASE-TX", "1000BASE-T", "SONET"],
      description:
        "Transmits raw individual bit streams over physical copper, glass fiber, or radio media.",
      keyFunctions: [
        "Bit representation (voltages / light pulses)",
        "Data rate control (bits per second)",
        "Bit synchronization & physical interface specs",
      ],
    },
  },
];

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
}

export default function OsiStack({ values, onChange }: Props) {
  const mode = (values.mode as "architecture" | "summary") || "architecture";
  const rawHighlightParam = (values.highlightLayer as string) || "none";

  const activeHighlightKey =
    rawHighlightParam !== "none" ? rawHighlightParam : null;

  const handleLayerClick = (layerKey: string) => {
    const isSelected = activeHighlightKey === layerKey;
    const nextHighlight = isSelected ? "none" : layerKey;
    if (onChange) {
      onChange({
        ...values,
        highlightLayer: nextHighlight,
      });
    }
  };

  const activeLayer = OSI_LAYERS.find((l) => l.key === activeHighlightKey);

  const rawId = useId();
  const shadowFilterId = `osi-shadow-${rawId.replace(/:/g, "")}`;
  const arrowMarkerId = `osi-arrow-${rawId.replace(/:/g, "")}`;

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none">
      {/* SVG CANVAS CONTAINER */}
      <div className="w-full border rounded-2xl bg-slate-100/80 dark:bg-slate-950/90 relative overflow-hidden shadow-inner border-slate-200/80 dark:border-slate-800 min-h-[360px] md:min-h-[440px] flex items-center justify-center p-2 sm:p-4 transition-colors duration-300">
        {/* Ambient Subtle Grid */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-25 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <svg
          viewBox="0 0 780 440"
          className="w-full h-auto text-foreground relative z-10 select-none font-sans"
        >
          <defs>
            <filter
              id={shadowFilterId}
              x="-10%"
              y="-10%"
              width="120%"
              height="120%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodOpacity="0.08"
              />
            </filter>
            <marker
              id={arrowMarkerId}
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

          {/* MODE 1: ARCHITECTURE VIEW */}
          {mode === "architecture" && (
            <g>
              {/* LEFT COLUMN: 7 STACKED LAYER BARS */}
              {OSI_LAYERS.map((layer, index) => {
                const yPos = 18 + index * 58;
                const isSelected = activeHighlightKey === layer.key;
                const IconComponent = layer.icon;

                return (
                  <g
                    key={layer.key}
                    className="cursor-pointer group"
                    onClick={() => handleLayerClick(layer.key)}
                  >
                    {/* Layer Number Badge */}
                    <circle
                      cx="45"
                      cy={yPos + 24}
                      r="15"
                      style={{
                        transformOrigin: "center",
                        transformBox: "fill-box",
                      }}
                      className={`transition-all duration-200 ${
                        isSelected
                          ? "fill-primary text-primary-foreground stroke-primary stroke-2"
                          : `${layer.styles.badgeBg} stroke-white dark:stroke-slate-900 stroke-2 group-hover:scale-105`
                      }`}
                    />
                    <text
                      x="45"
                      y={yPos + 28}
                      textAnchor="middle"
                      className={`text-xs font-black select-none ${
                        isSelected
                          ? "fill-primary-foreground"
                          : layer.styles.badgeText
                      }`}
                    >
                      {layer.num}
                    </text>

                    {/* Main Layer Bar Rectangle */}
                    <rect
                      x="72"
                      y={yPos}
                      width="358"
                      height="48"
                      rx="10"
                      filter={`url(#${shadowFilterId})`}
                      className={`transition-all duration-200 ${
                        isSelected
                          ? `${layer.styles.highlightBg} ${layer.styles.highlightBorder} stroke-[2.5px]`
                          : `fill-white dark:fill-slate-900 ${layer.styles.border} stroke-[1.5px] group-hover:stroke-primary/70 dark:group-hover:stroke-primary/70 group-hover:shadow-md`
                      }`}
                    />

                    {/* Left Icon Accent */}
                    <g
                      transform={`translate(86, ${yPos + 14})`}
                      className={layer.styles.text}
                    >
                      <IconComponent className="w-5 h-5 opacity-90" />
                    </g>

                    {/* Layer Title */}
                    <text
                      x="116"
                      y={yPos + 28}
                      className={`text-xs sm:text-sm font-extrabold tracking-wide ${
                        isSelected
                          ? "fill-slate-950 dark:fill-slate-50 font-black"
                          : "fill-slate-800 dark:fill-slate-100"
                      }`}
                    >
                      {layer.name}
                    </text>

                    {/* PDU Label Pill - Sized to 148px width inside bar (ends at x=418) */}
                    <g transform={`translate(270, ${yPos + 12})`}>
                      <rect
                        x="0"
                        y="0"
                        width="148"
                        height="24"
                        rx="6"
                        className={`${layer.styles.pduBg} stroke-1 transition-colors duration-200 group-hover:fill-slate-200/60 dark:group-hover:fill-slate-800`}
                      />
                      <text
                        x="74"
                        y="16"
                        textAnchor="middle"
                        className={`${layer.styles.pduText} text-[10px] font-bold tracking-tight`}
                      >
                        PDU: {layer.pdu}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* RIGHT COLUMN: 3 GROUP BRACKETS */}
              {/* Bracket 1: Upper Layers (Layers 7, 6, 5 -> Y: 18 to 182) */}
              <g transform="translate(442, 0)">
                <path
                  d="M 0 22 H 8 V 90 H 18 V 110 H 8 V 178 H 0"
                  fill="none"
                  className="stroke-purple-500 dark:stroke-purple-400 stroke-[2.5px] stroke-linecap-round stroke-linejoin-round"
                />
                <g transform="translate(28, 40)">
                  <rect
                    x="0"
                    y="0"
                    width="290"
                    height="120"
                    rx="10"
                    className="fill-white/90 dark:fill-slate-900/90 stroke-purple-200 dark:stroke-purple-900 stroke-1 shadow-xs"
                  />
                  <text
                    x="16"
                    y="24"
                    className="fill-purple-900 dark:fill-purple-200 text-xs font-black uppercase tracking-wider"
                  >
                    Upper Layers (5–7)
                  </text>
                  <text
                    x="16"
                    y="42"
                    className="fill-purple-700 dark:fill-purple-300 text-[11px] font-bold"
                  >
                    Software & User Interface Layers
                  </text>
                  <text
                    x="16"
                    y="60"
                    className="fill-slate-600 dark:fill-slate-400 text-[10px] leading-relaxed"
                  >
                    Handles user application interaction, data
                  </text>
                  <text
                    x="16"
                    y="74"
                    className="fill-slate-600 dark:fill-slate-400 text-[10px] leading-relaxed"
                  >
                    formatting, encryption & session control.
                  </text>
                  <g transform="translate(16, 88)" className="flex gap-1">
                    <rect
                      x="0"
                      y="0"
                      width="180"
                      height="18"
                      rx="4"
                      className="fill-purple-100 dark:fill-purple-950/80 stroke-purple-200 dark:stroke-purple-800 stroke-1"
                    />
                    <text
                      x="90"
                      y="12"
                      textAnchor="middle"
                      className="fill-purple-800 dark:fill-purple-300 text-[9.5px] font-mono font-bold"
                    >
                      HTTP • HTTPS • TLS • SSH • DNS
                    </text>
                  </g>
                </g>
              </g>

              {/* Bracket 2: Heart of OSI (Layer 4 -> Y: 192 to 240) */}
              <g transform="translate(442, 0)">
                <path
                  d="M 0 194 H 8 V 208 H 18 V 224 H 8 V 238 H 0"
                  fill="none"
                  className="stroke-emerald-500 dark:stroke-emerald-400 stroke-[2.5px] stroke-linecap-round stroke-linejoin-round"
                />
                <g transform="translate(28, 184)">
                  <rect
                    x="0"
                    y="0"
                    width="290"
                    height="64"
                    rx="10"
                    className="fill-white/90 dark:fill-slate-900/90 stroke-emerald-200 dark:stroke-emerald-900 stroke-1 shadow-xs"
                  />
                  <text
                    x="16"
                    y="22"
                    className="fill-emerald-900 dark:fill-emerald-200 text-xs font-black uppercase tracking-wider"
                  >
                    Heart of OSI (Layer 4)
                  </text>
                  <text
                    x="16"
                    y="38"
                    className="fill-emerald-700 dark:fill-emerald-300 text-[11px] font-bold"
                  >
                    Transport & End-to-End Delivery
                  </text>
                  <text
                    x="16"
                    y="52"
                    className="fill-slate-600 dark:fill-slate-400 text-[10px]"
                  >
                    Reliable process-to-process delivery (TCP / UDP)
                  </text>
                </g>
              </g>

              {/* Bracket 3: Lower Layers (Layers 3, 2, 1 -> Y: 250 to 414) */}
              <g transform="translate(442, 0)">
                <path
                  d="M 0 254 H 8 V 322 H 18 V 342 H 8 V 410 H 0"
                  fill="none"
                  className="stroke-sky-500 dark:stroke-sky-400 stroke-[2.5px] stroke-linecap-round stroke-linejoin-round"
                />
                <g transform="translate(28, 272)">
                  <rect
                    x="0"
                    y="0"
                    width="290"
                    height="120"
                    rx="10"
                    className="fill-white/90 dark:fill-slate-900/90 stroke-sky-200 dark:stroke-sky-900 stroke-1 shadow-xs"
                  />
                  <text
                    x="16"
                    y="24"
                    className="fill-sky-900 dark:fill-sky-200 text-xs font-black uppercase tracking-wider"
                  >
                    Lower Layers (1–3)
                  </text>
                  <text
                    x="16"
                    y="42"
                    className="fill-sky-700 dark:fill-sky-300 text-[11px] font-bold"
                  >
                    Hardware & Network Transmission
                  </text>
                  <text
                    x="16"
                    y="60"
                    className="fill-slate-600 dark:fill-slate-400 text-[10px] leading-relaxed"
                  >
                    Handles logical routing, physical framing,
                  </text>
                  <text
                    x="16"
                    y="74"
                    className="fill-slate-600 dark:fill-slate-400 text-[10px] leading-relaxed"
                  >
                    bitstream signals & physical medium links.
                  </text>
                  <g transform="translate(16, 88)" className="flex gap-1">
                    <rect
                      x="0"
                      y="0"
                      width="210"
                      height="18"
                      rx="4"
                      className="fill-sky-100 dark:fill-sky-950/80 stroke-sky-200 dark:stroke-sky-800 stroke-1"
                    />
                    <text
                      x="105"
                      y="12"
                      textAnchor="middle"
                      className="fill-sky-800 dark:fill-sky-300 text-[9.5px] font-mono font-bold"
                    >
                      IP • ICMP • Ethernet • Wi-Fi • Fiber
                    </text>
                  </g>
                </g>
              </g>
            </g>
          )}

          {/* MODE 2: SUMMARY CALLOUTS VIEW */}
          {mode === "summary" && (
            <g>
              {OSI_LAYERS.map((layer, index) => {
                const yPos = 18 + index * 58;
                const isSelected = activeHighlightKey === layer.key;
                const IconComponent = layer.icon;

                return (
                  <g
                    key={layer.key}
                    className="cursor-pointer group"
                    onClick={() => handleLayerClick(layer.key)}
                  >
                    {/* Number Badge */}
                    <circle
                      cx="26"
                      cy={yPos + 24}
                      r="14"
                      style={{
                        transformOrigin: "center",
                        transformBox: "fill-box",
                      }}
                      className={`transition-all duration-200 ${
                        isSelected
                          ? "fill-primary text-primary-foreground stroke-primary stroke-2"
                          : `${layer.styles.badgeBg} stroke-white dark:stroke-slate-900 stroke-2 group-hover:scale-105`
                      }`}
                    />
                    <text
                      x="26"
                      y={yPos + 28}
                      textAnchor="middle"
                      className={`text-xs font-black select-none ${
                        isSelected
                          ? "fill-primary-foreground"
                          : layer.styles.badgeText
                      }`}
                    >
                      {layer.num}
                    </text>

                    {/* Left Compact Layer Box - Reduced width (164px) to maximize callout card space */}
                    <rect
                      x="46"
                      y={yPos}
                      width="164"
                      height="48"
                      rx="10"
                      filter={`url(#${shadowFilterId})`}
                      className={`transition-all duration-200 ${
                        isSelected
                          ? `${layer.styles.highlightBg} ${layer.styles.highlightBorder} stroke-[2.5px]`
                          : `fill-white dark:fill-slate-900 ${layer.styles.border} stroke-[1.5px] group-hover:stroke-primary/70 dark:group-hover:stroke-primary/70 group-hover:shadow-md`
                      }`}
                    />

                    {/* Bar Icon */}
                    <g
                      transform={`translate(56, ${yPos + 14})`}
                      className={layer.styles.text}
                    >
                      <IconComponent className="w-5 h-5 opacity-90" />
                    </g>

                    {/* Bar Title */}
                    <text
                      x="84"
                      y={yPos + 28}
                      className={`text-xs font-extrabold tracking-wide ${
                        isSelected
                          ? "fill-slate-950 dark:fill-slate-50 font-black"
                          : "fill-slate-800 dark:fill-slate-100"
                      }`}
                    >
                      {layer.name}
                    </text>

                    {/* Connecting Arrowhead Pointer */}
                    <line
                      x1="210"
                      y1={yPos + 24}
                      x2="246"
                      y2={yPos + 24}
                      stroke="currentColor"
                      strokeWidth={isSelected ? "2.5" : "1.5"}
                      strokeDasharray={isSelected ? undefined : "4 4"}
                      markerEnd={`url(#${arrowMarkerId})`}
                      className={`transition-colors duration-200 ${
                        isSelected
                          ? "text-primary"
                          : "text-slate-400 dark:text-slate-600"
                      }`}
                    />

                    {/* Right Callout Card Box - Expanded width 508px (ends at x=760) */}
                    <rect
                      x="252"
                      y={yPos}
                      width="508"
                      height="48"
                      rx="10"
                      className={`transition-all duration-200 ${
                        isSelected
                          ? "fill-primary/10 stroke-primary stroke-2 shadow-xs"
                          : "fill-white/90 dark:fill-slate-900/90 stroke-slate-200 dark:stroke-slate-800 stroke-1 group-hover:stroke-slate-400 dark:group-hover:stroke-slate-600"
                      }`}
                    />

                    {/* Callout Text - Spanning comfortably across 508px width without overflow */}
                    <text
                      x="266"
                      y={yPos + 21}
                      className={`text-[11px] ${
                        isSelected
                          ? "fill-primary dark:fill-primary-foreground"
                          : "fill-slate-800 dark:fill-slate-200"
                      }`}
                    >
                      <tspan className="font-extrabold">
                        {layer.summaryTitle}:{" "}
                      </tspan>
                      <tspan className="fill-slate-600 dark:fill-slate-300 font-medium">
                        {layer.summaryDesc}
                      </tspan>
                    </text>
                    <text
                      x="266"
                      y={yPos + 36}
                      className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400"
                    >
                      Unit: {layer.pdu} • Addressing: {layer.details.addressing}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* HUD OVERLAY AT TOP LEFT */}
        <div className="absolute top-3 left-3 bg-background/90 dark:bg-slate-900/90 backdrop-blur-md border rounded-xl px-3 py-1.5 flex items-center gap-3 text-xs shadow-xs z-20 transition-colors">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <Layers className="w-4 h-4 text-primary" />
            <span>
              Mode:{" "}
              {mode === "architecture"
                ? "Architecture View"
                : "Summary Callouts"}
            </span>
          </div>
          {activeLayer && (
            <div className="flex items-center gap-1.5 border-l pl-3 text-[11px] font-semibold text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Selected: {activeLayer.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM LAYER SPECIFICATION GRID CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Card 1: Overview & PDU */}
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-500" /> Layer Overview
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
              {activeLayer ? `Layer ${activeLayer.num}` : "All 7 Layers"}
            </span>
          </div>
          <h4 className="text-sm font-bold text-foreground">
            {activeLayer ? activeLayer.name : "ISO/IEC 7498-1 Standard"}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {activeLayer
              ? activeLayer.details.description
              : "Click any layer row above to inspect its protocol data unit (PDU), addressing schema, key protocols, and specific responsibilities."}
          </p>
        </div>

        {/* Card 2: Addressing & Protocols */}
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <HardDrive className="w-4 h-4 text-indigo-500" /> Addressing &
            Protocols
          </span>
          <div className="space-y-1.5">
            <div className="text-xs">
              <span className="text-muted-foreground">Addressing: </span>
              <span className="font-semibold text-foreground">
                {activeLayer
                  ? activeLayer.details.addressing
                  : "Layer-dependent"}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {(activeLayer
                ? activeLayer.details.protocols
                : ["HTTP", "TCP", "IP", "Ethernet", "SSL/TLS"]
              ).map((p) => (
                <span
                  key={p}
                  className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Key Functions */}
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Radio className="w-4 h-4 text-indigo-500" /> Primary
            Responsibilities
          </span>
          <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
            {(activeLayer
              ? activeLayer.details.keyFunctions
              : [
                  "Hierarchical peer-to-peer data abstraction",
                  "Encapsulation down stack, decapsulation up stack",
                  "Modular independence between adjacent layers",
                ]
            ).map((func, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{func}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
