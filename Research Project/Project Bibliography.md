---
type: bibliography
cssclasses:
  - database-view
tags:
  - bibliography
obsidianEditingMode: preview
created: 2026-06-02T09:47
updated: 2026-06-03T08:18
---

# Project Bibliography

```dataviewjs
// ── Identify cited sources ────────────────────────────────────
// A source is "cited" if any note outside Zotero/ links to it
// (i.e. [[citekey]] appears in a footnote, sources: field, or body text)
const allSources = dv.pages('"Zotero/Highlights"').where(p => p.citekey).array();

const cited    = allSources.filter(p =>
  p.file.inlinks.some(l => !String(l.path).startsWith("Zotero/"))
);
const uncited  = allSources.filter(p =>
  !p.file.inlinks.some(l => !String(l.path).startsWith("Zotero/"))
);

// ── Stats bar ─────────────────────────────────────────────────
const byType = {};
for (const s of cited) {
  const t = s.itemType || "other";
  byType[t] = (byType[t] || 0) + 1;
}

const colours = {
  journalArticle:"#C4686B", book:"#5A7A9E", bookSection:"#7A9E7E",
  thesis:"#A07A5A", report:"#9060C0", other:"#8A8A8A"
};
const labels = { journalArticle:"Articles", book:"Books", bookSection:"Chapters",
  thesis:"Theses", report:"Reports" };

const bar = dv.container.createEl("div");
bar.style.cssText = "display:flex;gap:0.6rem;flex-wrap:wrap;margin-bottom:0.8rem;align-items:center;";

const total = dv.container.createEl("span");
total.style.cssText = "font-size:0.85rem;font-weight:600;margin-right:0.4rem;";
total.textContent = `${cited.length} cited source${cited.length !== 1 ? "s" : ""}`;
bar.appendChild(total);

for (const [type, count] of Object.entries(byType).sort((a,b) => b[1]-a[1])) {
  const c = colours[type] || colours.other;
  const chip = bar.createEl("div");
  chip.style.cssText = `background:${c}22;border:1px solid ${c};border-radius:20px;padding:0.25rem 0.75rem;font-size:0.75rem;color:${c};font-weight:600;`;
  chip.textContent = `${labels[type] || type} · ${count}`;
}

if (uncited.length > 0) {
  const note = bar.createEl("span");
  note.style.cssText = "font-size:0.75rem;color:var(--text-muted);margin-left:auto;";
  note.textContent = `+ ${uncited.length} imported but not yet cited`;
}
```

---

