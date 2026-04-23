# Andreassen TMS — Design Language

## Design Statement

Andreassen TMS uses a GitHub-inspired product UI foundation with a warm-white Scandinavian theme and Outfit typography.

The product should feel operational, compact, calm, and professional. The interface is built for daily work, not for visual flourish. When in doubt, choose the more neutral, dense, border-based, and utility-oriented option.

---

## Core Direction

### Product UI Foundation

The UI should follow a GitHub-inspired product design approach:

- Dense and efficient rather than spacious
- Flat and border-based rather than shadow-driven
- Practical and systematic rather than expressive
- Left-aligned and workflow-oriented rather than centered or presentation-like
- Built from reusable primitives rather than screen-specific patterns

### Visual Character

Andreassen TMS keeps a softer visual tone through:

- A warm-white Scandinavian background palette
- Clean, restrained use of color
- Outfit as the core typeface

These choices provide identity, but they must not reduce clarity, density, or consistency.

### Decision Rule

When there is uncertainty between two design options, prefer the one that is:

- More compact
- More neutral
- More border-based
- More reusable
- More operational

---

## Layout And Spacing

### Spacing Principles

- Use Tailwind's default spacing scale only
- Do not use arbitrary spacing values such as `p-[10px]` or `mt-[15px]`
- Prefer tighter spacing inside product UI components
- Keep spacing consistent across screens

### Preferred Spacing Values

- `p-1`
- `p-2`
- `p-3`
- `p-4`
- `p-6`
- `p-8`
- `p-12`

### Usage Guidance

- Inside cards, inputs, rows, menus, and picker surfaces, prefer `p-2` to `p-4`
- Between major page sections, prefer `gap-6` to `gap-8` or `my-6` to `my-8`
- Between inline items such as badges, icons, avatars, and compact controls, prefer `gap-1` to `gap-2`
- Baseline row density should feel compact and scannable

---

## Borders, Radius, And Density

### Borders And Surfaces

- Prefer `border` and `border-solid` to separate UI
- Use borders, dividers, and subtle background changes before considering elevation
- Avoid heavy shadow-driven cards
- Permanent tinted surfaces should be used sparingly

### Radius

- Use `rounded-md` for most interactive surfaces and containers
- Use `rounded` or `rounded-sm` for smaller elements such as badges and pills
- Do not default to large radii for standard product UI

### Density

- Prefer dense rows and compact component layouts
- `py-2 px-4` is the baseline for list rows and table-like rows
- Secondary and muted information should stay inline where possible instead of creating extra stacked blocks
- Use hover backgrounds for row interactivity, not permanent highlighted row styles

---

## Page Layout

### Content Width And Alignment

- Use `max-w-screen-xl` as the default maximum content width
- Keep primary content left-aligned
- Avoid layouts that feel like marketing pages

### Sidebar

- Fixed sidebars should generally be `w-60` or `w-64`
- Sidebar structure should be simple, predictable, and consistent across sections

### Layout Rules

- Avoid nested card stacks
- Avoid decorative spacing used only for visual effect
- Prefer clear page structure over container-heavy composition

---

## Color System

The color system should support a GitHub-inspired product UI while keeping a warm-white Scandinavian tone.

### Backgrounds And Surfaces

| Token      | Value     | Usage                        |
| ---------- | --------- | ---------------------------- |
| Background | `#F6F5F1` | Default page background      |
| Surface    | `#FFFFFF` | Cards, modals, menus, panels |
| Sidebar    | `#1B1D22` | Navigation sidebar           |
| Row Hover  | `#FAFAF7` | Table and list row hover     |

### Text

| Token               | Value     | Usage                           |
| ------------------- | --------- | ------------------------------- |
| Primary Text        | `#1B1D22` | Headings and body text          |
| Secondary Text      | `#6B7084` | Supporting information          |
| Muted Text          | `#9DA1B4` | Captions, helper text, metadata |
| Sidebar Text        | `#A8AABB` | Inactive navigation items       |
| Sidebar Active Text | `#FFFFFF` | Active navigation items         |

### Accent

Use one restrained accent color consistently.

| Token        | Value     | Usage                                 |
| ------------ | --------- | ------------------------------------- |
| Accent Blue  | `#2C5FE0` | Links, active states, primary actions |
| Accent Light | `#EBF0FD` | Selected backgrounds, subtle accents  |

### Borders

| Token          | Value                    | Usage                                 |
| -------------- | ------------------------ | ------------------------------------- |
| Border         | `#E8E6E1`                | Dividers, card borders, field borders |
| Sidebar Border | `rgba(255,255,255,0.06)` | Sidebar section dividers              |

### Semantic Colors

| Token   | Value     | Background | Usage                                      |
| ------- | --------- | ---------- | ------------------------------------------ |
| Success | `#2D9F6F` | `#E8F7F0`  | Success and active states                  |
| Warning | `#D4860A` | `#FEF5E7`  | Warnings and medium priority               |
| Danger  | `#D64545` | `#FDECEC`  | Errors, destructive actions, high priority |

### Focus

| Token         | Value     | Usage                                |
| ------------- | --------- | ------------------------------------ |
| Focus Outline | `#2D9F6F` | Focus rings for interactive elements |

### Color Principles

