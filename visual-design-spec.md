# Visual Design Specification — Daily Dashboard

Use this document as a reference to recreate a webapp with an identical visual experience. It covers color palette, typography, spatial system, component design, motion, and atmospheric effects.

---

## 1. Overall Aesthetic

**Mood:** Dark, focused, meditative, subtly luxurious. Think of a glowing command center in a dim room — minimal ornamentation, deliberate negative space, and restrained use of a single accent color that carries all emotional weight. The interface feels like a tool designed for one person, not a product aimed at thousands.

**Design lineage:** Somewhere between a premium macOS utility app and a high-end dark-mode SaaS dashboard. No gradients on text (except for a hero title), no illustrations, no images. All visual interest comes from depth, glow, and controlled motion.

**Key principles:**
- **Single accent color** — violet/purple — used sparingly but decisively (glows, borders, progress bars, primary buttons).
- **Layered depth** — a background vignette creates a sense of physical space; cards sit at different visual elevations through border, shadow, and gradient treatment.
- **Minimal chrome** — no visible navbars, sidebars, or top bars. Views are full-page and singularly focused.
- **Generous whitespace** — content never feels cramped. Spacing is generous, especially vertically.

---

## 2. Color System

### Backgrounds (darkest to lightest)
| Token            | Value       | Usage                                      |
|------------------|-------------|----------------------------------------------|
| bg-primary       | `#0a0a0b`   | Page body, absolute darkest layer            |
| bg-secondary     | `#111113`   | Scrollbar track, subtle surface distinction  |
| bg-card          | `#18181b`   | Card backgrounds, input backgrounds          |
| bg-card-hover    | `#1f1f23`   | Card hover state                             |
| bg-elevated      | `#222226`   | Chips, secondary buttons, task hover state   |

### Text
| Token            | Value       | Usage                                        |
|------------------|-------------|------------------------------------------------|
| text-primary     | `#fafafa`   | Headings, body text, primary content          |
| text-secondary   | `#a1a1aa`   | Subtitles, card titles, secondary labels      |
| text-muted       | `#52525b`   | Hints, placeholders, disabled/crossed-out text|

### Accent (Violet)
| Token            | Value                           | Usage                          |
|------------------|---------------------------------|----------------------------------|
| accent           | `#8b5cf6`                       | Primary buttons, borders, active states |
| accent-light     | `#a78bfa`                       | Gradient endpoints, hover highlights    |
| accent-glow      | `rgba(139, 92, 246, 0.4)`      | Box-shadow glow on buttons and hero     |
| accent-subtle    | `rgba(139, 92, 246, 0.15)`     | Focus rings, subtle fill backgrounds    |

### Semantic
| Token            | Value                           | Usage                          |
|------------------|---------------------------------|----------------------------------|
| success          | `#22c55e`                       | Completed task checkbox fill    |
| success-glow     | `rgba(34, 197, 94, 0.3)`       | Glow around completed checkboxes|

### Borders
| Token            | Value       | Usage                                  |
|------------------|-------------|------------------------------------------|
| border           | `#27272a`   | Default subtle borders                  |
| border-light     | `#3f3f46`   | Stronger borders, chip outlines, hover  |

---

## 3. Typography

