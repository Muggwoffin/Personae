// Sources for this person — merges two origins automatically:
//   1. the curated sources: frontmatter field
//   2. every [[citekey]] cited anywhere in this note (footnotes, body)
// Shared dataviewjs view — single source of truth for all notes of this type.
if (dv.container.closest('.markdown-source-view')) return; // render only in Reading view (prevents footnote/edit scroll-jump)
dv.container.classList.add('measured-view'); // align to the prose reading measure
const p = dv.current();

// 1. curated frontmatter sources
const fromField = (p.sources ? (Array.isArray(p.sources) ? p.sources : [p.sources]) : [])
  .filter((l) => l && l.path);

// 2. citations in the note body (any outlink resolving into Zotero/Highlights/)
const fromBody = p.file.outlinks
  .filter((l) => String(l.path).startsWith("Zotero/Highlights/"))
  .array();

// union, deduped by path
const seen = new Set();
const all = [];
const fieldPaths = new Set(fromField.map((l) => l.path));
for (const link of [...fromField, ...fromBody]) {
  if (seen.has(link.path)) continue;
  seen.add(link.path);
  all.push(link);
}

if (all.length === 0) {
  dv.paragraph('*No sources yet. Cite a `[[citekey]]` in a footnote, or add one to the `sources:` field — both appear here automatically.*');
} else {
  const wrap = dv.container.createEl('div'); wrap.style.cssText = 'margin:0.3rem 0;';
  for (const link of all) {
    const src = dv.page(link.path);
    const row = wrap.createEl('div');
    row.style.cssText = 'display:flex;gap:0.6rem;align-items:baseline;padding:0.3rem 0.4rem;border-bottom:1px solid #F0E0E0;font-size:0.82rem;cursor:pointer;border-radius:3px;';
    row.addEventListener('mouseenter', () => row.style.background = '#FDF0F0');
    row.addEventListener('mouseleave', () => row.style.background = '');
    row.addEventListener('click', () => app.workspace.openLinkText(link.path, '', false));
    const arrow = row.createEl('span'); arrow.style.cssText = 'color:#C4686B;font-weight:700;flex-shrink:0;'; arrow.textContent = '↗';
    const text = row.createEl('span'); text.style.cssText = 'color:var(--text-normal);flex:1;';
    if (src && src.authors) {
      const authors = String(src.authors), year = src.year ? String(src.year) : 'n.d.', title = src.title ? String(src.title) : link.path.split('/').pop(), type = src.itemType ? String(src.itemType) : '';
      if (type === 'book') text.innerHTML = `${authors}. <em>${title}</em>. ${year}.`;
      else if (type === 'journalArticle') text.innerHTML = `${authors}. "${title}." <em>${src.journal || ''}</em> (${year}).`;
      else text.textContent = `${authors}. "${title}." ${year}.`;
    } else { text.style.color = 'var(--text-muted)'; text.textContent = link.path.split('/').pop().replace('.md',''); }
    if (!fieldPaths.has(link.path)) {
      const badge = row.createEl('span');
      badge.style.cssText = 'font-size:0.65rem;color:#A07060;border:1px solid #E0C8C8;border-radius:8px;padding:0 0.4rem;flex-shrink:0;';
      badge.textContent = 'cited in note';
    }
  }
}
