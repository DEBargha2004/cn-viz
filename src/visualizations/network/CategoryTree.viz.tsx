import { type VizMeta } from '../types';

// TODO: implement — see VISUALIZATION_PROMPTS_CH4.md, section "network-category-tree"
export const vizMeta: VizMeta = {
  key: 'network-category-tree',
  title: 'Ethernet Categories Hierarchy',
  category: 'network',
  renderer: 'svg',
  params: [],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function NetworkCategoryTree({ values: _values }: Props) {
  void _values;
  return (
    <svg viewBox="0 0 700 400" className="w-full h-auto">
      <text x="20" y="30" fontSize="14" fill="currentColor">
        TODO: Ethernet Categories Hierarchy — see VISUALIZATION_PROMPTS_CH4.md
      </text>
    </svg>
  );
}
