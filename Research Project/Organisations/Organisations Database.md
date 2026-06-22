---
type: database
cssclasses:
  - database-view
tags:
  - database
  - organisations
created: 2026-06-02T10:11
updated: 2026-06-10T10:05
---

# Organisations Database

> [!summary]- Contents
> ```dataviewjs
> await dv.view("Vault Settings/scripts/toc");
> ```


## Overview

```dataviewjs
const orgs = dv.pages('').where(o => o.type === "organisation");
const stats = [
  { label: "Organisations", value: orgs.length,                                       colour: "#5A7A9E" },
  { label: "Active",        value: orgs.where(o => !o.dissolved_date).length,          colour: "#7A9E7E" },
  { label: "Dissolved",     value: orgs.where(o => o.dissolved_date).length,           colour: "#A07A5A" },
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

## Gallery View

```dataviewjs
const sortedOrgs = dv.pages('').where(o => o.type === "organisation")
  .array().sort((a, b) => a.file.name.localeCompare(b.file.name));

if (sortedOrgs.length === 0) {
  dv.paragraph("*No organisations found.*");
} else {
  const grid = dv.container.createEl("div");
  grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;margin:1rem 0;";

  for (const org of sortedOrgs) {
    const founded = org.founded_date ? String(org.founded_date).split('T')[0].split('-')[0] : null;
    const dissolved = org.dissolved_date ? String(org.dissolved_date).split('T')[0].split('-')[0] : null;
    const dateRange = founded ? (dissolved ? `${founded} – ${dissolved}` : `founded ${founded}`) : "";
    const ideology = org.ideology ? String(org.ideology) : "";
    const country = org.country ? String(org.country) : "";

    const card = grid.createEl("div");
    card.style.cssText = "background:#FFFFFF;border:1px solid #D9B2B2;border-top:3px solid #5A7A9E;border-radius:7px;padding:1.1rem 1.2rem;cursor:pointer;transition:transform 0.15s,box-shadow 0.15s,background 0.12s;";
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
      card.style.boxShadow = '0 8px 24px rgba(90,122,158,0.18)';
      card.style.background = '#F3F6FA';
      card.style.borderTopColor = '#3A5A7E';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
      card.style.background = '#FFFFFF';
      card.style.borderTopColor = '#5A7A9E';
    });
    card.addEventListener('click', () => app.workspace.openLinkText(org.file.path, '', false));

    const nameEl = card.createEl("div");
    nameEl.style.cssText = "font-weight:600;font-size:0.95rem;color:#3A5A7E;margin-bottom:0.5rem;line-height:1.3;";
    nameEl.textContent = org.file.name;

    if (ideology) {
      const idEl = card.createEl("div");
      idEl.style.cssText = "font-size:0.78rem;color:#7A5050;margin-bottom:0.2rem;";
      idEl.textContent = ideology;
    }
    if (country || dateRange) {
      const metaEl = card.createEl("div");
      metaEl.style.cssText = "font-size:0.75rem;color:#9A8080;margin-bottom:0.2rem;";
      metaEl.textContent = [country, dateRange].filter(Boolean).join(" · ");
    }
  }
}
```

---

## Detailed Table View

```dataviewjs
const orgs = dv.pages('')
    .where(o => o.type === "organisation")
    .sort(o => o.file.name);

if (orgs.length === 0) {
    dv.paragraph("*No organisations found.*");
} else {
    dv.table(
        ["Name", "Type", "Ideology", "Founded", "Dissolved", "Country"],
        orgs.map(o => [
            dv.fileLink(o.file.path, false, o.file.name),
            o.org_type || "—",
            o.ideology || "—",
            o.founded_date || "—",
            o.dissolved_date || "Active",
            o.country || "—"
        ])
    );
}
```

---

## By Ideology

```dataviewjs
const orgs = dv.pages('')
    .where(o => o.type === "organisation" && o.ideology)
    .sort(o => o.file.name);

if (orgs.length === 0) {
    dv.paragraph("*No organisations with ideology data found.*");
} else {
    // Group by ideology
    const byIdeology = {};
    
    for (let org of orgs) {
        const ideology = org.ideology || "Unspecified";
        
        if (!byIdeology[ideology]) {
            byIdeology[ideology] = [];
        }
        byIdeology[ideology].push(org);
    }
    
    // Sort ideologies
    const ideologies = Object.keys(byIdeology).sort();
    
    for (let ideology of ideologies) {
        dv.header(3, ideology);
        
        for (let org of byIdeology[ideology]) {
            const link = dv.fileLink(org.file.path, false, org.file.name);
            const country = org.country || "";
            const founded = org.founded_date || "";
            const dissolved = org.dissolved_date ? ` (dissolved ${org.dissolved_date})` : "";
            
            let entry = `- ${link}`;
            if (country) entry += ` (${country})`;
            if (founded) entry += ` — Founded ${founded}`;
            entry += dissolved;
            
            dv.paragraph(entry);
        }
        dv.paragraph("");
    }
}
```

---

## By Country

```dataviewjs
const orgs = dv.pages('')
    .where(o => o.type === "organisation" && o.country)
    .sort(o => o.file.name);

