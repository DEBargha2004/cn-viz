import { useState, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { type VizMeta } from "../types";
import { Layers, Zap, ShieldCheck, Cable, Info, Compass, Rotate3D } from "lucide-react";

export const vizMeta: VizMeta = {
  key: "network-cable-cutaway",
  title: "Cable Cutaway Diagram",
  category: "network",
  renderer: "svg",
  params: [
    {
      key: "cableType",
      type: "select",
      label: "Cable Type",
      default: "coax",
      options: [
        { label: "Coaxial Cable (Coax)", value: "coax" },
        { label: "Unshielded vs Shielded Pair (UTP vs STP)", value: "utp-stp" },
        { label: "Bare Twisted-Pair Cable", value: "twisted-pair" },
        { label: "Optical Fiber Construction", value: "fiber" },
      ],
    },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

interface LayerDetail {
  id: string;
  name: string;
  overview: string;
  material: string;
  functionality: string;
}

// Helper hook to create a 100% mathematically seamless metallic braided weave texture
function useBraidedMetalTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // Base background: Metallic Silver Foil
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(0, 0, 512, 512);

    const step = 32; 
    const bandWidth = 14;

    // Draw Clockwise Silver Ribbons
    for (let x = -512; x <= 1024; x += step) {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + bandWidth, 0);
      ctx.lineTo(x + 512 + bandWidth, 512);
      ctx.lineTo(x + 512, 512);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#64748b";
      ctx.beginPath();
      ctx.moveTo(x + bandWidth, 0);
      ctx.lineTo(x + bandWidth + 4, 0);
      ctx.lineTo(x + 512 + bandWidth + 4, 512);
      ctx.lineTo(x + 512 + bandWidth, 512);
      ctx.closePath();
      ctx.fill();
    }

    // Draw Counter-Clockwise Interwoven Ribbons
    for (let x = -512; x <= 1024; x += step) {
      ctx.fillStyle = "#f1f5f9";
      ctx.beginPath();
      ctx.moveTo(x, 512);
      ctx.lineTo(x + bandWidth, 512);
      ctx.lineTo(x + 512 + bandWidth, 0);
      ctx.lineTo(x + 512, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.moveTo(x + bandWidth, 512);
      ctx.lineTo(x + bandWidth + 4, 512);
      ctx.lineTo(x + 512 + bandWidth + 4, 0);
      ctx.lineTo(x + 512 + bandWidth, 0);
      ctx.closePath();
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 2);
    return texture;
  }, []);
}

// Helper hook to create a high-contrast woven yellow Kevlar aramid yarn texture
function useKevlarTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // Golden Kevlar Base
    ctx.fillStyle = "#eab308";
    ctx.fillRect(0, 0, 512, 512);

    const step = 32;
    const bandWidth = 14;

    // Draw Clockwise Golden Aramid Threads
    for (let x = -512; x <= 1024; x += step) {
      ctx.fillStyle = "#fef08a"; // Bright Yellow Thread
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + bandWidth, 0);
      ctx.lineTo(x + 512 + bandWidth, 512);
      ctx.lineTo(x + 512, 512);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ca8a04"; // Darker Gold Shadow
      ctx.beginPath();
      ctx.moveTo(x + bandWidth, 0);
      ctx.lineTo(x + bandWidth + 3, 0);
      ctx.lineTo(x + 512 + bandWidth + 3, 512);
      ctx.lineTo(x + 512 + bandWidth, 512);
      ctx.closePath();
      ctx.fill();
    }

    // Draw Counter-Clockwise Interwoven Aramid Threads
    for (let x = -512; x <= 1024; x += step) {
      ctx.fillStyle = "#facc15"; // Warm Yellow Thread
      ctx.beginPath();
      ctx.moveTo(x, 512);
      ctx.lineTo(x + bandWidth, 512);
      ctx.lineTo(x + 512 + bandWidth, 0);
      ctx.lineTo(x + 512, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#a16207"; // Deep Amber Contrast Line
      ctx.beginPath();
      ctx.moveTo(x + bandWidth, 512);
      ctx.lineTo(x + bandWidth + 4, 512);
      ctx.lineTo(x + 512 + bandWidth + 4, 0);
      ctx.lineTo(x + 512 + bandWidth, 0);
      ctx.closePath();
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 2);
    return texture;
  }, []);
}

// Parametric 3D Helix Curve for Full Wire Length
class HelixCurve extends THREE.Curve<THREE.Vector3> {
  scale: number;
  twists: number;
  phaseOffset: number;
  radius: number;
  tStart: number;
  tEnd: number;

  constructor(scale = 8.5, twists = 4, phaseOffset = 0, radius = 0.65, tStart = 0, tEnd = 1) {
    super();
    this.scale = scale;
    this.twists = twists;
    this.phaseOffset = phaseOffset;
    this.radius = radius;
    this.tStart = tStart;
    this.tEnd = tEnd;
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const currentT = this.tStart + t * (this.tEnd - this.tStart);
    const x = (currentT - 0.5) * this.scale;
    const angle = currentT * Math.PI * 2 * this.twists + this.phaseOffset;
    const y = Math.sin(angle) * this.radius;
    const z = Math.cos(angle) * this.radius;
    return optionalTarget.set(x, y, z);
  }
}

