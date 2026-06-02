# CyberSec Reporting Engine — Quick Start

> Generate professional cybersecurity reports in 5 minutes.

## Prerequisites

- **Node.js 18+** — `node --version`
- **Python 3.10+** (optional, for DOCX) — `python3 --version`
- **Git**

## Install

### Linux / macOS

```bash
# Clone the repository
git clone https://github.com/ArdaTX/Cybersec-Reporting-Engine.git
cd cybersec-reporting-engine

# Run the installer
chmod +x install.sh
./install.sh
```

### Windows PowerShell

```powershell
# Clone the repository
git clone https://github.com/ArdaTX/Cybersec-Reporting-Engine.git
cd cybersec-reporting-engine

# Run the installer
.\install.ps1
```

### Windows WSL

```bash
# Follow the Linux instructions above
git clone https://github.com/ArdaTX/Cybersec-Reporting-Engine.git
cd cybersec-reporting-engine
chmod +x install.sh
./install.sh
```

> **Puppeteer / Chromium note:** If `npm install` fails during Chromium download, set the environment variable `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` before running. See the full [Puppeteer Troubleshooting](docs/user-guide/user-guide.md#puppeteer-troubleshooting) guide for details.

## Your First Report (30 seconds)

```bash
# 1. Create a project
node cli.js init -d my-report
cd my-report

# 2. Generate a report from the sample findings
node ../cli.js generate -i findings/sample-findings.yaml

# 3. View the results
ls output/
# → output/sample-findings.md    (Markdown)
# → output/sample-findings.html  (Interactive HTML)
# → output/sample-findings.pdf   (Print-ready PDF)
```

## Using with an AI Agent

### Claude Code
```
> Load the pentest-report skill and generate a report from ./findings/
```

### OpenCode
```
> Load skill pentest-report
> Generate a penetration test report from findings in ./data/
```

## CLI Cheat Sheet

```bash
# Generate a report
node cli.js generate -i findings.yaml -f md,html,pdf,docx

# Validate findings
node cli.js validate -i findings.yaml

# List themes
node cli.js theme list

# Preview a theme
node cli.js theme preview -t dark

# Create a custom template
node cli.js template create -n my-template

# Start report viewer
node cli.js serve -p 3000
```

## Findings Format (Minimal)

```yaml
# findings.yaml
metadata:
  title: "Security Assessment"
  generatedAt: "2026-06-01T12:00:00Z"
  version: "1.0.0"

sections:
  - id: findings
    title: "Findings"
    findings:
      - title: "SQL Injection in Login"
        severity: critical
        cvssScore: 9.8
        affectedSystems: "app.example.com"
        description: "The login endpoint is vulnerable to SQL injection..."
        impact: "Complete database compromise."
        remediation: "Implement parameterized queries."
```

## Supported Report Types (15+)

| Category | Skills |
|----------|--------|
| **Offensive** | Pentest, Red Team, Vulnerability Assessment, AD Assessment, Cloud Security |
| **Defensive** | Hardening, Threat Hunting, Detection Engineering |
| **DFIR** | Forensics, Incident Response, Malware Analysis |
| **GRC** | Compliance Assessment, Gap Analysis |

## Output Formats

| Format | Extension | Technology |
|--------|-----------|-----------|
| Markdown | `.md` | Native (version-controlled) |
| HTML | `.html` | Interactive dashboards + KPI widgets |
| PDF | `.pdf` | Puppeteer (print-ready) |
| DOCX | `.docx` | python-docx (Microsoft Word) |

## Next Steps

- **User Guide:** `docs/user-guide/user-guide.md`
- **API Reference:** `docs/api/api-reference.md`
- **Architecture:** `docs/architecture/architecture.md`
- **Deployment:** `docs/deployment/deployment.md`

## Support

- Issues: [GitHub Issues](https://github.com/ArdaTX/Cybersec-Reporting-Engine/issues)
- License: Apache 2.0
