import { type VizMeta } from '../types';

// TODO: implement — see VISUALIZATION_PROMPTS_CH4.md, section "network-collision-domain-comparison"
export const vizMeta: VizMeta = {
  key: 'network-collision-domain-comparison',
  title: 'Collision Domain Comparison',
  category: 'network',
  renderer: 'svg',
  params: [],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function NetworkCollisionDomainComparison({ values: _values }: Props) {
  void _values;
  return (
    <svg viewBox="0 0 700 400" className="w-full h-auto">
      <text x="20" y="30" fontSize="14" fill="currentColor">
        TODO: Collision Domain Comparison — see VISUALIZATION_PROMPTS_CH4.md
      </text>
    </svg>
  );
}
