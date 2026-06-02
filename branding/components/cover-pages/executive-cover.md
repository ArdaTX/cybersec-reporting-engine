---
# Executive Cover Page Template
# CyberSec Reporting Engine — Executive Edition
# Optimized for C-Suite and Board of Directors presentations
# Use with: executive-blue theme
---

<div class="cover-executive">

<!-- GOLD ACCENT LINE — TOP -->
<div class="executive-accent-line executive-accent-line--top"></div>

<!-- EXECUTIVE SUMMARY BADGE -->
<div class="executive-eyebrow">
  <span class="executive-eyebrow__text">BOARD OF DIRECTORS BRIEFING</span>
</div>

<!-- Logo Area -->
<div class="executive-logo-area">
  <div class="executive-logo">{{COMPANY_LOGO}}</div>
  <div class="executive-partner-logo">{{PARTNER_LOGO}}</div>
</div>

<!-- Title Block -->
<div class="executive-title-block">
  <h1 class="executive-title">{{REPORT_TITLE}}</h1>
  <div class="executive-decorator">
    <span class="executive-decorator__line"></span>
    <span class="executive-decorator__diamond">◆</span>
    <span class="executive-decorator__line"></span>
  </div>
  <h2 class="executive-subtitle">{{ENGAGEMENT_PERIOD}} &bull; {{CLIENT_NAME}}</h2>
</div>

<!-- Executive Summary Lock-Up -->
<div class="executive-summary-lockup">
  <div class="executive-stat">
    <span class="executive-stat__label">Overall Risk Rating</span>
    <span class="executive-stat__value executive-stat__value--{{RISK_LEVEL}}">{{OVERALL_RISK}}</span>
  </div>
  <div class="executive-stat">
    <span class="executive-stat__label">Critical Findings</span>
    <span class="executive-stat__value executive-stat__value--critical">{{CRITICAL_COUNT}}</span>
  </div>
  <div class="executive-stat">
    <span class="executive-stat__label">Remediation SLA</span>
    <span class="executive-stat__value">{{REMEDIATION_SLA}}</span>
  </div>
</div>

<!-- Metadata Footer -->
<div class="executive-footer">
  <div class="executive-footer__item">
    <span class="executive-footer__label">Classification</span>
    <span class="executive-footer__value">
      <span class="classification-pill classification-pill--confidential">CONFIDENTIAL</span>
    </span>
  </div>
  <div class="executive-footer__item">
    <span class="executive-footer__label">Date</span>
    <span class="executive-footer__value">{{REPORT_DATE}}</span>
  </div>
  <div class="executive-footer__item">
    <span class="executive-footer__label">Version</span>
    <span class="executive-footer__value">{{VERSION}}</span>
  </div>
  <div class="executive-footer__item">
    <span class="executive-footer__label">Prepared By</span>
    <span class="executive-footer__value">{{PREPARED_BY}}</span>
  </div>
</div>

<!-- GOLD ACCENT LINE — BOTTOM -->
<div class="executive-accent-line executive-accent-line--bottom"></div>

</div>

---

## Executive-Specific Variables

| Variable | Description | Example |
|---|---|---|
| `{{COMPANY_LOGO}}` | Primary company logo | SVG base64 |
| `{{PARTNER_LOGO}}` | Consulting partner / assessor logo | SVG base64 |
| `{{REPORT_TITLE}}` | Executive-friendly report title | "Cybersecurity Posture Assessment" |
| `{{ENGAGEMENT_PERIOD}}` | Engagement timeframe | "Q3 2026" |
| `{{CLIENT_NAME}}` | Client organization | "Acme Corporation" |
| `{{OVERALL_RISK}}` | Overall risk rating word | "ELEVATED" |
| `{{RISK_LEVEL}}` | CSS modifier class | `elevated`, `high`, `moderate`, `low` |
| `{{CRITICAL_COUNT}}` | Number of critical findings | "3" |
| `{{REMEDIATION_SLA}}` | Target remediation timeline | "30 days" |
| `{{REPORT_DATE}}` | Publication date | "September 2026" |
| `{{VERSION}}` | Document version | "v1.0" |
| `{{PREPARED_BY}}` | Author/team | "Cybersecurity Advisory Practice" |

## Design Notes

- Playfair Display headings for premium typographic feel
- Gold (`#c9a84c`) accent line at top and bottom anchors the page
- Diamond separator adds refined distinction
- Summary lock-up gives executives immediate risk posture awareness
- Classification pill is subtle but visible without overwhelming design
