import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { type VizMeta } from "../types";
import { useAppStore } from "../../state/appStore";
import {
  Sparkles,
  Radio,
  Globe,
  Layers,
  Rotate3D,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const vizMeta: VizMeta = {
  key: "network-wave-propagation-methods",
  title: "Ground, Sky & Line-of-Sight Propagation",
  category: "network",
  renderer: "canvas",
  animated: true,
  params: [
    {
      key: "viewMode",
      type: "select",
      label: "Display Mode",
      default: "textbook",
      options: [
        { label: "2D", value: "textbook" },
        { label: "3D", value: "3d" },
      ],
    },
    {
      key: "highlightMethod",
      type: "select",
      label: "Propagation Method",
      default: "none",
      options: [
        { label: "Show All 3 Methods", value: "none" },
        { label: "Ground propagation (< 2 MHz)", value: "ground" },
        { label: "Sky propagation (2–30 MHz)", value: "sky" },
        {
          label: "Line-of-sight propagation (> 30 MHz)",
          value: "line-of-sight",
        },
      ],
    },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
  isPlaying?: boolean;
}

function sphericalToVector3(radius: number, theta: number, phi: number) {
  const x = radius * Math.cos(theta) * Math.sin(phi);
  const y = radius * Math.sin(theta);
  const z = radius * Math.cos(theta) * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export default function WavePropagationMethods({
  values,
  onChange,
  isPlaying: isPlayingProp,
}: Props) {
  const [internalMode, setInternalMode] = useState<"textbook" | "3d">("3d");
  const viewMode = (values.viewMode as "textbook" | "3d") || internalMode;
  const highlightMethod = (values.highlightMethod as string) || "none";
  const ionosphereHeight = Number(values.ionosphereHeight ?? 250);

  const updateParam = (key: string, val: unknown) => {
    if (onChange) {
      onChange({
        ...values,
        [key]: val,
      });
    }
  };

  const handleModeSwitch = (mode: "textbook" | "3d") => {
    setInternalMode(mode);
    updateParam("viewMode", mode);
  };

  const activePlaying = isPlayingProp ?? true;
  const globalSpeed = useAppStore((state) => state.globalSpeedMultiplier) || 1;

  const handlePresetAll = () => updateParam("highlightMethod", "none");
  const handlePresetGround = () => updateParam("highlightMethod", "ground");
  const handlePresetSky = () => updateParam("highlightMethod", "sky");
  const handlePresetLOS = () => updateParam("highlightMethod", "line-of-sight");

  const viewModeParam = vizMeta.params?.find((p) => p.key === "viewMode");
  const viewModeOptions =
    viewModeParam && viewModeParam.type === "select"
      ? viewModeParam.options
      : [];

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none">
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-muted/30 border border-border">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-1 rounded-lg bg-background border border-border flex items-center gap-1">
            {viewModeOptions.map((opt) => {
              const isSelected = viewMode === opt.value;
              const Icon = opt.value === "3d" ? Rotate3D : BookOpen;
              return (
                <button
                  key={opt.value}
                  onClick={() =>
                    handleModeSwitch(opt.value as "textbook" | "3d")
                  }
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {opt.label}
                </button>
              );
            })}
          </div>

          <span className="text-muted-foreground text-xs">|</span>

          {/* Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Presets:
            </span>
            <button
              onClick={handlePresetAll}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                highlightMethod === "none"
                  ? "bg-amber-500 text-slate-950 border-amber-400 font-bold"
                  : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
              }`}
            >
              Show All
            </button>
            <button
              onClick={handlePresetGround}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                highlightMethod === "ground"
                  ? "bg-rose-500 text-white border-rose-400 font-bold"
                  : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
              }`}
            >
              Ground
            </button>
            <button
              onClick={handlePresetSky}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                highlightMethod === "sky"
                  ? "bg-purple-500 text-white border-purple-400 font-bold"
                  : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
              }`}
            >
              Sky
            </button>
            <button
              onClick={handlePresetLOS}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                highlightMethod === "line-of-sight"
                  ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold"
                  : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
              }`}
            >
              Line-of-Sight
            </button>
          </div>
        </div>

        {/* Right: Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              highlightMethod === "ground"
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                : highlightMethod === "sky"
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                  : highlightMethod === "line-of-sight"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>
              {highlightMethod === "ground"
                ? "Ground Surface Wave"
                : highlightMethod === "sky"
                  ? "Sky Reflection"
                  : highlightMethod === "line-of-sight"
                    ? "Line-of-Sight"
                    : "All 3 Methods"}
            </span>
          </div>
        </div>
      </div>

      {/* DISPLAY AREA */}
      {viewMode === "3d" ? (
        /* MODE A: PHOTOREALISTIC 3D NASA EARTH MODEL WITH GLASSMORPHIC HUD */
        <div className="w-full border rounded-2xl bg-black relative overflow-hidden shadow-inner border-border h-[500px] sm:h-[540px] md:h-[580px] flex items-center justify-center">
          <Canvas
            camera={{ position: [0, 0.8, 5.6], fov: 42 }}
            className="w-full h-full cursor-grab active:cursor-grabbing relative z-10"
          >
            <ambientLight intensity={1.8} />
            <directionalLight
              position={[12, 12, 10]}
              intensity={3.0}
              color="#ffffff"
            />
            <directionalLight
              position={[-10, -5, -10]}
              intensity={0.4}
              color="#38bdf8"
            />

            <Stars
              radius={100}
              depth={50}
              count={3500}
              factor={4}
              saturation={0}
              fade
              speed={1}
            />

            <OrbitControls
              enableZoom={true}
              minDistance={4.0}
              maxDistance={14}
              autoRotate={false}
              makeDefault
            />

            <Suspense fallback={<FallbackSphere />}>
              <Scene3DPure
                highlightMethod={highlightMethod}
                ionosphereHeight={ionosphereHeight}
                isPlaying={activePlaying}
                globalSpeed={globalSpeed}
              />
            </Suspense>
          </Canvas>

          {/* TOP-LEFT GLASSMORPHIC DYNAMIC HUD BADGE */}
          <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-xl px-3.5 py-2.5 flex flex-col gap-1 text-xs text-white shadow-xl z-20 max-w-[260px] sm:max-w-xs pointer-events-none">
            <div className="flex items-center gap-2 font-bold tracking-wide">
              <Globe className="w-4 h-4 text-sky-400 shrink-0" />
              {highlightMethod === "ground" && (
                <span className="text-rose-400 flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  Ground Wave (&lt; 2 MHz)
                </span>
              )}
              {highlightMethod === "sky" && (
                <span className="text-purple-400 flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  Sky Wave (2–30 MHz)
                </span>
              )}
              {highlightMethod === "line-of-sight" && (
                <span className="text-emerald-400 flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Line-of-Sight (&gt; 30 MHz)
                </span>
              )}
              {highlightMethod === "none" && (
                <span className="text-sky-300 font-mono">
                  3D Earth & Wave Paths
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {highlightMethod === "ground" &&
                "Follows Earth's curvature via ground surface conduction."}
              {highlightMethod === "sky" &&
                "Reflects off Ionosphere back down to Earth receiver."}
              {highlightMethod === "line-of-sight" &&
                "Direct high-frequency microwave dish beam."}
              {highlightMethod === "none" &&
                "3 dedicated geographic sectors on the 3D globe."}
            </p>
          </div>

          {/* TOP-RIGHT ROTATE HINT */}
          <div className="absolute top-3 right-3 hidden sm:flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 shadow-md z-20 pointer-events-none font-mono">
            <Rotate3D className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Drag to Orbit</span>
          </div>

          {/* BOTTOM INTERACTIVE QUICK METHOD HUD SELECTOR */}
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 bg-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-1.5 flex items-center justify-center gap-1.5 shadow-xl z-20">
            <button
              onClick={() => updateParam("highlightMethod", "none")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all flex items-center gap-1.5 ${
                highlightMethod === "none"
                  ? "bg-slate-800 text-sky-400 border border-sky-500/40 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              Show All
            </button>
            <button
              onClick={() => updateParam("highlightMethod", "ground")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all flex items-center gap-1.5 ${
                highlightMethod === "ground"
                  ? "bg-rose-950/70 text-rose-300 border border-rose-500/50 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Ground
            </button>
            <button
              onClick={() => updateParam("highlightMethod", "sky")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all flex items-center gap-1.5 ${
                highlightMethod === "sky"
                  ? "bg-purple-950/70 text-purple-300 border border-purple-500/50 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Sky
            </button>
            <button
              onClick={() => updateParam("highlightMethod", "line-of-sight")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all flex items-center gap-1.5 ${
                highlightMethod === "line-of-sight"
                  ? "bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              LOS
            </button>
          </div>
        </div>
      ) : (
        /* MODE B: TEXTBOOK 2D REFERENCE DIAGRAMS */
        <div className="w-full border rounded-2xl bg-slate-100/80 dark:bg-slate-950/90 border-border p-4 sm:p-6 shadow-sm relative overflow-hidden transition-colors duration-300">
          {/* Ambient Radial Grid Overlay */}
          <div
            className="absolute inset-0 opacity-25 dark:opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(currentColor 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4 relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Propagation Methods (2D Textbook Reference)</span>
            </div>
            <span className="text-[11px] text-muted-foreground hidden sm:inline font-mono">
              Click any diagram to isolate mode
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center justify-items-center relative z-10">
            <TextbookGlobeCard
              title="Ground propagation"
              freqText="(below 2 MHz)"
              method="ground"
              active={
                highlightMethod === "none" || highlightMethod === "ground"
              }
              isSelected={highlightMethod === "ground"}
              onClick={() =>
                updateParam(
                  "highlightMethod",
                  highlightMethod === "ground" ? "none" : "ground",
                )
              }
            />

            <TextbookGlobeCard
              title="Sky propagation"
              freqText="(2–30 MHz)"
              method="sky"
              active={highlightMethod === "none" || highlightMethod === "sky"}
              isSelected={highlightMethod === "sky"}
              onClick={() =>
                updateParam(
                  "highlightMethod",
                  highlightMethod === "sky" ? "none" : "sky",
                )
              }
            />

            <TextbookGlobeCard
              title="Line-of-sight propagation"
              freqText="(above 30 MHz)"
              method="line-of-sight"
              active={
                highlightMethod === "none" ||
                highlightMethod === "line-of-sight"
              }
              isSelected={highlightMethod === "line-of-sight"}
              onClick={() =>
                updateParam(
                  "highlightMethod",
                  highlightMethod === "line-of-sight"
                    ? "none"
                    : "line-of-sight",
                )
              }
            />
          </div>
        </div>
      )}

      {/* PEDAGOGICAL EXPLANATION & PHYSICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        <div
          className={`p-4 rounded-xl border space-y-2 transition-all ${
            highlightMethod === "ground"
              ? "bg-rose-500/10 border-rose-500/40 ring-1 ring-rose-500/30"
              : "bg-muted/20 border-border"
          }`}
        >
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Globe className="w-4 h-4 text-rose-500" /> 1. Ground Propagation
            (&lt; 2 MHz)
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Low-frequency signals follow Earth's curved contour through
            surface-wave diffraction.
          </p>
        </div>

        <div
          className={`p-4 rounded-xl border space-y-2 transition-all ${
            highlightMethod === "sky"
              ? "bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/30"
              : "bg-muted/20 border-border"
          }`}
        >
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Layers className="w-4 h-4 text-purple-500" /> 2. Sky Propagation
            (2–30 MHz)
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            High-frequency signals reflect off ionized atmospheric layers in the
            ionosphere.
          </p>
        </div>

        <div
          className={`p-4 rounded-xl border space-y-2 transition-all ${
            highlightMethod === "line-of-sight"
              ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30"
              : "bg-muted/20 border-border"
          }`}
        >
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b pb-2">
            <Radio className="w-4 h-4 text-emerald-500" /> 3. Line-of-Sight
            (&gt; 30 MHz)
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Very high-frequency waves require direct unobstructed point-to-point
            beams between antennas.
          </p>
        </div>
      </div>
    </div>
  );
}

// Fallback sphere while textures load
function FallbackSphere() {
  return (
    <mesh>
      <sphereGeometry args={[2.5, 32, 32]} />
      <meshStandardMaterial color="#1e3a8a" roughness={0.5} />
    </mesh>
  );
}

// GOOGLE EARTH CAMERA FLY-TO & PERSPECTIVE TARGETING CONTROLLER (TRUE SIDE VIEW)
function GoogleEarthCameraController({
  highlightMethod,
  gTxBase,
  gRxBase,
  sTxBase,
  sRxBase,
  lTxBase,
  lRxBase,
}: {
  highlightMethod: string;
  gTxBase: THREE.Vector3;
  gRxBase: THREE.Vector3;
  sTxBase: THREE.Vector3;
  sRxBase: THREE.Vector3;
  lTxBase: THREE.Vector3;
  lRxBase: THREE.Vector3;
}) {
  const isTransitioningRef = useRef(false);

  const targetState = useMemo(() => {
    switch (highlightMethod) {
      case "ground": {
        const gMid = gTxBase.clone().add(gRxBase).multiplyScalar(0.5);
        const norm = gMid.clone().normalize();
        const txToRx = gRxBase.clone().sub(gTxBase).normalize();
        const camDir = new THREE.Vector3()
          .crossVectors(norm, txToRx)
          .normalize();

        const lookAt = gMid.clone().add(norm.clone().multiplyScalar(0.4));
        const camPos = gMid
          .clone()
          .add(camDir.clone().multiplyScalar(3.2))
          .add(norm.clone().multiplyScalar(1.0));
        return { lookAt, camPos, norm };
      }
      case "sky": {
        const sMid = sTxBase.clone().add(sRxBase).multiplyScalar(0.5);
        const norm = sMid.clone().normalize();
        const txToRx = sRxBase.clone().sub(sTxBase).normalize();
        const camDir = new THREE.Vector3()
          .crossVectors(norm, txToRx)
          .normalize();

        const lookAt = sMid.clone().add(norm.clone().multiplyScalar(0.75));
        const camPos = sMid
          .clone()
          .add(camDir.clone().multiplyScalar(4.0))
          .add(norm.clone().multiplyScalar(1.2));
        return { lookAt, camPos, norm };
      }
      case "line-of-sight": {
        const lMid = lTxBase.clone().add(lRxBase).multiplyScalar(0.5);
        const norm = lMid.clone().normalize();
        const txToRx = lRxBase.clone().sub(lTxBase).normalize();
        const camDir = new THREE.Vector3()
          .crossVectors(norm, txToRx)
          .normalize();

        const lookAt = lMid.clone().add(norm.clone().multiplyScalar(0.35));
        const camPos = lMid
          .clone()
          .add(camDir.clone().multiplyScalar(2.8))
          .add(norm.clone().multiplyScalar(0.8));
        return { lookAt, camPos, norm };
      }
      default: {
        const lookAt = new THREE.Vector3(0, 0, 0);
        const camPos = new THREE.Vector3(0, 1.2, 6.5);
        const norm = new THREE.Vector3(0, 1, 0);
        return { lookAt, camPos, norm };
      }
    }
  }, [highlightMethod, gTxBase, gRxBase, sTxBase, sRxBase, lTxBase, lRxBase]);

  useEffect(() => {
    isTransitioningRef.current = true;
  }, [highlightMethod]);

  useFrame((state, delta) => {
    if (!isTransitioningRef.current || !state.controls) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orbControls = state.controls as any;
    const cam = state.camera;

    cam.position.x = THREE.MathUtils.damp(
      cam.position.x,
      targetState.camPos.x,
      4.5,
      delta,
    );
    cam.position.y = THREE.MathUtils.damp(
      cam.position.y,
      targetState.camPos.y,
      4.5,
      delta,
    );
    cam.position.z = THREE.MathUtils.damp(
      cam.position.z,
      targetState.camPos.z,
      4.5,
      delta,
    );

    cam.up.x = THREE.MathUtils.damp(cam.up.x, targetState.norm.x, 4.5, delta);
    cam.up.y = THREE.MathUtils.damp(cam.up.y, targetState.norm.y, 4.5, delta);
    cam.up.z = THREE.MathUtils.damp(cam.up.z, targetState.norm.z, 4.5, delta);

    if (orbControls.target) {
      orbControls.target.x = THREE.MathUtils.damp(
        orbControls.target.x,
        targetState.lookAt.x,
        4.5,
        delta,
      );
      orbControls.target.y = THREE.MathUtils.damp(
        orbControls.target.y,
        targetState.lookAt.y,
        4.5,
        delta,
      );
      orbControls.target.z = THREE.MathUtils.damp(
        orbControls.target.z,
        targetState.lookAt.z,
        4.5,
        delta,
      );
      cam.lookAt(orbControls.target);
      orbControls.update();
    }

    const distCam = cam.position.distanceTo(targetState.camPos);
    const distLook = orbControls.target
      ? orbControls.target.distanceTo(targetState.lookAt)
      : 0;

    if (distCam < 0.05 && distLook < 0.05) {
      isTransitioningRef.current = false;
    }
  });

  return null;
}

// PHOTOREALISTIC 3D SCENE ASSEMBLY WITH NASA TEXTURES & HIGH-DETAIL 3D MODELS
function Scene3DPure({
  highlightMethod,
  ionosphereHeight,
  isPlaying,
  globalSpeed,
}: {
  highlightMethod: string;
  ionosphereHeight: number;
  isPlaying: boolean;
  globalSpeed: number;
}) {
  const [colorMap, specMap, cloudsMap] = useTexture([
    "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg",
    "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg",
    "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png",
  ]);

  const cloudMeshRef = useRef<THREE.Mesh>(null);
  const globeGroupRef = useRef<THREE.Group>(null);

  const earthRadius = 2.5;
  const antennaScale = 0.22;
  const ionoRadius = earthRadius + 0.5 + (ionosphereHeight / 400) * 0.7;

  // DEDICATED GEOGRAPHIC SECTORS FOR EACH PROPAGATION METHOD ON THE GLOBE
  // Sector 1: Ground Propagation (Europe / Africa region)
  const gTxBase = useMemo(
    () => sphericalToVector3(earthRadius, 0.35, -0.4),
    [earthRadius],
  );
  const gRxBase = useMemo(
    () => sphericalToVector3(earthRadius, 0.35, 0.4),
    [earthRadius],
  );

  // Sector 2: Sky Propagation (Americas / Atlantic region)
  const sTxBase = useMemo(
    () => sphericalToVector3(earthRadius, -0.15, 1.8),
    [earthRadius],
  );
  const sRxBase = useMemo(
    () => sphericalToVector3(earthRadius, -0.15, 2.7),
    [earthRadius],
  );

  // Sector 3: Line-of-Sight Propagation (Asia / Pacific region)
  const lTxBase = useMemo(
    () => sphericalToVector3(earthRadius, 0.05, -2.1),
    [earthRadius],
  );
  const lRxBase = useMemo(
    () => sphericalToVector3(earthRadius, 0.05, -1.4),
    [earthRadius],
  );

  const latticeTipOffset = antennaScale * 4.2;
  const dishTipOffset = antennaScale * 2.7;

  const gTxTip = useMemo(
    () =>
      gTxBase
        .clone()
        .normalize()
        .multiplyScalar(earthRadius + latticeTipOffset),
    [gTxBase, earthRadius, latticeTipOffset],
  );
  const gRxTip = useMemo(
    () =>
      gRxBase
        .clone()
        .normalize()
        .multiplyScalar(earthRadius + latticeTipOffset),
    [gRxBase, earthRadius, latticeTipOffset],
  );

  const sTxTip = useMemo(
    () =>
      sTxBase
        .clone()
        .normalize()
        .multiplyScalar(earthRadius + latticeTipOffset),
    [sTxBase, earthRadius, latticeTipOffset],
  );
  const sRxTip = useMemo(
    () =>
      sRxBase
        .clone()
        .normalize()
        .multiplyScalar(earthRadius + latticeTipOffset),
    [sRxBase, earthRadius, latticeTipOffset],
  );

  const lTxTip = useMemo(
    () =>
      lTxBase
        .clone()
        .normalize()
        .multiplyScalar(earthRadius + dishTipOffset),
    [lTxBase, earthRadius, dishTipOffset],
  );
  const lRxTip = useMemo(
    () =>
      lRxBase
        .clone()
        .normalize()
        .multiplyScalar(earthRadius + dishTipOffset),
    [lRxBase, earthRadius, dishTipOffset],
  );

  useFrame((_, delta) => {
    if (cloudMeshRef.current && isPlaying) {
      cloudMeshRef.current.rotation.y += delta * 0.02 * globalSpeed;
    }
  });

  const showGround = highlightMethod === "none" || highlightMethod === "ground";
  const showSky = highlightMethod === "none" || highlightMethod === "sky";
  const showLOS =
    highlightMethod === "none" || highlightMethod === "line-of-sight";

  return (
    <>
      <GoogleEarthCameraController
        highlightMethod={highlightMethod}
        gTxBase={gTxBase}
        gRxBase={gRxBase}
        sTxBase={sTxBase}
        sRxBase={sRxBase}
        lTxBase={lTxBase}
        lRxBase={lRxBase}
      />
      <group ref={globeGroupRef}>
        {/* 1. PHOTOREALISTIC NASA 3D EARTH GLOBE WITH SPECULAR GLOSS */}
        <mesh>
          <sphereGeometry args={[earthRadius, 64, 64]} />
          <meshStandardMaterial
            map={colorMap}
            roughnessMap={specMap}
            roughness={0.35}
            metalness={0.25}
          />
        </mesh>

        {/* GLOWING LATITUDE / LONGITUDE COORDINATE GRID OVERLAY */}
        <mesh>
          <sphereGeometry args={[earthRadius + 0.003, 32, 16]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.06}
            wireframe
          />
        </mesh>

        {/* 2. ROTATING REALISTIC CLOUDS LAYER */}
        <mesh ref={cloudMeshRef}>
          <sphereGeometry args={[earthRadius + 0.03, 64, 64]} />
          <meshStandardMaterial
            map={cloudsMap}
            transparent={true}
            opacity={0.38}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Atmosphere Outer Rim Glow */}
        <mesh>
          <sphereGeometry args={[earthRadius + 0.08, 48, 48]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent={true}
            opacity={0.1}
            side={THREE.BackSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* 4. ANTENNA TOWERS ON THEIR DEDICATED GLOBE SECTORS */}
        {/* SECTOR 1: GROUND PROPAGATION TOWERS */}
        <AntennaTower3D
          position={gTxBase}
          color="#f43f5e"
          scale={antennaScale}
        />
        <AntennaTower3D
          position={gRxBase}
          color="#f43f5e"
          scale={antennaScale}
        />

        {/* SECTOR 2: SKY PROPAGATION TOWERS */}
        <AntennaTower3D
          position={sTxBase}
          color="#a855f7"
          scale={antennaScale}
        />
        <AntennaTower3D
          position={sRxBase}
          color="#a855f7"
          scale={antennaScale}
        />

        {/* SECTOR 3: LINE-OF-SIGHT DISH ANTENNAS */}
        <DishAntenna3D
          position={lTxBase}
          color="#10b981"
          scale={antennaScale}
        />
        <DishAntenna3D
          position={lRxBase}
          color="#10b981"
          scale={antennaScale}
        />

        {/* 6. DYNAMIC 3D ANIMATED SIGNAL PATHS & PHOTON PULSES */}
        {showGround && (
          <GroundSignal3DPath
            txTip={gTxTip}
            rxTip={gRxTip}
            isPlaying={isPlaying}
            globalSpeed={globalSpeed}
          />
        )}

        {showSky && (
          <SkySignal3DPath
            txTip={sTxTip}
            rxTip={sRxTip}
            ionoRadius={ionoRadius}
            isPlaying={isPlaying}
            globalSpeed={globalSpeed}
          />
        )}

        {showLOS && (
          <LOSSignal3DPath
            txTip={lTxTip}
            rxTip={lRxTip}
            ionoRadius={ionoRadius}
            isPlaying={isPlaying}
            globalSpeed={globalSpeed}
          />
        )}
      </group>
    </>
  );
}

// EXPANDING CONCENTRIC RADIO WAVEFRONT PULSES (SMOOTH HOLOGRAPHIC EM WAVE DOME)
function ExpandingRadioWavefronts({
  position,
  color,
  isPlaying,
  globalSpeed,
  maxRadius = 0.28,
}: {
  position: THREE.Vector3;
  color: string;
  isPlaying: boolean;
  globalSpeed: number;
  maxRadius?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const refs = [ring1Ref, ring2Ref];
    if (!isPlaying) {
      refs.forEach((ref) => {
        if (ref.current) {
          ref.current.scale.set(0.001, 0.001, 0.001);
          const mat = ref.current.material as THREE.MeshBasicMaterial;
          if (mat) mat.opacity = 0;
        }
      });
      return;
    }

    const now = performance.now() * 0.0009 * globalSpeed;

    refs.forEach((ref, idx) => {
      if (!ref.current) return;
      const phase = (now + idx * 0.5) % 1.0;
      const progress = phase;
      const currentRadius = Math.max(0.001, progress * maxRadius);
      ref.current.scale.set(currentRadius, currentRadius, currentRadius);

      const mat = ref.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = Math.sin(progress * Math.PI) * 0.18;
      }
    });
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={ring1Ref} scale={[0.001, 0.001, 0.001]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={ring2Ref} scale={[0.001, 0.001, 0.001]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// HIGH-DETAIL 3D BROADCAST LATTICE TRUSS TOWER WITH HOLOGRAPHIC FOOTPRINT & HUD
function AntennaTower3D({
  position,
  color,
  scale = 0.3,
}: {
  position: THREE.Vector3;
  color: string;
  scale?: number;
}) {
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      position.clone().normalize(),
    );
    return q;
  }, [position]);

  const beaconRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    if (beaconRef.current) {
      beaconRef.current.emissiveIntensity =
        2.0 + Math.sin(performance.now() * 0.008) * 1.5;
    }
  });

  const h = scale * 3.5;
  const baseW = scale * 0.4;
  const topW = scale * 0.1;

  return (
    <group position={position} quaternion={quat}>
      {/* Holographic Earth Footprint Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <torusGeometry args={[scale * 0.85, 0.012, 16, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>

      {/* Base Concrete Pad */}
      <mesh position={[0, scale * 0.05, 0]}>
        <boxGeometry args={[baseW * 1.4, scale * 0.1, baseW * 1.4]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 4 Corner Legs Tapered Lattice Structure */}
      {[-1, 1].map((xDir) =>
        [-1, 1].map((zDir) => (
          <mesh
            key={`${xDir}-${zDir}`}
            position={[
              (xDir * (baseW + topW)) / 4,
              h / 2,
              (zDir * (baseW + topW)) / 4,
            ]}
            rotation={[
              (-zDir * Math.atan2((baseW - topW) / 2, h)) / 2,
              0,
              (xDir * Math.atan2((baseW - topW) / 2, h)) / 2,
            ]}
          >
            <cylinderGeometry args={[0.012, 0.022, h, 8]} />
            <meshStandardMaterial
              color="#cbd5e1"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        )),
      )}

      {/* Horizontal & Diagonal Truss Cross-Braces */}
      {[0.25, 0.5, 0.75].map((factor) => {
        const yPos = h * factor;
        const wAtY = baseW - (baseW - topW) * factor;
        return (
          <group key={factor} position={[0, yPos, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.008, 0.008, wAtY, 6]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.8} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.008, 0.008, wAtY, 6]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.8} />
            </mesh>
          </group>
        );
      })}

      {/* Top Mounting Platform */}
      <mesh position={[0, h, 0]}>
        <cylinderGeometry args={[topW * 1.3, topW * 1.3, scale * 0.1, 12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Central Dipole Mast */}
      <mesh position={[0, h + scale * 0.4, 0]}>
        <cylinderGeometry args={[0.012, 0.018, scale * 0.8, 8]} />
        <meshStandardMaterial
          color="#f8fafc"
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Glowing Pulsing Beacon LED Tip */}
      <mesh position={[0, h + scale * 0.8, 0]}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshStandardMaterial
          ref={beaconRef}
          color={color}
          emissive={color}
          emissiveIntensity={2.5}
        />
      </mesh>
    </group>
  );
}

// HIGH-DETAIL 3D PARABOLIC MICROWAVE DISH ANTENNA WITH FOOTPRINT
function DishAntenna3D({
  position,
  color,
  scale = 0.3,
}: {
  position: THREE.Vector3;
  color: string;
  scale?: number;
}) {
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      position.clone().normalize(),
    );
    return q;
  }, [position]);

  const h = scale * 2.0;
  const dishRadius = scale * 0.65;

  return (
    <group position={position} quaternion={quat}>
      {/* Holographic Earth Footprint Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <torusGeometry args={[scale * 0.75, 0.012, 16, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>

      {/* Concrete Foundation Block */}
      <mesh position={[0, scale * 0.08, 0]}>
        <boxGeometry args={[scale * 0.6, scale * 0.16, scale * 0.6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* Main Support Mast */}
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.035, 0.05, h, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Rotary Gimbal Mount */}
      <mesh position={[0, h, 0]}>
        <sphereGeometry args={[scale * 0.15, 16, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Dish Collector Assembly */}
      <group position={[0, h + scale * 0.1, 0]} rotation={[0.35, 0, 0]}>
        {/* Parabolic Bowl Dish */}
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[dishRadius, scale * 0.25, 32, 1, true]} />
          <meshStandardMaterial
            color="#f8fafc"
            metalness={0.9}
            roughness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Outer Rim Ring */}
        <mesh position={[0, -scale * 0.125, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[dishRadius, 0.015, 16, 32]} />
          <meshStandardMaterial
            color="#94a3b8"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* 4 Quad Feed Horn Support Struts */}
        {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, idx) => (
          <mesh
            key={idx}
            position={[
              (dishRadius * 0.6 * Math.cos(angle)) / 2,
              scale * 0.2,
              (dishRadius * 0.6 * Math.sin(angle)) / 2,
            ]}
            rotation={[
              (-Math.sin(angle) * Math.PI) / 6,
              0,
              (Math.cos(angle) * Math.PI) / 6,
            ]}
          >
            <cylinderGeometry args={[0.008, 0.008, scale * 0.5, 6]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
        ))}

        {/* Focal Feed Horn Collector Tip */}
        <mesh position={[0, scale * 0.45, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2.5}
          />
        </mesh>
      </group>
    </group>
  );
}

// 3D GROUND SURFACE WAVE PATH WITH EXPANDING SPHERICAL WAVEFRONT PULSES
function GroundSignal3DPath({
  txTip,
  rxTip,
  isPlaying,
  globalSpeed,
}: {
  txTip: THREE.Vector3;
  rxTip: THREE.Vector3;
  isPlaying: boolean;
  globalSpeed: number;
}) {
  const p1Ref = useRef<THREE.Mesh>(null);
  const p2Ref = useRef<THREE.Mesh>(null);

  const curve = useMemo(() => {
    const tipRadius = txTip.length();
    const midPoint = txTip.clone().add(rxTip).multiplyScalar(0.5);
    midPoint.normalize().multiplyScalar(tipRadius + 0.05);

    return new THREE.CatmullRomCurve3([txTip.clone(), midPoint, rxTip.clone()]);
  }, [txTip, rxTip]);

  const points = useMemo(() => curve.getPoints(60), [curve]);

  useFrame(() => {
    if (!isPlaying) return;
    const time = (performance.now() * 0.0006 * globalSpeed) % 1.0;
    if (p1Ref.current) {
      p1Ref.current.position.copy(curve.getPoint(time));
    }
    if (p2Ref.current) {
      p2Ref.current.position.copy(curve.getPoint((time + 0.5) % 1.0));
    }
  });

  return (
    <group>
      {/* Surface Wave Path Line */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#f43f5e" linewidth={4} />
      </line>

      {/* Expanding Spherical Radio Wavefronts from Tx tip */}
      <ExpandingRadioWavefronts
        position={txTip}
        color="#f43f5e"
        isPlaying={isPlaying}
        globalSpeed={globalSpeed}
        maxRadius={0.7}
      />

      {/* Traveling Photon Packets */}
      {isPlaying && (
        <>
          <mesh ref={p1Ref}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#f43f5e"
              emissiveIntensity={2.5}
            />
          </mesh>
          <mesh ref={p2Ref}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#fda4af"
              emissiveIntensity={2.0}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

// 3D SKY REFLECTION WAVE PATH WITH IONOSPHERIC PLASMA SPLASH RIPPLES
function SkySignal3DPath({
  txTip,
  rxTip,
  ionoRadius,
  isPlaying,
  globalSpeed,
}: {
  txTip: THREE.Vector3;
  rxTip: THREE.Vector3;
  ionoRadius: number;
  isPlaying: boolean;
  globalSpeed: number;
}) {
  const p1Ref = useRef<THREE.Mesh>(null);
  const p2Ref = useRef<THREE.Mesh>(null);
  const splashRingRef = useRef<THREE.Mesh>(null);

  const bouncePos = useMemo(() => {
    const mid = txTip.clone().add(rxTip).multiplyScalar(0.5);
    return mid.normalize().multiplyScalar(ionoRadius);
  }, [txTip, rxTip, ionoRadius]);

  const pathPoints = useMemo(() => {
    return [txTip.clone(), bouncePos.clone(), rxTip.clone()];
  }, [txTip, bouncePos, rxTip]);

  useFrame(() => {
    if (!isPlaying) return;
    const time = (performance.now() * 0.0006 * globalSpeed) % 1.0;

    // Photon packet 1
    if (p1Ref.current) {
      if (time < 0.5) {
        const alpha = time / 0.5;
        p1Ref.current.position.lerpVectors(txTip, bouncePos, alpha);
      } else {
        const alpha = (time - 0.5) / 0.5;
        p1Ref.current.position.lerpVectors(bouncePos, rxTip, alpha);
      }
    }

    // Photon packet 2
    if (p2Ref.current) {
      const t2 = (time + 0.5) % 1.0;
      if (t2 < 0.5) {
        const alpha = t2 / 0.5;
        p2Ref.current.position.lerpVectors(txTip, bouncePos, alpha);
      } else {
        const alpha = (t2 - 0.5) / 0.5;
        p2Ref.current.position.lerpVectors(bouncePos, rxTip, alpha);
      }
    }

    // Expanding Ionosphere Impact Splash Ring
    if (splashRingRef.current) {
      const splashPhase = (performance.now() * 0.0015 * globalSpeed) % 1.0;
      const sRadius = 0.05 + splashPhase * 0.45;
      splashRingRef.current.scale.set(sRadius, sRadius, sRadius);
      const mat = splashRingRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = (1 - splashPhase) * 0.7;
      }
    }
  });

  const splashQuat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      bouncePos.clone().normalize(),
    );
    return q;
  }, [bouncePos]);

  return (
    <group>
      {/* Sky Signal Path Line */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(pathPoints.flatMap((p) => [p.x, p.y, p.z])),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#a855f7" linewidth={4} />
      </line>

      {/* Ionosphere Reflection Point Indicator */}
      <mesh position={bouncePos}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#c084fc"
          emissiveIntensity={2.5}
        />
      </mesh>

      {/* Plasma Reflection Splash Ring on Ionosphere Shell */}
      <group position={bouncePos} quaternion={splashQuat}>
        <mesh ref={splashRingRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1, 0.04, 16, 32]} />
          <meshBasicMaterial color="#c084fc" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Expanding Wavefronts from Tx Tip */}
      <ExpandingRadioWavefronts
        position={txTip}
        color="#a855f7"
        isPlaying={isPlaying}
        globalSpeed={globalSpeed}
        maxRadius={0.7}
      />

      {/* Traveling Photon Packets */}
      {isPlaying && (
        <>
          <mesh ref={p1Ref}>
            <sphereGeometry args={[0.075, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#a855f7"
              emissiveIntensity={2.5}
            />
          </mesh>
          <mesh ref={p2Ref}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#e9d5ff"
              emissiveIntensity={2.0}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

// 3D LINE-OF-SIGHT PROPAGATION WITH DIRECT LASER CORE & MICROWAVE PULSES
function LOSSignal3DPath({
  txTip,
  rxTip,
  isPlaying,
  globalSpeed,
}: {
  txTip: THREE.Vector3;
  rxTip: THREE.Vector3;
  ionoRadius?: number;
  isPlaying: boolean;
  globalSpeed: number;
}) {
  const pulse1Ref = useRef<THREE.Mesh>(null);
  const pulse2Ref = useRef<THREE.Mesh>(null);

  // Cylinder Laser Beam Geometry connecting Tx tip directly to Rx tip
  const beamLength = useMemo(() => txTip.distanceTo(rxTip), [txTip, rxTip]);
  const beamCenter = useMemo(
    () => txTip.clone().add(rxTip).multiplyScalar(0.5),
    [txTip, rxTip],
  );
  const beamQuat = useMemo(() => {
    const q = new THREE.Quaternion();
    const dir = rxTip.clone().sub(txTip).normalize();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return q;
  }, [txTip, rxTip]);

  useFrame(() => {
    if (!isPlaying) return;
    const time = (performance.now() * 0.0008 * globalSpeed) % 1.0;

    if (pulse1Ref.current) {
      pulse1Ref.current.position.lerpVectors(txTip, rxTip, time);
    }
    if (pulse2Ref.current) {
      pulse2Ref.current.position.lerpVectors(txTip, rxTip, (time + 0.5) % 1.0);
    }
  });

  return (
    <group>
      {/* High-Tech Glowing Microwave Beam Sheath (Cylinder) */}
      <group position={beamCenter} quaternion={beamQuat}>
        {/* Core High-Intensity Laser Beam */}
        <mesh>
          <cylinderGeometry args={[0.015, 0.015, beamLength, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.95} />
        </mesh>

        {/* Outer Emissive Green Glow Sheath */}
        <mesh>
          <cylinderGeometry args={[0.038, 0.038, beamLength, 16]} />
          <meshBasicMaterial
            color="#10b981"
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Traveling Focused Energy Pulses */}
      {isPlaying && (
        <>
          <mesh ref={pulse1Ref}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#10b981"
              emissiveIntensity={3.5}
            />
          </mesh>
          <mesh ref={pulse2Ref}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#6ee7b7"
              emissiveIntensity={2.5}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

// Textbook Globe Card
function TextbookGlobeCard({
  title,
  freqText,
  method,
  active,
  isSelected,
  onClick,
}: {
  title: string;
  freqText: string;
  method: "ground" | "sky" | "line-of-sight";
  active: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const w = 240;
  const h = 280;
  const cx = 120;
  const cy = 135;
  const earthR = 55;
  const ionoR = 90;

  const colorMap = {
    ground: "#f43f5e",
    sky: "#c084fc",
    "line-of-sight": "#10b981",
  };
  const mainColor = colorMap[method];

  const cardStyle = isSelected
    ? method === "ground"
      ? "bg-card border-rose-500/60 ring-2 ring-rose-500/40 shadow-lg scale-[1.02]"
      : method === "sky"
        ? "bg-card border-purple-500/60 ring-2 ring-purple-500/40 shadow-lg scale-[1.02]"
        : "bg-card border-emerald-500/60 ring-2 ring-emerald-500/40 shadow-lg scale-[1.02]"
    : active
      ? "bg-card border-border hover:border-amber-500/50 shadow-sm hover:shadow-md cursor-pointer"
      : "bg-card border-border opacity-50 hover:opacity-80 cursor-pointer";

  // Vertical Tower Geometry (Straight vertical masts parallel to Y-axis)
  const dx = 38; // horizontal spacing from center
  const earthYAtDx = cy - Math.sqrt(earthR * earthR - dx * dx); // ~95.2 px

  // Line-of-sight tall vertical towers
  const losHeight = 22;
  const losTxX = cx - dx;
  const losTxBaseY = earthYAtDx;
  const losTxTipY = earthYAtDx - losHeight;

  const losRxX = cx + dx;
  const losRxBaseY = earthYAtDx;
  const losRxTipY = earthYAtDx - losHeight;

  // Sky propagation vertical towers
  const skyHeight = 16;
  const skyTxX = cx - dx;
  const skyTxBaseY = earthYAtDx;
  const skyTxTipY = earthYAtDx - skyHeight;

  const skyRxX = cx + dx;
  const skyRxBaseY = earthYAtDx;
  const skyRxTipY = earthYAtDx - skyHeight;

  // Ground propagation single central tower
  const groundBaseY = cy - earthR; // 80 px
  const groundTipY = groundBaseY - 16; // 64 px
  const R_ground = earthR + 16; // 71 px

  return (
    <div
      onClick={onClick}
      className={cn(
        `flex flex-col items-center p-3.5 rounded-xl border transition-all`,
        cardStyle,
      )}
    >
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full max-w-[240px] h-auto select-none"
      >
        <defs>
          {/* Auto-orienting arrowhead marker for crisp, aligned pointers */}
          <marker
            id={`arrow-head-${method}`}
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={mainColor} />
          </marker>
        </defs>

        {/* Ionosphere Label */}
        <text
          x={cx}
          y="22"
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          className="fill-foreground font-sans"
        >
          Ionosphere
        </text>

        {/* Ionosphere Outer Translucent Ring */}
        <circle
          cx={cx}
          cy={cy}
          r={ionoR}
          fill="none"
          stroke="#a855f7"
          strokeWidth="10"
          opacity="0.2"
        />
        <circle
          cx={cx}
          cy={cy}
          r={ionoR}
          fill="none"
          stroke="#a855f7"
          strokeWidth="1.5"
          opacity="0.7"
        />

        {/* Earth Globe Circle — Theme / App Mode Aware */}
        <circle
          cx={cx}
          cy={cy}
          r={earthR}
          className="fill-slate-200 dark:fill-slate-800 stroke-slate-400 dark:stroke-slate-600"
          strokeWidth="2"
        />

        {/* METHOD 1: GROUND PROPAGATION (Single central vertical tower emitting dual outward rays parallel to circumference) */}
        {method === "ground" && (
          <g>
            {/* Single Central Antenna Tower (Straight Vertical Mast) */}
            <line
              x1={cx}
              y1={groundBaseY}
              x2={cx}
              y2={groundTipY}
              stroke={mainColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx={cx} cy={groundTipY} r="3" fill={mainColor} />

            {/* Left Outward Ray Arc — Concentric & Parallel to Earth Circumference with auto-aligned arrowhead */}
            <path
              d={`M ${cx} ${groundTipY} A ${R_ground} ${R_ground} 0 0 0 ${cx - R_ground * Math.sin((60 * Math.PI) / 180)} ${cy - R_ground * Math.cos((60 * Math.PI) / 180)}`}
              fill="none"
              stroke={mainColor}
              strokeWidth="2.5"
              strokeDasharray="4 3"
              markerEnd={`url(#arrow-head-${method})`}
            />

            {/* Right Outward Ray Arc — Concentric & Parallel to Earth Circumference with auto-aligned arrowhead */}
            <path
              d={`M ${cx} ${groundTipY} A ${R_ground} ${R_ground} 0 0 1 ${cx + R_ground * Math.sin((60 * Math.PI) / 180)} ${cy - R_ground * Math.cos((60 * Math.PI) / 180)}`}
              fill="none"
              stroke={mainColor}
              strokeWidth="2.5"
              strokeDasharray="4 3"
              markerEnd={`url(#arrow-head-${method})`}
            />
          </g>
        )}

        {/* METHOD 2: SKY PROPAGATION (Straight vertical towers + Ionospheric reflection) */}
        {method === "sky" && (
          <g>
            {/* Tx Vertical Antenna Tower */}
            <line
              x1={skyTxX}
              y1={skyTxBaseY}
              x2={skyTxX}
              y2={skyTxTipY}
              stroke={mainColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx={skyTxX} cy={skyTxTipY} r="3" fill={mainColor} />

            {/* Rx Vertical Antenna Tower */}
            <line
              x1={skyRxX}
              y1={skyRxBaseY}
              x2={skyRxX}
              y2={skyRxTipY}
              stroke={mainColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx={skyRxX} cy={skyRxTipY} r="3" fill={mainColor} />

            {/* Upward ray to ionosphere with auto-aligned arrowhead */}
            <line
              x1={skyTxX}
              y1={skyTxTipY}
              x2={cx}
              y2={cy - ionoR + 4}
              stroke={mainColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              markerEnd={`url(#arrow-head-${method})`}
            />
            {/* Downward reflected ray from ionosphere with auto-aligned arrowhead */}
            <line
              x1={cx}
              y1={cy - ionoR + 4}
              x2={skyRxX}
              y2={skyRxTipY}
              stroke={mainColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              markerEnd={`url(#arrow-head-${method})`}
            />
          </g>
        )}

        {/* METHOD 3: LINE-OF-SIGHT PROPAGATION (Straight vertical towers + Direct horizontal beam) */}
        {method === "line-of-sight" && (
          <g>
            {/* Tx Straight Vertical Tower */}
            <line
              x1={losTxX}
              y1={losTxBaseY}
              x2={losTxX}
              y2={losTxTipY}
              stroke={mainColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Dish reflector on Tx tower */}
            <path
              d={`M ${losTxX - 4} ${losTxTipY - 4} A 6 6 0 0 0 ${losTxX - 4} ${losTxTipY + 4}`}
              fill="none"
              stroke={mainColor}
              strokeWidth="2"
            />
            <circle cx={losTxX} cy={losTxTipY} r="2.5" fill={mainColor} />

            {/* Rx Straight Vertical Tower */}
            <line
              x1={losRxX}
              y1={losRxBaseY}
              x2={losRxX}
              y2={losRxTipY}
              stroke={mainColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Dish reflector on Rx tower */}
            <path
              d={`M ${losRxX + 4} ${losRxTipY - 4} A 6 6 0 0 1 ${losRxX + 4} ${losRxTipY + 4}`}
              fill="none"
              stroke={mainColor}
              strokeWidth="2"
            />
            <circle cx={losRxX} cy={losRxTipY} r="2.5" fill={mainColor} />

            {/* Direct Line-of-Sight Horizontal Beam with auto-aligned arrowhead */}
            <line
              x1={losTxX}
              y1={losTxTipY}
              x2={losRxX}
              y2={losRxTipY}
              stroke={mainColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              markerEnd={`url(#arrow-head-${method})`}
            />
          </g>
        )}

        {/* Card Title & Frequency Subtext — POSITIONED SAFELY BELOW IONOSPHERE RING (y=252 & y=268) */}
        <text
          x={cx}
          y="252"
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          className="fill-foreground font-sans"
        >
          {title}
        </text>
        <text
          x={cx}
          y="268"
          textAnchor="middle"
          fontSize="11"
          fontWeight="normal"
          className="fill-muted-foreground font-sans"
        >
          {freqText}
        </text>
      </svg>
    </div>
  );
}
