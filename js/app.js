import { escapeHtml, parseHeader, parseMarkdown } from './parser.js';
import { highlightAll } from './highlight.js';

// Loads the Markdown for the current URL and renders it inside the docs layout:
//
//   /                          -> /index.md
//   /docs/<project>/           -> /content/<project>/index.md
//   /docs/<project>/?page=<id> -> /content/<project>/pages/<id>.md
//
// The header of a project's index.md provides the navbar title and, with `next`,
// its first page. The sidebar follows the `next` links of the pages from there.

const DEFAULT_TITLE = 'PluginWizard Docs';

const project = location.pathname.match(/^\/docs\/([^/]+)/)?.[1] ?? null;
const pageId = project && new URLSearchParams(location.search).get('page');

const homeHref = project ? `/docs/${project}/` : '/';
const indexUrl = project ? `/content/${project}/index.md` : '/index.md';
const pageHref = id => `/docs/${project}/?page=${encodeURIComponent(id)}`;
const pageUrl = id => `/content/${project}/pages/${encodeURIComponent(id)}.md`;

const icon = (cls, paths) => `<svg class="${cls}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const ICONS = {
    menu: icon('icon-menu', '<path d="M4 6h16M4 12h16M4 18h16"/>'),
    sun: icon('icon-sun', '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>'),
    moon: icon('icon-moon', '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
    github: icon('icon-github', '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>'),
};

const GITHUB_URL = 'https://github.com/PluginWizard';

// Fetches and parses every Markdown file only once, however often it is requested.
const documents = new Map();
function loadDocument(url) {
    if (!documents.has(url)) {
        documents.set(url, fetch(url).then(async res => {
            if (!res.ok) throw new Error(`Could not load ${url}: ${res.status} ${res.statusText}`);
            return parseHeader(await res.text());
        }));
    }
    return documents.get(url);
}

async function renderPage() {
    const [site, page] = await Promise.allSettled([
        loadDocument(indexUrl),
        loadDocument(pageId ? pageUrl(pageId) : indexUrl),
    ]);
    const siteHeader = site.value?.header ?? {};
    const siteTitle = siteHeader.title || DEFAULT_TITLE;
    const hasSidebar = Boolean(project && siteHeader.next);

    let header = {};
    let content;
    if (page.status === 'fulfilled') {
        header = page.value.header;
        content = parseMarkdown(page.value.markdown);
        // Pages without their own "# Title" show the title from their header.
        if (header.title && !content.startsWith('<h1')) {
            content = `<h1>${escapeHtml(header.title)}</h1>\n${content}`;
        }
    } else {
        content = `<h1>Page not found</h1>\n<p>${escapeHtml(page.reason.message)}</p>`;
    }

    document.title = pageId && header.title ? `${header.title} | ${siteTitle}` : siteTitle;
    document.body.innerHTML = buildBody({ siteTitle, content, hasSidebar });

    setupThemeToggle();
    highlightAll(document.querySelector('.markdown'));
    buildToc();
    scrollToHash();
    if (hasSidebar) {
        setupSidebarToggle();
        fillSidebar(siteHeader.next);
    }
    if (project) fillPager(header);
}

// Wraps the page content in the layout: navbar, page list, content and table of contents.
function buildBody({ siteTitle, content, hasSidebar }) {
    const sidebarToggle = hasSidebar
        ? `<button class="navbar-button sidebar-toggle" type="button" aria-label="Toggle navigation" aria-controls="docs-sidebar" aria-expanded="false">${ICONS.menu}</button>`
        : '';
    const sidebar = hasSidebar
        ? `<aside class="sidebar" id="docs-sidebar"><nav aria-label="Pages"><ul class="sidebar-list"></ul></nav></aside>
           <div class="sidebar-backdrop"></div>`
        : '';

    return `
        <header class="navbar">
            ${sidebarToggle}
            <a class="navbar-brand" href="${homeHref}">
                <img src="/favicon.ico" alt="" width="32" height="32">
                <span>${escapeHtml(siteTitle)}</span>
            </a>
            <a class="navbar-button" href="${GITHUB_URL}" target="_blank" rel="noopener" aria-label="PluginWizard on GitHub" title="PluginWizard on GitHub">
                ${ICONS.github}
            </a>
            <button class="navbar-button theme-toggle" type="button" aria-label="Dark mode" title="Toggle dark mode"
                    aria-pressed="${document.documentElement.dataset.theme === 'dark'}">
                ${ICONS.sun}${ICONS.moon}
            </button>
        </header>
        <div class="layout">
            ${sidebar}
            <div class="page">
                <main class="content">
                    <article class="markdown">${content}</article>
                    <nav class="pager" aria-label="Previous and next page"></nav>
                </main>
                <div class="toc"></div>
            </div>
        </div>`;
}

function setupThemeToggle() {
    const button = document.querySelector('.theme-toggle');
    button.addEventListener('click', () => {
        const root = document.documentElement;
        root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        button.setAttribute('aria-pressed', root.dataset.theme === 'dark');
        try { localStorage.setItem('theme', root.dataset.theme); } catch { /* storage disabled */ }
    });
}

// On small screens the sidebar is a drawer, opened and closed by the menu button.
function setupSidebarToggle() {
    const button = document.querySelector('.sidebar-toggle');
    const setOpen = open => {
        document.body.classList.toggle('sidebar-open', open);
        button.setAttribute('aria-expanded', open);
    };
    button.addEventListener('click', () => setOpen(!document.body.classList.contains('sidebar-open')));
    document.querySelector('.sidebar-backdrop').addEventListener('click', () => setOpen(false));
    addEventListener('keydown', e => e.key === 'Escape' && setOpen(false));
}

async function fillSidebar(firstId) {
    const pages = await collectPages(firstId);
    document.querySelector('.sidebar-list').innerHTML = pages.map(({ id, title }) => {
        const current = id === pageId ? ' aria-current="page"' : '';
        return `<li><a href="${pageHref(id)}"${current}>${escapeHtml(title)}</a></li>`;
    }).join('');
}

// GitHub Pages can't list a directory, so the pages are found by following the
// `next` links in their headers, which also keeps them in reading order.
async function collectPages(firstId) {
    const pages = [];
    const seen = new Set();
    for (let id = firstId; id && !seen.has(id);) {
        seen.add(id);
        try {
            const { header } = await loadDocument(pageUrl(id));
            pages.push({ id, title: header.title || id });
            id = header.next;
        } catch (err) {
            console.warn(`Sidebar: ${err.message}`);
            break;
        }
    }
    return pages;
}

// Links to the previous and next page named in the page header.
async function fillPager({ prev, next }) {
    const link = async (id, rel, label) => {
        if (!id) return '';
        try {
            const { header } = await loadDocument(pageUrl(id));
            return `
                <a class="pager-link pager-${rel}" href="${pageHref(id)}" rel="${rel}">
                    <span class="pager-label">${label}</span>
                    <span class="pager-title">${escapeHtml(header.title || id)}</span>
                </a>`;
        } catch (err) {
            console.warn(`Pager: ${err.message}`);
            return '';
        }
    };
    const links = await Promise.all([link(prev, 'prev', 'Previous'), link(next, 'next', 'Next')]);
    document.querySelector('.pager').innerHTML = links.join('');
}

// Lists the ## headings in the right sidebar and highlights the one scrolled to.
function buildToc() {
    const headings = [...document.querySelectorAll('.markdown > h2')];
    if (!headings.length) return;

    const toc = document.querySelector('.toc');
    toc.innerHTML = `
        <nav aria-label="On this page">
            <h2 class="toc-title">On this page</h2>
            <ul>${headings.map(h => `<li><a href="#${h.id}">${escapeHtml(h.textContent)}</a></li>`).join('')}</ul>
        </nav>`;

    const links = [...toc.querySelectorAll('a')];
    const navbar = document.querySelector('.navbar');
    let scheduled = false;
    const update = () => {
        scheduled = false;
        const root = document.documentElement;
        const atBottom = root.scrollHeight > innerHeight && scrollY + innerHeight >= root.scrollHeight - 2;
        const threshold = navbar.offsetHeight + 80;
        const active = atBottom
            ? headings.length - 1
            : headings.findLastIndex(h => h.getBoundingClientRect().top <= threshold);
        links.forEach((link, i) => link.classList.toggle('active', i === active));
    };
    const schedule = () => {
        if (!scheduled) {
            scheduled = true;
            requestAnimationFrame(update);
        }
    };
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    update();
}

// The browser can't jump to a #heading before the content exists, so do it now.
function scrollToHash() {
    try {
        document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
    } catch { /* malformed hash */ }
}

// Renders an error component. Only use when unable to render any other content
function showErrorComponent(message) {
    document.body.innerHTML = `<p class="error">${escapeHtml(message)}</p>`;
}

renderPage().catch(err => {
    console.error(err);
    showErrorComponent(`Could not render this page: ${err.message}`);
});
