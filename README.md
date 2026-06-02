# CyberSec Reporting Engine

> **Enterprise-Grade Cybersecurity Reporting Platform** — Automated report generation for pentesting, red teaming, DFIR, compliance, and security auditing.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](CHANGELOG.md)
[![Standards](https://img.shields.io/badge/standards-OWASP%20%7C%20NIST%20%7C%20MITRE%20%7C%20ISO-orange.svg)](#mandatory-standards)

---

## Overview

**CyberSec Reporting Engine** is an open-source platform that generates professional cybersecurity reports with quality equivalent to those produced by Deloitte, Mandiant, CrowdStrike, and other industry leaders. Built for security consultants, MSSPs, Red/Blue Teams, SOCs, and audit firms.

### Why This Exists

Security professionals spend 30-50% of their time writing reports. This platform automates the entire reporting lifecycle — from raw findings to executive-ready deliverables — while maintaining the quality, consistency, and methodological rigor expected by enterprise clients.

---

## Platform Capabilities

### Assessment Types (15+)

| Category | Assessment Type |
|----------|----------------|
| **Offensive Security** | Pentesting, Web App, API, Mobile, Infrastructure, Active Directory, External Attack Surface, Cloud, Vulnerability Assessment, Red Team, Purple Team |
| **Defensive Security** | Hardening, Security Architecture Review, Threat Hunting, Detection Engineering, SOC Maturity, Security Monitoring |
| **DFIR** | Digital Forensics, Incident Response, Malware Analysis, Compromise Assessment, Breach Investigation |
| **GRC** | Compliance Assessment, Security Gap Analysis, Regulatory Review |

### Output Formats

- **Markdown** — Native format for version control and CI/CD integration
- **HTML** — Interactive reports with executive dashboards
- **DOCX** — Microsoft Word for client delivery
- **PDF** — Print-ready with corporate branding

### Enterprise Features

- Executive dashboards with KPI tracking
- Risk heatmaps and matrices (Mermaid-native)
- CVSS v4.0 scoring integration
- MITRE ATT&CK technique mapping
- Multi-theme corporate branding
- Automated remediation roadmaps
- Finding-to-standard cross-referencing

---

## Mandatory Standards Integration

<table>
<tr><th>Domain</th><th>Standards</th></tr>
<tr><td><strong>Security Testing</strong></td><td>OWASP Testing Guide, OWASP ASVS, OWASP Top 10, PTES, OSSTMM, NIST SP 800-115</td></tr>
<tr><td><strong>Security Controls</strong></td><td>CIS Controls v8, CIS Benchmarks, NIST 800-53, NIST CSF 2.0, ISO 27001, ISO 27002</td></tr>
<tr><td><strong>Threat Intelligence</strong></td><td>MITRE ATT&CK, MITRE D3FEND, Cyber Kill Chain, CAPEC, CWE</td></tr>
<tr><td><strong>Risk Assessment</strong></td><td>CVSS v4.0, FAIR, NIST Risk Management Framework</td></tr>
<tr><td><strong>DFIR</strong></td><td>NIST 800-61, NIST 800-86, SANS DFIR Methodology</td></tr>
</table>

---

## AI Agent Compatibility

Officially supported with dedicated skill files and workflows.

| Agent | Support | Integration |
|-------|---------|-------------|
| **Claude Code** | Native | `SKILL.md` per skill |
| **OpenCode** | Native | `skill.yaml` per skill |
| **Codex** | Native | `docs/agents/codex.md` |

Any AI coding agent with file access can use this project generically by reading the `skills/` directory and running the CLI directly.

---

## Quick Start

### Prerequisites

- Any AI coding agent (Claude Code, OpenCode, Codex, etc.)
- Git
- Markdown editor (VS Code recommended)
- Node.js 18+ (for HTML/PDF generation)
- Python 3.10+ (for DOCX generation)

### Installation

#### Linux / macOS

```bash
# Clone the repository
git clone https://github.com/ArdaTX/Cybersec-Reporting-Engine.git
cd cybersec-reporting-engine

# Option A: Using the installer script
chmod +x install.sh
./install.sh

# Option B: Manual installation
npm install                    # HTML/PDF generation (use PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true if Chromium download fails)
pip install -r requirements.txt  # DOCX generation

# (Optional) Register the CLI globally
npm link

# Verify installation
cybersec-report --version
```

#### Windows PowerShell

```powershell
# Clone the repository
git clone https://github.com/ArdaTX/Cybersec-Reporting-Engine.git
cd cybersec-reporting-engine

# Run the PowerShell installer
.\install.ps1

# Or manual installation:
npm install
pip install -r requirements.txt
npm link

# Verify installation
cybersec-report --version
```

> **Note:** If `npm install` fails during Chromium download, use:
> ```powershell
> $env:PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = "true"
> npm install
> ```

#### Windows WSL

Follow the Linux instructions above. Chromium dependencies are automatically handled by the installer:

```bash
sudo apt-get update && sudo apt-get install -y chromium-browser
./install.sh
```

### Development Container

A `Dockerfile.dev` and DevContainer configuration are provided for a reproducible environment:

```bash
# Using Docker directly
docker build -t cybersec-reporting-engine-dev -f Dockerfile.dev .
docker run -it --rm -v $(pwd):/workspace cybersec-reporting-engine-dev bash
# Inside: cybersec-report generate ...

# Or use the DevContainer (VS Code / GitHub Codespaces / Claude Code / OpenCode / Codex)
# The .devcontainer/devcontainer.json configures everything automatically.
```

The dev container includes:
- Node.js 20 LTS, npm, Git, Python 3, Chromium
- All Puppeteer system dependencies pre-installed
- Ready for: `npm install && npm link && cybersec-report generate ...`

### Basic Usage

```bash
# Generate a pentest report from findings
node cli.js generate \
  --type pentest \
  --findings ./my-findings/ \
  --template enterprise \
  --output ./reports/

# Generate with AI agent
# In Claude Code / OpenCode / Codex:
#   "Load the pentest-report skill and generate a report from findings in ./data/"
```

---

## Repository Structure

```
cybersec-reporting-engine/
├── README.md                    # This file
├── LICENSE                      # Apache 2.0
├── CHANGELOG.md                 # Version history
├── CONTRIBUTING.md              # Contribution guide
├── SECURITY.md                  # Security policy
│
├── Dockerfile.dev               # Reproducible dev environment
├── install.sh                   # Linux/macOS installer
├── install.ps1                  # Windows PowerShell installer
│
├── .devcontainer/               # VS Code / Codespaces / AI agent dev container
│   └── devcontainer.json
│
├── docs/                        # Documentation
│   ├── agents/                  # AI agent integration guides
│   │   └── codex.md             # Codex integration
│   ├── architecture/            # System architecture
│   ├── user-guide/              # User documentation
│   ├── api/                     # API reference
│   ├── development/             # Developer docs
│   └── deployment/              # Deployment guides
│
├── branding/                    # Visual identity system
│   ├── themes/                  # 4 corporate themes
│   └── components/              # Reusable design components
│
├── examples/                    # Example reports by type
│   ├── pentest/
│   ├── redteam/
│   ├── hardening/
│   ├── cloud/
│   ├── ad/
│   ├── forensics/
│   ├── ir/
│   ├── compliance/
│   ├── threat-hunting/
│   └── vuln-assessment/
│
├── templates/                   # Report templates
│   ├── executive/               # Executive summaries
│   ├── technical/               # Technical reports
│   ├── finding-schema/          # Standardized finding format
│   └── dashboards/              # Executive dashboards
│
├── knowledge/                   # Structured knowledge base
│   ├── frameworks/              # All standards frameworks
│   ├── methodologies/           # Testing methodologies
│   └── standards/               # Compliance standards
│
├── outputs/                     # Output generation framework
│   ├── markdown/
│   ├── html/
│   ├── docx/
│   └── pdf/
│
└── skills/                      # AI agent skills (15+)
    ├── universal-report-engine/ # Master orchestration skill
    ├── pentest-report/
    ├── redteam-report/
    ├── hardening-report/
    ├── cloud-security-report/
    ├── ad-assessment-report/
    ├── forensics-report/
    ├── incident-response-report/
    ├── compliance-report/
    ├── threat-hunting-report/
    └── vulnerability-assessment-report/
```

---

## Skills Architecture

Each skill provides two formats for maximum AI agent compatibility:

### Claude Code Format (`SKILL.md`)

```yaml
---
name: skill-name
version: 1.0.0
category: offensive|defensive|dfir|grc
standards: [OWASP, NIST, MITRE]
---

# Skill: Report Name
## Purpose
## Workflow (Step-by-step)
## Input Schema
## Output Schema
## Quality Controls
## Example Usage
```

### OpenCode Format (`skill.yaml`)

```yaml
name: skill-name
version: 1.0.0
description: "..."
tags: [...]
categories: [...]
prompt: "..."
workflows: [...]
examples: [...]
expected_outputs: [...]
validation_rules: [...]
```

---

## Finding Schema (Universal)

Every finding across all report types follows a standardized schema:

```yaml
finding:
  id: "FINDING-001"
  title: "SQL Injection in Login Endpoint"
  
  executive_description: "A critical vulnerability..."
  technical_description: "The /api/auth/login endpoint..."
  
  evidence:
    screenshot: "evidence/001-sqli.png"
    request: "POST /api/auth/login HTTP/1.1..."
    response: "HTTP/1.1 500 Internal Server Error..."
    
  reproduction_steps:
    - "Navigate to https://target.com/login"
    - "Enter ' OR '1'='1 in username field"
    - "Observe authentication bypass"
    
  attack_scenario: "An attacker could..."
  
  business_impact: "Complete compromise of user accounts..."
  technical_impact: "Database extraction, authentication bypass..."
  
  likelihood: "High"
  risk_rating: "Critical"
  
  cvss_v4:
    base_score: 9.8
    vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/..."
    
  cwe: "CWE-89"
  capec: "CAPEC-66"
  
  mitre_attack:
    tactic: "TA0001"
    technique: "T1190"
    
  kill_chain: "Exploitation"
  
  remediation:
    description: "Implement parameterized queries..."
    effort: "Medium"
    timeline: "30 days"
    
  validation:
    procedure: "Re-test with prepared statements..."
    
  references:
    - "OWASP SQL Injection Prevention Cheat Sheet"
    - "CWE-89: SQL Injection"
```

---

## Executive Dashboard Components

All reports include auto-generated executive dashboards using Mermaid:

- **Risk Heatmap** — Visual distribution of findings by severity and asset
- **Risk Distribution** — Pie/bar charts of finding categories
- **Compliance Coverage** — Standard mapping matrix
- **Remediation Progress** — Timeline and effort tracking
- **Security KPIs** — Mean Time to Detect/Respond/Remediate
- **Attack Surface Metrics** — Exposure scoring and trends

---

## Visual Identity

Four corporate themes included:

| Theme | Color Palette | Best For |
|-------|--------------|----------|
| **Enterprise Dark** | Navy/Slate/Emerald | Executive reports, Board presentations |
| **Enterprise Light** | White/Blue/Gray | Technical reports, Internal documents |
| **Executive Blue** | Deep Blue/Gold | C-Suite deliverables |
| **Security Operations** | Dark Gray/Red/Amber | SOC reports, Incident timelines |

---

## Quality Standards

All generated content follows rigorous quality requirements:

- Written at senior consultant level (8-12 years experience)
- No generic filler language
- Professional cybersecurity terminology
- Consistent methodological approach
- Full standards cross-referencing
- Ready for immediate client delivery

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

### Skill Development

To create a new reporting skill:

1. Copy `skills/_template/` to `skills/your-skill-name/`
2. Implement `SKILL.md` (Claude Code format)
3. Implement `skill.yaml` (OpenCode format)
4. Add templates, examples, and knowledge references
5. Submit PR with test cases

---

## License

Apache 2.0 — see [LICENSE](LICENSE) for details.

---

## Acknowledgments

Built with reference to standards from:
- OWASP Foundation
- MITRE Corporation
- NIST
- Center for Internet Security (CIS)
- FIRST.org (CVSS, FAIR)
- ISO/IEC

---

**CyberSec Reporting Engine** — *Enterprise reporting, open-sourced.*
