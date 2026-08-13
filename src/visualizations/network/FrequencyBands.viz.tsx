import { type VizMeta } from '../types';

// TODO: implement — see VISUALIZATION_PROMPTS_CH3.md, section "network-frequency-bands"
export const vizMeta: VizMeta = {
  key: 'network-frequency-bands',
  title: 'Frequency Bands (VLF-EHF)',
  category: 'network',
  renderer: 'svg',
  params: [
    { key: 'highlightBand', type: 'select', label: 'Highlight band', default: 'none', options: [
      { label: 'None', value: 'none' },
      { label: 'VLF', value: 'vlf' },
      { label: 'LF', value: 'lf' },
      { label: 'MF', value: 'mf' },
      { label: 'HF', value: 'hf' },
      { label: 'VHF', value: 'vhf' },
      { label: 'UHF', value: 'uhf' },
      { label: 'SHF', value: 'shf' },
      { label: 'EHF', value: 'ehf' },
    ] },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function FrequencyBands({ values: _values }: Props) {
  void _values;
  return (
    <svg viewBox="0 0 700 400" className="w-full h-auto">
      <text x="20" y="30" fontSize="14" fill="currentColor">
        TODO: Frequency Bands (VLF-EHF) — see VISUALIZATION_PROMPTS_CH3.md
      </text>
    </svg>
  );
}
