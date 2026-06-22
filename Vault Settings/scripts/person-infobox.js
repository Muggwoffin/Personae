// Person infobox — photo, vital dates, links. Usage: await dv.view("Vault Settings/scripts/person-infobox");
// Shared dataviewjs view — single source of truth for all notes of this type.
if (dv.container.closest('.markdown-source-view')) return; // render only in Reading view (prevents footnote/edit scroll-jump)
const SILHOUETTE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"><rect width="100" height="120" fill="#F5EDED"/><circle cx="50" cy="40" r="23" fill="#D4B0B0"/><path d="M4,120 C4,78 22,63 50,63 C78,63 96,78 96,120Z" fill="#D4B0B0"/></svg>')}`;
const p = dv.current();
const name = p.name || p.file.name;
let photoPath = p.photo ? String(p.photo).split('|')[0].trim() : '';
if (!photoPath || /\/\.jpg$/.test(photoPath)) photoPath = p.name ? `Attachments/Images/${p.name}.jpg` : '';
const imageFile = photoPath ? app.vault.getAbstractFileByPath(photoPath) : null;
const imgSrc = imageFile ? app.vault.adapter.getResourcePath(photoPath) : SILHOUETTE;

const wrap = dv.container.createEl('div');
wrap.style.cssText = 'display:flex;gap:1.2rem;padding:1rem 1.2rem;background:#FDFAFA;border:1px solid #D9B2B2;border-left:4px solid #C4686B;border-radius:0 7px 7px 0;margin-bottom:1.2rem;align-items:flex-start;';
wrap.className = 'note-infobox';

const imgWrap = wrap.createEl('div'); imgWrap.style.cssText = 'flex-shrink:0;';
const img = imgWrap.createEl('img');
img.src = imgSrc;
img.style.cssText = 'width:110px;height:140px;object-fit:cover;object-position:top;border-radius:5px;display:block;border:1px solid #D9B2B2;';
img.onerror = () => { img.src = SILHOUETTE; };

const facts = wrap.createEl('div'); facts.style.cssText = 'flex:1;min-width:0;';
const nameEl = facts.createEl('div'); nameEl.style.cssText = 'font-size:1.05rem;font-weight:700;color:#8C3335;margin-bottom:0.2rem;'; nameEl.textContent = name;
const sub = [p.role, p.nationality].filter(Boolean).map(String);
if (sub.length) { const s = facts.createEl('div'); s.style.cssText = 'font-size:0.78rem;color:#A07060;margin-bottom:0.55rem;font-style:italic;'; s.textContent = sub.join(' · '); }

if (!globalThis.VaultDates) await dv.view("Vault Settings/scripts/_dates");
if (!globalThis.VaultInfobox) await dv.view("Vault Settings/scripts/_infobox");
const { formatDate } = globalThis.VaultDates;
const { factRow, linkRow } = globalThis.VaultInfobox.rows(facts, app, { label: '#A07060', link: '#5A7A9E', linkHover: '#3A5A7E' });

const born = [formatDate(p.birth_date), p.place_of_birth].filter(Boolean).join(', ');
const died = [formatDate(p.death_date), p.place_of_death].filter(Boolean).join(', ');
if (born) factRow('Born', born);
if (died) factRow('Died', died);
const affRaw = p.affiliations ? (Array.isArray(p.affiliations) ? p.affiliations : [p.affiliations]) : [];
if (affRaw.length) linkRow('Affiliations', affRaw);
if (p.archive_location) factRow('Archive', String(p.archive_location));
if (p.Locations) linkRow('Locations', Array.isArray(p.Locations) ? p.Locations : [p.Locations]);
