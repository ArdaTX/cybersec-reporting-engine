#!/usr/bin/env node
/**
 * CyberSec Reporting Engine - CLI Tool
 *
 * Commands:
 *   generate   Generate report from findings
 *   validate   Validate findings against schema
 *   theme      List/apply themes
 *   template   List/use templates
 *   init       Initialize a new project
 *   serve      Start local report viewer
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { Command } from 'commander';
import { readFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Dynamic imports for heavy modules
// ---------------------------------------------------------------------------

async function loadMarkdownGen() {
  const { MarkdownGenerator } = await import(
    join(__dirname, 'outputs', 'markdown', 'markdown-generator.js')
  );
  return new MarkdownGenerator();
}

async function loadHtmlGen() {
  const { HtmlGenerator } = await import(
    join(__dirname, 'outputs', 'html', 'html-generator.js')
  );
  return new HtmlGenerator();
}

async function loadPdfGen() {
  const { PdfGenerator } = await import(
    join(__dirname, 'outputs', 'pdf', 'pdf-generator.js')
  );
  return new PdfGenerator();
}

async function loadOrchestrator() {
  const { OutputOrchestrator } = await import(
    join(__dirname, 'outputs', 'orchestrator.js')
  );
  return OutputOrchestrator;
}

// ---------------------------------------------------------------------------
// Package metadata
// ---------------------------------------------------------------------------

const PKG = JSON.parse(
  readFileSync(join(__dirname, 'package.json'), 'utf-8')
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadConfig() {
  try {
    const raw = readFileSync(join(process.cwd(), '.cybersecrc.yaml'), 'utf-8');
    return parseYaml(raw);
  } catch {
    return {};
  }
}

function mergeConfig(cliOpts) {
  const cfg = loadConfig();
  return { ...cfg, ...cliOpts };
}

// ---------------------------------------------------------------------------
// CLI definition
// ---------------------------------------------------------------------------

const program = new Command();

program
  .name('cybersec-report')
  .description('CyberSec Reporting Engine - Generate professional security reports')
  .version(PKG.version);

// ---------------------------------------------------------------------------
// generate
// ---------------------------------------------------------------------------

program
  .command('generate')
  .description('Generate report from findings data')
  .requiredOption('-i, --input <path>', 'Path to findings JSON/YAML file')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('-n, --name <name>', 'Output filename base')
  .option('-f, --formats <formats>', 'Output formats (md,html,pdf,docx)', 'md,html,pdf')
  .option('-t, --theme <theme>', 'HTML theme (default,dark,corporate,military)', 'default')
  .option('--template <name>', 'Markdown template name')
  .option('-c, --classification <class>', 'Document classification')
  .option('--no-package', 'Skip creating ZIP package')
  .action(async (opts) => {
    const Orchestrator = await loadOrchestrator();
    const orch = new Orchestrator({
      outputDir: opts.output,
      createPackage: opts.package,
      formats: opts.formats.split(',').map((s) => s.trim()),
    });

    orch.on('progress', ({ stage, detail }) => {
      console.log(`  [${stage}] ${detail}`);
    });

    orch.on('error', ({ stage, error }) => {
      console.error(`  [${stage}] ERROR: ${error}`);
    });

    const result = await orch.generateAll({
      input: opts.input,
      outputDir: opts.output,
      outputName: opts.name,
      formats: opts.formats.split(',').map((s) => s.trim()),
      theme: opts.theme,
      template: opts.template,
      classification: opts.classification,
    });

    console.log(`\nReports generated in: ${result.outputDir}`);
    for (const f of result.files) {
      console.log(`  ${f.format.toUpperCase()}: ${f.path}`);
    }
    await orch.close();
  });

// ---------------------------------------------------------------------------
// validate
// ---------------------------------------------------------------------------

program
  .command('validate')
  .description('Validate findings data against schema')
  .requiredOption('-i, --input <path>', 'Path to findings JSON/YAML file')
  .action(async (opts) => {
    const gen = await loadMarkdownGen();
    const raw = await readFile(opts.input, 'utf-8');
    let data;
    if (opts.input.endsWith('.yml') || opts.input.endsWith('.yaml')) {
      data = parseYaml(raw);
    } else {
      data = JSON.parse(raw);
    }

    const { valid, errors } = gen.validate(data);
    if (valid) {
      console.log('Validation: PASSED');
      console.log(`  Sections: ${data.sections?.length || 0}`);
      const findings = data.sections?.flatMap((s) => s.findings || []) || [];
      console.log(`  Findings: ${findings.length}`);
    } else {
      console.error('Validation: FAILED');
      console.error(`  ${errors.length} error(s):`);
      for (const e of errors) {
        console.error(`    - ${e.path}: ${e.message}`);
      }
      process.exitCode = 1;
    }
  });

// ---------------------------------------------------------------------------
// theme
// ---------------------------------------------------------------------------

const themeCommand = program
  .command('theme')
  .description('List available themes or preview a theme');

themeCommand
  .command('list')
  .description('List all available themes')
  .action(async () => {
    const gen = await loadHtmlGen();
    const themes = gen.listThemes();
    console.log('Available themes:');
    for (const t of themes) {
      console.log(`  ${t.id.padEnd(15)} ${t.name}`);
    }
  });

themeCommand
  .command('preview')
  .description('Generate a quick preview of a theme')
  .option('-t, --theme <theme>', 'Theme ID', 'default')
  .action(async (opts) => {
    const gen = await loadHtmlGen();
    const sample = `# Theme Preview\n\nThis is a sample report with **bold text** and *italic text*.\n\n## Section\n\nSample content.`;
    const html = await gen.generate(sample, {
      theme: opts.theme,
      title: 'Theme Preview',
      findings: [
        { severity: 'critical', title: 'Critical Vuln', cve: 'CVE-2024-0001' },
        { severity: 'high', title: 'High Risk', cve: 'CVE-2024-0002' },
        { severity: 'medium', title: 'Medium Issue', cve: 'CVE-2024-0003' },
        { severity: 'low', title: 'Low Finding', cve: 'CVE-2024-0004' },
      ],
    });
    const outPath = join(process.cwd(), 'theme-preview.html');
    await writeFile(outPath, html, 'utf-8');
    console.log(`Preview written to: ${outPath}`);
  });

// Default theme action: list
themeCommand.action(async () => {
  const gen = await loadHtmlGen();
  const themes = gen.listThemes();
  console.log('Available themes (use "theme list" or "theme preview"):');
  for (const t of themes) {
    console.log(`  ${t.id.padEnd(15)} ${t.name}`);
  }
});

// ---------------------------------------------------------------------------
// template
// ---------------------------------------------------------------------------

const templateCommand = program
  .command('template')
  .description('Manage report templates');

templateCommand
  .command('list')
  .description('List available templates')
  .action(async () => {
    const { glob } = await import('glob');
    const tplDir = join(__dirname, 'outputs', 'markdown', 'templates');
    let files;
    try {
      files = await glob('*.md', { cwd: tplDir });
    } catch {
      files = [];
    }
    if (files.length === 0) {
      console.log('No templates found. Create .md files in outputs/markdown/templates/');
    } else {
      console.log('Available templates:');
      for (const f of files) {
        console.log(`  ${f.replace('.md', '')}`);
      }
    }
  });

templateCommand
  .command('create')
  .description('Create a new template')
  .requiredOption('-n, --name <name>', 'Template name')
  .action(async (opts) => {
    const tplDir = join(__dirname, 'outputs', 'markdown', 'templates');
    await mkdir(tplDir, { recursive: true });
    const tpl = `# {{metadata.title}}\n\n` +
      `**Classification:** {{metadata.classification}}\n` +
      `**Generated:** {{metadata.generatedAt}}\n\n` +
      `## Executive Summary\n\n{{executiveSummary}}\n\n` +
      `## Findings\n\n{{#each sections}}\n` +
      `### {{title}}\n\n{{content}}\n\n` +
      `{{/each}}\n`;
    await writeFile(join(tplDir, `${opts.name}.md`), tpl, 'utf-8');
    console.log(`Template created: ${join(tplDir, `${opts.name}.md`)}`);
  });

templateCommand.action(async () => {
  console.log('Use "template list" or "template create".');
});

// ---------------------------------------------------------------------------
// init
// ---------------------------------------------------------------------------

program
  .command('init')
  .description('Initialize a new project directory')
  .option('-d, --dir <path>', 'Project directory', '.')
  .action(async (opts) => {
    const dir = opts.dir;
    await mkdir(dir, { recursive: true });
    await mkdir(join(dir, 'findings'), { recursive: true });
    await mkdir(join(dir, 'output'), { recursive: true });
    await mkdir(join(dir, 'templates'), { recursive: true });

    // Sample config
    const config = `# CyberSec Reporting Engine Configuration
metadata:
  author: "Security Team"
  classification: "CONFIDENTIAL"

output:
  formats:
    - md
    - html
    - pdf
  theme: default
  pageSize: a4
  createPackage: true

markdown:
  templateDir: ./templates

html:
  theme: default

pdf:
  pageSize: a4
  landscape: false
`;

    await writeFile(join(dir, '.cybersecrc.yaml'), config, 'utf-8');

    // Sample findings
    const sampleFindings = {
      metadata: {
        title: 'Sample Security Assessment',
        author: 'CyberSec Team',
        classification: 'CONFIDENTIAL',
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        tags: ['sample', 'security'],
      },
      executiveSummary: 'This is a sample security assessment report.',
      sections: [
        {
          id: 'network-findings',
          title: 'Network Security Findings',
          content: '',
          findings: [
            {
              title: 'Open SSH Port on Production Server',
              severity: 'high',
              cve: 'CVE-2024-6387',
              cvssScore: 8.1,
              affectedSystems: 'prod-web-01, prod-web-02',
              description: 'SSH is exposed on non-standard port with weak ciphers.',
              impact: 'Potential unauthorized access to production systems.',
              remediation: 'Restrict SSH to internal IP ranges and enforce key-based auth.',
              references: 'https://nvd.nist.gov/vuln/detail/CVE-2024-6387',
            },
          ],
          tables: [],
          diagrams: [],
        },
        {
          id: 'web-findings',
          title: 'Web Application Findings',
          content: '',
          findings: [
            {
              title: 'Cross-Site Scripting in Search Endpoint',
              severity: 'medium',
              cve: '',
              cvssScore: 5.4,
              affectedSystems: 'app.example.com',
              description: 'Reflected XSS via the `q` query parameter.',
              impact: 'Could allow cookie theft and session hijacking.',
              remediation: 'Implement output encoding and CSP headers.',
              references: '',
            },
          ],
          tables: [],
          diagrams: [],
        },
      ],
    };

    await writeFile(
      join(dir, 'findings', 'sample-findings.yaml'),
      stringifyYaml(sampleFindings),
      'utf-8'
    );

    console.log(`Project initialized in: ${dir}`);
    console.log('  findings/          - Place your findings YAML/JSON files here');
    console.log('  output/            - Generated reports will appear here');
    console.log('  templates/         - Custom markdown templates');
    console.log('  .cybersecrc.yaml   - Configuration file');
    console.log('\nNext steps:');
    console.log(`  cybersec-report generate -i findings/sample-findings.yaml`);
  });

// ---------------------------------------------------------------------------
// serve
// ---------------------------------------------------------------------------

program
  .command('serve')
  .description('Start a local report viewer server')
  .option('-p, --port <port>', 'Port number', '3000')
  .option('-d, --dir <path>', 'Directory to serve reports from', './output')
  .action(async (opts) => {
    const { readFile, stat } = await import('node:fs/promises');
    const { createReadStream } = await import('node:fs');
    const path = await import('node:path');

    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.md': 'text/markdown',
    };

    const server = createServer(async (req, res) => {
      let urlPath = req.url === '/' ? '/index.html' : req.url;
      const filePath = path.join(opts.dir, urlPath);

      // Directory listing
      if (req.url === '/') {
        try {
          const { readdir } = await import('node:fs/promises');
          const entries = await readdir(opts.dir);
          const listing = entries
            .filter((e) => !e.startsWith('.'))
            .map(
              (e) =>
                `<li><a href="/${e}">${e}</a></li>`
            )
            .join('\n');
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(
            `<!DOCTYPE html><html><head><title>Reports</title>
            <meta charset="utf-8"><style>body{font-family:sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;}
            li{margin:0.5rem 0;}a{color:#1a56db;}</style></head>
            <body><h1>CyberSec Reporting Engine</h1><h2>Reports</h2><ul>${listing}</ul></body></html>`
          );
        } catch {
          res.writeHead(500);
          res.end('Error reading directory');
        }
        return;
      }

      try {
        const stats = await stat(filePath);
        if (stats.isDirectory()) {
          res.writeHead(302, { Location: req.url + '/' });
          res.end();
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        const stream = createReadStream(filePath);
        stream.pipe(res);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
    });

    server.listen(parseInt(opts.port, 10), () => {
      console.log(`Report viewer running at http://localhost:${opts.port}`);
      console.log(`Serving files from: ${opts.dir}`);
      console.log('Press Ctrl+C to stop.');
    });
  });

// ---------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------

program.parseAsync(process.argv).catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