- Most of the interface should remain grayscale or near-neutral
- Accent color should be used sparingly and deliberately
- Warmth should come from background and border tone, not from decorative color usage
- Maintain clear contrast and readable hierarchy at all times

---

## Typography

### Font Families

- **Display and Body:** Outfit
- **Monospace:** IBM Plex Mono

Outfit gives the product a modern and slightly softer tone, but typography should still feel restrained and operational.

### Approved Semantic Tokens

Prefer shared semantic tokens rather than screen-specific or color-specific typography classes.

- `h1`
- `h2`
- `h3`
- `h4`
- `h5`
- `body-md`
- `body-sm`
- `label-md`
- `label-sm`
- `caption`

### Typography Principles

- Keep the type system smaller and more disciplined than a marketing site
- Use weight and size for hierarchy before using color
- Apply typography and color separately where possible
- Do not create new color-specific typography classes
- Monospace is reserved for data-oriented content such as emails, IDs, percentages, and timestamps
- Avoid expressive heading treatments that make the UI feel editorial

---

## Shared Control Rules

### Shared Actions

- Use the shared `Button` component for actions
- Do not force `Button` onto segmented controls, filter chips, picker rows, or toolbar selectors unless that component is explicitly designed for the pattern

### Shared Fields

Use shared field primitives for form controls:

- `TextInput`
- `SelectField`
- `TextArea`
- `ColorInput`

### Modals

- Modal footers should be owned by `Modal`, not by child forms
- Modal actions should remain predictable across the app

---

## Component Patterns

### Buttons

Buttons should feel practical and compact.

| Type      | Style                                                  |
| --------- | ------------------------------------------------------ |
| Primary   | Accent blue background, white text, `rounded-md`       |
| Secondary | White or neutral surface, border, primary text         |
| Danger    | Danger-tinted background or bordered destructive style |
| Warning   | Warning-tinted background or bordered caution style    |

Rules:

- Keep padding compact
- Avoid oversized button treatments
- Prefer clear state changes over decorative hover effects

### Badges And Pills

- Use small labels with compact padding
- Use `rounded` or `rounded-sm`
- Use semantic colors with restrained contrast
- Badges should support scanning, not dominate the UI

### Filters And Segmented Controls

- Active states should be clear and compact
- Inactive states should remain neutral and unobtrusive
- Use borders and background shifts, not exaggerated styling

### Cards And Panels

- Cards are allowed, but should behave as practical containers rather than decorative objects
- Use white surfaces with warm-gray borders
- Prefer subtle or no shadow
- Internal padding should usually stay within `p-2` to `p-4`, with larger values reserved for larger panels or modals

### Tables And Rows

- Tables should feel dense, readable, and operational
- Use borders and row dividers clearly
- Keep column headers compact and muted
- Row hover should use the defined hover background
- Avoid excessive vertical padding

---

## Icon Language

These pairings should stay consistent across filters, sort menus, and related lightweight controls.

| Meaning         | Icon                  |
| --------------- | --------------------- |
| Deadline        | outline clock         |
| Start date      | outline calendar      |
| Priority        | outline flag          |
| Goal            | dartboard             |
| Sort ascending  | arrow up wide-short   |
| Sort descending | arrow down wide-short |

If a new filter or sort option is added, prefer extending this icon language instead of choosing icons ad hoc per screen.

---

## Sidebar Design

The sidebar may retain a stronger visual identity than the rest of the application, but should still follow the product UI system.

- Background: `#1B1D22`
- Width: `w-60` or `w-64`
- Brand text should remain clean and restrained
- Inactive nav items use muted sidebar text
- Active nav items use white text with a subtle background highlight
- Section dividers should be subtle and structural
- Avoid decorative treatments that make the sidebar feel disconnected from the rest of the product

---

## Interaction And Motion

### Interaction Principles

- Interaction feedback should be functional, not decorative
- Motion should support clarity and state change
- The UI should feel calm and controlled

### Motion Rules

- Prefer subtle transitions only
- Use `150ms` to `200ms` duration with `ease`
- Avoid bounce, scale-heavy, or dramatic motion
- Prefer fades and simple slides for overlays and drawers

### Hover And Focus

- Button hover should primarily use color or border change
- Row hover should use background change
- Borders may darken slightly on hover
- Focus states must be clear and accessible

---

## What To Avoid

To keep the system aligned with its direction, avoid the following by default:

- Arbitrary spacing values
- Oversized padding inside standard product components
- Heavy card shadows
- Large-radius surfaces as the default
- Expressive or editorial typography treatments
- Screen-specific one-off controls when shared primitives exist
- Decorative tinted backgrounds replacing clear structure
- Nested card stacks and overly segmented layouts

---

## Design Principles Summary

1. **Operational first** — the UI is built for daily work and efficient scanning
2. **Warmth through theme** — use warm-white surfaces and subtle neutrals, not decorative styling
3. **Hierarchy through structure** — spacing, type, borders, and alignment should do most of the work
4. **Consistency over invention** — shared primitives and repeated patterns are preferred over custom screen logic
5. **Restraint over flair** — the interface should feel calm, professional, and trustworthy
6. **GitHub-inspired foundation** — compact, neutral, border-based, and utility-oriented
7. **Scandinavian tone** — warm-white palette and Outfit typography provide identity without compromising usability
