/**
 * HTML Generator - CyberSec Reporting Engine
 *
 * Converts markdown reports to HTML, applies theme CSS, renders Mermaid diagrams
 * as inline SVG, and adds interactive features: collapsible sections, filterable
 * tables, search, print stylesheets, severity badges, and executive KPI widgets.
 *
 * @module html-generator
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { JSDOM } from 'jsdom';
import mermaid from 'mermaid';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Marked configuration with syntax highlighting
// ---------------------------------------------------------------------------

marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    },
  })
);

// ---------------------------------------------------------------------------
// Built-in themes
// ---------------------------------------------------------------------------

const THEMES = {
  default: {
    name: 'Default Professional',
    css: `
      :root {
        --bg: #ffffff; --fg: #1a1a1a; --accent: #1a56db;
        --muted: #6b7280; --border: #e5e7eb; --surface: #f9fafb;
        --critical: #dc2626; --high: #ea580c; --medium: #ca8a04;
        --low: #16a34a; --info: #2563eb;
        --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --mono: 'JetBrains Mono', 'Fira Code', monospace;
      }
    `,
  },
  dark: {
    name: 'Dark Mode',
    css: `
      :root {
        --bg: #0f172a; --fg: #e2e8f0; --accent: #60a5fa;
        --muted: #94a3b8; --border: #334155; --surface: #1e293b;
        --critical: #f87171; --high: #fb923c; --medium: #facc15;
        --low: #4ade80; --info: #60a5fa;
        --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --mono: 'JetBrains Mono', 'Fira Code', monospace;
      }
    `,
  },
  corporate: {
    name: 'Corporate',
    css: `
      :root {
        --bg: #ffffff; --fg: #212529; --accent: #0d47a1;
        --muted: #495057; --border: #dee2e6; --surface: #f8f9fa;
        --critical: #c62828; --high: #e65100; --medium: #f9a825;
        --low: #2e7d32; --info: #1565c0;
        --font: 'Georgia', 'Times New Roman', serif;
        --mono: 'Courier New', monospace;
      }
    `,
  },
  military: {
    name: 'Military / Government',
    css: `
      :root {
        --bg: #f0f4c3; --fg: #212121; --accent: #1b5e20;
        --muted: #616161; --border: #9e9e9e; --surface: #e8f5e9;
        --critical: #b71c1c; --high: #bf360c; --medium: #f57f17;
        --low: #1b5e20; --info: #0d47a1;
        --font: 'Courier New', monospace;
        --mono: 'Courier New', monospace;
      }
    `,
  },
};

// ---------------------------------------------------------------------------
// Severity badge HTML
// ---------------------------------------------------------------------------

function severityBadgeHtml(severity) {
  const styles = {
    critical: { bg: 'var(--critical)', label: 'CRITICAL' },
    high: { bg: 'var(--high)', label: 'HIGH' },
    medium: { bg: 'var(--medium)', label: 'MEDIUM' },
    low: { bg: 'var(--low)', label: 'LOW' },
    info: { bg: 'var(--info)', label: 'INFO' },
  };
  const s = styles[severity?.toLowerCase()] || { bg: 'var(--muted)', label: severity };
  return `<span class="severity-badge" style="background:${s.bg}">${s.label}</span>`;
}

// ---------------------------------------------------------------------------
// KPI widget builder
// ---------------------------------------------------------------------------

function buildKpiWidgets(findings = []) {
  const sev = {};
  for (const f of findings) {
    const k = (f.severity || 'info').toLowerCase();
    sev[k] = (sev[k] || 0) + 1;
  }
  const total = findings.length || 0;

  return `
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-value">${total}</div>
      <div class="kpi-label">Total Findings</div>
    </div>
    <div class="kpi-card kpi-critical">
      <div class="kpi-value">${sev.critical || 0}</div>
      <div class="kpi-label">Critical</div>
    </div>
    <div class="kpi-card kpi-high">
      <div class="kpi-value">${sev.high || 0}</div>
      <div class="kpi-label">High</div>
    </div>
    <div class="kpi-card kpi-medium">
      <div class="kpi-value">${sev.medium || 0}</div>
      <div class="kpi-label">Medium</div>
    </div>
    <div class="kpi-card kpi-low">
      <div class="kpi-value">${sev.low || 0}</div>
      <div class="kpi-label">Low</div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------------------
// Interactive features JavaScript (injected inline)
// ---------------------------------------------------------------------------

const INTERACTIVE_JS = `
document.addEventListener('DOMContentLoaded', () => {
  /* Collapsible sections */
  document.querySelectorAll('h2, h3').forEach(h => {
    h.style.cursor = 'pointer';
    h.addEventListener('click', () => {
      let el = h.nextElementSibling;
      while (el && !/^H[23]$/.test(el.tagName)) {
        el.style.display = el.style.display === 'none' ? '' : 'none';
        el = el.nextElementSibling;
      }
    });
  });

  /* Table search */
  const searchInput = document.getElementById('table-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('table tbody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  /* Report-wide search */
  const reportSearch = document.getElementById('report-search');
  if (reportSearch) {
    reportSearch.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      document.querySelectorAll('.searchable').forEach(el => {
        el.style.display = el.textContent.toLowerCase().includes(term) ? '' : 'none';
      });
    });
  }
});
`;

// ---------------------------------------------------------------------------
// Print stylesheet
// ---------------------------------------------------------------------------

const PRINT_CSS = `
@media print {
  body { font-size: 11pt; color: #000; background: #fff; }
  .no-print, .kpi-grid, .search-bar, nav { display: none !important; }
  h1, h2, h3, h4 { page-break-after: avoid; }
  table { page-break-inside: avoid; }
  pre, code { page-break-inside: avoid; white-space: pre-wrap; }
  @page { margin: 2cm; size: A4; }
}
`;

// ---------------------------------------------------------------------------
// Base HTML template
// ---------------------------------------------------------------------------

function baseHtmlTemplate({ title, body, theme, kpiHtml }) {
  const searchBar = `
  <div class="search-bar no-print">
    <input type="text" id="report-search" placeholder="Search report..." />
  </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="CyberSec Reporting Engine">
  <title>${escapeHtml(title)}</title>
  <style>
    ${theme.css}
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font);
      background: var(--bg);
      color: var(--fg);
      line-height: 1.7;
      padding: 2rem;
      max-width: 960px;
      margin: 0 auto;
    }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; border-bottom: 3px solid var(--accent); padding-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.25rem; }
    h3 { font-size: 1.2rem; margin-top: 1.5rem; margin-bottom: 0.75rem; }
    p { margin-bottom: 1rem; }
    table {
      width: 100%; border-collapse: collapse; margin: 1rem 0;
      border: 1px solid var(--border);
    }
    th, td { padding: 0.6rem 0.8rem; text-align: left; border-bottom: 1px solid var(--border); }
    th { background: var(--surface); font-weight: 600; }
    tr:hover td { background: var(--surface); }
    pre { background: var(--surface); padding: 1rem; border-radius: 6px; overflow-x: auto; font-family: var(--mono); font-size: 0.9em; }
    code { font-family: var(--mono); font-size: 0.9em; background: var(--surface); padding: 0.15em 0.4em; border-radius: 3px; }
    pre code { background: none; padding: 0; }
    blockquote {
      border-left: 4px solid var(--accent); padding: 0.5rem 1rem;
      margin: 1rem 0; background: var(--surface);
    }
    img, svg { max-width: 100%; }
    hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
    .severity-badge {
      display: inline-block; color: #fff; padding: 0.15em 0.6em; border-radius: 4px;
      font-size: 0.8em; font-weight: 600; text-transform: uppercase;
    }
    .kpi-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem; margin: 1.5rem 0;
    }
    .kpi-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: 1.2rem; text-align: center;
    }
    .kpi-value { font-size: 2rem; font-weight: 700; color: var(--accent); }
    .kpi-label { font-size: 0.85rem; color: var(--muted); margin-top: 0.25rem; text-transform: uppercase; }
    .kpi-critical .kpi-value { color: var(--critical); }
    .kpi-high .kpi-value { color: var(--high); }
    .kpi-medium .kpi-value { color: var(--medium); }
    .kpi-low .kpi-value { color: var(--low); }
    .search-bar { margin-bottom: 1.5rem; }
    .search-bar input {
      width: 100%; padding: 0.6rem 1rem; border: 1px solid var(--border);
      border-radius: 6px; font-size: 1rem; font-family: var(--font);
      background: var(--bg); color: var(--fg);
    }
    .footer {
      margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--border);
      font-size: 0.85rem; color: var(--muted);
    }
    ${PRINT_CSS}
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom:1rem;">
    <strong>Theme:</strong> ${escapeHtml(theme.name)}
  </div>
  ${searchBar}
  ${kpiHtml}
  <div class="searchable">
    ${body}
  </div>
  <div class="footer no-print">
    Generated by CyberSec Reporting Engine &mdash; ${new Date().toISOString()}
  </div>
  <script>${INTERACTIVE_JS}</script>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// HTML Generator class
