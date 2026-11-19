# Design system

Visual rules for the ACKaraca portfolio. The source of truth is
[`src/styles/global.css`](src/styles/global.css); this file summarizes it so you
don't have to read the whole stylesheet to match the look.

The system is called Meridian v3. It has a light "porcelain" theme and a dark
"graphite" theme, one ultramarine accent, thin blueprint-style lines, italic serif
accents inside headlines, and springy motion. Focus rings, keyboard support and
reduced motion are part of the design, not add-ons.

The home page (`/`) is a separate 3D corridor with its own palette, defined in
[`src/components/corridor/corridor.css`](src/components/corridor/corridor.css).
Everything below applies to the classic home page (`/classic`) and the inner pages.

## Color

Both themes are set through CSS variables on `:root`. Dark values apply when
`html[data-theme='dark']` is set.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--bg` | `#f7f6f2` | `#0a0c11` | page background |
| `--bg-raised` | `#fffefb` | `#12151d` | cards, panels |
| `--bg-deep` | `#edeae1` | `#191d28` | wells, segmented controls |
| `--ink` | `#0e1119` | `#edeff5` | text |
| `--ink-soft`, `--ink-faint` | `#474d5c`, `#6e7484` | `#a7adbe`, `#7d8496` | secondary text |
| `--accent` | `#2b3fee` | `#5c74ff` | primary actions, active states |
| `--accent-strong` | `#1d2cc4` | `#93a7ff` | hover and emphasis |
| `--signal` | `#0c8a6d` | `#45d0bf` | availability, success |
| `--amber` | `#c97a15` | `#e8a33d` | warnings, constraints |
| `--danger` | `#b3402a` | same | form errors |

- Lines are `--line` (12–13% ink) and `--line-strong` (26–28% ink).
- The footer is inverted: it uses `--inverse-bg` and `--inverse-ink`, which swap
  with the theme.
- A fixed film-grain noise overlay sits on top at 4–7% opacity.

## Typography

- **Sans (`--sans`)**: Manrope Variable for UI and headings. Weights 500–830, tight
  letter spacing (−0.02em to −0.042em).
- **Serif (`--serif`)**: Newsreader Variable, italic, for emphasis inside
  headlines, intros and quotes.
- **Mono (`--mono`)**: system monospace for labels, meta rows and code.

| Element | Size | Weight |
| --- | --- | --- |
| Hero h1 | `clamp(2.7rem, 6.6vw, 5.6rem)` | 780 |
| Page h1 | `clamp(2.4rem, 5.4vw, 4.4rem)` | 760 |
| Section h2 | `clamp(1.9rem, 3.6vw, 3.1rem)` | 750 |
| Card h3 | `clamp(1.35rem, 2.2vw, 1.7rem)` | 740 |
| Body | 1.05–1.12rem, line height 1.65–1.78 | 400–450 |
| Label / meta | 0.72rem, uppercase, 0.22em tracking | 700 |

## Layout

- Content width: `--shell`, which is `min(80rem, 100vw − clamp(2rem, 6vw, 5rem))`.
- Header height: `--header-height` (4.75rem on desktop, 4.25rem on mobile).
- Section padding: `clamp(4.5rem, 10vw, 8.5rem)` top and bottom.
- Radii: `--radius-lg` 1.25rem for cards, `--radius-xl` 1.75rem for large panels and
  case media, 999px for buttons and pills.
- Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, plus `--glow` for primary
  buttons.
- Breakpoints: 1080px (navigation collapses), 900px (grids stack), 640px (forms
  and stats go to one column).

## Motion

- Easing: `--ease-out` (`cubic-bezier(.22, 1, .36, 1)`) for most transitions,
  `--ease-spring` (`cubic-bezier(.34, 1.56, .64, 1)`) for small, playful moves.
- Content fades in and rises 26px once when it scrolls into view (the `Reveal`
  component).
- Keyframes in use: `line-rise`, `marquee-slide`, `availability-pulse`,
  `radar-pulse`, `scroll-nudge`.
- With `prefers-reduced-motion`, animations shrink to 0.01ms, the marquee stops
  and transforms are removed. Visitors can also turn motion off manually; the
  choice is stored on their device (AppPreferences).

## Components

**Buttons.** Primary buttons are pills with a 135° gradient from `--accent` to
`--accent-strong`, white text and `--glow`. On hover they lift 2px and the arrow
icon shifts. Ghost buttons have a thin border that picks up the accent on hover.

**Header** (`SiteHeader`). Fixed. It starts transparent and turns into a
blurred glass bar after 16px of scrolling. A 2px progress bar (accent to signal)
follows the scroll position. Nav links draw an underline from the left, and the
active link keeps it. The brand mark is a two-letter tile that tilts −6° on
hover. At 1080px and below, a hamburger opens a full-screen menu with numbered
links, a focus trap, and Escape to close.

**Project card** (`ProjectCard`). Raised surface with a thin border and a 16:9
generated artwork header. It tilts up to about 5° toward the pointer and shows a
soft spotlight (`--tilt-x`, `--tilt-y`, `--spot-x`, `--spot-y`). On hover it
lifts 6px, the title turns accent-colored and the arrow slides into a circle.
The meta row is uppercase mono, technologies are bordered pills, and a verified
metric is shown in `--signal`.

**Classic home hero.** Soft gradients follow the pointer behind a canvas
constellation of projects. The headline reveals line by line, with the middle
line in italic serif and accent color. Beside it are a ⌘K search card and a
hire/explore switch. Below the hero: a scrolling strip of items (32s loop, pauses
on hover) and animated counters.

**Forms** (`ContactPage`). Inputs have 0.8rem radius, a thin border and an accent
focus ring. Errors use `--danger`. The consent checkbox is custom, the honeypot
field is visually hidden, and the message field has a live character counter.

**Footer.** An inverted panel with rounded top corners, a call to action and link
columns. A large outlined "ACKARACA" wordmark fills in on hover.
