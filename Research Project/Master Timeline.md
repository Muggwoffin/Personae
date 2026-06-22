---
type: timeline
tags:
  - timeline
  - master-timeline
---

# Master Timeline

> [!summary]- Contents
> ```dataviewjs
> await dv.view("Vault Settings/scripts/toc");
> ```


```dataviewjs
await dv.view("Vault Settings/scripts/master-timeline");
```

---

## How to Add Timeline Entries

The timeline builds itself from five sources. (Its code lives in `Vault Settings/scripts/master-timeline.js`.)

### Inline events — date a sentence in any note 🕑

You don't need a dedicated event note for every dated fact. Write the fact in prose, then tag it inline anywhere in any note:

```
The party seized the Winter Palace that night. [event:: 1917-11-07 | October Revolution begins]
```

The date can be `1917`, `1917-11`, or `1917-11-07`; the text after the `|` becomes the timeline entry, linked back to the note it lives in. A note can carry as many inline events as you like. They render as small amber 🕑 chips in the text.

### Event notes 📅

For major events deserving their own note, use the Event Template — the `date:` field puts it on the timeline.

### People 👶 ✝️ and Organisations 🏛️ ⚰️

Birth/death and founding/dissolution dates from person and organisation notes appear automatically.