**Primary font stack:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`  
**Monospace font stack:** `'JetBrains Mono', 'Fira Code', monospace`  
**Base size:** `16px`  
**Line height:** `1.6` (body default)  
**Rendering:** Anti-aliased (`-webkit-font-smoothing: antialiased`)

### Type Scale
| Element              | Size      | Weight | Color           | Notes                                      |
|----------------------|-----------|--------|------------------|----------------------------------------------|
| Empty-state title    | 2.5rem    | 600    | Gradient fill    | Linear gradient from white to accent-light   |
| Wizard question      | 2rem      | 600    | text-primary     | Line-height 1.3, shrinks to 1.5rem on mobile|
| Dashboard title      | 1.75rem   | 600    | text-primary     |                                              |
| Hero focus pills     | 1.1rem    | 500    | text-primary     |                                              |
| Body / inputs        | 1.1rem    | 400    | text-primary     |                                              |
| Card title           | 0.9rem    | 600    | text-secondary   | Uppercase, letter-spacing 0.05em            |
| Hero label           | 0.75rem   | 600    | accent-light     | Uppercase, letter-spacing 0.12em            |
| Date display         | 0.9rem    | 400    | text-muted       | Uses monospace font                          |
| Hints                | 0.8rem    | 400    | text-muted       |                                              |

### Gradient Text (empty-state title only)
```css
background: linear-gradient(135deg, #fafafa 0%, #a78bfa 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## 4. Spacing System

Uses a rem-based scale applied consistently:

| Token    | Value   | Typical Usage                        |
|----------|---------|----------------------------------------|
| xs       | 0.25rem | Tight gaps (header-left stacking)     |
| sm       | 0.5rem  | Chip gaps, small internal padding     |
| md       | 1rem    | Standard padding, gaps between items  |
| lg       | 1.5rem  | Section margins, larger padding       |
| xl       | 2rem    | Container padding, large gaps         |
| 2xl      | 3rem    | Section separators, wizard top margin |
| 3xl      | 4rem    | Wizard content bottom padding         |

---

## 5. Border Radius System

| Token    | Value | Usage                                        |
|----------|-------|------------------------------------------------|
| sm       | 8px   | Task items on hover, small interactive bits   |
| md       | 12px  | Buttons, navigation arrows, default-mode items|
| lg       | 16px  | Cards, input fields, dashboard card corners   |
| xl       | 24px  | Hero section, chips, focus pills              |

---

## 6. Depth & Elevation

The app creates a layered 3D feel through shadows, borders, and a background vignette.

### Background Vignette (applied to `body::before`)
A fixed radial gradient overlay that darkens edges and pulls visual focus to the center:
```
radial-gradient(
  ellipse 80% 60% at 50% 40%,
  transparent 0%,
  rgba(0, 0, 0, 0.15) 50%,
  rgba(0, 0, 0, 0.4) 100%
)
```
This is `pointer-events: none` and sits at `z-index: 0`.

### Elevation Levels

**Level 0 — Recessed (secondary cards)**
- Background: vertical gradient from `bg-card` to slightly darker
- Border: `1px solid rgba(39, 39, 42, 0.6)`
- Shadow: `inset 0 1px 0 rgba(255,255,255,0.02), 0 2px 8px rgba(0,0,0,0.3)`
- On hover: border brightens, shadow deepens to `0 8px 30px rgba(0,0,0,0.4)`, subtle inset gets slightly brighter

**Level 1 — Hero section (dominant card)**
- Background: `linear-gradient(135deg, rgba(30,30,35,1) 0%, bg-card 100%)`
- Border: `1px solid rgba(139, 92, 246, 0.2)` — purple-tinted
- Top edge: a 3px gradient bar (accent to accent-light) that shimmers via animation
- Shadow: stacked multi-layer including `0 0 60px rgba(139,92,246,0.1)` and `0 0 100px rgba(139,92,246,0.06)` for atmospheric purple glow
- Animated glow: oscillates shadow intensity over 4 seconds

**Level 2 — Floating action button**
- Background: solid accent color
- Shadow: `0 4px 20px accent-glow`
- On hover: scales up 1.1× and rotates 10°, shadow intensifies

---

## 7. Component Catalog

### 7.1 Empty State (Landing / First-time)
- Full viewport centered flex column
- Floating icon animation (vertical bob, 3s ease-in-out loop)
- Gradient text title (white → purple)
- Muted subtitle
- CTA button: accent background, white text, rounded-lg, arrow icon that slides right on hover, lifts 2px on hover with intensified glow shadow

### 7.2 Wizard / Check-in Flow
- Max width 600px, centered, full height
- **Progress bar** at top: 4px height, dark track, gradient fill (accent → accent-light) with `0 0 20px accent-glow` halo, animates width with a slow cubic-bezier ease
- **Question area** centered vertically with animated entrance (fade + slide up from 20px, 0.5s, staggered 0.1s for subtitle vs heading)
- **Chips** for entered items: pill-shaped (`border-radius: 24px`), dark elevated background, light border, × remove button that turns accent on hover, scale-in entrance animation from 0.8 to 1
- **Text input**: full width, card-colored background, 2px border, 56px height, rounded-lg. On focus: border turns accent, 4px accent-subtle ring
- **Action buttons**: primary (accent fill, white text, lift + glow on hover), secondary (elevated background, muted text, brightens on hover). Back button hides on first step via opacity + pointer-events
- **Hint text**: tiny centered muted text ("Press Enter to add • Cmd+Enter to continue")

### 7.3 Dashboard
- Max width 900px, centered
- **Header**: flex row, title left ("Your Day", 1.75rem bold), monospace date below it, navigation arrows right (40×40px square buttons, card-colored, bordered, lift and accent-border on hover)
- **Hero section**: see elevation Level 1 above. Contains an uppercase label with icon ("◎ Main Focuses") and focus pills
- **Focus pills**: rounded-xl, accent-subtle gradient fill, accent border, accent box-shadow. On hover: float up 3px, intensify glow significantly, border brightens, text goes pure white
- **Cards grid**: CSS grid `repeat(auto-fit, minmax(300px, 1fr))`, single column on mobile
- **Card anatomy**: header row (emoji icon + uppercase title, separator border below), content area
- **Task items**: flex row, custom 22×22px checkbox (rounded 6px border, green fill + checkmark + glow on complete), task text strikes through and dims on complete, hover shows elevated background
- **Default mode items**: list of bordered items with a 3px accent left border, on hover fills with accent-subtle and all borders turn accent
- **Edit FAB**: fixed bottom-right, 56px circle, accent background, lifts and rotates 10° on hover

### 7.4 Scrollbar
- 8px wide
- Track: `bg-secondary`
- Thumb: `border` color, 4px radius, brightens to `text-muted` on hover

---

## 8. Motion & Animation

### Transition Speeds
| Token     | Value                                 | Usage                        |
|-----------|---------------------------------------|--------------------------------|
| fast      | `150ms ease`                          | Micro-interactions (chip ×)   |
| base      | `250ms ease`                          | Most hover states, toggles    |
| slow      | `400ms cubic-bezier(0.16,1,0.3,1)`   | View transitions, progress bar|
| bounce    | `500ms cubic-bezier(0.34,1.56,0.64,1)` | Reserved for playful moments |

### Keyframe Animations
1. **float** — 3s ease-in-out infinite vertical bob (`translateY(0) → -10px → 0`). Used on empty-state icon.
2. **fadeSlideIn** — Fade in + slide up from `translateY(10–20px)` to 0. Used on wizard question text with stagger.
3. **chipIn** — Scale from 0.8 to 1 + fade in. 0.2s ease. Used when chips appear.
4. **heroGlow** — 4s ease-in-out infinite oscillation of hero card box-shadow intensity (purple glow breathes).
5. **shimmer** — 3s ease-in-out infinite horizontal `background-position` shift for the hero top-edge gradient bar.
6. **pulse** — 2s ease-in-out infinite opacity+scale pulse on the hero label icon.

### Interaction Patterns
- **Hover lifts**: Elements rise 2–3px via `translateY` with shadow intensification
- **Active press**: Elements push down via `scale(0.95–0.98)` with reduced shadow
- **Button arrows**: slide 4px right on parent hover
- **FAB**: scales 1.1× and rotates 10° on hover, compresses on active

---

## 9. Layout Architecture

### Three Full-Page Views (only one visible at a time)
1. **Empty state** — vertically+horizontally centered flex container
2. **Wizard** — 600px max-width centered column, progress bar at top, content centered vertically, input area at bottom (using `margin-top: auto`)
3. **Dashboard** — 900px max-width centered, natural top-down flow

### Responsive Behavior (≤600px)
- Wizard question text shrinks from 2rem to 1.5rem
- Dashboard padding decreases from `xl` to `lg`
- Hero content text shrinks from 1.25rem to 1.1rem
- Cards grid collapses to single column
- FAB moves slightly inward

---

## 10. Atmospheric Details That Sell the Vibe

These subtle details are critical to the overall feel — don't skip them:

1. **The vignette overlay** — Without it, the dark background feels flat. The radial gradient adds perceived depth, as if content sits inside a physical space.
2. **Purple glow breathing** on the hero card — It's never static. The slow oscillation makes the interface feel alive without being distracting.
3. **Shimmer on the hero top edge** — A 3px gradient bar that slowly shifts, implying energy and priority.
4. **Inset top highlight** on cards — `inset 0 1px 0 rgba(255,255,255,0.02-0.05)` simulates a subtle light source from above.
5. **Anti-aliased text rendering** — Explicitly set for crisp, thin letterforms that suit the dark background.
6. **No visible focus outlines** by default — inputs use a box-shadow ring (`0 0 0 4px accent-subtle`) instead of browser default outlines.
7. **Monospace date** — A small typographic contrast that adds technical/precise character.
8. **Emoji as icons** — No icon library. Cards use emoji (🗑, 🧘) and the hero label uses a Unicode target symbol (◎). Keeps dependencies minimal and adds warmth.
9. **overflow-x: hidden** on body — prevents horizontal scroll from animated elements.
10. **Cursor behavior** — Labels and non-interactive text use `cursor: default` to discourage clicking; interactive elements use `cursor: pointer`.

---

## 11. Summary for Reproduction

To faithfully recreate this visual experience:

- Start with a near-black background (`#0a0a0b`) and apply a fixed radial vignette overlay.
- Use Inter (or system sans-serif) and a monospace font for date/code elements.
- Apply a single violet accent (`#8b5cf6` / `#a78bfa`) for all color accents — buttons, glows, borders, focus states.
- Build depth through layered box-shadows and subtle gradients, not through color variation.
- Keep all content narrow and centered (600–900px max-width).
- Use generous spacing (1–3rem between sections).
- Add slow, breathing animations on the most important element (hero section glow, shimmer bar).
- Make hover states feel physical: elements lift via translateY, gain glow, then compress on active press.
- Style inputs and chips with dark fills and accent borders on focus.
- Use CSS custom properties for every value to maintain consistency.
- Mobile: gracefully collapse to single column, reduce type sizes slightly, no horizontal overflow.
