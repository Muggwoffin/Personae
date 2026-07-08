// Pseudonym registry — every alias recorded on a person note, flattened into
// one alphabetical alias → person lookup table, so an unfamiliar name in an
// archival document can be checked against known cover names, pen names and
// name variants in a single place. Reads the aliases: frontmatter field;
// aliases identical to the person's display name (or filename) are omitted.
// Usage: await dv.view("Vault Settings/scripts/pseudonym-registry");
const people = dv.pages().where(p => p.type === "person" && !p.file.path.includes("Templates")).array();
const rows = [];
for (const p of people) {
  const display = p.name ? String(p.name).trim() : p.file.name;
  const aliases = p.file.aliases ? p.file.aliases.array() : [];
  for (const a of aliases) {
    const alias = String(a).trim();
    if (!alias) continue;
    if (alias.toLowerCase() === display.toLowerCase() || alias.toLowerCase() === p.file.name.toLowerCase()) continue;
    rows.push([alias, p]);
  }
}
rows.sort((x, y) => x[0].localeCompare(y[0]));
const withAliases = new Set(rows.map(r => r[1].file.path)).size;
dv.paragraph(`**${rows.length} aliases** across ${withAliases} of ${people.length} people. Add more via the \`aliases:\` field on any person note.`);
if (rows.length) {
  dv.table(["Alias", "Person", "Role"], rows.map(([alias, p]) => [`**${alias}**`, p.file.link, p.role ? String(p.role) : ""]));
}
