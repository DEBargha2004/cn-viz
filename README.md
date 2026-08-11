# Computer Networks Visualizations (CN-Viz)

An interactive learning platform designed to visualize complex computer network protocols, system topologies, and data communication algorithms through parameter-driven simulations.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat-square&logo=shadcnui&logoColor=white)

---

## 📚 Course Chapters & Learning Resources

| # | Chapter Title | PDF Notes | Video Lectures |
|---|---|:---:|:---:|
| **01** | Introduction to Data Communication & Computer Networks | PDF | Video |
| **02** | Network Models. Data Communication & Computer Networks | PDF | Video |
| **03** | Transmission Media | PDF | Video |
| **04** | Wired LANs: Ethernet | PDF | Video |
| **05** | Switching in Computer Networks | PDF | Video |
| **06** | Physical Layer: Transmission Impairment | PDF | — |
| **07** | Physical Layer: Data and Signals | PDF | Video |
| **08** | Analog Transmission: AM, FM, PM, ASK, FSK, PSK, QAM | PDF | Video |
| **09** | Digital Transmission | PDF | Video |
| **10** | Error Detection and Correction | PDF | Video 1 • Video 2 |
| **11** | Data Link Control | PDF | Video 1 • Video 2 |
| **12** | Multiple Access | PDF | Video 1 • Video 2 |
| **13** | Addressing | PDF | — |
| **14** | ARP, RARP, DHCP, ICMP, IGMP | PDF | — |
| **15** | Routing 1 | PDF | — |
| **16** | Routing 2 | PDF | — |
| **17** | IPv4 Protocol | PDF | — |
| **18** | Transport Layer | PDF | — |
| **19** | Session Layer | PDF | — |
| **20** | Presentation Layer | PDF | — |
| **21** | Application Layer | PDF | — |

---

## ⚡ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Routing**: [React Router v6](https://reactrouter.com/) (Data Router API)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Chapter-scoped & App-scoped state tiers)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- `npm` or `pnpm`

### Installation & Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/debargha-saha/cn-viz.git
   cd cn-viz
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## 🧪 Testing & Build

Run the test suite:
```bash
npm run test
```

Build for production:
```bash
npm run build
```

---

## 📁 Directory Architecture

```
content/
  chapters/
    <chapter-slug>/
      meta.json
      topics/
        <topic-slug>.json
src/
  routes/
    root.tsx               # App Shell layout: persistent sidebar + main Outlet
    chapter-index.tsx       # Landing page (/) with chapter list & live search
    chapter.tsx             # Chapter page loader & topic list
  components/
    layout/                # Sidebar, top bar, theme toggle, speed controls
    topic-card/            # TopicCard composition, Markdown & Viz sections
    ui/                    # shadcn UI primitives
  visualizations/
    registry.ts            # Auto-discovered *.viz.tsx component registry
    charts/                # Interactive chart visualizers
    network/               # Interactive network simulations
  state/
    appStore.ts            # App-level speed & theme state
    chapterStore.ts        # Chapter-scoped store factory
    useVizState.ts         # Hook bridging local/chapter/app state tiers
```
