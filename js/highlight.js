import { escapeHtml } from './parser.js';

// A small syntax highlighter for the languages used in the docs. Each language is
// a list of [token class, pattern] rules; at every position the first matching
// rule wins and its text is wrapped in <span class="tok-...">. Rules without a
// class consume text (e.g. whole identifiers) without highlighting it.

const words = list => new RegExp(`\\b(?:${list.split(' ').join('|')})\\b`);

const JAVA_KEYWORDS = 'abstract assert boolean break byte case catch char class continue default do double else enum ' +
    'extends final finally float for if implements import instanceof int interface long native new package permits ' +
    'private protected public record return sealed short static super switch synchronized this throw throws transient ' +
    'try var void volatile while yield';
const KOTLIN_KEYWORDS = 'as by catch class companion data do else finally for fun if import in init interface internal ' +
    'is object open override package private protected public return sealed super this throw try val var when while';
const GROOVY_KEYWORDS = `${JAVA_KEYWORDS} def`;

// Rules shared by the C-like languages (Java, Kotlin, Groovy).
const cLike = (keywords, singleQuotedStrings) => [
    ['comment', /\/\/.*|\/\*[\s\S]*?\*\//],
    ['string', /"""[\s\S]*?"""|"(?:[^"\\\n]|\\.)*"/],
    ['string', singleQuotedStrings ? /'(?:[^'\\\n]|\\.)*'/ : /'(?:[^'\\\n]|\\.)'/],
    ['annotation', /@\w+/],
    ['number', /\b(?:0[xX][\da-fA-F_]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)[fFdDlL]?\b/],
    ['literal', /\b(?:true|false|null)\b/],
    ['keyword', words(keywords)],
    ['type', /\b[A-Z]\w*\b/],
    ['function', /\b[a-z_]\w*(?=\s*\()/],
    [null, /\w+/],
];

const LANGUAGES = {
    java: cLike(JAVA_KEYWORDS, false),
    kotlin: cLike(KOTLIN_KEYWORDS, false),
    groovy: cLike(GROOVY_KEYWORDS, true),
    xml: [
        ['comment', /<!--[\s\S]*?-->/],
        ['tag', /<\/?[\w:.-]+|\/?>/],
        ['attr', /[\w:.-]+(?=\s*=\s*")/],
        ['string', /"[^"]*"/],
    ],
    yaml: [
        ['comment', /#.*/],
        ['attr', /^[ \t]*(?:-[ \t]+)?[\w.-]+(?=:(?:\s|$))/m],
        ['string', /"(?:[^"\\\n]|\\.)*"|'[^'\n]*'/],
        ['literal', /\b(?:true|false|null)\b/],
        ['number', /\b\d+(?:\.\d+)?\b(?![.\w])/],
        [null, /[\w.-]+/],
    ],
};

const ALIASES = { kts: 'kotlin', gradle: 'groovy', html: 'xml', yml: 'yaml' };

// Make every rule sticky, so it only matches at the current position.
for (const rules of Object.values(LANGUAGES)) {
    rules.forEach(rule => { rule[1] = new RegExp(rule[1].source, `y${rule[1].flags}`); });
}

// Returns the highlighted HTML for `code`, or null for an unknown language.
export function highlight(code, lang) {
    const rules = LANGUAGES[ALIASES[lang] ?? lang];
    if (!rules) return null;

    let html = '';
    let plain = '';
    for (let pos = 0; pos < code.length;) {
        let match = null;
        let cls = null;
        for (const [ruleCls, re] of rules) {
            re.lastIndex = pos;
            const m = re.exec(code);
            if (m && m[0]) { match = m[0]; cls = ruleCls; break; }
        }
        if (!match) {
            plain += code[pos++];
            continue;
        }
        if (cls) {
            html += escapeHtml(plain) + `<span class="tok-${cls}">${escapeHtml(match)}</span>`;
            plain = '';
        } else {
            plain += match;
        }
        pos += match.length;
    }
    return html + escapeHtml(plain);
}

// Highlights every fenced code block with a known language inside `root`.
export function highlightAll(root) {
    for (const block of root.querySelectorAll('pre > code[class^="language-"]')) {
        const html = highlight(block.textContent, block.className.slice('language-'.length));
        if (html !== null) block.innerHTML = html;
    }
}
