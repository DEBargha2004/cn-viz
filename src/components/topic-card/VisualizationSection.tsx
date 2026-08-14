import { Suspense, useState, useRef, useEffect } from "react";
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

export function VizSkeleton({ minHeight }: { minHeight?: number }) {
  return (
    <div
      className="flex w-full animate-pulse items-center justify-center rounded-lg bg-muted/30 border"
      style={{ height: minHeight ? `${minHeight}px` : "200px" }}
    >
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
  const vizWrapperRef = useRef<HTMLDivElement>(null);
  const [recordedHeight, setRecordedHeight] = useState<number | undefined>(
    undefined,
  );

  // We set freezeOnceVisible: false so heavy WebGL/Canvas elements unmount to save RAM/GPU.
  // The recordedHeight state completely prevents the layout shift when they unmount.
  const isVisible = useIntersectionObserver(containerRef, {
    freezeOnceVisible: false,
    rootMargin: "600px 0px", // Larger margin to load before user sees it
  });

  // Track the precise height of the visualization while it is mounted
  useEffect(() => {
    if (isVisible && vizWrapperRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.height > 0) {
            // We use borderBoxSize if available for exact dimensions including borders/padding,
            // otherwise fallback to bounding client rect height.
            const height =
              entry.borderBoxSize?.[0]?.blockSize ??
              entry.target.getBoundingClientRect().height;
            setRecordedHeight(height);
          }
        }
      });
      resizeObserver.observe(vizWrapperRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [isVisible]);

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
    <div
      ref={containerRef}
      className="rounded-lg border p-4 space-y-4 bg-muted/5 shadow-sm"
    >
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
              className="h-7 text-xs gap-1.5 shadow-2xs cursor-pointer"
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
      <div className="relative w-full" ref={vizWrapperRef}>
        {isVisible ? (
          <Suspense fallback={<VizSkeleton minHeight={recordedHeight} />}>
            <entry.component
              {...vizRef.props}
              values={values}
              onChange={setValues}
              key={`${vizRef.vizKey}-${topicId}`}
              isPlaying={entry.meta.animated ? isPlaying : undefined}
            />
          </Suspense>
        ) : (
          <VizSkeleton minHeight={recordedHeight} />
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
