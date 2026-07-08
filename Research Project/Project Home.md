---
type: homepage
cssclasses:
  - landing-page
tags:
  - homepage
tasks:
obsidianEditingMode: preview
created: 2026-06-01T14:22
updated: 2026-06-10T09:38
---
<div class="landing-hero"><span class="landing-hero-kicker">Research Database</span><span class="landing-hero-title">Personae</span><span class="landing-hero-tagline">A vault for people who research people</span></div>

```dataviewjs
await dv.view("Vault Settings/scripts/landing-stats");
```

```dataviewjs
// ── Daily scratchpad ─────────────────────────────────────────
function todayInfo() {
  const d = new Date();
  const y = d.getFullYear(), mo = String(d.getMonth()+1).padStart(2,'0'), dy = String(d.getDate()).padStart(2,'0');
  return { dateStr:`${y}-${mo}-${dy}`, path:`Daily Notes/${y}-${mo}-${dy}.md` };
}
const { dateStr, path } = todayInfo();
const wrap = dv.container;
wrap.style.cssText = "padding:1.2rem 2rem 1.4rem; background:#FDF5F5; border-top:1px solid #D9AEAE; margin:0;";
wrap.innerHTML = `<div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#A05050;margin-bottom:0.7rem;display:flex;align-items:center;gap:0.5rem;">Daily note <span style="flex:1;height:1px;background:#DDB4B4;display:inline-block;"></span></div><div style="display:flex;gap:0.75rem;align-items:flex-start;"><textarea id="landing-daily-input" placeholder="Quick note → Daily Notes/${dateStr}.md  (⌘+Enter to save)" style="flex:1;min-height:110px;padding:0.65rem 0.8rem;border:1px solid #D9B2B2;border-radius:6px;background:#fff;font-family:inherit;font-size:0.88rem;line-height:1.5;resize:vertical;outline:none;box-sizing:border-box;"></textarea><button id="landing-daily-btn" style="padding:0.55rem 1.1rem;background:#C4686B;color:#fff;border:none;border-radius:6px;font-size:0.8rem;font-weight:600;cursor:pointer;white-space:nowrap;align-self:flex-end;">Save →</button></div><div id="landing-daily-info" style="margin-top:0.45rem;font-size:0.72rem;color:#A05050;"></div>`;
const refreshInfo = () => {
  const info = wrap.querySelector('#landing-daily-info');
  const f = app.vault.getAbstractFileByPath(path);
  if (f) {
    info.innerHTML = `Today: <a style="color:#8C3335;cursor:pointer;" id="landing-open-today">${dateStr}</a> &nbsp;·&nbsp; <a style="color:#8C3335;cursor:pointer;" id="landing-open-plugin">open in Daily Notes ↗</a>`;
    wrap.querySelector('#landing-open-today').addEventListener('click', () => app.workspace.openLinkText(path,'',false));
    wrap.querySelector('#landing-open-plugin').addEventListener('click', () => app.commands.executeCommandById('daily-notes'));
  } else {
    info.innerHTML = `No entry yet for ${dateStr} &nbsp;·&nbsp; <a style="color:#8C3335;cursor:pointer;" id="landing-create-plugin">create with Daily Notes ↗</a>`;
    setTimeout(() => { const el = wrap.querySelector('#landing-create-plugin'); if(el) el.addEventListener('click', () => app.commands.executeCommandById('daily-notes')); }, 50);
  }
};
refreshInfo();
const btn = wrap.querySelector('#landing-daily-btn');
const input = wrap.querySelector('#landing-daily-input');
const doSave = async () => {
  const text = input.value.trim(); if (!text) return;
  const time = new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
  const entry = `\n\n**${time}**\n${text}`;
  const fp = 'Daily Notes';
  if (!app.vault.getAbstractFileByPath(fp)) await app.vault.createFolder(fp);
  const f = app.vault.getAbstractFileByPath(path);
  if (f) await app.vault.modify(f,(await app.vault.read(f))+entry);
  else await app.vault.create(path,`---\ntype: daily_note\ndate: ${dateStr}\n---\n\n# ${dateStr}${entry}`);
  input.value=''; btn.textContent='Saved ✓'; btn.style.background='#4e8c62';
  setTimeout(()=>{ btn.textContent='Save →'; btn.style.background='#C4686B'; refreshInfo(); },1800);
  refreshInfo();
};
btn.addEventListener('click', doSave);
input.addEventListener('keydown', e => { if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();doSave();} });
```

```dataviewjs
// ── Card grid ────────────────────────────────────────────────
const cards = [
  { icon:"👥", title:"People",          desc:"Individuals in your study — biographies, sources, networks", href:"Research Project/People/People Database" },
  { icon:"💡", title:"Concepts",        desc:"Analytical and thematic concepts driving the research",      href:"Research Project/Concepts/Concepts Database" },
  { icon:"🗺️", title:"Network Map",     desc:"Geographic map of locations, birthplaces and deaths",       href:"Research Project/Network Map" },
  { icon:"📍", title:"Locations",       desc:"Physical places relevant to your research",                  href:"Research Project/Locations/Petrograd" },
  { icon:"🏛️", title:"Organisations",  desc:"Parties, institutions and allied organisations",            href:"Research Project/Organisations/Organisations Database" },
  { icon:"📅", title:"Events",          desc:"Key events and turning points",                              href:"Research Project/Events/Russian Revolution" },
  { icon:"📰", title:"Publications",    desc:"Periodicals, newspapers and journals",                       href:"Research Project/Publications/Iskra" },
  { icon:"🗄️", title:"Sources",         desc:"Archival documents — citations, status and trip planning",   href:"Research Project/Sources/Sources Database" },
  { icon:"✍️", title:"Writing",         desc:"Articles, books and other writing projects",                href:"Writing Projects/Lenin Biography" },
  { icon:"📚", title:"Bibliography",    desc:"All imported Zotero sources in Chicago format",              href:"Research Project/Project Bibliography" },
  { icon:"📆", title:"Daily Notes",     desc:"Day-to-day notes and thoughts",                              href:"Daily Notes" },
  { icon:"🔬", title:"Research Log",    desc:"Running log of research findings and archive visits",        href:"Research Log" },
  { icon:"📋", title:"Vault Guide",     desc:"How to use templates, update maps and maintain the database", href:"Vault Settings/Vault Guide" },
];

