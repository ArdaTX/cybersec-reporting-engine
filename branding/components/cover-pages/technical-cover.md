---
# Technical Cover Page Template
# CyberSec Reporting Engine — Technical Edition
# Optimized for engineering, security operations, and technical stakeholders
# Use with: security-ops | enterprise-dark themes
---

<div class="cover-technical">

<!-- CLASSIFICATION STRIP — TOP -->
<div class="tech-classification-strip">
  <div class="tech-classification-strip__text">
    CONFIDENTIAL — FOR AUTHORIZED TECHNICAL PERSONNEL ONLY
  </div>
  <div class="tech-classification-strip__tlp">
    TLP:{{TLP_LEVEL}}
  </div>
</div>

<!-- Header Block -->
<div class="tech-header">
  <div class="tech-header__org">
    <div class="tech-logo">{{COMPANY_LOGO}}</div>
    <div class="tech-org-name">{{CLIENT_NAME}}</div>
  </div>
  <div class="tech-header__badge">
    <span class="tech-badge">{{REPORT_CATEGORY}}</span>
  </div>
</div>

<!-- Title & Abstract -->
<div class="tech-title-section">
  <h1 class="tech-title">{{REPORT_TITLE}}</h1>
  <p class="tech-abstract">{{ABSTRACT}}</p>
</div>

<!-- Quick Reference Grid -->
<div class="tech-quickref">
  <div class="tech-quickref__card">
    <div class="tech-quickref__icon">📋</div>
    <div class="tech-quickref__label">Document ID</div>
    <div class="tech-quickref__value">{{DOCUMENT_ID}}</div>
  </div>
  <div class="tech-quickref__card">
    <div class="tech-quickref__icon">📅</div>
    <div class="tech-quickref__label">Date</div>
    <div class="tech-quickref__value">{{REPORT_DATE}}</div>
  </div>
  <div class="tech-quickref__card">
    <div class="tech-quickref__icon">🔢</div>
    <div class="tech-quickref__label">Version</div>
    <div class="tech-quickref__value">{{VERSION}}</div>
  </div>
  <div class="tech-quickref__card">
    <div class="tech-quickref__icon">⚙️</div>
    <div class="tech-quickref__label">Methodology</div>
    <div class="tech-quickref__value">{{METHODOLOGY}}</div>
  </div>
  <div class="tech-quickref__card">
    <div class="tech-quickref__icon">👤</div>
    <div class="tech-quickref__label">Lead Assessor</div>
    <div class="tech-quickref__value">{{LEAD_ASSESSOR}}</div>
  </div>
  <div class="tech-quickref__card">
    <div class="tech-quickref__icon">✅</div>
    <div class="tech-quickref__label">Technical Reviewer</div>
    <div class="tech-quickref__value">{{TECH_REVIEWER}}</div>
  </div>
</div>

<!-- Scope & Limitations -->
<div class="tech-scope">
  <div class="tech-scope__header">ENGAGEMENT SCOPE</div>
  <div class="tech-scope__body">
    <table class="tech-scope-table">
      <tr>
        <td class="tech-scope-table__label">Targets In-Scope</td>
        <td class="tech-scope-table__value">{{TARGETS_IN_SCOPE}}</td>
      </tr>
      <tr>
        <td class="tech-scope-table__label">Exclusions</td>
        <td class="tech-scope-table__value">{{EXCLUSIONS}}</td>
      </tr>
      <tr>
        <td class="tech-scope-table__label">Testing Window</td>
        <td class="tech-scope-table__value">{{TESTING_WINDOW}}</td>
      </tr>
      <tr>
        <td class="tech-scope-table__label">Source IPs</td>
        <td class="tech-scope-table__value">{{SOURCE_IPS}}</td>
      </tr>
      <tr>
        <td class="tech-scope-table__label">Limitations</td>
        <td class="tech-scope-table__value">{{LIMITATIONS}}</td>
      </tr>
    </table>
  </div>
</div>

