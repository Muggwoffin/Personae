// Archive Trip Planner — what to consult at each archive.
// Section 1: archival_source notes grouped by archive, unconsulted first.
// Section 2: people grouped by archive_location (research targets).
const docs = dv.pages().where(p => p.type === "archival_source" && !p.file.path.includes("Templates")).array();
const byArchive = {};
for (const d of docs) {
  const a = d.archive ? String(d.archive) : "(archive not set)";
  (byArchive[a] = byArchive[a] || []).push(d);
}
dv.header(2, "Documents by archive");
if (!docs.length) {
  dv.paragraph("*No archival source notes yet — create them with the Archival Source Template. Set `consulted: true` once you've seen a document.*");
}
for (const [archive, items] of Object.entries(byArchive).sort()) {
  const todo = items.filter(d => d.consulted !== true);
  const done = items.filter(d => d.consulted === true);
  dv.header(3, `${archive} — ${todo.length} to consult, ${done.length} consulted`);
  if (todo.length) {
    dv.table(["Document", "Collection", "Box / folder", "Type"],
      todo.map(d => [d.file.link, d.collection ?? "", d.box_or_folder ?? "", d.document_type ?? ""]));
  }
  if (done.length) {
    dv.paragraph("Consulted: " + done.map(d => String(d.file.link)).join(" · "));
  }
}
dv.header(2, "People by archive");
dv.paragraph("*From the `archive_location` field on person notes — who to research where.*");
const people = dv.pages().where(p => p.type === "person" && p.archive_location && !p.file.path.includes("Templates")).array();
const peopleBy = {};
for (const p of people) {
  for (const raw of (Array.isArray(p.archive_location) ? p.archive_location : [p.archive_location])) {
    const key = String(raw).replace(/^https?:\/\/[^ ]+$/, "(online only)").trim();
    (peopleBy[key] = peopleBy[key] || []).push(p);
  }
}
for (const [arch, ps] of Object.entries(peopleBy).sort((a, b) => b[1].length - a[1].length)) {
  dv.paragraph(`**${arch}** (${ps.length}): ` + ps.map(p => String(p.file.link)).join(", "));
}
const noArchive = dv.pages().where(p => p.type === "person" && !p.archive_location && !p.file.path.includes("Templates")).array();
if (noArchive.length) {
  dv.paragraph(`*No archive recorded for ${noArchive.length} people: * ` + noArchive.slice(0, 30).map(p => String(p.file.link)).join(", ") + (noArchive.length > 30 ? " …" : ""));
}
