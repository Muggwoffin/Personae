/* Research Tools — paste coordinates from the clipboard into the
   current note. Copy "lat, long" from Google Maps (right-click a spot,
   click the coordinates), then run the command: it fills the frontmatter
   field and, for location notes, the embedded leaflet map and marker. */

'use strict';

const { Plugin, Notice, MarkdownView, Modal } = require('obsidian');

const MONTHS_MAP = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7,
  august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8,
  sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

/* "11 July 1936" / "July 11, 1936" / "July 1936" / "1936" /
   "11.7.1936" / "1936-07-11"  →  ISO-ish date string (or "") */
function parseLooseDate(s) {
  s = String(s).trim();
  const pad = (n) => String(n).padStart(2, '0');
  let m = s.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (m) return s;
  m = s.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?([A-Za-z]+),?\s+(\d{4})$/);
  if (m && MONTHS_MAP[m[2].toLowerCase()]) return m[3] + '-' + pad(MONTHS_MAP[m[2].toLowerCase()]) + '-' + pad(m[1]);
  m = s.match(/^([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/);
  if (m && MONTHS_MAP[m[1].toLowerCase()]) return m[3] + '-' + pad(MONTHS_MAP[m[1].toLowerCase()]) + '-' + pad(m[2]);
  m = s.match(/^([A-Za-z]+),?\s+(\d{4})$/);
  if (m && MONTHS_MAP[m[1].toLowerCase()]) return m[2] + '-' + pad(MONTHS_MAP[m[1].toLowerCase()]);
  m = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (m) return m[3] + '-' + pad(m[2]) + '-' + pad(m[1]);
  m = s.match(/^(\d{4})$/);
  if (m) return m[1];
  return '';
}

class CreateEventModal extends Modal {
  constructor(app, selectedText, onSubmit) {
    super(app);
    this.selectedText = selectedText;
    this.onSubmit = onSubmit;
    this.submitted = false;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h3', { text: 'Create event' });

    contentEl.createEl('div', { text: 'Date', cls: 'setting-item-name' });
    const dateInput = contentEl.createEl('input', {
      type: 'text',
      attr: { placeholder: 'YYYY-MM-DD (year or year-month also fine)' },
    });
    dateInput.style.width = '100%';
    dateInput.value = parseLooseDate(this.selectedText);

    const hint = contentEl.createEl('div', {
      text: 'Pre-filled from “' + this.selectedText + '”',
    });
    hint.style.cssText = 'font-size:0.75em;color:var(--text-muted);margin:0.2em 0 0.8em;';

    contentEl.createEl('div', { text: 'What happened?', cls: 'setting-item-name' });
    const descInput = contentEl.createEl('input', {
      type: 'text',
      attr: { placeholder: 'e.g. First meeting with comrades in Geneva' },
    });
    descInput.style.width = '100%';

    const submit = () => {
      const date = dateInput.value.trim();
      if (!/^\d{4}(-\d{2}){0,2}$/.test(date)) {
        new Notice('Date must be YYYY, YYYY-MM, or YYYY-MM-DD.');
        return;
      }
      this.submitted = true;
      this.result = { date, desc: descInput.value.trim() };
      this.close();
    };
    for (const el of [dateInput, descInput]) {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
      });
    }
    const row = contentEl.createDiv();
    row.style.cssText = 'margin-top:1em;text-align:right;';
    const ok = row.createEl('button', { text: 'Create event', cls: 'mod-cta' });
    ok.addEventListener('click', submit);

    window.setTimeout(() => descInput.focus(), 10);
  }
  onClose() {
    this.contentEl.empty();
    this.onSubmit(this.submitted ? this.result : null);
  }
}

class CreateLeadModal extends Modal {
  constructor(app, selectedText, onSubmit) {
    super(app);
    this.selectedText = selectedText;
    this.onSubmit = onSubmit;
    this.submitted = false;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h3', { text: 'Create research lead' });

    const ctx = contentEl.createEl('div', { text: '“' + this.selectedText + '”' });
    ctx.style.cssText = 'font-size:0.8em;font-style:italic;color:var(--text-muted);margin-bottom:0.8em;border-left:2px solid var(--interactive-accent);padding-left:0.6em;';

    contentEl.createEl('div', { text: 'The lead — what should be chased?', cls: 'setting-item-name' });
    const leadInput = contentEl.createEl('input', {
      type: 'text',
      attr: { placeholder: 'e.g. Check the regional archive for correspondence' },
    });
    leadInput.style.width = '100%';
    leadInput.value = this.selectedText;
    leadInput.select();

    const submit = () => {
      const lead = leadInput.value.trim();
      if (!lead) { new Notice('Write the lead first.'); return; }
      this.submitted = true;
      this.result = lead;
      this.close();
    };
    leadInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
    });
    const row = contentEl.createDiv();
    row.style.cssText = 'margin-top:1em;text-align:right;';
    const ok = row.createEl('button', { text: 'Create lead', cls: 'mod-cta' });
    ok.addEventListener('click', submit);

    window.setTimeout(() => leadInput.focus(), 10);
  }
  onClose() {
    this.contentEl.empty();
    this.onSubmit(this.submitted ? this.result : null);
  }
}

