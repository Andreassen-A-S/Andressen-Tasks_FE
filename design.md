# Andreassen TMS — Design Language

## Concept A: "Nordic Precision"

> A warm-white Scandinavian interface with a dark sidebar, Outfit typography, restrained blue accents, and a focus on clean hierarchy and quiet professionalism — like Linear meets a Danish design studio.

---

## Overall Aesthetic

Clean Scandinavian minimalism. Professional and understated, never flashy. Think of it as the design equivalent of a well-organized Danish architecture firm — everything has purpose, nothing is decorative for its own sake.

---

## Color Palette

### Backgrounds & Surfaces

| Token          | Value     | Usage                                            |
| -------------- | --------- | ------------------------------------------------ |
| Background     | `#F6F5F1` | Page background — warm off-white, not sterile    |
| Card / Surface | `#FFFFFF` | Cards, modals, dropdowns — pure white on warm bg |
| Sidebar        | `#1B1D22` | Navigation sidebar — dark charcoal               |
| Row Hover      | `#FAFAF7` | Table row hover — barely-warm tint               |

### Text

| Token               | Value     | Usage                                        |
| ------------------- | --------- | -------------------------------------------- |
| Primary Text        | `#1B1D22` | Headings, body text — softer than pure black |
| Secondary Text      | `#6B7084` | Descriptions, supporting info                |
| Muted Text          | `#9DA1B4` | Captions, table headers, overlines           |
| Sidebar Text        | `#A8AABB` | Inactive nav items                           |
| Sidebar Active Text | `#FFFFFF` | Active nav item                              |

### Accent & Brand

| Token        | Value     | Usage                                 |
| ------------ | --------- | ------------------------------------- |
| Accent Blue  | `#2C5FE0` | Links, active states, primary actions |
| Accent Light | `#EBF0FD` | Icon containers, tag backgrounds      |

### Borders

| Token          | Value                    | Usage                                    |
| -------------- | ------------------------ | ---------------------------------------- |
| Border         | `#E8E6E1`                | Card borders, dividers — warm-toned gray |
| Sidebar Border | `rgba(255,255,255,0.06)` | Subtle dividers within sidebar           |

### Semantic Colors

| Token            | Value     | Background | Usage                          |
| ---------------- | --------- | ---------- | ------------------------------ |
| Success / Active | `#2D9F6F` | `#E8F7F0`  | Active badges, success states  |
| Warning / Pause  | `#D4860A` | `#FEF5E7`  | Pause buttons, medium priority |
| Danger / Delete  | `#D64545` | `#FDECEC`  | Delete buttons, high priority  |

---

## Typography

### Fonts

