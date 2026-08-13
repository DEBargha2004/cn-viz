import { type VizMeta } from '../types';

// TODO: implement — see VISUALIZATION_PROMPTS_CH3.md, section "network-wave-propagation-methods"
export const vizMeta: VizMeta = {
  key: 'network-wave-propagation-methods',
  title: 'Ground, Sky & Line-of-Sight Propagation',
  category: 'network',
  renderer: 'svg',
  params: [
    { key: 'highlightMethod', type: 'select', label: 'Highlight', default: 'none', options: [
      { label: 'None', value: 'none' },
      { label: 'Ground propagation', value: 'ground' },
      { label: 'Sky propagation', value: 'sky' },
      { label: 'Line-of-sight propagation', value: 'line-of-sight' },
    ] },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function WavePropagationMethods({ values: _values }: Props) {
  void _values;
  return (
    <svg viewBox="0 0 700 400" className="w-full h-auto">
      <text x="20" y="30" fontSize="14" fill="currentColor">
        TODO: Ground, Sky & Line-of-Sight Propagation — see VISUALIZATION_PROMPTS_CH3.md
      </text>
    </svg>
  );
}
