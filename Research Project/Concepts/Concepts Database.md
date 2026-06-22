---
type: database
cssclasses:
  - database-view
tags:
  - database
  - concepts
created: 2026-06-02T10:12
updated: 2026-06-10T10:05
---

# Concepts Database

> [!summary]- Contents
> ```dataviewjs
> await dv.view("Vault Settings/scripts/toc");
> ```


## Overview

```dataviewjs
const concepts = dv.pages('').where(p => p.type === "concept" && !p.file.path.includes("Templates"));
const withPeople   = concepts.where(p => p.related_people   && p.related_people.length   > 0).length;
const withEvents   = concepts.where(p => p.related_events   && p.related_events.length   > 0).length;
const withConcepts = concepts.where(p => p.related_concepts && p.related_concepts.length > 0).length;
const unlinked     = concepts.length - withPeople;

const stats = [
  { label: "Concepts",        value: concepts.length, colour: "#9060C0" },
  { label: "Linked to People", value: withPeople,     colour: "#C4686B" },
  { label: "Linked to Events", value: withEvents,     colour: "#D3A573" },
  { label: "Awaiting Links",   value: unlinked,       colour: "#B0B0B0" },
];
const bar = dv.container.createEl("div");
bar.style.cssText = "display:flex;gap:0.6rem;flex-wrap:wrap;margin-bottom:0.5rem;";
for (const s of stats) {
  const chip = bar.createEl("div");
  chip.style.cssText = `background:${s.colour}22;border:1px solid ${s.colour};border-radius:20px;padding:0.3rem 0.9rem;font-size:0.8rem;color:${s.colour};font-weight:600;`;
  chip.textContent = `${s.label} · ${s.value}`;
}
```

---

## All Concepts (A–Z)

```dataviewjs
const concepts = dv.pages('').where(p => p.type === "concept" && !p.file.path.includes("Templates"))
  .array().sort((a, b) => a.file.name.localeCompare(b.file.name));

if (concepts.length === 0) {
  dv.paragraph("*No concept notes found.*");
} else {
  const grid = dv.container.createEl("div");
  grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.75rem;margin:1rem 0;";

  for (const c of concepts) {
    const hasPeople   = c.related_people   && (Array.isArray(c.related_people)   ? c.related_people.length   : 1) > 0;
    const hasEvents   = c.related_events   && (Array.isArray(c.related_events)   ? c.related_events.length   : 1) > 0;
    const hasConcepts = c.related_concepts && (Array.isArray(c.related_concepts) ? c.related_concepts.length : 1) > 0;
    const linked = hasPeople || hasEvents || hasConcepts;
    const accent = linked ? "#9060C0" : "#B0B0B0";

    const card = grid.createEl("div");
    card.style.cssText = `background:#FFFFFF;border:1px solid #D9C8E8;border-top:3px solid ${accent};border-radius:7px;padding:0.9rem 1rem;cursor:pointer;transition:transform 0.15s,box-shadow 0.15s,background 0.12s;`;
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-3px)';
      card.style.boxShadow = '0 6px 20px rgba(144,96,192,0.15)';
      card.style.background = '#FAF5FF';
      card.style.borderTopColor = '#6A3090';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
      card.style.background = '#FFFFFF';
      card.style.borderTopColor = accent;
    });
    card.addEventListener('click', () => app.workspace.openLinkText(c.file.path, '', false));

    const nameEl = card.createEl("div");
    nameEl.style.cssText = `font-weight:600;font-size:0.88rem;color:${linked ? '#6A3090' : '#8A8A8A'};margin-bottom:0.45rem;line-height:1.3;`;
    nameEl.textContent = c.file.name;

    const tags = card.createEl("div");
    tags.style.cssText = "display:flex;gap:0.3rem;flex-wrap:wrap;";
    if (hasPeople)   { const t = tags.createEl("span"); t.style.cssText = "font-size:0.65rem;background:#C4686B22;color:#C4686B;border-radius:10px;padding:0.1rem 0.45rem;font-weight:600;"; t.textContent = "people"; }
    if (hasEvents)   { const t = tags.createEl("span"); t.style.cssText = "font-size:0.65rem;background:#D3A57322;color:#A07830;border-radius:10px;padding:0.1rem 0.45rem;font-weight:600;"; t.textContent = "events"; }
    if (hasConcepts) { const t = tags.createEl("span"); t.style.cssText = "font-size:0.65rem;background:#9060C022;color:#9060C0;border-radius:10px;padding:0.1rem 0.45rem;font-weight:600;"; t.textContent = "concepts"; }
    if (!linked)     { const t = tags.createEl("span"); t.style.cssText = "font-size:0.65rem;color:#B0B0B0;font-style:italic;"; t.textContent = "no links yet"; }
  }
}
```

---

## Concepts by Theme

```dataviewjs
// Groups concepts by which people they're linked to — useful for book chapter planning
const concepts = dv.pages('')
    .where(p => p.type === "concept")
    .where(p => !p.file.path.includes("Templates"))
    .sort(p => p.file.name);

// Concepts with no related_people links yet
const unlinked = concepts.where(p => !p.related_people || p.related_people.length === 0);
const linked = concepts.where(p => p.related_people && p.related_people.length > 0);

if (linked.length > 0) {
    dv.header(3, "Concepts linked to people");
    for (let c of linked) {
        const people = Array.isArray(c.related_people) ? c.related_people.join(", ") : c.related_people;
        dv.paragraph(`- ${dv.fileLink(c.file.path, false, c.file.name)} → ${people}`);
    }
}

if (unlinked.length > 0) {
    dv.header(3, `Concepts awaiting links (${unlinked.length})`);
    dv.paragraph("*These concept notes have no related_people set yet — worth reviewing.*");
    for (let c of unlinked) {
        dv.paragraph(`- ${dv.fileLink(c.file.path, false, c.file.name)}`);
    }
}
```

---

## Missing Data

```dataviewjs
const concepts = dv.pages('')
    .where(p => p.type === "concept")
    .where(p => !p.file.path.includes("Templates"));

const noRelatedPeople  = concepts.where(p => !p.related_people  || p.related_people.length  === 0);
const noRelatedEvents  = concepts.where(p => !p.related_events  || p.related_events.length  === 0);
const noRelatedConcepts = concepts.where(p => !p.related_concepts || p.related_concepts.length === 0);

dv.paragraph(`**No related_people (${noRelatedPeople.length})** | **No related_events (${noRelatedEvents.length})** | **No related_concepts (${noRelatedConcepts.length})**`);
```

---

## Quick Add

To add a new concept note, use the **Concept Template** from the Templates folder. Required frontmatter:

```yaml
---
type: concept
name: 
related_people:
related_events:
related_concepts:
---
```