// ---------------------------------------------------------------------------

export class HtmlGenerator {
  constructor(opts = {}) {
    this.themes = { ...THEMES, ...(opts.themes || {}) };
  }

  /**
   * Get list of available themes.
   */
  listThemes() {
    return Object.entries(this.themes).map(([id, t]) => ({ id, name: t.name }));
  }

  /**
   * Get a theme by ID.
   */
  getTheme(id) {
    return this.themes[id || 'default'] || this.themes.default;
  }

  /**
   * Convert markdown to HTML body content.
   */
  markdownToHtml(md) {
    // Inject severity badges for **Severity:** lines
    const processed = md.replace(
      /^\*\*Severity:\*\*\s*(.+)$/gm,
      (_, sev) => `**Severity:** ${severityBadgeHtml(sev.trim())}`
    );
    return marked.parse(processed);
  }

  /**
   * Convert Mermaid code blocks to SVG.
   */
  async renderMermaidDiagrams(htmlStr) {
    const dom = new JSDOM(htmlStr);
    const doc = dom.window.document;
    const mermaidBlocks = doc.querySelectorAll('pre code.language-mermaid');

    for (const block of mermaidBlocks) {
      try {
        const definition = block.textContent;
        const { svg } = await mermaid.render(`mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`, definition);
        const wrapper = doc.createElement('div');
        wrapper.classList.add('mermaid-container');
        wrapper.innerHTML = svg;
        const pre = block.closest('pre');
        if (pre) pre.replaceWith(wrapper);
      } catch (err) {
        block.textContent = `[Mermaid error: ${err.message}]`;
      }
    }

    return dom.serialize();
  }

