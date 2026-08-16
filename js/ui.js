/* Shared helpers: capsule art, formatting, small DOM utilities. */

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function bySlug(slug) {
  return PROJECTS.find((p) => p.slug === slug);
}

function fmtDate(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* Procedural capsule art — a gradient keyed to the project's accent, a soft
   radial highlight, and the icon + name over the top. Still the layer underneath
   every capsule, so it shows through for projects with no screenshot yet. */
function capsuleStyle(p) {
  return (
    `background:` +
    `radial-gradient(120% 90% at 22% 8%, ${p.accent}55 0%, transparent 60%),` +
    `linear-gradient(135deg, ${p.accent2} 0%, #0d141c 78%)`
  );
}

/* Cover art for a project. Prefers its purpose-built `cover` (a 460x215 capsule
   crop — roughly a fifth the weight of the full screenshot, which matters when
   the storefront renders seventeen of them). Falls back to the first still in
   `media`, so a project with a screenshot but no generated cover still gets art. */
function coverSrc(p) {
  if (p.cover) return p.cover;
  const shot = (p.media || []).find((m) => m.type === "image" || m.poster);
  if (!shot) return null;
  return shot.type === "image" ? shot.src : shot.poster;
}

/* Layers the real screenshot over the procedural art. If the file is missing or
   fails to decode, onerror drops back to the gradient rather than a broken icon. */
function coverIMG(cover) {
  return (
    `<img class="cap-shot" src="${esc(cover)}" alt="" loading="lazy" decoding="async"` +
    ` onerror="this.closest('.has-cover').classList.remove('has-cover');this.remove()">`
  );
}

function capsuleHTML(p, cls) {
  const cover = coverSrc(p);
  return (
    `<div class="${cls}${cover ? " has-cover" : ""}" style="${capsuleStyle(p)}">` +
    (cover ? coverIMG(cover) : "") +
    `<span class="cap-icon">${p.icon}</span>` +
    `<span class="cap-name">${esc(p.title)}</span>` +
    `</div>`
  );
}

function statusPill(p) {
  const dev = p.status !== "Shipped";
  return `<span class="pill ${dev ? "dev" : "shipped"}">${esc(p.status)}</span>`;
}

function priceHTML(p) {
  const dead = !p.link;
  return `<span class="price${dead ? " unreleased" : ""}">${esc(dead ? "Unreleased" : p.priceLabel)}</span>`;
}

function tagsHTML(list, max) {
  return list
    .slice(0, max || list.length)
    .map((t) => `<span class="tag">${esc(t)}</span>`)
    .join("");
}

/* Newest first. */
function sortedProjects() {
  return PROJECTS.slice().sort((a, b) => (a.released < b.released ? 1 : -1));
}