<!-- Key Metrics Strip -->
<div class="tech-metrics-strip">
  <div class="tech-metric">
    <span class="tech-metric__count">{{TOTAL_FINDINGS}}</span>
    <span class="tech-metric__label">Total Findings</span>
  </div>
  <div class="tech-metric tech-metric--critical">
    <span class="tech-metric__count">{{CRITICAL_FINDINGS}}</span>
    <span class="tech-metric__label">Critical</span>
  </div>
  <div class="tech-metric tech-metric--high">
    <span class="tech-metric__count">{{HIGH_FINDINGS}}</span>
    <span class="tech-metric__label">High</span>
  </div>
  <div class="tech-metric tech-metric--medium">
    <span class="tech-metric__count">{{MEDIUM_FINDINGS}}</span>
    <span class="tech-metric__label">Medium</span>
  </div>
  <div class="tech-metric tech-metric--low">
    <span class="tech-metric__count">{{LOW_FINDINGS}}</span>
    <span class="tech-metric__label">Low</span>
  </div>
</div>

<!-- Prepared By Footer -->
<div class="tech-footer">
  <div class="tech-footer__prepared">
    <strong>Prepared by:</strong> {{PREPARED_BY}} &bull; {{PREPARED_DATE}}
  </div>
  <div class="tech-footer__hash">
    SHA-256: {{DOCUMENT_HASH}}
  </div>
</div>

<!-- CLASSIFICATION STRIP — BOTTOM -->
<div class="tech-classification-strip tech-classification-strip--bottom">
  <div class="tech-classification-strip__text">
    CONFIDENTIAL — FOR AUTHORIZED TECHNICAL PERSONNEL ONLY
  </div>
</div>

</div>

---

## Technical Variables Reference

| Variable | Description | Example |
|---|---|---|
| `{{COMPANY_LOGO}}` | Organization logo | SVG base64 |
| `{{CLIENT_NAME}}` | Client organization | "Acme Corporation" |
| `{{REPORT_CATEGORY}}` | Report category badge | "External Penetration Test" |
| `{{REPORT_TITLE}}` | Descriptive technical title | "External Network Penetration Test — Q3 2026" |
| `{{ABSTRACT}}` | Single-paragraph executive abstract | (1-3 sentence summary) |
| `{{DOCUMENT_ID}}` | Unique identifier | "PT-EXT-Q3-2026-001" |
| `{{REPORT_DATE}}` | Publication date | "30 September 2026" |
| `{{VERSION}}` | Semver version | "v1.3" |
| `{{METHODOLOGY}}` | Testing methodology reference | "PTES / OWASP WSTG v4.2 / OSSTMM 3" |
| `{{LEAD_ASSESSOR}}` | Primary assessor name | "Jane Smith, OSCP, CISSP" |
| `{{TECH_REVIEWER}}` | Technical reviewer name | "John Doe, OSWE, GWAPT" |
| `{{TARGETS_IN_SCOPE}}` | Target IPs/ranges/URLs | "203.0.113.0/28, api.example.com" |
| `{{EXCLUSIONS}}` | Explicit scope exclusions | "Social engineering, physical, DoS" |
| `{{TESTING_WINDOW}}` | Authorized testing period | "01-14 September 2026, 00:00-06:00 UTC" |
| `{{SOURCE_IPS}}` | Assessor source IP addresses | "198.51.100.5, 198.51.100.6" |
| `{{LIMITATIONS}}` | Known testing limitations | "No credentialed scanning, WAF bypass untested" |
| `{{TOTAL_FINDINGS}}` | Sum of all findings | "47" |
| `{{CRITICAL_FINDINGS}}` | Critical severity count | "3" |
| `{{HIGH_FINDINGS}}` | High severity count | "12" |
| `{{MEDIUM_FINDINGS}}` | Medium severity count | "21" |
| `{{LOW_FINDINGS}}` | Low severity count | "11" |
| `{{PREPARED_BY}}` | Author/team name | "Offensive Security Team" |
| `{{PREPARED_DATE}}` | Date of preparation | "28 September 2026" |
| `{{DOCUMENT_HASH}}` | SHA-256 of the final PDF | "e3b0c44298fc1c149afbf4c8996fb924..." |
| `{{TLP_LEVEL}}` | Traffic Light Protocol | `AMBER` |
