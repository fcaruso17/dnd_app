# The Codex — D&D Digital Character Sheet

A fully-digital, backend-free alternative to the 3-page physical Dungeons & Dragons 5e Character Sheet. Built with React and designed to feel like a living artifact from the world your character inhabits.

## Features

- **8 Visual Themes**: Switch between Shadow Realm, Parchment & Ink, Arcane Scholar, Infernal Pact, Celestial Dawn, Eldritch Void, Druid's Grove, and Frost Citadel using the swatch picker in the header. Each theme ships with its own font pairing — typography changes with the palette. Light and dark themes are tuned for WCAG AA contrast. Your preference persists across sessions.
- **Trait Chips**: Personality, Ideals, Bonds, Flaws, and Features & Traits live as compact clickable chips in the character header. Click any chip to open a focused modal editor — keeping the main sheet uncluttered.
- **Multiclassing Support**: Add multiple classes — total level and proficiency bonus recalculate automatically. Pool hit dice and manage separate spell save DCs per caster class.
- **Structured Inventory**: 436-entry local item database covering SRD + 2024 PHB/DMG — weapons, armor, gear, and tools tagged by rarity (common through artifact). Add items from the database or create fully custom ones. Per-item quantity stepper, description, notes, and soft-delete with a 3-second undo toast.
- **Attunement & Armor Training**: 2024-aware attunement counter with a soft 3-item cap and over-limit warning. Track which armor types (Light / Medium / Heavy / Shields) your character is trained in.
- **D&D 5e API Integration**: Search for weapons and spells via `dnd5eapi.co`. Official stat blocks (damage dice, casting time, range, components, description) are pulled directly into your sheet.
- **Auto-Save**: Every change is written to `localStorage` instantly. Close the tab and return exactly where you left off — including which tab you were on.
- **Export / Import JSON**: Back up your character or share it with your DM. Full character data round-trips cleanly as a `.json` file.
- **Character Portrait**: Upload a custom portrait from your machine. Stored as base64 — no image hosting required.
- **Accessible by Design**: Keyboard-navigable tabs (arrow keys), ARIA roles throughout, death saves use both color and shape (✓/✕), and the browser tab title reflects your character's name.

## Tech Stack

| Layer | Tool |
|---|---|
| UI | React 19 |
| Build | Vite |
| State | Zustand (auto-persisted to localStorage) |
| Data fetching | TanStack Query v5 |
| API | [D&D 5e API](https://www.dnd5eapi.co) (public, no auth) |
| Fonts | Cinzel + Crimson Pro (Google Fonts) |
| Deployment | GitHub Pages via GitHub Actions |

## Quick Start

1. Make sure [Node.js](https://nodejs.org/) is installed.
2. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.
5. When done, press `Ctrl + C` in the terminal to stop the server.

## Other Commands

```bash
npm run build    # Production build → ./dist
npm run preview  # Preview production build locally
npm run lint     # ESLint
```

## Deployment

Pushing to `main` automatically triggers a GitHub Actions workflow that builds the app and deploys `./dist` to the `gh-pages` branch. The live site updates within ~1–3 minutes of a merge.
