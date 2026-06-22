/* Caption on Paste — prompts for a caption when an image is pasted,
   saves the image as an attachment, inserts the embed with the caption
   as alt text, and renders the caption beneath the image in both
   Reading view and Live Preview. */

'use strict';

const { Plugin, Modal } = require('obsidian');

class CaptionModal extends Modal {
  constructor(app, onSubmit) {
    super(app);
    this.onSubmit = onSubmit;
    this.submitted = false;
    this.value = '';
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h3', { text: 'Image caption' });

    const input = contentEl.createEl('input', {
      type: 'text',
      attr: { placeholder: 'Enter a caption (leave blank for none)' },
    });
    input.style.width = '100%';
    input.style.marginTop = '0.4em';

    const submit = () => {
      this.submitted = true;
      this.value = input.value.trim();
      this.close();
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit();
      }
    });

    const row = contentEl.createDiv();
    row.style.marginTop = '0.9em';
    row.style.textAlign = 'right';

    const skipBtn = row.createEl('button', { text: 'No caption' });
    skipBtn.style.marginRight = '0.5em';
    skipBtn.addEventListener('click', () => {
      this.submitted = true;
      this.value = '';
      this.close();
    });

    const okBtn = row.createEl('button', { text: 'Insert', cls: 'mod-cta' });
    okBtn.addEventListener('click', submit);

    window.setTimeout(() => input.focus(), 10);
  }

  onClose() {
    this.contentEl.empty();
    this.onSubmit(this.submitted ? this.value : '');
  }
}

module.exports = class CaptionOnPastePlugin extends Plugin {
  async onload() {
    // 1. Intercept image pastes
    this.registerEvent(
      this.app.workspace.on('editor-paste', (evt, editor, view) => {
        const files = evt.clipboardData ? evt.clipboardData.files : null;
        if (!files || files.length === 0) return;
        const images = Array.from(files).filter((f) =>
          f.type.startsWith('image/')
        );
        if (images.length === 0) return;
        evt.preventDefault();
        this.handlePaste(images, editor, view).catch(console.error);
      })
    );

    // 2. Render captions under embedded images (Reading view + Live Preview)
    this.observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          if (node.matches && node.matches('.image-embed')) {
            this.addCaption(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('.image-embed').forEach((el) =>
              this.addCaption(el)
            );
          }
        }
      }
    });
    this.observer.observe(document.body, { childList: true, subtree: true });

    // Caption anything already rendered
    document
      .querySelectorAll('.image-embed')
      .forEach((el) => this.addCaption(el));
  }

  onunload() {
    if (this.observer) this.observer.disconnect();
    document
      .querySelectorAll('.cop-image-caption')
      .forEach((el) => el.remove());
    document
      .querySelectorAll('.cop-captioned')
      .forEach((el) => el.classList.remove('cop-captioned'));
  }

  async handlePaste(images, editor, view) {
    for (const image of images) {
      const caption = await new Promise((resolve) => {
        new CaptionModal(this.app, resolve).open();
      });

      const ext = (image.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
      const stamp = window.moment
        ? window.moment().format('YYYYMMDDHHmmss')
        : String(Date.now());
      const baseName = `Pasted image ${stamp}.${ext}`;
      const sourcePath = view && view.file ? view.file.path : '';

      let path = baseName;
      try {
        path = await this.app.fileManager.getAvailablePathForAttachment(
          baseName,
          sourcePath
        );
      } catch (e) {
        /* fall back to vault root */
      }

      const data = await image.arrayBuffer();
      const tfile = await this.app.vault.createBinary(path, data);

      let link;
      try {
        link = this.app.fileManager.generateMarkdownLink(
          tfile,
          sourcePath,
          undefined,
          caption || undefined
        );
        if (!link.startsWith('!')) link = '!' + link;
      } catch (e) {
        link = caption
          ? `![[${tfile.name}|${caption}]]`
          : `![[${tfile.name}]]`;
      }

      editor.replaceSelection(link + '\n');
    }
  }

  addCaption(embed) {
    if (embed.querySelector(':scope > .cop-image-caption')) return;

    const alt = embed.getAttribute('alt');
    const src = embed.getAttribute('src') || '';
    if (!alt) return;

    // Skip when alt is just the filename (no caption was given)
    const base = src.split('/').pop();
    const baseNoExt = base ? base.replace(/\.[^.]+$/, '') : '';
    if (alt === src || alt === base || alt === baseNoExt) return;

    // Skip pure size specs like "300" or "300x200"
    const stripped = alt
      .split('|')
      .filter((part) => !/^\d+(x\d+)?$/.test(part.trim()))
      .join('|')
      .trim();
    if (!stripped || stripped === base || stripped === baseNoExt) return;

    const cap = document.createElement('div');
    cap.className = 'cop-image-caption';
    cap.textContent = stripped;
    embed.classList.add('cop-captioned');
    embed.appendChild(cap);
  }
};
