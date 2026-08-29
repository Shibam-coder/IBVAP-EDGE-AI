# IBVAP-Edge AI — Common Frontend Foundation

**Intelligent Border Video Analytics Platform for Border Surveillance**  
**Problem Statement ID:** 26187

---

## 1. Project Purpose
IBVAP-Edge AI is an edge-native AI-powered perimeter defense and surveillance system. The frontend provides real-time situational awareness, multi-camera video streaming, spatial tripwire detection, automated threat scoring with Explainable AI (XAI) rationale, GIS-based camera node telemetry, ANPR/FRS intelligence, and dynamic weather impact tracking.

---

## 2. Team Scope & Ownership

To facilitate parallel development without merge conflicts, work is divided across designated modules:

| Team Member | Domain / Module | Target Directory | Key Responsibilities |
|---|---|---|---|
| **Shibam (Lead)** | App Shell & Global Layout | `src/app/`<br>`src/components/layout/` | App Router pages, TopNavBar, SideNavBar, Global status bar, Theme integration, Global routing & architecture |
| **Debanjan** | Video & Tripwire Analytics | `src/components/video/`<br>`src/components/tripwire/` | Multi-camera video grid, stream players, RTSP/HLS controls, interactive spatial tripwire drawing & overlays |
| **Protyush** | Threat Intelligence & GIS | `src/components/threat/`<br>`src/components/gis/` | XAI threat alert feed, risk gauges, ANPR/FRS snapshot cards, GIS tactical map canvas & telemetry markers |
| **Shared** | Core Foundation & Primitives | `src/components/ui/`<br>`src/hooks/`<br>`src/lib/`<br>`src/types/`<br>`src/data/` | Reusable UI atoms, custom React hooks, API/WebSocket clients, shared TypeScript contracts, mock datasets |

---

## 3. Directory Structure

```text
frontend/
├── public/                 # Static assets and icons
├── src/
│   ├── app/                # Next.js App Router (layout.tsx, page.tsx, globals.css) [Shibam]
│   ├── components/
│   │   ├── layout/         # Shell, navigation, header, sidebar [Shibam]
│   │   ├── video/          # Video grid, camera player, stream feeds [Debanjan]
│   │   ├── tripwire/       # Tripwire overlays, spatial boundary config [Debanjan]
│   │   ├── threat/         # Threat feed, XAI explanations, risk dials [Protyush]
│   │   ├── gis/            # GIS tactical map, camera node markers [Protyush]
│   │   └── ui/             # Shared reusable UI primitives [Shared]
│   ├── data/               # Mock datasets & initial configurations [Shared]
│   ├── hooks/              # Reusable React hooks (e.g., useTelemetry) [Shared]
│   ├── lib/                # API and WebSocket client abstractions [Shared]
│   └── types/              # Comprehensive TypeScript interfaces & types [Shared]
├── package.json            # Project dependencies and npm scripts
├── tsconfig.json           # TypeScript configuration with path aliases (@/* -> src/*)
├── postcss.config.mjs      # PostCSS configuration with Tailwind CSS v4
├── next.config.ts          # Next.js configuration
└── README.md               # Team development guide and documentation
```

---

## 4. Getting Started

### Prerequisites
- **Node.js**: v18.17.0+ (or v20 LTS recommended)
- **npm**: v9+

### Installation
Navigate to the `frontend/` directory and install project dependencies:

```bash
cd frontend
npm install
```

### Development Server
Run the local Next.js development server:

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to view the foundation status page.

### Production Build & Verification
To test and verify the production build:

```bash
npm run build
```

To run the built production application locally:

```bash
npm run start
```

---

## 5. Coding & Workflow Guidelines

1. **Strict Folder Boundaries**: Build your components exclusively inside your assigned folder under `src/components/<your_domain>/`.
2. **Type Safety**: Import shared interfaces from `@/types` (`src/types/index.ts`). Do not declare ad-hoc duplicate types.
3. **Data Integration**: Use the shared mock data from `@/data/mockData` or API/WebSocket abstractions from `@/lib/` for connecting frontend components.
4. **Clean Commits**: Commit only to your designated feature branches (`feat/shibam-ui`, `feat/debanjan-video`, `feat/protyush-threat`).
