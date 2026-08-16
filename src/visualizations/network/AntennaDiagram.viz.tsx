import { type VizMeta } from "../types";
import { Radio, Signal, Compass, Info, Sliders } from "lucide-react";

export const vizMeta: VizMeta = {
  key: "network-antenna-diagram",
  title: "Antenna Types & Radiation Patterns",
  category: "network",
  renderer: "svg",
  params: [
    {
      key: "antennaType",
      type: "select",
      label: "Antenna Type",
      default: "omnidirectional",
      options: [
        { label: "Omnidirectional (Radio)", value: "omnidirectional" },
        { label: "Parabolic Dish (Microwave)", value: "dish" },
        { label: "Horn Antenna (Microwave)", value: "horn" },
      ],
    },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
}

interface AntennaInfo {
  id: string;
  name: string;
  category: string;
  frequencyRange: string;
  directivity: string;
  gain: string;
  beamwidth: string;
  communicationMode: string;
  applications: string;
  description: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

const ANTENNA_DATA: Record<string, AntennaInfo> = {
  omnidirectional: {
    id: "omnidirectional",
    name: "Omnidirectional Dipole",
    category: "Radio Waves (3 kHz – 1 GHz)",
    frequencyRange: "3 kHz – 1 GHz",
    directivity: "360° Horizontal Isotropic",
    gain: "2.15 dBi",
    beamwidth: "360° Horizontal / 78° Vertical",
    communicationMode: "Multicast / Broadcast (1-to-Many)",
    applications:
      "AM/FM Radio, TV Broadcasting, Cellular Base Stations, Wi-Fi Access Points",
    description:
      "Radiates electromagnetic energy equally in all horizontal directions, forming a toroidal (doughnut) shaped radiation pattern for wide-area coverage.",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/30",
    badgeText: "text-amber-600 dark:text-amber-400",
  },
  dish: {
    id: "dish",
    name: "Parabolic Dish Reflector",
    category: "Microwaves (1 GHz – 300 GHz)",
    frequencyRange: "1 GHz – 300 GHz",
    directivity: "Highly Directional Pencil Beam",
    gain: "30 – 45 dBi",
    beamwidth: "1.5° – 3° Narrow Beam",
    communicationMode: "Unicast / Point-to-Point (1-to-1)",
    applications:
      "Satellite Earth Stations, Terrestrial Microwave Backhaul, Radar, Deep Space Links",
    description:
      "Uses a parabolic curved mirror to focus incoming/outgoing microwave signals into a tight parallel beam with maximum directional gain.",
    badgeBg: "bg-cyan-500/10",
    badgeBorder: "border-cyan-500/30",
    badgeText: "text-cyan-600 dark:text-cyan-400",
  },
  horn: {
    id: "horn",
    name: "Horn Antenna (Pyramidal)",
    category: "Microwaves & Radar (1 GHz – 100 GHz)",
    frequencyRange: "1 GHz – 100 GHz",
    directivity: "Moderate Directional Conical Beam",
    gain: "15 – 25 dBi",
    beamwidth: "30° – 45° Conical",
    communicationMode: "Unicast / Point-to-Point Feed",
    applications:
      "Microwave Tower Feeds, Radar Systems, Antenna Calibration Standards, Waveguide Interfaces",
    description:
      "A flared metallic waveguide transition that smoothly matches waveguide impedance to free-space impedance for efficient beam launching.",
    badgeBg: "bg-pink-500/10",
    badgeBorder: "border-pink-500/30",
    badgeText: "text-pink-600 dark:text-pink-400",
  },
};

export default function AntennaDiagram({ values, onChange }: Props) {
  const selectedType = (values.antennaType as string) || "omnidirectional";
  const antenna = ANTENNA_DATA[selectedType] || ANTENNA_DATA.omnidirectional;

  const setAntennaType = (type: string) => {
    if (onChange) {
      onChange({
        ...values,
        antennaType: type,
      });
    }
  };

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none">
      {/* INTERACTIVE TAB SELECTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-muted/30 border border-border">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-primary" /> Antenna Type:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.values(ANTENNA_DATA).map((item) => (
              <button
                key={item.id}
                onClick={() => setAntennaType(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  selectedType === item.id
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                    : "bg-background/80 hover:bg-muted text-muted-foreground border-border"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          <span
            className={`px-2.5 py-1 rounded-full font-bold border ${antenna.badgeBg} ${antenna.badgeBorder} ${antenna.badgeText}`}
          >
            {antenna.communicationMode}
          </span>
        </div>
      </div>

      {/* FALLBACK VISUALIZATION CONTAINER */}
      <div className="w-full border rounded-2xl bg-slate-100/80 dark:bg-slate-950/90 relative overflow-hidden shadow-inner border-slate-200/80 dark:border-slate-800 min-h-[220px] sm:min-h-[260px] flex flex-col items-center justify-center p-6 text-center space-y-3 transition-colors duration-300">
        {/* Subtle Ambient Pattern */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-25 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-muted-foreground shadow-xs z-10">
          <Sliders className="w-6 h-6 text-primary" />
        </div>

        <div className="space-y-1 max-w-md z-10">
          <h4 className="text-sm font-bold text-foreground flex items-center justify-center gap-1.5">
            Interactive Antenna Diagram
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              Not Implemented Yet
            </span>
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Select an antenna type tab above to explore its physical
            characteristics, frequency bands, radiation pattern, and
            communication applications.
          </p>
        </div>
      </div>

      {/* CONSISTENT DETAILS GRID BELOW (Matching DataFlowModes & project styling) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-border pb-2">
            <Radio className="w-4 h-4 text-primary" /> Directional Gain &
            Beamwidth
          </h5>
          <div className="text-sm font-extrabold text-foreground font-mono">
            {antenna.gain}{" "}
            <span className="text-xs text-muted-foreground font-normal">
              ({antenna.beamwidth})
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Radiation Pattern:{" "}
            <span className="font-semibold text-foreground">
              {antenna.directivity}
            </span>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-border pb-2">
            <Signal className="w-4 h-4 text-primary" /> Frequency Spectrum
          </h5>
          <div className="text-sm font-extrabold text-foreground font-mono">
            {antenna.frequencyRange}
          </div>
          <p className="text-xs text-muted-foreground">
            Spectrum Band:{" "}
            <span className="font-semibold text-foreground">
              {antenna.category}
            </span>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-border pb-2">
            <Compass className="w-4 h-4 text-primary" /> Key Applications
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">
              {antenna.applications}
            </span>
          </p>
          <p className="text-xs text-muted-foreground pt-1 border-t border-border/60">
            <Info className="w-3 h-3 inline mr-1 text-muted-foreground" />
            {antenna.description}
          </p>
        </div>
      </div>
    </div>
  );
}
