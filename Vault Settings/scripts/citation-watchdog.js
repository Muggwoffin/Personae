// Citation watchdog — citekeys cited somewhere in the vault that have
// no source record yet in Zotero/Highlights/. Each needs one action in
// Zotero: select the item → export menu → "Create Source Record".
const CITEKEY = /^[a-z][a-z-]*[A-Z][a-zA-Z-]*\d{4}[a-z]?$/;
const unresolved = app.metadataCache.unresolvedLinks;
const hits = {};
for (const [src, links] of Object.entries(unresolved)) {
  if (src.startsWith("Zotero/") || src.includes("Templates")) continue;
  for (const target of Object.keys(links)) {
    const base = target.split("/").pop().split("#")[0];
    if (CITEKEY.test(base)) (hits[base] = hits[base] || new Set()).add(src);
  }
}
const keys = Object.keys(hits).sort();
if (!keys.length) {
  dv.paragraph("*Every citekey cited in the vault has a source record. Nothing to do.*");
} else {
  dv.paragraph(`**${keys.length} citekey(s) are cited but have no source record yet** — their links render as unresolved (faded, dashed). Fix in Zotero: select the item → export menu (paper icon) → **Create Source Record**. The links heal automatically.`);
  dv.table(["Citekey", "Cited in"],
    keys.map(k => [k, [...hits[k]].map(p => dv.fileLink(p)).join(", ")]));
}
