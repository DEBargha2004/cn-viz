import { type VizMeta } from '../types';

// TODO: implement — see VISUALIZATION_PROMPTS_CH3.md, section "network-em-spectrum"
export const vizMeta: VizMeta = {
  key: 'network-em-spectrum',
  title: 'Electromagnetic Spectrum for Wireless Communication',
  category: 'network',
  renderer: 'svg',
  params: [
    { key: 'highlightBand', type: 'select', label: 'Highlight', default: 'none', options: [
      { label: 'None', value: 'none' },
      { label: 'Radio wave and microwave', value: 'radio-microwave' },
      { label: 'Infrared', value: 'infrared' },
      { label: 'Light wave', value: 'light' },
    ] },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function EmSpectrum({ values: _values }: Props) {
  void _values;
  return (
    <svg viewBox="0 0 700 400" className="w-full h-auto">
      <text x="20" y="30" fontSize="14" fill="currentColor">
        TODO: Electromagnetic Spectrum for Wireless Communication — see VISUALIZATION_PROMPTS_CH3.md
      </text>
    </svg>
  );
}