const CALLOUT_TYPES = [
  { type: 'memoir', label: 'Memoir', icon: 'feather' },
  { type: 'source', label: 'Source', icon: 'book-open' },
  { type: 'archive', label: 'Archive', icon: 'archive' },
  { type: 'report', label: 'Report', icon: 'file-text' },
  { type: 'translation', label: 'Translation', icon: 'languages' },
  { type: 'idea', label: 'Idea', icon: 'lightbulb' },
];

/* Wrap a (possibly multi-line) selection in a callout, prefixing every line
   with "> " and putting the optional title on the [!type] line. */
function buildCallout(type, title, selection) {
  const body = selection
    .split('\n')
    .map((line) => (line.trim() ? '> ' + line : '>'))
    .join('\n');
  const t = (title || '').trim();
  return '> [!' + type + ']' + (t ? ' ' + t : '') + '\n' + body;
}

class ExtractCalloutModal extends Modal {
  constructor(app, typeLabel, selectedText, onSubmit) {
    super(app);
    this.typeLabel = typeLabel;
    this.selectedText = selectedText;
    this.onSubmit = onSubmit;
    this.submitted = false;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h3', { text: 'Extract to ' + this.typeLabel + ' callout' });

    const preview =
      this.selectedText.length > 220
        ? this.selectedText.slice(0, 220) + '…'
        : this.selectedText;
    const ctx = contentEl.createEl('div', { text: '“' + preview + '”' });
    ctx.style.cssText =
      'font-size:0.8em;font-style:italic;color:var(--text-muted);margin-bottom:0.8em;border-left:2px solid var(--interactive-accent);padding-left:0.6em;white-space:pre-wrap;max-height:8em;overflow:auto;';

    contentEl.createEl('div', {
      text: 'What is the title of this quote box?',
      cls: 'setting-item-name',
    });
    const titleInput = contentEl.createEl('input', {
      type: 'text',
      attr: { placeholder: 'e.g. Author, Title, p. 42  —  or leave blank' },
    });
    titleInput.style.width = '100%';

    const submit = () => {
      this.submitted = true;
      this.result = titleInput.value;
      this.close();
    };
    titleInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
    });
    const row = contentEl.createDiv();
    row.style.cssText = 'margin-top:1em;text-align:right;';
    const ok = row.createEl('button', { text: 'Create callout', cls: 'mod-cta' });
    ok.addEventListener('click', submit);

    window.setTimeout(() => titleInput.focus(), 10);
  }
  onClose() {
    this.contentEl.empty();
    this.onSubmit(this.submitted ? this.result : null);
  }
}

const RELATIONS = [
  { label: 'Father',  field: 'father',   recip: 'children', icon: 'user' },
  { label: 'Mother',  field: 'mother',   recip: 'children', icon: 'user' },
  { label: 'Sibling', field: 'siblings', recip: 'siblings', icon: 'users' },
  { label: 'Spouse',  field: 'spouse',   recip: 'spouse',   icon: 'heart' },
  { label: 'Partner', field: 'partner',  recip: 'partner',  icon: 'heart' },
  { label: 'Child',   field: 'children', recip: null,       icon: 'baby' },
  { label: 'Aunt',    field: 'aunts',    recip: null,       icon: 'users' },
  { label: 'Uncle',   field: 'uncles',   recip: null,       icon: 'users' },
  { label: 'Niece',   field: 'nieces',   recip: null,       icon: 'users' },
  { label: 'Nephew',  field: 'nephews',  recip: null,       icon: 'users' },
  { label: 'Cousin',  field: 'cousins',  recip: 'cousins',  icon: 'users' },
];

/* Append a [[link]] to a frontmatter field, coercing it to a list and
   skipping duplicates. */
function addToList(cur, link) {
  const arr = Array.isArray(cur) ? cur.slice() : (cur ? [cur] : []);
  if (!arr.includes(link)) arr.push(link);
  return arr;
}

