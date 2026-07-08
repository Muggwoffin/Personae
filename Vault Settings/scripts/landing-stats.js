// Landing stats — the "where does my research stand?" strip on the home page.
// Renders with the .landing-stats-bar / .landing-stat classes that landing.css
// already styles. A stat becomes clickable when its dashboard note exists.
// Usage (on the landing page, right under the hero):
//   await dv.view("Vault Settings/scripts/landing-stats");

const pages = dv.pages('').where(p => !p.file.path.includes("Templates"));

// Open research leads (#lead tasks: unticked, not dead ends)
const leads = pages.file.tasks
  .where(t => t.tags.some(x => x.startsWith("#lead")) && !t.completed && !t.tags.includes("#lead/dead"))
  .length;

// Unconsulted archival documents
const unconsulted = pages.where(p =>
  (p.type === "archival_source" || p.type === "archival_correspondence") && p.consulted !== true).length;

// Days until the next writing deadline (unpublished projects only)
const today = new Date(); today.setHours(0, 0, 0, 0);
let nextDl = null;
for (const p of pages.where(p => p.type === "writing_project" && p.deadline && p.status !== "published")) {
  const dl = new Date(String(p.deadline).split("T")[0] + "T00:00:00");
  if (isNaN(dl.getTime()) || dl < today) continue;
  if (!nextDl || dl < nextDl) nextDl = dl;
}
const days = nextDl ? Math.round((nextDl - today) / 86400000) : null;

// People with no curated sources: yet
const unsourced = pages.where(p => p.type === "person" &&
  (!p.sources || (Array.isArray(p.sources) ? p.sources.length === 0 : !String(p.sources).trim()))).length;

// Notes touched in the last 7 days (update-time-on-edit maintains updated:)
const cutoff = Date.now() - 7 * 86400000;
const touched = pages.where(p => { const u = p.updated ? dv.date(p.updated) : null; return u && u.toMillis() > cutoff; }).length;

const bar = dv.container.createEl("div");
bar.className = "landing-stats-bar";
const stat = (num, label, target) => {
  const dest = target ? app.metadataCache.getFirstLinkpathDest(target, "") : null;
  const el = bar.createEl(dest ? "a" : "div");
  el.className = "landing-stat" + (dest ? " internal-link" : "");
  if (dest) el.addEventListener("click", (e) => { e.preventDefault(); app.workspace.openLinkText(target, "", false); });
  el.createEl("span", { cls: "landing-stat-number", text: String(num) });
  el.createEl("span", { cls: "landing-stat-label", text: label });
};
stat(leads, "open leads", "Research Leads");
stat(unconsulted, "unconsulted docs", "Archive Trip Planner");
stat(days === null ? "—" : days + "d", days === null ? "no deadlines" : "to next deadline", "Writing Dashboard");
stat(unsourced, "people unsourced", "People Database");
stat(touched, "notes touched · 7 days", null);
