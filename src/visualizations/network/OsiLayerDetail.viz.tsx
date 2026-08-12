import { useState } from "react";
import { type VizMeta } from "../types";
import {
  Globe,
  FileCode,
  Handshake,
  ShieldCheck,
  Network,
  Binary,
  Zap,
  Layers,
  Lock,
  RefreshCw,
  Server,
  Monitor,
  Cpu,
  AlertTriangle,
  Play,
  ArrowRight,
} from "lucide-react";

export const vizMeta: VizMeta = {
  key: "network-osi-layer-detail",
  title: "OSI Layer Detail",
  category: "network",
  renderer: "svg",
  animated: false,
  params: [
    {
      key: "layer",
      type: "select",
      label: "Layer",
      default: "physical",
      options: [
        { label: "Physical (Layer 1)", value: "physical" },
        { label: "Data Link (Layer 2)", value: "data-link" },
        { label: "Network (Layer 3)", value: "network" },
        { label: "Transport (Layer 4)", value: "transport" },
        { label: "Session (Layer 5)", value: "session" },
        { label: "Presentation (Layer 6)", value: "presentation" },
        { label: "Application (Layer 7)", value: "application" },
      ],
    },
    {
      key: "showDeliveryPath",
      type: "boolean",
      label: "Show delivery path scope inset",
      default: false,
    },
  ],
};

export interface LayerFieldDef {
  name: string;
  size: string;
  desc: string;
  example: string;
  accentColor: string;
}

export interface LayerDetailConfig {
  key: string;
  num: number;
  name: string;
  shortName: string;
  groupTitle: string;
  pdu: string;
  scope: string;
  icon: typeof Globe;
  theme: {
    badgeBg: string;
    text: string;
    border: string;
    bgLight: string;
    activeTab: string;
    accentHex: string;
  };
  overview: {
    addressing: string;
    protocols: string[];
    description: string;
    keyFunctions: string[];
  };
  pduFields: LayerFieldDef[];
  mechanismTitle: string;
  mechanismDesc: string;
}

export const LAYER_CONFIGS: Record<string, LayerDetailConfig> = {
  application: {
    key: "application",
    num: 7,
    name: "Application Layer",
    shortName: "Application",
    groupTitle: "Software & User Interface",
    pdu: "Data / Message",
    scope: "End-to-End User API & Services",
    icon: Globe,
    theme: {
      badgeBg: "bg-purple-600 text-white dark:bg-purple-500",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-900/60",
      bgLight: "bg-purple-50/70 dark:bg-purple-950/40",
      activeTab: "bg-purple-600 text-white shadow-sm",
      accentHex: "#a855f7",
    },
    overview: {
      addressing: "Domain Names (FQDN) / URIs",
      protocols: ["HTTP", "HTTPS", "DNS", "SMTP", "SSH", "FTP"],
      description:
        "Provides direct network interfaces, UI protocols, and end-user services to client software like browsers, email clients, and remote terminals.",
      keyFunctions: [
        "User network interface & application protocols",
        "Directory services & domain name resolution (DNS)",
        "Email message routing & secure file transfer",
      ],
    },
    pduFields: [
      {
        name: "Method / Verb",
        size: "3-6 Bytes",
        desc: "Specifies HTTP action (GET, POST, PUT, DELETE).",
        example: "GET /api/v1/users",
        accentColor:
          "border-purple-300 dark:border-purple-800 bg-purple-500/10",
      },
      {
        name: "Host & User-Agent",
        size: "Variable",
        desc: "Target domain name & browser/client identification.",
        example: "Host: example.com",
        accentColor:
          "border-purple-300 dark:border-purple-800 bg-purple-500/10",
      },
      {
        name: "Content-Type & Auth",
        size: "Variable",
        desc: "MIME type payload specification & bearer auth token.",
        example: "application/json",
        accentColor:
          "border-purple-400 dark:border-purple-700 bg-purple-500/20",
      },
      {
        name: "Message Body (D7)",
        size: "Payload Size",
        desc: "Raw user data body or API JSON response.",
        example: "{ 'status': 'ok' }",
        accentColor:
          "border-purple-500 bg-purple-500/30 text-purple-950 dark:text-purple-100",
      },
    ],
    mechanismTitle: "Client-Server Application Protocol Request",
    mechanismDesc:
      "Client browser constructs high-level HTTP GET request and passes message payload down through local OS sockets.",
  },
  presentation: {
    key: "presentation",
    num: 6,
    name: "Presentation Layer",
    shortName: "Presentation",
    groupTitle: "Syntax & Encryption",
    pdu: "Formatted Data",
    scope: "Data Formatting, Encryption & Compression",
    icon: FileCode,
    theme: {
      badgeBg: "bg-indigo-600 text-white dark:bg-indigo-500",
      text: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-200 dark:border-indigo-900/60",
      bgLight: "bg-indigo-50/70 dark:bg-indigo-950/40",
      activeTab: "bg-indigo-600 text-white shadow-sm",
      accentHex: "#6366f1",
    },
    overview: {
      addressing: "Syntax / Encoding Handles",
      protocols: ["SSL/TLS", "JPEG", "ASCII", "MIME", "ASN.1", "GZIP"],
      description:
        "Translates data between machine-dependent formats, handles TLS encryption/decryption, and compresses payloads for optimal bandwidth.",
      keyFunctions: [
        "Character code translation (ASCII / EBCDIC / Unicode)",
        "Security encryption & decryption (TLS 1.3 / SSL)",
        "Data compression to optimize network transfer speed",
      ],
    },
    pduFields: [
      {
        name: "Encoding Header",
        size: "4 Bytes",
        desc: "Specifies character set encoding format.",
        example: "Charset=UTF-8",
        accentColor:
          "border-indigo-300 dark:border-indigo-800 bg-indigo-500/10",
      },
      {
        name: "TLS Security Tag",
        size: "16 Bytes",
        desc: "Cryptographic auth tag & IV for TLS payload integrity.",
        example: "AES-256-GCM Tag",
        accentColor:
          "border-indigo-400 dark:border-indigo-700 bg-indigo-500/20",
      },
      {
        name: "Compression Spec",
        size: "2 Bytes",
        desc: "Compression algorithm metadata dictionary.",
        example: "GZIP Deflate",
        accentColor:
          "border-indigo-300 dark:border-indigo-800 bg-indigo-500/10",
      },
      {
        name: "Formatted Payload (D6)",
        size: "Variable",
        desc: "Encrypted & compressed message payload.",
        example: "[Ciphertext Stream]",
        accentColor:
          "border-indigo-500 bg-indigo-500/30 text-indigo-950 dark:text-indigo-100",
      },
    ],
    mechanismTitle: "3-Stage Data Transformation Pipeline",
    mechanismDesc:
      "Converts application plaintext into standard UTF-8, encrypts using TLS 1.3 cipher, and compresses into lightweight payload.",
  },
  session: {
    key: "session",
    num: 5,
    name: "Session Layer",
    shortName: "Session",
    groupTitle: "Dialog & State Management",
    pdu: "Dialog Data",
    scope: "Host Session Checkpointing & Dialog Control",
    icon: Handshake,
    theme: {
      badgeBg: "bg-violet-600 text-white dark:bg-violet-500",
      text: "text-violet-600 dark:text-violet-400",
      border: "border-violet-200 dark:border-violet-900/60",
      bgLight: "bg-violet-50/70 dark:bg-violet-950/40",
      activeTab: "bg-violet-600 text-white shadow-sm",
      accentHex: "#8b5cf6",
    },
    overview: {
      addressing: "Session IDs & Token Handles",
      protocols: ["NetBIOS", "RPC", "PPTP", "Sockets", "NFS"],
      description:
        "Establishes, maintains, synchronizes, and gracefully terminates active communication dialogs between hosts.",
      keyFunctions: [
        "Dialog control (half-duplex or full-duplex session modes)",
        "Session checkpointing & synchronization for long file transfers",
        "Automatic connection recovery from last validated checkpoint",
      ],
    },
    pduFields: [
      {
        name: "Session Token ID",
        size: "8 Bytes",
        desc: "Unique identifier matching active host session.",
        example: "SESS_ID: 0x9F41C200",
        accentColor:
          "border-violet-300 dark:border-violet-800 bg-violet-500/10",
      },
      {
        name: "Dialog Mode Flag",
        size: "1 Byte",
        desc: "Controls dialog direction (Full-Duplex / Half-Duplex).",
        example: "Full-Duplex (0x02)",
        accentColor:
          "border-violet-300 dark:border-violet-800 bg-violet-500/10",
      },
      {
        name: "Sync Checkpoint Mark",
        size: "4 Bytes",
        desc: "Synchronization marker for stream recovery.",
        example: "Sync Pt #4 (4096B)",
        accentColor:
          "border-violet-400 dark:border-violet-700 bg-violet-500/20",
      },
      {
        name: "Session Data (D5)",
        size: "Variable",
        desc: "Payload wrapped with active session tokens.",
        example: "[Dialog Stream]",
        accentColor:
          "border-violet-500 bg-violet-500/30 text-violet-950 dark:text-violet-100",
      },
    ],
    mechanismTitle: "Session Checkpoint & Recovery Timeline",
    mechanismDesc:
      "Inserts sync points into long data streams. If network drops, transmission resumes from the last validated checkpoint rather than restarting.",
  },
  transport: {
    key: "transport",
    num: 4,
    name: "Transport Layer",
    shortName: "Transport",
    groupTitle: "Process Delivery (Heart of OSI)",
    pdu: "Segment / Datagram",
    scope: "End-to-End Process-to-Process Delivery",
    icon: ShieldCheck,
    theme: {
      badgeBg: "bg-emerald-600 text-white dark:bg-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-900/60",
      bgLight: "bg-emerald-50/70 dark:bg-emerald-950/40",
      activeTab: "bg-emerald-600 text-white shadow-sm",
      accentHex: "#10b981",
    },
    overview: {
      addressing: "Port Numbers (16-bit: e.g. Port 80, 443, 51234)",
      protocols: ["TCP", "UDP", "SCTP"],
      description:
        "Ensures complete end-to-end data delivery from source process to destination process across networks with error and flow control.",
      keyFunctions: [
        "Service-Point (Port) addressing for host process multiplexing",
        "Segmentation & sequence reassembly of long messages",
        "Reliable connection control, sliding window flow control & ACKs",
      ],
    },
    pduFields: [
      {
        name: "Source Port",
        size: "16 Bits",
        desc: "Identifies sending process on Host A.",
        example: "51234 (Ephemeral)",
        accentColor:
          "border-emerald-300 dark:border-emerald-800 bg-emerald-500/10",
      },
      {
        name: "Destination Port",
        size: "16 Bits",
        desc: "Identifies target process daemon on Host B.",
        example: "443 (HTTPS)",
        accentColor:
          "border-emerald-400 dark:border-emerald-700 bg-emerald-500/20",
      },
      {
        name: "Seq & Ack Numbers",
        size: "64 Bits",
        desc: "Ensures in-order arrival & receipt acknowledgment.",
        example: "Seq: 1001, Ack: 501",
        accentColor:
          "border-emerald-300 dark:border-emerald-800 bg-emerald-500/10",
      },
      {
        name: "Flags & Window",
        size: "32 Bits",
        desc: "TCP state flags (SYN/ACK) & sliding window size.",
        example: "SYN, ACK • Win: 64k",
        accentColor:
          "border-emerald-300 dark:border-emerald-800 bg-emerald-500/10",
      },
      {
        name: "Segment Payload (D4)",
        size: "Variable",
        desc: "Upper layer message segment.",
        example: "[TCP Payload]",
        accentColor:
          "border-emerald-500 bg-emerald-500/30 text-emerald-950 dark:text-emerald-100",
      },
    ],
    mechanismTitle: "TCP 3-Way Handshake & Port Multiplexing",
    mechanismDesc:
      "Maps network packets to specific application processes using 16-bit ports and maintains reliable delivery via sequence ACKs.",
  },
  network: {
    key: "network",
    num: 3,
    name: "Network Layer",
    shortName: "Network",
    groupTitle: "Hardware & Routing",
    pdu: "Packet / Datagram",
    scope: "Source-to-Destination Host Routing",
    icon: Network,
    theme: {
      badgeBg: "bg-sky-600 text-white dark:bg-sky-500",
      text: "text-sky-600 dark:text-sky-400",
      border: "border-sky-200 dark:border-sky-900/60",
      bgLight: "bg-sky-50/70 dark:bg-sky-950/40",
      activeTab: "bg-sky-600 text-white shadow-sm",
      accentHex: "#0ea5e9",
    },
    overview: {
      addressing: "Logical IP Address (IPv4: 32-bit / IPv6: 128-bit)",
      protocols: ["IP (IPv4/IPv6)", "ICMP", "IGMP", "OSPF", "BGP"],
      description:
        "Routes packets across distinct interconnected networks from origin source host to final destination host.",
      keyFunctions: [
        "Logical source-to-destination host addressing (IP addresses)",
        "Optimal routing path selection through intermediate routers",
        "Packetizing, datagram encapsulation & MTU fragmentation",
      ],
    },
    pduFields: [
      {
        name: "Version & IHL",
        size: "32 Bits",
        desc: "IP version (IPv4) & header byte length.",
        example: "IPv4 • IHL: 20 Bytes",
        accentColor: "border-sky-300 dark:border-sky-800 bg-sky-500/10",
      },
      {
        name: "Source IP Address",
        size: "32 Bits",
        desc: "Logical IP address of original sending host.",
        example: "192.168.1.10",
        accentColor: "border-sky-300 dark:border-sky-800 bg-sky-500/10",
      },
      {
        name: "Destination IP Address",
        size: "32 Bits",
        desc: "Logical IP address of final target host.",
        example: "142.250.190.46",
        accentColor: "border-sky-400 dark:border-sky-700 bg-sky-500/20",
      },
      {
        name: "TTL & Protocol",
        size: "32 Bits",
        desc: "Time-To-Live hop limit & encapsulated protocol code.",
        example: "TTL: 64 • Protocol: 6 (TCP)",
        accentColor: "border-sky-300 dark:border-sky-800 bg-sky-500/10",
      },
      {
        name: "Packet Payload (D3)",
        size: "Variable",
        desc: "Encapsulated Transport Layer segment.",
        example: "[IP Payload]",
        accentColor:
          "border-sky-500 bg-sky-500/30 text-sky-950 dark:text-sky-100",
      },
    ],
    mechanismTitle: "Logical IP Routing & Router Hop Traversal",
    mechanismDesc:
      "Inspects destination IP in header (H3), queries router routing tables, and decrements TTL at each intermediate router hop.",
  },
  "data-link": {
    key: "data-link",
    num: 2,
    name: "Data Link Layer",
    shortName: "Data Link",
    groupTitle: "Hardware & Link Framing",
    pdu: "Frame",
    scope: "Node-to-Node (Hop-to-Hop) Frame Delivery",
    icon: Binary,
    theme: {
      badgeBg: "bg-amber-600 text-white dark:bg-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-900/60",
      bgLight: "bg-amber-50/70 dark:bg-amber-950/40",
      activeTab: "bg-amber-600 text-white shadow-sm",
      accentHex: "#f59e0b",
    },
    overview: {
      addressing: "Physical MAC Address (48-bit: e.g. 00:1A:2B:3C:4D:5E)",
      protocols: ["Ethernet (802.3)", "Wi-Fi (802.11)", "PPP", "ARP", "HDLC"],
      description:
        "Transforms a raw physical transmission channel into a reliable hop-to-hop link, handling framing and hardware MAC addressing.",
      keyFunctions: [
        "Framing: Encapsulating bitstream with MAC header (H2) and CRC trailer (T2)",
        "Physical hardware MAC addressing for adjacent node delivery",
        "Error detection using Cyclic Redundancy Check (CRC-32) trailer",
      ],
    },
    pduFields: [
      {
        name: "Preamble & SFD",
        size: "8 Bytes",
        desc: "Bit sync pattern ending in Start Frame Delimiter.",
        example: "10101010…10101011",
        accentColor: "border-amber-300 dark:border-amber-800 bg-amber-500/10",
      },
      {
        name: "Destination MAC",
        size: "6 Bytes",
        desc: "Hardware MAC address of immediate next hop.",
        example: "00:1A:2B:3C:4D:5E",
        accentColor: "border-amber-400 dark:border-amber-700 bg-amber-500/20",
      },
      {
        name: "Source MAC",
        size: "6 Bytes",
        desc: "Hardware MAC address of sending network interface.",
        example: "AA:BB:CC:DD:EE:FF",
        accentColor: "border-amber-300 dark:border-amber-800 bg-amber-500/10",
      },
      {
        name: "EtherType / Length",
        size: "2 Bytes",
        desc: "Protocol identifier for network layer payload.",
        example: "0x0800 (IPv4)",
        accentColor: "border-amber-300 dark:border-amber-800 bg-amber-500/10",
      },
      {
        name: "Frame Payload (D2)",
        size: "46-1500 B",
        desc: "Encapsulated Network Layer packet.",
        example: "[Ethernet Payload]",
        accentColor: "border-amber-500 bg-amber-500/20",
      },
      {
        name: "FCS Trailer (CRC)",
        size: "4 Bytes",
        desc: "Frame Check Sequence polynomial for error check.",
        example: "0x7F2B10A4 (CRC-32)",
        accentColor:
          "border-amber-600 bg-amber-600/30 text-amber-950 dark:text-amber-100",
      },
    ],
    mechanismTitle: "Ethernet Framing & CRC Error Control Inspection",
    mechanismDesc:
      "Prepends physical MAC addresses for adjacent node delivery and appends CRC-32 trailer (T2) to detect corrupted bits on physical wire.",
  },
  physical: {
    key: "physical",
    num: 1,
    name: "Physical Layer",
    shortName: "Physical",
    groupTitle: "Hardware & Media Signal",
    pdu: "Bit Stream",
    scope: "Physical Medium Transmission (Copper/Fiber/Radio)",
    icon: Zap,
    theme: {
      badgeBg: "bg-rose-600 text-white dark:bg-rose-500",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-200 dark:border-rose-900/60",
      bgLight: "bg-rose-50/70 dark:bg-rose-950/40",
      activeTab: "bg-rose-600 text-white shadow-sm",
      accentHex: "#f43f5e",
    },
    overview: {
      addressing: "None (Electrical Voltages / Light Pulses / Radio Frequency)",
      protocols: ["RS-232", "100BASE-TX", "1000BASE-T", "802.11 PHY", "SONET"],
      description:
        "Transmits raw uninterpreted bitstreams (0s and 1s) over physical copper wire, optical glass fiber, or wireless radio spectrum.",
      keyFunctions: [
        "Bit representation: Voltage levels (+5V / 0V) or light pulses for bits",
        "Data rate control: Defines transmission speed (bits per second / Gbps)",
        "Bit clock synchronization & physical interface connector specs",
      ],
    },
    pduFields: [
      {
        name: "Clock Sync Pulse",
        size: "Preamble",
        desc: "Synchronizes sender and receiver clock rate.",
        example: "Clock Signal (10 MHz)",
        accentColor: "border-rose-300 dark:border-rose-800 bg-rose-500/10",
      },
      {
        name: "Line Encoding",
        size: "Bit Level",
        desc: "Converts binary 0s/1s to physical signal steps.",
        example: "Manchester / NRZ-I",
        accentColor: "border-rose-400 dark:border-rose-700 bg-rose-500/20",
      },
      {
        name: "Signal Bitstream",
        size: "Continuous",
        desc: "Raw binary bit sequence flowing across medium.",
        example: "1 0 1 1 0 0 1 0",
        accentColor: "border-rose-300 dark:border-rose-800 bg-rose-500/10",
      },
      {
        name: "Medium Hardware",
        size: "Physical",
        desc: "Cable impedance, pinouts & frequency specs.",
        example: "UTP Cat6 / 2.4GHz WiFi",
        accentColor:
          "border-rose-500 bg-rose-500/30 text-rose-950 dark:text-rose-100",
      },
    ],
    mechanismTitle: "Digital Signal Line Encoding & Physical Transit",
    mechanismDesc:
      "Converts raw 0s and 1s into discrete electrical voltage steps or optical light flashes moving physically across communication media.",
  },
};

