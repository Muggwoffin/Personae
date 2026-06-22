---
type: dashboard
cssclasses:
  - readme-note
tags:
  - dashboard
created: 2026-06-18
updated: 2026-06-18
---

# Archival Sources

An overview of every note made with the **Archival Source** and **Correspondence** templates — your archives, collections, dates and what's still to do. Tick `consulted` once you've seen a document and `digitised` once it's been photographed or scanned and filed; the figures below update themselves. A trip-planning view — what to consult, and who to research where — is integrated at the bottom.

```dataviewjs
const cv = (n, f) => (getComputedStyle(document.body).getPropertyValue(n).trim() || f);
const SRC = cv('--type-source', '#8C5050'), ROSE = cv('--rose', '#C4686B'),
      GREEN = cv('--type-location', '#5A8A6A'), GOLD = cv('--brand-gold', '#d3a573'),
      VIOLET = cv('--type-event', '#7A6CB0'), MUTED = cv('--ink-caption', '#8a7a64');
const yearOf = (v) => { const m = v == null ? null : String(v).match(/(\d{4})/); return m ? +m[1] : null; };

const docs = dv.pages()
  .where(p => (p.type === "archival_source" || p.type === "archival_correspondence") && !p.file.path.includes("Templates"))
  .array();

if (!docs.length) {
  dv.paragraph("*No archival notes yet — add one in the **Sources** folder and you'll be asked whether it's a generic source or a correspondence.*");
} else {
  const total = docs.length;
  const correspondence = docs.filter(d => d.type === "archival_correspondence").length;
  const consulted = docs.filter(d => d.consulted === true).length;
  const digitised = docs.filter(d => d.digitised === true).length;
  const archives = [...new Set(docs.map(d => d.archive && String(d.archive)).filter(Boolean))];
  const collections = new Set(docs.map(d => d.collection && String(d.collection)).filter(Boolean));

  // ── Overview chips ──
  const bar = dv.container.createEl('div');
  bar.style.cssText = 'display:flex;gap:0.55rem;flex-wrap:wrap;margin:0.3rem 0 1rem;';
  const stat = (label, value, color) => {
    const c = bar.createEl('div');
    c.style.cssText = `background:${color}1c;border:1px solid ${color}66;border-radius:20px;padding:0.3rem 0.9rem;font-size:0.8rem;color:${color};font-weight:600;`;
    c.textContent = `${label} · ${value}`;
  };
  stat('Documents', total, SRC);
  if (correspondence) stat('Correspondence', correspondence, VIOLET);
  stat('Consulted', `${consulted}/${total}`, ROSE);
  stat('Digitised', `${digitised}/${total}`, GREEN);
  stat('To digitise', total - digitised, GOLD);
  stat('Archives', archives.length, SRC);
  stat('Collections', collections.size, SRC);

  // ── Progress bars ──
  const prog = (label, n, color) => {
    const w = dv.container.createEl('div'); w.style.cssText = 'margin:0.1rem 0 0.5rem;';
    const lab = w.createEl('div'); lab.style.cssText = `font-size:0.72rem;color:${MUTED};margin-bottom:0.15rem;`;
    lab.textContent = `${label}: ${n} of ${total} (${Math.round(100 * n / total)}%)`;
    const track = w.createEl('div'); track.style.cssText = `height:9px;border-radius:5px;background:${color}22;overflow:hidden;`;
    const fill = track.createEl('div'); fill.style.cssText = `height:100%;width:${Math.round(100 * n / total)}%;background:${color};border-radius:5px;`;
  };
  prog('Consulted', consulted, ROSE);
  prog('Digitised', digitised, GREEN);

  // ── By archive ──
  dv.header(3, "By archive");
  const byA = {};
  for (const d of docs) { const a = d.archive ? String(d.archive) : "(not set)"; (byA[a] = byA[a] || []).push(d); }
  dv.table(["Archive", "Documents", "Consulted", "Digitised"],
    Object.entries(byA).sort((x, y) => y[1].length - x[1].length).map(([a, it]) =>
      [a, it.length, it.filter(d => d.consulted === true).length, it.filter(d => d.digitised === true).length]));

  // ── By document type ──
  const byT = {};
  for (const d of docs) { const t = d.document_type ? String(d.document_type) : "(untyped)"; byT[t] = (byT[t] || 0) + 1; }
  dv.header(3, "By document type");
  const tb = dv.container.createEl('div'); tb.style.cssText = 'display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.6rem;';
  for (const [t, n] of Object.entries(byT).sort((x, y) => y[1] - x[1])) {
    const c = tb.createEl('span');
    c.style.cssText = `font-size:0.78rem;background:${SRC}14;border:1px solid ${SRC}44;border-radius:12px;padding:0.18rem 0.6rem;color:${SRC};`;
    c.textContent = `${t} · ${n}`;
  }

  // ── Document dates by decade ──
  const years = docs.map(d => yearOf(d.document_date)).filter(Boolean);
  if (years.length) {
    dv.header(3, "Document dates");
    const dec = {};
    for (const y of years) { const d10 = Math.floor(y / 10) * 10; dec[d10] = (dec[d10] || 0) + 1; }
    const keys = Object.keys(dec).map(Number).sort((a, b) => a - b);
    const max = Math.max(...keys.map(k => dec[k]));
    const dz = dv.container.createEl('div'); dz.style.cssText = 'margin-bottom:0.6rem;';
    for (const k of keys) {
      const r = dz.createEl('div'); r.style.cssText = 'display:flex;align-items:center;gap:0.5rem;margin-bottom:0.2rem;';
      const lab = r.createEl('span'); lab.style.cssText = `font-size:0.72rem;color:${MUTED};width:46px;flex-shrink:0;`; lab.textContent = `${k}s`;
      const track = r.createEl('div'); track.style.cssText = 'flex:1;height:14px;';
      const fill = track.createEl('div'); fill.style.cssText = `height:100%;width:${Math.round(100 * dec[k] / max)}%;background:${GOLD};border-radius:3px;min-width:3px;`;
      const ct = r.createEl('span'); ct.style.cssText = `font-size:0.72rem;color:${MUTED};`; ct.textContent = dec[k];
    }
  }

  // ── Worklists ──
  const toDigitise = docs.filter(d => d.digitised !== true);
  const toConsult = docs.filter(d => d.consulted !== true);
  if (toDigitise.length) { dv.header(3, `📷 To digitise (${toDigitise.length})`); dv.list(toDigitise.map(d => d.file.link)); }
  if (toConsult.length) { dv.header(3, `👁 To consult (${toConsult.length})`); dv.list(toConsult.map(d => d.file.link)); }

  // ── All documents ──
  dv.header(3, "All documents");
  dv.table(["Document", "Archive", "Collection", "Date", "Status"],
    docs.slice().sort((a, b) => String(a.file.name).localeCompare(String(b.file.name))).map(d => [
      d.file.link,
      d.archive ?? "—",
      d.collection ?? "—",
      d.document_date ?? "—",
      (d.consulted === true ? "✓ " : "") + (d.digitised === true ? "📷" : "") || "—",
    ]));
}
```

## What to consult — and who to research where

*Documents grouped by archive, plus the people you've flagged (via `archive_location`) to research at each one.*

```dataviewjs
await dv.view("Vault Settings/scripts/archive-planner");
```
