<%*
// Router template for the Sources folder: ask which kind of note this is,
// then apply the matching template. Keeps both templates as the single source
// of truth (this just includes one of them).
const kind = await tp.system.suggester(
  ["📄  Generic archival source", "✉️  Correspondence (a letter, telegram, etc.)"],
  ["source", "correspondence"], false,
  "Is this a generic archival source or a correspondence source?"
);
const link = kind === "correspondence"
  ? "[[Archival Correspondence Template]]"
  : "[[Archival Source Template]]";
tR += await tp.file.include(link);
-%>