  /**
   * Build a complete HTML report from markdown content.
   *
   * @param {string} markdown - The markdown report content
   * @param {object} [opts]
   * @param {string} [opts.theme] - Theme ID
   * @param {string} [opts.title] - Report title
   * @param {Array} [opts.findings] - Findings array for KPI widgets
   * @returns {Promise<string>} Complete HTML document string
   */
  async generate(markdown, opts = {}) {
    const theme = this.getTheme(opts.theme);
    const title = opts.title || 'Security Assessment Report';

    // Convert markdown to HTML
    let bodyHtml = await this.markdownToHtml(markdown);

    // Render Mermaid diagrams to SVG
    try {
      bodyHtml = await this.renderMermaidDiagrams(bodyHtml);
    } catch {
      // Mermaid SVG rendering failed; leave code blocks as-is
    }

    // Build KPI widgets from findings data
    const kpiHtml = opts.findings?.length ? buildKpiWidgets(opts.findings) : '';

    return baseHtmlTemplate({ title, body: bodyHtml, theme, kpiHtml });
  }

  /**
   * Generate HTML from a markdown file and write output.
   */
  async generateFromFile(inputPath, outputPath, opts = {}) {
    const md = await readFile(inputPath, 'utf-8');
    const html = await this.generate(md, opts);
    await writeFile(outputPath, html, 'utf-8');
    return { success: true, outputPath, size: Buffer.byteLength(html) };
  }
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

export async function runHtmlGenerator(args) {
  const { input, output, theme, title } = args;
  const gen = new HtmlGenerator();
  try {
    const result = await gen.generateFromFile(input, output, { theme, title });
    console.log(`HTML generated: ${result.outputPath} (${result.size} bytes)`);
    return result;
  } catch (err) {
    console.error(`HTML ERROR: ${err.message}`);
    process.exitCode = 1;
    return { success: false, error: err.message };
  }
}
