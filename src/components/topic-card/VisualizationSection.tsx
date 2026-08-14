import { Suspense, useState, useRef } from "react";
import { vizRegistry } from "../../visualizations/registry";
import { useVizState } from "../../state/useVizState";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";
import { ControlPanel } from "./ControlPanel";
import { VisualizationHeader } from "./VisualizationHeader";
import { type VizRef } from "../../lib/content";
import { AlertCircle, Play, Pause } from "lucide-react";
import { Button } from "../ui/button";

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

interface VisualizationSectionProps {
  topicId: string;
  vizRef: VizRef;
}

export function VisualizationSection({
  topicId,
  vizRef,
}: VisualizationSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(containerRef);

  const entry = vizRegistry[vizRef.vizKey];

  const defaults = entry
    ? (Object.fromEntries(
        (entry.meta.params ?? []).map((p) => [
          p.key,
          vizRef.paramOverrides?.[p.key] ??
            (vizRef.props as Record<string, unknown>)?.[p.key] ??
            p.default,
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
    <div ref={containerRef} className="rounded-lg border p-4 space-y-4 bg-muted/5 shadow-sm">
      <VisualizationHeader
        title={entry.meta.title}
        renderer={entry.meta.renderer}
        animated={entry.meta.animated}
        category={entry.meta.category}
        actions={
          entry.meta.animated ? (
            <Button
              variant={isPlaying ? "outline" : "default"}
              size="sm"
              className="h-7 text-xs gap-1.5 shadow-2xs"
              onClick={() => setIsPlaying((prev) => !prev)}
            >
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {isPlaying ? "Pause" : "Play"}
            </Button>
          ) : undefined
        }
      />
      <div className="relative">
        {isVisible ? (
          <Suspense fallback={<VizSkeleton />}>
            <entry.component
              {...vizRef.props}
              values={values}
              onChange={setValues}
              key={`${vizRef.vizKey}-${topicId}`}
              isPlaying={entry.meta.animated ? isPlaying : undefined}
            />
          </Suspense>
        ) : (
          <VizSkeleton />
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

