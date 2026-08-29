# IBVAP-Edge AI — Frontend Architecture & Ownership Guide

**Intelligent Border Video Analytics Platform for Border Surveillance**  
**Problem Statement ID:** 26187  
**Google Stitch UI Project ID:** `13550027997114350676`

---

## 1. Project Purpose & Architecture
IBVAP-Edge AI is an edge-native AI-powered surveillance and perimeter security platform. The frontend delivers real-time situational awareness, multi-camera live streaming, interactive spatial tripwire configuration, automated threat intelligence with Explainable AI (XAI) rationale, GIS-based camera node tracking, and environmental weather impact telemetry.

The frontend is built with:
- **Framework**: Next.js (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Visual Design Reference**: Google Stitch Project `13550027997114350676` (5 High-Fidelity Tactical HUD Screens)

---

## 2. Two-Person Team Ownership & Screen Allocations

Development is strictly partitioned between two frontend engineers to enable independent, conflict-free parallel implementation:

| Team Member | Role | Owned Directories | Assigned Stitch Screens | Key Responsibilities |
|---|---|---|---|---|
| **SHIBAM** | Frontend Lead | `src/app/`<br>`src/components/layout/`<br>`src/components/threat/`<br>`src/components/gis/`<br>`src/components/ui/`<br>Global Integration | **Screen 1**: Surveillance Initialization<br>**Screen 4**: Sector Analytics<br>**Screen 5**: GIS Map Tracking | • Shell, Header/TopBar, Navigation & Status bars<br>• Shared UI design tokens & HUD primitives (`src/components/ui/`)<br>• XAI Threat feed, risk scoring dials, snapshot cards (`src/components/threat/`)<br>• Tactical GIS map canvas & camera markers (`src/components/gis/`)<br>• Multi-screen routing, state orchestration & global integration |
| **DEBANJAN** | Video & Interaction Lead | `src/components/video/`<br>`src/components/tripwire/` | **Screen 2**: Tactical Grid View<br>**Screen 3**: Command Center Focus | • Multi-camera grid layouts & player viewports (`src/components/video/`)<br>• Primary stream focus view, RTSP/HLS stream controls<br>• Interactive 2D spatial tripwire boundary drawing & real-time trigger overlays (`src/components/tripwire/`) |

### Shared Foundation (Read/Use by Both Developers)
- `src/types/index.ts` — Common TypeScript contracts (Video, Tripwires, Threats, XAI, ANPR, FRS, GIS, Weather, WebSockets)
- `src/data/mockData.ts` — Shared mock dataset conforming to TypeScript types
- `src/hooks/` — Shared custom React hooks (e.g. `useTelemetry.ts`)
- `src/lib/` — API clients (`api.ts`) and WebSocket managers (`websocket.ts`)

---

## 3. Stitch Screen Mapping Matrix

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Google Stitch UI Project (13550027997114350676)                                         │
├─────────────────────────────────────┬───────────────────┬───────────────────────────────┤
│ Screen Name                         │ Screen ID / Focus │ Owner & Component Directory   │
├─────────────────────────────────────┼───────────────────┼───────────────────────────────┤
│ 1. Surveillance Initialization     │ System Boot / HUD │ Shibam (src/components/layout)│
│ 2. Tactical Grid View               │ 4-Cam Grid Live   │ Debanjan (src/components/video)│
│ 3. Command Center Focus             │ Primary Stream/TW │ Debanjan (video + tripwire)   │
│ 4. Sector Analytics                 │ XAI / Threat Feed │ Shibam (src/components/threat)│
│ 5. GIS Map Tracking                 │ Geo Tactical View │ Shibam (src/components/gis)   │
└─────────────────────────────────────┴───────────────────┴───────────────────────────────┘
```

---

## 4. Directory Structure

```text
frontend/
├── public/                 # Static assets & tactical icons
├── src/
│   ├── app/                # Next.js App Router root layout & routing [Shibam]
│   ├── components/
│   │   ├── layout/         # Core HUD Shell, TopBar, SideBar, StatusFooter [Shibam]
│   │   ├── threat/         # Threat feed, XAI explanations, risk dials [Shibam]
│   │   ├── gis/            # GIS tactical map canvas, camera node markers [Shibam]
│   │   ├── ui/             # Shared reusable tactical HUD primitives [Shibam / Shared]
│   │   ├── video/          # Stream players, camera grid layouts [Debanjan]
│   │   └── tripwire/       # Tripwire overlays, spatial boundary config [Debanjan]
│   ├── data/               # Mock datasets & tactical telemetry [Shared]
│   ├── hooks/              # Reusable React hooks [Shared]
│   ├── lib/                # API and WebSocket client abstractions [Shared]
│   └── types/              # Comprehensive TypeScript interfaces [Shared]
├── package.json
├── tsconfig.json
├── postcss.config.mjs
├── next.config.ts
└── README.md
```

---

## 5. Getting Started & Commands

### Prerequisites
- **Node.js**: v18.17.0+ (v20 LTS recommended)
- **npm**: v9+

### Install Dependencies
```bash
cd frontend
npm install
```

### Run Local Development Server
```bash
npm run dev
```

### Production Build & Typecheck Verification
```bash
npm run build
```

---

## 6. Conflict-Free Collaboration Rules

1. **Independent Directories**: Work exclusively in your designated component directories. Do not modify files in the other developer's folders.
2. **Contract-First Development**: All component props and data models must consume types from `@/types` (`src/types/index.ts`).
3. **Isolated Testing**: Build and test components against `@/data/mockData` before integrating into `src/app/`.
4. **Clean Branches**: Shibam works on `feat/shibam-ui`, Debanjan works on `feat/debanjan-video`.
