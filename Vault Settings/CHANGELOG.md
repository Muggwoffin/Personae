            # Changelog

All notable changes to the Personae template.

## 1.3.0 — June 2026

- **Editorial typography**: a refined heading hierarchy (serif headings, a hairline rule under each section, a tinted sub-heading and a small-caps kicker) and a capped reading measure, so long prose sits at a comfortable line length in Reading view while infoboxes, maps, tables and images still break out to the full width.
- **Metadata pills**: list and tag properties render as warm rounded pills inside a softly framed properties panel.
- **Landing hero**: the project home opens with a titled hero banner (kicker, title, tagline) in place of the bare note title.
- **Journey map command**: run *Insert journey map* from the command palette, add a list of stops (coordinates, label, date), and a Leaflet map is inserted at the cursor — numbered, dated markers connected by a route line (drawn from a small GeoJSON file written to `Attachments/Journeys`). Not attached to any template; insert it wherever a route matters.

## 1.2.0 — June 2026

- **Self-drawing maps**: a location note's map reads its `location` property directly (via Leaflet's `markerFile`/`coordinates`), so it can't be left stranded at 0,0; and the Network Map's **Locations** and **Birthplaces** layers auto-collect markers from every note's `location` via `markerFolder` — no manual marker lines. Fill `location` quickly with the "Paste coordinates" command. (Deaths stay manual, since Leaflet's auto-marker only reads the `location` field.)
- **More family relations**: the right-click *Add as relative* menu now covers Father, Mother, Sibling, Spouse, **Partner**, Child, Aunt, Uncle, Niece, Nephew and Cousin, and the family tree renders Siblings / Aunts & uncles / Nieces & nephews / Cousins rows. The tree now also **attributes each child to the right co-parent**: it reads the child note's own `mother`/`father`, so a child by a partner appears under that partner rather than the spouse.
- **Steadier editing around footnotes**: the tall person-note Dataview blocks — **infobox**, **family tree** and **sources** — now draw only in Reading view, not while editing. This removes an edit-mode scroll-jump (the cursor could snap to the top of the note when inserting a footnote) caused by those blocks re-rendering and losing the editor's scroll anchor. Contents, related-notes and the other note-type infoboxes still render live while you edit; press the Reading-view toggle to see the rest.
- **Removed the Timeline plugin**: the optional Visual Timeline (which relied on a third-party plugin) is gone; the dataview-powered **Master Timeline** remains. Slims the install and the bundled-license surface.
- All bundled-plugin licenses now confirmed (Leaflet is MIT, per its `package.json`).

## 1.1.0 — June 2026

- **Family tree**: a clickable tree of parents / spouse / children on every Person note (new `father` / `mother` / `spouse` / `children` fields and the `family-tree` view), plus a right-click **Add as relative** command that links two people and writes the reciprocal link automatically (Research Tools plugin). No extra plugin required.
- **Interview / fieldwork template**: a dedicated note type for oral history and qualitative research (informant, setting, consent, themes, timestamped excerpts), with its own folder, quick-create button, and a sample
- **Extract to callout**: right-click any selection → *Extract to callout* → choose Memoir / Source / Archive / Report / Translation / Idea, give it a title, and the text is wrapped as a styled callout (Research Tools plugin)
- New lightbulb **Idea callout** and a clean **Zotero citation card** for source notes
- **Mobile / narrow-pane styling**: the landing-page card grid, scratchpads, timeline, citation card and wide tables now adapt to phones (new `mobile.css` snippet)
- **Internals**: shared `_dates.js` and `_infobox.js` modules remove duplicated date/link/row code across the infoboxes and timeline; landing-page cards moved from inline styles to CSS classes
- **Slimmer install**: pared back to the plugins the template actually uses; added per-plugin licenses (`THIRD-PARTY-LICENSES.md`) and MIT license files for the three custom plugins
- Neutralised internal identifiers and class names for open release

## 1.0.0 — June 2026

Initial release.

- Structured templates for People, Events, Locations, Organisations, Concepts, Publications, Archival Sources, Writing Projects, Daily Notes, and Research Logs
- Folder templates: creating a note inside a project folder applies the right template automatically
- Quick-create buttons and quick-capture boxes on Project Home
- Self-maintaining databases (People, Concepts, Organisations) and Chicago-style Bibliography (Zotero)
- Master Timeline with inline micro-events (`[event:: 1917-11-07 | text]` in any note)
- Network Map (vintage-style cartography), Master Timeline, Network Diagram canvas
- Coordinate paste workflow: template prompt + clipboard command (Research Tools plugin)
- Caption on Paste plugin: paste an image, get asked for a caption
- Note Attribution plugin: per-line authorship colours from git history
- Readability styling: serif pull-quotes, colour-coded source callouts, image captions, styled tables and footnotes, note-type colour edges, unresolved-link styling, hover effects, dark-mode support
- Start Here tour, Health Check dashboard, and a full Vault Guide

### Updating an existing copy

All shared logic lives in `Vault Settings/scripts/` and `.obsidian/plugins/` — replacing those folders (and `.obsidian/snippets/readability.css`) updates the machinery without touching your notes.

## July 2026

- **Home-page stats bar** (`landing-stats.js`): open leads, unconsulted documents, days to next deadline, unsourced people, and notes touched this week — live, under the hero
- **Uncertain dates**: `~1936`, `before 1940`, `after 1936`, and `1936..1938` accepted by every date field and inline event; displayed as "c. 1936" etc. and sorted sensibly (`_dates.js`)
- **Pseudonym Registry**: every person alias in one alphabetical alias → person lookup table
- **Person timelines** (`person-timeline.js`): a collapsed, per-person chronology at the foot of every person note
- Health check now verifies the three new scripts
