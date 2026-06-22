// Publication infobox.
// Shared dataviewjs view — single source of truth for all notes of this type.
const p = dv.current();
const name = p.name || p.file.name;
const wrap = dv.container.createEl('div');
wrap.style.cssText = 'display:flex;gap:1.2rem;padding:1rem 1.2rem;background:#F8F5FD;border:1px solid #C4B2D9;border-left:4px solid #7A609E;border-radius:0 7px 7px 0;margin-bottom:1.2rem;align-items:flex-start;';
wrap.className = 'note-infobox';
const facts = wrap.createEl('div'); facts.style.cssText = 'flex:1;min-width:0;';
const nameEl = facts.createEl('div'); nameEl.style.cssText = 'font-size:1.05rem;font-weight:700;color:#5A3A7E;margin-bottom:0.2rem;'; nameEl.textContent = name;
const sub = [p.publication_type, p.language].filter(Boolean).map(String);
if (sub.length) { const s = facts.createEl('div'); s.style.cssText = 'font-size:0.78rem;color:#806090;margin-bottom:0.55rem;font-style:italic;'; s.textContent = sub.join(' · '); }
if (!globalThis.VaultDates) await dv.view("Vault Settings/scripts/_dates");
if (!globalThis.VaultInfobox) await dv.view("Vault Settings/scripts/_infobox");
const { formatDate } = globalThis.VaultDates;
const { factRow, linkRow } = globalThis.VaultInfobox.rows(facts, app, { label: '#806090', link: '#7A609E', linkHover: '#5A3A7E' });
const from=formatDate(p.active_from),to=formatDate(p.active_to);
const activeStr=from&&to?`${from} – ${to}`:(from||null);
if(activeStr)factRow('Active',activeStr);
if(p.frequency)factRow('Frequency',String(p.frequency));
if(p.publisher)linkRow('Publisher',Array.isArray(p.publisher)?p.publisher:[p.publisher]);
if(p.editor)linkRow('Editor',Array.isArray(p.editor)?p.editor:[p.editor]);
if(p.related_organisations)linkRow('Organisations',Array.isArray(p.related_organisations)?p.related_organisations:[p.related_organisations]);
if(p.related_people)linkRow('People',Array.isArray(p.related_people)?p.related_people:[p.related_people]);
if(p.archive_location)factRow('Archive',String(p.archive_location));
if(p.digitized)factRow('Digitized',String(p.digitized));
if(p.online_access)factRow('Online',String(p.online_access));
