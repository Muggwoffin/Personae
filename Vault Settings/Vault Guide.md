---
type: readme
cssclasses:
  - readme-note
tags:
  - meta
  - readme
created: 2026-06-01
updated: 2026-06-10T09:43
---

# Vault Guide

This note explains how the technical parts of the vault work and what to do when adding or updating material. It covers templates, Leaflet maps, Dataview databases, and frontmatter fields.

> [!summary]- Contents
>
> **Research workflow**
> - [[#Zotero Integration]] — citing sources, building the bibliography
> - [[#Templates]] — the five note templates and how to use them
> - [[#The Archival Source Template]] — notes for individual documents
>
> **Data fields**
> - [[#Frontmatter Fields — Person Notes]]
> - [[#Frontmatter Fields — Location Notes]]
> - [[#Frontmatter Fields — Concept Notes]]
> - [[#Wikidata IDs]]
> - [[#Keeping the updated Field Accurate]]
>
> **Maps & databases**
> - [[#Updating the Master Leaflet Map]] — adding markers, finding coordinates
> - [[#Dataview Databases]] — People, Concepts, Timeline
>
> **Writing & styling**
> - [[#Readability & Styling (added June 2026)]] — quotes, callouts, image captions, footnotes, tables
>
> **Collaboration**
> - [[#Git, Backup & Collaboration (added June 2026)]] — setup, daily use, attribution

---

## Zotero Integration

The vault uses the **Zotero Desktop Connector** plugin to link sources from your Zotero library to notes, and to build the [[Project Bibliography]] automatically. The bibliography updates itself — you don't maintain it by hand.

### How it works

When you write a footnote and cite a source, you include a wikilink to the source's citekey: `[[authorTitleYear]]`. Obsidian resolves that link to a file in `Zotero/Highlights/`. The bibliography queries all sources in that folder that have at least one incoming link from outside it — so every `[[citekey]]` you write anywhere in the vault (footnotes, `sources:` fields, body text) is automatically counted as a citation, and the source appears in the bibliography.

The `sources:` field on person notes works the same way — any citekey wikilink you add there is picked up by the bibliography.

### Step-by-step workflow

**When you first cite a source:**

1. Write your footnote text as normal.
2. At the point where the citekey should go, use **Zotero cite suggest**: type `[[` and start typing the author name or title. Select the source from the dropdown. This inserts `[[citekey]]` into your footnote.
3. Make sure Zotero is running, then — **still in Obsidian** — open the command palette (Ctrl+P) and run **"Create Source Record"**. Zotero's red search picker pops up; find the item and hit Enter. This creates a stub note at `Zotero/Highlights/citekey.md` with the bibliographic metadata — no highlights needed. (Nothing to click in Zotero itself — the whole flow runs from Obsidian.)
4. That's it. The [[Project Bibliography]] now includes this source.

You only need to do step 3 once per source. After that, citing it again anywhere in the vault just requires the `[[citekey]]` wikilink — no further Zotero action needed.

**When you want to import highlights from a PDF:**

Use **"Import Highlights"** instead of "Create Source Record". This does the same thing as above but also imports all your annotations from the PDF. The source record and bibliography entry are created in the same way.

### The sources: field on person notes

Person notes have a `sources:` frontmatter field for recording which sources discuss that individual directly:

```yaml
sources:
  - "[[blackEthicalSocialism1999]]"
  - "[[nelsonSystemPhilosophischen1932]]"
```

This is distinct from footnote citations — use it for sources you'd want to consult whenever you return to this person, regardless of which specific claim you're footnoting. Like the footnote wikilinks, these count as citations and feed the bibliography.

### What lives where

| Folder | Contents |
|---|---|
| `Zotero/Highlights/` | Source records — one per item. Created by "Create Source Record" or "Import Highlights". Named by citekey. |
| `Zotero/Notes/` | Freeform reading notes about sources — not connected to the bibliography. |
| `Zotero/Templates/` | The two export templates. Do not edit unless you want to change the format of new source records. |

### The bibliography note

[[Project Bibliography]] shows two sections:

- **Cited sources** — every source with a `[[citekey]]` link anywhere in the vault, formatted in Chicago notes-bibliography style, grouped alphabetically. Updates live.
- **Imported but not yet cited** — source records that exist in `Zotero/Highlights/` but have no incoming links yet. A useful reminder of sources you've registered but not yet drawn on in your notes.

---

## Templates

Five templates live in the root `Templates/` folder. Use them via Templater (the `<% %>` syntax auto-fills when you create a note from a template). To use a template, create a new note, then run **Templater: Insert template** from the command palette.

| Template                   | Use for                                                                   |
| -------------------------- | ------------------------------------------------------------------------- |
| `Person Template`          | Any individual — any person relevant to the project        |
| `Concept Template`         | Analytical or thematic concepts (ideologies, themes, practices, etc.) |
| `Location Template`        | Physical places — Cities, buildings, meeting places               |
| `Publication Template`     | Project-related periodicals, newspapers, journals                         |
| `Archival Source Template` | Individual archival documents (individual archival documents)              |

---

## Frontmatter Fields — Person Notes

These are the fields that drive the databases and maps. Keep them accurate.

**`type: person`** — Do not change. This is how Dataview finds all person notes.

**`location: [lat, lng]`** — The person's **birthplace coordinates**. This feeds the *Birthplaces* map in [[Network Map]]. When you know the birthplace, geocode it (Google Maps → right-click → copy coordinates) and enter it here as `[lat, lng]`.

**`death_coords: [lat, lng]`** — The person's **death location coordinates**. Same format. This feeds the *Deaths* map in [[Network Map]].

**`place_of_birth` / `place_of_death`** — Plain text city/country names. Used as labels in the map markers and for your own reference.

**`wikidata entity id: QXXXXXX`** — The Wikidata QID for this person (e.g. `Q106271`). Prefix with `Q`. Leave blank if no Wikidata entry exists.

**`affiliations`** — List of organisation memberships. Used in the People Database table. Reference organisations with wikilinks where possible (e.g. `[[Bolsheviks]]`).

**`archive_location`** — The primary archive(s) holding papers for this person. Can be a URL or plain text (e.g. `Archive name, City` or `Catalogue ref`).

---

## Frontmatter Fields — Location Notes

**`type: location`** — Do not change.

**`location: [lat, lng]`** — The place's coordinates. The map embedded in the note reads this property automatically — no map block to edit. Quickest way to fill it: copy `lat, long` from Google Maps (right-click the spot → click the coordinates), then run the command **"Research Tools: Paste coordinates into this note"**, which writes the value and the map updates. (Or type latitude and longitude as two separate list items.)

**`location_type`** — Free text: `restaurant / safe house`, `school`, `prison`, `camp`, etc.

**`active_from` / `active_to`** — Operational date range in `YYYY-MM-DD` format.

---

## Frontmatter Fields — Concept Notes

**`type: concept`** — Do not change.

**`related_people`** — List of wikilinked person notes. Drives the *Concepts by Theme* and *Missing Data* sections in [[Concepts Database]]. This is the most useful field to fill in as your research develops — it lets you see which concepts have strong evidential bases.

**`related_events`** — List of wikilinked event notes.

**`related_concepts`** — List of wikilinked sibling concepts.

---

## Updating the Master Leaflet Map

The [[Network Map]]'s **Locations** and **Birthplaces** maps **fill themselves in** automatically from each note's `location` property (via Leaflet's `markerFolder`) — just add coordinates to a note and a marker appears. The **Deaths** map is a manual list of `marker:` lines, because Leaflet's auto-marker reads only the `location` field, not `death_coords`.

### Adding a new person with known birth/death places

1. Create the person note from the Person Template.
2. Fill in `place_of_birth` / `place_of_death`, and the coordinates: `location: [lat, lng]` for the birthplace and `death_coords: [lat, lng]` for the death place.
3. The person appears on the **Birthplaces** map automatically (it reads `location`). For the **Deaths** map, add one `marker:` line to its block in [[Network Map]] — death coordinates can't be auto-collected. Tip: the **"Paste coordinates"** command fills `location` from a copied `lat, long` string.

### Adding a new location (city, building, etc.)

1. Create the location note from the Location Template.
2. Fill the **location** property: copy `lat, long` from Google Maps and run the **"Paste coordinates"** command (or type latitude and longitude as two list items). The map in the note draws itself, and the place appears on the Network Map's **Locations** layer automatically — no marker line to add.

### Finding coordinates

The easiest method: open [Google Maps](https://maps.google.com), navigate to the location, right-click the pin → the coordinates appear at the top of the context menu. Copy them in `lat, lng` order.

For historical addresses that no longer exist, try searching the street name on [OpenStreetMap](https://www.openstreetmap.org) or the [Berliner Adressbuch](https://adressbuch.zlb.de) for Berlin addresses.

---

## Dataview Databases

Three notes use Dataview to aggregate information from across the vault. They update automatically when you edit frontmatter — no action needed.

### [[People Database]]

Queries all notes with `type: person`. Shows:
- A photo gallery sorted by surname
- A full table with birth/death dates, affiliations, and archive
- Grouping by birth decade
- A **Missing Data** report listing people with empty `birth_date`, `archive_location`, or `affiliations` fields — useful for knowing where to focus research effort

### [[Concepts Database]]

Queries all notes with `type: concept`. Shows:
- All concepts A–Z with their linked people, events, and sibling concepts
- A **Concepts awaiting links** section for concepts with no `related_people` set — a useful writing checklist
- A missing data summary

### [[Master Timeline]]

Queries all notes with a `date:` field (events), `birth_date`/`death_date` (people), and `founded_date`/`dissolved_date` (organisations). Groups entries by year. To appear on the timeline, a note just needs the relevant date field in its frontmatter.

---

## The Archival Source Template

Use this when you want to create a dedicated note for a single document — particularly useful for key files you return to repeatedly (e.g. a specific KV file at TNA, or a particular folder at FES).

Fields to fill:
- **`archive`** — e.g. `The National Archives, Kew`
- **`collection`** — e.g. `KV 2`
- **`box_or_folder`** — e.g. `KV 2/3597`
- **`document_reference`** — the specific item reference
- **`document_date`** — date of the document in `YYYY-MM-DD`
- **`document_type`** — e.g. `Special Branch report`, `Gestapo file`, `personal memoir`
- **`language`** — `German`, `English`, `French`, etc.
- **`url`** — if available online (TNA Discovery, Arcinsys, etc.)

The body of the note has a pre-formatted callout for quick reference and a **Transcription / Summary** section for your notes. The footnote stub at the bottom gives you a ready-made citation format.

---

## Keeping the updated Field Accurate

The `updated:` frontmatter field is maintained automatically by the **Update time on edit** plugin — it refreshes whenever you edit a note. No manual action needed.

---

## Wikidata IDs

If a person has a Wikidata entry, their `wikidata entity id:` field should contain only the QID (e.g. `Q106271`), not a full URL. To find a QID, search [wikidata.org](https://www.wikidata.org) for the person's name. The QID appears in the URL: `wikidata.org/wiki/Q106271`.

If no entry exists for an research subject you've researched extensively, consider creating one — it benefits the wider scholarly community.

---

## Readability & Styling (added June 2026)

All of the styling below lives in one CSS snippet: `.obsidian/snippets/readability.css` (Settings → Appearance → CSS snippets). If something looks wrong, toggling that snippet off and on usually fixes it.

The snippet also provides: a colored top edge on each note matching its type (person red, event amber, location green, organisation blue, publication purple, concept violet); faded dashed styling for links to notes that don't exist yet, so gaps in the network are visible at a glance; hover effects throughout (links glow amber, images lift, source callouts rise, quotes warm up, footnotes highlight); and full dark-mode support.

### Block quotations

Start a line with `>` to make a quote block. It renders in italic serif with a large amber quotation mark and a thin rule:

```
> Quoted passage here.
> — Author Name
```

Consecutive `>` lines form one quote. End with an em-dash line for the attribution.

### Source callouts

For quotations or summaries tied to a specific source, use a colour-coded callout instead. The citation goes on the first line after the type tag, the content below:

```
> [!memoir] Author, memoirs, p. 42
> Quoted passage here...
```

| Type | Use for | Colour |
|---|---|---|
| `[!memoir]` | Memoirs, letters, diaries | Warm amber |
| `[!archive]` | police, court and state files | Dark red |
| `[!report]` | institutional and intelligence reports | Slate blue |
| `[!translation]` | Your own translations | Muted green |
| `[!source]` | Anything else | Amber-brown |

### Images and captions

The **Caption on Paste** plugin changes what happens when you paste an image:

1. Paste an image into any note (Ctrl+V).
2. A dialog appears asking for a caption. Type one and press Enter, or click *No caption*.
3. The image is saved to `Attachments/Images/Pasted/` and embedded with the caption shown in small italics beneath it.

To caption an existing image, write the caption after a pipe in the embed: `![[photo.jpg|Description of the image]]`. To change a caption, just edit that text.

### Footnotes

Footnotes (`[^1]`) need no new syntax, but in Reading view the footnote block at the bottom of the note now renders smaller, in muted text, separated by a thin amber rule. Note this styling only appears in **Reading view** — in editing mode footnotes show as plain definitions.

### Tables

Tables automatically get bold headers with an amber underline, alternating row shading, and a hover highlight. No special syntax — any markdown table is styled.

### Attachments folder

All pasted images land in `Attachments/Images/Pasted/`. The template photo system (person/organisation infoboxes) reads from `Attachments/Images/` — to add a portrait, drop a file named `Firstname Surname.jpg` into that folder.

---

## Git, Backup & Collaboration (added June 2026)

The vault is designed to be version-controlled with git. This gives you: a full history of every change, offsite backup on GitHub, multi-person collaboration, and per-line authorship (see *Note Attribution* below).

### One-time setup (beginner friendly)

1. Install [GitHub Desktop](https://desktop.github.com) and sign in.
2. Install [Git for Windows](https://git-scm.com/download/win) (defaults are fine). GitHub Desktop's built-in git is private to it — Obsidian's plugins need the system-wide one.
3. Tell git who you are (PowerShell):
   ```
   git config --global user.name "Your Name"
   git config --global user.email "you@example.com"
   ```
4. GitHub Desktop → File → *Add local repository* → select the vault folder → accept *create a repository here*.
5. Write a summary ("Initial commit") and click *Commit to main*.
6. Click *Publish repository* and keep it **private**.

### Daily use

The **Git** plugin (Settings → Git) handles everything automatically once set up: enable *pull on startup*, *pull before push*, and an auto commit-and-sync interval of 10–15 minutes. You then never need to think about it. Manual commands (Ctrl+P): *Commit-and-sync*, *Pull*, *Open source control view*.

### Collaborators

Invite collaborators on github.com (repo → Settings → Collaborators). Each collaborator installs GitHub Desktop + Git for Windows, sets their **own** `user.name`, clones the repo, and opens the folder as an Obsidian vault. Habit to keep: pull at the start of a session, let auto-commit run. Edits to different notes merge cleanly; conflicts only occur when two people change the same lines between syncs.

### Note Attribution plugin

Once the repository has at least one commit, the **Note Attribution** plugin shows who wrote what:

- Each line in the editor carries a thin coloured marker — one colour per author. Hover for name and date.
- Grey markers mean *uncommitted* — the lines join their author's colour at the next commit.
- The status bar (bottom of the window) lists the note's contributors; click it for a full breakdown with line counts and percentages.
- Command palette: *Toggle attribution markers* and *Show contributors for current note*.

If the status bar says "no git history", the vault either isn't a repository yet or the file has never been committed.

---

## Inline Events

Not every dated fact deserves its own event note. To put a sentence from any note onto the [[Master Timeline]], tag it inline:

```
The party seized the Winter Palace that night. [event:: 1917-11-07 | October Revolution begins]
```

Rules: the date can be `1917`, `1917-11`, or `1917-11-07`; the text after the `|` becomes the timeline entry, which links back to the note it lives in. A note can carry any number of inline events. In Reading view they render as small amber 🕑 chips, so they sit unobtrusively at the end of the sentence they date.

**The easier way — right-click a date.** Select a written date in any note ("7 November 1917"), right-click, choose **Create event from "…"**. A dialog opens with the date already parsed into ISO form — just describe what happened and press Enter. The date in your prose gets wrapped in a small amber pill (hover it to see the event description), and the event appears on the [[Master Timeline]] linked back to the note. The typed `[event:: …]` syntax still works too; both feed the same timeline.

Use full event notes (Event Template) for major events you'll write about at length; use inline events for the dozens of small dated facts that accumulate inside location, person, and organisation notes.

---

## Home Stats, Uncertain Dates, Pseudonyms & Person Timelines (added July 2026)

### Home-page stats bar

The strip under the hero on the home page shows live counts: open `#lead` tasks, unconsulted archival documents, days to the next writing deadline, people with no `sources:` yet, and notes touched in the last 7 days. A stat is clickable when its dashboard note exists. Code: `Vault Settings/scripts/landing-stats.js`.

### Uncertain and approximate dates

Any date field — and inline `[event:: …]` events — now accepts uncertainty markers:

| You write | Displays as | Sorts at |
| --- | --- | --- |
| `~1936` (or `circa 1936`, `c. 1936`, `1936?`) | c. 1936 | start of 1936 |
| `<1940` or `before 1940` | before 1940 | just before 1940 |
| `>1936` or `after 1936` | after 1936 | just after 1936 |
| `1936..1938` (or `1936–1938` with an en-dash) | 1936–1938 | start of the range |

Markers combine with any supported date form (`~June 1936` works). Because parsing lives in the shared `_dates.js`, this propagates to every infobox, the master timeline, and person timelines. Reload Obsidian after editing `_dates.js` — the loaded copy is cached for the session.

### Pseudonym Registry

[[Pseudonym Registry]] (in the People folder, linked from the home-page footer) flattens every `aliases:` entry on person notes into one alphabetical alias → person table. When an unfamiliar name turns up in a document, check it here before creating a new person note. Aliases identical to the person's display name are omitted, so the table stays a genuine cover-name index.

### Person timelines

Every person note now ends with a collapsed **Timeline** callout — expand it for a compact chronology of the person's birth and death, every dated event note and letter that links to them, and the note's own inline events and date pills. It stays collapsed on load (the `- ` in `> [!timeline]-`) so it never gets in the way of reading. Code: `Vault Settings/scripts/person-timeline.js`; the callout lives at the foot of the Person Template, so new person notes get it automatically.
