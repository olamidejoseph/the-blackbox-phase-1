# THE BLACKBOX

An experimental, monochrome portfolio combining three experiences:

- **THE BLACKBOX** — portfolio identity and navigation.
- **THE VOID** — immersive visuals and interaction.
- **THE ENGINE ROOM** — technical demos and AI-powered tools.

The profile intentionally uses an abstract monogram rather than a personal photograph.

## Current build

Phase 1 frontend foundation:
- React + Vite
- Tailwind CSS
- Motion for React
- Light/dark mode with saved preference and system preference on first visit
- Responsive navigation
- Keyboard command palette (`Ctrl/Cmd + K`, or `/`)
- Interactive terminal commands
- Portfolio AI, AI Lab, and AI Builder preview panels
- Reduced-motion support

**Important:** the AI panels are currently honest UI previews. They do not call an LLM yet. The FastAPI backend and secure model integration are subsequent milestones.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```bash
npm install
npm run dev
```

Vite prints a local URL, usually `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

## Suggested next steps

1. Replace sample project descriptions with verified project details and working demo/repository links.
2. Add the Python FastAPI backend and environment-based server-side LLM credentials.
3. Implement portfolio Q&A grounded in a verified data file.
4. Build the AI Lab demonstrations.
5. Build the AI Builder with strict output validation and a sandboxed preview iframe.
6. Add tests, accessibility checks, analytics only if desired, and deployment configuration.

## Security rules for the AI Builder

- Never expose a provider API key in frontend code or a `VITE_` variable.
- Never execute arbitrary generated code on the FastAPI host.
- Validate inputs and output sizes, rate-limit public endpoints, and sandbox previews.
- Treat generated code and prompts as untrusted input.