function parseCoords(text) {
  if (!text) return null;
  const m = String(text).match(/(-?\d{1,3}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/);
  if (!m) return null;
  const lat = parseFloat(m[1]);
  const lng = parseFloat(m[2]);
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat: m[1], lng: m[2] };
}

/* Modal for the journey map: one row per stop (coordinates, label, date),
   add/remove rows, then build a Leaflet block of numbered dated markers
   plus a GeoJSON line through them. */
class JourneyModal extends Modal {
  constructor(app, onSubmit) {
    super(app);
    this.onSubmit = onSubmit;
    this.submitted = false;
    this.rows = [];
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h3', { text: 'Insert journey map' });

    const help = contentEl.createEl('div', {
      text: 'Add each stop in order. Copy “lat, lng” from Google Maps (right-click a spot, click the coordinates), then label and date the stop.',
    });
    help.style.cssText = 'font-size:0.8em;color:var(--text-muted);margin-bottom:0.8em;';

    const list = contentEl.createDiv();

    const addRow = (coords, label, date) => {
      const r = list.createDiv();
      r.style.cssText = 'display:flex;gap:0.4em;margin-bottom:0.4em;align-items:center;';
      const coordEl = r.createEl('input', { type: 'text', attr: { placeholder: '48.8566, 2.3522' } });
      coordEl.style.cssText = 'flex:1.5;min-width:0;';
      coordEl.value = coords || '';
      const labelEl = r.createEl('input', { type: 'text', attr: { placeholder: 'Paris' } });
      labelEl.style.cssText = 'flex:1.2;min-width:0;';
      labelEl.value = label || '';
      const dateEl = r.createEl('input', { type: 'text', attr: { placeholder: '1937' } });
      dateEl.style.cssText = 'flex:0.8;min-width:0;';
      dateEl.value = date || '';
      const del = r.createEl('button', { text: '×' });
      del.style.cssText = 'flex:0 0 auto;padding:0 0.55em;';
      const entry = { coordEl, labelEl, dateEl };
      del.addEventListener('click', () => {
        this.rows = this.rows.filter((x) => x !== entry);
        r.remove();
      });
      this.rows.push(entry);
      return entry;
    };

    addRow(); addRow(); addRow();

    const addBtn = contentEl.createEl('button', { text: '+ Add stop' });
    addBtn.style.cssText = 'margin-top:0.2em;';
    addBtn.addEventListener('click', () => addRow());

    const footer = contentEl.createDiv();
    footer.style.cssText = 'margin-top:1em;display:flex;justify-content:flex-end;gap:0.5em;';
    const insert = footer.createEl('button', { text: 'Insert map', cls: 'mod-cta' });
    insert.addEventListener('click', () => {
      const stops = [];
      for (const e of this.rows) {
        const c = parseCoords(e.coordEl.value);
        if (!c) continue;
        stops.push({
          lat: c.lat,
          lng: c.lng,
          label: e.labelEl.value.trim().replace(/["\n\r]/g, ''),
          date: e.dateEl.value.trim().replace(/["\n\r]/g, ''),
        });
      }
      if (stops.length < 2) { new Notice('Add at least two stops with valid coordinates.'); return; }
      this.submitted = true;
      this.result = stops;
      this.close();
    });

    window.setTimeout(() => { const i = list.querySelector('input'); if (i) i.focus(); }, 10);
  }
  onClose() {
    this.contentEl.empty();
    this.onSubmit(this.submitted ? this.result : null);
  }
}

/* Build a Chicago manuscript NOTE-form citation from an archival source's
   frontmatter (mirrors source-infobox.js). titled === true quotes the title. */
const CIT_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
function citationDate(raw) {
  if (raw == null || String(raw).trim() === '') return '';
  const s = String(raw).trim();
  let m;
  if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})/))) return CIT_MONTHS[+m[2] - 1] + ' ' + (+m[3]) + ', ' + m[1];
  if ((m = s.match(/^(\d{4})-(\d{2})$/)))        return CIT_MONTHS[+m[2] - 1] + ' ' + m[1];
  if ((m = s.match(/^(\d{4})$/)))                return m[1];
  return s;
}
function chicagoNoteCitation(name, fm) {
  const clean = (x) => (x == null ? '' : String(x).trim());
  const cDate = citationDate(fm.document_date) || 'n.d.';
  const tail = [cDate, fm.box_or_folder, fm.document_reference, fm.collection, fm.archive].map(clean).filter(Boolean);
  return fm.titled === true
    ? '"' + clean(name) + ',"' + (tail.length ? ' ' + tail.join(', ') : '') + '.'
    : [clean(name), ...tail].join(', ') + '.';
}

