# CyberSec Reporting Engine — Codex Integration

> Generate professional cybersecurity reports using OpenAI Codex.

---

## Overview

Codex can use the CyberSec Reporting Engine to generate structured findings and produce multi-format reports. The integration works through the project's `skills/` directory and CLI commands.

---

## Installation

```bash
# Clone the repository
git clone https://github.com/ArdaTX/Cybersec-Reporting-Engine.git
cd cybersec-reporting-engine

# Install dependencies
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install
pip install -r requirements.txt

# (Optional) Register globally
npm link
```

---

## Recommended Workflow

### 1. Initialize a Project

```bash
cybersec-report init -d my-assessment
cd my-assessment
```

### 2. Load a Skill in Codex

Open the project in Codex and reference the appropriate skill:

```
Read the skill file at skills/pentest-report/SKILL.md
Generate a penetration test report from the findings I provide.
```

### 3. Provide Raw Findings

Share your raw assessment data with Codex:

- Nmap scan results
- Vulnerability scanner output
- Manual testing notes
- Screenshots/evidence

### 4. Generate Structured Findings

Codex will produce a structured findings YAML file based on the skill schema:

```bash
# Codex will create a file like:
# findings/assessment-findings.yaml
```

### 5. Generate the Report

Run the CLI to produce formatted deliverables:

```bash
cybersec-report generate \
  --input findings/assessment-findings.yaml \
  --output ./output/ \
  --formats md,html,pdf \
  --theme enterprise-dark
```

---

## Available Skills

| Skill | File | Purpose |
|-------|------|---------|
| **Pentest Report** | `skills/pentest-report/SKILL.md` | Penetration testing assessments |
| **Red Team Report** | `skills/redteam-report/SKILL.md` | Red team operations |
| **Hardening Report** | `skills/hardening-report/SKILL.md` | Security hardening assessments |
| **Cloud Security Report** | `skills/cloud-security-report/SKILL.md` | Cloud security assessments |
| **AD Assessment Report** | `skills/ad-assessment-report/SKILL.md` | Active Directory assessments |
| **Forensics Report** | `skills/forensics-report/SKILL.md` | Digital forensics investigations |
| **Incident Response Report** | `skills/incident-response-report/SKILL.md` | Incident response documentation |
| **Compliance Report** | `skills/compliance-report/SKILL.md` | Compliance assessments |
| **Threat Hunting Report** | `skills/threat-hunting-report/SKILL.md` | Threat hunting operations |
| **Vulnerability Assessment Report** | `skills/vulnerability-assessment-report/SKILL.md` | Vulnerability assessments |
| **Universal Report Engine** | `skills/universal-report-engine/SKILL.md` | Custom/generic report types |

---

## Tips for Codex

1. **Always reference the skill file** before generating findings — this ensures schema compliance.
2. **Use the finding schema** defined in `templates/finding-schema/` as the data model.
3. **Validate before generating** — run `cybersec-report validate -i findings.yaml` to check schema compliance.
4. **Start with Markdown format** during development, then add HTML/PDF for client delivery.

---

## Example Codex Session

```
User: I have results from an external pentest of example.com.
      Here are my scan results:
      - Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)
      - SQL injection found on /login endpoint
      - Outdated nginx 1.18.0 on port 443
      - Weak SSH ciphers allowed

Codex: [Reads skills/pentest-report/SKILL.md]
      I'll structure these findings according to the PTES methodology.

      Created: findings/external-pentest.yaml
      Run validation: cybersec-report validate -i findings/external-pentest.yaml

      Validation: PASSED

      Ready to generate. Run:
        cybersec-report generate -i findings/external-pentest.yaml \
          --output ./reports/ --formats md,html,pdf --theme enterprise-dark
```

---

## Troubleshooting

### Codex Cannot Find the Skill

Ensure the Codex workspace includes the repository root. Reference the skill by absolute or relative path:

```
Read the file at /path/to/cybersec-reporting-engine/skills/pentest-report/SKILL.md
```

### Output Files Not Generated

Codex generates the structured findings file. The CLI must be run separately to produce the formatted report. If you have registered globally (`npm link` or `npm install -g`), you can run:

```bash
cybersec-report generate -i findings.yaml
```
