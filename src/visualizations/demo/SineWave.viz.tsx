/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState, useRef } from "react";
import { type VizMeta } from "../types";
import { useAppStore } from "../../state/appStore";

export const vizMeta: VizMeta = {
  key: "sine-wave",
  title: "Sine Wave Generator",
  category: "demo",
  renderer: "svg",
  animated: true,
  params: [
    {
      key: "frequency",
      type: "number",
      label: "Frequency",
      default: 1,
      min: 0.1,
      max: 5,
      step: 0.1,
    },
    {
      key: "amplitude",
      type: "number",
      label: "Amplitude",
      default: 50,
      min: 5,
      max: 100,
      step: 1,
    },
    {
      key: "speed",
      type: "number",
      label: "Speed",
      default: 1,
      min: 0,
      max: 5,
      step: 0.1,
    },
  ],
};

interface Props {
  values: Record<string, unknown>;
  isPlaying?: boolean;
}

export default function SineWave({ values, isPlaying }: Props) {
  const frequency = (values.frequency as number) ?? 1;
  const amplitude = (values.amplitude as number) ?? 50;
  const speed = (values.speed as number) ?? 1;

  // Use globalSpeedMultiplier from appStore
  const globalSpeedMultiplier = useAppStore((s) => s.globalSpeedMultiplier ?? 1);

  const [phase, setPhase] = useState(0);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current !== null) {
        const delta = time - lastTimeRef.current;
        // Animate phase based on time elapsed, speed, and global speed multiplier
        const currentSpeed = speed ?? 1;
        const currentMultiplier = globalSpeedMultiplier ?? 1;
        if (isPlayingRef.current) {
          setPhase((prev) => prev + (delta * 0.002 * currentSpeed * currentMultiplier));
        }
      }
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      lastTimeRef.current = null; // Reset timestamp on cleanup to prevent timing jumps
    };
  }, [speed, globalSpeedMultiplier]);

  // Generate SVG path for a sine wave from x=0 to x=600
  const points: string[] = [];
  const width = 600;
  const height = 200;
  const centerY = height / 2;

  for (let x = 0; x <= width; x += 2) {
    const currentPhase = isNaN(phase) ? 0 : phase;
    const y = centerY + amplitude * Math.sin((2 * Math.PI * frequency * x) / width - currentPhase);
    if (!isNaN(y)) {
      points.push(`${x},${y}`);
    }
  }
  const d = points.length > 0 ? `M ${points.join(" L ")}` : "M 0 0";

  return (
    <div className="flex flex-col items-center justify-center bg-muted/20 rounded-lg p-6">
      <svg className="w-full max-w-2xl bg-card border rounded-lg shadow-sm" viewBox={`0 0 ${width} ${height}`}>
        {/* Horizontal reference axis */}
        <line x1="0" y1={centerY} x2={width} y2={centerY} stroke="var(--border)" strokeDasharray="4 4" />
        {/* Sine wave path */}
        <path d={d} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}
