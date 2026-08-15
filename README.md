# Computer Networks Visualizations (CN-Viz)

An interactive learning platform designed to visualize complex computer network protocols, system topologies, physical transmission media, and data communication concepts through dynamic, parameter-driven simulations. Built and maintained by [Debargha Saha](https://github.com/DEBargha2004).

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat-square&logo=shadcnui&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-black?style=flat-square&logo=three.js&logoColor=white)
[![Author](https://img.shields.io/badge/Author-Debargha_Saha-indigo?style=flat-square&logo=github)](https://github.com/DEBargha2004)

---

## ✨ Features

- **Interactive Simulations**: Over 25 specialized visualizations spanning network topologies, protocol encapsulation, OSI layers, IPv4 conversion, electromagnetic spectrum, and 3D fiber propagation.
- **Structured Content Flow**: Chapter-based hierarchy (Chapters → Topics → Cards) powered by pure JSON data files rendered with `react-markdown` and `remark-gfm`.
- **Auto-Registering Visualization Registry**: Zero-boilerplate discovery of `*.viz.tsx` components using Vite's `import.meta.glob`.
- **Three-Tiered State Architecture**: Clean separation between `local` (component), `chapter` (isolated topic shared state), and `app` (global simulation speed & controls) via Zustand.
- **Minimap Navigation & Target Scroll**: Smooth target scrolling via `react-scroll` with responsive offset handling across desktop and mobile viewports.
- **Theme & Speed Persistence**: Dark/Light mode theme provider and global simulation speed multiplier with seamless `localStorage` persistence and FOUC prevention.

---

## 📚 Course Chapters & Learning Modules

| # | Chapter Title | Status | Interactive Visualizations |
|---|---|:---:|---|
| **01** | Introduction to Data Communication & Computer Networks | Active | Data Flow Modes, 5 Components, Topology Explorer, Network Classification, Connection Types, ISP Hierarchy |
| **02** | Network Models (OSI & TCP/IP) | Active | Layered Analogy, OSI Stack & Layer Detail, Peer-to-Peer Communication, Address Hierarchy & Multi-Hop Flow, Protocol Elements, Encapsulation, TCP/IP vs OSI |
| **03** | Transmission Media | Active | Electromagnetic Spectrum, Twisted Pair, Coaxial Cable, RJ45 Connector, Fiber Optics Light Path, Critical Angle, Fiber Cutaway (3D), Fiber Modes (ISI), Wave Propagation |
| **04** | Wired LANs: Ethernet | Upcoming | Ethernet Frame Structure, CSMA/CD Simulation |
| **05** | Switching in Computer Networks | Upcoming | Circuit vs Packet Switching |
| **06–21** | Impairments, Digital Transmission, Data Link, Routing, Transport, etc. | Planned | Upcoming modules |

---

## ⚡ Tech Stack

- **Core & Runtime**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Routing**: [React Router v6.4+](https://reactrouter.com/) Data Router (`createBrowserRouter` + loaders)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) primitives
- **3D & Graphics**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://r3f.docs.pmnd.rs/) + SVG Canvas
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (App & Chapter Stores + `useVizState` bridge)
- **Content Rendering**: `react-markdown` + `remark-gfm`
- **Navigation & Animations**: `react-scroll`, `lucide-react`, `tw-animate-css`
- **Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)

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

## 🧪 Testing & Production Build

Run unit tests:
```bash
npm run test
```

Build for production:
```bash
npm run build
```

Preview production build locally:
```bash
npm run preview
```

---

## 📁 Directory Architecture

```
content/
  chapters/
    <chapter-slug>/
      meta.json                # Chapter metadata & topic order
      topics/
        <topic-slug>.json      # Topic title, markdown content, & viz bindings
src/
  routes/
    root.tsx                  # App Shell layout with persistent sidebar & header
    chapter-index.tsx          # Chapter grid overview & search
    chapter.tsx                # Chapter page loader + topic cards
  components/
    layout/                   # AppSidebar, ThemeToggle, GlobalSpeedControl
    topic-card/               # TopicCard, MarkdownSection, VisualizationSection, ControlPanel
    topic-minimap/            # Minimap navigation component
    ui/                       # shadcn/ui primitives (button, slider, switch, card, sidebar, etc.)
  visualizations/
    registry.ts               # Auto-discovery glue for *.viz.tsx components
    demo/                     # Demonstration & test visualizations
    network/                  # Interactive networking visualizations (SVG & 3D R3F)
  state/
    appStore.ts               # App store (Global speed & viz values with localStorage persistence)
    chapterStore.ts           # Chapter-scoped store factory
    useVizState.ts            # State hook bridging local/chapter/app state tiers
  lib/
    content.ts                 # Chapter/topic JSON loaders & Zod validation schemas
```

---

## 🛠️ Adding a New Visualization

New visualizations are automatically registered without editing central registry files:

1. Create a `MyComponent.viz.tsx` file inside `src/visualizations/network/`.
2. Export the component as default and include the static `vizConfig`:

```tsx
import type { VizConfig } from "../registry";

const MyComponent = ({ state, onChange }: { state: Record<string, any>; onChange: (k: string, v: any) => void }) => {
  return <div>Interactive Simulation</div>;
};

MyComponent.vizConfig = {
  id: "my-custom-viz",
  title: "My Custom Visualization",
  description: "Description of the simulation.",
  controls: [
    { key: "speed", label: "Speed", type: "slider", min: 1, max: 10, step: 1, defaultValue: 5 },
  ],
} satisfies VizConfig;

export default MyComponent;
```

3. Reference the `id` in your topic's JSON file (`content/chapters/<chapter>/topics/<topic>.json`):
```json
{
  "visualizations": ["my-custom-viz"]
}
```

