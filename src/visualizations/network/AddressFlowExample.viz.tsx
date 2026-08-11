import { type VizMeta } from '../types';

// TODO: implement — see VISUALIZATION_PROMPTS_CH2.md, section "network-address-flow-example"
export const vizMeta: VizMeta = {
  key: 'network-address-flow-example',
  title: 'Addressing Through a Multi-Hop Path',
  category: 'network',
  renderer: 'svg',
  params: [
    { key: 'addressType', type: 'select', label: 'Address type', default: 'physical', options: [
      { label: 'Physical (per-hop)', value: 'physical' },
      { label: 'Logical/IP (end-to-end, changes per hop-pair)', value: 'logical' },
      { label: 'Port (end-to-end, constant)', value: 'port' },
    ] },
    { key: 'hopCount', type: 'number', label: 'Number of hops', default: 3, min: 2, max: 5, step: 1 },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function AddressFlowExample({ values: _values }: Props) {
  void _values;
  return (
    <svg viewBox="0 0 700 400" className="w-full h-auto">
      <text x="20" y="30" fontSize="14" fill="currentColor">
        TODO: Addressing Through a Multi-Hop Path — see VISUALIZATION_PROMPTS_CH2.md
      </text>
    </svg>
  );
}
