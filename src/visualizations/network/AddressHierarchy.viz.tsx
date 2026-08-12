import { useState } from "react";
import { type VizMeta } from "../types";
import { useVizState } from "../../state/useVizState";
import {
  Info,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Hash,
  Globe,
  HardDrive,
  Cpu,
  Network,
} from "lucide-react";

export const vizMeta: VizMeta = {
  key: "network-address-hierarchy",
  title: "Layers & Address Types in TCP/IP",
  category: "network",
  renderer: "svg",
  animated: false,
  params: [
    {
      key: "highlightAddress",
      type: "select",
      label: "Highlight Address Type",
      default: "none",
      options: [
        { label: "None (Show All)", value: "none" },
        { label: "Specific Address (Application)", value: "specific" },
        { label: "Port Address (Transport)", value: "port" },
        { label: "Logical/IP Address (Network)", value: "logical" },
        { label: "Physical/MAC Address (Link/PHY)", value: "physical" },
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

interface AddressLayerInfo {
  id: string;
  layerName: string;
  tcpipLayer: string;
  innerProtocols: string[];
  addressType: string;
  addressCategory: "specific" | "port" | "logical" | "physical";
  bitLength: string;
  scopeText: string;
  isEndToEnd: boolean;
  accentText: string;
  accentBorder: string;
  badgeBg: string;
  icon: typeof Globe;
  exampleStr: string;
  formatStr: string;
  description: string;
  rationale: string;
  headerLocation: string;
}

export default function AddressHierarchy({
  topicId = "tcpip-addressing",
  scope = "local",
  values: propsValues,
  onChange,
}: Props) {
  const defaults: Record<string, unknown> = {
    highlightAddress: "none",
  };

  const [stateValues, setStateValues] = useVizState<Record<string, unknown>>(
    topicId,
    scope,
    defaults
  );
  const values = propsValues ?? stateValues;

  const highlightAddress = (values.highlightAddress as string) || "none";
  const [selectedAddressId, setSelectedAddressId] = useState<string>("logical");

  const updateParam = (key: string, val: unknown) => {
    const next = { ...values, [key]: val };
    setStateValues(next);
    if (onChange) onChange(next);
  };

  // Exact textbook reference data matching Figure 2.18 (Forouzan)
  const addressLayers: AddressLayerInfo[] = [
    {
      id: "specific",
      layerName: "Application Layer",
      tcpipLayer: "Layer 4 / 5 — Application",
      innerProtocols: ["Processes"],
      addressCategory: "specific",
      addressType: "Specific Addresses",
      bitLength: "Variable String",
      scopeText: "User / Application Scope",
      isEndToEnd: true,
      accentText: "text-purple-600 dark:text-purple-400",
      accentBorder: "border-purple-300 dark:border-purple-700",
      badgeBg: "bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-800",
      icon: Globe,
      exampleStr: "user@example.com, https://google.com",
      formatStr: "URL, Email Address, Domain Name (FQDN), SIP URI",
      description:
        "Specific user-friendly addresses designed for high-level user software binaries and application processes. Translated into IP addresses via DNS prior to transmission.",
      rationale:
        "Human users remember alphanumeric domain names and email addresses easily, eliminating the need to memorize raw binary numeric addresses.",
      headerLocation: "Application Payload / HTTP Host Header",
    },
    {
      id: "port",
      layerName: "Transport Layer",
      tcpipLayer: "Layer 3 / 4 — Transport",
      innerProtocols: ["SCTP", "TCP", "UDP"],
      addressCategory: "port",
      addressType: "Port Addresses",
      bitLength: "16 Bits (2 Bytes)",
      scopeText: "Process-to-Process (End-to-End)",
      isEndToEnd: true,
      accentText: "text-cyan-600 dark:text-cyan-400",
      accentBorder: "border-cyan-300 dark:border-cyan-700",
      badgeBg: "bg-cyan-100 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-200 border-cyan-300 dark:border-cyan-800",
      icon: Cpu,
      exampleStr: "Port 80 (HTTP), Port 443 (HTTPS), Port 22 (SSH)",
      formatStr: "16-bit Integer range: 0 to 65535",
      description:
        "Identifies a specific running process thread on a host machine. Source and destination port numbers remain constant end-to-end from sender to receiver.",
      rationale:
        "Enables OS process multiplexing so multiple applications (Browser, Spotify, SSH) can share a single network connection simultaneously.",
      headerLocation: "TCP / UDP / SCTP Header (Bytes 0–3)",
    },
    {
      id: "logical",
      layerName: "Network Layer",
      tcpipLayer: "Layer 2 / 3 — Network (Internet)",
      innerProtocols: ["IP and other protocols"],
      addressCategory: "logical",
      addressType: "Logical Addresses",
      bitLength: "32-bit (v4) / 128-bit (v6)",
      scopeText: "Host-to-Host (End-to-End)",
      isEndToEnd: true,
      accentText: "text-emerald-600 dark:text-emerald-400",
      accentBorder: "border-emerald-300 dark:border-emerald-700",
      badgeBg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800",
      icon: HardDrive,
      exampleStr: "IPv4: 192.168.1.1 | IPv6: 2001:db8::1",
      formatStr: "Dotted-Decimal (v4) or Hexadecimal (v6)",
      description:
        "Globally unique logical software address identifying a specific host across intermediate router gateways. Source & Destination IP addresses remain constant end-to-end.",
      rationale:
        "Provides a universal global routing scheme that decouples upper application software from physical network hardware.",
      headerLocation: "IPv4 Header (Bytes 12–19) / IPv6 Header (Bytes 8–39)",
    },
    {
      id: "physical",
      layerName: "Data Link & Physical Layers",
      tcpipLayer: "Layer 1 & 2 — Link & Physical",
      innerProtocols: ["Underlying physical networks"],
      addressCategory: "physical",
      addressType: "Physical Addresses",
      bitLength: "48 Bits (6 Bytes)",
      scopeText: "Hop-to-Hop (Link-Local)",
      isEndToEnd: false,
      accentText: "text-amber-600 dark:text-amber-400",
      accentBorder: "border-amber-300 dark:border-amber-700",
      badgeBg: "bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800",
      icon: Network,
      exampleStr: "00:1A:2B:3C:4D:5E (Ethernet MAC)",
      formatStr: "Hexadecimal 6-Byte Pairs (OUI + NIC Serial)",
      description:
        "Hardware address burned into Network Interface Cards (NICs). Operates locally per link: stripped and replaced at every router hop across underlying physical networks.",
      rationale:
        "Ensures frame delivery across direct physical transmission media (Ethernet cable, Wi-Fi radio, optical fiber).",
      headerLocation: "Ethernet II Frame Header (Bytes 0–11)",
    },
  ];

  const activeAddress =
    addressLayers.find((a) => a.id === selectedAddressId) || addressLayers[2];

  const isCategoryMatched = (cat: string) => {
    if (highlightAddress === "none") return false;
    return highlightAddress === cat;
  };

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none">
      {/* SUB-HEADER TOOLBAR: HIGHLIGHT FILTER PILLS */}
      <div className="bg-card border border-border rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <span className="text-muted-foreground font-bold flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Filter Address:
          </span>
          {[
            { label: "Show All", val: "none" },
            { label: "Specific Addresses", val: "specific" },
            { label: "Port Addresses", val: "port" },
            { label: "Logical Addresses", val: "logical" },
            { label: "Physical Addresses", val: "physical" },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => updateParam("highlightAddress", item.val)}
              className={`px-2.5 py-1 rounded-full border transition-all shrink-0 whitespace-nowrap ${
                highlightAddress === item.val
                  ? "bg-amber-500 text-slate-950 font-black border-amber-400 shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* DUAL STACK ADDRESS MAPPING CANVAS WITH PERFECT PIXEL ALIGNMENT */}
      <div className="w-full border border-border rounded-xl bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-5 relative overflow-hidden shadow-inner">
        {/* Ambient Dot Grid Pattern */}
        <div
          className="absolute inset-0 opacity-15 dark:opacity-25 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 space-y-4">
          {/* HEADERS */}
          <div className="grid grid-cols-12 gap-3 items-center text-xs font-mono pb-2 border-b border-slate-200 dark:border-slate-800/80">
            <div className="col-span-5 font-extrabold flex items-center justify-between text-indigo-700 dark:text-indigo-300">
              <span>TCP/IP PROTOCOL LAYER</span>
              <span className="hidden sm:inline text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                Stack Level
              </span>
            </div>

            <div className="col-span-2 text-center text-slate-500 dark:text-slate-400 text-[11px] font-bold tracking-wider uppercase">
              Mapping
            </div>

            <div className="col-span-5 font-extrabold flex items-center justify-between text-sky-700 dark:text-sky-300">
              <span>CORRESPONDING ADDRESS TYPE</span>
              <span className="hidden sm:inline text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                Figure 2.18 Reference
              </span>
            </div>
          </div>

          {/* 4 STACK ROWS WITH 84PX EQUAL HEIGHT PARITY MATCHING FIGURE 2.18 */}
          <div className="space-y-2.5">
            {addressLayers.map((layer) => {
              const isSelected = selectedAddressId === layer.id;
              const isMatched = isCategoryMatched(layer.addressCategory);
              const LayerIcon = layer.icon;

              return (
                <div
                  key={layer.id}
                  className="grid grid-cols-12 gap-3 items-stretch h-[84px]"
                >
                  {/* LEFT: LAYER CARD */}
                  <div
                    onClick={() => setSelectedAddressId(layer.id)}
                    className={`col-span-5 h-full p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 shadow-2xs ${
                      isSelected
                        ? "bg-indigo-50/90 dark:bg-indigo-950/90 border-indigo-500 dark:border-indigo-600 ring-2 ring-indigo-500/30"
                        : isMatched
                        ? "bg-amber-50/40 dark:bg-amber-950/40 border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/30"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${layer.badgeBg}`}>
                        <LayerIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className={`text-xs sm:text-sm font-extrabold truncate ${layer.accentText}`}>
                          {layer.layerName}
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          {layer.innerProtocols.map((p) => (
                            <span
                              key={p}
                              className="text-[9.5px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded font-semibold truncate"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    )}
                  </div>

                  {/* CENTER: Sleek Direct 1:1 Connecting Line */}
                  <div className="col-span-2 h-full flex items-center justify-center font-mono relative">
                    <div className={`w-full h-0.5 ${
                      isSelected
                        ? "bg-indigo-500 dark:bg-indigo-400"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`} />
                    <span className={`absolute px-2.5 py-0.5 rounded-full text-[10.5px] font-black shadow-2xs flex items-center gap-1 border ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    }`}>
                      {layer.addressType.split(" ")[0]} <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  {/* RIGHT: ADDRESS TYPE CARD */}
                  <div
                    onClick={() => setSelectedAddressId(layer.id)}
                    className={`col-span-5 h-full p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-2xs ${
                      isSelected
                        ? "bg-indigo-50/90 dark:bg-indigo-950/90 border-indigo-500 dark:border-indigo-600 ring-2 ring-indigo-500/30"
                        : isMatched
                        ? "bg-amber-50/40 dark:bg-amber-950/40 border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/30"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-extrabold text-foreground truncate">
                        {layer.addressType}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border whitespace-nowrap shrink-0 ${
                        layer.isEndToEnd
                          ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800"
                          : "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800"
                      }`}>
                        {layer.isEndToEnd ? "End-to-End" : "Hop-to-Hop"}
                      </span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                      Size: <span className="font-bold text-foreground">{layer.bitLength}</span>
                    </div>

                    <div className="flex items-center gap-1 truncate">
                      <span className="text-[9.5px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded font-semibold truncate">
                        {layer.exampleStr}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM DETAIL & EXPLANATION INSPECTION PANEL */}
      <div className="bg-white dark:bg-slate-900 border border-border rounded-xl p-4 space-y-3 font-mono text-xs text-slate-800 dark:text-slate-200 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-extrabold text-indigo-700 dark:text-indigo-300 text-sm">
              Address Inspection: {activeAddress.addressType} ({activeAddress.layerName})
            </span>
          </div>

          <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded border ${
            activeAddress.isEndToEnd
              ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800"
              : "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800"
          }`}>
            Scope: {activeAddress.scopeText}
          </span>
        </div>

        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-xs">
          {activeAddress.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px] flex items-center gap-1">
              <Hash className="w-3 h-3" /> Size & Bit Length
            </div>
            <div className="text-slate-900 dark:text-slate-100 font-extrabold">
              {activeAddress.bitLength}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
              Representation Format
            </div>
            <div className="text-slate-900 dark:text-slate-100 font-extrabold text-[11px] truncate">
              {activeAddress.formatStr}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
              Protocol Header Location
            </div>
            <div className="text-slate-900 dark:text-slate-100 font-extrabold text-[11px] truncate">
              {activeAddress.headerLocation}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
              Architectural Rationale
            </div>
            <div className="text-slate-700 dark:text-slate-300 text-[10.5px] font-sans leading-snug">
              {activeAddress.rationale}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
