## Commands

```bash
npm run dev       # Start dev server (Vite, localhost:5173)
npm run build     # Production build → ./dist
npm run preview   # Preview production build locally
npm run lint      # ESLint
```

## Architecture

React 19 + Vite SPA. No routing — three tab-based pages rendered conditionally in `App.jsx`.

```
src/
  App.jsx                    # Tab shell + import/export/reset controls + theme picker
  store/useCharacterStore.js # Zustand store — single source of truth, auto-persists to localStorage
  hooks/useTheme.js          # Theme state — reads/writes localStorage key 'dnd-theme', applies data-theme to <html>
  services/dndApi.js         # D&D 5e API (dnd5eapi.co) helpers — client-side filtered search
  utils/format.js            # Shared utilities (formatModifier)
  components/
    shared/              # Shared components (ApiSearchDropdown)
    PageOne/             # Core & Combat: header (with trait chips), attributes, skills, actions, inventory, vitals
      TraitModal.jsx     # Portal-based modal for editing traits; opened from trait chips in Header
    PageTwo/             # Character Details: appearance (portrait upload), lore/backstory
    PageThree/           # Spellcasting: spell slots, spell list by level
```

## State Management

All character data lives in a single Zustand store. Primary mutation method: `updateNestedField(section, field, value)`.

`updateSection` exists in the store but is **unused** — always use `updateNestedField`.

Auto-saves to `localStorage` key `dnd-character` on every character state change. Portrait images stored as base64 in `details.portraitBase64` — watch the ~5MB localStorage limit.

## Shared Utilities

- `src/utils/format.js` — `formatModifier(value)` formats ability modifiers as `+2` / `-1`
- `src/components/shared/ApiSearchDropdown.jsx` — shared search input + portal dropdown used by Actions, Inventory, SpellSlotTracker; renders via `createPortal` to escape glass-panel stacking contexts
- `src/hooks/useTheme.js` — exports `useTheme()` and `THEMES` array; theme persists to `localStorage` key `dnd-theme` independently of the character store
- `src/components/PageOne/TraitModal.jsx` — portal-based modal for trait editing; same `createPortal` pattern as `ApiSearchDropdown`. Closes on backdrop click, ✕ button, or Escape key.

## Theme System

Eight presets defined as `[data-theme="X"]` CSS variable overrides in `src/index.css`: `shadow-realm` (default), `parchment`, `arcane-scholar`, `infernal-pact`, `celestial-dawn`, `eldritch-void`, `druids-grove`, `frost-citadel`. Theme is applied to `document.documentElement` — all panels, backgrounds, and accents update instantly.

Each theme overrides `--font-heading` and `--font-body` in addition to all color variables — fonts change with the theme. To add a new theme: add a `[data-theme="X"]` block in `index.css` overriding all `--font-*`, `--accent-*`, `--glass-*`, `--text-*`, and `--bg-color` variables, add a `body` background-image block, and add an entry `{ id, label, swatch }` to the `THEMES` array in `useTheme.js`.

**Semantic color contract** (do not break across themes):
- `--accent-gold` → headings, primary UI accents, active labels (must read as a warm or contextual "primary" color)
- `--accent-crimson` → HP bars, damage indicators, death save failures, danger (must register as a warning/danger color)
- `--accent-arcane` → spellcasting panels, magical elements (must be distinct from both gold and crimson)

**Light theme gotchas:**
- The global `input/textarea/select` rule uses `background: rgba(0,0,0,0.25)`. Both `parchment` and `celestial-dawn` have scoped overrides immediately after their `body` background-image blocks to fix this, including a separate `:focus` override (global focus sets `background: rgba(0,0,0,0.4)` which also goes dark).
- The global `h1–h6` rule applies `text-shadow: var(--heading-shadow)`. On dark themes `--heading-shadow` defaults to `0 2px 4px rgba(0,0,0,0.6)`. Light themes (`parchment`, `celestial-dawn`) override it to a subtle white highlight: `0 1px 0 rgba(255,255,255,0.4/0.5)`. Never apply the dark drop-shadow in a light theme — it halos heading text on cream backgrounds.

