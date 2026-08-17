import { type VizMeta } from '../types';

// TODO: implement — see VISUALIZATION_PROMPTS_CH4.md, section "network-bandwidth-sharing-chart"
export const vizMeta: VizMeta = {
  key: 'network-bandwidth-sharing-chart',
  title: 'Bandwidth Sharing Chart',
  category: 'network',
  renderer: 'svg',
  params: [],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function NetworkBandwidthSharingChart({ values: _values }: Props) {
  void _values;
  return (
    <svg viewBox="0 0 700 400" className="w-full h-auto">
      <text x="20" y="30" fontSize="14" fill="currentColor">
        TODO: Bandwidth Sharing Chart — see VISUALIZATION_PROMPTS_CH4.md
      </text>
    </svg>
  );
}
