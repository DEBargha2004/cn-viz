import React from "react";

export interface VisualizationHeaderProps {
  title: string;
  subtitle?: string;
  category?: string;
  renderer?: "svg" | "canvas" | "html";
  animated?: boolean;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function VisualizationHeader({
  title,
  subtitle,
  animated,
  actions,
  children,
}: VisualizationHeaderProps) {
  return (
    <div className="space-y-3 pb-2 border-b border-border/80">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-col space-y-0.5 min-w-0">
          <h3 className="text-sm font-bold tracking-tight text-foreground truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground font-sans line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {animated && (
            <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              ANIMATED
            </span>
          )}
          {actions}
        </div>
      </div>

      {children && <div className="pt-1">{children}</div>}
    </div>
  );
}
