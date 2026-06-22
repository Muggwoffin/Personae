---
type: concept
cssclasses:
  - concept-note
name: <% tp.file.title %>
aliases:
significance:
related_people:
related_events:
related_concepts:
tags:
created: <% tp.date.now("YYYY-MM-DD") %>

---

# <% tp.file.title %>

> [!summary]- Contents
> ```dataviewjs
> await dv.view("Vault Settings/scripts/toc");
> ```


## Overview

> Brief definition or summary of this concept and its relevance to the project.

## Evidence & Sources

### Primary Sources

### Secondary Sources

## Related Notes

```dataviewjs
const inlinks = dv.current().file.inlinks
  .filter(l => !l.path.includes("Templates") && !l.path.includes("Database"));
if (inlinks.length > 0) {
  for (const l of inlinks.sort((a,b) => a.path.localeCompare(b.path)))
    dv.paragraph("- " + dv.fileLink(l.path));
} else { dv.paragraph("*No notes link here yet.*"); }
```

#### Notes
