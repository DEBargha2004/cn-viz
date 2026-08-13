import { type VizMeta } from '../types';

// TODO: implement — see VISUALIZATION_PROMPTS_CH3.md, section "network-fiber-propagation-waveforms"
export const vizMeta: VizMeta = {
  key: 'network-fiber-propagation-waveforms',
  title: 'Signal Distortion by Propagation Mode',
  category: 'network',
  renderer: 'svg',
  params: [
    { key: 'mode', type: 'select', label: 'Mode', default: 'all', options: [
      { label: 'Show all three', value: 'all' },
      { label: 'Multimode, step index', value: 'step' },
      { label: 'Multimode, graded index', value: 'graded' },
      { label: 'Single mode', value: 'single' },
    ] },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function FiberPropagationWaveforms({ values: _values }: Props) {
  void _values;
  return (
    <svg viewBox="0 0 700 400" className="w-full h-auto">
      <text x="20" y="30" fontSize="14" fill="currentColor">
        TODO: Signal Distortion by Propagation Mode — see VISUALIZATION_PROMPTS_CH3.md
      </text>
    </svg>
  );
}
