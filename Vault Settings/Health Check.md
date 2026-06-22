---
type: dashboard
cssclasses:
  - readme-note
tags:
  - dashboard
---
               
# Vault Health Check

This page verifies that everything the vault depends on is installed and enabled.

> [!info] Seeing raw code below instead of a table?
> That means community plugins aren't running yet. Go to **Settings → Community plugins**, turn off *Restricted mode*, and enable the plugins — then come back here.

```dataviewjs
await dv.view("Vault Settings/scripts/health-check");
```

---

## Content Integrity

Deep scan of every note for damage classes research vaults actually encounter: corrupted bytes from sync conflicts, truncated files (unbalanced code fences), broken frontmatter, and footnote references whose definitions have gone missing. Run it after anything turbulent — a sync conflict, a restore, a bulk operation.

```dataviewjs
await dv.view("Vault Settings/scripts/content-integrity");
```
