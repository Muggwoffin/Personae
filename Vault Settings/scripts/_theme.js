// _theme.js — single source of truth for palette inside dataviewjs views.
// Reads the design tokens from the tokens.css snippet (:root custom properties)
// at runtime, with hardcoded fallbacks so views still render if the snippet is
// disabled. Mobile-safe (no Node require); cached on globalThis for the session.
//
// Usage:
//   if (!globalThis.VaultTheme) await dv.view("Vault Settings/scripts/_theme");
//   const accent = globalThis.VaultTheme.type('person');     // '#C4686B'
//   const gold   = globalThis.VaultTheme.color('brand-gold');
//
// NOTE: edits here only take effect after an Obsidian reload (cached on globalThis).

const cs = getComputedStyle(document.body);
const read = (name, fallback) => {
  const v = cs.getPropertyValue(name);
  return (v && v.trim()) || fallback;
};

const TYPES = {
  person:       read('--type-person',       '#C4686B'),
  event:        read('--type-event',        '#C4823B'),
  location:     read('--type-location',     '#5A8A6A'),
  organisation: read('--type-organisation', '#5A7A9E'),
  publication:  read('--type-publication',  '#7A609E'),
  concept:      read('--type-concept',      '#9060C0'),
  writing:      read('--type-writing',      '#7A9E7E'),
  source:       read('--type-source',       '#8C5050'),
  other:        read('--type-other',        '#8A8A8A'),
};

const COLORS = {
  'brand-gold':     read('--brand-gold',     '#d3a573'),
  'rose-deep':      read('--rose-deep',      '#8C3335'),
  'rose':           read('--rose',           '#C4686B'),
  'ink-label':      read('--ink-label',      '#A07060'),
  'ink-link':       read('--ink-link',       '#5A7A9E'),
  'ink-link-hover': read('--ink-link-hover', '#3A5A7E'),
};

globalThis.VaultTheme = {
  type: (k) => TYPES[k] || TYPES.other,
  color: (k) => COLORS[k] || '',
  types: TYPES,
  colors: COLORS,
};
