# ADO — AI Defence Operations
**HES Consultancy International · Nxt Era Solutions**

React platform built on the same stack as the CMOFMO platform.

## Stack
- Vite + React 18 + TypeScript
- Tailwind CSS + HCI design system
- Zustand (state)
- React Router v6
- Netlify Functions (Claude AI proxy)

## Quickstart
```bash
npm install
cp .env.example .env       # fill in ANTHROPIC_API_KEY
npm run dev                # localhost:5173
# or with Netlify proxy:
netlify dev                # localhost:8888
```

## Adding a new module
1. Create `src/modules/my-module/index.tsx`
2. Add route in `src/App.tsx`
3. Add nav item in `src/components/layout/Sidebar.tsx`
4. Add labels in `src/locales/nl.json` + `src/locales/en.json`

Zero changes to other modules required.

## Work Packages
| WP | Status | Description |
|---|---|---|
| WP01 | ✅ Done | Projectfundament & Dev-omgeving |
| WP02 | ✅ Done | UI Component Library |
| WP03 | ✅ Done | Dashboard module |
| WP04 | ✅ Done | Voice Recorder hook (gedeeld) |
| WP05 | ✅ Done | Mission Brief module |
| WP06 | ✅ Done | Intel Analyst module |
| WP07 | ✅ Done | Field Report module |
| WP08 | ✅ Done | Training Sim module |
| WP09 | ✅ Done | Export & C2 integratie |
| WP10 | ✅ Done | i18n volledige implementatie |
| WP11 | ✅ Done | Polish, QA & Netlify Deploy |

## Deploy to Netlify

### 1. GitHub
```bash
git init && git add . && git commit -m "ADO v1.0.0"
git remote add origin https://github.com/YOUR_ORG/ado-platform.git
git push -u origin main
```

### 2. Netlify Dashboard
1. **New site from Git** → connect GitHub repo
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Functions directory: `netlify/functions`

### 3. Environment Variables (Netlify > Site settings > Environment)
```
ANTHROPIC_API_KEY     = sk-ant-...   ← Required
SLACK_WEBHOOK_URL     = https://...  ← Optional (operational alerts)
```

### 4. Custom domain (optional)
`aidefenceoperations.netlify.app` or custom domain via Netlify DNS.

### Local development
```bash
npm install
cp .env.example .env       # Add ANTHROPIC_API_KEY
netlify dev                # localhost:8888 (proxy + React)
# or
npm run dev                # localhost:5173 (no proxy — AI calls will fail)
```

## Architecture
```
src/
├── components/
│   ├── layout/        # Sidebar, TopBar, Layout
│   ├── ui/            # Button, Badge, Card, Modal, Progress, StatusIndicator
│   └── shared/        # ClassificationBadge, VoiceRecorder, AIAssistant, SettingsPanel
├── config/            # types.ts, i18n.ts
├── hooks/             # useAI, useVoiceRecorder, useLanguage
├── modules/
│   ├── dashboard/
│   ├── mission-brief/ # PreBrief, LiveBriefing, OpordBuilder, PostBrief
│   ├── intel-analyst/ # SourceAnalysis, IntelFusion, IntSum
│   ├── field-report/  # VoiceReport, SaluteReport, MistReport
│   └── training-sim/  # ScenarioSelector, ScenarioEngine, Debrief
├── services/          # aiService.ts, exportService.ts
├── store/             # sessionStore, missionStore, intelStore, trainingStore
└── themes/            # ado.ts, ThemeProvider.tsx
netlify/functions/
└── ado-proxy.js       # Claude API proxy (keeps API key server-side)
```

