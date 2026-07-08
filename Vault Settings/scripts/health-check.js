// Vault health check — verifies plugins, scripts, and styling are in place.
const REQUIRED_PLUGINS = [
  ["dataview", "Dataview", "powers every database, dashboard, and infobox"],
  ["templater-obsidian", "Templater", "powers note templates and prompts"],
  ["obsidian-leaflet-plugin", "Leaflet", "renders the maps"],
  ["obsidian-meta-bind-plugin", "Meta Bind", "powers the quick-create buttons"],
  ["obsidian-git", "Git", "backup, sync, and attribution history"],
  ["caption-on-paste", "Caption on Paste", "image caption prompts"],
  ["note-attribution", "Note Attribution", "who-wrote-what line markers"],
  ["research-tools", "Research Tools", "paste-coordinates commands"],
];
const SCRIPTS = ["toc", "person-infobox", "org-infobox", "event-infobox", "location-infobox",
  "publication-infobox", "person-sources", "related-notes", "master-timeline", "health-check",
  "person-timeline", "landing-stats", "pseudonym-registry"];

const rows = [];
const enabled = app.plugins.enabledPlugins;
for (const [id, name, why] of REQUIRED_PLUGINS) {
  rows.push([enabled.has(id) ? "✅" : "❌", name, enabled.has(id) ? why : `**enable in Settings → Community plugins** — ${why}`]);
}
const missing = SCRIPTS.filter(s => !app.vault.getAbstractFileByPath(`Vault Settings/scripts/${s}.js`));
rows.push([missing.length === 0 ? "✅" : "❌", "Shared scripts",
  missing.length === 0 ? `all ${SCRIPTS.length} present in Vault Settings/scripts/` : `missing: ${missing.join(", ")}`]);
let snippetOn = false;
try { snippetOn = app.customCss.enabledSnippets.has("readability"); } catch (e) {}
rows.push([snippetOn ? "✅" : "⚠️", "Readability snippet",
  snippetOn ? "enabled" : "enable in Settings → Appearance → CSS snippets → readability"]);
let dailyOk = false;
try { const ds = app.vault.getConfig ? app.vault.getConfig("attachmentFolderPath") : null; dailyOk = !!ds; } catch (e) {}
rows.push([dailyOk ? "✅" : "⚠️", "Attachment folder", dailyOk ? String(app.vault.getConfig("attachmentFolderPath")) : "not set (Settings → Files & links)"]);

const bad = rows.filter(r => r[0] !== "✅").length;
dv.paragraph(bad === 0 ? "**All systems go.** Everything the vault depends on is in place." : `**${bad} item(s) need attention** — see below.`);
dv.table(["", "Component", "Status"], rows);
