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

export function ControlPanel({
  params,
  values,
  onChange,
}: ControlPanelProps) {
  const handleParamChange = (key: string, val: unknown) => {
    onChange({
      ...values,
      [key]: val,
    });
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {params.map((param) => {
        const val = values[param.key] ?? param.default;

        return (
          <div key={param.key} className="space-y-2">
            {param.type === "number" && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <label className="text-muted-foreground">{param.label}</label>
                  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded border">
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
              <div className="flex items-center justify-between border rounded-lg p-3 bg-muted/10">
                <label
                  className="text-sm font-medium text-muted-foreground cursor-pointer"
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
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  {param.label}
                </label>
                <Select
                  value={val as string}
                  onValueChange={(selectedVal) =>
                    handleParamChange(param.key, selectedVal)
                  }
                  items={param.options}
                >
                  <SelectTrigger className="w-full bg-background border shadow-sm">
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
              <div className="flex items-center gap-3 border rounded-lg p-3 bg-muted/10">
                <label className="text-sm font-medium text-muted-foreground flex-1">
                  {param.label}
                </label>
                <div className="relative w-8 h-8 rounded-full overflow-hidden border shadow-sm flex items-center justify-center">
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
