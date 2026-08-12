import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { type VizParamDef } from "../../visualizations/types";

interface ControlPanelProps {
  params: VizParamDef[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}

export function ControlPanel({ params, values, onChange }: ControlPanelProps) {
  const handleParamChange = (key: string, val: unknown) => {
    onChange({
      ...values,
      [key]: val,
    });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 items-stretch">
      {params.map((param) => {
        const val = values[param.key] ?? param.default;

        return (
          <div
            key={param.key}
            className="flex flex-col justify-center border rounded-xl p-3 bg-muted/10 dark:bg-muted/20 hover:border-border/60 transition-colors min-h-[70px] shadow-2xs"
          >
            {param.type === "number" && (
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between text-xs font-bold">
                  <label className="text-muted-foreground uppercase tracking-wider">
                    {param.label}
                  </label>
                  <span className="font-mono text-xs bg-background border px-1.5 py-0.5 rounded shadow-2xs">
                    {Number(val).toFixed(param.step && param.step < 1 ? 2 : 1)}
                  </span>
                </div>
                <Slider
                  min={param.min}
                  max={param.max}
                  step={param.step ?? 1}
                  value={val as number}
                  onValueChange={(v) =>
                    handleParamChange(param.key, v as number)
                  }
                  className="cursor-pointer"
                />
              </div>
            )}

            {param.type === "boolean" && (
              <div className="flex items-center justify-between w-full h-full">
                <label
                  className="text-xs font-extrabold text-foreground cursor-pointer pr-2 select-none"
                  htmlFor={param.key}
                >
                  {param.label}
                </label>
                <Switch
                  id={param.key}
                  checked={val as boolean}
                  onCheckedChange={(checked) =>
                    handleParamChange(param.key, checked)
                  }
                />
              </div>
            )}

            {param.type === "select" && (
              <div className="space-y-1.5 w-full">
                <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider block">
                  {param.label}
                </label>
                <Select
                  value={val as string}
                  onValueChange={(selectedVal) =>
                    handleParamChange(param.key, selectedVal)
                  }
                  items={param.options}
                >
                  <SelectTrigger className="w-full h-9 bg-background border shadow-2xs text-xs font-medium">
                    <SelectValue placeholder={`Select ${param.label}`} />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {param.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {param.type === "color" && (
              <div className="flex items-center justify-between w-full h-full">
                <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
                  {param.label}
                </label>
                <div className="relative w-8 h-8 rounded-full overflow-hidden border shadow-2xs flex items-center justify-center shrink-0">
                  <input
                    type="color"
                    value={val as string}
                    onChange={(e) =>
                      handleParamChange(param.key, e.target.value)
                    }
                    className="absolute inset-0 w-[150%] h-[150%] translate-x-[-15%] translate-y-[-15%] cursor-pointer border-none p-0 bg-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
