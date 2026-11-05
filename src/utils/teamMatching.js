// Plain JS so it can be shared by the Node scraper script and the app.
export const NAME_ALIASES = {};

export const normalizeName = (name) => {
  const n = String(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
  return NAME_ALIASES[n] ?? n;
};
