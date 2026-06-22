// Family tree — renders the current person's kin as a clickable, tiered tree.
// Reads these frontmatter fields (wikilinks, single or list):
//   father, mother, spouse, partner, children, siblings, aunts, uncles,
//   nieces, nephews, cousins
//
// Children are attributed to the correct co-parent when known: for each child,
// it reads that child note's own father/mother and, if the "other parent" is
// one of this person's spouses/partners, the child is shown under that pairing.
// So a child by a partner (rather than the spouse) appears under the partner.
// If a child's parentage isn't recorded, it falls into a plain children row.
//
// Usage (already in the Person template):
//   await dv.view("Vault Settings/scripts/family-tree");
// Dependency-free; renders nothing if no kin are set.

if (dv.container.closest('.markdown-source-view')) return; // render only in Reading view (prevents footnote/edit scroll-jump)
dv.container.classList.add('measured-view'); // align to the prose reading measure
const p = dv.current();
const asArr = (v) => v == null ? [] : (Array.isArray(v) ? v : [v]);

function resolveItem(item) {
  if (item && typeof item === 'object' && item.path) {
    return { name: item.display || item.path.split('/').pop().replace(/\.md$/, ''), path: item.path };
  }
  const s = String(item ?? '').trim().replace(/^"+|"+$/g, '');
  const m = s.match(/^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/);
  if (m) return { name: m[2] || m[1].split('/').pop().replace(/\.md$/, ''), path: m[1] };
  return { name: s, path: s };
}
const items = (key) => asArr(p[key]).map(resolveItem).filter((x) => x.name);

const parents  = [...items('father'), ...items('mother')];
const spouses  = items('spouse');
const partners = items('partner');
const children = items('children');
const coParents = [
  ...spouses.map((x) => ({ ...x, kind: 'spouse' })),
  ...partners.map((x) => ({ ...x, kind: 'partner' })),
];
const extendedGroups = [
  ['Siblings', items('siblings')],
  ['Aunts & uncles', [...items('aunts'), ...items('uncles')]],
  ['Nieces & nephews', [...items('nieces'), ...items('nephews')]],
  ['Cousins', items('cousins')],
];
const hasExtended = extendedGroups.some((g) => g[1].length);

if (parents.length || coParents.length || children.length || hasExtended) {
  // identity of the current person, used to find each child's *other* parent
  const selfKeys = new Set([
    p.file.name, p.file.path, p.file.path.replace(/\.md$/, ''),
    p.name ? String(p.name) : null,
  ].filter(Boolean));

  function otherParentOf(child) {
    let page = null;
    try { page = dv.page(child.path); } catch (e) { page = null; }
    if (!page) return null;
    const ps = [...asArr(page.father), ...asArr(page.mother)]
      .map(resolveItem)
      .filter((x) => x.name && !selfKeys.has(x.name) && !selfKeys.has(x.path));
    return ps[0] || null;
  }

  // group children under whichever co-parent is their other parent
  const groupKids = new Map();
  for (const cp of coParents) groupKids.set(cp.name, []);
  const ungrouped = [];
  for (const ch of children) {
    const op = otherParentOf(ch);
    const cp = op && coParents.find((c) => c.name === op.name || c.path === op.path || c.name === op.path);
    if (cp) groupKids.get(cp.name).push(ch);
    else ungrouped.push(ch);
  }

  const wrap = dv.container.createEl('div');
  wrap.style.cssText = 'margin:0.4rem 0 1rem;';

  const chip = (rowEl, text, path, isSelf) => {
    const c = rowEl.createEl('span');
    c.textContent = text;
    c.style.cssText =
      'display:inline-block;padding:0.22rem 0.7rem;border-radius:14px;font-size:0.82rem;' +
      'border:1px solid var(--background-modifier-border);background:var(--background-secondary);';
    if (isSelf) {
      c.style.fontWeight = '600';
      c.style.borderColor = 'var(--interactive-accent)';
      c.style.background = 'var(--background-modifier-hover)';
    } else {
      c.style.cursor = 'pointer';
      c.style.color = 'var(--link-color)';
      c.addEventListener('click', () => app.workspace.openLinkText(path, '', false));
      c.addEventListener('mouseenter', () => { c.style.background = 'var(--background-modifier-hover)'; });
      c.addEventListener('mouseleave', () => { c.style.background = 'var(--background-secondary)'; });
    }
    return c;
  };
  const connector = () => {
    const line = wrap.createEl('div');
    line.style.cssText = 'width:2px;height:14px;background:var(--background-modifier-border);margin:0.15rem auto;';
  };
  const row = () => {
    const r = wrap.createEl('div');
    r.style.cssText = 'display:flex;justify-content:center;gap:0.5rem;flex-wrap:wrap;align-items:center;';
    return r;
  };
  const caption = (text) => {
    const l = wrap.createEl('div');
    l.textContent = text;
    l.style.cssText = 'text-align:center;font-size:0.62rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);margin:0.5rem 0 0.15rem;';
  };
  const kidsRow = (kids) => { const r = row(); for (const ch of kids) chip(r, ch.name, ch.path, false); };

  // Parents
  if (parents.length) {
    const r = row();
    for (const par of parents) chip(r, par.name, par.path, false);
    connector();
  }

  // Subject + co-parents (spouses, then partners tagged "partner")
  const subjectRow = row();
  chip(subjectRow, p.name || dv.current().file.name, null, true);
  for (const cp of coParents) {
    const sep = subjectRow.createEl('span');
    sep.textContent = '+';
    sep.style.cssText = 'color:var(--text-muted);font-size:0.85rem;';
    chip(subjectRow, cp.name, cp.path, false);
    if (cp.kind === 'partner') {
      const tag = subjectRow.createEl('span');
      tag.textContent = 'partner';
      tag.style.cssText = 'font-size:0.58rem;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-muted);';
    }
  }

  // Children — grouped by co-parent when their parentage is recorded
  const grouped = coParents
    .map((cp) => ({ cp, kids: groupKids.get(cp.name) }))
    .filter((g) => g.kids.length);
  for (const g of grouped) {
    connector();
    caption('children with ' + g.cp.name);
    kidsRow(g.kids);
  }
  if (ungrouped.length) {
    connector();
    if (grouped.length) caption('other children');
    kidsRow(ungrouped);
  }

  // Extended kin
  for (const [lbl, members] of extendedGroups) {
    if (!members.length) continue;
    caption(lbl);
    kidsRow(members);
  }
}
