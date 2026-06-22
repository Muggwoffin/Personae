// Correspondence infobox — renders an item of archival correspondence (a letter,
// telegram, etc.) as a card plus a live Chicago citation, both built from the
// SAME frontmatter. Mirrors source-infobox.js but adds author → recipient and
// the From / To places (which point at Location notes in the coordinate system).
// Usage (in the Archival Correspondence template):
//   await dv.view("Vault Settings/scripts/correspondence-infobox");
// Reads: author, recipient, author_location, recipient_location, archive,
//        collection, box_or_folder, document_reference, document_date,
//        document_type, language, related_people, related_events, url,
//        consulted, digitised.

if (dv.container.closest('.markdown-source-view')) return; // Reading view only (avoids the footnote scroll-jump)

const p = dv.current();
const name = p.name || p.file.name;
const asArr = (v) => v == null ? [] : (Array.isArray(v) ? v : [v]);

if (!globalThis.VaultInfobox) await dv.view("Vault Settings/scripts/_infobox");
if (!globalThis.VaultDates) await dv.view("Vault Settings/scripts/_dates");
const { formatDate } = globalThis.VaultDates;
const disp = (v) => globalThis.VaultInfobox.normalizeLinkItems(v).map(x => globalThis.VaultInfobox.resolveItem(x).name).join(', ');
const authorName = disp(p.author);
const recipientName = disp(p.recipient);

const wrap = dv.container.createEl('div');
wrap.style.cssText = 'padding:1rem 1.2rem;background:#F7F5FB;border:1px solid #D6CEE6;border-left:4px solid var(--type-event, #6E5AA0);border-radius:0 7px 7px 0;margin-bottom:1.2rem;';
wrap.className = 'note-infobox';

const nameEl = wrap.createEl('div');
nameEl.style.cssText = 'font-size:1.05rem;font-weight:700;color:#5E4E90;margin-bottom:0.2rem;';
nameEl.textContent = (authorName || '—') + '  →  ' + (recipientName || '—');

const sub = [p.document_type || 'Letter', p.language].filter(Boolean).map(String);
if (sub.length) {
  const s = wrap.createEl('div');
  s.style.cssText = 'font-size:0.78rem;color:#8478A8;font-style:italic;margin-bottom:0.55rem;';
  s.textContent = sub.join(' · ');
}

const facts = wrap.createEl('div');
facts.style.cssText = 'min-width:0;';
const { factRow, linkRow } = globalThis.VaultInfobox.rows(facts, app, { label: '#8478A8', link: '#6E5AA0', linkHover: '#463A6E' });

const dateStr = formatDate(p.document_date);
if (dateStr)               factRow('Date', dateStr);
if (p.author_location)     linkRow('From', asArr(p.author_location));
if (p.recipient_location)  linkRow('To', asArr(p.recipient_location));
if (p.archive)             factRow('Archive', String(p.archive));
if (p.collection)          factRow('Collection', String(p.collection));
if (p.box_or_folder)       factRow('Box / folder', String(p.box_or_folder));
if (p.document_reference)  factRow('Reference', String(p.document_reference));
if (p.related_people)      linkRow('People', asArr(p.related_people));
if (p.related_events)      linkRow('Events', asArr(p.related_events));

if (p.url) {
  const r = facts.createEl('div'); r.style.cssText = 'display:flex;gap:0.5rem;font-size:0.78rem;margin-bottom:0.18rem;line-height:1.4;';
  const l = r.createEl('span'); l.style.cssText = 'color:#8478A8;font-weight:600;min-width:76px;flex-shrink:0;'; l.textContent = 'URL';
  const a = r.createEl('a'); a.textContent = 'open ↗'; a.style.cssText = 'color:#6E5AA0;cursor:pointer;'; a.setAttr('href', String(p.url)); a.setAttr('target', '_blank');
}

if (p.consulted === true) {
  const b = facts.createEl('span');
  b.style.cssText = 'display:inline-block;margin-top:0.5rem;font-size:0.66rem;background:#6E5AA018;border:1px solid #6E5AA055;border-radius:10px;padding:0.13rem 0.5rem;color:#6E5AA0;font-weight:600;';
  b.textContent = '✓ Consulted';
}
if (p.digitised === true) {
  const b = facts.createEl('span');
  b.style.cssText = 'display:inline-block;margin-top:0.5rem;margin-left:0.35rem;font-size:0.66rem;background:#5A8A6A18;border:1px solid #5A8A6A55;border-radius:10px;padding:0.13rem 0.5rem;color:#5A8A6A;font-weight:600;';
  b.textContent = '📷 Digitised';
}

// ── Chicago citation (letter), generated from the same properties ──────────
// Note form:  Author to Recipient, date, box/folder, [ref], collection, repository.
// Bibliography form:  Collection. Repository.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
function chicagoDate(raw) {
  if (raw == null || String(raw).trim() === '') return '';
  const s = String(raw).trim();
  let m;
  if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})/))) return `${MONTHS[+m[2] - 1]} ${+m[3]}, ${m[1]}`;
  if ((m = s.match(/^(\d{4})-(\d{2})$/)))        return `${MONTHS[+m[2] - 1]} ${m[1]}`;
  if ((m = s.match(/^(\d{4})$/)))                return m[1];
  return s;
}
const clean = (x) => (x == null ? '' : String(x).trim());
const cDate = chicagoDate(p.document_date) || 'n.d.';
const head = (authorName && recipientName) ? `${authorName} to ${recipientName}`
           : (authorName || recipientName || clean(name));
const tail = [cDate, p.box_or_folder, p.document_reference, p.collection, p.archive].map(clean).filter(Boolean);
const noteCite = [head, ...tail].join(', ') + '.';
const bibParts = [p.collection, p.archive].map(clean).filter(Boolean);
const bibCite = bibParts.length ? bibParts.join('. ') + '.' : '';

function citeRow(parent, label, text) {
  const cw = parent.createEl('div'); cw.style.cssText = 'margin-top:0.55rem;';
  const lbl = cw.createEl('div');
  lbl.style.cssText = 'font-size:0.6rem;text-transform:uppercase;letter-spacing:0.06em;color:#8478A8;margin-bottom:0.2rem;';
  lbl.textContent = label;
  const r = cw.createEl('div'); r.style.cssText = 'display:flex;gap:0.5rem;align-items:flex-start;';
  const c = r.createEl('div');
  c.style.cssText = 'flex:1;font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;font-size:0.84rem;color:#4a3f30;line-height:1.5;';
  c.textContent = text;
  const btn = r.createEl('button');
  btn.textContent = 'copy';
  btn.style.cssText = 'flex:0 0 auto;font-size:0.68rem;border:1px solid #D6CEE6;background:#fff;color:#6E5AA0;border-radius:5px;padding:0.12rem 0.55rem;cursor:pointer;';
  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(text); btn.textContent = 'copied ✓'; setTimeout(() => { btn.textContent = 'copy'; }, 1200); } catch (e) { /* clipboard unavailable */ }
  });
}

const citeBox = wrap.createEl('div');
citeBox.style.cssText = 'margin-top:0.7rem;padding-top:0.55rem;border-top:1px solid #E3DCF0;';
citeRow(citeBox, 'Note — Chicago (footnote)', noteCite);
if (bibCite) citeRow(citeBox, 'Bibliography — Chicago', bibCite);
