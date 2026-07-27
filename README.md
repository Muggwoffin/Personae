---
type: readme
cssclasses:
  - readme-note
tags:
  - meta
---
![[PersonaeLogo.png]]

[![DOI](https://zenodo.org/badge/1277071084.svg)](https://doi.org/10.5281/zenodo.21624472)
# Start Here 👋

Welcome! This vault is a complete working environment for qualitative research about *people*. 

[I am a historian](http://mauricejcasey.com) who works on early twentieth century social networks: mainly revolutionary movements that crossed borders. I always struggled to find a note-taking method that worked for me. Then I discovered Obsidian and built Personae as my own dream system for managing and visualising my research.

Personae allows you to create notes organised by people, events, places, organisations, concepts, and sources, **all cross-linked, mapped, and timelined**. It ships with a small sample project (the Russian Revolution) so you can see everything working before you replace it with your own research.

This is just a quick intro, but for more detailed guidance read the [[Vault Guide]]. Personae is designed to work best with Zotero. You can add references manually, but with Zotero you get neat features like an auto-updating bibliography, along with easy note and highlighting imports.

## First five minutes

- [ ] **Enable the machinery.** Go to *Settings → Community plugins*, turn off Restricted mode, and enable the plugins. Then open [[Health Check]] — it will tell you if anything's missing.
- [ ] **Open [[Project Home]].** This is your front door: navigation cards, quick-capture boxes for daily notes and research logs, and quick-create buttons.
- [ ] **Look at one sample note.** Open [[Lenin Vladimir]] — note the infobox built from the frontmatter, the collapsible Contents, and the Related Notes chips at the bottom. Then [[Petrograd]] for the embedded map.
- [ ] **See the big picture.** Open [[Master Timeline]] (every dated thing in the vault, in one chronology) and [[Network Map]] (everything geographic).

## Your first notes

- [ ] **Create a person.** Right-click `Research Project/People` → *New note* → type a name. The Person Template applies itself automatically. (Or use the quick-create buttons on Project Home.) Fill in a `birth_date` and watch the timeline pick it up.
- [ ] **Create a location.** Same trick in `Locations/` — you'll be prompted to paste coordinates straight from Google Maps (right-click a spot there → click the coordinates to copy).
- [ ] **Write an inline event.** In any note, write a dated sentence and tag it: `[event:: 1903-08-01 | Party congress splits]`. It appears on the Master Timeline instantly, linked back to your note.
- [ ] **Quote a source.** Try a source callout: start a line with `> [!memoir] Author, p. 42` and the quote beneath it.

## Conventions worth knowing

**Person filenames are `Surname Firstname`** (e.g. `Lenin Vladimir.md`), with the display-order name in the `name:` frontmatter field. **Portrait photos** go in `Attachments/Images/` named `Firstname Surname.jpg` — infoboxes find them automatically. **Pasted images** prompt you for a caption and save themselves to `Attachments/Images/Pasted/`. **Citations** are `[[citekey]]` wikilinks that feed the [[Project Bibliography]] via Zotero — see the [[Vault Guide]] for the full workflow.

## Making it yours

1. Work through the sample notes above, then delete them (the six notes in `Research Project/` subfolders, plus `Lenin Biography`).
2. Keep the folder *names* (`Research Project`, `People`, `Events`…) — the Home page cards and folder templates point at these paths. Your project's identity lives in your notes, not the folder names. (If you must rename, search-and-replace the old paths inside `Project Home` and the Templater folder-template settings.)
3. For teams: see *Git, Backup & Collaboration* in the [[Vault Guide]] — private GitHub repo, auto-sync, and per-line authorship colours.

## When something looks wrong

Raw code instead of tables or infoboxes → plugins aren't enabled ([[Health Check]] diagnoses this). Styling looks off → toggle the `readability` snippet in *Settings → Appearance → CSS snippets*. Everything else → the [[Vault Guide]] documents every system in this vault, beginner-first.
