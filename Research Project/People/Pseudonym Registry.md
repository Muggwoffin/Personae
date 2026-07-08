---
type: database
cssclasses:
  - database-view
tags:
  - database
created: 2026-07-06
---

# Pseudonym Registry

Every alias recorded on a person note, flattened into one alphabetical lookup table. When an unfamiliar name turns up in an archival document, check it here before creating a new person note — historical subjects hide behind pen names, married names, and cover identities.

Add aliases in a person note's `aliases:` frontmatter and this table updates itself. Aliases identical to the person's display name are omitted.

```dataviewjs
await dv.view("Vault Settings/scripts/pseudonym-registry");
```
