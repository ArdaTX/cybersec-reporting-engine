# Contributing to CyberSec Reporting Engine

Thank you for your interest in contributing. This document outlines the process for contributing skills, templates, knowledge, and code.

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code.

---

## How to Contribute

### Reporting Bugs

Open an issue with:
- Clear, descriptive title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, AI agent, version)

### Suggesting Features

Open an issue with:
- Feature description
- Use case and business value
- Proposed implementation approach
- Standards/frameworks affected

### Contributing Code

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit with [Conventional Commits](https://www.conventionalcommits.org/): `feat: add new skill for X report type`
6. Push and open a Pull Request

### Commit Convention

```
feat:     New feature or skill
fix:      Bug fix
docs:     Documentation changes
style:    Formatting, branding changes
refactor: Code restructuring
test:     Adding or updating tests
chore:    Maintenance tasks
```

---

## Adding a New Skill

### Structure

```
skills/your-skill-name/
├── SKILL.md              # Claude Code format
├── skill.yaml            # OpenCode format
├── templates/
│   ├── executive.md      # Executive template
│   └── technical.md      # Technical template
├── examples/
│   └── sample-report.md  # Example output
└── knowledge/
    └── references.yaml   # Framework references
```

### SKILL.md Template

```markdown
---
name: skill-name
version: 1.0.0
category: offensive|defensive|dfir|grc
standards: [OWASP, NIST, MITRE]
compatibility: [claude-code, opencode]
---

# Skill: Report Name

## Purpose
Brief description of what this skill generates.

## Workflow
1. Step one
2. Step two
3. Step three

## Input Schema
[Define expected inputs]

## Output Schema
[Define expected outputs]

## Quality Controls
[Define validation rules]

## Example
[Provide complete example]
```

### skill.yaml Template

```yaml
name: skill-name
version: 1.0.0
description: "Brief description"
tags: ["tag1", "tag2"]
categories: ["offensive"]
prompt: |
  Detailed prompt for the AI agent...

workflows:
  - name: standard
    steps:
      - Collect findings
      - Analyze context
      - Generate report

examples:
  - input: "Example input"
    output: "Example output"

expected_outputs:
  - format: markdown
    sections: [executive_summary, findings, remediation]

validation_rules:
  - rule: All findings must have CVSS scores
  - rule: Executive summary must be < 500 words
```

---

## Quality Requirements

All contributions must:

1. **Follow standards** — Cross-reference applicable frameworks (OWASP, NIST, MITRE, etc.)
2. **Maintain consistency** — Use existing schemas, templates, and naming conventions
3. **Include examples** — Every skill must include at least one complete example report
4. **Write tests** — Include validation test cases
5. **Document thoroughly** — Update relevant documentation

---

## Review Process

1. Automated checks: linting, schema validation, test suite
2. Peer review by at least one maintainer
3. Quality review against reporting standards
4. Standards compliance check
5. Merge to main

---

## Development Setup

### Linux / macOS

```bash
# Clone and install
git clone https://github.com/ArdaTX/Cybersec-Reporting-Engine.git
cd cybersec-reporting-engine
npm install
pip install -r requirements.txt

# Run tests
npm test
pytest tests/

# Lint
npm run lint
```

### Windows

```powershell
# Clone and install
git clone https://github.com/ArdaTX/Cybersec-Reporting-Engine.git
cd cybersec-reporting-engine
npm install
pip install -r requirements.txt

# Run tests
npm test

# If Chromium download fails during npm install:
$env:PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = "true"
npm install
```

### Dev Container

A `Dockerfile.dev` and `.devcontainer/devcontainer.json` are available for a fully reproducible development environment compatible with VS Code, GitHub Codespaces, Claude Code, OpenCode, and Codex.

---

## Documentation Style Guide

- Use American English
- Follow [Microsoft Writing Style Guide](https://learn.microsoft.com/en-us/style-guide/)
- Use sentence case for headings
- Include code examples in fenced blocks with language specified
- Cross-reference standards using format: `[STANDARD-ID]`

---

## Questions?

Open a [GitHub Discussion](https://github.com/ArdaTX/Cybersec-Reporting-Engine/discussions) or join our community.

---

**CyberSec Reporting Engine** — *Built by the community, for the community.*
