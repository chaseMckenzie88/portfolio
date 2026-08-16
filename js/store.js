/* Store front: featured carousel, category tabs, search, project rows. */

(function () {
  const all = sortedProjects();
  let genre = "All";
  let query = "";

  document.getElementById("count-badge").textContent = all.length + " projects";

  /* ── Featured carousel ─────────────────────────────────────────────── */

  const FEATURED = ["shinobi-legends", "blitz", "voice-notes", "amplify", "gutter-run", "vaultcheck"]
    .map(bySlug)
    .filter(Boolean);

  /* Steam puts four screenshots here. Until a project has any, showing the same
     capsule art four times just reads as a bug — so fall back to its highlights. */
  function featureThumbs(p) {
    const shots = (p.media || []).filter((m) => m.type === "image" || m.poster).slice(0, 4);
    if (shots.length) {
      return `<div class="feature-thumbs">${shots.map((m) =>
        `<div class="feature-thumb" style="background-image:url('${esc(m.poster || m.src)}')"></div>`
      ).join("")}</div>`;
    }
    return `<ul class="feature-points">${p.highlights.slice(0, 3)
      .map((h) => `<li>${esc(h)}</li>`).join("")}</ul>`;
  }

  const track = document.getElementById("feature-track");
  const dots = document.getElementById("feature-dots");
  let idx = 0;
  let timer = null;

  track.innerHTML = FEATURED.map((p) => {
    const cover = coverSrc(p);
    return `
    <a class="feature-slide" href="app.html?id=${encodeURIComponent(p.slug)}">
      <div class="feature-art${cover ? " has-cover" : ""}" style="${capsuleStyle(p)}">
        ${cover ? coverIMG(cover) : ""}
        <div>
          <div class="art-icon">${p.icon}</div>
          <div class="art-title">${esc(p.title)}</div>
        </div>
      </div>
      <div class="feature-info">
        <h3>${esc(p.title)}</h3>
        ${featureThumbs(p)}
        <p class="tagline">${esc(p.tagline)}</p>
        <div class="taglist">${tagsHTML(p.tags, 4)}</div>
        <div class="price-row">${statusPill(p)} ${priceHTML(p)}</div>
      </div>
    </a>
  `;
  }).join("");

  dots.innerHTML = FEATURED.map((_, i) => `<button data-i="${i}" aria-label="Slide ${i + 1}"></button>`).join("");

  function goto(i) {
    idx = (i + FEATURED.length) % FEATURED.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
    dots.querySelectorAll("button").forEach((b, n) => b.classList.toggle("on", n === idx));
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => goto(idx + 1), 6000);
  }

  document.getElementById("f-next").addEventListener("click", (e) => { e.preventDefault(); goto(idx + 1); restart(); });
  document.getElementById("f-prev").addEventListener("click", (e) => { e.preventDefault(); goto(idx - 1); restart(); });
  dots.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) { goto(+b.dataset.i); restart(); }
  });
  document.getElementById("feature").addEventListener("mouseenter", () => clearInterval(timer));
  document.getElementById("feature").addEventListener("mouseleave", restart);

  goto(0);
  restart();

  /* ── Tabs ──────────────────────────────────────────────────────────── */

  const tabs = document.getElementById("tabs");
  tabs.innerHTML = GENRES.map((g) => {
    const n = g === "All" ? all.length : all.filter((p) => p.genres.includes(g)).length;
    return `<button data-g="${esc(g)}"${g === genre ? ' class="on"' : ""}>${esc(g)} <span style="opacity:.6">${n}</span></button>`;
  }).join("");

  tabs.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    genre = b.dataset.g;
    tabs.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
    render();
  });

  /* ── Search ────────────────────────────────────────────────────────── */

  document.getElementById("q").addEventListener("input", (e) => {
    query = e.target.value.trim().toLowerCase();
    render();
  });

  /* ── Rows ──────────────────────────────────────────────────────────── */

  const rows = document.getElementById("rows");
  const count = document.getElementById("result-count");

  function matches(p) {
    if (genre !== "All" && !p.genres.includes(genre)) return false;
    if (!query) return true;
    const hay = (p.title + " " + p.tagline + " " + p.tags.join(" ") + " " + p.genres.join(" ")).toLowerCase();
    return hay.includes(query);
  }

  function render() {
    const list = all.filter(matches);
    count.textContent = list.length + (list.length === 1 ? " result" : " results");

    if (!list.length) {
      rows.innerHTML = `<div class="empty">Nothing matches that. Try a different search or category.</div>`;
      return;
    }

    rows.innerHTML = list.map((p) => `
      <a class="row" href="app.html?id=${encodeURIComponent(p.slug)}">
        ${capsuleHTML(p, "row-cap")}
        <div class="row-body">
          <div class="row-title">${esc(p.title)}</div>
          <div class="row-desc">${esc(p.tagline)}</div>
          <div class="row-meta">${tagsHTML(p.tags, 4)}</div>
        </div>
        <div class="row-right">
          <div class="row-date">${fmtDate(p.released)}</div>
          ${statusPill(p)}<br>
          <span style="display:inline-block;margin-top:6px">${priceHTML(p)}</span>
        </div>
      </a>
    `).join("");
  }

  render();
})();
