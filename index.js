const articles = [
  {
    class: "englishlearning",
    hidden: false,
    title: "What I am doing now?",
    href: "now.html",
    time: null,
    duration: null,
    tag: null,
  },
  {
    class: "jpread",
    hidden: false,
    title: "A Level-Based Guide to Learning Japanese via J-Dramas",
    href: "pages/pagra3.html",
    time: "Feb 2",
    duration: null,
    tag: "Japanese Learning",
  }
];

document.addEventListener("DOMContentLoaded", () => {
  renderTagFilter();
  renderArticles("All");
  initThemeToggle();
  initScrollProgress();
});

/* Render Article Tag Filters */
function renderTagFilter() {
  const filterBar = document.getElementById("tag-filter-bar");
  if (!filterBar) return;

  const tags = ["All", ...new Set(articles.map(a => a.tag).filter(Boolean))];
  filterBar.innerHTML = tags.map(tag => `
    <button class="tag-btn ${tag === 'All' ? 'active' : ''}" onclick="filterArticles('${tag}', this)">${tag}</button>
  `).join("");
}

/* Render Articles based on Selected Tag Filter */
function renderArticles(selectedTag) {
  const container = document.getElementById("article-list");
  if (!container) return;
  container.innerHTML = "";

  articles.forEach(article => {
    if (article.hidden) return;
    if (selectedTag !== "All" && article.tag !== selectedTag) return;

    const wrapper = document.createElement("div");
    wrapper.className = `article-item ${article.class}`;
    wrapper.innerHTML = `
      <div class="title1"><a href="${article.href}">${article.title}</a></div>
      ${article.time || article.tag ? `
        <div class="meta">
          ${article.time ? `<span>${article.time}</span>` : ""}
          ${article.time && article.tag ? " · " : ""}
          ${article.tag ? `<span class="tag">${article.tag}</span>` : ""}
        </div>
      ` : ""}
    `;
    container.appendChild(wrapper);
  });
}

function filterArticles(tag, btn) {
  document.querySelectorAll(".tag-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderArticles(tag);
}

/* Table Filter / Instant Search Feature */
function filterTable(input, tableId) {
  const filter = input.value.toLowerCase();
  const rows = document.querySelectorAll(`#${tableId} tbody tr`);
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? "" : "none";
  });
}

/* Theme Toggle Manager */
function initThemeToggle() {
  const btn = document.getElementById("theme-btn");
  if (!btn) return;

  const currentTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
  btn.textContent = currentTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";

  btn.addEventListener("click", () => {
    const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    btn.textContent = theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
  });
}

/* Scroll Progress Bar */
function initScrollProgress() {
  window.addEventListener("scroll", () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const progressEl = document.getElementById("scroll-progress");
    if (progressEl) progressEl.style.width = scrolled + "%";
  });
}