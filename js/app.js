/* Detail page: Steam app-page layout driven by ?id=<slug>. */

(function () {
  const root = document.getElementById("app");
  const slug = new URLSearchParams(location.search).get("id");
  const p = slug && bySlug(slug);

  if (!p) {
    root.innerHTML = `<div class="empty">
      <p style="font-size:18px">That project doesn't exist in this store.</p>
      <a class="btn" href="index.html">Back to the store</a>
    </div>`;
    return;
  }

  document.title = p.title + " — Chase McKenzie";
  document.getElementById("crumb").innerHTML =
    `<a href="index.html">All Projects</a><span class="sep">&gt;</span>` +
    `<a href="index.html#catalog">${esc(p.genres[0])}</a>` +
    `<span class="sep">&gt;</span>${esc(p.title)}`;

  document.getElementById("q").addEventListener("keydown", (e) => {
    if (e.key === "Enter") location.href = "index.html#catalog";
  });

  /* ── Purchase area ─────────────────────────────────────────────────── */

  const hasLink = !!p.link;
  const repoBtn = p.repo
    ? `<a class="btn ghost" href="${esc(p.repo)}" target="_blank" rel="noopener">Source</a>`
    : "";

  const buy = `
    <div class="buybox">
      <h3>${hasLink ? "Get " + esc(p.title) : esc(p.title) + " is not published yet"}</h3>
      <div class="buyrow">
        <div class="buyprice">${esc(hasLink ? p.priceLabel : "Coming soon")}</div>
        <div class="actions">
          ${hasLink
            ? `<a class="btn green" href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.linkLabel)}</a>${repoBtn}`
            : `<span class="btn dead">${esc(p.linkLabel)}</span>`}
        </div>
      </div>
      ${hasLink ? "" : `<p class="buynote">This one lives on my machine — it hasn't been pushed to GitHub yet.</p>`}
    </div>`;

  /* ── Media gallery ─────────────────────────────────────────────────── */

  const media = p.media || [];

  function stageFor(m) {
    if (!m) {
      return `<div class="stage-empty" style="${capsuleStyle(p)}">
        <div class="big">${p.icon}</div>
        <div class="t">Demo footage coming soon</div>
        <div class="s">A walkthrough of ${esc(p.title)} will land here.${
          hasLink ? " In the meantime, the button below takes you to the real thing." : ""}</div>
      </div>`;
    }
    if (m.type === "video") {
      return `<video controls preload="metadata"${m.poster ? ` poster="${esc(m.poster)}"` : ""} src="${esc(m.src)}"></video>`;
    }
    return `<img src="${esc(m.src)}" alt="${esc(p.title)} screenshot">`;
  }

  const gallery = `
    <div class="media">
      <div class="stage" id="stage">${stageFor(media[0])}</div>
      ${media.length > 1 ? `<div class="strip" id="strip">${media.map((m, i) => `
        <button data-i="${i}"${i === 0 ? ' class="on"' : ""}>
          ${m.type === "video"
            ? (m.poster ? `<img src="${esc(m.poster)}" alt="">` : `<span class="ph">▶</span>`)
            : `<img src="${esc(m.src)}" alt="">`}
        </button>`).join("")}</div>` : ""}
    </div>`;

  /* ── Sidebar ───────────────────────────────────────────────────────── */

  const shipped = p.status === "Shipped";
  const side = `
    <aside class="side">
      ${capsuleHTML(p, "side-cap")}
      <p class="side-desc">${esc(p.tagline)}</p>
      <div class="reviewbox">
        <div class="label">Build status:</div>
        <div class="verdict ${shipped ? "good" : "wip"}">${esc(p.status)}</div>
      </div>
      <dl class="factbox">
        <div class="fact"><dt>Released</dt><dd>${fmtDate(p.released)}</dd></div>
        <div class="fact"><dt>Developer</dt><dd>Chase McKenzie</dd></div>
        <div class="fact"><dt>Category</dt><dd>${esc(p.genres.join(", "))}</dd></div>
        <div class="fact"><dt>Tags</dt><dd><div class="taglist">${tagsHTML(p.tags)}</div></dd></div>
      </dl>
    </aside>`;

  /* ── Page ──────────────────────────────────────────────────────────── */

  root.innerHTML = `
    <div class="apphead"><h1>${esc(p.title)}</h1></div>
    <div class="appgrid">${gallery}${side}</div>
    ${buy}
    <section class="panel">
      <h2>About This Project</h2>
      <ul class="hl">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
      ${p.about.map((t) => `<p>${esc(t)}</p>`).join("")}
    </section>
    <section class="panel">
      <h2>Features</h2>
      <div class="featlist">${p.features.map((f) => `<span>${esc(f)}</span>`).join("")}</div>
    </section>
    <section class="panel">
      <h2>Built With</h2>
      <dl class="specs">
        ${Object.entries(p.tech).map(([k, v]) =>
          `<div class="spec"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}
      </dl>
    </section>
    <a class="backlink" href="index.html">← Back to the store</a>
    ${moreLike()}`;

  /* ── Gallery interaction ───────────────────────────────────────────── */

  const strip = document.getElementById("strip");
  if (strip) {
    strip.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      strip.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
      document.getElementById("stage").innerHTML = stageFor(media[+b.dataset.i]);
    });
  }

  /* Any image or video that fails to load falls back to the placeholder,
     so a typo in data.js degrades gracefully instead of showing a broken icon. */
  root.addEventListener("error", (e) => {
    const t = e.target;
    if (t.tagName !== "IMG" && t.tagName !== "VIDEO") return;
    const stage = t.closest("#stage");
    if (stage) stage.innerHTML = stageFor(null);
    else if (t.closest("#strip")) t.outerHTML = `<span class="ph">▶</span>`;
  }, true);

  /* ── More like this ────────────────────────────────────────────────── */

  function moreLike() {
    const related = sortedProjects()
      .filter((x) => x.slug !== p.slug && x.genres.some((g) => p.genres.includes(g)))
      .slice(0, 4);
    if (!related.length) return "";
    return `
      <section class="section">
        <div class="section-h"><h2>More Like This</h2></div>
        <div class="grid">
          ${related.map((r) => `
            <a class="card" href="app.html?id=${encodeURIComponent(r.slug)}">
              ${capsuleHTML(r, "card-cap")}
              <div class="card-body">
                <div class="card-title">${esc(r.title)}</div>
                <div class="card-desc">${esc(r.tagline)}</div>
                <div class="card-foot">${statusPill(r)} ${priceHTML(r)}</div>
              </div>
            </a>`).join("")}
        </div>
      </section>`;
  }
})();