```dataviewjs
// ── Formatting helpers ───────────────────────────────────────
function surname(authorsStr) {
  if (!authorsStr) return "zzz";
  const seg = String(authorsStr).split(";")[0].trim();
  const parts = seg.split(",").map(s => s.trim()).filter(Boolean);
  // "Last, First" (exactly two parts, single-word last name) -> before the comma
  if (parts.length === 2 && parts[0].split(/\s+/).length === 1 && parts[1].split(/\s+/).length <= 2) {
    return parts[0].toLowerCase();
  }
  // natural order ("Philippe Adant", "Tom, Kathy, Peter Pfister") -> last word
  const words = seg.replace(/,/g, " ").trim().split(/\s+/);
  return (words[words.length - 1] || "zzz").toLowerCase();
}

// Display the first author surname-first (Chicago) when the name is a
// simple natural-order single author; otherwise leave the string as-is.
function displayAuthors(authorsStr) {
  const s = String(authorsStr).trim();
  if (s.includes(";") || s.includes(",")) return s;
  const words = s.split(/\s+/);
  if (words.length < 2 || words.length > 3) return s;
  return words[words.length - 1] + ", " + words.slice(0, -1).join(" ");
}

function val(v) { return v && String(v).trim() ? String(v).trim() : null; }
function cleanYear(v) { const m = String(v ?? "").match(/\d{4}/); return m ? m[0] : null; }
function italics(t) { return t ? `*${t}*` : ""; }

function formatEntry(p) {
  const authors = displayAuthors(val(p.authors) || val(p.editor) || "Unknown");
  const year    = cleanYear(p.year) || "n.d.";
  const title   = val(p.title)   || p.file.name;
  const type    = val(p.itemType) || "";
  const link    = dv.fileLink(p.file.path, false, "↗");

  if (type === "journalArticle") {
    const journal = val(p.journal) ? italics(val(p.journal)) : "";
    const vol = val(p.volume) ? ` ${val(p.volume)}` : "";
    const iss = val(p.issue)  ? `, no. ${val(p.issue)}` : "";
    const pgs = val(p.pages)  ? `: ${val(p.pages)}` : "";
    const doi = val(p.doi)    ? ` https://doi.org/${val(p.doi)}` : (val(p.url) ? ` ${val(p.url)}` : "");
    return `${authors}. "${title}." ${journal}${vol}${iss} (${year})${pgs}.${doi} ${link}`;
  }
  if (type === "book") {
    const place = val(p.place) || "";
    const pub   = val(p.publisher) || "";
    const loc   = place && pub ? `${place}: ${pub}, ` : pub ? `${pub}, ` : "";
    return `${authors}. ${italics(title)}. ${loc}${year}. ${link}`;
  }
  if (type === "bookSection") {
    const book = val(p.bookTitle) ? italics(val(p.bookTitle)) : "";
    const ed   = val(p.editor)   ? `edited by ${val(p.editor)}. ` : "";
    const place = val(p.place) || "";
    const pub   = val(p.publisher) || "";
    const loc   = place && pub ? `${place}: ${pub}, ` : pub ? `${pub}, ` : "";
    const pgs   = val(p.pages) ? `, ${val(p.pages)}` : "";
    return `${authors}. "${title}." In ${book}, ${ed}${loc}${year}${pgs}. ${link}`;
  }
  if (type === "thesis") {
    const pub = val(p.publisher) ? `${val(p.publisher)}, ` : "";
    return `${authors}. "${title}." ${pub}${year}. ${link}`;
  }
  return `${authors}. "${title}." ${year}. ${link}`;
}

// ── Cited sources (have [[citekey]] links from outside Zotero/) ─
const allSources = dv.pages('"Zotero/Highlights"').where(p => p.citekey).array();
const cited = allSources
  .filter(p => p.file.inlinks.some(l => !String(l.path).startsWith("Zotero/")))
  .sort((a, b) => surname(val(a.authors) || val(a.editor) || val(a.title)).localeCompare(surname(val(b.authors) || val(b.editor) || val(b.title))));

if (cited.length === 0) {
  dv.paragraph("*No cited sources yet. Add `[[citekey]]` links in your footnotes or `sources:` fields, then use 'Create Source Record' in Zotero to register each source.*");
} else {
  const groups = {};
  for (const p of cited) {
    const letter = surname(val(p.authors) || val(p.editor) || val(p.title)).charAt(0).toUpperCase() || "#";
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(p);
  }
  for (const letter of Object.keys(groups).sort()) {
    dv.header(3, letter);
    for (const p of groups[letter]) {
      dv.paragraph(formatEntry(p));
    }
  }
}
```

---

```dataviewjs
// ── Imported but not yet cited ───────────────────────────────
const allSources = dv.pages('"Zotero/Highlights"').where(p => p.citekey).array();
const uncited = allSources
  .filter(p => !p.file.inlinks.some(l => !String(l.path).startsWith("Zotero/")))
  .sort((a, b) => {
    const sa = String(a.authors || "").split(";")[0].split(",")[0].trim().toLowerCase();
    const sb = String(b.authors || "").split(";")[0].split(",")[0].trim().toLowerCase();
    return sa.localeCompare(sb);
  });

if (uncited.length > 0) {
  dv.header(2, "Imported but not yet cited");
  for (const p of uncited) {
    const authors = p.authors ? String(p.authors) : "Unknown";
    const year    = p.year    ? String(p.year)    : "n.d.";
    const title   = p.title   ? String(p.title)   : p.file.name;
    dv.paragraph(`- ${dv.fileLink(p.file.path, false, "↗")} ${authors} (${year}), "${title}"`);
  }
}
```

---

## Cited but Missing a Source Record

```dataviewjs
await dv.view("Vault Settings/scripts/citation-watchdog");
```
