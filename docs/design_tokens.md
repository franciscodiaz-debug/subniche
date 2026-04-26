# Design Tokens

This document is the canonical token reference for the SubNiche app shell and component system. New components should use these values through `app/globals.css` and Tailwind utility classes instead of introducing one-off colors.

Implementation note: the `feature/core-components` branch used a manual shadcn-style fallback rather than running `npx shadcn@latest`, because running a freshly downloaded CLI requires separate action-time approval. The resulting primitives are local source files under `components/ui/` and preserve the SubNiche tokens below.

## Palette

| Token | Value | Usage |
| --- | --- | --- |
| `--background` | `#090d14` | Page background |
| `--foreground` | `#f5f2ea` | Primary text |
| `--sidebar` | `#0d121b` | Desktop app sidebar |
| `--surface` | `#131a25` | Cards, panels, overlays |
| `--muted` | `#1b2533` | Secondary surfaces and form fields |
| `--muted-foreground` | `#9aa4b2` | Secondary text and metadata |
| `--border` | `#273244` | Subtle borders |
| `--primary` | `#d7a84f` | Main CTA and gold accent |
| `--primary-foreground` | `#141008` | Text on primary |
| `--accent` | `#d7a84f` | Focus, active, and hover accents |

## Status Colors

| Token | Value | Canonical use |
| --- | --- | --- |
| `--success` | `#78b892` | True Match, completed/positive status |
| `--info` | `#7aa7d9` | For Trade, Inbound Interest, informational emphasis |
| `--warning` | `#d5a24a` | Wishlist/Wanted, cash adjustment, caution |
| `--destructive` | `#e06f6f` | Destructive actions and error states |

## Semantic Rules

- Listing statuses are non-exclusive. A listing can be `In Collection`, `For Sale`, and `For Trade` at the same time.
- Trade match labels are visually distinct: `True Match`, `Inbound Interest`, and `Suggested` must never share the same treatment.
- Community context is a publishing context, not a duplicated listing. Components should show contexts like `Public Market` or `Pedal Builders Guild` without implying separate inventory records.
- Trust indicators are placeholders unless real verification exists. Labels such as `Linked account` or `Community member` must not imply verified identity.

## Radius

| Token | Value | Usage |
| --- | --- | --- |
| `--radius-sm` | `0.5rem` | Dense controls and small badges |
| `--radius-md` | `0.75rem` | Listing cards and standard controls |
| `--radius-lg` | `1rem` | Larger cards and panels |
| `--radius-xl` | `1.25rem` | Profile blocks and major surfaces |

## Shadows

| Token | Value | Usage |
| --- | --- | --- |
| `--shadow-soft` | `0 20px 60px rgb(0 0 0 / 0.3)` | App shell depth and overlays |
| `--shadow-card` | `0 12px 32px rgb(0 0 0 / 0.22)` | Hover/elevated cards and menus |

## Tailwind Exposure

`app/globals.css` exposes these values through `@theme inline`, including:

- `bg-background`
- `text-foreground`
- `bg-surface`
- `bg-muted`
- `text-muted-foreground`
- `border-border`
- `bg-primary`
- `text-primary-foreground`
- `text-accent`
- `text-success`
- `text-info`
- `text-warning`
- `text-destructive`
