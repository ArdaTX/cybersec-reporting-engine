---
classification: CONFIDENTIAL
document_id: {{engagement_id}}-TECH
version: "{{document_version}}"
date: "{{report_date}}"
status: Final
distribution: Restricted
author: {{lead_consultant_name}}
reviewer: {{reviewer_name}}
---

<!-- ─────────────────────────────────────────────────────────── -->
<!--              CYBERSEC REPORTING ENGINE                      -->
<!--           TECHNICAL REPORT TEMPLATE v2.1                   -->
<!--            © {{engagement_year}} {{client_name}}           -->
<!-- ─────────────────────────────────────────────────────────── -->

<div class="classification-banner">
⚠️  CONFIDENTIAL — TECHNICAL FINDINGS — RESTRICTED DISTRIBUTION  ⚠️
</div>

---

<!-- ============================================================ -->
<!--                        COVER PAGE                            -->
<!-- ============================================================ -->

<p style="text-align: center; margin-top: 4rem;">

# {{engagement_type}}: Technical Assessment Report

**{{client_name}}**

<br/>

**Version:** {{document_version}}
**Date:** {{report_date}}
**Classification:** CONFIDENTIAL
**TLP:** {{tlp_level}}

<br/>

**Prepared by:**
{{consulting_firm_name}}
{{consulting_firm_address}}
{{consulting_firm_website}}

**Prepared for:**
{{client_name}}
{{client_address_line1}}

**Engagement Reference:** {{engagement_reference}}
**Testing Window:** {{start_date}} – {{end_date}}

</p>

<div style="page-break-after: always;"></div>

---