export default function CableCutaway({ props, values }: Props) {
  const cableType =
    (values.cableType as string) ||
    (props?.cableType as string) ||
    "coax";

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null);

  // Database of cable layers
  const layerData = useMemo<Record<string, Record<string, LayerDetail>>>(() => {
    return {
      coax: {
        "plastic-cover": {
          id: "plastic-cover",
          name: "Plastic Outer Cover",
          overview: "Outermost protective pink/magenta PVC jacket enclosing the coaxial cable.",
          material: "Flexible heavy-duty PVC jacket.",
          functionality: "Protects internal components from physical damage, moisture, and environmental wear.",
        },
        "outer-insulator": {
          id: "outer-insulator",
          name: "Outer Insulator (Padding)",
          overview: "Secondary insulating cushion separating outer cover from metallic shield.",
          material: "Protective plastic padding / synthetic insulation sheath.",
          functionality: "Provides mechanical cushioning and electrical insulation for the outer shield.",
        },
        "outer-conductor": {
          id: "outer-conductor",
          name: "Outer Conductor (Shield)",
          overview: "Braided metallic wire mesh surrounding the inner dielectric insulator.",
          material: "Tinned copper braid mesh / aluminum foil shield.",
          functionality: "Blocks external electromagnetic interference (EMI) and serves as the electrical ground return path.",
        },
        insulator: {
          id: "insulator",
          name: "Inner Dielectric Insulator",
          overview: "Solid dielectric insulating cylinder separating inner and outer conductors.",
          material: "Polyethylene (PE) or Teflon (PTFE) insulator.",
          functionality: "Maintains uniform spacing between conductors to preserve constant impedance ($50\\Omega$ or $75\\Omega$).",
        },
        "inner-conductor": {
          id: "inner-conductor",
          name: "Inner Conductor Core",
          overview: "Solid central metallic wire core carrying high-frequency electrical signals.",
          material: "Solid gold-plated copper wire or copper-clad steel (CCS) core.",
          functionality: "Transmits electrical signal voltage pulses across the transmission line.",
        },
      },
      "utp-stp": {
        "plastic-cover": {
          id: "plastic-cover",
          name: "Plastic Outer Cover",
          overview: "Protective outer jacket bundling wire pairs together.",
          material: "Flame-retardant PVC or Low Smoke Zero Halogen (LSZH) polymer.",
          functionality: "Protects inner conductors against mechanical abrasion, moisture, and bending stress.",
        },
        "metal-shield": {
          id: "metal-shield",
          name: "Metallic Shield (STP)",
          overview: "Woven metallic mesh or foil shield surrounding the twisted wire pairs.",
          material: "Aluminum/Mylar foil or tinned copper wire braid.",
          functionality: "Prevents electromagnetic interference (EMI) and eliminates alien crosstalk between adjacent cables.",
        },
        conductors: {
          id: "conductors",
          name: "Twisted Pairs",
          overview: "Color-coded copper wire pairs spirally twisted in balanced pairs.",
          material: "23/24 AWG solid copper wires with polyethylene insulation.",
          functionality: "Differential signaling ensures noise picked up equally on both wires is cancelled at the receiver.",
        },
      },
      "twisted-pair": {
        insulator: {
          id: "insulator",
          name: "Plastic Insulation Sheath",
          overview: "Dielectric plastic coating enclosing each individual copper wire.",
          material: "High-density Polyethylene (HDPE) or FEP plastic.",
          functionality: "Prevents electrical shorts between conductors and maintains uniform differential impedance.",
        },
        conductors: {
          id: "conductors",
          name: "Solid Copper Conductor",
          overview: "Bare solid copper metallic core carrying electrical signals.",
          material: "Solid pure copper wire core.",
          functionality: "Transmits differential electrical voltage pulses across the transmission line.",
        },
      },
      fiber: {
        jacket: {
          id: "jacket",
          name: "Outer Protective Jacket",
          overview: "Extruded outer orange/red PVC plastic sheath protecting internal optical elements.",
          material: "Polyurethane or flame-retardant PVC sheath.",
          functionality: "Shields delicate glass components against crushing, abrasion, and environmental exposure.",
        },
        kevlar: {
          id: "kevlar",
          name: "Du Pont Kevlar Strength Member",
          overview: "High-tensile aramid yarn strands surrounding the primary buffer tube.",
          material: "Woven Du Pont Kevlar aramid yarn fibers.",
          functionality: "Absorbs mechanical pulling tension during installation, protecting the glass core.",
        },
        buffer: {
          id: "buffer",
          name: "Plastic Buffer Coating",
          overview: "Protective plastic buffer layer encasing the glass cladding.",
          material: "Hard plastic / gel-filled buffer tube.",
          functionality: "Cushions the glass fiber against micro-bending signal loss and physical impact.",
        },
        cladding: {
          id: "cladding",
          name: "Glass Cladding (n2)",
          overview: "Outer glass cladding layer with lower refractive index ($n_2 < n_1$).",
          material: "Ultra-pure silica glass with lower refractive index.",
          functionality: "Reflects light rays back into the core via Total Internal Reflection.",
        },
        core: {
          id: "core",
          name: "Glass Core (n1)",
          overview: "Ultra-pure central silica glass core carrying high-speed optical pulses ($n_1$).",
          material: "Ultra-pure fused silica glass ($SiO_2$).",
          functionality: "Confines and guides light signals across long distances with ultra-low attenuation.",
        },
      },
    };
  }, []);

  const activeLayerMap = layerData[cableType] || layerData["coax"];

  const activeLayer = useMemo<LayerDetail>(() => {
    if (selectedLayerId && activeLayerMap[selectedLayerId]) {
      return activeLayerMap[selectedLayerId];
    }
    return Object.values(activeLayerMap)[0];
  }, [selectedLayerId, activeLayerMap]);

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none">
      {/* INTERACTIVE LAYER SELECTOR TOOLBAR */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-muted/30 border border-slate-200/80 dark:border-slate-800">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-500" /> Select Layer:
        </span>
        {Object.values(activeLayerMap).map((layer) => {
          const isSelected = activeLayer.id === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => setSelectedLayerId(layer.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                isSelected
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold"
                  : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
              }`}
            >
              {layer.name}
            </button>
          );
        })}
      </div>

      {/* 3D CANVAS CONTAINER */}
      <div className="w-full border rounded-2xl bg-slate-100/80 dark:bg-slate-950/90 relative overflow-hidden shadow-inner border-border h-[460px] sm:h-[500px] md:h-[540px] flex items-center justify-center transition-colors duration-300">
        {/* Ambient Radial Dot Grid Overlay */}
        <div
          className="absolute inset-0 opacity-25 dark:opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Three.js Canvas */}
        <Canvas
          camera={{ position: [0, 2.0, 7.8], fov: 45 }}
          className="w-full h-full cursor-grab active:cursor-grabbing relative z-10"
        >
          <ambientLight intensity={1.3} />
          <directionalLight position={[10, 15, 12]} intensity={2.0} />
          <directionalLight position={[-10, -8, -10]} intensity={0.8} color="#60a5fa" />
          <pointLight position={[0, 6, 0]} intensity={1.4} color="#f59e0b" />

          {/* Orbit Controls */}
          <OrbitControls
            enableZoom={true}
            minDistance={4}
            maxDistance={15}
            maxPolarAngle={Math.PI / 2 + 0.25}
            makeDefault
          />

          {/* 3D Model Variants */}
          {cableType === "coax" && (
            <CoaxTextbook3DModel
              selectedLayerId={activeLayer.id}
              hoveredLayerId={hoveredLayerId}
              onSelect={setSelectedLayerId}
              onHover={setHoveredLayerId}
            />
          )}

          {cableType === "utp-stp" && (
            <UtpStp3DModel
              selectedLayerId={activeLayer.id}
              hoveredLayerId={hoveredLayerId}
              onSelect={setSelectedLayerId}
              onHover={setHoveredLayerId}
            />
          )}

          {cableType === "twisted-pair" && (
            <TwistedPair3DModel
              selectedLayerId={activeLayer.id}
              hoveredLayerId={hoveredLayerId}
              onSelect={setSelectedLayerId}
              onHover={setHoveredLayerId}
            />
          )}

          {cableType === "fiber" && (
            <Fiber3DModel
              selectedLayerId={activeLayer.id}
              hoveredLayerId={hoveredLayerId}
              onSelect={setSelectedLayerId}
              onHover={setHoveredLayerId}
            />
          )}
        </Canvas>

        {/* HUD OVERLAY AT TOP LEFT */}
        <div className="absolute top-3 left-3 bg-background/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2.5 text-xs shadow-md z-20">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Cable className="w-4 h-4 text-amber-500" />
            <span>Mode: {cableType.toUpperCase()}</span>
          </div>
          <span className="text-muted-foreground">|</span>
          <div className="flex items-center gap-1 text-[11px]">
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-muted-foreground">Active:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {activeLayer.name}
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
          <span>Click 3D meshes or top tabs to inspect construction</span>
        </div>
      </div>

      {/* DETAILS GRID BELOW 3D CANVAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Zap className="w-4 h-4 text-amber-500" /> Layer Overview
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {activeLayer.overview}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" /> Material & Construction
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {activeLayer.material}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Layers className="w-4 h-4 text-amber-500" /> Physical Functionality
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {activeLayer.functionality}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENT: SOLID END CAPS FOR CONDUCTORS AND INSULATORS
// ============================================================================
function SolidEndCap({
  curve,
  tVal,
  innerRadius = 0,
  outerRadius,
  color,
  layerId = "conductors",
  selectedLayerId,
  hoveredLayerId,
  onSelect,
  onHover,
}: {
  curve: THREE.Curve<THREE.Vector3>;
  tVal: number;
  innerRadius?: number;
  outerRadius: number;
  color: string;
  layerId?: string;
  selectedLayerId?: string | null;
  hoveredLayerId?: string | null;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
}) {
  const { position, quaternion } = useMemo(() => {
    const clampedT = Math.max(0.001, Math.min(0.999, tVal));
    const point = curve.getPoint(clampedT);
    const tangent = curve.getTangent(clampedT).normalize();

    const quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);

    return { position: point, quaternion: quat };
  }, [curve, tVal]);

  const active = selectedLayerId === layerId || hoveredLayerId === layerId;

  return (
    <mesh
      position={position}
      quaternion={quaternion}
      onClick={(e) => {
        if (onSelect) {
          e.stopPropagation();
          onSelect(layerId);
        }
      }}
      onPointerOver={(e) => {
        if (onHover) {
          e.stopPropagation();
          onHover(layerId);
        }
      }}
      onPointerOut={() => onHover && onHover(null)}
    >
      {innerRadius > 0 ? (
        <ringGeometry args={[innerRadius, outerRadius, 32]} />
      ) : (
        <circleGeometry args={[outerRadius, 32]} />
      )}
      <meshStandardMaterial
        color={color}
        roughness={0.2}
        metalness={innerRadius === 0 ? 0.9 : 0.3}
        side={THREE.DoubleSide}
        emissive={active ? "#f59e0b" : "#000000"}
        emissiveIntensity={selectedLayerId === layerId ? 0.5 : 0.1}
      />
    </mesh>
  );
}

// ============================================================================
// 1. COAXIAL CABLE 3D MODEL - HIGH CONTRAST & ACCURATE CALLOUT POSITIONING
// ============================================================================
function CoaxTextbook3DModel({
  selectedLayerId,
  hoveredLayerId,
  onSelect,
  onHover,
}: {
  selectedLayerId: string | null;
  hoveredLayerId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const braidedTexture = useBraidedMetalTexture();

  return (
    <group ref={groupRef} rotation={[0.25, -0.45, 0.05]}>
      {/* FULL SOLID LEFT END CLOSING DISK LID (Seals entire left cross-section at X = -4.20) */}
      <mesh position={[-4.20, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[1.80, 32]} />
        <meshStandardMaterial color="#be185d" roughness={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* 1. PLASTIC COVER (Hot Pink Sheath) - X = -4.20 -> -2.60 (Length = 1.60, Center = -3.40) */}
      <group position={[-3.40, 0, 0]}>
        <mesh
          rotation={[0, 0, Math.PI / 2]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect("plastic-cover");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("plastic-cover");
          }}
          onPointerOut={() => onHover(null)}
        >
          <cylinderGeometry args={[1.8, 1.8, 1.6, 32, 1, true]} />
          <meshStandardMaterial
            color="#f43f5e"
            roughness={0.25}
            metalness={0.1}
            side={THREE.DoubleSide}
            emissive={
              selectedLayerId === "plastic-cover" || hoveredLayerId === "plastic-cover"
                ? "#f59e0b"
                : "#000000"
            }
            emissiveIntensity={selectedLayerId === "plastic-cover" ? 0.45 : 0.15}
          />
        </mesh>
        {/* Right Step Solid Ring Lid (X = -2.60) */}
        <mesh position={[0.80, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[1.45, 1.8, 32]} />
          <meshStandardMaterial color="#be185d" roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 2. OUTER INSULATOR (Cool Charcoal Padding) - X = -4.19 -> -1.30 (Length = 2.89, Center = -2.745) */}
      <group position={[-2.745, 0, 0]}>
        <mesh
          rotation={[0, 0, Math.PI / 2]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect("outer-insulator");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("outer-insulator");
          }}
          onPointerOut={() => onHover(null)}
        >
          <cylinderGeometry args={[1.45, 1.45, 2.89, 32, 1, true]} />
          <meshStandardMaterial
            color="#334155"
            roughness={0.35}
            metalness={0.2}
            side={THREE.DoubleSide}
            emissive={
              selectedLayerId === "outer-insulator" || hoveredLayerId === "outer-insulator"
                ? "#f59e0b"
                : "#000000"
            }
            emissiveIntensity={selectedLayerId === "outer-insulator" ? 0.45 : 0.15}
          />
        </mesh>
        {/* Right Step Solid Ring Lid (X = -1.30) */}
        <mesh position={[1.445, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[1.15, 1.45, 32]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 3. OUTER CONDUCTOR (BRIGHT SEAMLESS METALLIC BRAIDED SHIELD) - X = -4.18 -> 0.00 (Length = 4.18, Center = -2.09) */}
      <group position={[-2.09, 0, 0]}>
        <mesh
          rotation={[0, 0, Math.PI / 2]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect("outer-conductor");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("outer-conductor");
          }}
          onPointerOut={() => onHover(null)}
        >
          <cylinderGeometry args={[1.15, 1.15, 4.18, 64, 1, true]} />
          <meshStandardMaterial
            map={braidedTexture}
            color="#ffffff"
            metalness={0.85}
            roughness={0.2}
            side={THREE.DoubleSide}
            emissive={
              selectedLayerId === "outer-conductor" || hoveredLayerId === "outer-conductor"
                ? "#f59e0b"
                : "#000000"
            }
            emissiveIntensity={selectedLayerId === "outer-conductor" ? 0.5 : 0.05}
          />
        </mesh>

        {/* Right Step Solid Metallic Ring Lid (X = 0.00) */}
        <mesh position={[2.09, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.82, 1.15, 32]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 4. INNER DIELECTRIC INSULATOR (Ivory Cream) - X = -4.17 -> +1.80 (Length = 5.97, Center = -1.185) */}
      <group position={[-1.185, 0, 0]}>
        <mesh
          rotation={[0, 0, Math.PI / 2]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect("insulator");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("insulator");
          }}
          onPointerOut={() => onHover(null)}
        >
          <cylinderGeometry args={[0.82, 0.82, 5.97, 32, 1, true]} />
          <meshStandardMaterial
            color="#fef3c7"
            roughness={0.2}
            metalness={0.1}
            side={THREE.DoubleSide}
            emissive={
              selectedLayerId === "insulator" || hoveredLayerId === "insulator"
                ? "#f59e0b"
                : "#000000"
            }
            emissiveIntensity={selectedLayerId === "insulator" ? 0.45 : 0.15}
          />
        </mesh>
        {/* Right Step Ring Lid (X = +1.80) */}
        <mesh position={[2.985, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.38, 0.82, 32]} />
          <meshStandardMaterial color="#fef9c3" roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 5. INNER CONDUCTOR CORE (Solid Gold Metal Rod) - X = -4.16 -> +3.60 (Length = 7.76, Center = -0.28) */}
      <group position={[-0.28, 0, 0]}>
        <mesh
          rotation={[0, 0, Math.PI / 2]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect("inner-conductor");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("inner-conductor");
          }}
          onPointerOut={() => onHover(null)}
        >
          <cylinderGeometry args={[0.38, 0.38, 7.76, 32, 1, true]} />
          <meshStandardMaterial
            color="#eab308"
            roughness={0.15}
            metalness={0.95}
            side={THREE.DoubleSide}
            emissive={
              selectedLayerId === "inner-conductor" || hoveredLayerId === "inner-conductor"
                ? "#f59e0b"
                : "#000000"
            }
            emissiveIntensity={selectedLayerId === "inner-conductor" ? 0.5 : 0.2}
          />
        </mesh>
        {/* Right End Solid Gold Disk Lid (X = +3.60) */}
        <mesh position={[3.88, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.38, 32]} />
          <meshStandardMaterial color="#ca8a04" metalness={0.95} roughness={0.15} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* PRECISE CALLOUT BADGES */}
      <DirectLabelBadge
        title="Plastic cover"
        targetX={-3.4}
        targetY={-1.8}
        badgeX={-3.4}
        badgeY={-2.8}
        active={selectedLayerId === "plastic-cover"}
      />

      <DirectLabelBadge
        title="Outer conductor (shield)"
        targetX={-1.0}
        targetY={-1.15}
        badgeX={-1.0}
        badgeY={-2.8}
        active={selectedLayerId === "outer-conductor"}
      />

      <DirectLabelBadge
        title="Inner conductor"
        targetX={+2.8}
        targetY={-0.38}
        badgeX={+2.8}
        badgeY={-2.8}
        active={selectedLayerId === "inner-conductor"}
      />

      <DualInsulatorBadge
        active={selectedLayerId === "insulator" || selectedLayerId === "outer-insulator"}
      />
    </group>
  );
}

// ============================================================================
// DIRECT 3D LABEL BADGE WITH ACCURATE LEADER LINE (No offset drift)
// ============================================================================
function DirectLabelBadge({
  title,
  targetX,
  targetY,
  badgeX,
  badgeY,
  active,
}: {
  title: string;
  targetX: number;
  targetY: number;
  badgeX: number;
  badgeY: number;
  active: boolean;
}) {
  return (
    <group>
      {/* Leader Line from Badge to Cable Mesh Target */}
      <line>
        <bufferGeometry
          attach="geometry"
          onUpdate={(geo) =>
            geo.setFromPoints([
              new THREE.Vector3(badgeX, badgeY, 0),
              new THREE.Vector3(targetX, targetY, 0),
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

      {/* Target Sphere Pointer Dot at cable mesh surface */}
      <mesh position={[targetX, targetY, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={active ? "#f59e0b" : "#64748b"} />
      </mesh>

      {/* HTML Badge at exact badgeX, badgeY position */}
      <Html position={[badgeX, badgeY, 0]} center distanceFactor={10}>
        <div
          className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap transition-all duration-200 border pointer-events-none ${
            active
              ? "bg-amber-500 text-slate-950 border-amber-300 shadow-xl scale-110"
              : "bg-amber-400/90 dark:bg-amber-400 text-slate-950 border-amber-500 shadow-md font-bold"
          }`}
        >
          {title}
        </div>
      </Html>
    </group>
  );
}

// ============================================================================
// DUAL-LEADER LINE BADGE FOR "Insulator" (Points to BOTH Insulator layers)
// ============================================================================
function DualInsulatorBadge({ active }: { active: boolean }) {
  return (
    <group>
      <line>
        <bufferGeometry
          attach="geometry"
          onUpdate={(geo) =>
            geo.setFromPoints([
              new THREE.Vector3(-0.5, 2.3, 0),
              new THREE.Vector3(-2.3, 1.45, 0),
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

      <line>
        <bufferGeometry
          attach="geometry"
          onUpdate={(geo) =>
            geo.setFromPoints([
              new THREE.Vector3(-0.5, 2.3, 0),
              new THREE.Vector3(1.0, 0.82, 0),
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

      <mesh position={[-2.3, 1.45, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={active ? "#f59e0b" : "#64748b"} />
      </mesh>
      <mesh position={[1.0, 0.82, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={active ? "#f59e0b" : "#64748b"} />
      </mesh>

      <Html position={[-0.5, 2.3, 0]} center distanceFactor={10}>
        <div
          className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap transition-all duration-200 border pointer-events-none ${
            active
              ? "bg-amber-500 text-slate-950 border-amber-300 shadow-xl scale-110"
              : "bg-amber-400/90 dark:bg-amber-400 text-slate-950 border-amber-500 shadow-md font-bold"
          }`}
        >
          Insulator
        </div>
      </Html>
    </group>
  );
}

// ============================================================================
// 2. UTP vs STP DUAL 3D MODEL WITH BOTH-SIDE CONDUCTOR & INSULATION CAPS
// ============================================================================
function UtpStp3DModel({
  selectedLayerId,
  hoveredLayerId,
  onSelect,
  onHover,
}: {
  selectedLayerId: string | null;
  hoveredLayerId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const braidedTexture = useBraidedMetalTexture();

  // Helix curves for UTP twisted pair (Length = 7.5, X from -4.2 to +3.3)
  // Sheath ends at t = 0.85, core extends just a little past to t = 0.89 for a subtle stripped tip
  const curveUtp1_full = useMemo(() => new HelixCurve(7.5, 4.0, 0, 0.58, 0, 0.89), []);
  const curveUtp1_sheath = useMemo(() => new HelixCurve(7.5, 4.0, 0, 0.58, 0, 0.85), []);
  const curveUtp2_full = useMemo(() => new HelixCurve(7.5, 4.0, Math.PI, 0.58, 0, 0.89), []);
  const curveUtp2_sheath = useMemo(() => new HelixCurve(7.5, 4.0, Math.PI, 0.58, 0, 0.85), []);

  // Helix curves for STP twisted pair (Length = 7.5, X from -4.2 to +3.3)
  // Sheath ends at t = 0.85, core extends just a little past to t = 0.89 for a subtle stripped tip
  const curveStp1_full = useMemo(() => new HelixCurve(7.5, 4.0, 0, 0.58, 0, 0.89), []);
  const curveStp1_sheath = useMemo(() => new HelixCurve(7.5, 4.0, 0, 0.58, 0, 0.85), []);
  const curveStp2_full = useMemo(() => new HelixCurve(7.5, 4.0, Math.PI, 0.58, 0, 0.89), []);
  const curveStp2_sheath = useMemo(() => new HelixCurve(7.5, 4.0, Math.PI, 0.58, 0, 0.85), []);

  return (
    <group rotation={[0.18, -0.35, 0.02]}>
      {/* =================================================================== */}
      {/* 1. UTP CABLE (TOP TRACK, Y = +2.0) */}
      {/* =================================================================== */}
      <group position={[0, 2.0, 0]}>
        {/* Solid Left End Disk Lid (Seals UTP jacket at X = -4.2) */}
        <mesh position={[-4.2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[1.5, 32]} />
          <meshStandardMaterial color="#be185d" roughness={0.3} side={THREE.DoubleSide} />
        </mesh>

        {/* Plastic Outer Cover Cylinder (X = -4.2 -> -1.45, Center = -2.825, Length = 2.75) */}
        <group position={[-2.825, 0, 0]}>
          <mesh
            rotation={[0, 0, Math.PI / 2]}
            onClick={(e) => {
              e.stopPropagation();
              onSelect("plastic-cover");
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHover("plastic-cover");
            }}
            onPointerOut={() => onHover(null)}
          >
            <cylinderGeometry args={[1.5, 1.5, 2.75, 32, 1, true]} />
            <meshStandardMaterial
              color="#ec4899"
              roughness={0.35}
              side={THREE.DoubleSide}
              emissive={
                selectedLayerId === "plastic-cover" || hoveredLayerId === "plastic-cover"
                  ? "#f59e0b"
                  : "#000000"
              }
              emissiveIntensity={selectedLayerId === "plastic-cover" ? 0.45 : 0.15}
            />
          </mesh>
          {/* Right Solid Front Cut Disk Lid (Seals UTP jacket front face at X = -1.45) */}
          <mesh position={[1.375, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <circleGeometry args={[1.5, 32]} />
            <meshStandardMaterial color="#be185d" roughness={0.3} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* UTP Copper Core & Sheaths */}
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelect("conductors");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("conductors");
          }}
          onPointerOut={() => onHover(null)}
        >
          <tubeGeometry args={[curveUtp1_full, 128, 0.18, 14, false]} />
          <meshStandardMaterial
            color="#d97706"
            metalness={0.9}
            roughness={0.2}
            emissive={selectedLayerId === "conductors" || hoveredLayerId === "conductors" ? "#f59e0b" : "#000000"}
            emissiveIntensity={selectedLayerId === "conductors" ? 0.5 : 0.1}
          />
        </mesh>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelect("conductors");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("conductors");
          }}
          onPointerOut={() => onHover(null)}
        >
          <tubeGeometry args={[curveUtp2_full, 128, 0.18, 14, false]} />
          <meshStandardMaterial
            color="#d97706"
            metalness={0.9}
            roughness={0.2}
            emissive={selectedLayerId === "conductors" || hoveredLayerId === "conductors" ? "#f59e0b" : "#000000"}
            emissiveIntensity={selectedLayerId === "conductors" ? 0.5 : 0.1}
          />
        </mesh>

        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelect("conductors");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("conductors");
          }}
          onPointerOut={() => onHover(null)}
        >
          <tubeGeometry args={[curveUtp1_sheath, 128, 0.32, 14, false]} />
          <meshStandardMaterial
            color="#ea580c"
            roughness={0.3}
            emissive={selectedLayerId === "conductors" || hoveredLayerId === "conductors" ? "#f59e0b" : "#000000"}
            emissiveIntensity={selectedLayerId === "conductors" ? 0.5 : 0.1}
          />
        </mesh>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelect("conductors");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("conductors");
          }}
          onPointerOut={() => onHover(null)}
        >
          <tubeGeometry args={[curveUtp2_sheath, 128, 0.32, 14, false]} />
          <meshStandardMaterial
            color="#0284c7"
            roughness={0.3}
            emissive={selectedLayerId === "conductors" || hoveredLayerId === "conductors" ? "#f59e0b" : "#000000"}
            emissiveIntensity={selectedLayerId === "conductors" ? 0.5 : 0.1}
          />
        </mesh>

        {/* Solid End Caps */}
        <SolidEndCap curve={curveUtp1_full} tVal={0} outerRadius={0.18} color="#d97706" layerId="conductors" selectedLayerId={selectedLayerId} hoveredLayerId={hoveredLayerId} onSelect={onSelect} onHover={onHover} />
        <SolidEndCap curve={curveUtp1_full} tVal={1.0} outerRadius={0.18} color="#d97706" layerId="conductors" selectedLayerId={selectedLayerId} hoveredLayerId={hoveredLayerId} onSelect={onSelect} onHover={onHover} />
        <SolidEndCap curve={curveUtp2_full} tVal={0} outerRadius={0.18} color="#d97706" layerId="conductors" selectedLayerId={selectedLayerId} hoveredLayerId={hoveredLayerId} onSelect={onSelect} onHover={onHover} />
        <SolidEndCap curve={curveUtp2_full} tVal={1.0} outerRadius={0.18} color="#d97706" layerId="conductors" selectedLayerId={selectedLayerId} hoveredLayerId={hoveredLayerId} onSelect={onSelect} onHover={onHover} />

        <SolidEndCap curve={curveUtp1_sheath} tVal={0.0} innerRadius={0.18} outerRadius={0.32} color="#ea580c" layerId="conductors" selectedLayerId={selectedLayerId} hoveredLayerId={hoveredLayerId} onSelect={onSelect} onHover={onHover} />
        <SolidEndCap curve={curveUtp1_sheath} tVal={1.0} innerRadius={0.18} outerRadius={0.32} color="#ea580c" layerId="conductors" selectedLayerId={selectedLayerId} hoveredLayerId={hoveredLayerId} onSelect={onSelect} onHover={onHover} />
        <SolidEndCap curve={curveUtp2_sheath} tVal={0.0} innerRadius={0.18} outerRadius={0.32} color="#0284c7" layerId="conductors" selectedLayerId={selectedLayerId} hoveredLayerId={hoveredLayerId} onSelect={onSelect} onHover={onHover} />
        <SolidEndCap curve={curveUtp2_sheath} tVal={1.0} innerRadius={0.18} outerRadius={0.32} color="#0284c7" layerId="conductors" selectedLayerId={selectedLayerId} hoveredLayerId={hoveredLayerId} onSelect={onSelect} onHover={onHover} />

        {/* UTP Badges */}
        <DirectLabelBadge
          title="UTP Plastic Cover"
          targetX={-2.825}
          targetY={1.5}
          badgeX={-2.825}
          badgeY={2.5}
          active={selectedLayerId === "plastic-cover"}
        />
        <DirectLabelBadge
          title="Twisted Pairs"
          targetX={0.5}
          targetY={0.55}
          badgeX={0.5}
          badgeY={2.5}
          active={selectedLayerId === "conductors"}
        />
      </group>

      {/* =================================================================== */}
      {/* 2. STP CABLE (BOTTOM TRACK, Y = -2.0) */}
      {/* =================================================================== */}
      <group position={[0, -2.0, 0]}>
        {/* Solid Left End Disk Lid (Seals STP jacket at X = -4.2) */}
        <mesh position={[-4.2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[1.6, 32]} />
          <meshStandardMaterial color="#be185d" roughness={0.3} side={THREE.DoubleSide} />
        </mesh>

        {/* Plastic Outer Cover Cylinder (X = -4.2 -> -2.4, Center = -3.3, Length = 1.8) */}
        <group position={[-3.3, 0, 0]}>
          <mesh
            rotation={[0, 0, Math.PI / 2]}
            onClick={(e) => {
              e.stopPropagation();
              onSelect("plastic-cover");
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHover("plastic-cover");
            }}
            onPointerOut={() => onHover(null)}
          >
            <cylinderGeometry args={[1.6, 1.6, 1.8, 32, 1, true]} />
            <meshStandardMaterial
              color="#ec4899"
              roughness={0.35}
              side={THREE.DoubleSide}
              emissive={
                selectedLayerId === "plastic-cover" || hoveredLayerId === "plastic-cover"
                  ? "#f59e0b"
                  : "#000000"
              }
              emissiveIntensity={selectedLayerId === "plastic-cover" ? 0.45 : 0.15}
            />
          </mesh>
          {/* Right Step Ring Lid (X = -2.4) */}
          <mesh position={[0.9, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[1.35, 1.6, 32]} />
            <meshStandardMaterial color="#be185d" roughness={0.3} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* High-Fidelity Textured Metallic Braided Shield Cylinder (X = -2.4 -> -0.4, Center = -1.4, Length = 2.0) */}
        <group position={[-1.4, 0, 0]}>
          {/* Outer Metallic Braided Mesh Sheath */}
          <mesh
            rotation={[0, 0, Math.PI / 2]}
            onClick={(e) => {
              e.stopPropagation();
              onSelect("metal-shield");
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHover("metal-shield");
            }}
            onPointerOut={() => onHover(null)}
          >
            <cylinderGeometry args={[1.35, 1.35, 2.0, 64, 1, true]} />
            <meshStandardMaterial
              map={braidedTexture}
              color="#ffffff"
              metalness={0.85}
              roughness={0.2}
              side={THREE.DoubleSide}
              emissive={
                selectedLayerId === "metal-shield" || hoveredLayerId === "metal-shield"
                  ? "#f59e0b"
                  : "#000000"
              }
              emissiveIntensity={selectedLayerId === "metal-shield" ? 0.5 : 0.1}
            />
          </mesh>

          {/* Inner Aluminum Foil Shield Underlayer */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[1.32, 1.32, 1.98, 32, 1, true]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} side={THREE.DoubleSide} />
          </mesh>

          {/* Right Solid Front Cut Metallic Shield Disk Lid (Seals STP metallic shield front face at X = -0.40) */}
          <mesh position={[1.0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <circleGeometry args={[1.35, 32]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* STP Copper Core & Sheaths */}
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelect("conductors");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("conductors");
          }}
          onPointerOut={() => onHover(null)}
        >
          <tubeGeometry args={[curveStp1_full, 128, 0.18, 14, false]} />
          <meshStandardMaterial
            color="#d97706"
            metalness={0.9}
            roughness={0.2}
            emissive={selectedLayerId === "conductors" || hoveredLayerId === "conductors" ? "#f59e0b" : "#000000"}
            emissiveIntensity={selectedLayerId === "conductors" ? 0.5 : 0.1}
          />
        </mesh>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelect("conductors");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("conductors");
          }}
          onPointerOut={() => onHover(null)}
        >
          <tubeGeometry args={[curveStp2_full, 128, 0.18, 14, false]} />
          <meshStandardMaterial
            color="#d97706"
            metalness={0.9}
            roughness={0.2}
            emissive={selectedLayerId === "conductors" || hoveredLayerId === "conductors" ? "#f59e0b" : "#000000"}
            emissiveIntensity={selectedLayerId === "conductors" ? 0.5 : 0.1}
          />
        </mesh>

        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelect("conductors");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("conductors");
          }}
          onPointerOut={() => onHover(null)}
        >
          <tubeGeometry args={[curveStp1_sheath, 128, 0.32, 14, false]} />
          <meshStandardMaterial
            color="#ea580c"
            roughness={0.3}
            emissive={selectedLayerId === "conductors" || hoveredLayerId === "conductors" ? "#f59e0b" : "#000000"}
            emissiveIntensity={selectedLayerId === "conductors" ? 0.5 : 0.1}
          />
        </mesh>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelect("conductors");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("conductors");
          }}
          onPointerOut={() => onHover(null)}
        >
          <tubeGeometry args={[curveStp2_sheath, 128, 0.32, 14, false]} />
          <meshStandardMaterial
            color="#0284c7"
            roughness={0.3}
            emissive={selectedLayerId === "conductors" || hoveredLayerId === "conductors" ? "#f59e0b" : "#000000"}
            emissiveIntensity={selectedLayerId === "conductors" ? 0.5 : 0.1}
          />
        </mesh>

        {/* Solid End Caps */}
        <SolidEndCap curve={curveStp1_full} tVal={0} outerRadius={0.18} color="#d97706" layerId="conductors" selectedLayerId={selectedLayerId} hoveredLayerId={hoveredLayerId} onSelect={onSelect} onHover={onHover} />
        <SolidEndCap curve={curveStp1_full} tVal={1.0} outerRadius={0.18} color="#d97706" layerId="conductors" selectedLayerId={selectedLayerId} hoveredLayerId={hoveredLayerId} onSelect={onSelect} onHover={onHover} />
        <SolidEndCap curve={curveStp2_full} tVal={0} outerRadius={0.18} color="#d97706" layerId="conductors" selectedLayerId={selectedLayerId} hoveredLayerId={hoveredLayerId} onSelect={onSelect} onHover={onHover} />
        <SolidEndCap curve={curveStp2_full} tVal={1.0} outerRadius={0.18} color="#d97706" layerId="conductors" selectedLayerId={selectedLayerId} hoveredLayerId={hoveredLayerId} onSelect={onSelect} onHover={onHover} />

        <SolidEndCap curve={curveStp1_sheath} tVal={0.0} innerRadius={0.18} outerRadius={0.32} color="#ea580c" layerId="conductors" selectedLayerId={selectedLayerId} hoveredLayerId={hoveredLayerId} onSelect={onSelect} onHover={onHover} />
        <SolidEndCap curve={curveStp1_sheath} tVal={1.0} innerRadius={0.18} outerRadius={0.32} color="#ea580c" layerId="conductors" selectedLayerId={selectedLayerId} hoveredLayerId={hoveredLayerId} onSelect={onSelect} onHover={onHover} />
        <SolidEndCap curve={curveStp2_sheath} tVal={0.0} innerRadius={0.18} outerRadius={0.32} color="#0284c7" layerId="conductors" selectedLayerId={selectedLayerId} hoveredLayerId={hoveredLayerId} onSelect={onSelect} onHover={onHover} />
        <SolidEndCap curve={curveStp2_sheath} tVal={1.0} innerRadius={0.18} outerRadius={0.32} color="#0284c7" layerId="conductors" selectedLayerId={selectedLayerId} hoveredLayerId={hoveredLayerId} onSelect={onSelect} onHover={onHover} />

        {/* STP Badges */}
        <DirectLabelBadge
          title="STP Braided Metallic Shield"
          targetX={-1.4}
          targetY={-1.35}
          badgeX={-1.4}
          badgeY={-2.5}
          active={selectedLayerId === "metal-shield"}
        />
        <DirectLabelBadge
          title="Twisted Pairs"
          targetX={0.5}
          targetY={-0.55}
          badgeX={0.5}
          badgeY={-2.5}
          active={selectedLayerId === "conductors"}
        />
      </group>
    </group>
  );
}

// ============================================================================
// 3. BARE TWISTED-PAIR 3D MODEL
// ============================================================================
function TwistedPair3DModel({
  selectedLayerId,
  hoveredLayerId,
  onSelect,
  onHover,
}: {
  selectedLayerId: string | null;
  hoveredLayerId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const coreCurve1 = useMemo(() => new HelixCurve(8.5, 4, 0, 0.65, 0, 1.0), []);
  const coreCurve2 = useMemo(() => new HelixCurve(8.5, 4, Math.PI, 0.65, 0, 1.0), []);

  const sheathCurve1 = useMemo(() => new HelixCurve(8.5, 4, 0, 0.65, 0.05, 1.0), []);
  const sheathCurve2 = useMemo(() => new HelixCurve(8.5, 4, Math.PI, 0.65, 0.05, 1.0), []);

  return (
    <group rotation={[0.25, -0.45, 0.05]}>
      {/* 1. COPPER CONDUCTOR CORES (Exposed at short stripped tip t = 0 -> 0.05) */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect("conductors");
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover("conductors");
        }}
        onPointerOut={() => onHover(null)}
      >
        <tubeGeometry args={[coreCurve1, 128, 0.2, 16, false]} />
        <meshStandardMaterial
          color="#d97706"
          roughness={0.15}
          metalness={0.9}
          emissive={
            selectedLayerId === "conductors" || hoveredLayerId === "conductors"
              ? "#f59e0b"
              : "#000000"
          }
          emissiveIntensity={selectedLayerId === "conductors" ? 0.5 : 0.1}
        />
      </mesh>

      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect("conductors");
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover("conductors");
        }}
        onPointerOut={() => onHover(null)}
      >
        <tubeGeometry args={[coreCurve2, 128, 0.2, 16, false]} />
        <meshStandardMaterial
          color="#d97706"
          roughness={0.15}
          metalness={0.9}
          emissive={
            selectedLayerId === "conductors" || hoveredLayerId === "conductors"
              ? "#f59e0b"
              : "#000000"
          }
          emissiveIntensity={selectedLayerId === "conductors" ? 0.5 : 0.1}
        />
      </mesh>

      {/* 2. PLASTIC INSULATION SHEATHS (Covers t = 0.05 -> 1.0) */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect("insulator");
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover("insulator");
        }}
        onPointerOut={() => onHover(null)}
      >
        <tubeGeometry args={[sheathCurve1, 128, 0.38, 16, false]} />
        <meshStandardMaterial
          color="#ea580c"
          roughness={0.35}
          emissive={
            selectedLayerId === "insulator" || hoveredLayerId === "insulator"
              ? "#f59e0b"
              : "#000000"
          }
          emissiveIntensity={selectedLayerId === "insulator" ? 0.4 : 0.1}
        />
      </mesh>

      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect("insulator");
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover("insulator");
        }}
        onPointerOut={() => onHover(null)}
      >
        <tubeGeometry args={[sheathCurve2, 128, 0.38, 16, false]} />
        <meshStandardMaterial
          color="#475569"
          roughness={0.35}
          metalness={0.3}
          emissive={
            selectedLayerId === "insulator" || hoveredLayerId === "insulator"
              ? "#f59e0b"
              : "#000000"
          }
          emissiveIntensity={selectedLayerId === "insulator" ? 0.4 : 0.1}
        />
      </mesh>

      {/* 3. SOLID FILLED END CAPS AT BOTH ENDS FOR CONDUCTORS AND INSULATORS */}
      <SolidEndCap curve={coreCurve1} tVal={0} outerRadius={0.2} color="#d97706" />
      <SolidEndCap curve={coreCurve1} tVal={1} outerRadius={0.2} color="#d97706" />

      <SolidEndCap curve={coreCurve2} tVal={0} outerRadius={0.2} color="#d97706" />
      <SolidEndCap curve={coreCurve2} tVal={1} outerRadius={0.2} color="#d97706" />

      <SolidEndCap curve={sheathCurve1} tVal={0} innerRadius={0.2} outerRadius={0.38} color="#ea580c" />
      <SolidEndCap curve={sheathCurve1} tVal={1} innerRadius={0.2} outerRadius={0.38} color="#ea580c" />

      <SolidEndCap curve={sheathCurve2} tVal={0} innerRadius={0.2} outerRadius={0.38} color="#475569" />
      <SolidEndCap curve={sheathCurve2} tVal={1} innerRadius={0.2} outerRadius={0.38} color="#475569" />

      {/* DISTRIBUTED LABELS */}
      <DirectLabelBadge
        title="Bare Copper Conductor"
        targetX={-3.6}
        targetY={-0.65}
        badgeX={-3.6}
        badgeY={-2.6}
        active={selectedLayerId === "conductors"}
      />

      <DirectLabelBadge
        title="Plastic Insulation Sheath"
        targetX={0.5}
        targetY={0.65}
        badgeX={0.5}
        badgeY={2.7}
        active={selectedLayerId === "insulator"}
      />
    </group>
  );
}

// ============================================================================
// 4. OPTICAL FIBER 3D MODEL (DENSE 360-DEGREE CONTINUOUS KEVLAR YARN BUNDLE)
// ============================================================================
function Fiber3DModel({
  selectedLayerId,
  hoveredLayerId,
  onSelect,
  onHover,
}: {
  selectedLayerId: string | null;
  hoveredLayerId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const kevlarTexture = useKevlarTexture();

  // Dense, continuous 360° ring of 36 Kevlar aramid fiber threads starting at jacket cut X = -2.40
  const denseKevlarStrands = useMemo(() => {
    const strands: { curve: THREE.CatmullRomCurve3 }[] = [];
    const strandCount = 36;
    const rBase = 1.46; // Surface radius of Kevlar layer
    const startX = -2.40; // Starts right where outer jacket is stripped back
    const cutX = -0.90;   // Kevlar layer cut boundary
    const extendX = -0.40; // Flared extension

    for (let i = 0; i < strandCount; i++) {
      const angle = (i / strandCount) * Math.PI * 2;
      // Slight natural organic curve as fibers emerge from outer jacket
      const midAngle = angle + (i % 2 === 0 ? 0.04 : -0.04);
      const endAngle = angle + 0.12;

      const p0 = new THREE.Vector3(startX, Math.sin(angle) * rBase, Math.cos(angle) * rBase);
      const p1 = new THREE.Vector3(cutX, Math.sin(midAngle) * rBase, Math.cos(midAngle) * rBase);
      const p2 = new THREE.Vector3(
        extendX,
        Math.sin(endAngle) * (rBase + 0.08),
        Math.cos(endAngle) * (rBase + 0.08)
      );

      strands.push({ curve: new THREE.CatmullRomCurve3([p0, p1, p2]) });
    }
    return strands;
  }, []);

  return (
    <group ref={groupRef} rotation={[0.25, -0.45, 0.05]}>
      {/* FULL SOLID LEFT END CLOSING DISK LID (Seals entire left cross-section at X = -4.20) */}
      <mesh position={[-4.20, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[1.80, 32]} />
        <meshStandardMaterial color="#c2410c" roughness={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* 1. OUTER PROTECTIVE JACKET - X = -4.20 -> -2.40 (Length = 1.80, Center = -3.30) */}
      <group position={[-3.30, 0, 0]}>
        <mesh
          rotation={[0, 0, Math.PI / 2]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect("jacket");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("jacket");
          }}
          onPointerOut={() => onHover(null)}
        >
          <cylinderGeometry args={[1.8, 1.8, 1.8, 32, 1, true]} />
          <meshStandardMaterial
            color="#ea580c"
            roughness={0.3}
            metalness={0.1}
            side={THREE.DoubleSide}
            emissive={
              selectedLayerId === "jacket" || hoveredLayerId === "jacket"
                ? "#f59e0b"
                : "#000000"
            }
            emissiveIntensity={selectedLayerId === "jacket" ? 0.45 : 0.15}
          />
        </mesh>
        {/* Right Step Solid Ring Lid (X = -2.40) */}
        <mesh position={[0.90, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[1.45, 1.8, 32]} />
          <meshStandardMaterial color="#c2410c" roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 2. KEVLAR ARAMID YARN STRANDS - X = -4.19 -> -0.90 (Length = 3.29, Center = -2.545) */}
      <group position={[-2.545, 0, 0]}>
        {/* High-Contrast Woven Kevlar Fabric Cylinder */}
        <mesh
          rotation={[0, 0, Math.PI / 2]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect("kevlar");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("kevlar");
          }}
          onPointerOut={() => onHover(null)}
        >
          <cylinderGeometry args={[1.45, 1.45, 3.29, 64, 1, true]} />
          <meshStandardMaterial
            map={kevlarTexture}
            color="#ffffff"
            roughness={0.4}
            metalness={0.1}
            side={THREE.DoubleSide}
            emissive={
              selectedLayerId === "kevlar" || hoveredLayerId === "kevlar"
                ? "#f59e0b"
                : "#000000"
            }
            emissiveIntensity={selectedLayerId === "kevlar" ? 0.5 : 0.15}
          />
        </mesh>

        {/* Right Step Ring Lid (X = -0.90) */}
        <mesh position={[1.645, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[1.10, 1.45, 32]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Dense, Continuous 360° Ring of 36 Kevlar Aramid Threads Emerging From Jacket */}
      <group>
        {denseKevlarStrands.map((strand, index) => (
          <mesh
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              onSelect("kevlar");
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHover("kevlar");
            }}
            onPointerOut={() => onHover(null)}
          >
            <tubeGeometry args={[strand.curve, 32, 0.022, 8, false]} />
            <meshStandardMaterial
              color="#fef08a"
              roughness={0.25}
              metalness={0.2}
              emissive={
                selectedLayerId === "kevlar" || hoveredLayerId === "kevlar"
                  ? "#f59e0b"
                  : "#000000"
              }
              emissiveIntensity={selectedLayerId === "kevlar" ? 0.6 : 0.1}
            />
          </mesh>
        ))}
      </group>

      {/* 3. PLASTIC BUFFER TUBE - X = -4.18 -> +0.80 (Length = 4.98, Center = -1.69) */}
      <group position={[-1.69, 0, 0]}>
        <mesh
          rotation={[0, 0, Math.PI / 2]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect("buffer");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("buffer");
          }}
          onPointerOut={() => onHover(null)}
        >
          <cylinderGeometry args={[1.10, 1.10, 4.98, 32, 1, true]} />
          <meshStandardMaterial
            color="#0284c7"
            roughness={0.2}
            side={THREE.DoubleSide}
            emissive={
              selectedLayerId === "buffer" || hoveredLayerId === "buffer"
                ? "#f59e0b"
                : "#000000"
            }
            emissiveIntensity={selectedLayerId === "buffer" ? 0.45 : 0.15}
          />
        </mesh>
        {/* Right Step Ring Lid (X = +0.80) */}
        <mesh position={[2.49, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.65, 1.10, 32]} />
          <meshStandardMaterial color="#0369a1" roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 4. GLASS CLADDING n2 - X = -4.17 -> +2.40 (Length = 6.57, Center = -0.885) */}
      <group position={[-0.885, 0, 0]}>
        <mesh
          rotation={[0, 0, Math.PI / 2]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect("cladding");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("cladding");
          }}
          onPointerOut={() => onHover(null)}
        >
          <cylinderGeometry args={[0.65, 0.65, 6.57, 32, 1, true]} />
          <meshStandardMaterial
            color="#7dd3fc"
            roughness={0.1}
            transparent={true}
            opacity={0.85}
            side={THREE.DoubleSide}
            emissive={
              selectedLayerId === "cladding" || hoveredLayerId === "cladding"
                ? "#f59e0b"
                : "#000000"
            }
            emissiveIntensity={selectedLayerId === "cladding" ? 0.45 : 0.15}
          />
        </mesh>
        {/* Right Step Glass Ring Lid (X = +2.40) */}
        <mesh position={[3.285, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.32, 0.65, 32]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 5. GLASS CORE n1 - X = -4.16 -> +3.80 (Length = 7.96, Center = -0.18) */}
      <group position={[-0.18, 0, 0]}>
        <mesh
          rotation={[0, 0, Math.PI / 2]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect("core");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover("core");
          }}
          onPointerOut={() => onHover(null)}
        >
          <cylinderGeometry args={[0.32, 0.32, 7.96, 32, 1, true]} />
          <meshStandardMaterial
            color="#06b6d4"
            roughness={0.05}
            metalness={0.2}
            emissive="#0891b2"
            emissiveIntensity={
              selectedLayerId === "core" || hoveredLayerId === "core" ? 0.9 : 0.65
            }
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Right End Solid Glass Core Disk Lid (X = +3.80) */}
        <mesh position={[3.98, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.32, 32]} />
          <meshStandardMaterial color="#0e7490" emissive="#0891b2" emissiveIntensity={0.8} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ACCURATE FLOATING LABEL BADGES */}
      <DirectLabelBadge
        title="Outer Jacket"
        targetX={-3.30}
        targetY={1.80}
        badgeX={-3.30}
        badgeY={2.80}
        active={selectedLayerId === "jacket"}
      />

      <DirectLabelBadge
        title="Kevlar Yarn"
        targetX={-1.80}
        targetY={-1.45}
        badgeX={-1.80}
        badgeY={-2.80}
        active={selectedLayerId === "kevlar"}
      />

      <DirectLabelBadge
        title="Plastic Buffer"
        targetX={-0.10}
        targetY={1.10}
        badgeX={-0.10}
        badgeY={2.80}
        active={selectedLayerId === "buffer"}
      />

      <DirectLabelBadge
        title="Glass Cladding (n2)"
        targetX={+1.60}
        targetY={-0.65}
        badgeX={+1.60}
        badgeY={-2.80}
        active={selectedLayerId === "cladding"}
      />

      <DirectLabelBadge
        title="Glass Core (n1)"
        targetX={+3.20}
        targetY={0.32}
        badgeX={+3.20}
        badgeY={2.80}
        active={selectedLayerId === "core"}
      />
    </group>
  );
}
