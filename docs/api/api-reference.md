# CyberSec Reporting Engine — API Reference

> **Version:** 1.0.0 · **Last Updated:** 2026-06-01

---

## Table of Contents

1. [Programmatic API (Node.js)](#1-programmatic-api-nodejs)
2. [Python API](#2-python-api)
3. [CLI as API](#3-cli-as-api)
4. [Finding Data Format Specification](#4-finding-data-format-specification)
5. [Template Variable Reference](#5-template-variable-reference)
6. [Theme Customization API](#6-theme-customization-api)
7. [Plugin & Extension API](#7-plugin--extension-api)
8. [Event Hooks](#8-event-hooks)

---

## 1. Programmatic API (Node.js)

### Installation

```bash
npm install cybersec-reporting-engine
```

### OutputOrchestrator

The primary API entry point for generating reports programmatically.

```javascript
import { OutputOrchestrator } from 'cybersec-reporting-engine/outputs/orchestrator.js';

const orchestrator = new OutputOrchestrator({
  concurrency: 4,
  outputDir: './output',
  createPackage: true,
  formats: ['md', 'html', 'pdf', 'docx'],
  markdown: { templateDir: './templates' },
  html: { theme: 'default' },
  pdf: { pageSize: 'a4' },
  pythonPath: 'python3',
});

// Listen for progress events
orchestrator.on('progress', ({ stage, current, total, detail }) => {
  console.log(`[${stage}] ${detail}`);
});

// Listen for errors
orchestrator.on('error', ({ stage, error }) => {
  console.error(`[${stage}] ERROR: ${error}`);
});

// Generate all formats
const result = await orchestrator.generateAll({
  input: './findings/pentest.yaml',
  outputDir: './reports/',
  outputName: 'ACME-Pentest-Q1-2026',
  formats: ['md', 'html', 'pdf', 'docx'],
  theme: 'enterprise-dark',
  template: 'technical',
  classification: 'CONFIDENTIAL',
});

console.log(result);
// {
//   success: true,
//   outputDir: './reports/',
//   results: { md: {...}, html: {...}, pdf: {...}, docx: {...} },
//   files: [
//     { path: './reports/ACME-Pentest-Q1-2026.md', format: 'md' },
//     { path: './reports/ACME-Pentest-Q1-2026.html', format: 'html' },
//     { path: './reports/ACME-Pentest-Q1-2026.pdf', format: 'pdf' },
//     { path: './reports/ACME-Pentest-Q1-2026.docx', format: 'docx' }
//   ],
//   package: './reports/report-package.zip'
// }

// Clean up
await orchestrator.close();
```

### MarkdownGenerator

Generate Markdown directly from structured data.

```javascript
import { MarkdownGenerator } from 'cybersec-reporting-engine/outputs/markdown/markdown-generator.js';

const mdGen = new MarkdownGenerator({
  templateDir: './templates',
});

// Load and validate data
const data = await mdGen.loadData('./findings/pentest.yaml');
const { valid, errors } = mdGen.validate(data);
if (!valid) {
  console.error('Validation errors:', errors);
}

// Generate Markdown string
const markdown = await mdGen.generate(data, {
  template: 'technical',  // optional template name
});

// Or generate from file to file
const result = await mdGen.generateFromFile(
  './findings/pentest.yaml',
  './output/report.md',
  { template: 'technical' }
);
// { success: true, outputPath: './output/report.md', size: 127440 }
```

### HtmlGenerator

Convert Markdown to interactive HTML with themes.

```javascript
import { HtmlGenerator } from 'cybersec-reporting-engine/outputs/html/html-generator.js';

const htmlGen = new HtmlGenerator({
  themes: {
    // Optional: register custom themes
    'my-custom': {
      name: 'My Custom Theme',
      css: ':root { --bg: #fff; --fg: #111; ... }'
    }
  }
});

// List available themes
const themes = htmlGen.listThemes();
// [{ id: 'default', name: 'Default Professional' }, ...]

// Generate HTML from Markdown string
const html = await htmlGen.generate(markdownContent, {
  theme: 'enterprise-dark',
  title: 'ACME Security Assessment',
  findings: [
    { severity: 'critical', title: 'SQL Injection', cve: 'CVE-2024-0001' },
    { severity: 'high', title: 'XSS in Search', cve: '' },
  ],
});

// Or from file
const result = await htmlGen.generateFromFile(
  './output/report.md',
  './output/report.html',
  { theme: 'enterprise-dark' }
);
```

### PdfGenerator

Render HTML to PDF via Puppeteer.

```javascript
import { PdfGenerator } from 'cybersec-reporting-engine/outputs/pdf/pdf-generator.js';

const pdfGen = new PdfGenerator({
  pageSize: 'a4',
  landscape: false,
  marginTop: '20mm',
  marginBottom: '20mm',
  displayHeaderFooter: true,
  outline: true,
});

// Generate PDF from HTML string
await pdfGen.generate(htmlString, {
  pageSize: 'letter',
  landscape: false,
  classification: 'CONFIDENTIAL',
  metadata: {
    title: 'Security Assessment Report',
    author: 'CyberSec Team',
  },
});

// Generate from file
const result = await pdfGen.generateFromFile(
  './output/report.html',
  './output/report.pdf',
  {
    pageSize: 'a4',
    classification: 'TOP SECRET',
    metadata: { title: 'ACME Pentest Report' },
  }
);
// { success: true, outputPath: './output/report.pdf', size: 1887436 }

// Clean up browser instance
await pdfGen.close();
```

---

## 2. Python API

### DocxGenerator

```python
from docx_generator import DocxGenerator, load_data

# Initialize with style overrides
gen = DocxGenerator(style_overrides={
    "classification": "CONFIDENTIAL",
    "company_name": "ACME Security Consulting",
    "font_body": "Calibri",
    "font_heading": "Calibri Light",
    "page_margin_cm": 2.54,
})

# Load data from JSON/YAML
data = load_data("./findings/pentest.yaml")

# Generate document
doc = gen.generate(data)
doc.save("./output/report.docx")

# Or use convenience method
result = gen.generate_from_file(
    "./findings/pentest.yaml",
    "./output/report.docx"
)
# {"success": True, "outputPath": "./output/report.docx", "size": 245760}
```

### Style Override Reference

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `font_body` | string | `"Calibri"` | Body text font |
| `font_heading` | string | `"Calibri Light"` | Heading font |
| `font_mono` | string | `"Consolas"` | Code/Monospace font |
| `font_size_body` | int | `11` | Body text size in pt |
| `color_primary` | string | `"1A56DB"` | Accent/heading color (hex) |
| `color_text` | string | `"1A1A1A"` | Main text color (hex) |
| `color_critical` | string | `"DC2626"` | Critical severity color |
| `color_high` | string | `"EA580C"` | High severity color |
| `color_medium` | string | `"CA8A04"` | Medium severity color |
| `color_low` | string | `"16A34A"` | Low severity color |
| `page_margin_cm` | float | `2.54` | Page margins in cm |
| `classification` | string | `"CONFIDENTIAL"` | Default classification |
| `company_name` | string | `"CyberSec Inc."` | Company name for cover |

---

## 3. CLI as API

The CLI can be invoked programmatically for scripting and CI/CD integration.

```javascript
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

async function generateReport(inputFile, outputDir) {
  const { stdout, stderr } = await execFileAsync('node', [
    'cli.js', 'generate',
    '--input', inputFile,
    '--output', outputDir,
    '--formats', 'md,html,pdf,docx',
    '--theme', 'enterprise-dark',
  ], {
    cwd: '/path/to/cybersec-reporting-engine',
    timeout: 120000,
  });

  console.log(stdout);
  if (stderr) console.error(stderr);
}

await generateReport('./findings.yaml', './deliverables/');
```

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Validation error or generation failure |

---

## 4. Finding Data Format Specification

### Top-Level Structure

```typescript
interface ReportData {
  metadata: ReportMetadata;
  executiveSummary?: string;
  sections: ReportSection[];
  appendices?: Appendix[];
}

interface ReportMetadata {
  title: string;          // Required
  author?: string;
  classification?: 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET'
                    | 'TLP:CLEAR' | 'TLP:GREEN' | 'TLP:AMBER' | 'TLP:RED';
  generatedAt: string;    // Required, ISO 8601
  version: string;        // Required, semver
  tags?: string[];
}
```

### Section Structure

```typescript
interface ReportSection {
  id: string;             // Required, kebab-case identifier
  title: string;          // Required
  content?: string;       // Free-text Markdown
  severity?: string;
  findings?: Finding[];
  tables?: Table[];
  diagrams?: Diagram[];
}
```

### Finding Structure

```typescript
interface Finding {
  title: string;          // Required, max 120 chars
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cve?: string;           // e.g., "CVE-2024-0001"
  cvssScore?: number;     // 0.0 - 10.0
  affectedSystems: string;
  description: string;    // 100-2000 chars recommended
  impact: string;
  remediation: string;
  references?: string;
}
```

### Table Structure

```typescript
interface Table {
  title?: string;
  headers: string[];
  rows: string[][];
}
```

### Diagram Structure

```typescript
interface Diagram {
  type: 'flowchart' | 'gantt' | 'pie' | 'sequence';
  title?: string;
  direction?: string;     // flowchart: 'TD', 'LR', etc.
  nodes?: DiagramNode[];  // flowchart
  edges?: DiagramEdge[];  // flowchart
  sections?: GanttSection[]; // gantt
  slices?: PieSlice[];    // pie
  participants?: Participant[]; // sequence
  messages?: SequenceMessage[]; // sequence
}
```

### JSON Schema (Abbreviated)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "id": "/ReportSchema",
  "type": "object",
  "required": ["metadata", "sections"],
  "properties": {
    "metadata": {
      "type": "object",
      "required": ["title", "generatedAt", "version"],
      "properties": {
        "title": { "type": "string" },
        "author": { "type": "string" },
        "classification": {
          "type": "string",
          "enum": ["UNCLASSIFIED", "CONFIDENTIAL", "SECRET", "TOP SECRET",
                   "TLP:CLEAR", "TLP:GREEN", "TLP:AMBER", "TLP:RED"]
        },
        "generatedAt": { "type": "string" },
        "version": { "type": "string" },
        "tags": { "type": "array", "items": { "type": "string" } }
      }
    },
    "sections": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "title"],
        "properties": {
          "id": { "type": "string" },
          "title": { "type": "string" },
          "content": { "type": "string" },
          "severity": { "type": "string" },
          "findings": { "type": "array" },
          "tables": { "type": "array" },
          "diagrams": { "type": "array" }
        }
      }
    }
  }
}
```

---

## 5. Template Variable Reference

### Metadata Variables

| Variable | Type | Source |
|----------|------|--------|
| `{{metadata.title}}` | string | data.metadata.title |
| `{{metadata.author}}` | string | data.metadata.author |
| `{{metadata.classification}}` | string | data.metadata.classification |
| `{{metadata.generatedAt}}` | string | data.metadata.generatedAt |
| `{{metadata.version}}` | string | data.metadata.version |
| `{{metadata.tags}}` | string[] | data.metadata.tags |

### Content Variables

| Variable | Type | Source |
|----------|------|--------|
| `{{executiveSummary}}` | string | data.executiveSummary |
| `{{sections}}` | array | data.sections |
| `{{sections[*].id}}` | string | Each section's id |
| `{{sections[*].title}}` | string | Each section's title |
| `{{sections[*].content}}` | string | Each section's content |
| `{{sections[*].findings}}` | array | Each section's findings |

### Finding Variables

| Variable | Type | Source |
|----------|------|--------|
| `{{title}}` | string | finding.title |
| `{{severity}}` | string | finding.severity |
| `{{cve}}` | string | finding.cve |
| `{{cvssScore}}` | number | finding.cvssScore |
| `{{affectedSystems}}` | string | finding.affectedSystems |
| `{{description}}` | string | finding.description |
| `{{impact}}` | string | finding.impact |
| `{{remediation}}` | string | finding.remediation |
| `{{references}}` | string | finding.references |

### Computed Variables (from template-config.yaml)

| Variable | Expression |
|----------|-----------|
| `{{total_findings_count}}` | critical + high + medium + low + info |
| `{{exploitable_count}}` | critical + high |
| `{{critical_pct}}` | round((critical / total) * 100, 1) |
| `{{mean_cvss}}` | mean of all finding CVSS scores |
| `{{overall_risk_score}}` | weighted sum / total findings |
| `{{generation_timestamp}}` | now().isoformat() |

---

## 6. Theme Customization API

### Theme Object Structure

```typescript
interface Theme {
  name: string;
  css: string;  // CSS custom properties defining the theme
}
```

### CSS Custom Properties

```css
:root {
  /* Core colors */
  --bg: #ffffff;
  --fg: #1a1a1a;
  --accent: #1a56db;
  --muted: #6b7280;
  --border: #e5e7eb;
  --surface: #f9fafb;

  /* Severity colors */
  --critical: #dc2626;
  --high: #ea580c;
  --medium: #ca8a04;
  --low: #16a34a;
  --info: #2563eb;

  /* Typography */
  --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Registering Custom Themes

```javascript
const htmlGen = new HtmlGenerator({
  themes: {
    'acme-corp': {
      name: 'ACME Corporate',
      css: `
        :root {
          --bg: #ffffff;
          --fg: #1a1a1a;
          --accent: #ff6b35;
          --critical: #dc3545;
          --high: #fd7e14;
          --medium: #ffc107;
          --low: #28a745;
          --info: #17a2b8;
          --font: 'Inter', sans-serif;
          --mono: 'Fira Code', monospace;
        }
      `
    }
  }
});
```

### Brand Override System

```yaml
# branding-config.yaml
overrides:
  rules:
    - scope: "client.*.brand_primary_color"
      priority: 100
      description: "Client brand color replaces primary theme color"
    - scope: "client.*.logo"
      priority: 100
      description: "Client logo replaces default on cover and header"
  merge_strategy: "deep_merge"
  # Resolution: client > engagement > theme > defaults
```

---

## 7. Plugin & Extension API

### Extension Lifecycle Hooks

```typescript
interface Extension {
  name: string;
  description: string;
  enabled: boolean;

  // Lifecycle hooks
  preValidation?(data: ReportData): ReportData;
  postValidation?(data: ReportData): ReportData;
  preRender?(markdown: string): string;
  postRender?(markdown: string): string;
  preOutput?(content: string, format: string): string;
  onComplete?(results: GenerationResults): void;
}
```

### Creating an Extension

```javascript
// extensions/my-enricher/index.js
export default class CveEnricher {
  constructor(config = {}) {
    this.name = 'cve-enricher';
    this.description = 'Enriches findings with live CVE data';
    this.enabled = true;
    this.config = config;
  }

  async postValidation(data) {
    for (const section of data.sections || []) {
      for (const finding of section.findings || []) {
        if (finding.cve) {
          const enriched = await this.lookupCve(finding.cve);
          finding.cvssScore = enriched.cvssScore || finding.cvssScore;
          finding.references = finding.references
            ? `${finding.references}\n${enriched.url}`
            : enriched.url;
        }
      }
    }
    return data;
  }

  async lookupCve(cveId) {
    // Fetch from NVD API
    const response = await fetch(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${cveId}`
    );
    const data = await response.json();
    // ... parse and return enriched data
  }
}
```

### Registering Extensions

```yaml
# template-config.yaml
extensions:
  - name: "cve-enricher"
    description: "Enriches findings with live CVE data from NVD API"
    enabled: true
  - name: "mitre-attack-intelligence"
    description: "Pulls latest ATT&CK technique metadata"
    enabled: true
```

---

## 8. Event Hooks

### Orchestrator Events

The `OutputOrchestrator` extends `EventEmitter` and emits the following events:

```javascript
orchestrator.on('progress', ({ stage, current, total, detail }) => {
  // stage: 'markdown' | 'html' | 'pdf' | 'docx' | 'package' | 'overall'
  // current: number (current step)
  // total: number (total steps)
  // detail: string (human-readable status)
});

orchestrator.on('error', ({ stage, error }) => {
  // stage: which generator failed
  // error: error message string
});
```

### Event-Driven Progress Tracking

```javascript
// Build a progress bar from orchestrator events
const progress = {};

orchestrator.on('progress', ({ stage, current, total, detail }) => {
  progress[stage] = { current, total, detail };
  renderProgressBar(progress);
});

orchestrator.on('error', ({ stage, error }) => {
  console.error(`\n[${stage.toUpperCase()}] FAILED: ${error}`);
});
```

### Integrating with External Systems

```javascript
// Send progress to Slack
orchestrator.on('progress', async ({ stage, detail }) => {
  if (stage === 'overall') {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify({ text: `Report generation: ${detail}` }),
    });
  }
});

// Log to monitoring system
orchestrator.on('error', async ({ stage, error }) => {
  await logToDataDog('report.generation.error', {
    stage,
    error,
    timestamp: new Date().toISOString(),
  });
});
```

---

## Appendix: Full GenerationResult Type

```typescript
interface GenerationResult {
  success: boolean;
  outputDir: string;
  results: {
    md?:  { path: string | null; content: string; error?: string };
    html?: { path: string | null; content: string; error?: string };
    pdf?:  { outputPath?: string; path?: string; error?: string };
    docx?: { path: string | null; success: boolean; error?: string };
  };
  files: Array<{
    path: string;
    format: 'md' | 'html' | 'pdf' | 'docx';
  }>;
  package: string | null;
  error?: string;
}
```
