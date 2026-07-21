// Shared Hextech design tokens.
//
// These exist because the palette used to be re-declared at the top of every
// page (BG/BG2/BG3/BORDER) and the chamfer polygons were hand-written inline
// at eight different corner sizes. Import from here instead.

export const color = {
  void: '#010A13',
  surface1: '#091428',
  surface2: '#111d26',
  // Modal cards sit slightly translucent so the blurred backdrop reads through.
  card: 'rgba(6,12,20,0.94)',

  gold: '#f0bf5c',
  goldDeep: '#c89b3c',
  goldFixed: '#ffdea4',
  teal: '#43e2d2',
  tealDeep: '#005049',
  danger: '#e25c7a',
  dangerDeep: '#a83456',
  success: '#5fc28a',

  text: '#d7e4f1',
  textVariant: '#d2c5b1',
  textMuted: '#9b8f7d',
  textFaint: '#6d6559',

  // Gold at descending strengths — was rgba(200,155,60,…) and
  // rgba(240,191,92,…) used interchangeably at a dozen alpha values.
  border: 'rgba(240,191,92,.28)',
  borderSoft: 'rgba(240,191,92,.20)',
  borderFaint: 'rgba(200,155,60,.10)',
};

// Corner-cut rectangles. `chamfer` cuts all four corners; `chamferTLBR` cuts
// only top-left and bottom-right (the button / CTA shape).
export const chamfer = (c = 12) =>
  `polygon(${c}px 0, calc(100% - ${c}px) 0, 100% ${c}px, 100% calc(100% - ${c}px), calc(100% - ${c}px) 100%, ${c}px 100%, 0 calc(100% - ${c}px), 0 ${c}px)`;

export const chamferTLBR = (c = 8) =>
  `polygon(${c}px 0, 100% 0, 100% calc(100% - ${c}px), calc(100% - ${c}px) 100%, 0 100%, 0 ${c}px)`;

// Single source of truth for the header. Fixed rather than padding-derived so
// the bar can't change height between auth states or across pages.
export const NAV_HEIGHT = 76;

// Two dialog widths, not five. `compact` is for a prompt or a confirmation,
// `form` for anything with labelled inputs.
export const MODAL_WIDTH = {
  compact: 440,
  form: 480,
};

export const font = {
  display: "'Bebas Neue', 'Space Grotesk', sans-serif",
  body: "Manrope, system-ui, sans-serif",
  mono: "'Space Grotesk', sans-serif",
};

// The uppercase micro-label used for form labels, tags and nav links.
export const microLabel = {
  fontFamily: font.mono,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
};
