# CyberSec Reporting Engine — User Guide

> **Version:** 1.0.0 · **Last Updated:** 2026-06-01

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Using with Claude Code](#2-using-with-claude-code)
3. [Using with OpenCode](#3-using-with-opencode)
4. [Using with Cursor / Windsurf](#4-using-with-cursor--windsurf)
5. [CLI Usage](#5-cli-usage)
6. [Report Configuration](#6-report-configuration)
7. [Customizing Themes](#7-customizing-themes)
8. [Adding Custom Templates](#8-adding-custom-templates)
9. [Working with Findings](#9-working-with-findings)
10. [Best Practices for Report Quality](#10-best-practices-for-report-quality)
11. [Troubleshooting Common Issues](#11-troubleshooting-common-issues)
12. [FAQ](#12-faq)

---

## 1. Getting Started

### Prerequisites

| Requirement | Minimum Version | Purpose |
|-------------|----------------|---------|
| **Node.js** | 18.0+ | Markdown, HTML, PDF generation |
| **Python** | 3.10+ | DOCX generation |
| **npm** | 9.0+ | Package management |
| **Git** | Any | Repository clone |

### Installation

```bash
# Clone the repository
git clone https://github.com/ArdaTX/Cybersec-Reporting-Engine.git
cd cybersec-reporting-engine

# Install Node.js dependencies
# Use PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true if Chromium download fails
npm install
# Or: PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install

# Install Python dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Verify installation
npm test

# Quick smoke test
node cli.js --version
```

### Your First Report (30 seconds)

```bash
# 1. Initialize a project
node cli.js init -d my-assessment

# 2. Generate sample report
cd my-assessment
node ../cli.js generate -i findings/sample-findings.yaml

# 3. View results
ls output/
# output/report.md   output/report.html   output/report.pdf
```

### Project Directory Structure After `init`

```
my-assessment/
├── .cybersecrc.yaml      # Your configuration
├── findings/             # Place your findings here
│   └── sample-findings.yaml
├── templates/            # Custom templates (optional)
├── output/               # Generated reports
└── branding/             # Custom themes (optional)
```

---

## 2. Using with Claude Code

Claude Code has native integration with the CyberSec Reporting Engine through `SKILL.md` files.

### Loading a Skill

In any Claude Code session within the project:

```
> Load the pentest-report skill and generate a report from my findings
```

Or explicitly:

```
> Reference the skill at skills/pentest-report/SKILL.md
```

### Workflow

1. **Load the skill:** Claude Code reads the `SKILL.md` frontmatter and instructions
2. **Collect findings:** Claude follows the workflow steps to gather or validate your findings
3. **Structure data:** Claude outputs findings in the structured JSON/YAML format
4. **Generate report:** Run `node cli.js generate -i findings.yaml` to produce deliverables

### Example Session

```
User: I have penetration test results. Generate a professional report.

Claude: I'll use the pentest-report skill. Please provide:
  - Scope document / rules of engagement
  - Nmap scan results
  - Vulnerability scanner output
  - Manual testing notes

User: [provides data]

Claude: [Processes data per PTES methodology, validates against finding schema,
        outputs structured findings.yaml]

User: Now generate the report.

Claude: Run: node cli.js generate -i findings.yaml --theme enterprise-dark

        Generated:
          output/report.md    (124 KB)
          output/report.html  (256 KB)
          output/report.pdf   (1.8 MB)
```

### Quality Controls

Claude Code automatically applies quality controls defined in each skill:

- Every Critical/High finding must have evidence
- Every finding must have a valid CVSS v4.0 vector
- Executive summary must be jargon-free
- Finding IDs must be sequential

---

## 3. Using with OpenCode

OpenCode loads skills via `skill.yaml` files.

### Registration

Skills are auto-discovered from `skills/*/skill.yaml` when the OpenCode agent is configured with the `cybersec_reporting_engine` MCP server or directly in the agent's workspace.

### Usage

```
> Load skill pentest-report
> Generate a penetration test report from findings in ./data/
```

### OpenCode-Specific Features

OpenCode skills include structured workflow definitions:

```yaml
workflows:
  external_network_penetration_test:
    phases:
      - phase: 1
        name: "Intake & Scoping"
        steps:
          - "Collect scope document and rules of engagement"
          - "Validate written authorization from asset owner"
```

OpenCode agents execute these workflows step-by-step, collecting data at each phase before proceeding to report generation.

### Dual Format Support

Each skill provides both formats:

| Format | File | Agent |
|--------|------|-------|
| `SKILL.md` | Claude Code native | Claude Code |
| `skill.yaml` | Structured YAML | OpenCode |

---

## 4. Using with Other AI Agents

### Codex

See `docs/agents/codex.md` for detailed Codex integration.

### Generic AI Agent Setup

For any AI coding agent with file access:

1. Point the agent to the `skills/` directory
2. The agent reads the appropriate `SKILL.md` or `skill.yaml`
3. The agent follows the workflow to produce structured findings
4. You run the CLI to generate formatted output

```bash
node cli.js generate -i findings.yaml --theme enterprise-dark
```

---

## 5. CLI Usage

### Command Reference

```
cybersec-report [command] [options]

Commands:
  generate     Generate report from findings data
  validate     Validate findings against schema
  theme        List available themes or preview a theme
  template     Manage report templates
  init         Initialize a new project directory
  serve        Start a local report viewer server
  help         Display help for command
```

### `generate` — Generate a Report

```bash
# Basic usage
node cli.js generate -i findings/sample-findings.yaml

# Specify output formats
node cli.js generate -i findings.yaml -f md,html,pdf,docx

# Specify output directory and name
node cli.js generate -i findings.yaml -o ./reports -n acme-pentest

# Apply a theme
node cli.js generate -i findings.yaml -t enterprise-dark

# Set classification
node cli.js generate -i findings.yaml -c "TOP SECRET"

# Skip ZIP package
node cli.js generate -i findings.yaml --no-package

# Full example
node cli.js generate \
  --input findings/acme-pentest.yaml \
  --output ./deliverables/ \
  --name ACME-Q1-2026-Pentest \
  --formats md,html,pdf,docx \
  --theme executive-blue \
  --classification CONFIDENTIAL \
  --template technical
```

### `validate` — Validate Findings

```bash
# Validate against schema
node cli.js validate -i findings/sample-findings.yaml

# Output:
# Validation: PASSED
#   Sections: 2
#   Findings: 2

# Example failure:
# Validation: FAILED
#   3 error(s):
#     - metadata.title: requires property "title"
#     - sections[0].id: requires property "id"
```

### `theme` — Theme Management

```bash
# List all themes
node cli.js theme list

# Output:
# Available themes:
#   default          Default Professional
#   dark             Dark Mode
#   corporate        Corporate
#   military         Military / Government

# Preview a theme (generates theme-preview.html)
node cli.js theme preview -t enterprise-dark
```

### `template` — Template Management

```bash
# List templates
node cli.js template list

# Create a new template
node cli.js template create -n my-custom-template
```

### `init` — Initialize a Project

```bash
# Initialize in current directory
node cli.js init

# Initialize in specific directory
node cli.js init -d ./acme-engagement

# Output:
# Project initialized in: ./acme-engagement
#   findings/          - Place your findings YAML/JSON files here
#   output/            - Generated reports will appear here
#   templates/         - Custom markdown templates
#   .cybersecrc.yaml   - Configuration file
#
# Next steps:
#   cybersec-report generate -i findings/sample-findings.yaml
```

### `serve` — Local Report Viewer

```bash
# Start viewer on default port 3000
node cli.js serve

# Start on custom port and directory
node cli.js serve -p 8080 -d ./deliverables

# Output:
# Report viewer running at http://localhost:3000
# Serving files from: ./output
# Press Ctrl+C to stop.
```

The viewer provides a directory listing of all generated reports. Click any HTML file to view in-browser. All generated files (MD, HTML, PDF, DOCX) are served.

---

## 6. Report Configuration

### `.cybersecrc.yaml` Reference

Place this file in your project root to override defaults:

```yaml
# Metadata injected into all reports
metadata:
  author: "ACME Security Consulting"
  classification: "CONFIDENTIAL"
  # Options: UNCLASSIFIED, CONFIDENTIAL, SECRET, TOP SECRET
  # Or TLP: CLEAR, GREEN, AMBER, RED

# Output settings
output:
  formats: [md, html, pdf]      # also: docx
  directory: "./output"
  createPackage: true            # ZIP all generated files
  theme: default                 # HTML theme
  pageSize: a4                   # a4, letter, legal, a3
  landscape: false
  margin: "20mm"

# Markdown settings
markdown:
  templateDir: "./templates"     # Custom template directory

# HTML settings
html:
  theme: default
  interactive: true              # Search, collapsible sections
  showKpiWidgets: true           # Executive KPI cards

# PDF settings
pdf:
  pageSize: a4
  landscape: false
  displayHeaderFooter: true
  outline: true                  # PDF bookmarks from headings

# DOCX settings
docx:
  fontBody: "Calibri"
  fontHeading: "Calibri Light"
  pageMarginCm: 2.54
  coverPage: true
  tableOfContents: true

# Python path for DOCX
pythonPath: "python3"

# Severity colors
severity:
  critical: { label: "CRITICAL", color: "#DC2626", priority: 1 }
  high:     { label: "HIGH", color: "#EA580C", priority: 2 }
  medium:   { label: "MEDIUM", color: "#CA8A04", priority: 3 }
  low:      { label: "LOW", color: "#16A34A", priority: 4 }
  info:     { label: "INFO", color: "#2563EB", priority: 5 }

# Template variables
variables:
  companyName: "ACME Security"
  reportType: "Security Assessment"
```

---

## 7. Customizing Themes

### Available Built-In Themes

| Theme | ID | Palette | Best For |
|-------|----|---------|----------|
| Default Professional | `default` | White/Blue/Gray | General use |
| Dark Mode | `dark` | Dark Navy/Slate | Low-light environments |
| Corporate | `corporate` | White/Navy | Formal client deliverables |
| Military | `military` | Olive/Green | Government/Defense |

### Creating a Custom Theme

1. Create a CSS variables file in your project:

```css
/* my-theme.css */
:root {
  --bg: #ffffff;
  --fg: #1a1a1a;
  --accent: #6366f1;
  --muted: #6b7280;
  --border: #e5e7eb;
  --surface: #f9fafb;
  --critical: #ef4444;
  --high: #f97316;
  --medium: #eab308;
  --low: #22c55e;
  --info: #3b82f6;
  --font: 'Inter', sans-serif;
  --mono: 'JetBrains Mono', monospace;
}
```

2. Register in your project's branding config or pass via the HTML generator API.

### Theme Preview

Use the `theme preview` command to quickly test a theme:

```bash
node cli.js theme preview -t dark
# Opens: theme-preview.html (contains sample findings with severity badges)
```

---

## 8. Adding Custom Templates

### Template Structure

Templates use `{{variable}}` substitution syntax:

```markdown
# {{metadata.title}}

**Classification:** {{metadata.classification}}
**Generated:** {{metadata.generatedAt}}
**Version:** {{metadata.version}}

## Executive Summary

{{executiveSummary}}

## Findings

{{#each sections}}
### {{title}}

{{content}}

{{#each findings}}
#### {{title}}

**Severity:** {{severity}}
**CVE:** {{cve}}
**CVSS Score:** {{cvssScore}}
**Affected Systems:** {{affectedSystems}}

##### Description
{{description}}

##### Impact
{{impact}}

##### Remediation
{{remediation}}

---
{{/each}}
{{/each}}
```

### Creating a Custom Template

```bash
# Method 1: CLI
node cli.js template create -n my-template

# Method 2: Manual
mkdir -p templates/
cp outputs/markdown/templates/default.md templates/my-template.md
# Edit my-template.md
```

### Using a Custom Template

```bash
node cli.js generate -i findings.yaml --template my-template
```

Templates in your project's `./templates/` directory take precedence over built-in templates.

---

## 9. Working with Findings

### Structured Findings (YAML)

Recommended format for all report types:

```yaml
metadata:
  title: "ACME Corp External Penetration Test"
  author: "Security Assessment Team"
  classification: "CONFIDENTIAL"
  generatedAt: "2026-06-01T12:00:00Z"
  version: "1.0.0"
  tags: [pentest, external, acme]

executiveSummary: >
  During this engagement, the testing team identified 3 critical
  vulnerabilities enabling full compromise of the external perimeter...

sections:
  - id: webapp-findings
    title: "Web Application Findings"
    content: "This section covers vulnerabilities discovered in the web application..."
    severity: critical
    findings:
      - title: "SQL Injection in Login Endpoint"
        severity: critical
        cve: "CVE-2024-0001"
        cvssScore: 9.8
        affectedSystems: "app.example.com"
        description: "The login endpoint is vulnerable to SQL injection..."
        impact: "Complete database compromise and PII exposure of 2.3M users."
        remediation: "Implement parameterized queries. See OWASP SQLi Prevention Cheat Sheet."
        references: "https://cwe.mitre.org/data/definitions/89.html"

      - title: "Stored XSS in User Profile"
        severity: high
        cve: ""
        cvssScore: 7.2
        affectedSystems: "app.example.com"
        description: "The user profile bio field does not sanitize input..."
        impact: "Session hijacking and credential theft."
        remediation: "Implement output encoding and Content-Security-Policy headers."
        references: "https://cheatsheetseries.owasp.org/cheatsheets/XSS_Prevention_Cheat_Sheet.html"

    tables:
      - title: "Port Scan Summary"
        headers: [Port, Service, Version, Risk]
        rows:
          - [22, SSH, "OpenSSH 7.4", High]
          - [443, HTTPS, "nginx 1.18.0", Medium]

    diagrams:
      - type: pie
        title: "Finding Severity Distribution"
        slices:
          - { label: Critical, value: 3 }
          - { label: High, value: 7 }
          - { label: Medium, value: 12 }
          - { label: Low, value: 4 }
```

### Finding Field Reference

| Field | Required | Type | Example |
|-------|----------|------|---------|
| `title` | Yes | String | "SQL Injection in Login Endpoint" |
| `severity` | Yes | Enum | critical, high, medium, low, info |
| `cve` | No | String | "CVE-2024-0001" |
| `cvssScore` | No | Number | 9.8 |
| `affectedSystems` | Yes | String | "app.example.com" |
| `description` | Yes | String | 100-2000 chars |
| `impact` | Yes | String | Business/technical impact description |
| `remediation` | Yes | String | Specific remediation steps |
| `references` | No | String | URLs to authoritative references |

### Section Options

Each section can include:

- **`content`** — Free-text Markdown rendered before findings
- **`findings`** — Array of structured finding objects
- **`tables`** — Array of table objects with `title`, `headers`, `rows`
- **`diagrams`** — Array of Mermaid diagram definitions

### Mermaid Diagram Types

```yaml
# Pie chart
diagrams:
  - type: pie
    title: "Risk Distribution"
    slices:
      - { label: Critical, value: 3 }
      - { label: High, value: 7 }

# Flowchart
  - type: flowchart
    direction: "LR"
    nodes:
      - { id: A, label: "External Recon", shape: rect }
      - { id: B, label: "Exploitation", shape: diamond }
    edges:
      - { from: A, to: B, label: "T1595" }

# Gantt chart
  - type: gantt
    title: "Remediation Timeline"
    dateFormat: "YYYY-MM-DD"
    sections:
      - name: "Critical Fixes"
        tasks:
          - { name: "SQLi Fix", status: "crit", start: "2026-06-01", duration: "3d" }

# Sequence diagram
  - type: sequence
    participants:
      - { id: Attacker, label: "Attacker" }
      - { id: Server, label: "Web Server" }
    messages:
      - { from: Attacker, to: Server, text: "SQL Injection", type: solid }
```

---

## 10. Best Practices for Report Quality

### Finding Quality

1. **Be specific in titles.** Use the pattern: "Vulnerability Type in Component Leading to Impact"
   - Good: "SQL Injection in Login Endpoint Enables Authentication Bypass"
   - Bad: "Login page is vulnerable"

2. **Provide concrete reproduction steps.** Include exact commands, URLs, and payloads.
   - Good: `curl -X POST https://app.example.com/login -d "user=admin' OR '1'='1"`
   - Bad: "Send a malicious request to bypass authentication"

3. **Include business impact.** Translate technical findings to business consequences.
   - Good: "Exposure of 2.3M customer PII records with estimated breach cost of $4.2M"
   - Bad: "Database can be accessed"

4. **Give actionable remediation.** Reference specific configuration changes, code fixes, or KB articles.

### Executive Summary Quality

- **Zero technical jargon** — No "SQL injection," "XSS," "RCE," "CVE," "CVSS"
- **Business-impact language** — "Unauthorized access to customer data," "Ability to impersonate any user"
- **Top 3-5 strategic recommendations** — Each one sentence, actionable at the organizational level
- **Overall risk statement** — "The testing team demonstrated the ability to compromise [crown jewel] within [timeframe]"

### Report Structure

1. Start with the executive summary (1-2 pages)
2. Follow with methodology (transparent about what was tested and how)
3. Present findings in severity order (Critical → High → Medium → Low → Info)
4. End with a remediation roadmap (prioritized, with timelines)

---

## 11. Troubleshooting Common Issues

### Installation Issues

| Problem | Solution |
|---------|----------|
| `npm install` fails | Ensure Node.js >= 18.0.0: `node --version` |
| Puppeteer download fails | Set `PUPPETEER_SKIP_DOWNLOAD=true` and use system Chromium |
| `python3` not found | Install Python 3.10+: `sudo apt install python3 python3-venv` |
| `pip install` fails | Create virtualenv first: `python3 -m venv .venv && source .venv/bin/activate` |

### Generation Issues

| Problem | Solution |
|---------|----------|
| "Validation failed" | Check findings against schema: `node cli.js validate -i findings.yaml` |
| PDF generation hangs | Puppeteer may need `--no-sandbox` in containers; check `.cybersecrc.yaml` |
| DOCX generation fails | Ensure `python3` is in PATH and `pip install -r requirements.txt` ran |
| Mermaid diagrams not rendering | Ensure `mermaid` npm package installed; check diagram syntax |
| ZIP package not created | Verify `--no-package` flag not set; check disk space |

### Theme Issues

| Problem | Solution |
|---------|----------|
| Theme not applying | Check theme ID matches: `node cli.js theme list` |
| Custom theme not found | Place CSS in correct path; verify variable names match theme spec |
| Print layout broken | Verify `@media print` styles; use `node cli.js theme preview` to test |

### Puppeteer Troubleshooting

PDF generation depends on Puppeteer, which downloads Chromium (~170 MB) during `npm install`. If this fails or is undesirable, use the `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` environment variable.

#### When to Skip Chromium Download

| Scenario | Action |
|----------|--------|
| System Chromium already installed | Set `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` |
| Container/CI environment (Docker, GitHub Actions) | Set `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` and provide system Chromium |
| Network restrictions / proxy issues | Set `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`, install Chromium manually |
| Limited disk space | Set `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`, use system Chromium |
| Offline installation | Pre-download Chromium or use system package manager |

#### Why It Works

Puppeteer can use either its bundled Chromium or an existing system installation. The `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` flag tells npm to skip the automatic Chromium download. Puppeteer then uses the Chromium found at `PUPPETEER_EXECUTABLE_PATH` (or auto-detects it on the system PATH). The engine is configured to detect system Chromium automatically when the bundled version is not available.

#### Standard Installation

```bash
npm install
# Puppeteer downloads Chromium automatically (~170 MB)
```

#### Installation Without Bundled Chromium

```bash
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install
```

After this, you need to provide Chromium via one of the methods below.

#### Installing Chromium Manually

**Linux (Debian/Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install -y chromium-browser chromium-codecs-ffmpeg
# Additional Puppeteer system dependencies
sudo apt-get install -y \
  libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
  libxdamage1 libxfixes3 libxrandr2 libgbm1 \
  libpango-1.0-0 libcairo2 libasound2 fonts-liberation
```

**Linux (RHEL/Fedora):**
```bash
sudo dnf install -y chromium nss alsa-lib atk cups-libs \
  gtk3 libXcomposite libXcursor libXdamage libXext \
  libXi libXrandr libXScrnSaver pango
```

**macOS:**
```bash
brew install --cask chromium
# Or use Google Chrome
```

**Windows (PowerShell as Administrator):**
```powershell
# Using Chocolatey
choco install chromium

# Or download manually from https://www.chromium.org/getting-involved/download-chromium
# Then set the path:
$env:PUPPETEER_EXECUTABLE_PATH = "C:\Path\To\chrome.exe"
```

**Windows (WSL):**
```bash
# Follow the Linux (Debian/Ubuntu) instructions above
sudo apt-get update && sudo apt-get install -y chromium-browser
```

#### Setting the Chromium Path

If Chromium is not on the default system PATH, set the executable path:

```bash
# Linux/macOS
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
export PUPPETEER_SKIP_DOWNLOAD=true
node cli.js generate -i findings.yaml

# Windows PowerShell
$env:PUPPETEER_EXECUTABLE_PATH = "C:\Program Files\Chromium\Application\chrome.exe"
$env:PUPPETEER_SKIP_DOWNLOAD = "true"
node cli.js generate -i findings.yaml

# Windows CMD
set PUPPETEER_EXECUTABLE_PATH=C:\Program Files\Chromium\Application\chrome.exe
set PUPPETEER_SKIP_DOWNLOAD=true
node cli.js generate -i findings.yaml
```

Or persist it in `.env` file (see `.env.example`):

```bash
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
PUPPETEER_SKIP_DOWNLOAD=true
```

#### Verifying Chromium Works with Puppeteer

```bash
node -e "const p = require('puppeteer'); (async () => { const b = await p.launch(); console.log('Chromium OK:', await b.version()); await b.close(); })()"
```

If this command prints a Chromium version, PDF generation is ready to use.

#### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Failed to launch the browser process` | Missing system dependencies | Install dependencies listed above for your OS |
| `Could not find Chromium` | `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` without providing Chromium | Install Chromium manually or set `PUPPETEER_EXECUTABLE_PATH` |
| `ERR_CONNECTION_REFUSED` when generating PDF | Chromium sandbox incompatibility | Use `--no-sandbox` flag (already configured in engine for containers) |
| `libnss3.so not found` | Missing NSS library | `sudo apt-get install libnss3` (Linux) |
| Timeout during PDF generation | Large reports with many diagrams | Increase timeout in `.cybersecrc.yaml` or split findings into smaller files |

---

## 12. FAQ

### General

**Q: What report types can I generate?**
A: The engine supports 15+ assessment types: pentesting, red teaming, vulnerability assessment, hardening, cloud security, Active Directory assessment, forensics, incident response, compliance, threat hunting, and the universal report engine for custom types.

**Q: Can I use this without an AI agent?**
A: Yes. Structure your findings in YAML/JSON format and use the CLI directly: `node cli.js generate -i findings.yaml`.

**Q: What output formats are supported?**
A: Markdown (`.md`), HTML (`.html`), PDF (`.pdf`), and DOCX (`.docx`). All four can be generated from a single findings file.

**Q: Is this suitable for enterprise use?**
A: Yes. The engine enforces classification markings, supports multi-level themes, provides audit trails, and generates production-ready deliverables meeting PTES, NIST, and OWASP standards.

### Technical

**Q: Why does DOCX generation use Python?**
A: Python's `python-docx` library provides superior Word document fidelity compared to Node.js alternatives. The subprocess architecture isolates any Python-specific issues from the main pipeline.

**Q: Can I run this in a CI/CD pipeline?**
A: Yes. See the Deployment Guide for GitHub Actions and GitLab CI configurations.

**Q: How large can my findings file be?**
A: The engine has been tested with files containing 500+ findings across 20+ sections. Memory usage scales linearly with finding count.

**Q: Can I use custom fonts in PDF/DOCX output?**
A: Yes. Configure fonts in `.cybersecrc.yaml` for DOCX. For PDF, fonts are inherited from the HTML theme CSS.

### Customization

**Q: How do I create a new report type?**
A: Copy an existing skill directory (e.g., `skills/pentest-report/`) to a new name, modify the `SKILL.md` and `skill.yaml` files, and add any custom templates.

**Q: Can I change the finding schema?**
A: The universal finding schema is defined in `templates/finding-schema/finding-schema.yaml`. You can extend it with additional fields; the validation schema in `markdown-generator.js` checks required fields.

**Q: How do I add my company's branding?**
A: Create a custom theme in `branding/themes/` with your colors and fonts, then reference it via `--theme my-theme`.

### AI Agents

**Q: Which AI agent works best?**
A: Claude Code and OpenCode have native integration through `SKILL.md` and `skill.yaml` respectively. Both provide full workflow guidance, quality control validation, and structured output generation.

**Q: Can the AI agent generate the entire report autonomously?**
A: The AI agent handles content generation (findings, descriptions, recommendations). You run the CLI to produce formatted output files (PDF, DOCX, HTML). This separation ensures deterministic, repeatable formatting while leveraging AI for content quality.

**Q: Do I need an internet connection?**
A: Not for report generation. The engine runs fully offline. AI agents may need internet access for their own operation, but the report engine itself does not.

---

## Appendix: Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│  CyberSec Reporting Engine — Quick Reference                │
├─────────────────────────────────────────────────────────────┤
│  init        node cli.js init -d <project>                  │
│  generate    node cli.js generate -i <findings.yaml>        │
│  validate    node cli.js validate -i <findings.yaml>        │
│  theme list  node cli.js theme list                         │
│  theme prev  node cli.js theme preview -t <theme>           │
│  tpl list    node cli.js template list                      │
│  tpl create  node cli.js template create -n <name>          │
│  serve       node cli.js serve -p <port>                    │
├─────────────────────────────────────────────────────────────┤
│  Formats     md, html, pdf, docx                            │
│  Themes      default, dark, corporate, military             │
│  Pages       a4, letter, legal, a3                          │
│  Class       UNCLASSIFIED, CONFIDENTIAL, SECRET, TOP SECRET │
│  TLP         CLEAR, GREEN, AMBER, RED                       │
└─────────────────────────────────────────────────────────────┘
```
