// Shared table-of-contents renderer.
// Usage (inside a callout or plain dataviewjs block):
//   await dv.view("Vault Settings/scripts/toc");
// Reads the current note's H2/H3 headings (outside code fences) and
// renders them as indented anchor links.
const src = await dv.io.load(dv.current().file.path);
let inCodeFence = false;
const items = [];
for (const line of src.split("\n")) {
  if (/^```/.test(line)) { inCodeFence = !inCodeFence; continue; }
  if (inCodeFence) continue;
  const match = line.match(/^(#{2,3})\s+(.*)$/);
  if (!match) continue;
  const clean = match[2]
    .replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, "$1")
    .replace(/[`*_]/g, "")
    .trim();
  items.push("    ".repeat(match[1].length - 2) + `- [[#${clean}|${clean}]]`);
}
dv.paragraph(items.length ? items.join("\n") : "*No sections yet.*");
