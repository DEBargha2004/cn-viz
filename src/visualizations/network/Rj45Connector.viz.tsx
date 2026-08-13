import { useState, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { type VizMeta } from "../types";
import { Layers, Zap, ShieldCheck, Info, Rotate3D, CheckCircle2 } from "lucide-react";

export const vizMeta: VizMeta = {
  key: "network-rj45-connector",
  title: "RJ-45 UTP Connector",
  category: "network",
  renderer: "canvas",
  params: [
    {
      key: "wiringStandard",
      type: "select",
      label: "Wiring Standard",
      default: "t568b",
      options: [
        { label: "T568B (Commercial / Standard)", value: "t568b" },
        { label: "T568A (Residential / Legacy)", value: "t568a" },
      ],
    },
    {
      key: "explodedView",
      type: "boolean",
      label: "Exploded View (Internal Inspection)",
      default: false,
    },
    {
      key: "showPinNumbers",
      type: "boolean",
      label: "Show Pin Numbers",
      default: true,
    },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

interface PinInfo {
  pin: number;
  colorName: string;
  baseColor: string;
  stripeColor: string | null;
  signal: string;
  role: string;
  pairing: string;
}

const T568B_PINS: PinInfo[] = [
  { pin: 1, colorName: "White / Orange", baseColor: "#ffffff", stripeColor: "#ea580c", signal: "TX+ (Transmit Positive)", role: "Transmits positive data signal in 10/100BASE-T Ethernet.", pairing: "Pair 2" },
  { pin: 2, colorName: "Orange", baseColor: "#ea580c", stripeColor: null, signal: "TX- (Transmit Negative)", role: "Transmits negative data signal in 10/100BASE-T Ethernet.", pairing: "Pair 2" },
  { pin: 3, colorName: "White / Green", baseColor: "#ffffff", stripeColor: "#16a34a", signal: "RX+ (Receive Positive)", role: "Receives positive data signal in 10/100BASE-T Ethernet.", pairing: "Pair 3" },
  { pin: 4, colorName: "Blue", baseColor: "#0284c7", stripeColor: null, signal: "Unused / PoE", role: "Unused in 10/100BASE-T. Used for Gigabit data & Power over Ethernet (PoE).", pairing: "Pair 1" },
  { pin: 5, colorName: "White / Blue", baseColor: "#ffffff", stripeColor: "#0284c7", signal: "Unused / PoE", role: "Unused in 10/100BASE-T. Used for Gigabit data & Power over Ethernet (PoE).", pairing: "Pair 1" },
  { pin: 6, colorName: "Green", baseColor: "#16a34a", stripeColor: null, signal: "RX- (Receive Negative)", role: "Receives negative data signal in 10/100BASE-T Ethernet.", pairing: "Pair 3" },
  { pin: 7, colorName: "White / Brown", baseColor: "#ffffff", stripeColor: "#78350f", signal: "Unused / PoE", role: "Unused in 10/100BASE-T. Used for Gigabit data & Power over Ethernet (PoE).", pairing: "Pair 4" },
  { pin: 8, colorName: "Brown", baseColor: "#78350f", stripeColor: null, signal: "Unused / PoE", role: "Unused in 10/100BASE-T. Used for Gigabit data & Power over Ethernet (PoE).", pairing: "Pair 4" },
];

const T568A_PINS: PinInfo[] = [
  { pin: 1, colorName: "White / Green", baseColor: "#ffffff", stripeColor: "#16a34a", signal: "TX+ (Transmit Positive)", role: "Transmits positive data signal in T568A standard.", pairing: "Pair 3" },
  { pin: 2, colorName: "Green", baseColor: "#16a34a", stripeColor: null, signal: "TX- (Transmit Negative)", role: "Transmits negative data signal in T568A standard.", pairing: "Pair 3" },
  { pin: 3, colorName: "White / Orange", baseColor: "#ffffff", stripeColor: "#ea580c", signal: "RX+ (Receive Positive)", role: "Receives positive data signal in T568A standard.", pairing: "Pair 2" },
  { pin: 4, colorName: "Blue", baseColor: "#0284c7", stripeColor: null, signal: "Unused / PoE", role: "Unused in 10/100BASE-T. Used for Gigabit data & Power over Ethernet (PoE).", pairing: "Pair 1" },
  { pin: 5, colorName: "White / Blue", baseColor: "#ffffff", stripeColor: "#0284c7", signal: "Unused / PoE", role: "Unused in 10/100BASE-T. Used for Gigabit data & Power over Ethernet (PoE).", pairing: "Pair 1" },
  { pin: 6, colorName: "Orange", baseColor: "#ea580c", stripeColor: null, signal: "RX- (Receive Negative)", role: "Receives negative data signal in T568A standard.", pairing: "Pair 2" },
  { pin: 7, colorName: "White / Brown", baseColor: "#ffffff", stripeColor: "#78350f", signal: "Unused / PoE", role: "Unused in 10/100BASE-T. Used for Gigabit data & Power over Ethernet (PoE).", pairing: "Pair 4" },
  { pin: 8, colorName: "Brown", baseColor: "#78350f", stripeColor: null, signal: "Unused / PoE", role: "Unused in 10/100BASE-T. Used for Gigabit data & Power over Ethernet (PoE).", pairing: "Pair 4" },
];

const GENERAL_COMPONENTS: Record<string, { name: string; overview: string; material: string; functionality: string }> = {
  housing: {
    name: "Clear Polycarbonate Housing (8P8C)",
    overview: "Transparent 8-Position 8-Conductor modular plug body that aligns and locks wire pins into network jacks.",
    material: "High-impact UL94V-0 clear polycarbonate thermoplastic casing.",
    functionality: "Provides rigid physical alignment for 8 conductors and houses the top locking clip to secure plug into RJ-45 ports.",
  },
  pins: {
    name: "8 Gold-Plated Contact Blade Pins",
    overview: "Metallic prong blades that pierce wire insulation to form low-resistance electrical contact.",
    material: "Phosphor bronze metal blades with 50-micron hard gold plating.",
    functionality: "Creates direct electrical bridging between UTP copper wires and socket pins in switches, routers, and NICs.",
  },
  clip: {
    name: "Locking Latch Clip",
    overview: "Flexible plastic spring latch on top of the plug that locks the connector into an RJ-45 port.",
    material: "Resilient polycarbonate flexible spring tab.",
    functionality: "Engages with port locking notch, preventing accidental cable disconnection under tension.",
  },
  guide: {
    name: "Untwisted Wire Guide Track (Load Bar)",
    overview: "Internal plastic organizer tray aligning the 8 untwisted wires in parallel channels.",
    material: "High-density polyethylene (HDPE) molded alignment insert.",
    functionality: "Holds wires in exact pin order (1-8) directly beneath the gold contact blade crimp slots.",
  },
  boot: {
    name: "Strain-Relief Boot & Cable Entry",
    overview: "Flexible rubber boot supporting the junction between UTP cable jacket and modular plug.",
    material: "Molded PVC or Thermoplastic Elastomer (TPE) rubber boot.",
    functionality: "Prevents sharp wire bends at the connector base, reducing stress on crimped copper conductors.",
  },
};

// ============================================================================
// THEME-AWARE DIRECT 3D LABEL BADGE WITH UNCLUTTERED LEADER LINES
// ============================================================================
function DirectLabelBadge({
  title,
  targetX,
  targetY,
  targetZ = 0,
  badgeX,
  badgeY,
  badgeZ = 0,
  active,
}: {
  title: string;
  targetX: number;
  targetY: number;
  targetZ?: number;
  badgeX: number;
  badgeY: number;
  badgeZ?: number;
  active: boolean;
}) {
  return (
    <group>
      {/* Dashed Leader Line */}
      <line>
        <bufferGeometry
          attach="geometry"
          onUpdate={(geo) =>
            geo.setFromPoints([
              new THREE.Vector3(badgeX, badgeY, badgeZ),
              new THREE.Vector3(targetX, targetY, targetZ),
            ])
          }
        />
        <lineDashedMaterial
          attach="material"
          color={active ? "#f59e0b" : "#94a3b8"}
          dashSize={0.15}
          gapSize={0.1}
          linewidth={1.5}
        />
      </line>

      {/* Target Sphere Pointer Dot */}
      <mesh position={[targetX, targetY, targetZ]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color={active ? "#f59e0b" : "#64748b"} />
      </mesh>

      {/* HTML Floating Badge */}
      <Html position={[badgeX, badgeY, badgeZ]} center distanceFactor={10}>
        <div
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap transition-all duration-200 border pointer-events-none shadow-md ${
            active
              ? "bg-amber-500 text-slate-950 border-amber-300 shadow-xl scale-110"
              : "bg-background/95 dark:bg-slate-900/95 text-foreground border-border"
          }`}
        >
          {title}
        </div>
      </Html>
    </group>
  );
}

// ============================================================================
// HIGH-FIDELITY RJ-45 3D MODEL COMPONENT
// ============================================================================
function Rj453DModel({
  pins,
  explodedView,
  showPinNumbers,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
}: {
  pins: PinInfo[];
  explodedView: boolean;
  showPinNumbers: boolean;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const housingPosY = explodedView ? 2.6 : 0;
  const housingPosZ = explodedView ? 0.8 : 0;
  const pinsPosY = explodedView ? 1.0 : 0;
  const guidePosY = explodedView ? 0.5 : 0;

  return (
    <group ref={groupRef} rotation={[0.25, -0.4, 0.05]}>
      {/* 1. CLEAR POLYCARBONATE HOUSING & LOCKING TAB */}
      <group position={[0, housingPosY, housingPosZ]}>
        {/* Main Body Transparent Shell */}
        <mesh
          position={[0, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect("housing");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("housing");
          }}
          onPointerOut={() => onHover(null)}
        >
          <boxGeometry args={[3.6, 2.4, 4.2]} />
          <meshPhysicalMaterial
            color="#f8fafc"
            roughness={0.12}
            metalness={0.05}
            transparent={true}
            opacity={0.42}
            transmission={0.88}
            side={THREE.DoubleSide}
            emissive={selectedId === "housing" || hoveredId === "housing" ? "#f59e0b" : "#000000"}
            emissiveIntensity={selectedId === "housing" ? 0.45 : 0.1}
          />
        </mesh>

        {/* Bottom Keying Ridge */}
        <mesh position={[0, -1.25, 0]}>
          <boxGeometry args={[2.2, 0.15, 3.8]} />
          <meshStandardMaterial color="#cbd5e1" transparent opacity={0.5} />
        </mesh>

        {/* Top Locking Spring Latch */}
        <group position={[0, 1.45, -0.6]} rotation={[-0.3, 0, 0]}>
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              onSelect("clip");
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHover("clip");
            }}
            onPointerOut={() => onHover(null)}
          >
            <boxGeometry args={[1.2, 0.35, 2.4]} />
            <meshStandardMaterial
              color="#e2e8f0"
              roughness={0.2}
              metalness={0.1}
              transparent={true}
              opacity={0.75}
              side={THREE.DoubleSide}
              emissive={selectedId === "clip" || hoveredId === "clip" ? "#f59e0b" : "#000000"}
              emissiveIntensity={selectedId === "clip" ? 0.5 : 0.15}
            />
          </mesh>
          {/* Latch end stop bump */}
          <mesh position={[0, 0.25, 1.0]}>
            <boxGeometry args={[1.3, 0.2, 0.3]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        </group>

        {/* Polycarbonate Housing Badge */}
        <DirectLabelBadge
          title="Polycarbonate Housing"
          targetX={1.8}
          targetY={0.8}
          targetZ={-0.5}
          badgeX={3.8}
          badgeY={2.4}
          badgeZ={-0.5}
          active={selectedId === "housing"}
        />

        {/* Locking Latch Clip Badge */}
        <DirectLabelBadge
          title="Locking Latch Clip"
          targetX={0}
          targetY={1.6}
          targetZ={-0.5}
          badgeX={0}
          badgeY={3.6}
          badgeZ={-0.5}
          active={selectedId === "clip"}
        />
      </group>

      {/* 2. 8 GOLD-PLATED CONTACT BLADE PINS */}
      <group position={[0, pinsPosY, 0]}>
        {pins.map((p, idx) => {
          const xPos = -1.225 + idx * 0.35;
          const pinId = `pin-${p.pin}`;
          const isSelected = selectedId === pinId || selectedId === "pins";
          const isHovered = hoveredId === pinId || hoveredId === "pins";

          return (
            <group key={p.pin} position={[xPos, 1.05, 1.65]}>
              {/* Top Contact Prism Blade */}
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(pinId);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  onHover(pinId);
                }}
                onPointerOut={() => onHover(null)}
              >
                <boxGeometry args={[0.22, 0.55, 0.45]} />
                <meshStandardMaterial
                  color="#eab308"
                  metalness={0.95}
                  roughness={0.15}
                  emissive={isSelected || isHovered ? "#f59e0b" : "#000000"}
                  emissiveIntensity={isSelected ? 0.6 : 0.2}
                />
              </mesh>

              {/* Bottom Crimp Teeth Blade Extension */}
              <mesh position={[0, -0.35, 0]}>
                <boxGeometry args={[0.16, 0.3, 0.3]} />
                <meshStandardMaterial color="#ca8a04" metalness={0.9} roughness={0.2} />
              </mesh>

              {/* Optional Pin Number Badge */}
              {showPinNumbers && (
                <Html position={[0, 0.6, 0]} center distanceFactor={9}>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black pointer-events-none transition-all shadow-md ${
                      isSelected
                        ? "bg-amber-400 text-slate-950 scale-125 border-2 border-amber-600"
                        : "bg-slate-900/90 dark:bg-slate-950 text-amber-400 border border-amber-500/60"
                    }`}
                  >
                    {p.pin}
                  </div>
                </Html>
              )}
            </group>
          );
        })}

        {/* Gold Pins Overall Badge */}
        <DirectLabelBadge
          title="Gold Contact Blades"
          targetX={-1.225}
          targetY={1.1}
          targetZ={1.65}
          badgeX={-3.8}
          badgeY={2.4}
          badgeZ={1.65}
          active={selectedId === "pins"}
        />
      </group>

      {/* 3. INTERNAL LOAD BAR / WIRE GUIDE TRACK */}
      <group position={[0, guidePosY, 0]}>
        <mesh
          position={[0, -0.4, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect("guide");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("guide");
          }}
          onPointerOut={() => onHover(null)}
        >
          <boxGeometry args={[3.2, 0.3, 3.4]} />
          <meshStandardMaterial
            color="#f1f5f9"
            roughness={0.4}
            transparent={true}
            opacity={0.7}
            emissive={selectedId === "guide" || hoveredId === "guide" ? "#f59e0b" : "#000000"}
            emissiveIntensity={selectedId === "guide" ? 0.45 : 0.1}
          />
        </mesh>

        <DirectLabelBadge
          title="Untwisted Wire Guide"
          targetX={1.6}
          targetY={-0.4}
          targetZ={0}
          badgeX={3.8}
          badgeY={-2.2}
          badgeZ={0}
          active={selectedId === "guide"}
        />
      </group>

      {/* 4. 8 COLOR-CODED UTP CONDUCTOR WIRES (Parallel inside plug) */}
      <group position={[0, 0, 0]}>
        {pins.map((p, idx) => {
          const xPos = -1.225 + idx * 0.35;
          const pinId = `pin-${p.pin}`;
          const isSelected = selectedId === pinId;
          const isHovered = hoveredId === pinId;

          return (
            <group key={`wire-${p.pin}`} position={[xPos, -0.2, -0.2]}>
              {/* Base Wire Cylinder */}
              <mesh
                rotation={[Math.PI / 2, 0, 0]}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(pinId);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  onHover(pinId);
                }}
                onPointerOut={() => onHover(null)}
              >
                <cylinderGeometry args={[0.13, 0.13, 3.6, 16]} />
                <meshStandardMaterial
                  color={p.baseColor}
                  roughness={0.3}
                  emissive={isSelected || isHovered ? "#f59e0b" : "#000000"}
                  emissiveIntensity={isSelected ? 0.5 : 0.1}
                />
              </mesh>

              {/* Stripe Markings for White-Striped Wires */}
              {p.stripeColor && (
                <group>
                  {[-1.2, -0.4, 0.4, 1.2].map((zOffset, sIdx) => (
                    <mesh key={sIdx} position={[0, 0, zOffset]} rotation={[Math.PI / 2, 0, 0]}>
                      <cylinderGeometry args={[0.135, 0.135, 0.28, 16]} />
                      <meshStandardMaterial
                        color={p.stripeColor!}
                        roughness={0.3}
                        emissive={isSelected || isHovered ? "#f59e0b" : "#000000"}
                        emissiveIntensity={isSelected ? 0.5 : 0.1}
                      />
                    </mesh>
                  ))}
                </group>
              )}
            </group>
          );
        })}
      </group>

      {/* 5. REAR TWISTED-PAIR CABLE ENTRY & RUBBER STRAIN BOOT */}
      <group position={[0, -0.1, -3.6]}>
        {/* Molded Rubber Strain Relief Boot */}
        <mesh
          rotation={[Math.PI / 2, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect("boot");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("boot");
          }}
          onPointerOut={() => onHover(null)}
        >
          <cylinderGeometry args={[1.25, 1.5, 2.4, 32]} />
          <meshStandardMaterial
            color="#334155"
            roughness={0.5}
            emissive={selectedId === "boot" || hoveredId === "boot" ? "#f59e0b" : "#000000"}
            emissiveIntensity={selectedId === "boot" ? 0.45 : 0.15}
          />
        </mesh>

        {/* Boot Ridged Flex Rings */}
        {[-0.8, -0.3, 0.2, 0.7].map((zPos, rIdx) => (
          <mesh key={rIdx} position={[0, 0, zPos]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.32, 1.32, 0.18, 32]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
        ))}

        {/* UTP Cable Outer Blue PVC Jacket Extension */}
        <mesh position={[0, 0, -2.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.1, 1.1, 2.2, 32]} />
          <meshStandardMaterial color="#0284c7" roughness={0.35} />
        </mesh>

        {/* Strain Boot Badge */}
        <DirectLabelBadge
          title="Strain-Relief Boot"
          targetX={-1.25}
          targetY={-0.4}
          targetZ={0}
          badgeX={-3.5}
          badgeY={-2.6}
          badgeZ={-1.0}
          active={selectedId === "boot"}
        />
      </group>
    </group>
  );
}

