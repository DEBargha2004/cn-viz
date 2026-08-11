import { Suspense, useState } from "react";
import { vizRegistry } from "../../visualizations/registry";
import { useVizState } from "../../state/useVizState";
import { ControlPanel } from "./ControlPanel";
import { type VizRef } from "../../lib/content";
import { AlertCircle, Play, Pause } from "lucide-react";
import { Button } from "../ui/button";

interface VisualizationSectionProps {
  topicId: string;
  vizRef: VizRef;
}

export function UnknownVizFallback({ vizKey }: { vizKey: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <div>
        <p className="font-semibold text-sm">Failed to render visualization</p>
        <p className="text-xs text-destructive/80 mt-0.5">
          The visualization key{" "}
          <code className="bg-destructive/15 px-1 py-0.5 rounded font-mono font-bold">
            {vizKey}
          </code>{" "}
          is not registered in the system.
        </p>
      </div>
    </div>
  );
}

export function VizSkeleton() {
  return (
    <div className="flex h-[200px] w-full animate-pulse items-center justify-center rounded-lg bg-muted/30 border">
      <div className="text-sm text-muted-foreground font-medium">
        Loading visualization...
      </div>
    </div>
  );
}

export function VisualizationSection({
  topicId,
  vizRef,
}: VisualizationSectionProps) {
  const entry = vizRegistry[vizRef.vizKey];

  const defaults = entry
    ? (Object.fromEntries(
        (entry.meta.params ?? []).map((p) => [
          p.key,
          vizRef.paramOverrides?.[p.key] ?? p.default,
        ]),
      ) as Record<string, unknown>)
    : {};

  const [values, setValues] = useVizState(topicId, vizRef.stateScope, defaults);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!entry) {
    return <UnknownVizFallback vizKey={vizRef.vizKey} />;
  }

  const hasControls =
    (entry.meta.params && entry.meta.params.length > 0) || entry.meta.animated;

  return (
    <div className="rounded-lg border p-4 space-y-4 bg-muted/5 shadow-sm">
      <div className="flex items-center justify-between border-b pb-2">
        <span className="text-sm font-semibold tracking-wide text-muted-foreground/80">
          {entry.meta.title}
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 bg-muted px-1.5 py-0.5 rounded border border-border">
          {entry.meta.renderer}
        </span>
      </div>
      <div className="relative">
        <Suspense fallback={<VizSkeleton />}>
          <entry.component
            {...vizRef.props}
            values={values}
            key={`${vizRef.vizKey}-${topicId}`}
            isPlaying={entry.meta.animated ? isPlaying : undefined}
          />
        </Suspense>
        {entry.meta.animated && (
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant={isPlaying ? "outline" : "default"}
              size="sm"
              className="gap-2 shadow-md bg-background/95 hover:bg-accent hover:text-accent-foreground text-foreground border border-input backdrop-blur-sm"
              onClick={() => setIsPlaying((prev) => !prev)}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isPlaying ? "Pause" : "Play"}
            </Button>
          </div>
        )}
      </div>
      {hasControls ? (
        <div className="border-t pt-4">
          <ControlPanel
            params={entry.meta.params ?? []}
            values={values}
            onChange={setValues}
          />
        </div>
      ) : null}
    </div>
  );
}
