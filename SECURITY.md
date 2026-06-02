# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Do not open public issues for security vulnerabilities.**

### Responsible Disclosure

1. Email: `security@cybersec-reporting-engine.dev`
2. PGP Key: [Download](https://keys.openpgp.org/)
3. Expect acknowledgment within 24 hours
4. Expect detailed response within 72 hours
5. We will coordinate public disclosure with you

### Scope

Security issues in:
- Report generation logic
- Template injection vulnerabilities
- Data handling and sanitization
- Output format generation
- AI agent prompt injection vectors
- Dependency vulnerabilities

### Out of Scope

- Issues in third-party AI agents (report to respective vendors)
- Issues in user-provided templates
- Theoretical vulnerabilities without practical impact

---

## Security Best Practices for Users

### Handling Sensitive Data

- **Never commit findings data** to public repositories
- Use `.gitignore` for `outputs/` and any directories containing client data
- Encrypt sensitive finding data at rest
- Use environment variables for API keys and credentials

### Report Generation

- Review all generated reports before client delivery
- Sanitize evidence screenshots (redact sensitive information)
- Verify CVSS calculations independently
- Validate compliance mappings

### AI Agent Safety

- Review all AI-generated content before delivery
- Maintain human oversight on all reports
- Use prompt injection guards when processing untrusted input
- Run in isolated environments when processing client data

---

## Vulnerability Disclosure Timeline

```
Day 0:   Vulnerability reported
Day 1:   Acknowledgment and initial triage
Day 3:   Confirmation and impact assessment
Day 7:   Patch development begins
Day 30:  Patch released (target)
Day 45:  Public disclosure (if reporter agrees)
```

---

## Security Acknowledgments

We maintain a [Hall of Fame](SECURITY-HOF.md) for researchers who responsibly disclose vulnerabilities.
