import { type VizMeta } from '../types';

// TODO: implement — see VISUALIZATION_PROMPTS_CH2.md, section "network-address-hierarchy"
export const vizMeta: VizMeta = {
  key: 'network-address-hierarchy',
  title: 'Layers & Address Types in TCP/IP',
  category: 'network',
  renderer: 'svg',
  params: [
    { key: 'highlightAddress', type: 'select', label: 'Highlight', default: 'none', options: [
      { label: 'None', value: 'none' },
      { label: 'Physical', value: 'physical' },
      { label: 'Logical', value: 'logical' },
      { label: 'Port', value: 'port' },
      { label: 'Specific', value: 'specific' },
    ] },
    { key: 'showIpv4NotationDemo', type: 'boolean', label: 'Show IPv4 dotted-decimal ↔ binary demo', default: false },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function AddressHierarchy({ values: _values }: Props) {
  void _values;
  return (
    <svg viewBox="0 0 700 400" className="w-full h-auto">
      <text x="20" y="30" fontSize="14" fill="currentColor">
        TODO: Layers & Address Types in TCP/IP — see VISUALIZATION_PROMPTS_CH2.md
      </text>
    </svg>
  );
}
