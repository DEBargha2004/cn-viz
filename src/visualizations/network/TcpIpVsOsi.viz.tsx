import { type VizMeta } from '../types';

// TODO: implement — see VISUALIZATION_PROMPTS_CH2.md, section "network-tcpip-vs-osi"
export const vizMeta: VizMeta = {
  key: 'network-tcpip-vs-osi',
  title: 'TCP/IP Suite Mapped to OSI',
  category: 'network',
  renderer: 'svg',
  params: [
    { key: 'selectedProtocol', type: 'select', label: 'Highlight protocol', default: 'none', options: [
      { label: 'None', value: 'none' },
      { label: 'HTTP', value: 'http' },
      { label: 'TCP', value: 'tcp' },
      { label: 'UDP', value: 'udp' },
      { label: 'IP', value: 'ip' },
      { label: 'ARP', value: 'arp' },
    ] },
  ],
};

interface Props {
  props?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function TcpipVsOsi({ values: _values }: Props) {
  void _values;
  return (
    <svg viewBox="0 0 700 400" className="w-full h-auto">
      <text x="20" y="30" fontSize="14" fill="currentColor">
        TODO: TCP/IP Suite Mapped to OSI — see VISUALIZATION_PROMPTS_CH2.md
      </text>
    </svg>
  );
}
