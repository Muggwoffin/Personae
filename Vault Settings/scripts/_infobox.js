// _infobox.js — shared link/row helpers for the infobox dataviewjs views.
// Single source of truth for the bits every infobox shared verbatim:
// link normalisation, [[wikilink]] resolution, and the fact/link row
// builders (which previously differed only by accent colour).
//
// Load once (mobile-safe — no Node require), then bind the rows to a note
// type's palette:
//   if (!globalThis.VaultInfobox) await dv.view("Vault Settings/scripts/_infobox");
//   const { factRow, linkRow } =
//     globalThis.VaultInfobox.rows(facts, app, { label:'#A07060', link:'#5A7A9E', linkHover:'#3A5A7E' });
//   factRow('Born', '13 June 1985');
//   linkRow('Affiliations', p.affiliations);
//
// NOTE: edits here only take effect after an Obsidian reload (the loaded
// copy is cached on globalThis for the session).

// Flatten a frontmatter value into a list of link-ish items.
function normalizeLinkItems(items){const out=[];const push=(x)=>{if(x==null)return;if(Array.isArray(x)){x.forEach(push);return;}if(typeof x==='object'){out.push(x);return;}const s=String(x).trim();if(!s)return;const links=s.match(/\[\[[^\]]+\]\]/g);if(links){links.forEach(l=>out.push(l));return;}out.push(s);};push(items);return out;}

// Resolve one item (Dataview link object, [[wikilink]], "path|alias", or
// bare string) to { name, path }.
function resolveItem(item){
  if(item&&typeof item==='object'&&item.path){return{name:item.display||item.path.split('/').pop().replace('.md',''),path:item.path};}
  const s=String(item).trim().replace(/^"+|"+$/g,'');
  const m=s.match(/^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/);
  if(m)return{name:m[2]||m[1].split('/').pop().replace(/\.md$/,''),path:m[1]};
  const pp=s.split('|');if(pp.length===2&&pp[0].trim())return{name:pp[1].trim(),path:pp[0].trim()};
  return{name:s,path:s};
}

// Return factRow/linkRow bound to a `facts` container and a colour palette.
// palette: { label, link, linkHover }  (separators reuse the label colour)
function rows(facts, app, palette){
  const { label, link, linkHover } = palette;
  function factRow(lbl, value){
    if(!value) return;
    const r=facts.createEl('div'); r.style.cssText='display:flex;gap:0.5rem;font-size:0.78rem;margin-bottom:0.18rem;line-height:1.4;';
    const l=r.createEl('span'); l.style.cssText=`color:${label};font-weight:600;min-width:76px;flex-shrink:0;`; l.textContent=lbl;
    const v=r.createEl('span'); v.style.cssText='color:var(--text-normal);word-break:break-word;'; v.textContent=String(value);
    return v;
  }
  function linkRow(lbl, items){
    const arr=normalizeLinkItems(items);
    if(!arr.length) return;
    const r=facts.createEl('div'); r.style.cssText='display:flex;gap:0.5rem;font-size:0.78rem;margin-bottom:0.18rem;line-height:1.4;align-items:flex-start;';
    const l=r.createEl('span'); l.style.cssText=`color:${label};font-weight:600;min-width:76px;flex-shrink:0;`; l.textContent=lbl;
    const v=r.createEl('span'); v.style.cssText='color:var(--text-normal);word-break:break-word;display:flex;flex-wrap:wrap;gap:0.2rem 0.4rem;';
    arr.forEach((item,i)=>{
      const {name,path}=resolveItem(item);
      const a=v.createEl('span');
      a.style.cssText=`color:${link};cursor:pointer;text-decoration:underline;text-underline-offset:2px;`;
      a.textContent=name;
      a.addEventListener('click',()=>app.workspace.openLinkText(path,'',false));
      a.addEventListener('mouseenter',()=>a.style.color=linkHover);
      a.addEventListener('mouseleave',()=>a.style.color=link);
      if(i<arr.length-1){const sep=v.createEl('span');sep.style.cssText=`color:${label};`;sep.textContent=',';}
    });
    return v;
  }
  return { factRow, linkRow };
}

globalThis.VaultInfobox = { normalizeLinkItems, resolveItem, rows };
