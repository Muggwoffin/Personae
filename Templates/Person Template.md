---
type: person
cssclasses:
  - person-note
name:
aliases: []
role:
nationality:
affiliations: []
place_of_birth:
place_of_death:
location:
Locations: []
death_coords:
family: []
father: []
mother: []
spouse: []
partner: []
children: []
siblings: []
aunts: []
uncles: []
nieces: []
nephews: []
cousins: []
birth_date:
death_date:
archive_location:
sources: []
photo:
tags: []
online bio:
wikidata entity id:
created: <% tp.date.now("YYYY-MM-DD") %>

---

> [!summary]- Contents
> ```dataviewjs
> await dv.view("Vault Settings/scripts/toc");
> ```


<%*
// NAMING:  File → Surname Firstname.md
//          name: → Firstname Surname  (display order)
//          photo: → Attachments/Images/Firstname Surname.jpg
-%>

# <% tp.file.title %>

```dataviewjs
await dv.view("Vault Settings/scripts/person-infobox");
```

## Summary

## Biographical Research

## Family

```dataviewjs
await dv.view("Vault Settings/scripts/family-tree");
```

## Bibliography

```dataviewjs
await dv.view("Vault Settings/scripts/person-sources");
```

### Additional Sources

## Related Notes

```dataviewjs
await dv.view("Vault Settings/scripts/related-notes");
```

## Notes
