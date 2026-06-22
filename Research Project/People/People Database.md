---
type: database
cssclasses:
  - database-view
tags:
  - database
  - people
created: 2026-06-02T10:06
updated: 2026-06-10T10:05
---
# People Database

> [!summary]- Contents
> ```dataviewjs
> await dv.view("Vault Settings/scripts/toc");
> ```


## Overview

```dataviewjs
const people = dv.pages('').where(p => p.type === "person" && !p.file.path.includes("Templates"));
const stats = [
  { label: "People",      value: people.length,                     colour: "#C4686B" },
  { label: "With Dates",  value: people.where(p => p.birth_date).length, colour: "#A07A5A" },
  { label: "With Photos", value: people.where(p => p.photo || app.vault.getAbstractFileByPath(`Attachments/Images/${p.name || p.file.name}.jpg`)).length, colour: "#7A9E7E" },
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
const SILHOUETTE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"><rect width="100" height="120" fill="#F5EDED"/><circle cx="50" cy="40" r="23" fill="#D4B0B0"/><path d="M4,120 C4,78 22,63 50,63 C78,63 96,78 96,120Z" fill="#D4B0B0"/></svg>')}`;

const sortedPeople = dv.pages('')
    .where(p => p.type === "person" && !p.file.path.includes("Templates"))
    .array()
    .sort((a, b) => a.file.name.split(' ')[0].localeCompare(b.file.name.split(' ')[0]));

if (sortedPeople.length === 0) {
    dv.paragraph("*No people found.*");
} else {
    const grid = dv.container.createEl("div");
    grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:1rem;margin:1rem 0;";

    for (const person of sortedPeople) {
        const name = person.name || person.file.name;
        const birthYear = person.birth_date ? String(person.birth_date).split('T')[0].split('-')[0] : "?";
        const deathYear = person.death_date ? String(person.death_date).split('T')[0].split('-')[0] : "?";

        // Resolve photo path
        let photoPath = person.photo ? String(person.photo).split('|')[0].split('\\|')[0].trim() : "";
        if (photoPath && !photoPath.includes('/')) photoPath = 'Attachments/Images/' + photoPath;
        if (!photoPath) photoPath = name ? `Attachments/Images/${name}.jpg` : "";  // match the infobox fallback
        const imageFile = photoPath ? app.vault.getAbstractFileByPath(photoPath) : null;
        const imgSrc = imageFile ? app.vault.adapter.getResourcePath(photoPath) : SILHOUETTE;

        // Card
        const card = grid.createEl("div");
        card.style.cssText = "background:#FFFFFF;border:1px solid #D9B2B2;border-top:3px solid #C4686B;border-radius:7px;overflow:hidden;cursor:pointer;transition:transform 0.15s,box-shadow 0.15s,background 0.12s;";
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 8px 24px rgba(150,50,50,0.15)';
            card.style.background = '#FDF3F3';
            card.style.borderTopColor = '#8C3335';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
            card.style.background = '#FFFFFF';
            card.style.borderTopColor = '#C4686B';
        });
        card.addEventListener('click', () => app.workspace.openLinkText(person.file.path, '', false));

        // Photo
        const img = card.createEl("img");
        img.src = imgSrc;
        img.style.cssText = "width:100%;height:190px;object-fit:cover;object-position:top;display:block;";
        img.onerror = () => { img.src = SILHOUETTE; };

        // Info
        const info = card.createEl("div");
        info.style.cssText = "padding:0.75rem 0.9rem;text-align:center;";
        const nameEl = info.createEl("div");
        nameEl.style.cssText = "font-weight:600;font-size:0.92rem;color:#8C3335;margin-bottom:0.2rem;line-height:1.3;";
        nameEl.textContent = name;
        const dates = info.createEl("div");
        dates.style.cssText = "font-size:0.78rem;color:#7A5050;";
        dates.textContent = `${birthYear} – ${deathYear}`;
    }
}
```

---

## Detailed Table View

```dataviewjs
const people = dv.pages('')
    .where(p => p.type === "person")
    .where(p => !p.file.path.includes("Templates"));

if (people.length === 0) {
    dv.paragraph("*No people found.*");
} else {
    // Sort by surname (last word in filename)
    const sortedPeople = Array.from(people).sort((a, b) => {
        const surnameA = a.file.name.split(' ')[0].toLowerCase();
        const surnameB = b.file.name.split(' ')[0].toLowerCase();
        return surnameA.localeCompare(surnameB);
    });
    
    dv.table(
        ["Name", "Born", "Died", "Birth Place", "Affiliations", "Archive"],
        sortedPeople.map(p => [
            dv.fileLink(p.file.path, false, p.name || p.file.name),
            p.birth_date ? String(p.birth_date).split('T')[0] : "—",
            p.death_date ? String(p.death_date).split('T')[0] : "—",
            p.place_of_birth || "—",
            p.affiliations || "—",
            p.archive_location || "—"
        ])
    );
}
```

---

## By Birth Year

```dataviewjs
const people = dv.pages('')
    .where(p => p.type === "person" && p.birth_date)
    .where(p => !p.file.path.includes("Templates"))
    .sort(p => p.birth_date);

