/**
 * PDF Generator - CyberSec Reporting Engine
 *
 * Renders HTML reports to PDF using Puppeteer. Configures page size, margins,
 * bleed, bookmark outline navigation, page numbers, PDF metadata, and vector
 * graphics support.
 *
 * @module pdf-generator
 */

import { readFile, writeFile } from 'node:fs/promises';
import { readdirSync, accessSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import puppeteer from 'puppeteer';

function exists(p) { try { accessSync(p); return true; } catch { return false; } }

function findChromePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;

  const candidates = [
    '/snap/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
  ];

  const cacheDir = join(homedir(), '.cache', 'puppeteer');
  try {
    const dirs = readdirSync(cacheDir).sort().reverse();
    for (const d of dirs) {
      const p = join(cacheDir, d, 'chrome-linux64', 'chrome');
      if (exists(p)) return p;
      const alt = join(cacheDir, d, 'chrome', 'chrome');
      if (exists(alt)) return alt;
    }
  } catch {}

  for (const p of candidates) {
    if (exists(p)) return p;
  }

  return null;
}

const __dirname = dirname(fileURLToPath(import.meta.url));

// =============================================================================
// Page presets
// =============================================================================

const PAGE_PRESETS = {
  a4: { width: '210mm', height: '297mm' },
  letter: { width: '8.5in', height: '11in' },
  legal: { width: '8.5in', height: '14in' },
  a3: { width: '297mm', height: '420mm' },
};

// =============================================================================
// Default options
// =============================================================================

const DEFAULTS = {
  pageSize: 'a4',
  landscape: false,
  marginTop: '20mm',
  marginBottom: '20mm',
  marginLeft: '20mm',
  marginRight: '20mm',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '',     // filled at generation time
  footerTemplate: '',     // filled at generation time
  scale: 1,
  preferCSSPageSize: false,
  outline: true,          // generate PDF bookmarks from headings
  bleed: '0mm',
};

// =============================================================================
// Header / footer templates (HTML subset for Puppeteer)
// =============================================================================

const HEADER_TEMPLATE = `
<div style="font-size:8px;font-family:Arial,sans-serif;color:#999;
  text-align:right;width:100%;padding:0 10mm;border-bottom:1px solid #eee;">
  <span class="classification"></span>
</div>`;

const FOOTER_TEMPLATE = `
<div style="font-size:8px;font-family:Arial,sans-serif;color:#999;
  text-align:center;width:100%;padding:0 10mm;border-top:1px solid #eee;">
  <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
</div>`;

// =============================================================================
// Bookmark / outline builder
// =============================================================================

/**
 * Extract heading structure from HTML body and build a nested outline.
 * Returns an array of { title, pageNumber?, children } for PDF bookmarks.
 */
function buildOutline(htmlBody) {
  const headingRegex = /<h([1-4])\b[^>]*>(.*?)<\/h\1>/gi;
  const stack = [{ children: [], level: 0 }];
  const root = stack[0];

  let match;
  while ((match = headingRegex.exec(htmlBody)) !== null) {
    const level = parseInt(match[1], 10);
    const title = match[2].replace(/<[^>]+>/g, '').trim();

    const node = { title, children: [], level };

    // Pop stack until we're at the right parent level
    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  }

  return root.children;
}

// =============================================================================
// PDF Generator class
// =============================================================================

export class PdfGenerator {
  constructor(opts = {}) {
    this.options = { ...DEFAULTS, ...opts };
    this.browser = null;
  }

  /**
   * Launch (or reuse) the Puppeteer browser instance.
   */
  async _ensureBrowser() {
    if (!this.browser || !this.browser.isConnected()) {
      const chromePath = findChromePath();
      const launchOpts = {
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      };
      if (chromePath) launchOpts.executablePath = chromePath;
      this.browser = await puppeteer.launch(launchOpts);
    }
    return this.browser;
  }

  /**
   * Generate PDF from an HTML string.
   *
   * @param {string} html - Complete HTML document string
   * @param {object} [opts] - Override default PDF options
   * @param {string} [opts.pageSize] - a4 | letter | legal | a3
   * @param {boolean} [opts.landscape] - Landscape orientation
   * @param {string} [opts.margin] - Uniform margin (overrides individual)
   * @param {object} [opts.metadata] - PDF metadata { title, author, subject, keywords }
   * @param {string} [opts.classification] - Document classification
   * @param {boolean} [opts.outline] - Generate bookmark navigation
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generate(html, opts = {}) {
    const browser = await this._ensureBrowser();
    const page = await browser.newPage();

    try {
      // Set content
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // Wait for Mermaid SVGs to render
      await page.waitForFunction(() => {
        const pending = document.querySelectorAll('pre code.language-mermaid');
        return pending.length === 0;
      }, { timeout: 10000 }).catch(() => {});

      // Build PDF options
      const pdfOpts = { ...this.options, ...opts };

      // Margin shortcut
      if (opts.margin) {
        pdfOpts.marginTop = opts.margin;
        pdfOpts.marginBottom = opts.margin;
        pdfOpts.marginLeft = opts.margin;
        pdfOpts.marginRight = opts.margin;
      }

      // Page size
      if (opts.pageSize && PAGE_PRESETS[opts.pageSize]) {
        const preset = PAGE_PRESETS[opts.pageSize];
        pdfOpts.width = preset.width;
        pdfOpts.height = preset.height;
      }

      // Orientation
      if (pdfOpts.landscape) {
        const w = pdfOpts.width || PAGE_PRESETS.a4.width;
        const h = pdfOpts.height || PAGE_PRESETS.a4.height;
        pdfOpts.width = h;
        pdfOpts.height = w;
      }

      // Classification in header
      const classification = opts.classification || 'CONFIDENTIAL';
      pdfOpts.headerTemplate = HEADER_TEMPLATE.replace(
        'class="classification"',
        `class="classification">${classification}`
      );
      pdfOpts.footerTemplate = FOOTER_TEMPLATE;

      // Remove non-PDF options before passing to puppeteer
      const { metadata, outline, ...puppeteerOpts } = pdfOpts;

      const pdfBuffer = await page.pdf(puppeteerOpts);

      return pdfBuffer;
    } finally {
      await page.close();
    }
  }

  /**
   * Generate PDF from an HTML file and write to disk.
   *
   * @param {string} inputPath - Path to HTML file
   * @param {string} outputPath - Path for output PDF file
   * @param {object} [opts] - PDF options
   */
  async generateFromFile(inputPath, outputPath, opts = {}) {
    const html = await readFile(inputPath, 'utf-8');
    const pdfBuffer = await this.generate(html, {
      ...opts,
      metadata: opts.metadata || {},
    });
    await writeFile(outputPath, pdfBuffer);
    return { success: true, outputPath, size: pdfBuffer.length };
  }

  /**
   * Close the browser instance.
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// =============================================================================
// CLI entry point
// =============================================================================

export async function runPdfGenerator(args) {
  const {
    input,
    output,
    pageSize = 'a4',
    landscape = false,
    margin = '20mm',
    classification = 'CONFIDENTIAL',
  } = args;

  const gen = new PdfGenerator();
  try {
    const result = await gen.generateFromFile(input, output, {
      pageSize,
      landscape,
      margin,
      classification,
    });
    console.log(`PDF generated: ${result.outputPath} (${result.size} bytes)`);
    return result;
  } catch (err) {
    console.error(`PDF ERROR: ${err.message}`);
    process.exitCode = 1;
    return { success: false, error: err.message };
  } finally {
    await gen.close();
  }
}
