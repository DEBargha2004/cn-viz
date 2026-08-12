import { useState } from "react";
import { type VizMeta } from "../types";
import { useVizState } from "../../state/useVizState";
import {
  Info,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const vizMeta: VizMeta = {
  key: "network-tcpip-vs-osi",
  title: "TCP/IP Suite Mapped to OSI",
  category: "network",
  renderer: "svg",
  animated: false,
  params: [
    {
      key: "modelView",
      type: "select",
      label: "TCP/IP Model Standard",
      default: "4-layer",
      options: [
        { label: "4-Layer Model (RFC 1122 Original)", value: "4-layer" },
        { label: "5-Layer Model (Modern Hybrid)", value: "5-layer" },
      ],
    },
    {
      key: "selectedProtocol",
      type: "select",
      label: "Highlight Protocol",
      default: "none",
      options: [
        { label: "None (Show All)", value: "none" },
        { label: "HTTP / HTTPS (App)", value: "http" },
        { label: "DNS / DHCP (App)", value: "dns" },
        { label: "TCP / UDP (Transport)", value: "tcp" },
        { label: "IP / ICMP (Internet)", value: "ip" },
        { label: "ARP / RARP (Link)", value: "arp" },
        { label: "Ethernet / Wi-Fi (Physical/Link)", value: "ethernet" },
      ],
    },
  ],
};

interface Props {
  topicId?: string;
  scope?: "local" | "chapter" | "app";
  props?: Record<string, unknown>;
  values?: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
}

interface OsiLayerInfo {
  num: number;
  key: string;
  name: string;
  badgeBg: string;
  cardBorder: string;
  cardBg: string;
  textColor: string;
  pdu: string;
  protocols: string[];
}

interface TcpIpLayerInfo {
  id: string;
  name: string;
  osiMappedText: string;
  osiMapped: number[];
  accentBorder: string;
  accentText: string;
  badgeBg: string;
  pdu: string;
  protocols: string[];
  description: string;
  rationale: string;
}

export default function TcpipVsOsi({
  topicId = "tcpip-protocol-suite",
  scope = "local",
  values: propsValues,
  onChange,
}: Props) {
  const defaults: Record<string, unknown> = {
    modelView: "4-layer",
    selectedProtocol: "none",
  };

  const [stateValues, setStateValues] = useVizState<Record<string, unknown>>(
    topicId,
    scope,
    defaults
  );
  const values = propsValues ?? stateValues;

  const modelView = (values.modelView as "4-layer" | "5-layer") || "4-layer";
  const selectedProtocol = (values.selectedProtocol as string) || "none";

  const [selectedLayerId, setSelectedLayerId] = useState<string>("app");

  const updateParam = (key: string, val: unknown) => {
    const next = { ...values, [key]: val };
    setStateValues(next);
    if (onChange) onChange(next);
  };

  // OSI 7-Layer definitions
  const osiLayers: Record<number, OsiLayerInfo> = {
    7: {
      num: 7,
      key: "l7",
      name: "Application",
      badgeBg: "bg-purple-600 dark:bg-purple-500 text-white",
      cardBorder: "border-purple-200 dark:border-purple-900/60",
      cardBg: "bg-white dark:bg-slate-900",
      textColor: "text-purple-700 dark:text-purple-300",
      pdu: "Data",
      protocols: ["HTTP", "HTTPS", "DNS", "SSH"],
    },
    6: {
      num: 6,
      key: "l6",
      name: "Presentation",
      badgeBg: "bg-indigo-600 dark:bg-indigo-500 text-white",
      cardBorder: "border-indigo-200 dark:border-indigo-900/60",
      cardBg: "bg-white dark:bg-slate-900",
      textColor: "text-indigo-700 dark:text-indigo-300",
      pdu: "Formatted Data",
      protocols: ["SSL/TLS", "JPEG", "JSON"],
    },
    5: {
      num: 5,
      key: "l5",
      name: "Session",
      badgeBg: "bg-blue-600 dark:bg-blue-500 text-white",
      cardBorder: "border-blue-200 dark:border-blue-900/60",
      cardBg: "bg-white dark:bg-slate-900",
      textColor: "text-blue-700 dark:text-blue-300",
      pdu: "Session Data",
      protocols: ["RPC", "Sockets", "PPTP"],
    },
    4: {
      num: 4,
      key: "l4",
      name: "Transport",
      badgeBg: "bg-cyan-600 dark:bg-cyan-500 text-white",
      cardBorder: "border-cyan-200 dark:border-cyan-900/60",
      cardBg: "bg-white dark:bg-slate-900",
      textColor: "text-cyan-700 dark:text-cyan-300",
      pdu: "Segment / Datagram",
      protocols: ["TCP", "UDP", "SCTP"],
    },
    3: {
      num: 3,
      key: "l3",
      name: "Network",
      badgeBg: "bg-emerald-600 dark:bg-emerald-500 text-white",
      cardBorder: "border-emerald-200 dark:border-emerald-900/60",
      cardBg: "bg-white dark:bg-slate-900",
      textColor: "text-emerald-700 dark:text-emerald-300",
      pdu: "Datagram Packet",
      protocols: ["IP", "ICMP", "IGMP"],
    },
    2: {
      num: 2,
      key: "l2",
      name: "Data Link",
      badgeBg: "bg-amber-600 dark:bg-amber-500 text-white",
      cardBorder: "border-amber-200 dark:border-amber-900/60",
      cardBg: "bg-white dark:bg-slate-900",
      textColor: "text-amber-700 dark:text-amber-300",
      pdu: "Frame",
      protocols: ["Ethernet", "Wi-Fi", "ARP"],
    },
    1: {
      num: 1,
      key: "l1",
      name: "Physical",
      badgeBg: "bg-rose-600 dark:bg-rose-500 text-white",
      cardBorder: "border-rose-200 dark:border-rose-900/60",
      cardBg: "bg-white dark:bg-slate-900",
      textColor: "text-rose-700 dark:text-rose-300",
      pdu: "Bits",
      protocols: ["RJ45 Copper", "Fiber Optics"],
    },
  };

  // TCP/IP 4-Layer (RFC 1122)
  const tcpip4Layers: TcpIpLayerInfo[] = [
    {
      id: "app",
      name: "Application Layer",
      osiMappedText: "Maps OSI L7, L6, L5",
      osiMapped: [7, 6, 5],
      accentBorder: "border-purple-300 dark:border-purple-700",
      accentText: "text-purple-600 dark:text-purple-400",
      badgeBg: "bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-800",
      pdu: "Application Payload",
      protocols: ["HTTP", "HTTPS", "DNS", "SSH", "FTP", "TLS", "Sockets"],
      description:
        "Combines OSI Layers 7 (Application), 6 (Presentation), and 5 (Session) into a single application layer. Application binaries manage formatting, serialization, and session state directly.",
      rationale:
        "Practical software libraries (e.g. OpenSSL, HTTP parsers) handle presentation formatting and session state natively, eliminating rigid OS layers.",
    },
    {
      id: "transport",
      name: "Transport Layer",
      osiMappedText: "Maps OSI L4",
      osiMapped: [4],
      accentBorder: "border-cyan-300 dark:border-cyan-700",
      accentText: "text-cyan-600 dark:text-cyan-400",
      badgeBg: "bg-cyan-100 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-200 border-cyan-300 dark:border-cyan-800",
      pdu: "Segment (TCP) / Datagram (UDP)",
      protocols: ["TCP", "UDP", "SCTP"],
      description:
        "Direct 1:1 mapping to OSI Layer 4. End-to-end process addressing via 16-bit Port numbers, error detection, flow control, and TCP byte-stream reliability.",
      rationale:
        "Decouples application logic from packet routing across intermediate networks.",
    },
    {
      id: "internet",
      name: "Internet Layer",
      osiMappedText: "Maps OSI L3",
      osiMapped: [3],
      accentBorder: "border-emerald-300 dark:border-emerald-700",
      accentText: "text-emerald-600 dark:text-emerald-400",
      badgeBg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800",
      pdu: "IP Packet",
      protocols: ["IPv4", "IPv6", "ICMP", "IGMP", "ARP"],
      description:
        "Direct 1:1 mapping to OSI Layer 3. Handles logical host IP addressing and packet routing across intermediate gateway routers.",
      rationale:
        "Connectionless best-effort IP routing allows millions of heterogeneous subnets to interconnect seamlessly.",
    },
    {
      id: "link",
      name: "Network Access / Link Layer",
      osiMappedText: "Maps OSI L2 & L1",
      osiMapped: [2, 1],
      accentBorder: "border-amber-300 dark:border-amber-700",
      accentText: "text-amber-600 dark:text-amber-400",
      badgeBg: "bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800",
      pdu: "Frame & Bitstream",
      protocols: ["Ethernet (802.3)", "Wi-Fi (802.11)", "PPP", "MAC / PHY"],
      description:
        "Combines OSI Layer 2 (Data Link) and Layer 1 (Physical). Manages hardware Network Interface Cards (NICs), physical MAC addressing, frame delimiters, and physical wire signals.",
      rationale:
        "RFC 1122 grouped physical hardware and framing so upper IP software remains independent of underlying physical hardware.",
    },
  ];

  // TCP/IP 5-Layer (Modern Hybrid)
  const tcpip5Layers: TcpIpLayerInfo[] = [
    {
      id: "app",
      name: "Application Layer",
      osiMappedText: "Maps OSI L7, L6, L5",
      osiMapped: [7, 6, 5],
      accentBorder: "border-purple-300 dark:border-purple-700",
      accentText: "text-purple-600 dark:text-purple-400",
      badgeBg: "bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-800",
      pdu: "Application Payload",
      protocols: ["HTTP", "HTTPS", "DNS", "SSH", "FTP", "TLS"],
      description:
        "Covers high-level user protocols, syntax formatting, and session setup inside user software binaries.",
      rationale:
        "Modern architecture merges OSI L5-L7 because application software natively handles formatting and TLS security.",
    },
    {
      id: "transport",
      name: "Transport Layer",
      osiMappedText: "Maps OSI L4",
      osiMapped: [4],
      accentBorder: "border-cyan-300 dark:border-cyan-700",
      accentText: "text-cyan-600 dark:text-cyan-400",
      badgeBg: "bg-cyan-100 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-200 border-cyan-300 dark:border-cyan-800",
      pdu: "Segment (TCP) / Datagram (UDP)",
      protocols: ["TCP", "UDP"],
      description:
        "Direct 1:1 mapping to OSI Layer 4. Process-to-process transport via port numbers.",
      rationale:
        "Separates application software from IP network routing.",
    },
    {
      id: "internet",
      name: "Network (Internet) Layer",
      osiMappedText: "Maps OSI L3",
      osiMapped: [3],
      accentBorder: "border-emerald-300 dark:border-emerald-700",
      accentText: "text-emerald-600 dark:text-emerald-400",
      badgeBg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800",
      pdu: "IP Packet",
      protocols: ["IPv4", "IPv6", "ICMP"],
      description:
        "Direct 1:1 mapping to OSI Layer 3. Logical IP addressing and inter-network routing.",
      rationale:
        "Universal IP datagram forwarding guarantees global internetworking.",
    },
    {
      id: "link_5",
      name: "Data Link Layer",
      osiMappedText: "Maps OSI L2",
      osiMapped: [2],
      accentBorder: "border-amber-300 dark:border-amber-700",
      accentText: "text-amber-600 dark:text-amber-400",
      badgeBg: "bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800",
      pdu: "Ethernet Frame",
      protocols: ["Ethernet", "Wi-Fi", "ARP"],
      description:
        "Direct 1:1 mapping to OSI Layer 2. Hardware MAC addressing and CRC error detection.",
      rationale:
        "Separates hardware framing (L2) from raw physical signals (L1).",
    },
    {
      id: "physical_5",
      name: "Physical Layer",
      osiMappedText: "Maps OSI L1",
      osiMapped: [1],
      accentBorder: "border-rose-300 dark:border-rose-700",
      accentText: "text-rose-600 dark:text-rose-400",
      badgeBg: "bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800",
      pdu: "Bitstream (0s and 1s)",
      protocols: ["Copper Wire", "Fiber Optics", "RF Radio"],
      description:
        "Direct 1:1 mapping to OSI Layer 1. Physical bit transmission over electrical/optical media.",
      rationale:
        "Isolates physical transmission media standards from software link-layer protocols.",
    },
  ];

  const currentTcpIpLayers =
    modelView === "4-layer" ? tcpip4Layers : tcpip5Layers;

  const activeTcpIpLayer =
    currentTcpIpLayers.find((l) => l.id === selectedLayerId) ||
    currentTcpIpLayers[0];

  // Helper to check protocol highlight matches
  const isProtocolMatch = (protocolList: string[]) => {
    if (selectedProtocol === "none") return false;
    if (selectedProtocol === "http")
      return protocolList.some((p) => ["HTTP", "HTTPS"].includes(p));
    if (selectedProtocol === "dns")
      return protocolList.some((p) => ["DNS", "DHCP"].includes(p));
    if (selectedProtocol === "tcp")
      return protocolList.some((p) => ["TCP", "UDP", "SCTP"].includes(p));
    if (selectedProtocol === "ip")
      return protocolList.some((p) =>
        ["IP", "IPv4", "IPv6", "ICMP", "IGMP"].includes(p)
      );
    if (selectedProtocol === "arp")
      return protocolList.some((p) => ["ARP", "RARP"].includes(p));
    if (selectedProtocol === "ethernet")
      return protocolList.some((p) =>
        ["Ethernet", "Wi-Fi", "Ethernet (802.3)", "Wi-Fi (802.11)", "RJ45 Copper", "Fiber Optics"].includes(p)
      );
    return false;
  };

  const renderOsiCard = (num: number) => {
    const layer = osiLayers[num];
    if (!layer) return null;
    const isMatch = isProtocolMatch(layer.protocols);

    return (
      <div
        key={layer.key}
        onClick={() => {
          if (num >= 5) setSelectedLayerId("app");
          else if (num === 4) setSelectedLayerId("transport");
          else if (num === 3) setSelectedLayerId("internet");
          else if (num === 2)
            setSelectedLayerId(modelView === "4-layer" ? "link" : "link_5");
          else
            setSelectedLayerId(modelView === "4-layer" ? "link" : "physical_5");
        }}
        className={`h-[72px] px-3 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${
          layer.cardBg
        } ${layer.cardBorder} ${
          isMatch
            ? "ring-2 ring-amber-400 dark:ring-amber-500 border-amber-400 dark:border-amber-500 bg-amber-50/40 dark:bg-amber-950/40"
            : "hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`w-8 h-8 rounded-lg text-xs font-mono font-black flex items-center justify-center shrink-0 ${layer.badgeBg}`}>
            L{layer.num}
          </span>
          <div className="min-w-0">
            <div className={`text-xs font-extrabold truncate leading-tight ${layer.textColor}`}>
              {layer.name}
            </div>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
              PDU: {layer.pdu}
            </div>
          </div>
        </div>

        <div className="text-[10px] font-mono text-right font-medium text-slate-600 dark:text-slate-400 shrink-0">
          {layer.protocols.slice(0, 2).join(", ")}
        </div>
      </div>
    );
  };

  const renderTcpIpCard = (layerId: string, hasDescription: boolean = true) => {
    const layer = currentTcpIpLayers.find((l) => l.id === layerId);
    if (!layer) return null;

    const isSelected = selectedLayerId === layer.id;
    const isMatch = isProtocolMatch(layer.protocols);

    return (
      <div
        key={layer.id}
        onClick={() => setSelectedLayerId(layer.id)}
        className={`h-full p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-1 shadow-2xs ${
          isSelected
            ? "bg-indigo-50/90 dark:bg-indigo-950/90 border-indigo-500 dark:border-indigo-600 ring-2 ring-indigo-500/30"
            : isMatch
            ? "bg-amber-50/40 dark:bg-amber-950/40 border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/30"
            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        {/* TOP LINE: TITLE & MAPPED OSI BADGE */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`text-xs sm:text-sm font-extrabold truncate ${layer.accentText}`}>
              {layer.name}
            </span>
            {isSelected && (
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            )}
          </div>
          <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded border whitespace-nowrap shrink-0 ${layer.badgeBg}`}>
            {layer.osiMappedText}
          </span>
        </div>

        {/* MIDDLE DESCRIPTION (for tall cards) */}
        {hasDescription && (
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans line-clamp-2 leading-tight my-0.5">
            {layer.description}
          </p>
        )}

        {/* BOTTOM PROTOCOL BADGES - ALWAYS AT THE BOTTOM */}
        <div className="flex flex-wrap items-center gap-1">
          {layer.protocols.map((proto) => (
            <span
              key={proto}
              className="text-[9.5px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded font-semibold whitespace-nowrap"
            >
              {proto}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none">
      {/* SUB-HEADER TOOLBAR: MODEL SWITCHER & PROTOCOL FILTER */}
      <div className="bg-card border border-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <span className="text-muted-foreground font-bold flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Filter:
          </span>
          {[
            { label: "All Protocols", val: "none" },
            { label: "HTTP/S", val: "http" },
            { label: "DNS", val: "dns" },
            { label: "TCP/UDP", val: "tcp" },
            { label: "IP/ICMP", val: "ip" },
            { label: "ARP", val: "arp" },
            { label: "Ethernet/Wi-Fi", val: "ethernet" },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => updateParam("selectedProtocol", item.val)}
              className={`px-2.5 py-1 rounded-full border transition-all shrink-0 whitespace-nowrap ${
                selectedProtocol === item.val
                  ? "bg-amber-500 text-slate-950 font-black border-amber-400 shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* MODEL SWITCHER TOGGLE */}
        <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-1 shadow-2xs font-mono text-xs shrink-0 self-start sm:self-auto">
          <button
            onClick={() => updateParam("modelView", "4-layer")}
            className={`px-3 py-1 rounded-md transition-all font-bold whitespace-nowrap ${
              modelView === "4-layer"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            4-Layer (RFC 1122)
          </button>
          <button
            onClick={() => updateParam("modelView", "5-layer")}
            className={`px-3 py-1 rounded-md transition-all font-bold whitespace-nowrap ${
              modelView === "5-layer"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            5-Layer Modern
          </button>
        </div>
      </div>

      {/* DUAL STACK MAPPING CANVAS WITH PERFECT PIXEL HEIGHT ALIGNMENT */}
      <div className="w-full border border-border rounded-xl bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-5 relative overflow-hidden shadow-inner">
        {/* Ambient Dot Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-15 dark:opacity-25 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 space-y-4">
          {/* CANVAS HEADERS */}
          <div className="grid grid-cols-12 gap-3 items-center text-xs font-mono pb-2 border-b border-slate-200 dark:border-slate-800/80">
            <div className="col-span-5 font-extrabold flex items-center justify-between text-purple-700 dark:text-purple-300">
              <span>OSI 7-LAYER REFERENCE MODEL</span>
              <span className="hidden sm:inline text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                ISO/IEC 7498-1
              </span>
            </div>

            <div className="col-span-2 text-center text-slate-500 dark:text-slate-400 text-[11px] font-bold tracking-wider uppercase">
              Mapping
            </div>

            <div className="col-span-5 font-extrabold flex items-center justify-between text-sky-700 dark:text-sky-300">
              <span>{modelView === "4-layer" ? "TCP/IP 4-LAYER SUITE" : "TCP/IP 5-LAYER HYBRID"}</span>
              <span className="hidden sm:inline text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                {modelView === "4-layer" ? "RFC 1122 Standard" : "Modern Hybrid"}
              </span>
            </div>
          </div>

          {/* PERFECT PIXEL-ALIGNED DUAL STACK LAYOUT */}
          <div className="space-y-2">
            {/* ROW BLOCK 1: L7, L6, L5 -> APPLICATION LAYER (Multi-to-One Bracket) */}
            <div className="grid grid-cols-12 gap-3 items-stretch h-[232px]">
              <div className="col-span-5 space-y-2 h-full flex flex-col justify-between">
                {renderOsiCard(7)}
                {renderOsiCard(6)}
                {renderOsiCard(5)}
              </div>

              {/* Multi-to-One Grouping Bracket */}
              <div className="col-span-2 h-full flex items-center justify-center font-mono">
                <div className="w-full h-full border-y-2 border-r-2 border-purple-400 dark:border-purple-600/80 rounded-r-2xl flex items-center justify-center p-1 bg-purple-50/40 dark:bg-purple-950/20 shadow-2xs">
                  <span className="text-[11px] font-black text-purple-700 dark:text-purple-300 flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-full border border-purple-300 dark:border-purple-800 shadow-2xs">
                    L5–L7 <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              <div className="col-span-5 h-full">
                {renderTcpIpCard("app", true)}
              </div>
            </div>

            {/* ROW BLOCK 2: L4 -> TRANSPORT LAYER (1:1 Direct Connecting Line) */}
            <div className="grid grid-cols-12 gap-3 items-stretch h-[72px]">
              <div className="col-span-5 h-full">
                {renderOsiCard(4)}
              </div>

              {/* Direct 1:1 Connecting Line */}
              <div className="col-span-2 h-full flex items-center justify-center font-mono relative">
                <div className="w-full h-0.5 bg-cyan-400/80 dark:bg-cyan-600/80" />
                <span className="absolute px-2.5 py-0.5 rounded-full text-[11px] font-black text-cyan-700 dark:text-cyan-300 bg-white dark:bg-slate-900 border border-cyan-300 dark:border-cyan-800 shadow-2xs flex items-center gap-1">
                  L4 <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="col-span-5 h-full">
                {renderTcpIpCard("transport", false)}
              </div>
            </div>

            {/* ROW BLOCK 3: L3 -> INTERNET / NETWORK LAYER (1:1 Direct Connecting Line) */}
            <div className="grid grid-cols-12 gap-3 items-stretch h-[72px]">
              <div className="col-span-5 h-full">
                {renderOsiCard(3)}
              </div>

              {/* Direct 1:1 Connecting Line */}
              <div className="col-span-2 h-full flex items-center justify-center font-mono relative">
                <div className="w-full h-0.5 bg-emerald-400/80 dark:bg-emerald-600/80" />
                <span className="absolute px-2.5 py-0.5 rounded-full text-[11px] font-black text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 shadow-2xs flex items-center gap-1">
                  L3 <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="col-span-5 h-full">
                {renderTcpIpCard("internet", false)}
              </div>
            </div>

            {/* ROW BLOCK 4: L2 & L1 -> LINK / PHYSICAL LAYERS */}
            {modelView === "4-layer" ? (
              /* 4-Layer Mode: Multi-to-One Bracket (L2 + L1 = 152px) */
              <div className="grid grid-cols-12 gap-3 items-stretch h-[152px]">
                <div className="col-span-5 space-y-2 h-full flex flex-col justify-between">
                  {renderOsiCard(2)}
                  {renderOsiCard(1)}
                </div>

                <div className="col-span-2 h-full flex items-center justify-center font-mono">
                  <div className="w-full h-full border-y-2 border-r-2 border-amber-400 dark:border-amber-600/80 rounded-r-2xl flex items-center justify-center p-1 bg-amber-50/40 dark:bg-amber-950/20 shadow-2xs">
                    <span className="text-[11px] font-black text-amber-700 dark:text-amber-300 flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-full border border-amber-300 dark:border-amber-800 shadow-2xs">
                      L1–L2 <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                <div className="col-span-5 h-full">
                  {renderTcpIpCard("link", true)}
                </div>
              </div>
            ) : (
              /* 5-Layer Mode: Direct 1:1 Connecting Lines for L2 (72px) & L1 (72px) */
              <>
                <div className="grid grid-cols-12 gap-3 items-stretch h-[72px]">
                  <div className="col-span-5 h-full">
                    {renderOsiCard(2)}
                  </div>

                  <div className="col-span-2 h-full flex items-center justify-center font-mono relative">
                    <div className="w-full h-0.5 bg-amber-400/80 dark:bg-amber-600/80" />
                    <span className="absolute px-2.5 py-0.5 rounded-full text-[11px] font-black text-amber-700 dark:text-amber-300 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 shadow-2xs flex items-center gap-1">
                      L2 <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="col-span-5 h-full">
                    {renderTcpIpCard("link_5", false)}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3 items-stretch h-[72px]">
                  <div className="col-span-5 h-full">
                    {renderOsiCard(1)}
                  </div>

                  <div className="col-span-2 h-full flex items-center justify-center font-mono relative">
                    <div className="w-full h-0.5 bg-rose-400/80 dark:bg-rose-600/80" />
                    <span className="absolute px-2.5 py-0.5 rounded-full text-[11px] font-black text-rose-700 dark:text-rose-300 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 shadow-2xs flex items-center gap-1">
                      L1 <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="col-span-5 h-full">
                    {renderTcpIpCard("physical_5", false)}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM DETAIL & EXPLANATION INSPECTION PANEL */}
      <div className="bg-white dark:bg-slate-900 border border-border rounded-xl p-4 space-y-3 font-mono text-xs text-slate-800 dark:text-slate-200 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-extrabold text-indigo-700 dark:text-indigo-300 text-sm">
              Layer Inspection: {activeTcpIpLayer.name}
            </span>
          </div>

          <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded border ${activeTcpIpLayer.badgeBg}`}>
            {activeTcpIpLayer.osiMappedText}
          </span>
        </div>

        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-xs">
          {activeTcpIpLayer.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
              Protocol Data Unit (PDU)
            </div>
            <div className="text-slate-900 dark:text-slate-100 font-extrabold">
              {activeTcpIpLayer.pdu}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
              Key Protocol Suite
            </div>
            <div className="text-slate-900 dark:text-slate-100 font-extrabold truncate">
              {activeTcpIpLayer.protocols.join(", ")}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
              Architectural Rationale
            </div>
            <div className="text-slate-700 dark:text-slate-300 text-[10.5px] font-sans leading-snug">
              {activeTcpIpLayer.rationale}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