- **Display & Body:** [Outfit](https://fonts.google.com/specimen/Outfit) — geometric sans-serif with clean, slightly rounded letterforms
- **Monospace:** [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) — for data-oriented content (emails, IDs, percentages)

### Type Scale

| Class           | Size | Weight | Letter Spacing | Usage                            |
| --------------- | ---- | ------ | -------------- | -------------------------------- |
| `.h1`           | 36px | 700    | -0.03em        | Page titles                      |
| `.h2`           | 28px | 700    | -0.025em       | Section titles                   |
| `.h3`           | 22px | 600    | -0.02em        | Card/panel titles                |
| `.h4`           | 18px | 600    | -0.015em       | Sub-section titles               |
| `.h5`           | 16px | 600    | -0.01em        | Card headers, list item titles   |
| `.h6`           | 14px | 600    | 0              | Small headers                    |
| `.body-lg`      | 18px | 400    | —              | Large body text                  |
| `.body-md`      | 16px | 400    | —              | Default body text                |
| `.body-sm`      | 14px | 400    | —              | Subtitles under headings         |
| `.body-xs`      | 13px | 400    | —              | Descriptions inside cards        |
| `.label-lg`     | 14px | 500    | —              | Form labels, prominent UI text   |
| `.label-md`     | 13px | 500    | —              | Secondary labels                 |
| `.label-sm`     | 12px | 500    | —              | Small labels, filter pills       |
| `.overline`     | 10px | 600    | 0.08em         | Section overlines (uppercase)    |
| `.caption`      | 11px | 400    | —              | Captions, helper text            |
| `.table-header` | 10px | 600    | 0.06em         | Table column headers (uppercase) |

### Typography Principles

- Headings use tight negative letter-spacing for a compact, modern feel
- Overlines and table headers are uppercase with wide letter-spacing — a classic Scandinavian detail
- Font weights are restrained: 700 for h1/h2, 600 for h3–h6, 500 for labels, 400 for body
- Monospace is reserved strictly for data: emails, IDs, percentages, timestamps

---

## Layout Principles

### Structure

- **Dark sidebar** (w-75 wide) with light content area — high contrast navigation
- **Generous padding** (24–32px) around content areas
- **Card-based containers** with `border-radius: lg` and 1px warm-gray borders
- **Tables inside cards** with subtle row hover states

### Spacing Scale

```
4px — 8px — 12px — 16px — 20px — 24px — 28px — 32px
```

### Grid Patterns

- Template cards: 2-column grid, `gap: 16px`
- Team member cards: 2-column grid (or table for list view)
- Stats/summary cards: 3–4 column grid, `gap: 14px`
- Task list: Single column, stacked rows

---

## Component Patterns

### Buttons

| Type      | Style                                                            |
| --------- | ---------------------------------------------------------------- |
| Primary   | Solid accent green (`#0f6e56`), white text, `border-radius: 8px` |
| Secondary | White background, `#E8E6E1` border, dark text                    |
| Danger    | Red-tinted background (`#FDECEC`), red text, red border          |
| Warning   | Amber-tinted background (`#FEF5E7`), amber text, amber border    |

### Badges & Pills

- Small (10px font), rounded corners
- Colored background with matching text color
- Example: green background + green text for "Aktiv"
- Priority badges: red for HØJ, amber for MELLEM, green for LAV

### Icon Containers

- 32×32px boxes with `border-radius: lg`
- Accent green background (`#0f6e56`) for primary icons
- Neutral gray background (`#F3F3F0`) for informational icons
- Icons are 14px (`w-3.5 h-3.5`)

### Avatar Initials

- **Rounded rectangles** (not circles) with `border-radius: lg`
- Colored backgrounds per user
- White text, Outfit font, weight 600
- Sizes: 34px (table), 26px (inline/stacked)

### Filter Pills

- Active: `bg-gray-900 text-white` (dark pill)
- Inactive: transparent with `border border-gray-200`, gray text
- `border-radius: 6–8px`, `padding: 6px 16px`

### Cards

- White background on warm off-white page
- `border: 1px solid #E8E6E1`
- `border-radius: lg`
- Hover: subtle shadow `0 4px 20px rgba(0,0,0,0.06)`
- Internal padding: 20–24px

### Tables

- Inside card containers (no standalone tables)
- Column headers: `.table-header` class (10px, uppercase, muted)
- Row padding: 14px horizontal, 20px vertical
- Row hover: `#FAFAF7` background
- Row dividers: `1px solid #E8E6E1`

---

## Interaction & Motion

| Interaction     | Effect                                     |
| --------------- | ------------------------------------------ |
| Card hover      | Soft shadow: `0 4px 20px rgba(0,0,0,0.06)` |
| Button hover    | Background color shift only                |
| Table row hover | Background: `#FAFAF7`                      |
| Border hover    | Slightly darker border color               |
| Transitions     | `150–200ms` duration, `ease` timing        |

### Motion Principles

- Minimal animation — transitions are functional, not decorative
- No bounce, no scale, no dramatic effects
- Everything is calm and controlled
- Animations serve clarity (fade-in for modals, slide for drawers)

---

## Sidebar Design

- Background: `#1B1D22` (dark charcoal)
- Width: w-75, fixed
- Brand: Outfit 15px/700, white
- Brand subtitle: 10px uppercase, wide letter-spacing, `#A8AABB`
- Nav items: 13px/400, `#A8AABB`
- Active nav item: 13px/500, `#FFFFFF`, with `rgba(255,255,255,0.08)` background and `border-radius: 8px`
- Nav icons: 14px, centered in 20px width
- User profile at bottom: avatar + name + role, separated by border-top
- Section dividers: `1px solid rgba(255,255,255,0.06)`

---

## Design Principles Summary

1. **Warmth over sterility** — off-white backgrounds, warm-gray borders, no harsh blue-grays
2. **Hierarchy through type** — size, weight, and color do the work, not decoration
3. **Restraint** — accent blue is used sparingly; most of the UI is grayscale
4. **Consistency** — every component follows the same spacing, radius, and color rules
5. **Professionalism** — calm, controlled, trustworthy; suitable for a work tool used daily
6. **Scandinavian detail** — uppercase overlines, tight letter-spacing, geometric type, rounded rectangles over circles
