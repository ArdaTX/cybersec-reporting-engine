---
# Enterprise Cover Page Template
# CyberSec Reporting Engine — Enterprise Edition
# Use with: enterprise-dark | enterprise-light themes
---

<div class="cover-wrapper">

<!-- CLASSIFICATION BANNER — TOP -->
<div class="classification-banner classification-banner--top">
  ╔════════════════════════════════════════════════════════════════════╗
  ║                     CONFIDENTIAL — RESTRICTED                     ║
  ║    This document contains proprietary information intended for    ║
  ║              authorized recipients only. Do not copy.             ║
  ╚════════════════════════════════════════════════════════════════════╝
</div>

<!-- MAIN COVER CONTENT -->
<div class="cover-content">

  <!-- Company Logo -->
  <div class="cover-logo">
    {{COMPANY_LOGO}}
  </div>

  <!-- Vertical Spacer -->
  <div class="cover-spacer"></div>

  <!-- Report Type Badge -->
  <div class="cover-badge">
    {{REPORT_TYPE}}
  </div>

  <!-- Report Title -->
  <h1 class="cover-title">{{REPORT_TITLE}}</h1>

  <!-- Subtitle / Client Reference -->
  <div class="cover-subtitle">
    Prepared for <strong>{{CLIENT_NAME}}</strong>
  </div>

  <!-- Horizontal Rule -->
  <div class="cover-divider"></div>

  <!-- Metadata Grid -->
  <table class="cover-metadata">
    <tr>
      <td class="cover-metadata__label">Document ID</td>
      <td class="cover-metadata__value">{{DOCUMENT_ID}}</td>
    </tr>
    <tr>
      <td class="cover-metadata__label">Classification</td>
      <td class="cover-metadata__value">
        <span class="severity-tag severity-tag--confidential">CONFIDENTIAL</span>
      </td>
    </tr>
    <tr>
      <td class="cover-metadata__label">Date</td>
      <td class="cover-metadata__value">{{REPORT_DATE}}</td>
    </tr>
    <tr>
      <td class="cover-metadata__label">Version</td>
      <td class="cover-metadata__value">{{VERSION}}</td>
    </tr>
    <tr>
      <td class="cover-metadata__label">Prepared By</td>
      <td class="cover-metadata__value">{{PREPARED_BY}}</td>
    </tr>
    <tr>
      <td class="cover-metadata__label">Reviewed By</td>
      <td class="cover-metadata__value">{{REVIEWED_BY}}</td>
    </tr>
    <tr>
      <td class="cover-metadata__label">Distribution</td>
      <td class="cover-metadata__value">{{DISTRIBUTION_LIST}}</td>
    </tr>
  </table>

  <!-- TLP Marking -->
  <div class="cover-tlp">
    <span class="tlp-label">TLP:{{TLP_LEVEL}}</span>
  </div>

</div>

<!-- CLASSIFICATION BANNER — BOTTOM -->
<div class="classification-banner classification-banner--bottom">
  ╔════════════════════════════════════════════════════════════════════╗
  ║                     CONFIDENTIAL — RESTRICTED                     ║
  ║              Unauthorized disclosure strictly prohibited           ║
  ╚════════════════════════════════════════════════════════════════════╝
</div>

</div>

---

## Usage Notes

| Variable | Description | Example |
|---|---|---|
| `{{COMPANY_LOGO}}` | SVG or PNG base64-encoded logo | `<img src="data:image/svg+xml;base64,...">` |
| `{{REPORT_TYPE}}` | Category badge text | "Security Assessment Report" |
| `{{REPORT_TITLE}}` | Full report title | "Q3 2026 External Penetration Test" |
| `{{CLIENT_NAME}}` | Client organization name | "Acme Corporation" |
| `{{DOCUMENT_ID}}` | Unique document identifier | "CSR-2026-Q3-001" |
| `{{REPORT_DATE}}` | Publication date | "15 September 2026" |
| `{{VERSION}}` | Document version | "v1.2" |
| `{{PREPARED_BY}}` | Author name + title | "Jane Smith, Lead Security Consultant" |
| `{{REVIEWED_BY}}` | Reviewer name + title | "John Doe, Practice Director" |
| `{{DISTRIBUTION_LIST}}` | Authorized recipients | "CISO, VP Engineering, Legal" |
| `{{TLP_LEVEL}}` | Traffic Light Protocol | `RED`, `AMBER+STRICT`, `AMBER`, `GREEN`, `CLEAR` |