if (orgs.length === 0) {
    dv.paragraph("*No organisations with country data found.*");
} else {
    // Group by country
    const byCountry = {};
    
    for (let org of orgs) {
        const countries = Array.isArray(org.country) ? org.country : [org.country];
        
        for (let country of countries) {
            if (country) {
                if (!byCountry[country]) {
                    byCountry[country] = [];
                }
                byCountry[country].push(org);
            }
        }
    }
    
    // Sort countries
    const countries = Object.keys(byCountry).sort();
    
    for (let country of countries) {
        dv.header(3, country);
        
        for (let org of byCountry[country]) {
            const link = dv.fileLink(org.file.path, false, org.file.name);
            const ideology = org.ideology || "";
            const founded = org.founded_date || "";
            
            let entry = `- ${link}`;
            if (ideology) entry += ` — ${ideology}`;
            if (founded) entry += ` (${founded})`;
            
            dv.paragraph(entry);
        }
        dv.paragraph("");
    }
}
```

---

## Timeline of Foundings

```dataviewjs
const orgs = dv.pages('')
    .where(o => o.type === "organisation" && o.founded_date)
    .sort(o => o.founded_date);

if (orgs.length === 0) {
    dv.paragraph("*No organisations with founding dates found.*");
} else {
    // Group by decade
    const byDecade = {};
    
    for (let org of orgs) {
        const foundedYear = String(org.founded_date).split('-')[0];
        const decade = Math.floor(parseInt(foundedYear) / 10) * 10;
        
        if (!byDecade[decade]) {
            byDecade[decade] = [];
        }
        byDecade[decade].push(org);
    }
    
    // Sort decades
    const decades = Object.keys(byDecade).sort();
    
    for (let decade of decades) {
        dv.header(3, `${decade}s`);
        
        for (let org of byDecade[decade]) {
            const link = dv.fileLink(org.file.path, false, org.file.name);
            const founded = org.founded_date || "Unknown";
            const location = org.founded_location || "";
            const dissolved = org.dissolved_date ? ` → Dissolved ${org.dissolved_date}` : "";
            
            let entry = `- **${founded}**: ${link}`;
            if (location) entry += ` (${location})`;
            entry += dissolved;
            
            dv.paragraph(entry);
        }
        dv.paragraph("");
    }
}
```

---

## Organisational Networks

```dataviewjs
const orgs = dv.pages('')
    .where(o => o.type === "organisation")
    .sort(o => o.file.name);

// Parent organisations
const withParents = orgs.where(o => o.parent_org);
if (withParents.length > 0) {
    dv.header(3, "Subsidiary Organisations");
    
    const byParent = {};
    for (let org of withParents) {
        const parent = org.parent_org;
        if (!byParent[parent]) {
            byParent[parent] = [];
        }
        byParent[parent].push(org);
    }
    
    for (let parent of Object.keys(byParent).sort()) {
        dv.paragraph(`**${parent}:**`);
        for (let org of byParent[parent]) {
            dv.paragraph(`  - ${dv.fileLink(org.file.path, false, org.file.name)}`);
        }
        dv.paragraph("");
    }
}

// Affiliated organisations
const withAffiliates = orgs.where(o => o.affiliated_orgs);
if (withAffiliates.length > 0) {
    dv.header(3, "Affiliations Network");
    for (let org of withAffiliates) {
        const link = dv.fileLink(org.file.path, false, org.file.name);
        const affiliates = Array.isArray(org.affiliated_orgs) 
            ? org.affiliated_orgs.join(", ") 
            : org.affiliated_orgs;
        dv.paragraph(`- ${link} ⟷ ${affiliates}`);
    }
}
```

---

## Missing Data Report

```dataviewjs
const orgs = dv.pages('')
    .where(o => o.type === "organisation");

const missingIdeology = orgs.where(o => !o.ideology);
const missingCountry = orgs.where(o => !o.country);
const missingFoundingDate = orgs.where(o => !o.founded_date);
const missingArchive = orgs.where(o => !o.archive_location);
const missingType = orgs.where(o => !o.org_type);

dv.header(3, "Data Completeness");

if (missingIdeology.length > 0) {
    dv.paragraph(`**Missing Ideology (${missingIdeology.length}):**`);
    for (let o of missingIdeology) {
        dv.paragraph(`- ${dv.fileLink(o.file.path, false, o.file.name)}`);
    }
    dv.paragraph("");
}

if (missingCountry.length > 0) {
    dv.paragraph(`**Missing Country (${missingCountry.length}):**`);
    for (let o of missingCountry) {
        dv.paragraph(`- ${dv.fileLink(o.file.path, false, o.file.name)}`);
    }
    dv.paragraph("");
}

if (missingFoundingDate.length > 0) {
    dv.paragraph(`**Missing Founding Date (${missingFoundingDate.length}):**`);
    for (let o of missingFoundingDate) {
        dv.paragraph(`- ${dv.fileLink(o.file.path, false, o.file.name)}`);
    }
    dv.paragraph("");
}

if (missingArchive.length > 0) {
    dv.paragraph(`**Missing Archive Location (${missingArchive.length}):**`);
    for (let o of missingArchive) {
        dv.paragraph(`- ${dv.fileLink(o.file.path, false, o.file.name)}`);
    }
}
```

---

## Quick Add

To add a new organisation, use the Organisation Template or create a note with this frontmatter:

```yaml
---
type: organisation
ideology: 
country: 
founded_date: YYYY-MM-DD
dissolved_date: 
---
```