// Styling lives in the landing.css snippet (.landing-card-grid / .landing-card /
// .landing-card-icon|title|desc), including the hover lift — no inline styles here.
const grid = dv.container;
grid.classList.add('landing-card-grid');
cards.forEach(card => {
  const a = document.createElement('a');
  a.className = 'landing-card internal-link';
  a.innerHTML = `<span class="landing-card-icon">${card.icon}</span><span class="landing-card-title">${card.title}</span><span class="landing-card-desc">${card.desc}</span>`;
  a.addEventListener('click', e => { e.preventDefault(); app.workspace.openLinkText(card.href, '', false); });
  grid.appendChild(a);
});
```


## Quick create


```meta-bind-button
label: "👤 Person"
id: qc-person
hidden: true
style: primary
action:
  type: templaterCreateNote
  templateFile: Templates/Person Template.md
  folderPath: Research Project/People
  fileName: New Person
  openNote: true
```

```meta-bind-button
label: "📅 Event"
id: qc-event
hidden: true
style: primary
action:
  type: templaterCreateNote
  templateFile: Templates/Event Template.md
  folderPath: Research Project/Events
  fileName: New Event
  openNote: true
```

```meta-bind-button
label: "📍 Location"
id: qc-location
hidden: true
style: primary
action:
  type: templaterCreateNote
  templateFile: Templates/Location Template.md
  folderPath: Research Project/Locations
  fileName: New Location
  openNote: true
```

```meta-bind-button
label: "🏛️ Organisation"
id: qc-organisation
hidden: true
style: primary
action:
  type: templaterCreateNote
  templateFile: Templates/Organisation Template.md
  folderPath: Research Project/Organisations
  fileName: New Organisation
  openNote: true
```

```meta-bind-button
label: "📰 Publication"
id: qc-publication
hidden: true
style: primary
action:
  type: templaterCreateNote
  templateFile: Templates/Publication Template.md
  folderPath: Research Project/Publications
  fileName: New Publication
  openNote: true
```

```meta-bind-button
label: "💡 Concept"
id: qc-concept
hidden: true
style: primary
action:
  type: templaterCreateNote
  templateFile: Templates/Concept Template.md
  folderPath: Research Project/Concepts
  fileName: New Concept
  openNote: true
```

```meta-bind-button
label: "🗄️ Archive note"
id: qc-source
hidden: true
style: primary
action:
  type: templaterCreateNote
  templateFile: Templates/New Archive Note.md
  folderPath: Research Project/Sources
  fileName: New Archive Note
  openNote: true
```

```meta-bind-button
label: "✍️ Writing"
id: qc-writing
hidden: true
style: primary
action:
  type: templaterCreateNote
  templateFile: Templates/Writing Project Template.md
  folderPath: Writing Projects
  fileName: New Writing Project
  openNote: true
```

```meta-bind-button
label: "🎙️ Interview"
id: qc-interview
hidden: true
style: primary
action:
  type: templaterCreateNote
  templateFile: Templates/Interview Template.md
  folderPath: Research Project/Interviews
  fileName: New Interview
  openNote: true
