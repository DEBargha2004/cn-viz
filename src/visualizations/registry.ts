import { lazy } from "react";
import type { VizMeta } from "./types";

const metaModules = import.meta.glob<VizMeta>("./**/*.viz.tsx", {
  eager: true,
  import: "vizMeta",
  query: "?vizMeta",
});

const componentLoaders = import.meta.glob("./**/*.viz.tsx");

interface RegistryEntry {
  meta: VizMeta;
  component: React.LazyExoticComponent<
    React.ComponentType<{ values: Record<string, unknown>; [key: string]: unknown }>
  >;
}

export const vizRegistry: Record<string, RegistryEntry> = {};

for (const [path, meta] of Object.entries(metaModules)) {
  if (!meta) continue; // file didn't export vizMeta — skip, don't throw at build time
  
  const loader = componentLoaders[path] as () => Promise<{
    default: React.ComponentType<{ values: Record<string, unknown>; [key: string]: unknown }>;
  }>;

  vizRegistry[meta.key] = {
    meta,
    component: lazy(loader),
  };
}