interface Props {
  layer?: string;
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
}

export default function OsiLayerDetail({
  layer: propLayer,
  values,
  onChange,
}: Props) {
  const selectedLayerKey = (values?.layer as string) || propLayer || "physical";
  const showDeliveryPath = Boolean(values?.showDeliveryPath ?? false);

  const activeLayer = LAYER_CONFIGS[selectedLayerKey] || LAYER_CONFIGS.physical;

  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(
    null,
  );

  // Layer 2 CRC Error Simulation state
  const [crcCorrupted, setCrcCorrupted] = useState<boolean>(false);

  // Layer 3 Router Hop step state
  const [routerHopStep, setRouterHopStep] = useState<number>(0);

  // Layer 5 Session Checkpoint failure state
  const [sessionFailed, setSessionFailed] = useState<boolean>(false);

  // Layer 1 Physical Display Mode (Graph vs Volts)
  const [phyDisplayMode, setPhyDisplayMode] = useState<"graph" | "volts">(
    "graph",
  );

  // Layer 4 Transport Protocol (TCP vs UDP) and Handshake Step
  const [transportProtocol, setTransportProtocol] = useState<"tcp" | "udp">(
    "tcp",
  );
  const [tcpHandshakeStep, setTcpHandshakeStep] = useState<number>(0);

  // Layer 3 Network Sub-mode & Traceroute TTL state
  const [netSubMode, setNetSubMode] = useState<
    "routing" | "header" | "traceroute"
  >("routing");
  const [tracerouteTtl, setTracerouteTtl] = useState<number>(1);
  const [selectedIpHeaderField, setSelectedIpHeaderField] = useState<
    string | null
  >("ttl");

  // Layer 2 Data Link Sub-mode, Header Field & ARP state
  const [dataLinkSubMode, setDataLinkSubMode] = useState<
    "frame" | "crc" | "arp"
  >("frame");
  const [selectedMacHeaderField, setSelectedMacHeaderField] = useState<
    string | null
  >("dst_mac");
  const [arpStep, setArpStep] = useState<number>(0);

  const handleSelectLayerTab = (key: string) => {
    setSelectedFieldIndex(null);
    setCrcCorrupted(false);
    setRouterHopStep(0);
    setSessionFailed(false);
    setPhyDisplayMode("graph");
    setTransportProtocol("tcp");
    setTcpHandshakeStep(0);
    setNetSubMode("routing");
    setTracerouteTtl(1);
    setSelectedIpHeaderField("ttl");
    setDataLinkSubMode("frame");
    setSelectedMacHeaderField("dst_mac");
    setArpStep(0);

    if (onChange) {
      onChange({
        ...values,
        layer: key,
      });
    }
  };

  const IconComponent = activeLayer.icon;

  const allLayers = [
    LAYER_CONFIGS.application,
    LAYER_CONFIGS.presentation,
    LAYER_CONFIGS.session,
    LAYER_CONFIGS.transport,
    LAYER_CONFIGS.network,
    LAYER_CONFIGS["data-link"],
    LAYER_CONFIGS.physical,
  ];

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none">
      {/* 1. TOP SEGMENTED LAYER TABS */}
      <div className="bg-muted/60 p-1.5 rounded-xl border border-border flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2 px-2 py-1 text-xs font-extrabold text-foreground">
          <Layers className="w-4 h-4 text-primary" />
          <span>OSI Layer:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {allLayers.map((item) => {
            const isSelected = item.key === activeLayer.key;
            return (
              <button
                key={item.key}
                onClick={() => handleSelectLayerTab(item.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? `${item.theme.activeTab} scale-105 shadow-xs`
                    : "bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground border border-border/40"
                }`}
              >
                <span className="font-mono text-[10.5px] opacity-90">
                  L{item.num}
                </span>
                <span className="hidden sm:inline">{item.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. LAYER HERO SUMMARY CARD */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border ${activeLayer.theme.border} ${activeLayer.theme.bgLight} transition-all duration-300 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          {/* Layer Number Badge */}
          <div
            className={`w-12 h-12 rounded-xl ${activeLayer.theme.badgeBg} flex items-center justify-center font-black text-xl shadow-md shrink-0`}
          >
            {activeLayer.num}
          </div>

          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <IconComponent className={`w-5 h-5 ${activeLayer.theme.text}`} />
              <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                {activeLayer.name}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-background/80 border border-border text-muted-foreground">
                {activeLayer.groupTitle}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-extrabold text-foreground bg-background px-2.5 py-0.5 rounded-md border border-border shadow-2xs font-mono">
                PDU: {activeLayer.pdu}
              </span>
              <span className="text-muted-foreground font-medium">
                Scope:{" "}
                <strong className="text-foreground">{activeLayer.scope}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Protocols Chip */}
        <div className="bg-background/90 border border-border p-3 rounded-xl min-w-[200px] text-xs space-y-1 shadow-2xs">
          <div className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">
            Key Standards & Protocols:
          </div>
          <div className="font-mono font-extrabold text-primary flex flex-wrap gap-1">
            {activeLayer.overview.protocols.map((p) => (
              <span
                key={p}
                className="bg-muted px-1.5 py-0.5 rounded border border-border text-[11px]"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. PDU HEADER STRUCTURE INSPECTOR GRID */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
          <div className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>PDU Header Layout Structure — {activeLayer.pdu}</span>
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            (Click any field card below to inspect parameters)
          </div>
        </div>

        {/* Fields Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {activeLayer.pduFields.map((field, idx) => {
            const isSelected = selectedFieldIndex === idx;
            return (
              <div
                key={`pdu-field-${idx}`}
                onClick={() => setSelectedFieldIndex(isSelected ? null : idx)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${field.accentColor} ${
                  isSelected
                    ? "ring-2 ring-primary border-primary shadow-md scale-102"
                    : "hover:border-primary/50"
                }`}
              >
                <div className="text-xs font-black text-foreground truncate">
                  {field.name}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground font-semibold mt-0.5">
                  [{field.size}]
                </div>
                <div className="text-[10.5px] font-mono font-bold text-primary truncate mt-1 bg-background/80 px-1.5 py-0.5 rounded border border-border/40">
                  {field.example}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Field Detail Inspector Panel */}
        <div className="bg-muted/40 border border-border rounded-xl p-3 text-xs transition-all min-h-[50px] flex items-center">
          {selectedFieldIndex !== null ? (
            <div className="space-y-1">
              <div className="font-extrabold text-foreground flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground font-mono text-[10px]">
                  {activeLayer.pduFields[selectedFieldIndex].name}
                </span>
                <span>{activeLayer.pduFields[selectedFieldIndex].desc}</span>
              </div>
              <div className="font-mono text-muted-foreground">
                Example value:{" "}
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {activeLayer.pduFields[selectedFieldIndex].example}
                </span>{" "}
                • Field Size:{" "}
                <span className="font-bold">
                  {activeLayer.pduFields[selectedFieldIndex].size}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground font-medium italic">
              {activeLayer.overview.description}
            </div>
          )}
        </div>
      </div>

      {/* 4. CUSTOM STANDALONE OPERATIONAL MECHANISM VISUAL SVG CANVAS */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
          <div className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Operational Mechanism — {activeLayer.mechanismTitle}</span>
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            {activeLayer.mechanismDesc}
          </div>
        </div>

        {/* Interactive SVG Canvas Container */}
        <div className="w-full border border-border rounded-xl bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-3 sm:p-5 relative overflow-hidden shadow-inner min-h-[220px] flex flex-col justify-center">
          {/* Ambient Dot Grid Pattern */}
          <div
            className="absolute inset-0 opacity-15 dark:opacity-25 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* L7 APPLICATION: Client-Server HTTP GET Request/Response */}
          {activeLayer.key === "application" && (
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 py-2">
              <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/60 p-3.5 rounded-xl text-xs space-y-2 w-full md:w-[220px]">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-extrabold">
                  <Monitor className="w-4 h-4" />
                  <span>Web Browser Client</span>
                </div>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-300 bg-slate-100 dark:bg-slate-950 p-2 rounded border border-purple-200 dark:border-purple-900/40">
                  GET /index.html HTTP/1.1
                  <br />
                  Host: example.com
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 flex-1 w-full">
                <div className="flex items-center gap-2 w-full justify-center">
                  <div className="h-[2px] bg-purple-500 flex-1 max-w-[140px]" />
                  <span className="bg-purple-600 text-white px-2.5 py-1 rounded-full text-[10px] font-mono font-bold">
                    HTTP Request (Port 80)
                  </span>
                  <ArrowRight className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                </div>
                <div className="flex items-center gap-2 w-full justify-center">
                  <ArrowRight className="w-4 h-4 text-purple-500 dark:text-purple-400 rotate-180" />
                  <span className="bg-purple-100 dark:bg-purple-950 border border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold">
                    HTTP 200 OK (HTML Response)
                  </span>
                  <div className="h-[2px] bg-purple-500/60 flex-1 max-w-[140px]" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/60 p-3.5 rounded-xl text-xs space-y-2 w-full md:w-[220px]">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-extrabold">
                  <Server className="w-4 h-4" />
                  <span>Web Server Host</span>
                </div>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-300 bg-slate-100 dark:bg-slate-950 p-2 rounded border border-purple-200 dark:border-purple-900/40">
                  HTTP/1.1 200 OK
                  <br />
                  Content-Type: text/html
                </div>
              </div>
            </div>
          )}

          {/* L6 PRESENTATION: 3-Stage Transformation Pipeline */}
          {activeLayer.key === "presentation" && (
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3 py-2">
              <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/60 p-3.5 rounded-xl space-y-2 text-xs">
                <div className="font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <span>1. Syntax Translation</span>
                </div>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-300 bg-slate-100 dark:bg-slate-950 p-2 rounded border border-indigo-200 dark:border-indigo-900/40">
                  ASCII / EBCDIC -&gt; UTF-8
                  <br />
                  <span className="text-slate-500 dark:text-slate-400">"Hello World"</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/60 p-3.5 rounded-xl space-y-2 text-xs">
                <div className="font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>2. TLS 1.3 Encryption</span>
                </div>
                <div className="font-mono text-[10px] text-indigo-900 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/80 p-2 rounded border border-indigo-200 dark:border-indigo-700">
                  AES-256-GCM Ciphertext
                  <br />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    0x9F41C200…
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/60 p-3.5 rounded-xl space-y-2 text-xs">
                <div className="font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <span>3. GZIP Compression</span>
                </div>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-300 bg-slate-100 dark:bg-slate-950 p-2 rounded border border-indigo-200 dark:border-indigo-900/40">
                  Deflate Dictionary
                  <br />
                  <span className="text-indigo-600 dark:text-indigo-300">
                    Ratio: 3.2:1 (Compressed)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* L5 SESSION: Dialog Checkpoints & Recovery Stream */}
          {activeLayer.key === "session" && (
            <div className="relative z-10 space-y-4 py-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-xs font-mono text-violet-700 dark:text-violet-300 font-bold">
                  Active Session Stream (File Transfer 8192 Bytes)
                </div>
                <button
                  onClick={() => setSessionFailed(!sessionFailed)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                    sessionFailed
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "bg-violet-100 dark:bg-violet-900 hover:bg-violet-200 dark:hover:bg-violet-800 text-violet-900 dark:text-violet-100 border border-violet-300 dark:border-violet-700"
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>
                    {sessionFailed
                      ? "Resume from Sync #2 (4096B)"
                      : "Simulate Connection Drop @ 4500B"}
                  </span>
                </button>
              </div>

              <div className="relative bg-white dark:bg-slate-950 p-4 rounded-xl border border-violet-200 dark:border-violet-900/50 space-y-4 font-mono">
                {/* Progress Bar Container with Exact Checkpoint Pins */}
                <div className="relative pt-6 pb-2">
                  {/* Base Track */}
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-full relative">
                    {/* Filled Progress Bar */}
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        sessionFailed
                          ? "bg-amber-500 w-[50%]"
                          : "bg-violet-500 w-[75%]"
                      }`}
                    />

                    {/* Checkpoint Pin Markers on the Bar */}
                    <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
                      {/* Sync #1 at 25% (2048B) */}
                      <div className="absolute left-[25%] -translate-x-1/2 flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-violet-600 dark:bg-violet-300 border border-white dark:border-slate-900 shadow-xs" />
                      </div>
                      {/* Sync #2 at 50% (4096B) */}
                      <div className="absolute left-[50%] -translate-x-1/2 flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full border border-white dark:border-slate-900 shadow-xs ${
                            sessionFailed
                              ? "bg-amber-400 ring-2 ring-amber-500/50"
                              : "bg-violet-600 dark:bg-violet-300"
                          }`}
                        />
                      </div>
                      {/* Sync #3 at 75% (6144B) */}
                      <div className="absolute left-[75%] -translate-x-1/2 flex flex-col items-center">
                        <div
                          className={`w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900 shadow-xs ${
                            sessionFailed ? "bg-slate-400 dark:bg-slate-700" : "bg-violet-600 dark:bg-violet-300"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Drop Point Marker (when failed, at 55% / 4500B) */}
                  {sessionFailed && (
                    <div className="absolute left-[55%] top-0 -translate-x-1/2 flex flex-col items-center">
                      <span className="text-[9px] font-black text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-1.5 py-0.5 rounded border border-rose-300 dark:border-rose-700">
                        DROP @ 4500B
                      </span>
                      <div className="w-0.5 h-3 bg-rose-500" />
                    </div>
                  )}
                </div>

                {/* Checkpoint Labels Positioned at Exact Percentages */}
                <div className="relative h-7 text-[10px]">
                  <div className="absolute left-[25%] -translate-x-1/2 text-center">
                    <span className="text-violet-700 dark:text-violet-300 font-bold">Sync #1</span>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">2048B ✓</div>
                  </div>

                  <div className="absolute left-[50%] -translate-x-1/2 text-center">
                    <span
                      className={`font-bold ${
                        sessionFailed ? "text-amber-600 dark:text-amber-400" : "text-violet-700 dark:text-violet-300"
                      }`}
                    >
                      Sync #2 (Checkpoint)
                    </span>
                    <div
                      className={`text-[9px] ${
                        sessionFailed
                          ? "text-amber-700 dark:text-amber-300 font-bold"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      4096B {sessionFailed ? "(Recovered)" : "✓"}
                    </div>
                  </div>

                  <div className="absolute left-[75%] -translate-x-1/2 text-center">
                    <span
                      className={`font-bold ${
                        sessionFailed
                          ? "text-slate-400 dark:text-slate-500 line-through"
                          : "text-violet-700 dark:text-violet-300"
                      }`}
                    >
                      Sync #3
                    </span>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">
                      6144B {sessionFailed ? "❌" : "✓"}
                    </div>
                  </div>
                </div>

                {/* Description Console */}
                <div className="text-xs p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-900/80 border-violet-200 dark:border-violet-900/40 text-slate-800 dark:text-slate-300">
                  {sessionFailed ? (
                    <span className="text-amber-800 dark:text-amber-300">
                      <strong>Connection Interrupted at 4500B:</strong> 404 bytes transmitted after 4096B were lost. Session Layer rolls back stream pointer to <strong>Sync #2 (4096B Checkpoint)</strong>, saving the first 4096B without restarting from 0B.
                    </span>
                  ) : (
                    <span className="text-violet-900 dark:text-violet-200">
                      <strong>Session State Active:</strong> Sync #1 (2048B), Sync #2 (4096B), and Sync #3 (6144B) checkpointed. Stream currently at 6144B (75% completed).
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* L4 TRANSPORT: TCP 3-Way Handshake & UDP Datagram Inspector */}
          {activeLayer.key === "transport" && (
            <div className="relative z-10 space-y-4 py-2">
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                <div className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                  Transport Layer Protocol Operations & Multiplexing
                </div>

                {/* TCP vs UDP PROTOCOL TOGGLE */}
                <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-emerald-900/60 flex items-center gap-1 shadow-2xs font-mono">
                  <button
                    onClick={() => {
                      setTransportProtocol("tcp");
                      setTcpHandshakeStep(0);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                      transportProtocol === "tcp"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    TCP (Connection)
                  </button>
                  <button
                    onClick={() => {
                      setTransportProtocol("udp");
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                      transportProtocol === "udp"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    UDP (Datagram)
                  </button>
                </div>
              </div>

              {transportProtocol === "tcp" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <span className="font-mono text-emerald-700 dark:text-emerald-300 text-[11px]">
                      TCP 3-Way Handshake Sequence & State Machine
                    </span>
                    <button
                      onClick={() =>
                        setTcpHandshakeStep((prev) => (prev + 1) % 3)
                      }
                      className="px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-900 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-900 dark:text-emerald-100 text-xs font-bold border border-emerald-300 dark:border-emerald-700 transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>
                        Advance Handshake Step ({tcpHandshakeStep + 1}/3)
                      </span>
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row items-stretch justify-between gap-3 text-xs">
                    {/* CLIENT HOST A CARD */}
                    <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 p-3 rounded-xl space-y-2 w-full md:w-[220px]">
                      <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-extrabold">
                        <div className="flex items-center gap-1.5">
                          <Cpu className="w-4 h-4" />
                          <span>Client Host A</span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                          192.168.1.10
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 p-2 rounded border border-emerald-200 dark:border-emerald-700 space-y-1">
                        <div>Src Port: <strong>51234</strong></div>
                        <div className="text-[10px] text-slate-700 dark:text-slate-300">
                          State:{" "}
                          <strong className="text-emerald-600 dark:text-emerald-400">
                            {tcpHandshakeStep === 0
                              ? "SYN_SENT"
                              : tcpHandshakeStep === 1
                                ? "SYN_RCVD / ACK_PENDING"
                                : "ESTABLISHED"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* CENTER HANDSHAKE SEGMENT INSPECTOR WITH VISUAL DIRECTION INDICATORS */}
                    <div className="flex-1 bg-white dark:bg-slate-950 border border-emerald-200 dark:border-emerald-900/60 p-3.5 rounded-xl flex flex-col justify-between gap-2.5 font-mono text-center relative overflow-hidden">
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold border-b border-emerald-200 dark:border-emerald-900/40 pb-1.5 flex items-center justify-center gap-1.5">
                        <span>Active TCP Segment Flight Path</span>
                      </div>

                      {/* DIRECTION & SEGMENT FLIGHT VISUALIZER */}
                      <div className="py-1 px-1 space-y-2">
                        {tcpHandshakeStep === 0 && (
                          <div className="space-y-2">
                            {/* Direction Indicator Bar: Client -> Server */}
                            <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">Host A</span>
                              <div className="flex-1 h-[2px] bg-emerald-500 relative flex items-center justify-end">
                                <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 -mr-1" />
                              </div>
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Host B</span>
                            </div>

                            <div className="inline-block bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs">
                              [SYN] Flag • Client → Server Request
                            </div>
                            <div className="text-[11px] text-slate-700 dark:text-slate-300">
                              Seq: <strong className="text-emerald-600 dark:text-emerald-400">1000</strong> • Ack: <strong className="text-slate-400 dark:text-slate-500">0</strong> • Win: <strong className="text-slate-700 dark:text-slate-300">64240</strong>
                            </div>
                          </div>
                        )}

                        {tcpHandshakeStep === 1 && (
                          <div className="space-y-2">
                            {/* Direction Indicator Bar: Server -> Client */}
                            <div className="flex items-center justify-center gap-2 text-teal-600 dark:text-teal-400">
                              <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold">Host A</span>
                              <div className="flex-1 h-[2px] bg-teal-500 relative flex items-center justify-start">
                                <ArrowRight className="w-4 h-4 text-teal-600 dark:text-teal-400 rotate-180 -ml-1" />
                              </div>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">Host B</span>
                            </div>

                            <div className="inline-block bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-500 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs">
                              [SYN-ACK] Flags • Server → Client Response
                            </div>
                            <div className="text-[11px] text-slate-700 dark:text-slate-300">
                              Seq: <strong className="text-teal-600 dark:text-teal-300">5000</strong> • Ack: <strong className="text-emerald-600 dark:text-emerald-400">1001</strong> (1000+1) • Win: <strong className="text-slate-700 dark:text-slate-300">32768</strong>
                            </div>
                          </div>
                        )}

                        {tcpHandshakeStep === 2 && (
                          <div className="space-y-2">
                            {/* Direction Indicator Bar: Bi-directional / Established */}
                            <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Host A</span>
                              <div className="flex-1 h-[2px] bg-emerald-500 relative flex items-center justify-between px-1">
                                <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 rotate-180" />
                                <span className="text-[9px] font-black text-emerald-800 dark:text-emerald-300 bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                                  FULL-DUPLEX
                                </span>
                                <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Host B</span>
                            </div>

                            <div className="inline-block bg-emerald-600 text-white font-black px-3 py-1.5 rounded-lg text-xs shadow-xs">
                              [ACK] Flag • Connection ESTABLISHED ✓
                            </div>
                            <div className="text-[11px] text-slate-700 dark:text-slate-300">
                              Seq: <strong className="text-emerald-600 dark:text-emerald-400">1001</strong> • Ack: <strong className="text-teal-600 dark:text-teal-300">5001</strong> (5000+1) • Win: <strong className="text-slate-700 dark:text-slate-300">64240</strong>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-[10.5px] text-slate-500 dark:text-slate-400 italic border-t border-emerald-200 dark:border-emerald-900/40 pt-1.5">
                        {tcpHandshakeStep === 0 && "Step 1 (Client → Server): Host A initiates SYN request on Port 443."}
                        {tcpHandshakeStep === 1 && "Step 2 (Server → Client): Host B acknowledges SYN (Ack=1001) & returns SYN (Seq=5000)."}
                        {tcpHandshakeStep === 2 && "Step 3 (Client → Server): Host A acknowledges SYN (Ack=5001). Reliable TCP stream active!"}
                      </div>
                    </div>

                    {/* SERVER HOST B CARD */}
                    <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 p-3 rounded-xl space-y-2 w-full md:w-[220px]">
                      <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-extrabold">
                        <div className="flex items-center gap-1.5">
                          <Server className="w-4 h-4" />
                          <span>Server Host B</span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                          142.250.190.46
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 p-2 rounded border border-emerald-200 dark:border-emerald-700 space-y-1">
                        <div>Dst Port: <strong>443 (HTTPS)</strong></div>
                        <div className="text-[10px] text-slate-700 dark:text-slate-300">
                          State:{" "}
                          <strong className="text-emerald-600 dark:text-emerald-400">
                            {tcpHandshakeStep === 0
                              ? "LISTEN / SYN_RCVD"
                              : tcpHandshakeStep === 1
                                ? "SYN_RCVD"
                                : "ESTABLISHED"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-mono p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950/80 border-emerald-200 dark:border-emerald-900/40 text-slate-800 dark:text-slate-300">
                    {tcpHandshakeStep === 0 && (
                      <span>
                        <strong>1. SYN Transmission:</strong> Client initiates TCP connection to Server port 443 by selecting initial sequence number <code className="text-emerald-600 dark:text-emerald-400 font-bold">1000</code>.
                      </span>
                    )}
                    {tcpHandshakeStep === 1 && (
                      <span>
                        <strong>2. SYN-ACK Response:</strong> Server accepts connection request, sets Ack = <code className="text-emerald-600 dark:text-emerald-400 font-bold">1001</code> (acknowledging 1000), and sends its own initial sequence number <code className="text-emerald-600 dark:text-emerald-400 font-bold">5000</code>.
                      </span>
                    )}
                    {tcpHandshakeStep === 2 && (
                      <span>
                        <strong>3. Connection Established:</strong> Client acknowledges Server sequence number with Ack = <code className="text-emerald-600 dark:text-emerald-400 font-bold">5001</code>. Full-duplex reliable transport stream is now active!
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-white dark:bg-slate-950 border border-emerald-200 dark:border-emerald-900/60 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-bold border-b border-emerald-200 dark:border-emerald-900/40 pb-2">
                      <span>UDP Connectionless Datagram Layout</span>
                      <span className="text-[11px] bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                        8-Byte Header Overhead
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 p-2.5 rounded-lg">
                        <div className="text-slate-500 dark:text-slate-400 text-[10px]">Source Port</div>
                        <div className="text-emerald-700 dark:text-emerald-300 font-bold">51234</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 p-2.5 rounded-lg">
                        <div className="text-slate-500 dark:text-slate-400 text-[10px]">Destination Port</div>
                        <div className="text-emerald-700 dark:text-emerald-300 font-bold">53 (DNS)</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 p-2.5 rounded-lg">
                        <div className="text-slate-500 dark:text-slate-400 text-[10px]">Length</div>
                        <div className="text-emerald-700 dark:text-emerald-300 font-bold">42 Bytes</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 p-2.5 rounded-lg">
                        <div className="text-slate-500 dark:text-slate-400 text-[10px]">Checksum</div>
                        <div className="text-emerald-700 dark:text-emerald-300 font-bold">0x9B1A</div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-800 dark:text-slate-300">
                        Datagram Dispatch: <strong className="text-emerald-600 dark:text-emerald-400">192.168.1.10:51234 → 8.8.8.8:53</strong>
                      </span>
                      <span className="bg-emerald-100 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 font-bold">
                        Fire & Forget (No ACK)
                      </span>
                    </div>
                  </div>

                  <div className="text-xs font-mono p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950/80 border-emerald-200 dark:border-emerald-900/40 text-slate-800 dark:text-slate-300">
                    <strong>UDP Datagram Mode:</strong> Omits handshake state machine, sequence tracking, and flow control. Sends raw datagrams directly with minimal 8-byte header overhead for low latency applications (DNS, VoIP, Live Video).
                  </div>
                </div>
              )}
            </div>
          )}

          {/* L3 NETWORK: Multi-Mode Router Hop, IPv4 Header, & Traceroute Inspector */}
          {activeLayer.key === "network" && (
            <div className="relative z-10 space-y-4 py-2">
              {/* TOP SUB-MODE SELECTOR TOGGLE */}
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-mono">
                <div className="text-sky-700 dark:text-sky-300 font-bold">
                  Network Layer (L3) Protocol Mechanics & Routing Engine
                </div>

                <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-sky-900/60 flex items-center gap-1 shadow-2xs">
                  <button
                    onClick={() => setNetSubMode("routing")}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                      netSubMode === "routing"
                        ? "bg-sky-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    Hop & Routing Table
                  </button>
                  <button
                    onClick={() => setNetSubMode("header")}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                      netSubMode === "header"
                        ? "bg-sky-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    IPv4 Header (20B)
                  </button>
                  <button
                    onClick={() => setNetSubMode("traceroute")}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                      netSubMode === "traceroute"
                        ? "bg-sky-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    Traceroute & ICMP
                  </button>
                </div>
              </div>

              {/* MODE 1: HOP TRAVERSAL & ROUTING TABLE ENGINE */}
              {netSubMode === "routing" && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <span className="text-sky-700 dark:text-sky-300 text-[11px]">
                      Hop Progression & Live CIDR Routing Table Match
                    </span>
                    <button
                      onClick={() => setRouterHopStep((prev) => (prev + 1) % 4)}
                      className="px-2.5 py-1 rounded bg-sky-100 dark:bg-sky-900 hover:bg-sky-200 dark:hover:bg-sky-800 text-sky-900 dark:text-sky-100 font-bold border border-sky-300 dark:border-sky-700 transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Advance Hop Step ({routerHopStep + 1}/4)</span>
                    </button>
                  </div>

                  {/* HOP NODE CHAIN */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div
                      className={`p-3 rounded-xl border transition-all ${
                        routerHopStep === 0
                          ? "bg-sky-50 dark:bg-sky-950 border-sky-500 text-sky-900 dark:text-sky-100 shadow-md ring-2 ring-sky-500/50"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <div className="font-bold text-sky-600 dark:text-sky-400">1. Host A (Origin)</div>
                      <div className="text-[10px]">192.168.1.10</div>
                      <div className="text-[9px] text-sky-600 dark:text-sky-300 mt-1">TTL: 64</div>
                    </div>

                    <div
                      className={`p-3 rounded-xl border transition-all ${
                        routerHopStep === 1
                          ? "bg-sky-50 dark:bg-sky-950 border-sky-500 text-sky-900 dark:text-sky-100 shadow-md ring-2 ring-sky-500/50"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <div className="font-bold text-sky-600 dark:text-sky-400">2. Router 1 (Gateway)</div>
                      <div className="text-[10px]">192.168.1.1</div>
                      <div className="text-[9px] text-sky-600 dark:text-sky-300 mt-1">TTL: 63</div>
                    </div>

                    <div
                      className={`p-3 rounded-xl border transition-all ${
                        routerHopStep === 2
                          ? "bg-sky-50 dark:bg-sky-950 border-sky-500 text-sky-900 dark:text-sky-100 shadow-md ring-2 ring-sky-500/50"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <div className="font-bold text-sky-600 dark:text-sky-400">3. Router 2 (ISP Core)</div>
                      <div className="text-[10px]">10.0.4.1</div>
                      <div className="text-[9px] text-sky-600 dark:text-sky-300 mt-1">TTL: 62</div>
                    </div>

                    <div
                      className={`p-3 rounded-xl border transition-all ${
                        routerHopStep === 3
                          ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-100 shadow-md ring-2 ring-emerald-500/50"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">4. Host B (Dest)</div>
                      <div className="text-[10px]">142.250.190.46</div>
                      <div className="text-[9px] text-emerald-600 dark:text-emerald-300 mt-1">
                        {routerHopStep === 3 ? "Delivered! ✓" : "Destination"}
                      </div>
                    </div>
                  </div>

                  {/* ROUTING TABLE LOOKUP ENGINE INSPECTOR CARD */}
                  <div className="bg-white dark:bg-slate-950 border border-sky-200 dark:border-sky-900/60 p-3.5 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-sky-700 dark:text-sky-300 text-[11px] font-bold border-b border-sky-200 dark:border-sky-900/40 pb-1.5">
                      <span>Active Hop Routing Table Decision Engine</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                        Target Dst IP: 142.250.190.46
                      </span>
                    </div>

                    {routerHopStep === 0 && (
                      <div className="space-y-1.5 text-[11px]">
                        <div className="text-slate-800 dark:text-slate-300">
                          <strong>Host A Routing Table Lookup:</strong> Destination <code className="text-sky-600 dark:text-sky-300 font-bold">142.250.190.46</code> is outside local subnet <code className="text-slate-600 dark:text-slate-400">192.168.1.0/24</code>.
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10.5px]">
                          <div><span className="text-slate-500 block text-[9.5px]">Destination</span>0.0.0.0/0</div>
                          <div><span className="text-slate-500 block text-[9.5px]">Gateway</span>192.168.1.1</div>
                          <div><span className="text-slate-500 block text-[9.5px]">Interface</span>eth0</div>
                          <div><span className="text-slate-500 block text-[9.5px]">TTL Initial</span>64</div>
                        </div>
                      </div>
                    )}

                    {routerHopStep === 1 && (
                      <div className="space-y-1.5 text-[11px]">
                        <div className="text-slate-800 dark:text-slate-300">
                          <strong>Gateway Router 1 CIDR Match:</strong> Matched longest-prefix entry <code className="text-sky-600 dark:text-sky-300 font-bold">142.250.0.0/16</code> in FIB table.
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10.5px]">
                          <div><span className="text-slate-500 block text-[9.5px]">Matched Route</span>142.250.0.0/16</div>
                          <div><span className="text-slate-500 block text-[9.5px]">Next Hop</span>10.0.4.1</div>
                          <div><span className="text-slate-500 block text-[9.5px]">Out Interface</span>wan0</div>
                          <div><span className="text-slate-500 block text-[9.5px]">Action</span>TTL 64 → 63</div>
                        </div>
                      </div>
                    )}

                    {routerHopStep === 2 && (
                      <div className="space-y-1.5 text-[11px]">
                        <div className="text-slate-800 dark:text-slate-300">
                          <strong>ISP Core Router 2 CIDR Match:</strong> Matched direct subnet entry <code className="text-sky-600 dark:text-sky-300 font-bold">142.250.190.0/24</code>.
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10.5px]">
                          <div><span className="text-slate-500 block text-[9.5px]">Matched Route</span>142.250.190.0/24</div>
                          <div><span className="text-slate-500 block text-[9.5px]">Next Hop</span>Direct (LAN)</div>
                          <div><span className="text-slate-500 block text-[9.5px]">Out Interface</span>eth1</div>
                          <div><span className="text-slate-500 block text-[9.5px]">Action</span>TTL 63 → 62</div>
                        </div>
                      </div>
                    )}

                    {routerHopStep === 3 && (
                      <div className="space-y-1.5 text-[11px]">
                        <div className="text-emerald-800 dark:text-emerald-300">
                          <strong>Host B Packet Arrival:</strong> IP packet matches local interface IP <code className="text-emerald-600 dark:text-emerald-400 font-bold">142.250.190.46</code>.
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 p-2 rounded grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10.5px]">
                          <div><span className="text-emerald-600 dark:text-emerald-400/70 block text-[9.5px]">Status</span>DELIVERED ✓</div>
                          <div><span className="text-emerald-600 dark:text-emerald-400/70 block text-[9.5px]">Final TTL</span>62</div>
                          <div><span className="text-emerald-600 dark:text-emerald-400/70 block text-[9.5px]">Protocol</span>0x06 (TCP)</div>
                          <div><span className="text-emerald-600 dark:text-emerald-400/70 block text-[9.5px]">Hops Traversed</span>2 Routers</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MODE 2: IPV4 HEADER FIELD INSPECTOR */}
              {netSubMode === "header" && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="text-[11px] text-sky-700 dark:text-sky-300">
                    Click any field to inspect standard 20-Byte IPv4 Header parameters:
                  </div>

                  {/* IPv4 HEADER FIELD GRID */}
                  <div className="bg-white dark:bg-slate-950 border border-sky-200 dark:border-sky-900/60 p-3 rounded-xl space-y-2">
                    {/* ROW 1 */}
                    <div className="grid grid-cols-4 gap-1.5 text-center text-[10.5px]">
                      <button
                        onClick={() => setSelectedIpHeaderField("version")}
                        className={`p-2 rounded border transition-all ${
                          selectedIpHeaderField === "version"
                            ? "bg-sky-600 text-white border-sky-400 font-bold shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-300 hover:border-sky-500"
                        }`}
                      >
                        Version (4b)
                        <div className="text-[9px] opacity-80">4 (IPv4)</div>
                      </button>
                      <button
                        onClick={() => setSelectedIpHeaderField("ihl")}
                        className={`p-2 rounded border transition-all ${
                          selectedIpHeaderField === "ihl"
                            ? "bg-sky-600 text-white border-sky-400 font-bold shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-300 hover:border-sky-500"
                        }`}
                      >
                        IHL (4b)
                        <div className="text-[9px] opacity-80">5 (20 Bytes)</div>
                      </button>
                      <button
                        onClick={() => setSelectedIpHeaderField("tos")}
                        className={`p-2 rounded border transition-all ${
                          selectedIpHeaderField === "tos"
                            ? "bg-sky-600 text-white border-sky-400 font-bold shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-300 hover:border-sky-500"
                        }`}
                      >
                        DSCP / ECN (8b)
                        <div className="text-[9px] opacity-80">0x00 (Normal)</div>
                      </button>
                      <button
                        onClick={() => setSelectedIpHeaderField("length")}
                        className={`p-2 rounded border transition-all ${
                          selectedIpHeaderField === "length"
                            ? "bg-sky-600 text-white border-sky-400 font-bold shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-300 hover:border-sky-500"
                        }`}
                      >
                        Total Length (16b)
                        <div className="text-[9px] opacity-80">1500 Bytes</div>
                      </button>
                    </div>

                    {/* ROW 2 */}
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10.5px]">
                      <button
                        onClick={() => setSelectedIpHeaderField("id")}
                        className={`p-2 rounded border transition-all ${
                          selectedIpHeaderField === "id"
                            ? "bg-sky-600 text-white border-sky-400 font-bold shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-300 hover:border-sky-500"
                        }`}
                      >
                        Identification (16b)
                        <div className="text-[9px] opacity-80">0x1C4F</div>
                      </button>
                      <button
                        onClick={() => setSelectedIpHeaderField("flags")}
                        className={`p-2 rounded border transition-all ${
                          selectedIpHeaderField === "flags"
                            ? "bg-sky-600 text-white border-sky-400 font-bold shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-300 hover:border-sky-500"
                        }`}
                      >
                        Flags (3b)
                        <div className="text-[9px] opacity-80">DF=1, MF=0</div>
                      </button>
                      <button
                        onClick={() => setSelectedIpHeaderField("offset")}
                        className={`p-2 rounded border transition-all ${
                          selectedIpHeaderField === "offset"
                            ? "bg-sky-600 text-white border-sky-400 font-bold shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-300 hover:border-sky-500"
                        }`}
                      >
                        Fragment Offset (13b)
                        <div className="text-[9px] opacity-80">0</div>
                      </button>
                    </div>

                    {/* ROW 3 */}
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10.5px]">
                      <button
                        onClick={() => setSelectedIpHeaderField("ttl")}
                        className={`p-2 rounded border transition-all ${
                          selectedIpHeaderField === "ttl"
                            ? "bg-sky-600 text-white border-sky-400 font-bold shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-300 hover:border-sky-500"
                        }`}
                      >
                        Time to Live / TTL (8b)
                        <div className="text-[9px] opacity-80">64</div>
                      </button>
                      <button
                        onClick={() => setSelectedIpHeaderField("protocol")}
                        className={`p-2 rounded border transition-all ${
                          selectedIpHeaderField === "protocol"
                            ? "bg-sky-600 text-white border-sky-400 font-bold shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-300 hover:border-sky-500"
                        }`}
                      >
                        Protocol (8b)
                        <div className="text-[9px] opacity-80">0x06 (TCP)</div>
                      </button>
                      <button
                        onClick={() => setSelectedIpHeaderField("checksum")}
                        className={`p-2 rounded border transition-all ${
                          selectedIpHeaderField === "checksum"
                            ? "bg-sky-600 text-white border-sky-400 font-bold shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-300 hover:border-sky-500"
                        }`}
                      >
                        Header Checksum (16b)
                        <div className="text-[9px] opacity-80">0x4A2B</div>
                      </button>
                    </div>

                    {/* ROW 4 & 5 */}
                    <div className="grid grid-cols-2 gap-1.5 text-center text-[10.5px]">
                      <button
                        onClick={() => setSelectedIpHeaderField("src")}
                        className={`p-2 rounded border transition-all ${
                          selectedIpHeaderField === "src"
                            ? "bg-sky-600 text-white border-sky-400 font-bold shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-300 hover:border-sky-500"
                        }`}
                      >
                        Source IP Address (32b)
                        <div className="text-[9.5px] opacity-90 font-bold">192.168.1.10</div>
                      </button>
                      <button
                        onClick={() => setSelectedIpHeaderField("dst")}
                        className={`p-2 rounded border transition-all ${
                          selectedIpHeaderField === "dst"
                            ? "bg-sky-600 text-white border-sky-400 font-bold shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-300 hover:border-sky-500"
                        }`}
                      >
                        Destination IP Address (32b)
                        <div className="text-[9.5px] opacity-90 font-bold">142.250.190.46</div>
                      </button>
                    </div>
                  </div>

                  {/* FIELD EXPLANATION CARD */}
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-sky-200 dark:border-sky-900/40 text-slate-800 dark:text-slate-300 text-xs">
                    {selectedIpHeaderField === "ttl" && (
                      <span>
                        <strong>TTL (Time to Live):</strong> 8-bit hop counter (default 64). Decremented by 1 at every router hop. Prevents endless routing loops by dropping packets when TTL reaches 0.
                      </span>
                    )}
                    {selectedIpHeaderField === "version" && (
                      <span>
                        <strong>Version (4 bits):</strong> Specifies IP format. Value <code className="text-sky-600 dark:text-sky-300 font-bold">4</code> indicates standard IPv4 format.
                      </span>
                    )}
                    {selectedIpHeaderField === "ihl" && (
                      <span>
                        <strong>IHL (Internet Header Length):</strong> Specifies header length in 32-bit words. Value <code className="text-sky-600 dark:text-sky-300 font-bold">5</code> = 5 × 4 = 20 Bytes (minimum header size without options).
                      </span>
                    )}
                    {selectedIpHeaderField === "tos" && (
                      <span>
                        <strong>DSCP / ECN:</strong> Type of Service bits used for Quality of Service (QoS) prioritization and Explicit Congestion Notification.
                      </span>
                    )}
                    {selectedIpHeaderField === "length" && (
                      <span>
                        <strong>Total Length (16 bits):</strong> Total size of IP packet (Header + Payload) in bytes. Maximum theoretical size is 65,535 bytes.
                      </span>
                    )}
                    {selectedIpHeaderField === "id" && (
                      <span>
                        <strong>Identification:</strong> Unique ID assigned to fragment groups for packet reassembly at destination.
                      </span>
                    )}
                    {selectedIpHeaderField === "flags" && (
                      <span>
                        <strong>Flags:</strong> Control bits. <code className="text-sky-600 dark:text-sky-300 font-bold">DF=1</code> (Don't Fragment), <code className="text-sky-600 dark:text-sky-300 font-bold">MF=0</code> (No More Fragments).
                      </span>
                    )}
                    {selectedIpHeaderField === "offset" && (
                      <span>
                        <strong>Fragment Offset:</strong> Indicates relative position of this fragment in unfragmented payload in 8-byte units.
                      </span>
                    )}
                    {selectedIpHeaderField === "protocol" && (
                      <span>
                        <strong>Protocol:</strong> Indicates upper-layer protocol payload. <code className="text-sky-600 dark:text-sky-300 font-bold">0x06 = TCP</code>, <code className="text-sky-600 dark:text-sky-300 font-bold">0x11 = UDP</code>, <code className="text-sky-600 dark:text-sky-300 font-bold">0x01 = ICMP</code>.
                      </span>
                    )}
                    {selectedIpHeaderField === "checksum" && (
                      <span>
                        <strong>Header Checksum:</strong> 16-bit 1's complement sum for error detection. Recomputed by every router when TTL is decremented.
                      </span>
                    )}
                    {selectedIpHeaderField === "src" && (
                      <span>
                        <strong>Source IP Address:</strong> 32-bit IPv4 address of originating sender device (`192.168.1.10`). Remains unchanged across network hops.
                      </span>
                    )}
                    {selectedIpHeaderField === "dst" && (
                      <span>
                        <strong>Destination IP Address:</strong> 32-bit IPv4 address of target destination device (`142.250.190.46`). Used by routers for table lookups.
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* MODE 3: TRACEROUTE & ICMP TTL SIMULATOR */}
              {netSubMode === "traceroute" && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sky-700 dark:text-sky-300 text-[11px]">
                      Set Probe TTL to simulate ICMP Traceroute Hop Discovery:
                    </span>

                    {/* TTL SELECTOR BUTTONS */}
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-sky-900/60">
                      {[1, 2, 3].map((ttl) => (
                        <button
                          key={ttl}
                          onClick={() => setTracerouteTtl(ttl)}
                          className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all ${
                            tracerouteTtl === ttl
                              ? "bg-sky-600 text-white shadow-xs"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                          }`}
                        >
                          TTL = {ttl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TRACEROUTE SIMULATION CARD */}
                  <div className="bg-white dark:bg-slate-950 border border-sky-200 dark:border-sky-900/60 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-sky-700 dark:text-sky-300 text-[11px] font-bold border-b border-sky-200 dark:border-sky-900/40 pb-2">
                      <span>Traceroute Probe Packet (Initial TTL = {tracerouteTtl})</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Host A → Host B (142.250.190.46)
                      </span>
                    </div>

                    {tracerouteTtl === 1 && (
                      <div className="space-y-2 text-[11px]">
                        <div className="bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 p-2.5 rounded text-amber-900 dark:text-amber-200 space-y-1">
                          <div className="font-bold flex items-center justify-between text-amber-700 dark:text-amber-400">
                            <span>Hop 1: Gateway Router 1 (192.168.1.1)</span>
                            <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-700 px-1.5 py-0.5 rounded font-black">
                              ICMP Type 11: Time Exceeded
                            </span>
                          </div>
                          <div>
                            Router 1 decrements TTL (1 → 0). TTL reached 0! Router 1 drops packet and sends ICMP Time-Exceeded error back to Host A.
                          </div>
                        </div>
                        <div className="text-[10.5px] text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                          <code>traceroute output: 1 192.168.1.1 (Gateway) 1.241 ms</code>
                        </div>
                      </div>
                    )}

                    {tracerouteTtl === 2 && (
                      <div className="space-y-2 text-[11px]">
                        <div className="bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 p-2.5 rounded text-amber-900 dark:text-amber-200 space-y-1">
                          <div className="font-bold flex items-center justify-between text-amber-700 dark:text-amber-400">
                            <span>Hop 2: WAN Core Router 2 (10.0.4.1)</span>
                            <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-700 px-1.5 py-0.5 rounded font-black">
                              ICMP Type 11: Time Exceeded
                            </span>
                          </div>
                          <div>
                            Packet passed Router 1 (TTL 2 → 1). At Router 2, TTL decremented (1 → 0). Router 2 drops packet and returns ICMP Time-Exceeded.
                          </div>
                        </div>
                        <div className="text-[10.5px] text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                          <code>traceroute output: 2 10.0.4.1 (ISP Backbone) 14.821 ms</code>
                        </div>
                      </div>
                    )}

                    {tracerouteTtl === 3 && (
                      <div className="space-y-2 text-[11px]">
                        <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 p-2.5 rounded text-emerald-900 dark:text-emerald-200 space-y-1">
                          <div className="font-bold flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                            <span>Hop 3: Target Host B (142.250.190.46)</span>
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-600 px-1.5 py-0.5 rounded font-black">
                              ICMP Echo Reply / TCP ACK ✓
                            </span>
                          </div>
                          <div>
                            Packet traversed Router 1 & Router 2 with TTL remaining (3 → 2 → 1). Reached final destination Host B!
                          </div>
                        </div>
                        <div className="text-[10.5px] text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                          <code>traceroute output: 3 142.250.190.46 (Host B Target) 28.450 ms [Completed]</code>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-xs p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-900/80 border-sky-200 dark:border-sky-900/40 text-slate-800 dark:text-slate-300">
                    <strong>Traceroute Mechanism:</strong> Traceroute sends a sequence of packets with incrementing TTL values (1, 2, 3...). Each intermediary router drops the packet when TTL reaches 0 and sends back an ICMP Time-Exceeded message, revealing every hop along the network path!
                  </div>
                </div>
              )}
            </div>
          )}

          {/* L2 DATA LINK: Multi-Mode Ethernet II Frame, CRC Error Check, & ARP Resolution */}
          {activeLayer.key === "data-link" && (
            <div className="relative z-10 space-y-4 py-2">
              {/* TOP SUB-MODE SELECTOR TOGGLE */}
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-mono">
                <div className="text-amber-700 dark:text-amber-300 font-bold">
                  Data Link Layer (L2) Framing & Hardware Addressing
                </div>

                <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-amber-900/60 flex items-center gap-1 shadow-2xs">
                  <button
                    onClick={() => setDataLinkSubMode("frame")}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                      dataLinkSubMode === "frame"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    Ethernet II Frame (18B)
                  </button>
                  <button
                    onClick={() => setDataLinkSubMode("crc")}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                      dataLinkSubMode === "crc"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    CRC-32 FCS Integrity
                  </button>
                  <button
                    onClick={() => setDataLinkSubMode("arp")}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                      dataLinkSubMode === "arp"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    ARP Resolution
                  </button>
                </div>
              </div>

              {/* MODE 1: ETHERNET II FRAME FIELD INSPECTOR */}
              {dataLinkSubMode === "frame" && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="text-[11px] text-amber-700 dark:text-amber-300">
                    Click any field to inspect standard IEEE 802.3 / Ethernet II Frame layout:
                  </div>

                  {/* FRAME FIELD GRID */}
                  <div className="bg-white dark:bg-slate-950 border border-amber-200 dark:border-amber-900/60 p-3 rounded-xl space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5 text-center text-[10.5px]">
                      <button
                        onClick={() => setSelectedMacHeaderField("preamble")}
                        className={`p-2 rounded border transition-all ${
                          selectedMacHeaderField === "preamble"
                            ? "bg-amber-600 text-white border-amber-400 font-bold shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-amber-700 dark:text-amber-300 hover:border-amber-500"
                        }`}
                      >
                        Preamble & SFD (8b)
                        <div className="text-[9px] opacity-80">Sync Bitstream</div>
                      </button>

                      <button
                        onClick={() => setSelectedMacHeaderField("dst_mac")}
                        className={`p-2 rounded border transition-all ${
                          selectedMacHeaderField === "dst_mac"
                            ? "bg-amber-600 text-white border-amber-400 font-bold shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-amber-700 dark:text-amber-300 hover:border-amber-500"
                        }`}
                      >
                        Destination MAC (6b)
                        <div className="text-[9px] opacity-80">00:1A:2B:3C:4D:5E</div>
                      </button>

                      <button
                        onClick={() => setSelectedMacHeaderField("src_mac")}
                        className={`p-2 rounded border transition-all ${
                          selectedMacHeaderField === "src_mac"
                            ? "bg-amber-600 text-white border-amber-400 font-bold shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-amber-700 dark:text-amber-300 hover:border-amber-500"
                        }`}
                      >
                        Source MAC (6b)
                        <div className="text-[9px] opacity-80">AA:BB:CC:DD:EE:FF</div>
                      </button>

                      <button
                        onClick={() => setSelectedMacHeaderField("ethertype")}
                        className={`p-2 rounded border transition-all ${
                          selectedMacHeaderField === "ethertype"
                            ? "bg-amber-600 text-white border-amber-400 font-bold shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-amber-700 dark:text-amber-300 hover:border-amber-500"
                        }`}
                      >
                        EtherType (2b)
                        <div className="text-[9px] opacity-80">0x0800 (IPv4)</div>
                      </button>

                      <button
                        onClick={() => setSelectedMacHeaderField("fcs")}
                        className={`p-2 rounded border transition-all ${
                          selectedMacHeaderField === "fcs"
                            ? "bg-amber-600 text-white border-amber-400 font-bold shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-amber-700 dark:text-amber-300 hover:border-amber-500"
                        }`}
                      >
                        CRC-32 FCS (4b)
                        <div className="text-[9px] opacity-80">0x7F2B10A4</div>
                      </button>
                    </div>

                    <button
                      onClick={() => setSelectedMacHeaderField("payload")}
                      className={`w-full p-2.5 rounded border transition-all text-center ${
                        selectedMacHeaderField === "payload"
                          ? "bg-amber-600 text-white border-amber-400 font-bold shadow-xs"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-300 hover:border-sky-500"
                      }`}
                    >
                      Payload Data Field (46 to 1500 Bytes Payload Container)
                      <div className="text-[9.5px] opacity-80 font-normal">
                        Encapsulates L3 IP Packet Datagram
                      </div>
                    </button>
                  </div>

                  {/* FIELD EXPLANATION CARD */}
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-amber-200 dark:border-amber-900/40 text-slate-800 dark:text-slate-300 text-xs">
                    {selectedMacHeaderField === "preamble" && (
                      <span>
                        <strong>Preamble & Start Frame Delimiter (8 Bytes):</strong> 7 bytes of alternating 10101010 bits followed by 1 byte SFD (`10101011`). Allows hardware NIC clocks to synchronize before frame data arrives.
                      </span>
                    )}
                    {selectedMacHeaderField === "dst_mac" && (
                      <span>
                        <strong>Destination MAC Address (6 Bytes):</strong> Physical hardware address of receiving network card (`00:1A:2B:3C:4D:5E`). First 3 bytes (`00:1A:2B`) identify the Vendor OUI (e.g. Cisco).
                      </span>
                    )}
                    {selectedMacHeaderField === "src_mac" && (
                      <span>
                        <strong>Source MAC Address (6 Bytes):</strong> Physical hardware address of originating sender network card (`AA:BB:CC:DD:EE:FF`). Burned into NIC EEPROM firmware (BIA).
                      </span>
                    )}
                    {selectedMacHeaderField === "ethertype" && (
                      <span>
                        <strong>EtherType (2 Bytes):</strong> Indicates upper Network Layer protocol contained in payload. <code className="text-amber-600 dark:text-amber-300 font-bold">0x0800 = IPv4</code>, <code className="text-amber-600 dark:text-amber-300 font-bold">0x86DD = IPv6</code>, <code className="text-amber-600 dark:text-amber-300 font-bold">0x0806 = ARP</code>.
                      </span>
                    )}
                    {selectedMacHeaderField === "fcs" && (
                      <span>
                        <strong>Frame Check Sequence (CRC-32 FCS):</strong> 4-byte cyclic redundancy check trailer computed across header + payload. Protects physical medium against bit flips.
                      </span>
                    )}
                    {selectedMacHeaderField === "payload" && (
                      <span>
                        <strong>Data Payload Field (46–1500 Bytes):</strong> Carries higher-layer IP datagram packet. If payload is under 46 bytes, zero-padding bytes are appended to satisfy minimum 64-byte Ethernet frame size.
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* MODE 2: CRC-32 BIT INTEGRITY SIMULATOR */}
              {dataLinkSubMode === "crc" && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <span className="text-amber-700 dark:text-amber-300 text-[11px]">
                      Simulate Physical Medium Noise & FCS Error Detection:
                    </span>
                    <button
                      onClick={() => setCrcCorrupted(!crcCorrupted)}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                        crcCorrupted
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-amber-100 dark:bg-amber-900 hover:bg-amber-200 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-700"
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>
                        {crcCorrupted
                          ? "Restore Intact Frame"
                          : "Corrupt Bit (Trigger CRC Error)"}
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 p-3 rounded-xl space-y-1">
                      <div className="text-amber-600 dark:text-amber-400 font-bold">MAC Header (H2)</div>
                      <div className="text-[10.5px] text-slate-700 dark:text-slate-300">Dst: 00:1A:2B:3C:4D:5E</div>
                      <div className="text-[10.5px] text-slate-700 dark:text-slate-300">Src: AA:BB:CC:DD:EE:FF</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 p-3 rounded-xl space-y-1">
                      <div className="text-sky-600 dark:text-sky-400 font-bold">IP Payload Container</div>
                      <div className="text-[10.5px] text-slate-700 dark:text-slate-300">
                        {crcCorrupted ? (
                          <span className="text-rose-600 dark:text-rose-400 font-bold">
                            [ IP Header + CORRUPTED DATA BIT ]
                          </span>
                        ) : (
                          "[ IP Header + Valid Segment Data ]"
                        )}
                      </div>
                    </div>

                    <div
                      className={`p-3 rounded-xl border transition-all space-y-1 ${
                        crcCorrupted
                          ? "bg-rose-50 dark:bg-rose-950 border-rose-400 dark:border-rose-500 text-rose-900 dark:text-rose-100 shadow-md ring-2 ring-rose-500/50"
                          : "bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-600 dark:text-amber-400">CRC-32 FCS Trailer</span>
                        {crcCorrupted ? (
                          <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black">
                            MISMATCH ❌
                          </span>
                        ) : (
                          <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black">
                            PASS ✓
                          </span>
                        )}
                      </div>
                      <div className="text-[10.5px]">
                        FCS: {crcCorrupted ? "0xBAD_CRC_MISMATCH" : "0x7F2B10A4"}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950/80 border-amber-200 dark:border-amber-900/40 text-slate-800 dark:text-slate-300">
                    {crcCorrupted ? (
                      <span className="text-rose-700 dark:text-rose-300">
                        <strong>CRC Error Detected:</strong> A single bit flip during physical transmission caused hardware FCS calculation (`0x9A4F11E2`) to mismatch expected trailer (`0x7F2B10A4`). Receiving network card (NIC) immediately <strong>drops damaged frame without acknowledgment</strong>.
                      </span>
                    ) : (
                      <span className="text-amber-800 dark:text-amber-200">
                        <strong>Frame Check Sequence Verified:</strong> Receiver NIC re-evaluated CRC-32 polynomial over incoming frame bits and matched FCS trailer <code className="text-amber-600 dark:text-amber-400 font-bold">0x7F2B10A4</code>. MAC headers stripped and IP packet handed off to L3 Network Layer.
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* MODE 3: ARP RESOLUTION SIMULATOR */}
              {dataLinkSubMode === "arp" && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <span className="text-amber-700 dark:text-amber-300 text-[11px]">
                      Address Resolution Protocol (IP ➔ MAC Address Binding):
                    </span>

                    <button
                      onClick={() => setArpStep((prev) => (prev + 1) % 3)}
                      className="px-2.5 py-1 rounded bg-amber-100 dark:bg-amber-900 hover:bg-amber-200 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 font-bold border border-amber-300 dark:border-amber-700 transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Step ARP Protocol ({arpStep + 1}/3)</span>
                    </button>
                  </div>

                  {/* ARP SIMULATION CARD */}
                  <div className="bg-white dark:bg-slate-950 border border-amber-200 dark:border-amber-900/60 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-amber-700 dark:text-amber-300 text-[11px] font-bold border-b border-amber-200 dark:border-amber-900/40 pb-2">
                      <span>ARP Protocol Execution: Host A (192.168.1.10)</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Target IP: 192.168.1.1 (Gateway)
                      </span>
                    </div>

                    {arpStep === 0 && (
                      <div className="space-y-2 text-[11px]">
                        <div className="bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 p-2.5 rounded text-amber-900 dark:text-amber-200 space-y-1">
                          <div className="font-bold flex items-center justify-between text-amber-700 dark:text-amber-400">
                            <span>Step 1: ARP Request Broadcast</span>
                            <span className="text-[10px] bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-600 px-1.5 py-0.5 rounded font-black">
                              Dst MAC: FF:FF:FF:FF:FF:FF
                            </span>
                          </div>
                          <div>
                            Host A broadcasts to all devices on LAN: <code className="text-amber-700 dark:text-amber-300 font-bold font-mono">"Who has IP 192.168.1.1? Tell 192.168.1.10 (MAC AA:BB:CC:DD:EE:FF)"</code>.
                          </div>
                        </div>
                      </div>
                    )}

                    {arpStep === 1 && (
                      <div className="space-y-2 text-[11px]">
                        <div className="bg-teal-50 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-700 p-2.5 rounded text-teal-900 dark:text-teal-200 space-y-1">
                          <div className="font-bold flex items-center justify-between text-teal-700 dark:text-teal-400">
                            <span>Step 2: Gateway ARP Reply Unicast</span>
                            <span className="text-[10px] bg-teal-100 dark:bg-teal-900 text-teal-900 dark:text-teal-100 border border-teal-300 dark:border-teal-600 px-1.5 py-0.5 rounded font-black">
                              Dst MAC: AA:BB:CC:DD:EE:FF
                            </span>
                          </div>
                          <div>
                            Gateway Router 1 responds directly to Host A: <code className="text-teal-700 dark:text-teal-300 font-bold font-mono">"192.168.1.1 is at MAC 00:1A:2B:3C:4D:5E"</code>.
                          </div>
                        </div>
                      </div>
                    )}

                    {arpStep === 2 && (
                      <div className="space-y-2 text-[11px]">
                        <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 p-2.5 rounded text-emerald-900 dark:text-emerald-200 space-y-1">
                          <div className="font-bold flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                            <span>Step 3: Host A OS ARP Cache Table Updated</span>
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-600 px-1.5 py-0.5 rounded font-black">
                              CACHE BINDING CREATED ✓
                            </span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 font-mono text-[10.5px] grid grid-cols-3 text-center">
                            <div><span className="text-slate-500 block text-[9px]">IP Address</span>192.168.1.1</div>
                            <div><span className="text-slate-500 block text-[9px]">MAC Address</span>00:1A:2B:3C:4D:5E</div>
                            <div><span className="text-slate-500 block text-[9px]">Interface / Type</span>eth0 (Dynamic)</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-xs p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-900/80 border-amber-200 dark:border-amber-900/40 text-slate-800 dark:text-slate-300">
                    <strong>ARP Binding Mechanism:</strong> Layer 3 IP addresses cannot traverse physical switches without Layer 2 MAC addresses. ARP dynamically maps IP addresses to physical MAC hardware addresses and caches them in memory.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* L1 PHYSICAL: Digital Signal Line Encoding Waveform & Voltage View */}
          {activeLayer.key === "physical" && (
            <div className="relative z-10 space-y-4 py-2">
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                <div className="font-mono text-rose-700 dark:text-rose-400 font-bold">
                  Physical Medium Transmission Signal Inspector
                </div>

                {/* GRAPH vs VOLTS TOGGLE SWITCH */}
                <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-rose-900/60 flex items-center gap-1 shadow-2xs font-mono">
                  <button
                    onClick={() => setPhyDisplayMode("graph")}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                      phyDisplayMode === "graph"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    Graph (Waveform)
                  </button>
                  <button
                    onClick={() => setPhyDisplayMode("volts")}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                      phyDisplayMode === "volts"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    Volts (Voltage Levels)
                  </button>
                </div>
              </div>

              {phyDisplayMode === "graph" ? (
                <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-rose-700 dark:text-rose-300">
                    <span>Oscilloscope Signal Waveform (NRZ Encoding)</span>
                    <span className="font-bold">Bitstream: 1 0 1 1 0 0 1 0</span>
                  </div>

                  {/* SVG GRAPH OSCILLOSCOPE WAVEFORM */}
                  <div className="relative w-full overflow-x-auto">
                    <svg
                      viewBox="0 0 600 110"
                      className="w-full h-[110px] min-w-[500px]"
                    >
                      {/* Voltage Gridlines */}
                      <line
                        x1="40"
                        y1="25"
                        x2="580"
                        y2="25"
                        className="stroke-rose-500/30 dark:stroke-rose-500/25"
                        strokeDasharray="3 3"
                      />
                      <text
                        x="5"
                        y="29"
                        className="fill-rose-600 dark:fill-rose-400 font-mono text-[10px] font-bold"
                      >
                        +5V
                      </text>

                      <line
                        x1="40"
                        y1="75"
                        x2="580"
                        y2="75"
                        className="stroke-slate-300 dark:stroke-slate-700"
                        strokeDasharray="3 3"
                      />
                      <text
                        x="10"
                        y="79"
                        className="fill-slate-500 dark:fill-slate-400 font-mono text-[10px]"
                      >
                        0V
                      </text>

                      {/* Bit Dividers & Labels */}
                      {[
                        { bit: "1", x: 40 },
                        { bit: "0", x: 107.5 },
                        { bit: "1", x: 175 },
                        { bit: "1", x: 242.5 },
                        { bit: "0", x: 310 },
                        { bit: "0", x: 377.5 },
                        { bit: "1", x: 445 },
                        { bit: "0", x: 512.5 },
                      ].map((b, idx) => (
                        <g key={`bit-col-${idx}`}>
                          <line
                            x1={b.x}
                            y1="10"
                            x2={b.x}
                            y2="90"
                            className="stroke-slate-200 dark:stroke-slate-800"
                            strokeDasharray="2 2"
                          />
                          <text
                            x={b.x + 30}
                            y="18"
                            className="fill-rose-700 dark:fill-rose-300 font-mono text-[11px] font-bold"
                            textAnchor="middle"
                          >
                            Bit {b.bit}
                          </text>
                        </g>
                      ))}

                      {/* NRZ Stepped Waveform Path: 1 (25), 0 (75), 1 (25), 1 (25), 0 (75), 0 (75), 1 (25), 0 (75) */}
                      <path
                        d="M 40 25 L 107.5 25 L 107.5 75 L 175 75 L 175 25 L 310 25 L 310 75 L 445 75 L 445 25 L 512.5 25 L 512.5 75 L 580 75"
                        fill="none"
                        className="stroke-rose-600 dark:stroke-rose-500"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="text-xs font-mono p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-900 border-rose-200 dark:border-rose-900/40 text-slate-800 dark:text-slate-300">
                    <strong>Oscilloscope View:</strong> Non-Return-to-Zero (NRZ) line encoding represents binary <code className="text-rose-600 dark:text-rose-400 font-bold">1</code> as high voltage (<code className="text-rose-600 dark:text-rose-400 font-bold">+5.0V</code>) and binary <code className="text-slate-600 dark:text-slate-400 font-bold">0</code> as low voltage (<code className="text-slate-600 dark:text-slate-400 font-bold">0.0V</code>).
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between text-rose-700 dark:text-rose-300 font-bold">
                    <span>Discrete Electrical Voltage Potentials</span>
                    <span className="text-[11px] bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 px-2 py-0.5 rounded border border-rose-300 dark:border-rose-800">
                      Nominal 5V DC
                    </span>
                  </div>

                  {/* VOLTAGE LEVEL CARDS GRID */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      {
                        bit: "1",
                        volt: "+5.0 V",
                        state: "HIGH",
                        col: "border-rose-300 dark:border-rose-500 bg-rose-50 dark:bg-rose-950/80 text-rose-900 dark:text-rose-100",
                      },
                      {
                        bit: "0",
                        volt: "0.0 V",
                        state: "LOW / GND",
                        col: "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400",
                      },
                      {
                        bit: "1",
                        volt: "+5.0 V",
                        state: "HIGH",
                        col: "border-rose-300 dark:border-rose-500 bg-rose-50 dark:bg-rose-950/80 text-rose-900 dark:text-rose-100",
                      },
                      {
                        bit: "1",
                        volt: "+5.0 V",
                        state: "HIGH",
                        col: "border-rose-300 dark:border-rose-500 bg-rose-50 dark:bg-rose-950/80 text-rose-900 dark:text-rose-100",
                      },
                      {
                        bit: "0",
                        volt: "0.0 V",
                        state: "LOW / GND",
                        col: "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400",
                      },
                      {
                        bit: "0",
                        volt: "0.0 V",
                        state: "LOW / GND",
                        col: "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400",
                      },
                      {
                        bit: "1",
                        volt: "+5.0 V",
                        state: "HIGH",
                        col: "border-rose-300 dark:border-rose-500 bg-rose-50 dark:bg-rose-950/80 text-rose-900 dark:text-rose-100",
                      },
                      {
                        bit: "0",
                        volt: "0.0 V",
                        state: "LOW / GND",
                        col: "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400",
                      },
                    ].map((item, idx) => (
                      <div
                        key={`volt-card-${idx}`}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1 ${item.col}`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold">Slot #{idx + 1}</span>
                          <span className="font-bold">Bit: {item.bit}</span>
                        </div>
                        <div className="text-base font-black tracking-tight">
                          {item.volt}
                        </div>
                        <div className="text-[9.5px] opacity-80 font-semibold">
                          {item.state}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500 dark:text-slate-400">Peak Voltage</div>
                      <div className="text-rose-600 dark:text-rose-400 font-bold text-sm">
                        +5.0 V Peak-to-Peak
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500 dark:text-slate-400">Cable Impedance</div>
                      <div className="text-rose-600 dark:text-rose-400 font-bold text-sm">
                        100 Ω UTP Cat6
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500 dark:text-slate-400">Symbol Rate</div>
                      <div className="text-rose-600 dark:text-rose-400 font-bold text-sm">
                        100 Baud (10ns Bit)
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. DELIVERY SCOPE PATH INSET CARD (WHEN showDeliveryPath PARAM IS TRUE) */}
      {showDeliveryPath && (
        <div className="bg-primary/10 border border-primary/30 p-3.5 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="font-extrabold text-primary flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>Delivery Scope Comparison:</span>
          </div>
          <div className="font-medium text-foreground">
            {activeLayer.num <= 2
              ? "Hop-to-Hop Adjacent Hardware Link Delivery (Layer 1 & 2 MAC Framing)"
              : activeLayer.num === 3
                ? "Source-to-Destination Multi-Network Host Routing (Layer 3 Logical IP)"
                : activeLayer.num === 4
                  ? "End-to-End Process-to-Process Delivery (Layer 4 TCP/UDP Ports)"
                  : "End-to-End User Application Session & Syntax Management (Upper Layers 5–7)"}
          </div>
        </div>
      )}
    </div>
  );
}
