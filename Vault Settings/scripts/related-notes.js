// Grouped, colour-coded chips of notes linking here (supersedes older per-type variants; also fixes 14 truncated copies).
// Shared dataviewjs view — single source of truth for all notes of this type.
dv.container.classList.add('measured-view'); // align to the prose reading measure
const MAX = 12;
if (!globalThis.VaultTheme) await dv.view("Vault Settings/scripts/_theme");
const T = globalThis.VaultTheme;
const GROUPS = [
  { name: 'People',        colour: T.type('person'),       test: p => p.includes('/People/') },
  { name: 'Concepts',      colour: T.type('concept'),      test: p => p.includes('/Concepts/') },
  { name: 'Events',        colour: T.type('event'),        test: p => p.includes('/Events/') },
  { name: 'Organisations', colour: T.type('organisation'), test: p => p.includes('/Organisations/') },
  { name: 'Locations',     colour: T.type('location'),     test: p => p.includes('/Locations/') },
  { name: 'Publications',  colour: T.type('publication'),  test: p => p.includes('/Publications/') },
  { name: 'Writing',       colour: T.type('writing'),      test: p => p.includes('Writing Projects/') },
  { name: 'Other',         colour: T.type('other'),        test: () => true },
];
const EXCLUDE = ['Templates','Database','Network Map','Home','Project Bibliography','Event Timeline','Organisations Database'];
const inlinks = dv.current().file.inlinks.filter(l => !EXCLUDE.some(x => l.path.includes(x))).array();
if (inlinks.length === 0) {
  dv.paragraph('*No notes link here yet.*');
} else {
  const remaining = [...inlinks];
  const wrap = dv.container.createEl('div'); wrap.style.cssText = 'margin:0.4rem 0;';
  for (const group of GROUPS) {
    const matched = remaining.filter(l => group.test(l.path));
    if (!matched.length) continue;
    matched.forEach(l => { const i = remaining.indexOf(l); if (i > -1) remaining.splice(i, 1); });
    const sec = wrap.createEl('div'); sec.style.cssText = 'margin-bottom:0.65rem;';
    const lbl = sec.createEl('div'); lbl.style.cssText = `font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.09em;color:${group.colour};margin-bottom:0.3rem;`; lbl.textContent = group.name;
    const cw = sec.createEl('div'); cw.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.3rem;';
    const makeChip = (link) => {
      const chip = cw.createEl('span');
      chip.style.cssText = `font-size:0.73rem;background:${group.colour}18;border:1px solid ${group.colour}55;border-radius:12px;padding:0.18rem 0.55rem;color:${group.colour};cursor:pointer;transition:background 0.1s;white-space:nowrap;`;
      chip.textContent = link.path.split('/').pop().replace('.md','');
      chip.addEventListener('mouseenter', () => chip.style.background = group.colour + '30');
      chip.addEventListener('mouseleave', () => chip.style.background = group.colour + '18');
      chip.addEventListener('click', () => app.workspace.openLinkText(link.path, '', false));
    };
    matched.slice(0, MAX).forEach(makeChip);
    if (matched.length > MAX) {
      const more = cw.createEl('span');
      more.style.cssText = `font-size:0.73rem;color:${group.colour};cursor:pointer;padding:0.18rem 0.4rem;opacity:0.65;border-radius:12px;border:1px dashed ${group.colour}55;`;
      more.textContent = `+${matched.length - MAX} more`;
      more.addEventListener('click', () => { more.remove(); matched.slice(MAX).forEach(makeChip); });
    }
  }
}
