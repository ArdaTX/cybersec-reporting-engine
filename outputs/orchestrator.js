/**
 * Output Orchestrator - CyberSec Reporting Engine
 *
 * Master orchestrator that takes input config and finding data, routes to
 * appropriate generators, manages parallel generation, reports progress via
 * events, handles errors gracefully, and outputs a final deliverable package.
 *
 * @module orchestrator
 */

import { EventEmitter } from 'node:events';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import archiver from 'archiver';

import { MarkdownGenerator } from './markdown/markdown-generator.js';
import { HtmlGenerator } from './html/html-generator.js';
import { PdfGenerator } from './pdf/pdf-generator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// =============================================================================
// Orchestrator
// =============================================================================

export class OutputOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      concurrency: 4,
      outputDir: './output',
      createPackage: true,
      formats: ['md', 'html', 'pdf'],
      ...config,
    };
    this._mdGen = new MarkdownGenerator(config.markdown || {});
    this._htmlGen = new HtmlGenerator(config.html || {});
    this._pdfGen = new PdfGenerator(config.pdf || {});
  }

  // -------------------------------------------------------------------
  // Progress helpers
  // -------------------------------------------------------------------

  _reportProgress(stage, current, total, detail = '') {
    this.emit('progress', { stage, current, total, detail });
  }

  _reportError(stage, error) {
    this.emit('error', { stage, error });
  }

  // -------------------------------------------------------------------
  // Step 1: Markdown
  // -------------------------------------------------------------------

  async _generateMarkdown(data, outputBase, opts) {
    this._reportProgress('markdown', 0, 1, 'Generating markdown...');
    try {
      const md = await this._mdGen.generate(data, { template: opts.template });
      const mdPath = `${outputBase}.md`;
      await writeFile(mdPath, md, 'utf-8');
      this._reportProgress('markdown', 1, 1, `Written: ${mdPath}`);
      return { path: mdPath, content: md };
    } catch (err) {
      this._reportError('markdown', err.message);
      return { path: null, content: '', error: err.message };
    }
  }

  // -------------------------------------------------------------------
  // Step 2: HTML
  // -------------------------------------------------------------------

  async _generateHtml(mdContent, outputBase, opts) {
    this._reportProgress('html', 0, 1, 'Generating HTML...');
    try {
      // Collect all findings across sections for KPI widgets
      const allFindings = [];
      if (opts.data?.sections) {
        for (const sec of opts.data.sections) {
          if (sec.findings) allFindings.push(...sec.findings);
        }
      }

      const html = await this._htmlGen.generate(mdContent, {
        theme: opts.theme,
        title: opts.data?.metadata?.title,
        findings: allFindings,
      });
      const htmlPath = `${outputBase}.html`;
      await writeFile(htmlPath, html, 'utf-8');
      this._reportProgress('html', 1, 1, `Written: ${htmlPath}`);
      return { path: htmlPath, content: html };
    } catch (err) {
      this._reportError('html', err.message);
      return { path: null, content: '', error: err.message };
    }
  }

  // -------------------------------------------------------------------
  // Step 3: PDF
  // -------------------------------------------------------------------

  async _generatePdf(htmlPath, outputBase, opts) {
    this._reportProgress('pdf', 0, 1, 'Generating PDF...');
    try {
      const result = await this._pdfGen.generateFromFile(
        htmlPath,
        `${outputBase}.pdf`,
        {
          pageSize: opts.pageSize || 'a4',
          landscape: opts.landscape || false,
          classification: opts.data?.metadata?.classification || 'CONFIDENTIAL',
          metadata: {
            title: opts.data?.metadata?.title || 'Security Report',
            author: opts.data?.metadata?.author || 'CyberSec Engine',
          },
        }
      );
      this._reportProgress('pdf', 1, 1, `Written: ${result.outputPath}`);
      return result;
    } catch (err) {
      this._reportError('pdf', err.message);
      return { path: null, error: err.message };
    }
  }

  // -------------------------------------------------------------------
  // Step 4 (optional): DOCX via child process
  // -------------------------------------------------------------------

  async _generateDocx(inputDataPath, outputBase, opts) {
    this._reportProgress('docx', 0, 1, 'Generating DOCX (Python)...');
    try {
      const { execFile } = await import('node:child_process');
      const { existsSync } = await import('node:fs');
      const { join } = await import('node:path');
      let pythonPath = this.config.pythonPath || 'python3';
      const venvPaths = [
        join(process.cwd(), '.venv', 'bin', 'python3'),
        join(process.cwd(), 'venv', 'bin', 'python3'),
        join(process.cwd(), '.python-venv', 'bin', 'python3'),
        join(process.cwd(), 'env', 'bin', 'python3'),
        join(process.cwd(), '.env', 'bin', 'python3'),
      ];
      for (const vp of venvPaths) {
        if (existsSync(vp)) { pythonPath = vp; break; }
      }
      const scriptPath = join(__dirname, 'docx', 'docx-generator.py');
      const docxPath = `${outputBase}.docx`;

      await new Promise((resolve, reject) => {
        execFile(
          pythonPath,
          [scriptPath, inputDataPath, docxPath],
          { timeout: 60000 },
          (err, stdout, stderr) => {
            if (err) return reject(new Error(stderr || err.message));
            resolve(stdout);
          }
        );
      });

      this._reportProgress('docx', 1, 1, `Written: ${docxPath}`);
      return { path: docxPath, success: true };
    } catch (err) {
      this._reportError('docx', err.message);
      return { path: null, success: false, error: err.message };
    }
  }

  // -------------------------------------------------------------------
  // Package builder
  // -------------------------------------------------------------------

  async _createPackage(outputDir, files) {
    this._reportProgress('package', 0, 1, 'Creating deliverable package...');

    const zipPath = join(outputDir, 'report-package.zip');
    const archive = archiver('zip', { zlib: { level: 9 } });
    const output = createWriteStream(zipPath);

    const p = pipeline(archive, output);

    for (const file of files) {
      if (file.path) {
        const name = basename(file.path);
        archive.file(file.path, { name });
      }
    }

    // Add a manifest
    archive.append(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          files: files.map((f) => ({ name: basename(f.path || ''), format: f.format, error: f.error })),
          engine: 'CyberSec Reporting Engine',
        },
        null,
        2
      ),
      { name: 'manifest.json' }
    );

    await archive.finalize();
    await p;

    this._reportProgress('package', 1, 1, `Package: ${zipPath}`);
    return { path: zipPath };
  }

  // -------------------------------------------------------------------
  // Main orchestration
  // -------------------------------------------------------------------

  /**
   * Generate all configured output formats from a findings data file.
   *
   * @param {object} opts
   * @param {string} opts.input - Path to findings JSON/YAML file
   * @param {string} [opts.outputDir] - Output directory
   * @param {string} [opts.outputName] - Base filename for outputs
   * @param {string[]} [opts.formats] - Array of formats: md, html, pdf, docx
   * @param {string} [opts.theme] - HTML theme ID
   * @param {string} [opts.template] - Markdown template name
   * @param {string} [opts.classification] - Override document classification
   * @returns {Promise<object>} Results per format and package path
   */
  async generateAll(opts = {}) {
    const {
      input,
      outputDir = this.config.outputDir,
      outputName,
      formats = this.config.formats,
      theme = 'default',
      template,
      classification,
    } = opts;

    const totalSteps = formats.length + (this.config.createPackage ? 1 : 0);
    let completed = 0;

    // Load data
    const raw = await readFile(input, 'utf-8');
    let data;
    if (input.endsWith('.yml') || input.endsWith('.yaml')) {
      const { parse } = await import('yaml');
      data = parse(raw);
    } else {
      data = JSON.parse(raw);
    }

    if (classification) {
      if (!data.metadata) data.metadata = {};
      data.metadata.classification = classification;
    }

    // Ensure output directory
    await mkdir(outputDir, { recursive: true });

    const baseName = outputName || basename(input, extname(input));
    const outputBase = join(outputDir, baseName);

    const results = {};
    const generatedFiles = [];

    // Phase 1: Markdown (required for HTML/PDF chain)
    let mdResult = null;
    if (formats.includes('md') || formats.includes('html') || formats.includes('pdf')) {
      mdResult = await this._generateMarkdown(data, outputBase, { template, data });
      results.md = mdResult;
      if (mdResult.path) generatedFiles.push({ path: mdResult.path, format: 'md' });
      completed++;
      this._reportProgress('overall', completed, totalSteps);
    }

    // Phase 2: HTML & PDF (PDF depends on HTML)
    let htmlResult = null;

    if (formats.includes('html') && mdResult?.content) {
      htmlResult = await this._generateHtml(mdResult.content, outputBase, { theme, data });
      results.html = htmlResult;
      if (htmlResult.path) generatedFiles.push({ path: htmlResult.path, format: 'html' });
      completed++;
      this._reportProgress('overall', completed, totalSteps);
    }

    if (formats.includes('pdf') && mdResult?.content) {
      // Ensure HTML is available for PDF input
      if (!htmlResult) {
        htmlResult = await this._generateHtml(mdResult.content, outputBase, { theme, data });
        if (htmlResult.path) generatedFiles.push({ path: htmlResult.path, format: 'html-temp' });
      }
      if (htmlResult?.path) {
        const r = await this._generatePdf(htmlResult.path, outputBase, { data });
        results.pdf = r;
        if (r.outputPath || r.path) {
          generatedFiles.push({ path: r.outputPath || r.path, format: 'pdf' });
        }
        completed++;
        this._reportProgress('overall', completed, totalSteps);
      }
    }

    // Phase 3: DOCX (Python, runs independently)
    if (formats.includes('docx')) {
      const docxResult = await this._generateDocx(input, outputBase, { data });
      results.docx = docxResult;
      if (docxResult.path) generatedFiles.push({ path: docxResult.path, format: 'docx' });
      completed++;
      this._reportProgress('overall', completed, totalSteps);
    }

    // Phase 4: Package
    let packageResult = null;
    if (this.config.createPackage && generatedFiles.length > 0) {
      packageResult = await this._createPackage(outputDir, generatedFiles);
      completed++;
      this._reportProgress('overall', completed, totalSteps);
    }

    // Clean up temp HTML used for PDF
    if (!formats.includes('html') && formats.includes('pdf')) {
      const tempHtml = generatedFiles.find((f) => f.format === 'html-temp');
      if (tempHtml) {
        try { await import('node:fs/promises').then((fs) => fs.unlink(tempHtml.path)); } catch {}
      }
    }

    return {
      success: true,
      outputDir,
      results,
      files: generatedFiles.filter((f) => f.format !== 'html-temp'),
      package: packageResult?.path || null,
    };
  }

  /**
   * Clean up resources.
   */
  async close() {
    await this._pdfGen.close();
  }
}