// ============================================================================
// MAIN RJ-45 CONNECTOR COMPONENT
// ============================================================================
export default function Rj45Connector({ props, values }: Props) {
  const wiringStandard =
    (values.wiringStandard as string) ||
    (props?.wiringStandard as string) ||
    "t568b";
  const explodedView = Boolean(values.explodedView ?? props?.explodedView ?? false);
  const showPinNumbers = Boolean(values.showPinNumbers ?? props?.showPinNumbers ?? true);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const pins = useMemo(() => {
    return wiringStandard === "t568a" ? T568A_PINS : T568B_PINS;
  }, [wiringStandard]);

  // Selected Pin or Component Detail
  const activeDetail = useMemo(() => {
    if (!selectedId) {
      return {
        title: `RJ-45 Modular Plug (${wiringStandard.toUpperCase()} Standard)`,
        overview: `Standard 8-pin 8-conductor (8P8C) modular plug configured for ${wiringStandard.toUpperCase()} wiring. Click pins or components to inspect pinout signals.`,
        material: "Polycarbonate casing with 50-micron gold contact blades and stranded 24 AWG UTP wires.",
        functionality: "Pairs 1 & 4 handle Gigabit/PoE data. Pairs 2 & 3 transmit and receive 10/100BASE-T differential signals.",
      };
    }

    if (selectedId.startsWith("pin-")) {
      const pinNum = parseInt(selectedId.replace("pin-", ""), 10);
      const p = pins.find((item) => item.pin === pinNum);
      if (p) {
        return {
          title: `Pin ${p.pin} — ${p.colorName} (${p.pairing})`,
          overview: `${p.signal}: ${p.role}`,
          material: `Color Code: ${p.colorName}. Insulation material: High-Density Polyethylene (HDPE).`,
          functionality: `Signal Line: ${p.signal}. Assigned to ${p.pairing} in ${wiringStandard.toUpperCase()} Ethernet standard.`,
        };
      }
    }

    if (GENERAL_COMPONENTS[selectedId]) {
      const comp = GENERAL_COMPONENTS[selectedId];
      return {
        title: comp.name,
        overview: comp.overview,
        material: comp.material,
        functionality: comp.functionality,
      };
    }

    return {
      title: "RJ-45 UTP Connector",
      overview: "Standardized 8P8C modular connector for twisted-pair Ethernet cables.",
      material: "Polycarbonate plug body with gold contact blades.",
      functionality: "Terminates UTP cable for connection to network interface ports.",
    };
  }, [selectedId, pins, wiringStandard]);

  return (
    <div className="w-full space-y-4">
      {/* 8-PIN QUICK SELECTOR HUD TABS */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-muted/40 border border-border">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Layers className="w-4 h-4 text-amber-500" />
          <span>Pinout Inspector:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setSelectedId(null)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              selectedId === null
                ? "bg-amber-500 text-slate-950 font-bold shadow-md"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            Overview
          </button>
          {pins.map((p) => {
            const pinId = `pin-${p.pin}`;
            const isSel = selectedId === pinId;
            return (
              <button
                key={p.pin}
                onClick={() => setSelectedId(pinId)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-1.5 ${
                  isSel
                    ? "bg-amber-500 text-slate-950 border-amber-300 shadow-md scale-105"
                    : "bg-background text-foreground border-border hover:bg-muted"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-slate-700 inline-block shadow-sm"
                  style={{ backgroundColor: p.stripeColor || p.baseColor }}
                />
                P{p.pin}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D CANVAS VIEWPORT (THEME-AWARE CONTAINER) */}
      <div className="w-full border rounded-2xl bg-slate-100/80 dark:bg-slate-950/90 relative overflow-hidden shadow-inner border-border h-[460px] flex items-center justify-center transition-colors duration-300">
        {/* Ambient Radial Dot Grid Overlay */}
        <div
          className="absolute inset-0 opacity-25 dark:opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <Canvas camera={{ position: [0, 2.8, 9.8], fov: 45 }} className="w-full h-full relative z-10 select-none">
          <ambientLight intensity={1.1} />
          <directionalLight position={[10, 15, 12]} intensity={1.8} />
          <directionalLight position={[-10, -8, -10]} intensity={0.7} color="#60a5fa" />
          <pointLight position={[0, 6, 0]} intensity={1.3} color="#fef08a" />

          <Rj453DModel
            pins={pins}
            explodedView={explodedView}
            showPinNumbers={showPinNumbers}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={(id) => setSelectedId((prev) => (prev === id ? null : id))}
            onHover={setHoveredId}
          />

          <OrbitControls
            makeDefault
            enablePan={true}
            enableZoom={true}
            minDistance={4}
            maxDistance={18}
            maxPolarAngle={Math.PI / 2 + 0.2}
          />
        </Canvas>

        {/* TOP LEFT ACTIVE STANDARD HUD BADGE */}
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-background/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs shadow-md z-20">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Standard:</span>
            <span className="font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {wiringStandard.toUpperCase()}
            </span>
          </div>
        </div>

        {/* TOP RIGHT 3D ROTATION HINT */}
        <div className="absolute top-3 right-3 hidden sm:flex items-center gap-1.5 text-[11px] text-foreground bg-background/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-md z-20">
          <Rotate3D className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>3D Orbit Active (Click & Drag to Rotate)</span>
        </div>

        {/* BOTTOM RIGHT HELP TOOLTIP */}
        <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground bg-background/80 dark:bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border z-20">
          <Info className="w-3.5 h-3.5 text-amber-500" />
          <span>Click 3D meshes or top tabs to inspect pinout</span>
        </div>
      </div>

      {/* DETAILS GRID BELOW 3D CANVAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Zap className="w-4 h-4 text-amber-500" /> Pin / Component Overview
          </h5>
          <h6 className="text-xs font-bold text-amber-600 dark:text-amber-400">{activeDetail.title}</h6>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {activeDetail.overview}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" /> Material & Construction
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {activeDetail.material}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Layers className="w-4 h-4 text-amber-500" /> Signal & Functionality
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {activeDetail.functionality}
          </p>
        </div>
      </div>
    </div>
  );
}
