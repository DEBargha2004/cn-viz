import { type VizMeta } from '../types';

// TODO: implement — see VISUALIZATION_PROMPTS_CH4.md, section "network-star-hub-ethernet"
export const vizMeta: VizMeta = {
  key: 'network-star-hub-ethernet',
  title: 'Star-Hub Ethernet',
  category: 'network',
  renderer: 'svg',
  params: [],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function NetworkStarHubEthernet({ values: _values }: Props) {
  void _values;
  return (
    <svg viewBox="0 0 700 400" className="w-full h-auto">
      <text x="20" y="30" fontSize="14" fill="currentColor">
        TODO: Star-Hub Ethernet — see VISUALIZATION_PROMPTS_CH4.md
      </text>
    </svg>
  );
}
