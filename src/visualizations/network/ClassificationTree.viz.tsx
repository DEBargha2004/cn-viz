import { useState, useMemo } from "react";
import { type VizMeta } from "../types";
import {
  GitFork,
  Zap,
  ShieldCheck,
  Layers,
  Info,
} from "lucide-react";

export const vizMeta: VizMeta = {
  key: "network-classification-tree",
  title: "Classification Tree (media / fiber modes / wireless types)",
  category: "network",
  renderer: "svg",
  params: [
    {
      key: "tree",
      type: "select",
      label: "Classification Tree",
      default: "transmission-media",
      options: [
        { label: "Transmission Media Taxonomy", value: "transmission-media" },
        { label: "Optical Fiber Propagation Modes", value: "fiber-modes" },
        { label: "Wireless Transmission Wave Types", value: "wireless-types" },
      ],
    },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

interface TreeNode {
  id: string;
  label: string;
  sublabel?: string;
  parentId?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isRoot?: boolean;
  isBranch?: boolean;
  overview: string;
  properties: string;
  applications: string;
}

interface TreeDefinition {
  title: string;
  subtitle: string;
  nodes: TreeNode[];
}

export default function ClassificationTree({ props, values }: Props) {
  const treeKey =
    (values.tree as string) ||
    (props?.tree as string) ||
    "transmission-media";

  // Selected node state for detailed drill-down
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Define tree node geometry & metadata
  const treeData = useMemo<Record<string, TreeDefinition>>(() => {
    return {
      "transmission-media": {
        title: "Transmission Media Taxonomy",
        subtitle: "Classification into Guided (Wired) and Unguided (Wireless) media",
        nodes: [
          {
            id: "tm-root",
            label: "Transmission Media",
            sublabel: "Physical Layer Conduit",
            x: 400,
            y: 45,
            w: 210,
            h: 46,
            isRoot: true,
            overview:
              "Physical pathways placed beneath the OSI Physical Layer that carry electromagnetic signal power from sender to receiver.",
            properties:
              "Broadly split based on whether energy is physically bounded within solid conductors or radiates through free space.",
            applications:
              "Forms the foundational infrastructure for all telecommunication, LAN, WAN, and wireless networks.",
          },
          {
            id: "guided",
            parentId: "tm-root",
            label: "Guided (Wired)",
            sublabel: "Bounded Medium",
            x: 240,
            y: 150,
            w: 170,
            h: 44,
            isBranch: true,
            overview:
              "Signals are guided along a physical solid path (metallic wire or glass core) that confines electromagnetic energy.",
            properties:
              "High bandwidth potential, physical security, low interference susceptibility compared to open atmosphere.",
            applications:
              "Structured building cabling, high-speed Ethernet LANs, undersea transatlantic telecommunication cables.",
          },
          {
            id: "unguided",
            parentId: "tm-root",
            label: "Unguided (Wireless)",
            sublabel: "Unbounded Medium",
            x: 640,
            y: 150,
            w: 170,
            h: 44,
            isBranch: true,
            overview:
              "Signals propagate through the atmosphere or vacuum of space without a physical solid conductor.",
            properties:
              "Omnidirectional or directional broadcast, high mobility, subject to atmospheric attenuation and interference.",
            applications:
              "Cellular phone networks, satellite links, Wi-Fi router coverage, outdoor line-of-sight microwave trunks.",
          },
          {
            id: "twisted-pair",
            parentId: "guided",
            label: "Twisted-Pair Cable",
            sublabel: "UTP / STP",
            x: 90,
            y: 265,
            w: 140,
            h: 44,
            overview:
              "Consists of pairs of insulated copper wires twisted together spirally to cancel electromagnetic crosstalk.",
            properties:
              "Inexpensive, flexible, short-to-medium distance; available as unshielded (UTP) or shielded (STP).",
            applications:
              "Ethernet RJ-45 LAN connections (Cat 5e/6/6A), traditional landline telephone subscriber loops.",
          },
          {
            id: "coaxial",
            parentId: "guided",
            label: "Coaxial Cable",
            sublabel: "Coax (RG-59/RG-6)",
            x: 240,
            y: 265,
            w: 135,
            h: 44,
            overview:
              "Features a central copper conductor surrounded by a dielectric insulator, woven metallic shield, and outer jacket.",
            properties:
              "Higher frequency response and EMI immunity than twisted-pair over longer distances.",
            applications:
              "Cable television (CATV) distribution, broadband cable internet modems, legacy bus Ethernet (10Base2/10Base5).",
          },
          {
            id: "fiber-optic",
            parentId: "guided",
            label: "Fiber-Optic Cable",
            sublabel: "Glass / Plastic Core",
            x: 390,
            y: 265,
            w: 140,
            h: 44,
            overview:
              "Transmits data as light pulses bouncing inside an ultra-pure glass or plastic core via Total Internal Reflection.",
            properties:
              "Immense bandwidth (Tbps), immunity to electrical noise/EMI, extremely low signal attenuation.",
            applications:
              "Internet backbone trunks, fiber-to-the-home (FTTH), high-speed data center interconnections.",
          },
          {
            id: "free-space",
            parentId: "unguided",
            label: "Free Space",
            sublabel: "Air / Vacuum",
            x: 640,
            y: 265,
            w: 145,
            h: 44,
            overview:
              "Open atmosphere, troposphere, ionosphere, or outer space environment carrying radio, microwave, or infrared waves.",
            properties:
              "Requires antenna transducers to convert guided electrical signals into radiating EM waves.",
            applications:
              "Satellite communication, mobile cellular towers, broadcast TV/FM radio, terrestrial microwave links.",
          },
        ],
      },
      "fiber-modes": {
        title: "Optical Fiber Propagation Modes",
        subtitle: "Classification of optical transmission paths and refractive-index profiles",
        nodes: [
          {
            id: "mode-root",
            label: "Propagation Mode",
            sublabel: "Light Path Trajectory",
            x: 400,
            y: 45,
            w: 200,
            h: 46,
            isRoot: true,
            overview:
              "Refers to the number of distinct optical ray paths (modes) that light pulses can travel along within a fiber core.",
            properties:
              "Determined by core diameter relative to optical light wavelength and the refractive index profile.",
            applications:
              "Categorizes optical fiber cables for short-reach campus LANs vs. long-haul telecom networks.",
          },
          {
            id: "multimode",
            parentId: "mode-root",
            label: "Multimode",
            sublabel: "Multiple Ray Paths",
            x: 260,
            y: 150,
            w: 170,
            h: 44,
            isBranch: true,
            overview:
              "Fibers with relatively large core diameters (50–62.5 µm) that allow multiple light rays to propagate simultaneously.",
            properties:
              "Suffers from modal dispersion (rays arrive at slightly different times), limiting distance to a few kilometers.",
            applications:
              "Short-distance data links, building backbones, Enterprise LAN interconnects, LED light sources.",
          },
          {
            id: "single-mode",
            parentId: "mode-root",
            label: "Single Mode",
            sublabel: "Single Axial Ray",
            x: 580,
            y: 150,
            w: 170,
            h: 44,
            overview:
              "Fibers with ultra-small core diameters (~8.3–10 µm) engineered so only a single fundamental ray mode propagates.",
            properties:
              "Zero modal dispersion, extremely high bandwidth, requires precise laser diode light sources.",
            applications:
              "Long-haul telecommunications, undersea optical cables, ISP metropolitan backbones (>10 km to 100+ km).",
          },
          {
            id: "step-index",
            parentId: "multimode",
            label: "Step Index",
            sublabel: "Uniform Core Index",
            x: 170,
            y: 265,
            w: 145,
            h: 44,
            overview:
              "Refractive index of core is uniform throughout. Abrupt 'step' change occurs at the core/cladding boundary.",
            properties:
              "Light rays bounce in sharp zig-zag paths. High modal dispersion and signal pulse broadening.",
            applications:
              "Short low-speed data links, plastic optical fiber (POF) in automotive or industrial applications.",
          },
          {
            id: "graded-index",
            parentId: "multimode",
            label: "Graded Index",
            sublabel: "Varying Core Index",
            x: 350,
            y: 265,
            w: 145,
            h: 44,
            overview:
              "Refractive index is highest at the core center and decreases smoothly toward the cladding boundary.",
            properties:
              "Bends light in smooth sinusoidal curves; outer rays travel faster to arrive in-sync with central rays.",
            applications:
              "High-speed multimode LAN backbones (OM3/OM4 standards), data center optical cross-connects.",
          },
        ],
      },
      "wireless-types": {
        title: "Wireless Transmission Waves",
        subtitle: "Classification of unguided electromagnetic waves by frequency and directionality",
        nodes: [
          {
            id: "wireless-root",
            label: "Wireless Transmission",
            sublabel: "Unguided EM Waves",
            x: 400,
            y: 60,
            w: 220,
            h: 46,
            isRoot: true,
            overview:
              "Unguided electromagnetic waves propagating through free space, divided into three main frequency bands.",
            properties:
              "Behavior varies dramatically across frequencies regarding wall penetration, antenna type, and range.",
            applications:
              "Powers modern mobile telephony, broadcasting, satellite relays, and short-range peripheral connections.",
          },
          {
            id: "radio-wave",
            parentId: "wireless-root",
            label: "Radio Waves",
            sublabel: "3 kHz to 1 GHz",
            x: 160,
            y: 200,
            w: 160,
            h: 46,
            overview:
              "Low-to-medium frequency waves that radiate omnidirectionally in all directions from sending antennas.",
            properties:
              "Can travel long distances and penetrate walls easily; susceptible to atmospheric and electrical interference.",
            applications:
              "AM/FM radio broadcasting, VHF/UHF television broadcast, cordless phones, maritime communication.",
          },
          {
            id: "microwave",
            parentId: "wireless-root",
            label: "Microwaves",
            sublabel: "1 GHz to 300 GHz",
            x: 400,
            y: 200,
            w: 160,
            h: 46,
            overview:
              "High-frequency waves that travel in narrow, focused unidirectional beams requiring line-of-sight.",
            properties:
              "Cannot penetrate solid obstacles well; requires parabolic dish or horn antennas aligned precisely.",
            applications:
              "Cellular phone towers, Wi-Fi routers (2.4 GHz / 5 GHz / 6 GHz), satellite relays, radar.",
          },
          {
            id: "infrared",
            parentId: "wireless-root",
            label: "Infrared Waves",
            sublabel: "300 GHz to 400 THz",
            x: 640,
            y: 200,
            w: 160,
            h: 46,
            overview:
              "Ultra-high-frequency waves used for short-range communication within enclosed line-of-sight spaces.",
            properties:
              "Cannot pass through walls or opaque objects, preventing interference between adjacent rooms.",
            applications:
              "TV remote controls, IrDA PC peripherals, indoor wireless infrared optical links.",
          },
        ],
      },
    };
  }, []);

  const activeTree = treeData[treeKey] || treeData["transmission-media"];

  // Dynamically calculate clean right-angle elbow connector paths from parent node bottom-center to child node top-center
  const connectors = useMemo(() => {
    return activeTree.nodes
      .filter((node) => node.parentId)
      .map((child) => {
        const parent = activeTree.nodes.find((n) => n.id === child.parentId);
        if (!parent) return null;

        // Exact anchor coordinates
        const px = parent.x;
        const py = parent.y + parent.h / 2; // Exact bottom center edge of parent box
        const cx = child.x;
        const cy = child.y - child.h / 2; // Exact top center edge of child box

        // Midpoint Y level between parent bottom and child top
        const midY = py + (cy - py) / 2;

        let pathStr: string;
        if (Math.abs(px - cx) < 1) {
          // Perfectly straight vertical line for aligned nodes
          pathStr = `M ${px} ${py} V ${cy}`;
        } else {
          // Right-angle elbow connector
          pathStr = `M ${px} ${py} V ${midY} H ${cx} V ${cy}`;
        }

        return {
          id: `${parent.id}->${child.id}`,
          path: pathStr,
        };
      })
      .filter(Boolean) as { id: string; path: string }[];
  }, [activeTree]);

  // Find currently active/selected node for details card
  const activeNode = useMemo(() => {
    if (!selectedNodeId) return activeTree.nodes[0]; // fallback to root node
    return (
      activeTree.nodes.find((n) => n.id === selectedNodeId) ||
      activeTree.nodes[0]
    );
  }, [selectedNodeId, activeTree]);

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none">
      {/* LARGE RESPONSIVE SVG CANVAS CONTAINER */}
      <div className="w-full border rounded-2xl bg-slate-100/80 dark:bg-slate-950/90 relative overflow-hidden shadow-inner border-slate-200/80 dark:border-slate-800 min-h-[220px] sm:min-h-[360px] md:min-h-[420px] flex items-center justify-center p-2 sm:p-4 transition-colors duration-300">
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
          viewBox="0 0 800 360"
          className="w-full h-auto text-foreground relative z-10 select-none font-sans"
        >
          {/* Connector lines rendered FIRST so they sit behind boxes cleanly */}
          <g className="connectors pointer-events-none">
            {connectors.map((c) => (
              <path
                key={c.id}
                d={c.path}
                fill="none"
                className="stroke-slate-300 dark:stroke-slate-700 stroke-[1.5px] transition-colors duration-300"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>

          {/* Tree Nodes rendered AFTER connectors */}
          <g className="nodes">
            {activeTree.nodes.map((node) => {
              const isSelected = activeNode.id === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x - node.w / 2}, ${
                    node.y - node.h / 2
                  })`}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="group cursor-pointer"
                >
                  {/* Node Box Outer Container */}
                  <rect
                    width={node.w}
                    height={node.h}
                    rx="8"
                    className={`transition-all duration-200 ${
                      isSelected
                        ? "fill-pink-500/10 dark:fill-pink-500/20 stroke-pink-500 dark:stroke-pink-400 stroke-[2px] shadow-sm"
                        : node.isRoot || node.isBranch
                        ? "fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 stroke-[1.5px] group-hover:stroke-pink-400 dark:group-hover:stroke-pink-500"
                        : "fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800 stroke-[1.5px] group-hover:stroke-pink-400 dark:group-hover:stroke-pink-500"
                    }`}
                  />

                  {/* Node Title Text */}
                  <text
                    x={node.w / 2}
                    y={node.sublabel ? node.h / 2 - 4 : node.h / 2 + 4}
                    textAnchor="middle"
                    className={`text-xs font-bold transition-colors ${
                      isSelected
                        ? "fill-pink-600 dark:fill-pink-400 font-extrabold"
                        : node.isRoot
                        ? "fill-slate-900 dark:fill-slate-100 font-extrabold"
                        : "fill-slate-800 dark:fill-slate-200 font-semibold"
                    }`}
                  >
                    {node.label}
                  </text>

                  {/* Node Subtitle Text */}
                  {node.sublabel && (
                    <text
                      x={node.w / 2}
                      y={node.h / 2 + 11}
                      textAnchor="middle"
                      className="fill-slate-500 dark:fill-slate-400 text-[10px] font-normal"
                    >
                      {node.sublabel}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* HUD OVERLAY AT TOP LEFT */}
        <div className="absolute top-3 left-3 bg-background/90 dark:bg-slate-900/90 backdrop-blur-md border rounded-xl px-3 py-1.5 flex items-center gap-2.5 text-xs shadow-md z-20 transition-colors">
          <div className="flex items-center gap-1.5 font-semibold">
            <GitFork className="w-4 h-4 text-pink-500 dark:text-pink-400" />
            <span className="text-slate-800 dark:text-slate-200">
              {activeTree.title}
            </span>
          </div>
          <span className="text-slate-400 dark:text-slate-600">|</span>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>Selected:</span>
            <span className="font-bold text-pink-600 dark:text-pink-400">
              {activeNode.label}
            </span>
          </div>
        </div>

        {/* BOTTOM RIGHT HELP TOOLTIP */}
        <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground bg-background/60 dark:bg-slate-900/60 backdrop-blur-sm px-2.5 py-1 rounded-lg border">
          <Info className="w-3.5 h-3.5 text-pink-500" />
          <span>Click any node to inspect details</span>
        </div>
      </div>

      {/* DETAILS GRID BELOW SVG */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Zap className="w-4 h-4 text-pink-500" /> Medium Overview
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {activeNode.overview}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <ShieldCheck className="w-4 h-4 text-pink-500" /> Key Characteristics
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {activeNode.properties}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Layers className="w-4 h-4 text-pink-500" /> Practical Use Cases
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {activeNode.applications}
          </p>
        </div>
      </div>
    </div>
  );
}
