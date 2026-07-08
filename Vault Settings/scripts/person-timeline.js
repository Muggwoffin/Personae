// Person timeline — a discrete, collapsed chronology at the foot of a person
// note: vital dates, every event note and letter (archival_correspondence)
// that links to this person, and the note's own inline [event:: …] facts and
// right-click date pills. Sorted with the shared _dates.js helpers, so
// uncertain dates (~1936, before 1940, 1936..1938) sort and display correctly.
// Usage (at the end of the Person Template, collapsed so it stays discrete):
//   > [!timeline]- Timeline
//   > ```dataviewjs
//   > await dv.view("Vault Settings/scripts/person-timeline");
//   > ```
if (dv.container.closest('.markdown-source-view')) return; // render only in Reading view (prevents footnote/edit scroll-jump)
if (!globalThis.VaultDates) await dv.view("Vault Settings/scripts/_dates");
const { parseDate, formatDate } = globalThis.VaultDates;

const cur = dv.current();
const entries = [];
const push = (date, icon, text, link) => {
  const sortDate = parseDate(date);
  if (sortDate) entries.push({ sortDate, date, icon, text, link });
};

// 1. Vital dates
if (cur.birth_date) push(cur.birth_date, "👶", `Born${cur.place_of_birth ? " in " + cur.place_of_birth : ""}`, null);
if (cur.death_date) push(cur.death_date, "✝️", `Died${cur.place_of_death ? " in " + cur.place_of_death : ""}`, null);

// 2. Dated event notes and correspondence that link to this person
const seen = new Set();
for (const l of cur.file.inlinks) {
  if (seen.has(l.path)) continue;
  seen.add(l.path);
  const p = dv.page(l.path);
  if (!p || !p.date || p.file.path.includes("Templates")) continue;
  if (p.type === "event") push(p.date, "📅", "", p.file.path);
  else if (p.type === "archival_correspondence") push(p.date, "✉️", "", p.file.path);
}

// 3. This note's own inline events: [event:: DATE | text] …
const evs = cur.event ? (Array.isArray(cur.event) ? cur.event : [cur.event]) : [];
for (const raw of evs) {
  const m = String(raw).match(/^\s*([^|]+?)\s*[|]\s*(.+)$/);
  if (m) push(m[1], "🕑", m[2].trim(), null);
}
// … and date pills created via right-click → "Create event"
let rawText = "";
try { rawText = await dv.io.load(cur.file.path); } catch (e) {}
const SPAN_RE = /<span class="hist-event" data-date="([^"]+)"(?:\s+title="([^"]*)")?>([^<]*)<\/span>/g;
let sm;
while ((sm = SPAN_RE.exec(rawText)) !== null) {
  push(sm[1], "🕑", (sm[2] || sm[3] || "").replace(/&quot;/g, '"'), null);
}

// Render — compact rows, styled by .person-timeline in the Person snippet
dv.container.classList.add("person-timeline");
entries.sort((a, b) => a.sortDate - b.sortDate);
if (!entries.length) {
  dv.paragraph("*No dated facts yet — add birth/death dates, link an event note, or tag an inline `[event:: …]`.*");
} else {
  for (const e of entries) {
    const link = e.link ? dv.fileLink(e.link) : "";
    const sep = link && e.text ? " — " : "";
    const text = e.text ? `*${e.text}*` : "";
    dv.paragraph(`**${formatDate(e.date, true)}** ${e.icon} ${link}${sep}${text}`);
  }
}
