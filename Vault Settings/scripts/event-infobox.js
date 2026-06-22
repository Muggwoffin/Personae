// Event infobox.
// Shared dataviewjs view — single source of truth for all notes of this type.
const p = dv.current();
const name = p.name || p.file.name;
const wrap = dv.container.createEl('div');
wrap.style.cssText = 'display:flex;gap:1.2rem;padding:1rem 1.2rem;background:#FDFAF5;border:1px solid #D9C4A0;border-left:4px solid #C4823B;border-radius:0 7px 7px 0;margin-bottom:1.2rem;align-items:flex-start;';
wrap.className = 'note-infobox';
const facts = wrap.createEl('div'); facts.style.cssText = 'flex:1;min-width:0;';
const nameEl = facts.createEl('div'); nameEl.style.cssText = 'font-size:1.05rem;font-weight:700;color:#8C5020;margin-bottom:0.2rem;'; nameEl.textContent = name;
if (p.description) { const d = facts.createEl('div'); d.style.cssText = 'font-size:0.78rem;color:#A08060;margin-bottom:0.55rem;font-style:italic;'; d.textContent = String(p.description); }
if (!globalThis.VaultDates) await dv.view("Vault Settings/scripts/_dates");
if (!globalThis.VaultInfobox) await dv.view("Vault Settings/scripts/_infobox");
const { formatDate } = globalThis.VaultDates;
const { factRow, linkRow } = globalThis.VaultInfobox.rows(facts, app, { label: '#A08060', link: '#C4823B', linkHover: '#8C5020' });
const start=formatDate(p.date),end=formatDate(p.date_end);
const dateStr=start&&end?`${start} – ${end}`:(start||null);
if(dateStr)factRow('Date',dateStr);
if(p.location)linkRow('Location',Array.isArray(p.location)?p.location:[p.location]);
if(p.related_people)linkRow('People',Array.isArray(p.related_people)?p.related_people:[p.related_people]);
if(p.related_organisations)linkRow('Organisations',Array.isArray(p.related_organisations)?p.related_organisations:[p.related_organisations]);
if(p.related_events)linkRow('Related events',Array.isArray(p.related_events)?p.related_events:[p.related_events]);
