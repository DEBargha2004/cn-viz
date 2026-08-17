import { type VizMeta } from '../types';

// TODO: implement — see VISUALIZATION_PROMPTS_CH4.md, section "network-mac-frame"
export const vizMeta: VizMeta = {
  key: 'network-mac-frame',
  title: '802.3 MAC Frame Structure',
  category: 'network',
  renderer: 'svg',
  params: [

  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function MacFrame({ values: _values }: Props) {
  void _values;
  return (
    <svg viewBox="0 0 700 400" className="w-full h-auto">
      <text x="20" y="30" fontSize="14" fill="currentColor">
        TODO: 802.3 MAC Frame Structure — see VISUALIZATION_PROMPTS_CH4.md
      </text>
    </svg>
  );
}
