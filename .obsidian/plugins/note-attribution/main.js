/* Note Attribution — per-line authorship from git history.
   Colored markers in the editor gutter edge (Live Preview & Source mode),
   a contributor summary modal, and a status bar legend.
   Requires: the vault to be a git repository, and git on the PATH. */

'use strict';

const { Plugin, Modal, Notice, MarkdownView, FileSystemAdapter } = require('obsidian');
const { Decoration, EditorView } = require('@codemirror/view');
const { StateField, StateEffect, RangeSetBuilder } = require('@codemirror/state');
const { spawn } = require('child_process');

const PALETTE = [
  '#b08040', '#5b7da0', '#6e8f63', '#8c3a3a',
  '#7d6a99', '#a06a8a', '#4a8f8a', '#9a7b3f',
];
const UNCOMMITTED = 'Uncommitted';
const UNCOMMITTED_COLOR = '#9a9a9a';

const setAttribution = StateEffect.define();

const attributionField = StateField.define({
  create: () => Decoration.none,
  update(deco, tr) {
    deco = deco.map(tr.changes);
    for (const e of tr.effects) {
      if (e.is(setAttribution)) deco = e.value;
    }
    return deco;
  },
  provide: (f) => EditorView.decorations.from(f),
});

function runGitBlame(vaultPath, filePath, contents) {
  return new Promise((resolve) => {
    const args = [
      '-C', vaultPath,
      'blame', '--line-porcelain', '--contents', '-',
      '--', filePath,
    ];
    let out = '';
    let err = '';
    let proc;
    try {
      proc = spawn('git', args, { cwd: vaultPath });
    } catch (e) {
      resolve(null);
      return;
    }
    proc.stdout.on('data', (d) => (out += d.toString()));
    proc.stderr.on('data', (d) => (err += d.toString()));
    proc.on('error', () => resolve(null));
    proc.on('close', (code) => {
      if (code !== 0) {
        resolve(null);
        return;
      }
      resolve(out);
    });
    proc.stdin.write(contents);
    proc.stdin.end();
  });
}

function parseBlame(porcelain) {
  // Returns Map<lineNumber, {author, time}>
  const lines = porcelain.split('\n');
  const result = new Map();
  let current = null;
  for (const line of lines) {
    if (line.startsWith('\t')) {
      current = null;
      continue;
    }
    const head = line.match(/^[0-9a-f]{40} \d+ (\d+)/);
    if (head) {
      current = { line: parseInt(head[1], 10), author: '?', time: 0 };
      result.set(current.line, current);
      continue;
    }
    if (!current) continue;
    if (line.startsWith('author ')) {
      const a = line.slice(7).trim();
      current.author = a === 'Not Committed Yet' ? UNCOMMITTED : a;
    } else if (line.startsWith('author-time ')) {
      current.time = parseInt(line.slice(12).trim(), 10);
    }
  }
  return result;
}

class SummaryModal extends Modal {
  constructor(app, fileName, stats) {
    super(app);
    this.fileName = fileName;
    this.stats = stats;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h3', { text: `Contributors — ${this.fileName}` });
    const total = this.stats.reduce((s, x) => s + x.count, 0) || 1;
    const table = contentEl.createEl('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    for (const s of this.stats) {
      const row = table.createEl('tr');
      const dotCell = row.createEl('td');
      dotCell.style.width = '1.5em';
      const dot = dotCell.createSpan();
      dot.style.display = 'inline-block';
      dot.style.width = '0.8em';
      dot.style.height = '0.8em';
      dot.style.borderRadius = '50%';
      dot.style.backgroundColor = s.color;
      row.createEl('td', { text: s.author });
      const pct = Math.round((s.count / total) * 100);
      const c = row.createEl('td', { text: `${s.count} lines (${pct}%)` });
      c.style.textAlign = 'right';
      for (const cell of row.children) {
        cell.style.padding = '0.3em 0.5em';
        cell.style.borderBottom =
          '1px solid var(--background-modifier-border)';
      }
    }
    const note = contentEl.createEl('p', {
      text: 'Based on git history. Lines not yet committed appear as "Uncommitted".',
    });
    note.style.fontSize = '0.85em';
    note.style.color = 'var(--text-muted)';
  }
  onClose() {
    this.contentEl.empty();
  }
}

