import { type VizMeta } from '../types';

// TODO: implement — see VISUALIZATION_PROMPTS_CH3.md, section "network-antenna-diagram"
export const vizMeta: VizMeta = {
  key: 'network-antenna-diagram',
  title: 'Antenna Types',
  category: 'network',
  renderer: 'svg',
  params: [
    { key: 'antennaType', type: 'select', label: 'Antenna type', default: 'omnidirectional', options: [
      { label: 'Omnidirectional (radio)', value: 'omnidirectional' },
      { label: 'Dish (microwave)', value: 'dish' },
      { label: 'Horn (microwave)', value: 'horn' },
    ] },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function AntennaDiagram({ values: _values }: Props) {
  void _values;
  return (
    <svg viewBox="0 0 700 400" className="w-full h-auto">
      <text x="20" y="30" fontSize="14" fill="currentColor">
        TODO: Antenna Types — see VISUALIZATION_PROMPTS_CH3.md
      </text>
    </svg>
  );
}
