/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Bebas Neue"', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        // Hextech tokens (mirrors uiux/reference/DESIGN.md)
        hextech: {
          void:        '#010A13',
          surface:     '#08151e',
          'surface-1': '#091428',
          'surface-2': '#111d26',
          'surface-3': '#15212a',
          'surface-4': '#1f2b35',
          'surface-5': '#2a3640',
          gold:         '#f0bf5c',
          'gold-deep':  '#c89b3c',
          'gold-fixed': '#ffdea4',
          'gold-shadow':'#5d4200',
          teal:         '#43e2d2',
          'teal-dim':   '#00c6b7',
          'teal-deep':  '#005049',
          'shadow-blue':      '#8ecefb',
          'shadow-blue-deep': '#69a9d5',
          text:         '#d7e4f1',
          'text-variant':'#d2c5b1',
          outline:      '#9b8f7d',
          'outline-dim':'#4e4637',
          error:        '#ffb4ab',
        },
        // shadcn aliases (kept so existing ui/* components still compile)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card:    { DEFAULT: 'hsl(var(--card))',    foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary:   { DEFAULT: 'hsl(var(--secondary))',   foreground: 'hsl(var(--secondary-foreground))' },
        muted:       { DEFAULT: 'hsl(var(--muted))',       foreground: 'hsl(var(--muted-foreground))' },
        accent:      { DEFAULT: 'hsl(var(--accent))',      foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input:  'hsl(var(--input))',
        ring:   'hsl(var(--ring))',
      },
      letterSpacing: {
        'wide-1':  '.04em',
        'wide-2':  '.06em',
        'wide-3':  '.10em',
        'wide-4':  '.14em',
        'wide-5':  '.18em',
        'wide-6':  '.22em',
      },
      keyframes: {
        'wiz-rise': {
          '0%':   { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'wiz-drift': {
          '0%':   { transform: 'translate(0,0) rotate(0deg)' },
          '50%':  { transform: 'translate(var(--dx,40px), var(--dy,-30px)) rotate(180deg)' },
          '100%': { transform: 'translate(0,0) rotate(360deg)' },
        },
        'wiz-pulse': {
          '0%,100%': { opacity: 'var(--opMin,.08)', filter: 'blur(.3px)' },
          '50%':     { opacity: 'var(--opMax,.45)', filter: 'blur(0)' },
        },
        'pulse-aura': {
          '0%,100%': { boxShadow: '0 0 0 4px rgba(67,226,210,.12), 0 0 22px rgba(67,226,210,.6)' },
          '50%':     { boxShadow: '0 0 0 12px rgba(67,226,210,0), 0 0 32px rgba(67,226,210,.9)' },
        },
        'sigil-blink': {
          '0%,100%': { opacity: '.3' },
          '50%':     { opacity: '1' },
        },
      },
      animation: {
        'wiz-rise': 'wiz-rise .55s cubic-bezier(.2,.8,.2,1) both',
        'pulse-aura':   'pulse-aura 1.8s ease-in-out infinite',
        'sigil-blink':  'sigil-blink 1.6s infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