module.exports = class NoteAttributionPlugin extends Plugin {
  async onload() {
    const data = (await this.loadData()) || {};
    this.authorColors = data.authorColors || {};
    this.enabled = data.enabled !== false;
    this.lastStats = null;
    this.debounceTimer = null;

    this.registerEditorExtension(attributionField);

    this.statusBar = this.addStatusBarItem();
    this.statusBar.addClass('note-attribution-status');
    this.statusBar.onClickEvent(() => this.showSummary());

    this.addCommand({
      id: 'toggle-attribution',
      name: 'Toggle attribution markers',
      callback: () => {
        this.enabled = !this.enabled;
        this.persist();
        if (this.enabled) {
          this.refresh();
        } else {
          this.clearDecorations();
          this.setStatus('attribution off');
        }
        new Notice(`Attribution markers ${this.enabled ? 'on' : 'off'}`);
      },
    });

    this.addCommand({
      id: 'show-contributors',
      name: 'Show contributors for current note',
      callback: () => this.showSummary(),
    });

    this.registerEvent(
      this.app.workspace.on('file-open', () => this.refresh())
    );
    this.registerEvent(
      this.app.workspace.on('editor-change', () => {
        if (this.debounceTimer) window.clearTimeout(this.debounceTimer);
        this.debounceTimer = window.setTimeout(() => this.refresh(), 2500);
      })
    );

    this.app.workspace.onLayoutReady(() => this.refresh());
  }

  onunload() {
    if (this.debounceTimer) window.clearTimeout(this.debounceTimer);
    this.clearDecorations();
  }

  persist() {
    this.saveData({ authorColors: this.authorColors, enabled: this.enabled });
  }

  colorFor(author) {
    if (author === UNCOMMITTED) return UNCOMMITTED_COLOR;
    if (!this.authorColors[author]) {
      const used = Object.keys(this.authorColors).length;
      this.authorColors[author] = PALETTE[used % PALETTE.length];
      this.persist();
    }
    return this.authorColors[author];
  }

  getActiveMarkdown() {
    return this.app.workspace.getActiveViewOfType(MarkdownView);
  }

  vaultBasePath() {
    const adapter = this.app.vault.adapter;
    if (adapter instanceof FileSystemAdapter) return adapter.getBasePath();
    return null;
  }

  setStatus(text) {
    this.statusBar.empty();
    this.statusBar.createSpan({ text });
  }

  clearDecorations() {
    const view = this.getActiveMarkdown();
    const cm = view && view.editor && view.editor.cm;
    if (cm) cm.dispatch({ effects: setAttribution.of(Decoration.none) });
  }

  async refresh() {
    if (!this.enabled) {
      this.setStatus('attribution off');
      return;
    }
    const view = this.getActiveMarkdown();
    if (!view || !view.file) {
      this.setStatus('');
      return;
    }
    const basePath = this.vaultBasePath();
    if (!basePath) return;

    const contents = view.editor.getValue();
    const out = await runGitBlame(basePath, view.file.path, contents);

    // The view may have changed while git ran
    const nowView = this.getActiveMarkdown();
    if (!nowView || !nowView.file || nowView.file.path !== view.file.path)
      return;
    const cm = nowView.editor && nowView.editor.cm;
    if (!cm) return;

    if (out == null) {
      this.lastStats = null;
      this.setStatus('no git history');
      cm.dispatch({ effects: setAttribution.of(Decoration.none) });
      return;
    }

    // Bail if the buffer changed while git ran (will rerun via debounce)
    if (nowView.editor.getValue() !== contents) return;

    const blame = parseBlame(out);
    const doc = cm.state.doc;
    const { decorations, counts } = this.buildDecorations(blame, doc);

    cm.dispatch({ effects: setAttribution.of(decorations) });

    const stats = Object.entries(counts)
      .map(([author, count]) => ({
        author,
        count,
        color: this.colorFor(author),
      }))
      .sort((a, b) => b.count - a.count);
    this.lastStats = { fileName: view.file.basename, stats };
    this.renderStatusBar(stats);
  }

  buildDecorations(blame, doc) {
    const builder = new RangeSetBuilder();
    const counts = {};
    for (let i = 1; i <= doc.lines; i++) {
      const info = blame.get(i);
      if (!info) continue;
      counts[info.author] = (counts[info.author] || 0) + 1;
      const color = this.colorFor(info.author);
      const when = info.time
        ? new Date(info.time * 1000).toLocaleDateString()
        : '';
      const line = doc.line(i);
      builder.add(
        line.from,
        line.from,
        Decoration.line({
          attributes: {
            class: 'note-attribution-line',
            style: `box-shadow: inset 2px 0 0 0 ${color};`,
            title: when ? `${info.author} · ${when}` : info.author,
          },
        })
      );
    }
    return { decorations: builder.finish(), counts };
  }

  renderStatusBar(stats) {
    this.statusBar.empty();
    for (const s of stats.slice(0, 4)) {
      const chip = this.statusBar.createSpan({
        cls: 'note-attribution-chip',
      });
      const dot = chip.createSpan({ cls: 'note-attribution-dot' });
      dot.style.backgroundColor = s.color;
      chip.createSpan({ text: s.author });
    }
    if (stats.length > 4) {
      this.statusBar.createSpan({ text: `+${stats.length - 4}` });
    }
  }

  showSummary() {
    if (!this.lastStats || !this.lastStats.stats.length) {
      new Notice(
        'No attribution data for this note. Is the vault a git repository with at least one commit?'
      );
      return;
    }
    new SummaryModal(
      this.app,
      this.lastStats.fileName,
      this.lastStats.stats
    ).open();
  }
};
