// Organisation infobox.
// Shared dataviewjs view — single source of truth for all notes of this type.
const SILHOUETTE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80"><rect width="100" height="80" fill="#EDF2F8"/><rect x="30" y="20" width="40" height="30" rx="4" fill="#B2C4D9"/><rect x="10" y="50" width="80" height="20" rx="3" fill="#B2C4D9"/></svg>')}`;
const p = dv.current();
const name = p.name || p.file.name;
let photoPath = p.photo ? String(p.photo).split('|')[0].trim() : '';
if (!photoPath) photoPath = p.name ? `Attachments/Images/${p.name}.jpg` : '';
const imageFile = photoPath ? app.vault.getAbstractFileByPath(photoPath) : null;
const imgSrc = imageFile ? app.vault.adapter.getResourcePath(photoPath) : SILHOUETTE;
const wrap = dv.container.createEl('div');
wrap.style.cssText = 'display:flex;gap:1.2rem;padding:1rem 1.2rem;background:#F5F8FD;border:1px solid #B2C4D9;border-left:4px solid #5A7A9E;border-radius:0 7px 7px 0;margin-bottom:1.2rem;align-items:flex-start;';
wrap.className = 'note-infobox';
const imgWrap = wrap.createEl('div'); imgWrap.style.cssText = 'flex-shrink:0;';
const img = imgWrap.createEl('img'); img.src = imgSrc;
img.style.cssText = 'width:80px;height:80px;object-fit:cover;object-position:center;border-radius:5px;display:block;border:1px solid #B2C4D9;';
img.onerror = () => { img.src = SILHOUETTE; };
const facts = wrap.createEl('div'); facts.style.cssText = 'flex:1;min-width:0;';
const nameEl = facts.createEl('div'); nameEl.style.cssText = 'font-size:1.05rem;font-weight:700;color:#3A5A7E;margin-bottom:0.2rem;'; nameEl.textContent = name;
const sub = [p.org_type, p.country].filter(Boolean).map(String);
if (sub.length) { const s = facts.createEl('div'); s.style.cssText = 'font-size:0.78rem;color:#607890;margin-bottom:0.55rem;font-style:italic;'; s.textContent = sub.join(' · '); }
if (!globalThis.VaultDates) await dv.view("Vault Settings/scripts/_dates");
if (!globalThis.VaultInfobox) await dv.view("Vault Settings/scripts/_infobox");
const { formatDate } = globalThis.VaultDates;
const { factRow, linkRow } = globalThis.VaultInfobox.rows(facts, app, { label: '#607890', link: '#5A7A9E', linkHover: '#3A5A7E' });
const founded=[formatDate(p.founded_date),p.founded_location?String(p.founded_location):null].filter(Boolean).join(', ');
const dissolved=formatDate(p.dissolved_date);
if(founded)factRow('Founded',founded);
if(dissolved)factRow('Dissolved',dissolved);
if(p.ideology)factRow('Ideology',String(p.ideology));
if(p.orientation)factRow('Orientation',String(p.orientation));
if(p.founders)linkRow('Founders',Array.isArray(p.founders)?p.founders:[p.founders]);
if(p.Locations)linkRow('Locations',Array.isArray(p.Locations)?p.Locations:[p.Locations]);
if(p.parent_org)linkRow('Parent org',Array.isArray(p.parent_org)?p.parent_org:[p.parent_org]);
if(p.umbrella_orgs)linkRow('Umbrella',Array.isArray(p.umbrella_orgs)?p.umbrella_orgs:[p.umbrella_orgs]);
if(p.affiliated_orgs)linkRow('Affiliated',Array.isArray(p.affiliated_orgs)?p.affiliated_orgs:[p.affiliated_orgs]);
if(p.successor_orgs)linkRow('Successors',Array.isArray(p.successor_orgs)?p.successor_orgs:[p.successor_orgs]);
if(p.related_people)linkRow('Key people',Array.isArray(p.related_people)?p.related_people:[p.related_people]);
if(p.size_estimate)factRow('Est. size',String(p.size_estimate));
if(p.archive_location)factRow('Archive',String(p.archive_location));