<!-- ============================================================ -->
<!--                     TABLE OF CONTENTS                        -->
<!-- ============================================================ -->

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Assessment Overview](#2-assessment-overview)
   - 2.1 [Scope](#21-scope)
   - 2.2 [Objectives](#22-objectives)
   - 2.3 [Constraints & Limitations](#23-constraints--limitations)
3. [Methodology](#3-methodology)
   - 3.1 [Standards & Frameworks](#31-standards--frameworks)
   - 3.2 [Testing Phases](#32-testing-phases)
   - 3.3 [Risk Rating Methodology](#33-risk-rating-methodology)
4. [Attack Surface Analysis](#4-attack-surface-analysis)
   - 4.1 [External Attack Surface](#41-external-attack-surface)
   - 4.2 [Internal Attack Surface](#42-internal-attack-surface)
   - 4.3 [Cloud & Third-Party Exposure](#43-cloud--third-party-exposure)
5. [Findings](#5-findings)
   - 5.1 [Finding Summary Matrix](#51-finding-summary-matrix)
   - 5.2 [Critical Findings](#52-critical-findings)
   - 5.3 [High Severity Findings](#53-high-severity-findings)
   - 5.4 [Medium Severity Findings](#54-medium-severity-findings)
   - 5.5 [Low Severity Findings](#55-low-severity-findings)
   - 5.6 [Informational Observations](#56-informational-observations)
6. [Risk Analysis](#6-risk-analysis)
   - 6.1 [Aggregate Risk Calculations](#61-aggregate-risk-calculations)
   - 6.2 [Risk Matrix](#62-risk-matrix)
   - 6.3 [Risk Trends & Observations](#63-risk-trends--observations)
7. [Remediation Roadmap](#7-remediation-roadmap)
   - 7.1 [Quick Wins (0–30 Days)](#71-quick-wins-030-days)
   - 7.2 [Short-Term (1–3 Months)](#72-short-term-13-months)
   - 7.3 [Medium-Term (3–6 Months)](#73-medium-term-36-months)
   - 7.4 [Long-Term (6–12 Months)](#74-long-term-612-months)
8. [Conclusions](#8-conclusions)
9. [Appendices](#9-appendices)
   - A. [Detailed Methodology](#a-detailed-methodology)
   - B. [Tools & Infrastructure](#b-tools--infrastructure)
   - C. [Glossary](#c-glossary)
   - D. [References](#d-references)
   - E. [Testing Accounts & IPs](#e-testing-accounts--ips)
   - F. [Engagement Timeline](#f-engagement-timeline)

<div style="page-break-after: always;"></div>

---

<!-- ============================================================ -->
<!--                   1. EXECUTIVE SUMMARY                       -->
<!-- ============================================================ -->

## 1. Executive Summary

> *A comprehensive strategic summary is provided in the accompanying Executive Summary document (Ref: {{executive_summary_ref}}). This section provides an abbreviated technical overview for the engineering audience.*

{{consulting_firm_name}} conducted a {{engagement_type}} of {{client_name}} between {{start_date}} and {{end_date}}. The assessment evaluated {{scope_summary}} and identified **{{total_findings_count}} security findings**: {{critical_count}} Critical, {{high_count}} High, {{medium_count}} Medium, {{low_count}} Low, and {{info_count}} Informational.

**Overall Technical Risk Rating:** {{overall_risk_rating}}  
**Key Risk Themes:** {{risk_themes_summary}}  
**Top Remediation Priority:** {{top_priority_area}}

<div style="page-break-after: always;"></div>

---

<!-- ============================================================ -->
<!--                  2. ASSESSMENT OVERVIEW                      -->
<!-- ============================================================ -->

## 2. Assessment Overview

### 2.1 Scope

The assessment encompassed the following in-scope assets:

| Category | Description | Count |
|---|---|---|
| **External IP Ranges** | {{external_ip_ranges}} | {{external_ip_count}} |
| **Internal Subnets** | {{internal_subnets}} | {{internal_subnet_count}} |
| **Domains & Subdomains** | {{domain_list}} | {{domain_count}} |
| **Web Applications** | {{webapp_description}} | {{webapp_count}} |
| **Mobile Applications** | {{mobile_app_description}} | {{mobile_app_count}} |
| **APIs** | {{api_description}} | {{api_count}} |
| **Cloud Environments** | {{cloud_environments}} | {{cloud_env_count}} |
| **Active Directory** | {{ad_description}} | {{ad_domain_count}} |
| **Network Devices** | {{network_device_description}} | {{network_device_count}} |

**Out of Scope:** {{out_of_scope_description}}

### 2.2 Objectives

| Objective | Success Criteria | Met? |
|---|---|---|
| {{objective_01_description}} | {{objective_01_criteria}} | {{objective_01_met}} |
| {{objective_02_description}} | {{objective_02_criteria}} | {{objective_02_met}} |
| {{objective_03_description}} | {{objective_03_criteria}} | {{objective_03_met}} |
| {{objective_04_description}} | {{objective_04_criteria}} | {{objective_04_met}} |
| {{objective_05_description}} | {{objective_05_criteria}} | {{objective_05_met}} |

### 2.3 Constraints & Limitations

{% for constraint in constraints %}
- **{{constraint.type}}:** {{constraint.description}} — *Impact: {{constraint.impact}}*
{% endfor %}

<div style="page-break-after: always;"></div>

---

<!-- ============================================================ -->
<!--                      3. METHODOLOGY                          -->
<!-- ============================================================ -->

## 3. Methodology

### 3.1 Standards & Frameworks

This assessment was conducted in alignment with the following industry standards:

| Standard / Framework | Version | Application |
|---|---|---|
| **NIST SP 800-115** | {{nist_800_115_version}} | Technical Guide to Information Security Testing and Assessment |
| **OWASP Testing Guide** | {{owasp_wstg_version}} | Web Application Security Testing |
| **OWASP ASVS** | {{owasp_asvs_version}} | Application Security Verification Standard — Level {{asvs_level}} |
| **PTES** | {{ptes_version}} | Penetration Testing Execution Standard — All 7 phases |
| **MITRE ATT&CK** | {{mitre_attack_version}} | Adversary TTP mapping and detection coverage |
| **CVSS** | v{{cvss_version}} | Vulnerability severity scoring |
| **CIS Benchmarks** | {{cis_version}} | Configuration assessment baselines |
| **OSSTMM** | {{osstmm_version}} | Open Source Security Testing Methodology Manual |

### 3.2 Testing Phases

| Phase | Description | Duration | Key Activities |
|---|---|---|---|
| **1. Reconnaissance** | Passive and active information gathering | {{phase1_duration}} | OSINT, DNS enumeration, subdomain discovery, certificate transparency monitoring, Shodan/Censys queries |
| **2. Discovery & Enumeration** | Service, version, and configuration enumeration | {{phase2_duration}} | Port scanning, service fingerprinting, banner grabbing, directory enumeration, API endpoint discovery |
| **3. Vulnerability Identification** | Automated and manual vulnerability discovery | {{phase3_duration}} | SAST, DAST, SCA, manual code review, configuration review, dependency analysis |
| **4. Exploitation** | Controlled exploitation of confirmed vulnerabilities | {{phase4_duration}} | Proof-of-concept development, privilege escalation, lateral movement, data access demonstration |
| **5. Post-Exploitation** | Persistence, pivoting, and objective achievement | {{phase5_duration}} | Persistence mechanisms, credential harvesting, data enumeration, domain dominance |
| **6. Analysis & Reporting** | Finding validation, risk scoring, and report generation | {{phase6_duration}} | Evidence correlation, CVSS scoring, ATT&CK mapping, peer review, quality assurance |
| **7. Presentation & Handoff** | Client presentation and knowledge transfer | {{phase7_duration}} | Executive readout, technical deep-dive, remediation workshop, report delivery |

### 3.3 Risk Rating Methodology

Risk ratings were calculated using a **{{risk_rating_method}}** approach combining:

```
Risk Score = Likelihood × Impact

Where:
  Likelihood = f(Exploitability, Threat Prevalence, Control Maturity)
  Impact     = f(Confidentiality, Integrity, Availability, Business Criticality)
```

| Rating | Score Range | Definition |
|---|---|---|
| **Critical** | {{critical_range}} | Immediate risk of catastrophic business impact; exploitation is trivial or already occurring |
| **High** | {{high_range}} | Significant business impact likely; exploitation is feasible with moderate effort |
| **Medium** | {{medium_range}} | Moderate business impact; exploitation requires non-trivial conditions |
| **Low** | {{low_range}} | Limited business impact; exploitation is theoretical or requires extensive prerequisites |
| **Informational** | N/A | No direct risk; observation for awareness or hardening opportunities |

<div style="page-break-after: always;"></div>

---

<!-- ============================================================ -->
<!--                 4. ATTACK SURFACE ANALYSIS                   -->
<!-- ============================================================ -->

## 4. Attack Surface Analysis

### 4.1 External Attack Surface

| Asset Type | Discovered | Previously Known | New Since Last Assessment |
|---|---|---|---|
| IP Addresses | {{external_ip_discovered}} | {{external_ip_known}} | {{external_ip_new}} |
| Domains / Subdomains | {{domains_discovered}} | {{domains_known}} | {{domains_new}} |
| Open TCP Ports | {{tcp_ports_discovered}} | — | — |
| Open UDP Ports | {{udp_ports_discovered}} | — | — |
| Web Applications | {{webapps_discovered}} | {{webapps_known}} | {{webapps_new}} |
| APIs | {{apis_discovered}} | {{apis_known}} | {{apis_new}} |
| Cloud Services | {{cloud_services_discovered}} | {{cloud_services_known}} | {{cloud_services_new}} |
| Email Infrastructure | {{email_infra_domains}} | — | — |
| SSL/TLS Certificates | {{certificates_discovered}} | — | — |

**Key Observations:**

{{external_attack_surface_observations}}

### 4.2 Internal Attack Surface

{{internal_attack_surface_description}}

| Attack Vector | Exposure | Severity |
|---|---|---|
| {{iav_01_name}} | {{iav_01_exposure}} | {{iav_01_severity}} |
| {{iav_02_name}} | {{iav_02_exposure}} | {{iav_02_severity}} |
| {{iav_03_name}} | {{iav_03_exposure}} | {{iav_03_severity}} |

### 4.3 Cloud & Third-Party Exposure

| Service | Provider | Risk Level | Key Findings |
|---|---|---|---|
| {{cloud_svc_01_name}} | {{cloud_svc_01_provider}} | {{cloud_svc_01_risk}} | {{cloud_svc_01_findings}} |
| {{cloud_svc_02_name}} | {{cloud_svc_02_provider}} | {{cloud_svc_02_risk}} | {{cloud_svc_02_findings}} |
| {{cloud_svc_03_name}} | {{cloud_svc_03_provider}} | {{cloud_svc_03_risk}} | {{cloud_svc_03_findings}} |

<div style="page-break-after: always;"></div>

---

<!-- ============================================================ -->
<!--                        5. FINDINGS                           -->
<!-- ============================================================ -->

## 5. Findings

### 5.1 Finding Summary Matrix

| ID | Title | Severity | CVSS v4 | Likelihood | Impact | Effort | ATT&CK | Status |
|---|---|---|---|---|---|---|---|---|
{% for finding in findings %}
| {{finding.id}} | {{finding.title}} | {{finding.severity}} | {{finding.cvss_v4}} | {{finding.likelihood}} | {{finding.impact}} | {{finding.effort}} | {{finding.mitre_id}} | {{finding.status}} |
{% endfor %}

---

### 5.2 Critical Findings

{% for finding in critical_findings %}

#### {{finding.id}} — {{finding.title}}

| Attribute | Value |
|---|---|
| **Severity** | {{finding.severity}} (CVSS v4: {{finding.cvss_v4}}) |
| **CWE** | {{finding.cwe}} |
| **CAPEC** | {{finding.capec}} |
| **MITRE ATT&CK** | {{finding.mitre_tactic}} → {{finding.mitre_technique}} ({{finding.mitre_id}}) |
| **Kill Chain Phase** | {{finding.kill_chain_phase}} |
| **Likelihood** | {{finding.likelihood}} |
| **Impact** | {{finding.impact}} |
| **Effort to Remediate** | {{finding.effort}} |
| **Affected Assets** | {{finding.assets}} |
| **Discovered** | {{finding.discovery_date}} |
| **Status** | {{finding.status}} |

**Executive Description**

{{finding.executive_description}}

**Technical Description**

{{finding.technical_description}}

**Evidence**

```
{{finding.evidence}}
```

**Reproduction Steps**

1. {{finding.repro_step_1}}
2. {{finding.repro_step_2}}
3. {{finding.repro_step_3}}
4. {{finding.repro_step_4}}

**Attack Scenario**

{{finding.attack_scenario}}

**Business Impact**

{{finding.business_impact}}

**Technical Impact**

{{finding.technical_impact}}

**Remediation**

{{finding.remediation}}

**Validation**

{{finding.validation}}

**References**

{% for ref in finding.references %}
- {{ref}}
{% endfor %}

---

{% endfor %}

### 5.3 High Severity Findings

{% for finding in high_findings %}
*(Same detailed schema as Critical Findings above)*
{% endfor %}

### 5.4 Medium Severity Findings

{% for finding in medium_findings %}
*(Same detailed schema as Critical Findings above)*
{% endfor %}

### 5.5 Low Severity Findings

{% for finding in low_findings %}
*(Same detailed schema as Critical Findings above)*
{% endfor %}

### 5.6 Informational Observations

{% for finding in info_findings %}
*(Same detailed schema as Critical Findings above)*
{% endfor %}

<div style="page-break-after: always;"></div>

---

<!-- ============================================================ -->
<!--                      6. RISK ANALYSIS                        -->
<!-- ============================================================ -->

## 6. Risk Analysis

### 6.1 Aggregate Risk Calculations

| Metric | Value |
|---|---|
| Total Findings | {{total_findings_count}} |
| Total Exploitable (Critical + High) | {{exploitable_count}} |
| Mean CVSS v4 Score | {{mean_cvss}} |
| Median CVSS v4 Score | {{median_cvss}} |
| Weighted Risk Score (WRS) | {{weighted_risk_score}} |
| Risk Density (findings per asset) | {{risk_density}} |
| Mean Time to Remediate (estimated) | {{mttr_estimated}} |

### 6.2 Risk Matrix

|  | **Negligible** | **Low** | **Moderate** | **Significant** | **Severe** |
|---|---|---|---|---|---|
| **Very Likely** | {{r1}} | {{r2}} | {{r3}} | {{r4}} | {{r5}} |
| **Likely** | {{r6}} | {{r7}} | {{r8}} | {{r9}} | {{r10}} |
| **Possible** | {{r11}} | {{r12}} | {{r13}} | {{r14}} | {{r15}} |
| **Unlikely** | {{r16}} | {{r17}} | {{r18}} | {{r19}} | {{r20}} |
| **Rare** | {{r21}} | {{r22}} | {{r23}} | {{r24}} | {{r25}} |

*Legend: ⬤ Critical (≥5 cells) &nbsp; ⬤ High (≥3 cells) &nbsp; ⬤ Medium (≥2 cells) &nbsp; ⬤ Low (0 cells)*

### 6.3 Risk Trends & Observations

{{risk_trends_paragraph_1}}

{{risk_trends_paragraph_2}}

**Top 5 ATT&CK Techniques by Finding Frequency:**

| ATT&CK ID | Technique Name | Finding Count | Tactic |
|---|---|---|---|
| {{attck_trend_01_id}} | {{attck_trend_01_name}} | {{attck_trend_01_count}} | {{attck_trend_01_tactic}} |
| {{attck_trend_02_id}} | {{attck_trend_02_name}} | {{attck_trend_02_count}} | {{attck_trend_02_tactic}} |
| {{attck_trend_03_id}} | {{attck_trend_03_name}} | {{attck_trend_03_count}} | {{attck_trend_03_tactic}} |
| {{attck_trend_04_id}} | {{attck_trend_04_name}} | {{attck_trend_04_count}} | {{attck_trend_04_tactic}} |
| {{attck_trend_05_id}} | {{attck_trend_05_name}} | {{attck_trend_05_count}} | {{attck_trend_05_tactic}} |

<div style="page-break-after: always;"></div>

---

<!-- ============================================================ -->
<!--                   7. REMEDIATION ROADMAP                     -->
<!-- ============================================================ -->

## 7. Remediation Roadmap

### 7.1 Quick Wins (0–30 Days)

| Priority | Finding ID | Remediation Action | Effort | Owner | Risk Reduction |
|---|---|---|---|---|---|
{% for win in quick_wins %}
| {{loop.index}} | {{win.finding_id}} | {{win.action}} | {{win.effort}} | {{win.owner}} | {{win.risk_reduction}} |
{% endfor %}

### 7.2 Short-Term (1–3 Months)

| Priority | Finding ID(s) | Remediation Initiative | Effort | Dependencies | Milestone |
|---|---|---|---|---|---|
{% for item in short_term_remediation %}
| {{loop.index}} | {{item.finding_ids}} | {{item.initiative}} | {{item.effort}} | {{item.dependencies}} | {{item.milestone}} |
{% endfor %}

### 7.3 Medium-Term (3–6 Months)

| Priority | Initiative | Strategic Objective | Effort | KPIs |
|---|---|---|---|---|
{% for item in medium_term_remediation %}
| {{loop.index}} | {{item.initiative}} | {{item.objective}} | {{item.effort}} | {{item.kpis}} |
{% endfor %}

### 7.4 Long-Term (6–12 Months)

| Initiative | Description | Strategic Outcome | Investment |
|---|---|---|---|
{% for item in long_term_remediation %}
| {{item.initiative}} | {{item.description}} | {{item.outcome}} | {{item.investment}} |
{% endfor %}

<div style="page-break-after: always;"></div>

---

<!-- ============================================================ -->
<!--                      8. CONCLUSIONS                          -->
<!-- ============================================================ -->

## 8. Conclusions

{{conclusions_paragraph_1}}

{{conclusions_paragraph_2}}

{{conclusions_paragraph_3}}

### Key Metrics

| Metric | Value |
|---|---|
| Overall Security Maturity | {{maturity_level}} ({{maturity_score}}/5) |
| Findings Remediated During Engagement | {{remediated_during_count}} |
| Critical Findings Requiring Immediate Action | {{critical_open_count}} |
| Estimated Total Remediation Effort | {{total_remediation_effort}} person-days |
| Projected Post-Remediation Risk Score | {{projected_residual_risk}} |

---

<div style="page-break-after: always;"></div>

<!-- ============================================================ -->
<!--                      9. APPENDICES                           -->
<!-- ============================================================ -->

## 9. Appendices

### A. Detailed Methodology

{{detailed_methodology_text}}

**Testing Rules of Engagement:**
{% for rule in roe_rules %}
- {{rule}}
{% endfor %}

### B. Tools & Infrastructure

| Tool | Version | Purpose | License |
|---|---|---|---|
{% for tool in tools_used %}
| {{tool.name}} | {{tool.version}} | {{tool.purpose}} | {{tool.license}} |
{% endfor %}

**Testing Infrastructure:**
- Source IPs: {{testing_source_ips}}
- Testing Platform: {{testing_platform}}
- Cloud Environment: {{testing_cloud_env}}

### C. Glossary

| Term | Definition |
|---|---|
| **APT** | Advanced Persistent Threat — a sophisticated, long-term cyber intrusion campaign |
| **ATT&CK** | Adversarial Tactics, Techniques, and Common Knowledge — MITRE knowledge base |
| **CAPEC** | Common Attack Pattern Enumeration and Classification |
| **CIS** | Center for Internet Security |
| **CVSS** | Common Vulnerability Scoring System |
| **CWE** | Common Weakness Enumeration |
| **DAST** | Dynamic Application Security Testing |
| **OSINT** | Open Source Intelligence |
| **PTES** | Penetration Testing Execution Standard |
| **SAST** | Static Application Security Testing |
| **SCA** | Software Composition Analysis |
| **TLP** | Traffic Light Protocol |
| {{glossary_term_01}} | {{glossary_def_01}} |
| {{glossary_term_02}} | {{glossary_def_02}} |

### D. References

{% for ref in all_references %}
- {{ref}}
{% endfor %}

### E. Testing Accounts & IPs

| Type | Value | Purpose | Active Period |
|---|---|---|---|
| **Source IP** | {{testing_ip_01}} | External testing | {{start_date}} – {{end_date}} |
| **Source IP** | {{testing_ip_02}} | Internal testing | {{start_date}} – {{end_date}} |
| **Test Account** | {{testing_account_01}} | Authenticated web app testing | {{start_date}} – {{end_date}} |
| **Test Account** | {{testing_account_02}} | AD enumeration | {{start_date}} – {{end_date}} |

**Post-Engagement Cleanup Confirmation:**
- [x] All test accounts removed
- [x] All backdoors / persistence mechanisms removed
- [x] All uploaded files deleted
- [x] Configuration changes reverted
- [x] Credentials rotated where applicable

### F. Engagement Timeline

| Date | Phase | Activity | Duration (hours) |
|---|---|---|---|
{% for event in engagement_timeline %}
| {{event.date}} | {{event.phase}} | {{event.activity}} | {{event.duration}} |
{% endfor %}
| {{end_date}} | Reporting | Final report delivery | — |

**Total Engagement Effort:** {{total_effort_hours}} hours | {{total_effort_days}} person-days

---

<div class="classification-banner">
⚠️  END OF DOCUMENT — CONFIDENTIAL — {{document_id}}  ⚠️
</div>
