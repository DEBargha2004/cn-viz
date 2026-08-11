import { useAppStore } from "../../state/appStore";
import { Slider } from "../ui/slider";
import { Gauge } from "lucide-react";

export function GlobalSpeedControl() {
  const globalSpeedMultiplier = useAppStore((s) => s.globalSpeedMultiplier ?? 1);
  const setGlobalSpeedMultiplier = useAppStore((s) => s.setGlobalSpeedMultiplier);

  const presets = [0.5, 1.0, 2.0];

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border/60 p-3 bg-card/60 backdrop-blur-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          <Gauge className="size-3.5 text-primary" />
          <span>Global Speed</span>
        </div>
        <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
          {globalSpeedMultiplier.toFixed(1)}x
        </span>
      </div>

      <Slider
        min={0.1}
        max={3.0}
        step={0.1}
        value={globalSpeedMultiplier}
        onValueChange={(val) => setGlobalSpeedMultiplier(val as number)}
        className="cursor-pointer py-1"
      />

      <div className="flex items-center gap-1.5 pt-0.5">
        {presets.map((preset) => {
          const isActive = Math.abs(globalSpeedMultiplier - preset) < 0.05;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => setGlobalSpeedMultiplier(preset)}
              className={`flex-1 py-1 rounded-md text-[11px] font-mono font-medium transition-all duration-150 cursor-pointer border ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                  : "bg-secondary/60 text-muted-foreground border-border/40 hover:bg-secondary hover:text-foreground"
              }`}
            >
              {preset.toFixed(1)}x
            </button>
          );
        })}
      </div>
    </div>
  );
}