```

`BUTTON[qc-person, qc-event, qc-location, qc-organisation, qc-publication, qc-concept, qc-interview, qc-source, qc-writing]`


*Creates a pre-templated note in the right folder — rename it (F2) once it opens. You can also just create a note inside any project folder: the matching template applies itself.*

```dataviewjs
// ── Research Log scratchpad ───────────────────────────────────
function todayInfo() {
  const d = new Date();
  const y = d.getFullYear(), mo = String(d.getMonth()+1).padStart(2,'0'), dy = String(d.getDate()).padStart(2,'0');
  return { dateStr:`${y}-${mo}-${dy}`, path:`Research Log/${y}-${mo}-${dy}.md` };
}
const { dateStr: rDateStr, path: rPath } = todayInfo();
const rWrap = dv.container;
rWrap.style.cssText = "padding:1.2rem 2rem 1.4rem; background:#F5F0FA; border-top:1px solid #C8B0D8; margin:0;";
rWrap.innerHTML = `<div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#7050A0;margin-bottom:0.7rem;display:flex;align-items:center;gap:0.5rem;">Research log <span style="flex:1;height:1px;background:#C8B0D8;display:inline-block;"></span></div><div style="display:flex;gap:0.75rem;align-items:flex-start;"><textarea id="landing-research-input" placeholder="Quick research note — saved to Research Log/${rDateStr}.md  (⌘+Enter)" style="flex:1;min-height:90px;padding:0.65rem 0.8rem;border:1px solid #C8B0D8;border-radius:6px;background:#fff;font-family:inherit;font-size:0.88rem;line-height:1.5;resize:vertical;outline:none;box-sizing:border-box;"></textarea><button id="landing-research-btn" style="padding:0.55rem 1.1rem;background:#9060C0;color:#fff;border:none;border-radius:6px;font-size:0.8rem;font-weight:600;cursor:pointer;white-space:nowrap;align-self:flex-end;">Save →</button></div><div id="landing-research-info" style="margin-top:0.45rem;font-size:0.72rem;color:#7050A0;"></div>`;

const rRefresh = () => {
  const info = rWrap.querySelector('#landing-research-info');
  const f = app.vault.getAbstractFileByPath(rPath);
  if (f) { info.innerHTML = `Today: <a style="color:#7050A0;cursor:pointer;" id="landing-open-rlog">${rDateStr}</a>`; rWrap.querySelector('#landing-open-rlog').addEventListener('click', () => app.workspace.openLinkText(rPath,'',false)); }
  else info.textContent = `No research log yet for ${rDateStr}.`;
};
rRefresh();

const rBtn = rWrap.querySelector('#landing-research-btn');
const rInput = rWrap.querySelector('#landing-research-input');

const rSave = async () => {
  const text = rInput.value.trim(); if (!text) return;
  const time = new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
  const entry = `

**${time}**
${text}`;
  const folderPath = 'Research Log';
  if (!app.vault.getAbstractFileByPath(folderPath)) await app.vault.createFolder(folderPath);
  const f = app.vault.getAbstractFileByPath(rPath);
  if (f) await app.vault.modify(f,(await app.vault.read(f))+entry);
  else await app.vault.create(rPath,`---
type: research_log
date: ${rDateStr}
tags:\n  - research-log
---

# Research Log: ${rDateStr}${entry}`);
  rInput.value=''; rBtn.textContent='Saved ✓'; rBtn.style.background='#4e8c62';
  setTimeout(()=>{ rBtn.textContent='Save →'; rBtn.style.background='#9060C0'; rRefresh(); },1800);
  rRefresh();
};
rBtn.addEventListener('click', rSave);
rInput.addEventListener('keydown', e => { if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();rSave();} });
```

<div style="padding:0.75rem 2rem; background:#F2E8E8; border-top:1px solid #D9AEAE; font-size:0.74rem; color:#9A6060; display:flex; gap:1.2rem; align-items:center; flex-wrap:wrap;"><span>↗ <a href="Research Project/Master Timeline" class="internal-link" style="color:#8C3335;">Master Timeline</a></span><span>·</span><span>↗ <a href="Research Project/Network Diagram.canvas" class="internal-link" style="color:#8C3335;">Network Diagram</a></span><span>·</span><span>↗ <a href="Vault Settings/Vault Guide" class="internal-link" style="color:#8C3335;">Vault Guide</a></span><span>·</span><span>↗ <a href="Start Here" class="internal-link" style="color:#8C3335;">Start Here</a></span><span>·</span><span>↗ <a href="Vault Settings/Health Check" class="internal-link" style="color:#8C3335;">Health Check</a></span><span>·</span><span>↗ <a href="Research Project/People/Pseudonym Registry" class="internal-link" style="color:#8C3335;">Pseudonyms</a></span></div>
