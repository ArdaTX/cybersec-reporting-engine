# CyberSec Reporting Engine — Developer Guide

> **Version:** 1.0.0 · **Last Updated:** 2026-06-01

---

## Table of Contents

1. [Development Environment Setup](#1-development-environment-setup)
2. [Codebase Structure Walkthrough](#2-codebase-structure-walkthrough)
3. [How to Create a New Skill](#3-how-to-create-a-new-skill)
4. [How to Create a New Template](#4-how-to-create-a-new-template)
5. [How to Create a New Theme](#5-how-to-create-a-new-theme)
6. [How to Add a New Output Format](#6-how-to-add-a-new-output-format)
7. [Testing Guide](#7-testing-guide)
8. [CI/CD Pipeline](#8-cicd-pipeline)
9. [Release Process](#9-release-process)
10. [Code Quality Standards](#10-code-quality-standards)
11. [Contributing Workflow](#11-contributing-workflow)

---

## 1. Development Environment Setup

### Prerequisites

```bash
# Required
node --version   # >= 18.0.0
npm --version    # >= 9.0.0
python3 --version # >= 3.10.0

# Optional but recommended
git --version
nvm --version    # Node version manager
```

### Initial Setup

```bash
# Clone and enter the repository
git clone https://github.com/ArdaTX/Cybersec-Reporting-Engine.git
cd cybersec-reporting-engine

# Install Node.js dependencies
npm install

# Install development dependencies
npm install --save-dev eslint jest

# Set up Python virtual environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install pytest black flake8  # dev tools

# Verify everything works
npm test
npm run lint
python3 -m pytest tests/
```

### Editor Setup

**VS Code (recommended):**

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "node_modules": true,
    ".venv": true,
    "output": true
  }
}
```

### Environment Variables

```bash
# Development defaults
export CYBERSEC_DEV_MODE=true
export CYBERSEC_LOG_LEVEL=debug
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium  # skip download
```

---

## 2. Codebase Structure Walkthrough

```
cybersec-reporting-engine/
│
├── cli.js                        # CLI entry point (Commander.js, 479 lines)
│   └── Commands: generate, validate, theme, template, init, serve
│
├── outputs/                      # Output generation framework
│   ├── orchestrator.js           # Master orchestrator (EventEmitter, 403 lines)
│   │   └── generateAll() → Phase 1: MD → Phase 2: HTML+PDF → Phase 3: DOCX → Phase 4: ZIP
│   ├── markdown/
│   │   └── markdown-generator.js # Template engine + Mermaid builder (383 lines)
│   │       ├── substituteVariables() — {{variable}} substitution
│   │       ├── buildMermaidDiagram() — flowchart/gantt/pie/sequence
│   │       ├── buildExecutiveSummary() / buildFindingSection() — section builders
│   │       └── MarkdownGenerator class
│   ├── html/
│   │   └── html-generator.js     # HTML formatter + themes (429 lines)
│   │       ├── marked + highlight.js for MD→HTML conversion
│   │       ├── JSDOM + mermaid for SVG diagram rendering
│   │       ├── 4 built-in themes (default, dark, corporate, military)
│   │       ├── KPI widget builder, severity badges
│   │       └── Interactive features: search, collapsible sections, print CSS
│   ├── pdf/
│   │   └── pdf-generator.js      # PDF via Puppeteer (258 lines)
│   │       ├── Page presets: a4, letter, legal, a3
│   │       ├── Header/footer templates with classification
│   │       └── Bookmark outline builder from HTML headings
│   └── docx/
│       └── docx-generator.py     # DOCX via python-docx (515 lines)
│           ├── Cover page, TOC, header/footer fields
│           ├── Styled tables with color headers and alternating rows
│           └── Basic markdown-to-docx converter
│
├── skills/                       # AI agent skills (dual format)
│   ├── universal-report-engine/  # Master orchestration skill
│   ├── pentest-report/           # PTES + OSSTMM methodology
│   ├── redteam-report/
│   ├── hardening-report/
│   ├── cloud-security-report/
│   ├── ad-assessment-report/
│   ├── forensics-report/
│   ├── incident-response-report/
│   ├── compliance-report/
│   ├── threat-hunting-report/
│   └── vulnerability-assessment-report/
│       ├── SKILL.md              # Claude Code format
│       └── skill.yaml            # OpenCode format
│
├── templates/                    # Report templates
│   ├── template-config.yaml      # Master template configuration (714 lines)
│   ├── executive/                # Executive summary templates
│   ├── technical/                # Technical report templates
│   ├── finding-schema/           # Universal finding schema
│   └── dashboards/               # Dashboard templates
│
├── branding/                     # Visual identity system
│   ├── branding-config.yaml      # Master brand config (436 lines)
│   ├── themes/                   # 4 corporate themes
│   │   ├── enterprise-dark/
│   │   ├── enterprise-light/
│   │   ├── executive-blue/
│   │   └── security-ops/
│   └── components/               # Reusable components
│       ├── cover-pages/
│       ├── severity-badges/
│       ├── risk-cards/
│       ├── kpi-widgets/
│       ├── executive-tables/
│       └── mermaid-templates/
│
├── package.json                  # npm package definition
├── requirements.txt              # Python dependencies
└── .cybersecrc.yaml              # Default configuration
```

### Key Design Patterns

| Pattern | Location | Description |
|---------|----------|-------------|
| **Event Emitter** | `outputs/orchestrator.js` | Progress and error broadcasting |
| **Strategy** | `outputs/markdown/markdown-generator.js` | Diagram type builders (flowchart, gantt, pie, sequence) |
| **Pipeline** | `outputs/orchestrator.js` `generateAll()` | Sequential/parallel phase orchestration |
| **Template Method** | `outputs/html/html-generator.js` | `generate()` → `markdownToHtml()` → `renderMermaidDiagrams()` → `baseHtmlTemplate()` |
| **Subprocess Isolation** | DOCX generation | Python process for fault isolation |
| **Discovery** | `cli.js` template command | Glob-based file discovery for templates and themes |

---

## 3. How to Create a New Skill

### Step 1: Create Skill Directory

```bash
mkdir -p skills/my-report-type/
```

### Step 2: Create SKILL.md (Claude Code Format)

```markdown
---
name: my-report-type
version: 1.0.0
category: offensive  # offensive | defensive | dfir | grc
standards:
  - PTES
  - NIST SP 800-115
  - CVSS v4.0
  - MITRE ATT&CK
compatibility:
  - claude-code
  - opencode
---

# My Report Type Generator

## 1. Purpose
Brief description of what this skill generates and its target audience.

## 2. Methodology
Describe the assessment methodology and frameworks used.

## 3. Workflow
### Step 1: Intake
### Step 2: Analysis
### Step 3: Scoring
### Step 4: Report Assembly

## 4. Input Schema
```yaml
# Expected input structure
```

## 5. Output Schema
```yaml
# Generated output structure
```

## 6. Finding Schema
```yaml
# Finding field specifications
```

## 7. Quality Controls
| Rule ID | Severity | Description |
|---------|----------|-------------|
| QC-001 | CRITICAL | ... |
```

### Step 3: Create skill.yaml (OpenCode Format)

```yaml
name: my-report-type
version: 1.0.0
description: >
  Generates professional [report type] reports conforming to [standards].
tags:
  - my-tag
categories:
  - offensive-security
  - reporting
standards:
  - PTES Technical Guidelines v1.0
  - CVSS v4.0

prompt: |
  You are a Principal Security Consultant...
  [Detailed prompt with methodology, requirements, quality controls]

workflows:
  my_workflow:
    name: "My Workflow Name"
    phases:
      - phase: 1
        name: "Intake"
        steps:
          - "Step description"

expected_outputs:
  markdown:
    description: "Full report in GFM with Mermaid diagrams"
    sections:
      - "Executive Summary"
      - "Findings"
      - "Remediation Roadmap"

validation_rules:
  - rule_id: "VR-001"
    severity: "critical"
    field: "finding_id"
    description: "Finding IDs must be sequential"
    action: "Block report generation."
```

### Step 4: Add Templates (Optional)

```bash
mkdir -p templates/my-report-type/
# Create any custom templates needed
```

### Step 5: Register in Template Config

Add to `templates/template-config.yaml`:

```yaml
variables:
  engagement_type:
    enum:
      # ... existing types ...
      - "My Report Type"
```

### Step 6: Test

```bash
# Validate skill can be discovered
ls skills/my-report-type/

# Test with sample data
node cli.js generate -i test-data.yaml --template my-report-type
```

---

## 4. How to Create a New Template

### Creating a Template

```bash
# Using CLI
node cli.js template create -n my-custom

# Or manually create
mkdir -p templates/
```

### Template Example

```markdown
# {{metadata.title}}

**Classification:** {{metadata.classification}}
**Date:** {{metadata.generatedAt}}
**Version:** {{metadata.version}}

---

## Executive Summary

{{executiveSummary}}

---

## Scope & Methodology

This assessment was conducted against {{scope.targetCount}} targets
between {{scope.startDate}} and {{scope.endDate}}.

## Findings Summary

| Severity | Count |
|----------|-------|
| Critical | {{criticalCount}} |
| High | {{highCount}} |
| Medium | {{mediumCount}} |
| Low | {{lowCount}} |

## Detailed Findings

{{#each sections}}
### {{title}}

{{content}}

{{#each findings}}
#### [{{severity}}] {{title}}

**Affected Systems:** {{affectedSystems}}
**CVSS Score:** {{cvssScore}}

**Description:**
{{description}}

**Impact:**
{{impact}}

**Remediation:**
{{remediation}}
{{/each}}
{{/each}}

## Appendices

Report generated by {{metadata.author}} using CyberSec Reporting Engine.
```

### Using the Template

```bash
node cli.js generate -i findings.yaml --template my-custom
```

---

## 5. How to Create a New Theme

### Step 1: Create Theme Directory

```bash
mkdir -p branding/themes/my-theme/
```

### Step 2: Create theme.yaml

```yaml
# branding/themes/my-theme/theme.yaml
name: "My Custom Theme"
id: my-theme
version: 1.0.0
description: "Custom theme description"

colors:
  primary: "#2d3748"
  accent: "#4299e1"
  background: "#ffffff"
  surface: "#f7fafc"
  text_primary: "#1a202c"
  text_secondary: "#718096"
  border: "#e2e8f0"

  severity:
    critical: "#e53e3e"
    high: "#ed8936"
    medium: "#ecc94b"
    low: "#48bb78"
    info: "#4299e1"

typography:
  headings: "Inter, sans-serif"
  body: "Inter, sans-serif"
  code: "JetBrains Mono, monospace"

spacing:
  unit: 8
  section: "64px"
```

### Step 3: Register in Branding Config

```yaml
# branding/branding-config.yaml
themes:
  available:
    - id: my-theme
      name: "My Custom Theme"
      path: "themes/my-theme/theme.yaml"
      recommended_for:
        - custom_reports
```

### Step 4: Register in HTML Generator (if needed)

```javascript
// For programmatic registration
const htmlGen = new HtmlGenerator({
  themes: {
    'my-theme': {
      name: 'My Custom Theme',
      css: `:root { --bg: #fff; --fg: #111; ... }`
    }
  }
});
```

---

## 6. How to Add a New Output Format

### Pattern

Each output format generator follows a consistent pattern:

```javascript
// outputs/newformat/newformat-generator.js
export class NewFormatGenerator {
  constructor(opts = {}) {
    this.config = { ...DEFAULTS, ...opts };
  }

  async generate(content, opts = {}) {
    // Transform content to the new format
  }

  async generateFromFile(inputPath, outputPath, opts = {}) {
    const content = await readFile(inputPath, 'utf-8');
    const result = await this.generate(content, opts);
    await writeFile(outputPath, result);
    return { success: true, outputPath, size: result.length };
  }
}
```

### Integration Steps

1. **Create the generator module** in `outputs/<format>/<format>-generator.{js,py}`
2. **Add to orchestrator** — register a new `_generate<Format>()` method in `outputs/orchestrator.js`
3. **Add to CLI** — add the format to the `generate` command's `--formats` option
4. **Add to config** — add format-specific settings to `.cybersecrc.yaml`
5. **Add tests** — create unit and integration tests

### Orchestrator Integration Example

```javascript
// In outputs/orchestrator.js

async _generateXlsx(outputBase, opts) {
  this._reportProgress('xlsx', 0, 1, 'Generating XLSX...');
  try {
    const result = await this._xlsxGen.generateFromFile(
      opts.data,
      `${outputBase}.xlsx`,
      { /* options */ }
    );
    this._reportProgress('xlsx', 1, 1, `Written: ${result.outputPath}`);
    return result;
  } catch (err) {
    this._reportError('xlsx', err.message);
    return { path: null, error: err.message };
  }
}
```

---

## 7. Testing Guide

### Test Command

```bash
npm test
# Runs: node --experimental-vm-modules node_modules/.bin/jest
```

### Test Structure

```
tests/
├── unit/
│   ├── markdown-generator.test.js
│   ├── html-generator.test.js
│   ├── pdf-generator.test.js
│   └── orchestrator.test.js
├── integration/
│   └── full-pipeline.test.js
└── fixtures/
    ├── minimal-findings.yaml
    ├── full-findings.yaml
    └── invalid-findings.yaml
```

### Writing Tests

```javascript
// tests/unit/markdown-generator.test.js
import { MarkdownGenerator } from '../../outputs/markdown/markdown-generator.js';

describe('MarkdownGenerator', () => {
  let gen;

  beforeEach(() => {
    gen = new MarkdownGenerator();
  });

  describe('validate()', () => {
    it('should pass valid data', () => {
      const data = {
        metadata: {
          title: 'Test Report',
          generatedAt: new Date().toISOString(),
          version: '1.0.0',
        },
        sections: [
          { id: 'test', title: 'Test Section' },
        ],
      };
      const { valid, errors } = gen.validate(data);
      expect(valid).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it('should reject data missing required metadata fields', () => {
      const data = { metadata: {}, sections: [] };
      const { valid, errors } = gen.validate(data);
      expect(valid).toBe(false);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('generate()', () => {
    it('should produce markdown with title and sections', async () => {
      const data = {
        metadata: {
          title: 'Test',
          generatedAt: new Date().toISOString(),
          version: '1.0.0',
        },
        sections: [
          { id: 'section-1', title: 'Section One', findings: [] },
        ],
      };
      const md = await gen.generate(data);
      expect(md).toContain('# Test');
      expect(md).toContain('## Section One');
    });
  });
});
```

### Snapshot Testing

```javascript
it('should produce consistent HTML for known markdown', async () => {
  const htmlGen = new HtmlGenerator();
  const html = await htmlGen.generate('# Test\n\nHello world.');
  expect(html).toMatchSnapshot();
});
```

### Integration Test

```javascript
describe('Full Pipeline', () => {
  it('should generate all formats from a YAML file', async () => {
    const orch = new OutputOrchestrator({
      outputDir: './test-output',
      createPackage: false,
    });

    const result = await orch.generateAll({
      input: './tests/fixtures/minimal-findings.yaml',
      outputDir: './test-output',
      formats: ['md', 'html', 'pdf'],
    });

    expect(result.success).toBe(true);
    expect(result.files.length).toBeGreaterThanOrEqual(2);
    await orch.close();
  }, 30000); // 30s timeout for Puppeteer
});
```

---

## 8. CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'

      - name: Install dependencies
        run: |
          npm ci
          pip install -r requirements.txt

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

      - name: Smoke test
        run: |
          node cli.js --version
          node cli.js init -d /tmp/test-project
          node cli.js validate -i /tmp/test-project/findings/sample-findings.yaml
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build

test:
  stage: test
  image: node:20
  before_script:
    - apt-get update && apt-get install -y python3 python3-venv chromium-browser
    - npm ci
    - python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
  script:
    - npm run lint
    - npm test
  artifacts:
    when: always
    reports:
      junit: test-results.xml
```

---

## 9. Release Process

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.x.x): Breaking changes to API or finding schema
- **MINOR** (x.1.x): New skills, output formats, themes
- **PATCH** (x.x.1): Bug fixes, documentation updates

### Release Checklist

1. **Update version** in `package.json`
2. **Update CHANGELOG.md** with changes since last release
3. **Run full test suite:** `npm test`
4. **Run linting:** `npm run lint`
5. **Smoke test all formats:**

   ```bash
   node cli.js generate -i tests/fixtures/minimal-findings.yaml -f md,html,pdf,docx
   ```

6. **Tag the release:**

   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

7. **Create GitHub Release** with release notes
8. **Publish to npm** (if applicable): `npm publish`

### Release Notes Template

```markdown
## v1.0.0 (2026-06-01)

### Added
- New skill: cloud-security-report
- Theme: enterprise-dark

### Changed
- Upgraded marked to v12.0.2
- Improved PDF header/footer templates

### Fixed
- Mermaid rendering timeout on large diagrams
- DOCX page margin calculation

### Breaking
- Finding schema: `cvss_vector` renamed to `cvss4_vector`
```

---

## 10. Code Quality Standards

### JavaScript

| Standard | Tool | Config |
|----------|------|--------|
| Linting | ESLint | `.eslintrc.json` |
| Formatting | Prettier | `.prettierrc` |
| Testing | Jest | `jest.config.js` |
| Module type | ESM (`"type": "module"`) | `package.json` |

**Style conventions:**

- Use ES module syntax (`import`/`export`)
- Async/await over Promise chains
- JSDoc comments for public API methods
- Error propagation via thrown exceptions, not return codes
- Event emission for progress, not polling

### Python

| Standard | Tool | Config |
|----------|------|--------|
| Formatting | Black | `pyproject.toml` |
| Linting | Flake8 | `.flake8` |
| Type checking | mypy | `mypy.ini` |

**Style conventions:**

- Type hints on all function signatures
- Google-style docstrings
- 88-character line limit (Black default)
- `pathlib.Path` over `os.path`

### Documentation

- All public APIs must have JSDoc/docstring documentation
- Architecture decisions documented in `docs/architecture/`
- User-facing behavior documented in `docs/user-guide/`
- Changelog updated with each release

---

## 11. Contributing Workflow

### Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Create a branch** for your feature:

   ```bash
   git checkout -b feature/my-feature
   ```

4. **Make changes** following the code quality standards
5. **Add tests** for new functionality
6. **Run the test suite:** `npm test`
7. **Commit** with a descriptive message:

   ```bash
   git commit -m "feat: add CSV output format

   - Adds CsvGenerator in outputs/csv/
   - Integrates with orchestrator and CLI
   - Includes unit and integration tests"
   ```

8. **Push** and create a Pull Request

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting, linting |
| `refactor` | Code restructuring |
| `test` | Adding/updating tests |
| `chore` | Build process, dependencies |

### Pull Request Requirements

- [ ] Tests pass: `npm test`
- [ ] Linting passes: `npm run lint`
- [ ] New features include tests
- [ ] Documentation updated for user-facing changes
- [ ] CHANGELOG.md entry added
- [ ] PR describes what and why, not just how

### Code Review Guidelines

- Review for correctness, security, and performance
- Check adherence to code quality standards
- Verify test coverage for new code paths
- Ensure documentation is accurate and complete
- Look for backwards compatibility issues

### Getting Help

- **Issues:** GitHub Issues for bugs and feature requests
- **Discussions:** GitHub Discussions for questions and ideas
- **Security:** See `SECURITY.md` for vulnerability reporting
