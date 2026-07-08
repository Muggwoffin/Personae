// Master timeline — gathers every dated thing in the vault into one chronology:
//   • event notes (date:)                          📅
//   • person births/deaths (birth_date/death_date) 👶 ✝️
//   • organisations (founded_date/dissolved_date)  🏛️ ⚰️
//   • inline micro-events written in ANY note:     🕑
//       [event:: 1937-07-16 | Buchenwald concentration camp opens]
//     (date can be YYYY, YYYY-MM, or YYYY-MM-DD; text after the |)

if (!globalThis.VaultDates) await dv.view("Vault Settings/scripts/_dates");
const { parseDate, formatDate } = globalThis.VaultDates;

const notTemplate = (p) => !p.file.path.includes("Templates");
const pages = dv.pages('');   // scan the vault once; reuse for every pass below
let allEntries = [];

// 1. Event notes
for (const event of pages.where(p => (p.type === "event" || p.date) && notTemplate(p))) {
  if (!event.date) continue;
  allEntries.push({ date: event.date, sortDate: parseDate(event.date), type: "event",
    name: event.file.name, description: event.description || "", link: event.file.path, icon: "📅" });
}

// 2. People — births and deaths
for (const person of pages.where(p => p.type === "person" && notTemplate(p))) {
  if (person.birth_date) allEntries.push({ date: person.birth_date, sortDate: parseDate(person.birth_date),
    type: "birth", name: person.file.name,
    description: `Born${person.place_of_birth ? ' in ' + person.place_of_birth : ''}`,
    link: person.file.path, icon: "👶" });
  if (person.death_date) allEntries.push({ date: person.death_date, sortDate: parseDate(person.death_date),
    type: "death", name: person.file.name,
    description: `Died${person.place_of_death ? ' in ' + person.place_of_death : ''}`,
    link: person.file.path, icon: "✝️" });
}

// 3. Organisations — founded and dissolved
for (const org of pages.where(o => o.type === "organisation" && notTemplate(o))) {
  if (org.founded_date) allEntries.push({ date: org.founded_date, sortDate: parseDate(org.founded_date),
    type: "founded", name: org.file.name,
    description: `Founded${org.founded_location ? ' in ' + org.founded_location : ''}${org.ideology ? ' (' + org.ideology + ')' : ''}`,
    link: org.file.path, icon: "🏛️" });
  if (org.dissolved_date) allEntries.push({ date: org.dissolved_date, sortDate: parseDate(org.dissolved_date),
    type: "dissolved", name: org.file.name, description: "Dissolved", link: org.file.path, icon: "⚰️" });
}

// 4. Inline micro-events from any note: [event:: DATE | text]
for (const page of pages.where(p => p.event && notTemplate(p))) {
  const evs = Array.isArray(page.event) ? page.event : [page.event];
  for (const raw of evs) {
    const m = String(raw).match(/^\s*([~<>]?\s*\d{4}(?:-\d{2})?(?:-\d{2})?(?:\s*(?:\.\.|–)\s*\d{4}(?:-\d{2})?(?:-\d{2})?)?)\s*[|]\s*(.+)$/);
    if (!m) continue;
    allEntries.push({ date: m[1], sortDate: parseDate(m[1]), type: "inline",
      name: m[2].trim(), description: `in ${page.file.name}`, link: page.file.path, icon: "🕑" });
  }
}


// 5. Date pills created via right-click -> "Create event":
//    <span class="hist-event" data-date="1936-07-11" title="met Rene">11 July 1936</span>
const SPAN_RE = /<span class="hist-event" data-date="([^"]+)"(?:\s+title="([^"]*)")?>([^<]*)<\/span>/g;
for (const page of pages.where(p => p.file.ext === "md" && notTemplate(p) && !p.file.path.startsWith("Vault Settings/"))) {
  let raw;
  try { raw = await dv.io.load(page.file.path); } catch (e) { continue; }
  if (!raw.includes('class="hist-event"')) continue;
  let m;
  while ((m = SPAN_RE.exec(raw)) !== null) {
    const desc = (m[2] || m[3] || "").replace(/&quot;/g, '"');
    allEntries.push({ date: m[1], sortDate: parseDate(m[1]), type: "inline",
      name: desc, description: "in " + page.file.name, link: page.file.path, icon: "\u{1F552}" });
  }
}

allEntries = allEntries.filter(e => e.sortDate !== null).sort((a, b) => a.sortDate - b.sortDate);

if (allEntries.length === 0) {
  dv.paragraph("*No timeline entries found.*");
} else {
  const count = (t) => allEntries.filter(e => e.type === t).length;
  dv.paragraph(`**${allEntries.length} total entries** | 📅 ${count("event")} Events | 🕑 ${count("inline")} Inline | 👶 ${count("birth")} Births | ✝️ ${count("death")} Deaths | 🏛️ ${count("founded")} Founded | ⚰️ ${count("dissolved")} Dissolved\n`);

  const entriesByYear = {};
  for (const entry of allEntries) {
    const year = entry.sortDate.getFullYear();
    (entriesByYear[year] = entriesByYear[year] || []).push(entry);
  }
  const typePriority = { event: 1, inline: 2, founded: 3, dissolved: 4, birth: 5, death: 6 };
  for (const year of Object.keys(entriesByYear).sort()) {
    dv.header(2, year);
    const yearEntries = entriesByYear[year].sort((a, b) =>
      (a.sortDate - b.sortDate) || (typePriority[a.type] - typePriority[b.type]));
    for (const entry of yearEntries) {
      const link = dv.fileLink(entry.link, false, entry.name);
      const desc = entry.description ? ` — *${entry.description}*` : "";
      dv.paragraph(`**${formatDate(entry.date, true)}** ${entry.icon} ${link}${desc}\n`);
    }
  }
}
