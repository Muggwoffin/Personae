// _dates.js — shared date helpers for the research-vault dataviewjs views.
// Single source of truth for date parsing/formatting, replacing the copies
// that used to live in each infobox and the master timeline.
//
// Load once (mobile-safe — no Node require), then read from the global:
//   if (!globalThis.VaultDates) await dv.view("Vault Settings/scripts/_dates");
//   const { formatDate, parseDate } = globalThis.VaultDates;
//
// formatDate(raw)        → "13 June 1985"  (long months, default)
// formatDate(raw, true)  → "13 Jun 1985"   (short months)
// parseDate(raw)         → Date | null     (for sorting/comparison)
//
// All three accept ISO strings, partial dates (YYYY, YYYY-MM), Dataview
// date objects, prose dates ("13th June 1985", "June 1985", "13/06/1985"),
// and a leading "circa"/"c."/trailing "?" which is preserved as a "c. " prefix.
// NOTE: edits to this file only take effect after an Obsidian reload, because
// the loaded copy is cached on globalThis for the session.

const MONTHS_LONG  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Normalise prose / regional date text to an ISO-ish string where possible.
function normalizeDateText(s){const M={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,sept:9,oct:10,nov:11,dec:12,january:1,february:2,march:3,april:4,june:6,july:7,august:8,september:9,october:10,november:11,december:12};const pad=n=>String(n).padStart(2,'0');const t=String(s??'').trim();let m=t.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?([A-Za-z]+),?\s+(\d{4})$/);if(m&&M[m[2].toLowerCase()])return m[3]+'-'+pad(M[m[2].toLowerCase()])+'-'+pad(m[1]);m=t.match(/^([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/);if(m&&M[m[1].toLowerCase()])return m[3]+'-'+pad(M[m[1].toLowerCase()])+'-'+pad(m[2]);m=t.match(/^([A-Za-z]+),?\s+(\d{4})$/);if(m&&M[m[1].toLowerCase()])return m[2]+'-'+pad(M[m[1].toLowerCase()]);m=t.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);if(m)return m[3]+'-'+pad(m[2])+'-'+pad(m[1]);return s;}

// → Date object (or null) for sorting. Treats partial dates as their start.
function parseDateCore(dateStr){
  if(!dateStr) return null;
  const str=String(dateStr).split('T')[0];
  if(/^\d{4}-\d{2}-\d{2}$/.test(str)) return new Date(str+"T00:00:00");
  if(/^\d{4}-\d{2}$/.test(str))       return new Date(str+"-01T00:00:00");
  if(/^\d{4}$/.test(str))             return new Date(str+"-01-01T00:00:00");
  const parsed=new Date(str+"T00:00:00");
  return isNaN(parsed.getTime()) ? null : parsed;
}
function parseDate(raw){const s=String(raw??'').trim();const m=s.match(/^(?:circa\s+|ca\.?\s*|c\.\s*|c\s+)?(.*?)\s*\??$/i);return parseDateCore(normalizeDateText(m?m[1]:raw));}

// → display string (or null) using the supplied month-name table.
function formatDateCore(raw, M){
  if(!raw) return null;
  if(typeof raw==='object'&&raw!==null&&raw.year!==undefined){const{year,month,day}=raw;if(day&&month)return `${day} ${M[month-1]} ${year}`;if(month)return `${M[month-1]} ${year}`;return String(year);}
  const s=String(raw).split('T')[0];const [y,m,d]=s.split('-').map(Number);if(!y)return s;if(m&&d)return `${d} ${M[m-1]} ${y}`;if(m)return `${M[m-1]} ${y}`;return String(y);
}
function formatDate(raw, short=false){
  const M=short?MONTHS_SHORT:MONTHS_LONG;
  const s=String(raw??'').trim();
  const mm=s.match(/^(?:circa\s+|ca\.?\s*|c\.\s*|c\s+)?(.*?)\s*\??$/i);
  const circa=/^(circa\s|ca\.|c\.|c\s)/i.test(s)||/\?$/.test(s);
  const out=formatDateCore(normalizeDateText(mm?mm[1]:raw), M);
  return out==null?out:(circa?'c. '+out:out);
}

globalThis.VaultDates = { MONTHS_LONG, MONTHS_SHORT, normalizeDateText, parseDate, formatDate };
