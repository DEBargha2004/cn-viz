import { type VizMeta } from '../types';

// TODO: implement — see VISUALIZATION_PROMPTS_CH2.md, section "network-osi-layer-detail"
export const vizMeta: VizMeta = {
  key: 'network-osi-layer-detail',
  title: 'OSI Layer Detail',
  category: 'network',
  renderer: 'svg',
  params: [
    { key: 'layer', type: 'select', label: 'Layer', default: 'physical', options: [
      { label: 'Physical', value: 'physical' },
      { label: 'Data Link', value: 'data-link' },
      { label: 'Network', value: 'network' },
      { label: 'Transport', value: 'transport' },
      { label: 'Session', value: 'session' },
      { label: 'Presentation', value: 'presentation' },
      { label: 'Application', value: 'application' },
    ] },
    { key: 'showDeliveryPath', type: 'boolean', label: 'Show hop-to-hop / end-to-end path inset', default: false },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function OsiLayerDetail({ values: _values }: Props) {
  void _values;
  return (
    <svg viewBox="0 0 700 400" className="w-full h-auto">
      <text x="20" y="30" fontSize="14" fill="currentColor">
        TODO: OSI Layer Detail — see VISUALIZATION_PROMPTS_CH2.md
      </text>
    </svg>
  );
}
