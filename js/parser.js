export function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// --- Header ----------------------------------------------------------------

// A Markdown file may start with a header block of `key: value` entries,
// separated by newlines and/or commas:
//
//     {{
//         id: "commands"
//         title: "Creating Commands",
//         prev: "regions",
//         next: "events"
//     }}
//
// Values may be quoted. `null` (quoted or not) and empty values become null.
const HEADER = /^﻿?\s*\{\{([\s\S]*?)\}\}[^\S\n]*\n?/;
const HEADER_ENTRY = /([\w-]+)\s*:\s*("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|[^,\n]*)/g;

// Splits a Markdown file into its header (as an object) and the remaining Markdown.
export function parseHeader(md) {
    const match = md.match(HEADER);
    if (!match) return { header: {}, markdown: md };

    const header = {};
    for (const [, key, raw] of match[1].matchAll(HEADER_ENTRY)) {
        let value = raw.trim();
        if (/^(["']).*\1$/.test(value)) value = value.slice(1, -1).replace(/\\(.)/g, '$1');
        header[key] = value === '' || value === 'null' ? null : value;
    }
    return { header, markdown: md.slice(match[0].length) };
}

// --- Markdown --------------------------------------------------------------

// Converts inline constructs (code, links, images, emphasis) within a line.
function parseInline(text) {
    // Extract inline code spans first so their contents are not further parsed.
    const codeSpans = [];
    text = text.replace(/`([^`]+)`/g, (_, code) => {
        codeSpans.push(`<code>${escapeHtml(code)}</code>`);
        return `\u0000${codeSpans.length - 1}\u0000`;
    });

    text = escapeHtml(text);

    // Images: ![alt](src)
    text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1">');
    // Links: [text](href)
    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
    // Bold: **text** or __text__
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    // Italic: *text* or _text_
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Restore code spans.
    text = text.replace(/\u0000(\d+)\u0000/g, (_, i) => codeSpans[+i]);
    return text;
}

// Turns heading text into an anchor id, e.g. "Title & Message Utilities" -> "title-message-utilities".
function slugify(text) {
    return text
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links: keep only their text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-|-$/g, '');
}

const RE = {
    fence: /^```/,
    blank: /^\s*$/,
    heading: /^(#{1,6})\s+(.*)$/,
    hr: /^(\s*[-*_]){3,}\s*$/,
    quote: /^>\s?/,
    ul: /^\s*[-*+]\s+/,
    ol: /^\s*\d+\.\s+/,
};

function isBlockStart(line) {
    return RE.blank.test(line) || RE.fence.test(line) || RE.heading.test(line) ||
        RE.hr.test(line) || RE.quote.test(line) || RE.ul.test(line) || RE.ol.test(line);
}

// Converts a Markdown string into an HTML string. Every heading gets an id that
// is unique within the document (`usedIds`), so it can be linked to.
export function parseMarkdown(md, usedIds = new Set()) {
    const lines = md.replace(/\r\n?/g, '\n').split('\n');
    const html = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Fenced code block: ```lang ... ```
        if (RE.fence.test(line)) {
            const lang = line.slice(3).trim();
            const buf = [];
            i++;
            while (i < lines.length && !RE.fence.test(lines[i])) {
                buf.push(lines[i]);
                i++;
            }
            i++; // skip the closing fence
            const cls = lang ? ` class="language-${lang}"` : '';
            html.push(`<pre><code${cls}>${escapeHtml(buf.join('\n'))}</code></pre>`);
            continue;
        }

        if (RE.blank.test(line)) { i++; continue; }

        // Heading: # .. ######
        const heading = line.match(RE.heading);
        if (heading) {
            const level = heading[1].length;
            const text = heading[2].trim();
            const slug = slugify(text) || 'section';
            let id = slug;
            for (let n = 2; usedIds.has(id); n++) id = `${slug}-${n}`;
            usedIds.add(id);
            html.push(`<h${level} id="${id}">${parseInline(text)}</h${level}>`);
            i++;
            continue;
        }

        // Horizontal rule
        if (RE.hr.test(line)) { html.push('<hr>'); i++; continue; }

        // Blockquote (recursively parses its contents)
        if (RE.quote.test(line)) {
            const buf = [];
            while (i < lines.length && RE.quote.test(lines[i])) {
                buf.push(lines[i].replace(RE.quote, ''));
                i++;
            }
            html.push(`<blockquote>${parseMarkdown(buf.join('\n'), usedIds)}</blockquote>`);
            continue;
        }

        // Unordered list
        if (RE.ul.test(line)) {
            const items = [];
            while (i < lines.length && RE.ul.test(lines[i])) {
                items.push(lines[i].replace(RE.ul, ''));
                i++;
            }
            html.push(`<ul>${items.map(it => `<li>${parseInline(it)}</li>`).join('')}</ul>`);
            continue;
        }

        // Ordered list
        if (RE.ol.test(line)) {
            const items = [];
            while (i < lines.length && RE.ol.test(lines[i])) {
                items.push(lines[i].replace(RE.ol, ''));
                i++;
            }
            html.push(`<ol>${items.map(it => `<li>${parseInline(it)}</li>`).join('')}</ol>`);
            continue;
        }

        // Paragraph: gather consecutive lines until a blank line or block start.
        const buf = [];
        while (i < lines.length && !isBlockStart(lines[i])) {
            buf.push(lines[i]);
            i++;
        }
        html.push(`<p>${parseInline(buf.join('\n'))}</p>`);
    }

    return html.join('\n');
}
