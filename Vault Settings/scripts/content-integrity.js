// Content integrity scan — catches the damage classes that have actually
// bitten this vault: footnote refs without definitions, null-byte
// corruption (sync glitches), unbalanced code fences (truncated writes),
// unclosed frontmatter, and mangled nested-list frontmatter.
// Reads every note, so allow a few seconds.

const pages = dv.pages().where(p =>
  p.file.ext === "md" &&
  !p.file.path.includes("Templates") &&
  !p.file.path.startsWith("Vault Settings/")
).array();

const findings = { footnotes: [], nulls: [], fences: [], frontmatter: [], nested: [] };

for (const page of pages) {
  let raw;
  try { raw = await dv.io.load(page.file.path); } catch (e) { continue; }

  // null bytes / control-character corruption (excluding tab, LF, CR)
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(raw)) {
    findings.nulls.push([page.file.link, "contains control/null bytes — restore from history"]);
  }

  // unbalanced top-level code fences
  const fences = (raw.match(/^```/gm) || []).length;
  if (fences % 2 !== 0) {
    findings.fences.push([page.file.link, `odd number of code fences (${fences}) — note may be truncated`]);
  }

  // unclosed frontmatter
  if (raw.startsWith("---") && raw.indexOf("\n---", 3) === -1) {
    findings.frontmatter.push([page.file.link, "frontmatter never closes"]);
  }

  // nested-list YAML artifact ("- - value")
  const fmEnd = raw.startsWith("---") ? raw.indexOf("\n---", 3) : -1;
  if (fmEnd > 0 && /^[ \t]*- - /m.test(raw.slice(0, fmEnd))) {
    findings.nested.push([page.file.link, "frontmatter list collapsed into nested arrays — re-quote the wikilinks"]);
  }

  // footnote refs vs definitions (outside code)
  const prose = raw
    .replace(/^```[\s\S]*?^```/gm, "")
    .replace(/`[^`\n]*`/g, "");
  const refs = new Set((prose.match(/\[\^(\w[\w-]*)\](?!:)/g) || []).map(s => s.slice(2, -1)));
  const defs = new Set((prose.match(/^\[\^(\w[\w-]*)\]:/gm) || []).map(s => s.slice(2, s.indexOf("]"))));
  const missing = [...refs].filter(r => !defs.has(r));
  if (missing.length) {
    findings.footnotes.push([page.file.link, "refs without definitions: " + missing.map(m => "[^" + m + "]").join(" ")]);
  }
}

const sections = [
  ["Null-byte / control-character corruption", findings.nulls, "🧨"],
  ["Unbalanced code fences", findings.fences, "✂️"],
  ["Unclosed frontmatter", findings.frontmatter, "📄"],
  ["Mangled frontmatter lists", findings.nested, "🪢"],
  ["Footnotes missing definitions", findings.footnotes, "🦶"],
];

const total = sections.reduce((s, pair) => s + pair[1].length, 0);
dv.paragraph(total === 0
  ? `**Scanned ${pages.length} notes — no integrity problems found.**`
  : `**Scanned ${pages.length} notes — ${total} finding(s) below.**`);
for (const [title, rows, icon] of sections) {
  if (!rows.length) continue;
  dv.header(3, `${icon} ${title} (${rows.length})`);
  dv.table(["Note", "Problem"], rows);
}