/* Chicago manuscript NOTE-form citation for a letter (mirrors
   correspondence-infobox.js): "Author to Recipient, date, box/folder,
   [ref], collection, repository." */
function chicagoLetterCitation(fm) {
  const clean = (x) => (x == null ? '' : String(x).trim());
  const nameOf = (v) => {
    if (v == null) return '';
    const s = Array.isArray(v) ? v[0] : v;
    const str = String(s == null ? '' : s).trim();
    const m = str.match(/^\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]$/);
    if (m) return (m[2] || m[1].split('/').pop()).trim();
    return str.replace(/^\[\[|\]\]$/g, '');
  };
  const author = nameOf(fm.author), recipient = nameOf(fm.recipient);
  const cDate = citationDate(fm.document_date) || 'n.d.';
  const head = (author && recipient) ? author + ' to ' + recipient : (author || recipient || clean(fm.name));
  const tail = [cDate, fm.box_or_folder, fm.document_reference, fm.collection, fm.archive].map(clean).filter(Boolean);
  return [head, ...tail].join(', ') + '.';
}

module.exports = class ResearchToolsPlugin extends Plugin {
  onload() {
    this.addCommand({
      id: 'paste-location-coords',
      name: 'Paste coordinates into this note (location field + map)',
      callback: () => this.pasteCoords('location', true),
    });
    this.addCommand({
      id: 'paste-death-coords',
      name: 'Paste death coordinates into this note (death_coords field)',
      callback: () => this.pasteCoords('death_coords', false),
    });
    this.addCommand({
      id: 'sync-sources',
      name: 'Sync citations in this note into the sources field',
      callback: () => this.syncSources(),
    });
    this.addCommand({
      id: 'renumber-footnotes',
      name: 'Renumber footnotes sequentially (Word-style)',
      callback: () => this.renumberFootnotes(),
    });
    this.addCommand({
      id: 'prettify-citations',
      name: 'Make citekey links readable (alias with author + year)',
      callback: () => this.prettifyCitations(),
    });
    this.addCommand({
      id: 'insert-journey-map',
      name: 'Insert journey map (route through dated places)',
      callback: () => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view || !view.file) { new Notice('Open a note first.'); return; }
        if (view.getMode() !== 'source') {
          new Notice('Switch to editing view (Ctrl/Cmd+E), place your cursor, then run this command.', 7000);
          return;
        }
        new JourneyModal(this.app, (stops) => { if (stops) this.insertJourney(view, stops); }).open();
      },
    });
    this.addCommand({
      id: 'copy-source-citation',
      name: 'Copy Chicago citation for this archival note',
      callback: () => this.copySourceCitation(),
    });
    this.addCommand({
      id: 'insert-correspondence-map',
      name: 'Insert correspondence map (letters between places)',
      callback: () => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view || !view.file) { new Notice('Open a note first.'); return; }
        if (view.getMode() !== 'source') {
          new Notice('Switch to editing view (Ctrl/Cmd+E), place your cursor, then run this command.', 7000);
          return;
        }
        this.insertCorrespondenceMap(view);
      },
    });

    // Force Reading view for notes that ask for it in frontmatter:
    //   obsidianEditingMode: preview   (or)   view_mode: reading
    this.registerEvent(
      this.app.workspace.on('file-open', async (file) => {
        if (!file) return;
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view || view.file !== file) return;
        const fm = (this.app.metadataCache.getFileCache(file) || {}).frontmatter || {};
        const mode = fm.obsidianEditingMode || fm.view_mode;
        if (mode !== 'preview' && mode !== 'reading') return;
        if (view.getMode() === 'preview') return;
        const state = view.leaf.getViewState();
        state.state.mode = 'preview';
        await view.leaf.setViewState(state);
      })
    );

    // Right-click a selection → "Create event" / "Create lead"
    this.registerEvent(
      this.app.workspace.on('editor-menu', (menu, editor) => {
        const sel = editor.getSelection();
        if (!sel) return;

        // Extract the selection into a research callout (Memoir, Source, …).
        // Works on whole paragraphs, so it's allowed for multi-line selections.
        const extractTo = (c) => {
          new ExtractCalloutModal(this.app, c.label, sel, (title) => {
            if (title === null) return;
            editor.replaceSelection(buildCallout(c.type, title, sel));
            new Notice(c.label + ' callout created.');
          }).open();
        };
        menu.addItem((item) => {
          item.setTitle('Extract to callout').setIcon('quote');
          if (typeof item.setSubmenu === 'function') {
            const sub = item.setSubmenu();
            for (const c of CALLOUT_TYPES) {
              sub.addItem((si) =>
                si.setTitle(c.label).setIcon(c.icon).onClick(() => extractTo(c))
              );
            }
          } else {
            // Older Obsidian without submenus: fall back to flat items
            item.setTitle('Extract to callout (Memoir)').onClick(() => extractTo(CALLOUT_TYPES[0]));
            for (const c of CALLOUT_TYPES.slice(1)) {
              menu.addItem((mi) =>
                mi.setTitle('Extract to callout (' + c.label + ')').setIcon(c.icon).onClick(() => extractTo(c))
              );
            }
          }
        });

        // The event and lead tools below operate on single-line selections only.
        if (sel.includes('\n')) return;
        const short = sel.length > 24 ? sel.slice(0, 24) + '…' : sel;

        if (sel.length <= 60) {
          menu.addItem((item) =>
            item
              .setTitle('Create event from "' + short + '"')
              .setIcon('calendar-plus')
              .onClick(() => {
                new CreateEventModal(this.app, sel, (result) => {
                  if (!result) return;
                  const title = result.desc
                    ? ' title="' + result.desc.replace(/"/g, '&quot;') + '"'
                    : '';
                  editor.replaceSelection(
                    '<span class="hist-event" data-date="' + result.date + '"' + title + '>' + sel + '</span>'
                  );
                  new Notice('Event added to the timeline: ' + result.date);
                }).open();
              })
          );
        }

        if (sel.length <= 300) {
          menu.addItem((item) =>
            item
              .setTitle('Create lead from "' + short + '"')
              .setIcon('search')
              .onClick(() => {
                new CreateLeadModal(this.app, sel, (lead) => {
                  if (!lead) return;
                  const lineNo = editor.getCursor('to').line;
                  const lineText = editor.getLine(lineNo);
                  editor.replaceRange(
                    '\n- [ ] ' + lead + ' #lead',
                    { line: lineNo, ch: lineText.length }
                  );
                  new Notice('Lead created — it now appears in Research Leads.');
                }).open();
              })
          );
        }

        if (sel.length <= 80) {
          const relName = sel.replace(/^\[\[|\]\]$/g, '').replace(/^"+|"+$/g, '').trim();
          menu.addItem((item) => {
            item.setTitle('Add "' + short + '" as a relative').setIcon('users');
            const run = (rel) => this.addRelative(rel, relName);
            if (typeof item.setSubmenu === 'function') {
              const sub = item.setSubmenu();
              for (const rel of RELATIONS) {
                sub.addItem((si) => si.setTitle(rel.label).setIcon(rel.icon).onClick(() => run(rel)));
              }
            } else {
              for (const rel of RELATIONS) {
                menu.addItem((mi) => mi.setTitle('Relative: ' + rel.label).setIcon(rel.icon).onClick(() => run(rel)));
              }
            }
          });
        }
      })
    );
  }

  /* Add [[name]] to a relationship field in the current note's frontmatter,
     with a best-effort reciprocal link written into the target note. */
  async addRelative(rel, name) {
    if (!name) { new Notice('Select a name first.'); return; }
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || !view.file) { new Notice('Open a note first.'); return; }
    const link = '[[' + name + ']]';
    await this.app.fileManager.processFrontMatter(view.file, (fm) => {
      fm[rel.field] = addToList(fm[rel.field], link);
    });
    if (rel.recip) {
      const dest = this.app.metadataCache.getFirstLinkpathDest(name, view.file.path);
      if (dest) {
        const back = '[[' + view.file.basename + ']]';
        await this.app.fileManager.processFrontMatter(dest, (fm) => {
          fm[rel.recip] = addToList(fm[rel.recip], back);
        });
      }
    }
    new Notice(name + ' added as ' + rel.label.toLowerCase() + '.');
  }

  /* Renumber all footnotes 1..n in order of first appearance in the text,
     and gather the definitions, sorted, at the end of the note. */
  async renumberFootnotes() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || !view.file) {
      new Notice('Open a note first.');
      return;
    }
    const editor = view.editor;
    const text = editor.getValue();
    const lines = text.split('\n');

    // collect single-line definitions (this vault's style)
    const defs = {};
    const bodyLines = [];
    for (const line of lines) {
      const m = line.match(/^\[\^([^\]]+)\]:\s?(.*)$/);
      if (m) {
        defs[m[1]] = m[2];
      } else {
        bodyLines.push(line);
      }
    }
    let body = bodyLines.join('\n').replace(/\n{3,}$/, '\n');

    // order of first reference in the body
    const order = [];
    for (const m of body.matchAll(/\[\^([^\]]+)\](?!:)/g)) {
      if (!order.includes(m[1])) order.push(m[1]);
    }
    if (!order.length) {
      new Notice('No footnote references found.');
      return;
    }

    // build mapping old -> 1..n (referenced first, then orphan defs)
    const mapping = {};
    let n = 0;
    for (const id of order) mapping[id] = ++n;
    const orphans = Object.keys(defs).filter((id) => !(id in mapping));
    for (const id of orphans) mapping[id] = ++n;
    const missing = order.filter((id) => !(id in defs));

    // rewrite refs via collision-proof temp tokens
    for (const [oldId, num] of Object.entries(mapping)) {
      body = body.split('[^' + oldId + ']').join('[^ ' + num + ' ]');
    }
    body = body.replace(/\[\^ (\d+) \]/g, '[^$1]');

    // append sorted definitions
    const defBlock = Object.entries(mapping)
      .sort((a, b) => a[1] - b[1])
      .filter(([oldId]) => oldId in defs)
      .map(([oldId, num]) => '[^' + num + ']: ' + defs[oldId])
      .join('\n\n');
    const result = body.replace(/\n+$/, '') + '\n\n' + defBlock + '\n';

    editor.setValue(result);
    let msg = `Renumbered ${order.length} footnote(s)` +
      (orphans.length ? `; ${orphans.length} unreferenced definition(s) kept at the end` : '') +
      (missing.length ? `; ⚠️ refs without definitions: ${missing.map((x) => '[^' + x + ']').join(' ')}` : '') + '.';
    new Notice(msg, 6000);
  }

  /* Collect every link in this note that resolves into Zotero/Highlights/
     and merge the citekeys into the frontmatter sources: list. */
  async syncSources() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || !view.file) {
      new Notice('Open a note first.');
      return;
    }
    const cache = this.app.metadataCache.getFileCache(view.file);
    const links = (cache && cache.links) || [];
    const cited = new Set();
    for (const l of links) {
      const dest = this.app.metadataCache.getFirstLinkpathDest(l.link, view.file.path);
      if (dest && dest.path.startsWith('Zotero/Highlights/')) cited.add(dest.basename);
    }
    if (!cited.size) {
      new Notice('No citations to Zotero sources found in this note. (Citekeys without a source record are skipped — see the Bibliography watchdog.)');
      return;
    }
    let added = 0;
    await this.app.fileManager.processFrontMatter(view.file, (fm) => {
      const existing = Array.isArray(fm.sources) ? fm.sources : (fm.sources ? [fm.sources] : []);
      const have = new Set();
      for (const e of existing) {
        const m = String(e).match(/\[\[([^\]|]+)/);
        have.add(m ? m[1].split('/').pop() : String(e));
      }
      for (const key of cited) {
        if (!have.has(key)) {
          existing.push('[[' + key + ']]');
          added++;
        }
      }
      fm.sources = existing;
    });
    new Notice(added ? `Added ${added} source(s) to the sources field.` : 'sources field already up to date.');
  }

  /* Replace bare [[citekey]] links with [[citekey|Author (Year)]] using
     the source record's frontmatter. Skips links that already have an alias. */
  async prettifyCitations() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || !view.file) {
      new Notice('Open a note first.');
      return;
    }
    const text = await this.app.vault.read(view.file);
    // operate on the body only — keep frontmatter sources: entries as bare keys
    let bodyStart = 0;
    if (text.startsWith('---')) {
      const fmEnd = text.indexOf('\n---', 3);
      if (fmEnd > -1) bodyStart = fmEnd + 4;
    }
    const head = text.slice(0, bodyStart);
    let count = 0;
    const updated = head + text.slice(bodyStart).replace(/\[\[([^\]|#]+)\]\]/g, (whole, target) => {
      const dest = this.app.metadataCache.getFirstLinkpathDest(target, view.file.path);
      if (!dest || !dest.path.startsWith('Zotero/Highlights/')) return whole;
      const fm = (this.app.metadataCache.getFileCache(dest) || {}).frontmatter || {};
      const authors = fm.authors ? String(fm.authors) : null;
      const year = fm.year ? String(fm.year) : null;
      if (!authors) return whole;
      count++;
      const label = year ? authors + ' (' + year + ')' : authors;
      return '[[' + target + '|' + label + ']]';
    });
    if (count) {
      await this.app.vault.modify(view.file, updated);
      new Notice(`Aliased ${count} citation(s).`);
    } else {
      new Notice('No bare citekey links found (already aliased, or no source records yet).');
    }
  }

  async pasteCoords(field, updateMap) {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || !view.file) {
      new Notice('Open a note first.');
      return;
    }
    let clip = '';
    try {
      clip = await navigator.clipboard.readText();
    } catch (e) {
      /* clipboard unavailable */
    }
    const c = parseCoords(clip);
    if (!c) {
      new Notice(
        "Clipboard doesn't look like coordinates.\nIn Google Maps: right-click the spot, click the coordinates to copy, then run this command again.",
        7000
      );
      return;
    }
    await this.app.fileManager.processFrontMatter(view.file, (fm) => {
      // strings, not numbers — Obsidian's properties panel only supports
      // lists of strings ("multitext"); numeric lists trigger the
      // "unknown data" warning
      fm[field] = [c.lat, c.lng];
    });
    if (updateMap) {
      const text = await this.app.vault.read(view.file);
      const updated = this.fillLeafletBlock(text, c, view.file.basename);
      if (updated !== text) await this.app.vault.modify(view.file, updated);
    }
    new Notice('Coordinates set: ' + c.lat + ', ' + c.lng);
  }

  fillLeafletBlock(text, c, title) {
    return text.replace(/```leaflet\r?\n([\s\S]*?)```/, (whole, body) => {
      let b = body
        .replace(/^lat:.*$/m, 'lat: ' + c.lat)
        .replace(/^long:.*$/m, 'long: ' + c.lng);
      const emptyMarker = new RegExp('^marker: default,\\s*,\\s*,\\s*"(.*)"\\s*$', 'm');
      const anyMarker = new RegExp('^marker: default,\\s*[^,]*,\\s*[^,]*,\\s*"(.*)"\\s*$', 'm');
      if (emptyMarker.test(b)) {
        // empty placeholder marker — fill it, keep its label
        b = b.replace(emptyMarker, 'marker: default, ' + c.lat + ', ' + c.lng + ', "$1"');
      } else if (!/^marker:/m.test(b)) {
        b += 'marker: default, ' + c.lat + ', ' + c.lng + ', "' + title + '"\n';
      } else {
        // existing marker — update its coordinates, keep its label
        b = b.replace(anyMarker, 'marker: default, ' + c.lat + ', ' + c.lng + ', "$1"');
      }
      return '```leaflet\n' + b + '```';
    });
  }

  async insertJourney(view, stops) {
    const slug =
      view.file.basename.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'note';
    const id = slug + '-journey-' + Date.now().toString(36);

    // 1. GeoJSON LineString sidecar = the connecting route (spec order: lng, lat)
    const geo = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { title: 'Journey' },
          geometry: {
            type: 'LineString',
            coordinates: stops.map((s) => [parseFloat(s.lng), parseFloat(s.lat)]),
          },
        },
      ],
    };
    const folder = 'Attachments/Journeys';
    if (!this.app.vault.getAbstractFileByPath(folder)) {
      try { await this.app.vault.createFolder(folder); } catch (e) { /* already exists */ }
    }
    try {
      await this.app.vault.create(folder + '/' + id + '.geojson', JSON.stringify(geo, null, 2));
    } catch (e) { /* if it somehow exists, the block still renders its markers */ }

    // 2. Leaflet block — numbered, dated markers + the route line, fit to bounds
    const lats = stops.map((s) => parseFloat(s.lat));
    const lngs = stops.map((s) => parseFloat(s.lng));
    const r2 = (n) => Math.round(n * 1e4) / 1e4;
    const pad = 0.4;
    const bounds =
      '[[' + r2(Math.min(...lats) - pad) + ', ' + r2(Math.min(...lngs) - pad) + '], [' +
      r2(Math.max(...lats) + pad) + ', ' + r2(Math.max(...lngs) + pad) + ']]';
    const markers = stops
      .map((s, i) => {
        const lbl = (i + 1) + (s.label ? ' · ' + s.label : '') + (s.date ? ' (' + s.date + ')' : '');
        return 'marker: default, ' + s.lat + ', ' + s.lng + ', "' + lbl + '"';
      })
      .join('\n');

    const block =
      '```leaflet\n' +
      'id: ' + id + '\n' +
      'height: 440px\n' +
      'tileServer: https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}\n' +
      'geojson: [[' + id + '.geojson]]\n' +
      'geojsonColor: #8C3335\n' +
      markers + '\n' +
      'bounds: ' + bounds + '\n' +
      '```\n';

    view.editor.replaceSelection(block);
    new Notice('Journey map inserted (' + stops.length + ' stops).');
  }

  // Get the first [[link]] target out of a frontmatter value (string or array).
  firstLinkpath(v) {
    if (v == null) return null;
    const s = Array.isArray(v) ? v[0] : v;
    if (s == null) return null;
    const str = String(s).trim();
    const m = str.match(/^\[\[([^\]|#]+)/);
    return (m ? m[1] : str).trim();
  }

  // Resolve a Location note (by linkpath) to its coordinates from the shared
  // `location: [lat, lng]` frontmatter field.
  locCoords(linkpath, sourcePath) {
    if (!linkpath) return null;
    const dest = this.app.metadataCache.getFirstLinkpathDest(linkpath, sourcePath);
    if (!dest) return null;
    const lfm = (this.app.metadataCache.getFileCache(dest) || {}).frontmatter || {};
    const loc = lfm.location;
    if (!Array.isArray(loc) || loc.length < 2) return null;
    const lat = parseFloat(loc[0]), lng = parseFloat(loc[1]);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng, name: lfm.name || dest.basename };
  }

  // Build a Leaflet map of every archival_correspondence note: a line from each
  // letter's author_location to its recipient_location, with place markers.
  async insertCorrespondenceMap(view) {
    const r2 = (n) => Math.round(n * 1e4) / 1e4;
    const letters = [];
    const places = new Map();
    let skipped = 0;
    for (const f of this.app.vault.getMarkdownFiles()) {
      const fm = (this.app.metadataCache.getFileCache(f) || {}).frontmatter || {};
      if (fm.type !== 'archival_correspondence') continue;
      const from = this.locCoords(this.firstLinkpath(fm.author_location), f.path);
      const to = this.locCoords(this.firstLinkpath(fm.recipient_location), f.path);
      if (!from || !to) { skipped++; continue; }
      places.set(from.name, from);
      places.set(to.name, to);
      letters.push({ from, to, title: fm.name || f.basename });
    }
    if (!letters.length) {
      new Notice('No correspondence with two mappable locations found. Set author_location and recipient_location to Location notes that have coordinates.', 8000);
      return;
    }
    const slug = view.file.basename.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'note';
    const id = slug + '-correspondence-' + Date.now().toString(36);

    // GeoJSON sidecar = one LineString per letter (spec order: lng, lat)
    const geo = {
      type: 'FeatureCollection',
      features: letters.map((L) => ({
        type: 'Feature',
        properties: { title: L.title },
        geometry: { type: 'LineString', coordinates: [[L.from.lng, L.from.lat], [L.to.lng, L.to.lat]] },
      })),
    };
    const folder = 'Attachments/Journeys';
    if (!this.app.vault.getAbstractFileByPath(folder)) {
      try { await this.app.vault.createFolder(folder); } catch (e) { /* already exists */ }
    }
    try {
      await this.app.vault.create(folder + '/' + id + '.geojson', JSON.stringify(geo, null, 2));
    } catch (e) { /* if it exists, the block still renders its markers */ }

    const pts = [...places.values()];
    const lats = pts.map((p) => p.lat), lngs = pts.map((p) => p.lng);
    const pad = 0.4;
    const bounds =
      '[[' + r2(Math.min(...lats) - pad) + ', ' + r2(Math.min(...lngs) - pad) + '], [' +
      r2(Math.max(...lats) + pad) + ', ' + r2(Math.max(...lngs) + pad) + ']]';
    const markers = pts
      .map((p) => 'marker: default, ' + p.lat + ', ' + p.lng + ', "' + String(p.name).replace(/"/g, '') + '"')
      .join('\n');

    const block =
      '```leaflet\n' +
      'id: ' + id + '\n' +
      'height: 440px\n' +
      'tileServer: https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}\n' +
      'geojson: [[' + id + '.geojson]]\n' +
      'geojsonColor: #6E5AA0\n' +
      markers + '\n' +
      'bounds: ' + bounds + '\n' +
      '```\n';

    view.editor.replaceSelection(block);
    new Notice('Correspondence map inserted (' + letters.length + ' letters' + (skipped ? ', ' + skipped + ' skipped — missing coordinates' : '') + ').');
  }

  async copySourceCitation() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || !view.file) { new Notice('Open a note first.'); return; }
    const fm = (this.app.metadataCache.getFileCache(view.file) || {}).frontmatter || {};
    let cite;
    if (fm.type === 'archival_correspondence') {
      cite = chicagoLetterCitation(fm);
    } else if (fm.type === 'archival_source') {
      cite = chicagoNoteCitation(fm.name || view.file.basename, fm);
    } else {
      new Notice('Run this on an archival source or correspondence note.', 6000);
      return;
    }
    try {
      await navigator.clipboard.writeText(cite);
      new Notice('Citation copied:\n' + cite, 6000);
    } catch (e) {
      new Notice('Could not access the clipboard.');
    }
  }
};