// =============================================================================
// CLI entry point
// =============================================================================

export async function runOrchestrator(args) {
  const orch = new OutputOrchestrator({
    outputDir: args.outputDir || './output',
    createPackage: args.package !== false,
    formats: args.formats || ['md', 'html', 'pdf'],
  });

  orch.on('progress', ({ stage, current, total, detail }) => {
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;
    const bar = '█'.repeat(pct / 5) + '░'.repeat(20 - pct / 5);
    console.log(`[${stage.padEnd(12)}] [${bar}] ${pct}% ${detail}`);
  });

  orch.on('error', ({ stage, error }) => {
    console.error(`[${stage.padEnd(12)}] ERROR: ${error}`);
  });

  try {
    const result = await orch.generateAll({
      input: args.input,
      outputDir: args.outputDir,
      outputName: args.outputName,
      formats: args.formats,
      theme: args.theme,
      template: args.template,
      classification: args.classification,
    });

    console.log('\n=== Generation Complete ===');
    console.log(`Output directory: ${result.outputDir}`);
    for (const file of result.files) {
      console.log(`  ${file.format.toUpperCase()}: ${file.path}`);
    }
    if (result.package) {
      console.log(`  Package: ${result.package}`);
    }

    return result;
  } catch (err) {
    console.error(`ORCHESTRATOR ERROR: ${err.message}`);
    process.exitCode = 1;
    return { success: false, error: err.message };
  } finally {
    await orch.close();
  }
}
