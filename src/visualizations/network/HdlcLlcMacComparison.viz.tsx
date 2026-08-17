import { type VizMeta } from '../types';

// TODO: implement — see VISUALIZATION_PROMPTS_CH4.md, section "network-hdlc-llc-mac-comparison"
export const vizMeta: VizMeta = {
  key: 'network-hdlc-llc-mac-comparison',
  title: 'HDLC vs LLC and MAC Frames',
  category: 'network',
  renderer: 'svg',
  params: [],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function NetworkHdlcLlcMacComparison({ values: _values }: Props) {
  void _values;
  return (
    <svg viewBox="0 0 700 400" className="w-full h-auto">
      <text x="20" y="30" fontSize="14" fill="currentColor">
        TODO: HDLC vs LLC and MAC Frames — see VISUALIZATION_PROMPTS_CH4.md
      </text>
    </svg>
  );
}
