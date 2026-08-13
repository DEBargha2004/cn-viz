import { type VizMeta } from '../types';

// TODO: implement — see VISUALIZATION_PROMPTS_CH3.md, section "network-critical-angle"
export const vizMeta: VizMeta = {
  key: 'network-critical-angle',
  title: 'Critical Angle: Refraction vs Reflection',
  category: 'network',
  renderer: 'svg',
  params: [
    { key: 'angleCase', type: 'select', label: 'Angle case', default: 'all', options: [
      { label: 'Show all three', value: 'all' },
      { label: 'Less than critical (refraction)', value: 'less' },
      { label: 'Equal to critical (refraction along boundary)', value: 'equal' },
      { label: 'Greater than critical (reflection)', value: 'greater' },
    ] },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function CriticalAngle({ values: _values }: Props) {
  void _values;
  return (
    <svg viewBox="0 0 700 400" className="w-full h-auto">
      <text x="20" y="30" fontSize="14" fill="currentColor">
        TODO: Critical Angle: Refraction vs Reflection — see VISUALIZATION_PROMPTS_CH3.md
      </text>
    </svg>
  );
}