## Page One Layout

Two-column grid: `460px 1fr` (left column fixed, center column flexible). The right column was removed when traits moved into the header.

Traits (Features & Traits, Personality, Ideals, Bonds, Flaws) live as compact clickable chips in the `Header` component, to the right of the Total Level auto-calc box. Clicking a chip opens `TraitModal`. The underlying data is still `character.traits` in the store — `Header.jsx` reads and writes it directly via `updateNestedField('traits', field, value)`.

## Typography

Eight font families loaded via Google Fonts in `index.html`: Cinzel, Cinzel Decorative, Cormorant Garamond, Crimson Pro, IM Fell English, Josefin Slab, Lora, Uncial Antiqua. Controlled via `--font-heading` and `--font-body` CSS variables — each theme overrides both.

**Per-theme fonts:** shadow-realm (Cinzel/Crimson Pro), parchment (IM Fell English/Lora), arcane-scholar (Cormorant Garamond/Crimson Pro), infernal-pact (Cinzel Decorative/Crimson Pro), celestial-dawn (Cormorant Garamond/Lora), eldritch-void (Uncial Antiqua/Crimson Pro), druids-grove (Uncial Antiqua/Lora), frost-citadel (Josefin Slab/Josefin Slab).

IM Fell English and Uncial Antiqua are display-only fonts — **do not use them as body fonts** (illegible at small sizes). Lora and Crimson Pro are the safe body choices.

## Key Gotchas

- **`backdrop-filter` creates stacking contexts**: `.glass-panel` uses `backdrop-filter: blur(16px)`, which traps child z-indexes. Dropdowns/overlays inside panels must use `createPortal` — raising `z-index` alone won't work. Both `ApiSearchDropdown` and `TraitModal` use this pattern.
- **`useCharacterStore.getState()` inside inner component functions**: Calling this pattern inside functions defined in a component body broke the Spellcasting tab in React StrictMode. Avoid it — subscribe to what you need via the hook selector instead.
- All removable list items (classes, attacks, hit dice, spells) carry a `crypto.randomUUID()` `id` field — use `key={item.id || idx}` and add `id: crypto.randomUUID()` when creating new items.
- **Attribute labels use D&D abbreviations** (STR/DEX/CON/INT/WIS/CHA) in `Attributes.jsx` — full names are in the `title` tooltip. Do not revert to full names; they overflow the 110px column in heavy display fonts.
- **Number inputs in vitals and attributes suppress browser spinners** via `-webkit-appearance: none` / `-moz-appearance: textfield` on `.attr-score`, `.shield-box input`, `.stat-box input`. Spinners eat horizontal space and cause clipping.
- **Death saves are custom button pips**, not native checkboxes. Success pips show ✓ (green), failure pips show ✕ (crimson) — color AND shape differentiation for accessibility. Each has `aria-label` and `aria-pressed`.
- **Active tab persists** to `localStorage` key `dnd-active-tab` (separate from `dnd-character` and `dnd-theme`). Tabs also support arrow-key keyboard navigation and have `role="tablist"` / `role="tab"` ARIA semantics.
- **`document.title`** is set dynamically from `character.header.characterName` via `useEffect` in `App.jsx`. Falls back to `"The Codex"` when name is empty.
- **API search loading skeleton**: `ApiSearchDropdown` shows shimmer skeleton rows (`.skeleton-row`) while `isLoading` is true. Also has an `aria-live="polite"` region that announces result counts to screen readers.

## API

External: `https://www.dnd5eapi.co/api` (no auth). Lists are fetched once and filtered client-side via `searchList()` in `dndApi.js`. Both Actions and Inventory use react-query with key `['equipment']` — they share the same cache. Spells use key `['spells']`.

## Deployment

Pushes to `main` auto-deploy to GitHub Pages via `.github/workflows/deploy.yml`. Base path is `/dnd_app/` (set in `vite.config.js`).
