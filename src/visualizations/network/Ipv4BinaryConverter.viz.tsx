import { useState, useEffect } from "react";
import { type VizMeta } from "../types";
import { useVizState } from "../../state/useVizState";
import { RefreshCw } from "lucide-react";

export const vizMeta: VizMeta = {
  key: "network-ipv4-binary-converter",
  title: "IPv4 Dotted-Decimal ↔ 32-Bit Binary Converter",
  category: "network",
  renderer: "svg",
  animated: false,
  params: [
    {
      key: "initialIp",
      type: "select",
      label: "Preset Example IP",
      default: "192.168.1.100",
      options: [
        { label: "192.168.1.100 (Class C Private)", value: "192.168.1.100" },
        { label: "10.0.0.1 (Class A Private)", value: "10.0.0.1" },
        { label: "172.16.254.1 (Class B Private)", value: "172.16.254.1" },
        { label: "8.8.8.8 (Google DNS)", value: "8.8.8.8" },
        { label: "255.255.255.0 (Subnet Mask)", value: "255.255.255.0" },
        { label: "127.0.0.1 (Loopback / Localhost)", value: "127.0.0.1" },
      ],
    },
  ],
};

interface Props {
  topicId?: string;
  scope?: "local" | "chapter" | "app";
  props?: Record<string, unknown>;
  values?: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
}

export default function Ipv4BinaryConverter({
  topicId = "ipv4-addressing",
  scope = "local",
  values: propsValues,
  onChange,
}: Props) {
  const defaults: Record<string, unknown> = {
    initialIp: "192.168.1.100",
  };

  const [stateValues, setStateValues] = useVizState<Record<string, unknown>>(
    topicId,
    scope,
    defaults,
  );
  const values = propsValues ?? stateValues;

  const initialIpStr = (values.initialIp as string) || "192.168.1.100";
  const [octets, setOctets] = useState<number[]>([192, 168, 1, 100]);

  // Synchronize octet sliders whenever initialIp preset param changes from control panel
  useEffect(() => {
    const parsed = initialIpStr.split(".").map((n) => parseInt(n, 10));
    if (
      parsed.length === 4 &&
      parsed.every((n) => !isNaN(n) && n >= 0 && n <= 255)
    ) {
      setOctets(parsed);
    }
  }, [initialIpStr]);

  const updateParam = (key: string, val: unknown) => {
    const next = { ...values, [key]: val };
    setStateValues(next);
    if (onChange) onChange(next);
  };

  const toBinaryString = (num: number) => num.toString(2).padStart(8, "0");

  const generateRandomIp = () => {
    const next = [
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
    ];
    setOctets(next);
    updateParam("initialIp", next.join("."));
  };

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none">
      {/* SUB-HEADER TOOLBAR: RANDOM GENERATOR ACTION */}
      <div className="bg-card border border-border rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs">
        <div className="text-xs font-mono text-muted-foreground font-semibold">
          Adjust the 4 octet sliders below to dynamically convert between decimal & binary values:
        </div>
        <button
          onClick={generateRandomIp}
          className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all shadow-2xs font-mono font-bold shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Random IP
        </button>
      </div>

      {/* 4 OCTET CONVERTER CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-center">
        {octets.map((octet, idx) => (
          <div
            key={idx}
            className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs"
          >
            <div className="text-[10.5px] font-mono text-slate-500 dark:text-slate-400 uppercase font-extrabold tracking-wider">
              Octet {idx + 1} ({8 * (4 - idx)}-{8 * (3 - idx) + 1} bits)
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {octet}
            </div>
            <div className="text-xs font-mono text-slate-800 dark:text-slate-200 tracking-widest bg-white dark:bg-slate-900 py-1.5 px-2 rounded border border-slate-200 dark:border-slate-800 shadow-2xs">
              {toBinaryString(octet)}
            </div>
            <input
              type="range"
              min="0"
              max="255"
              value={octet}
              onChange={(e) => {
                const next = [...octets];
                next[idx] = parseInt(e.target.value, 10);
                setOctets(next);
                updateParam("initialIp", next.join("."));
              }}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400"
            />
          </div>
        ))}
      </div>

      {/* SUMMARY DISPLAY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-mono">
        <div>
          <span className="text-slate-500 dark:text-slate-400">
            Dotted Decimal Notation:{" "}
          </span>
          <span className="text-amber-600 dark:text-amber-400 font-black text-base ml-1">
            {octets.join(".")}
          </span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400">
            32-Bit Stream:{" "}
          </span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold text-xs tracking-wider ml-1">
            {octets.map(toBinaryString).join(".")}
          </span>
        </div>
      </div>
    </div>
  );
}