if (people.length === 0) {
    dv.paragraph("*No people with birth dates found.*");
} else {
    // Group by decade
    const byDecade = {};
    
    for (let person of people) {
        const birthYear = String(person.birth_date).split('T')[0].split('-')[0];
        const decade = Math.floor(parseInt(birthYear) / 10) * 10;
        
        if (!byDecade[decade]) {
            byDecade[decade] = [];
        }
        byDecade[decade].push(person);
    }
    
    // Sort decades
    const decades = Object.keys(byDecade).sort();
    
    for (let decade of decades) {
        dv.header(3, `${decade}s`);
        
        for (let person of byDecade[decade]) {
            const link = dv.fileLink(person.file.path, false, person.name || person.file.name);
            const birthDate = String(person.birth_date).split('T')[0];
            const deathDate = person.death_date ? String(person.death_date).split('T')[0] : "";
            const place = person.place_of_birth || "";
            
            let entry = `- ${link} (b. ${birthDate}`;
            if (deathDate) entry += `, d. ${deathDate}`;
            entry += ")";
            if (place) entry += ` — ${place}`;
            
            dv.paragraph(entry);
        }
        dv.paragraph("");
    }
}
```

---

## By Location

```dataviewjs
const people = dv.pages('')
    .where(p => p.type === "person" && p.Locations)
    .where(p => !p.file.path.includes("Templates"))
    .sort(p => p.file.name);

if (people.length === 0) {
    dv.paragraph("*No people with location data found.*");
} else {
    // Group by location
    const byLocation = {};
    
    for (let person of people) {
        const locations = Array.isArray(person.Locations) ? person.Locations : [person.Locations];
        
        for (let location of locations) {
            if (location) {
                if (!byLocation[location]) {
                    byLocation[location] = [];
                }
                byLocation[location].push(person);
            }
        }
    }
    
    // Sort locations
    const locations = Object.keys(byLocation).sort();
    
    for (let location of locations) {
        dv.header(3, location);
        
        for (let person of byLocation[location]) {
            const link = dv.fileLink(person.file.path, false, person.name || person.file.name);
            const birthDate = person.birth_date ? String(person.birth_date).split('T')[0] : "?";
            const deathDate = person.death_date ? String(person.death_date).split('T')[0] : "?";
            const dates = (birthDate !== "?" || deathDate !== "?") 
                ? `(${birthDate} - ${deathDate})` 
                : "";
            
            dv.paragraph(`- ${link} ${dates}`);
        }
        dv.paragraph("");
    }
}
```

---

## Missing Data Report

```dataviewjs
const people = dv.pages('')
    .where(p => p.type === "person")
    .where(p => !p.file.path.includes("Templates"));

const missingBirthDate = people.where(p => !p.birth_date);
const missingDeathDate = people.where(p => !p.death_date);
const missingBirthPlace = people.where(p => !p.place_of_birth);
const missingArchive = people.where(p => !p.archive_location);
const missingAffiliations = people.where(p => !p.affiliations);

dv.header(3, "Data Completeness");

if (missingBirthDate.length > 0) {
    dv.paragraph(`**Missing Birth Date (${missingBirthDate.length}):**`);
    for (let p of missingBirthDate) {
        dv.paragraph(`- ${dv.fileLink(p.file.path, false, p.file.name)}`);
    }
    dv.paragraph("");
}

if (missingArchive.length > 0) {
    dv.paragraph(`**Missing Archive Location (${missingArchive.length}):**`);
    for (let p of missingArchive) {
        dv.paragraph(`- ${dv.fileLink(p.file.path, false, p.file.name)}`);
    }
    dv.paragraph("");
}

if (missingAffiliations.length > 0) {
    dv.paragraph(`**Missing Affiliations (${missingAffiliations.length}):**`);
    for (let p of missingAffiliations) {
        dv.paragraph(`- ${dv.fileLink(p.file.path, false, p.file.name)}`);
    }
}
```

---

## Quick Add

To add a new person, use the Person Template or create a note with this frontmatter:

```yaml
---
type: person
birth_date: YYYY-MM-DD
death_date: YYYY-MM-DD
place_of_birth: 
affiliations: 
---
```
