export type VizParamDef =
  | {
      key: string;
      type: "number";
      label: string;
      default: number;
      min: number;
      max: number;
      step?: number;
    }
  | { key: string; type: "boolean"; label: string; default: boolean }
  | {
      key: string;
      type: "select";
      label: string;
      default: string;
      options: { label: string; value: string }[];
    }
  | { key: string; type: "color"; label: string; default: string };

export interface VizMeta {
  key: string;
  title: string;
  category: string;
  renderer: "svg" | "canvas" | "html";
  animated?: boolean;
  params?: VizParamDef[];
}
