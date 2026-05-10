---
name: Hextech Cinematic
colors:
  surface: '#08151e'
  surface-dim: '#08151e'
  surface-bright: '#2f3a45'
  surface-container-lowest: '#040f18'
  surface-container-low: '#111d26'
  surface-container: '#15212a'
  surface-container-high: '#1f2b35'
  surface-container-highest: '#2a3640'
  on-surface: '#d7e4f1'
  on-surface-variant: '#d2c5b1'
  inverse-surface: '#d7e4f1'
  inverse-on-surface: '#26323c'
  outline: '#9b8f7d'
  outline-variant: '#4e4637'
  surface-tint: '#f0bf5c'
  primary: '#f0bf5c'
  on-primary: '#412d00'
  primary-container: '#c89b3c'
  on-primary-container: '#4b3500'
  inverse-primary: '#7b5900'
  secondary: '#43e2d2'
  on-secondary: '#003732'
  secondary-container: '#00c6b7'
  on-secondary-container: '#004c46'
  tertiary: '#8ecefb'
  on-tertiary: '#00344d'
  tertiary-container: '#69a9d5'
  on-tertiary-container: '#003d59'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdea4'
  primary-fixed-dim: '#f0bf5c'
  on-primary-fixed: '#261900'
  on-primary-fixed-variant: '#5d4200'
  secondary-fixed: '#61f9e9'
  secondary-fixed-dim: '#3bdccd'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#c9e6ff'
  tertiary-fixed-dim: '#8ecefb'
  on-tertiary-fixed: '#001e2f'
  on-tertiary-fixed-variant: '#004c6e'
  background: '#08151e'
  on-background: '#d7e4f1'
  surface-variant: '#2a3640'
typography:
  display-lg:
    fontFamily: Bebas Neue
    fontSize: 72px
    fontWeight: '400'
    lineHeight: 72px
    letterSpacing: 0.05em
  headline-lg:
    fontFamily: Bebas Neue
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Bebas Neue
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 36px
  headline-md:
    fontFamily: Bebas Neue
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.1em
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

This design system captures the arcane sophistication of Hextech craftsmanship. It targets a competitive, high-engagement audience that values prestige, mastery, and immersive storytelling. The emotional response is one of "Powerful Mystery"—the feeling of wielding ancient technology powered by raw magic.

The visual style is **Tactile & Cinematic**, blending high-fantasy ornamentation with functional industrial design. It utilizes multi-layered depth, inner glows that simulate magical energy, and meticulous metal-work detailing. The interface is unapologetically premium, emphasizing a dark-mode-first experience where every interaction feels like activating a relic.

## Colors

The palette is anchored in deep, layered obsidian and navy tones to provide maximum contrast for magical elements.

- **Primary (Hextech Gold):** Used for critical actions, ornate borders, and brand-heavy moments. It represents prestige and mechanical precision.
- **Secondary (Magic Teal):** Reserved for highlights, active states, and "mana" or energy-based feedback. This color should always carry a subtle outer glow.
- **Tertiary (Shadow Blue):** Used for depth, secondary buttons, and subtle environmental lighting.
- **Neutral:** A range of deep blues and near-blacks used for backgrounds. Absolute black is avoided in favor of `#010A13` to maintain a "midnight" atmosphere.

## Typography

The typography system balances "The Cinematic" with "The Technical."

- **Headlines:** Use **Bebas Neue** for an impactful, tall, and authoritative presence. It should feel like a film title or a champion's announcement.
- **Body:** **Manrope** provides a refined, modern counterpoint that ensures high legibility against dark backgrounds. It feels balanced and professional.
- **Labels/UI Elements:** **Space Grotesk** is used for technical data, stats, and small UI labels to lean into the "Hextech" engineering aesthetic. Its geometric nature suggests precision.

All uppercase styling should be applied to labels and headlines to maintain the high-fantasy dramatic tone.

## Layout & Spacing

This design system utilizes a **Fixed Grid** model for immersive experiences, centering content to evoke the feel of a terminal or a magical grimoire.

- **Grid:** A 12-column grid on desktop (max-width 1440px) with 24px gutters. On mobile, this collapses to a 4-column fluid layout.
- **Rhythm:** Spacing follows a 4px/8px baseline. Use `lg` (40px) and `xl` (64px) for major section breathing room to maintain the premium, "breathable" feel of high-end interfaces.
- **Padding:** Containers should use generous internal padding to allow for ornate border treatments without crowding the content.

## Elevation & Depth

Depth is not communicated through traditional drop shadows, but through **Tonal Layering** and **Internal Glows**.

1.  **Level 0 (Void):** The base background (`#010A13`).
2.  **Level 1 (Surface):** The primary container surface (`#091428`). It uses a subtle 1px inner border of `#C89B3C` (at 10% opacity) to define edges.
3.  **Level 2 (Active/Floating):** Elements that are elevated use a backdrop blur (12px) and a primary color "Magic Glow"—a soft teal outer bloom (`rgba(10, 200, 185, 0.15)`).
4.  **Lighting:** A directional light source from the top-center is simulated using a faint gold linear gradient overlay on major panels.

## Shapes

The shape language is **Sharp and Geometric**. 

- **Corner Treatment:** All primary containers and buttons use 0px border-radius. To add sophistication, use "clipped corners" (45-degree chamfers) on prominent buttons and card headers rather than rounding.
- **Borders:** Borders are a core component of the visual identity. Use double-lined borders for primary modules, with "corner caps" (ornate L-shaped accents) in Hextech Gold.
- **Icons:** Icons should be thin-stroked (1.5px) and geometric, avoiding soft curves in favor of hex-angles.

## Components

- **Buttons:** Primary buttons feature a solid Gold background with black text. Hover states trigger a "Magical Pulse" (a temporary teal glow). Secondary buttons are ghost-style with gold borders and clipped corners.
- **Cards:** Backgrounds use a subtle radial gradient from `#091428` to `#010A13`. Every card must have a 1px gold border top-line.
- **Input Fields:** Dark backgrounds with a 1px teal bottom-border. On focus, the teal border glows and a faint teal "haze" fills the input area.
- **Ornate Borders:** A specific component for section dividers that uses a gold line with a centered diamond or rune-like ornament.
- **Chips/Badges:** Use a "Hex-cut" shape (six-sided) with gold or teal outlines to categorize content or display stats.
- **Progress Bars:** Designed as "Mana Bars" or "Experience Bars"—using a teal gradient with a high-contrast glow at the leading edge of the progress.