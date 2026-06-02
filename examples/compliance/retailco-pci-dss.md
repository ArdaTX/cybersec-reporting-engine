---
title: "PCI DSS v4.0.1 Compliance Assessment Report"
client: "RetailCo Holdings, Inc."
industry: "Retail — Omnichannel Commerce"
assessment_type: "PCI DSS v4.0.1 Readiness Assessment"
classification: "CONFIDENTIAL — PCI SCOPE DOCUMENT"
report_id: "ASG-PCI-2025-0074"
version: "1.0"
date: "2025-05-20"
assessor: "Diana Reyes, PCI QSA, CISSP"
assessment_period: "2025-05-05 to 2025-05-16"
executive_sponsor: "Thomas Park, VP of Information Security"
---

# PCI DSS v4.0.1 Compliance Assessment

## RetailCo Holdings, Inc.

**CONFIDENTIAL — Restricted to PCI Assessment Team and Executive Management**

---

## Executive Summary

Apex Security Group conducted a PCI DSS v4.0.1 readiness assessment of RetailCo Holdings' Cardholder Data Environment (CDE). The assessment evaluated compliance against all 12 PCI DSS requirements across the organization's e-commerce platform, point-of-sale systems, payment processing infrastructure, and supporting network environment.

### Overall Compliance Status

| Metric | Value |
|--------|-------|
| **Overall Compliance Score** | **61%** |
| Requirements Fully Compliant | 4 of 12 |
| Requirements Partially Compliant | 5 of 12 |
| Requirements Non-Compliant | 3 of 12 |
| Total Controls Assessed | 282 |
| Controls Passing | 172 |
| Controls Failing | 110 |
| Critical Gaps Identified | 7 |
| Target Assessment Date | Q4 2025 |

### Compliance Dashboard

```mermaid
pie title PCI DSS v4.0.1 Compliance Status
    "Fully Compliant (4)" : 4
    "Partially Compliant (5)" : 5
    "Non-Compliant (3)" : 3
```

---

## Scope Definition

### Cardholder Data Environment (CDE)

| System/Component | Description | CDE Classification |
|-----------------|-------------|-------------------|
| `ecom-web-*` (12 EC2 instances) | E-commerce web application | CDE — Systems that store/process/transmit CHD |
| `payment-api-*` (4 EC2 instances) | Payment processing API | CDE — Systems that store/process/transmit CHD |
| `pos-terminals-*` (847 terminals) | In-store point-of-sale | CDE — Systems that store/process/transmit CHD |
| `rds-payment-prod` | Payment database (RDS PostgreSQL) | CDE — Systems that store/process/transmit CHD |
| `s3-receipts-prod` | Digital receipt storage | CDE — Systems that store/process/transmit CHD |
| `vault-prod-*` (2 instances) | Tokenization vault (Hashicorp Vault) | CDE — Security-impacting system |
| `siem-prod-*` (2 instances) | Security monitoring | CDE — Security-impacting system |
| `jump-host-*` (2 instances) | Administrative access | Connected-to/system component |

### Network Diagram

```mermaid
graph TD
    INTERNET[Internet] --> WAF[AWS WAF]
    WAF --> ALB[Application Load Balancer]
    ALB --> WEB[ecom-web Tier<br/>VPC: 10.100.0.0/24]
    WEB --> APP[payment-api Tier<br/>VPC: 10.100.1.0/24]
    APP --> DB[(rds-payment-prod<br/>VPC: 10.100.2.0/24)]
    APP --> VAULT[vault-prod<br/>Tokenization]
    STORES[847 Store Locations] --> POS[POS Terminals<br/>VLAN 200]
    POS --> DC[Data Center<br/>10.200.0.0/16]
    DC --> APP

    style DB fill:#ff4d4d,color:white
    style VAULT fill:#ff9933,color:white
    style POS fill:#ff9933,color:white
```

---

## Control Assessment Matrix

### Requirement-by-Requirement Summary

| Req # | Requirement Title | Controls Tested | Passed | Score | Status |
|-------|------------------|-----------------|--------|-------|--------|
| 1 | Install and Maintain Network Security Controls | 18 | 11 | 61% | PARTIAL |
| 2 | Apply Secure Configurations to All System Components | 14 | 9 | 64% | PARTIAL |
| 3 | Protect Stored Account Data | 22 | 14 | 64% | PARTIAL |
| 4 | Protect Cardholder Data with Strong Cryptography During Transmission | 16 | 16 | 100% | COMPLIANT |
| 5 | Protect All Systems and Networks from Malicious Software | 18 | 18 | 100% | COMPLIANT |
| 6 | Develop and Maintain Secure Systems and Software | 28 | 12 | 43% | NON-COMPLIANT |
| 7 | Restrict Access to System Components and Cardholder Data by Business Need to Know | 24 | 16 | 67% | PARTIAL |
| 8 | Identify Users and Authenticate Access to System Components | 22 | 15 | 68% | PARTIAL |
| 9 | Restrict Physical Access to Cardholder Data | 20 | 20 | 100% | COMPLIANT |
| 10 | Log and Monitor All Access to System Components and Cardholder Data | 30 | 14 | 47% | NON-COMPLIANT |
| 11 | Test Security of Systems and Networks Regularly | 42 | 17 | 40% | NON-COMPLIANT |
| 12 | Support Information Security with Organizational Policies and Programs | 28 | 28 | 100% | COMPLIANT |

### Compliance Radar Chart

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'pie1': '#ff4d4d', 'pie2': '#ff9933', 'pie3': '#ffcc00', 'pie4': '#66cc66'}}}%%
graph TD
    subgraph "PCI DSS v4.0.1 — Compliance by Requirement"
        direction LR
        R1[Req 1: 61%] --> Partial
        R2[Req 2: 64%] --> Partial
        R3[Req 3: 64%] --> Partial
        R4[Req 4: 100%] --> Full
        R5[Req 5: 100%] --> Full
        R6[Req 6: 43%] --> Fail
        R7[Req 7: 67%] --> Partial
        R8[Req 8: 68%] --> Partial
        R9[Req 9: 100%] --> Full
        R10[Req 10: 47%] --> Fail
        R11[Req 11: 40%] --> Fail
        R12[Req 12: 100%] --> Full
    end
```

---

## Critical Gaps

### Gap 1: Req 6.4.2 — No Automated Software Change Approval (CRITICAL)

**Description:** RetailCo deploys code to the e-commerce platform via manual SFTP uploads without automated CI/CD pipelines, code review, or change approval workflows. Twenty-three production deployments in the past 90 days lacked evidence of change approval or security review.

**Impact:** Unauthorized or malicious code could be deployed to the CDE without detection.

**Remediation:**
```yaml
# Implement GitLab CI/CD with mandatory code review
# .gitlab-ci.yml
deploy_to_production:
  stage: deploy
  only:
    - main
  before_script:
    - semgrep --config=auto --error .
    - trivy image --severity CRITICAL,HIGH $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  script:
    - aws ecs update-service --cluster payment-cluster --service ecom-web --force-new-deployment
  environment:
    name: production
  when: manual
  only:
    refs:
      - main
```

---

### Gap 2: Req 10.2.1 — Audit Logs Missing Critical Events (CRITICAL)

**Description:** The CDE does not capture audit logs for privileged user actions on the payment database. PostgreSQL audit logging is disabled. No log of administrative queries, schema changes, or direct database access exists.

**Remediation:**

```ini
# postgresql.conf — Enable comprehensive audit logging
log_statement = 'all'
log_duration = on
log_connections = on
log_disconnections = on
log_line_prefix = '%t [%p]: user=%u,db=%d,app=%a,remote=%h '
pgaudit.log = 'write, role, ddl, function'
pgaudit.log_level = 'notice'
pgaudit.log_catalog = on

# Forward to SIEM
shared_preload_libraries = 'pgaudit, pg_stat_statements'
```

```hcl
# Terraform: Ensure CloudWatch log export
resource "aws_db_instance" "payment_db" {
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  # ... other configuration
}
```

---

### Gap 3: Req 11.3.1 — No External ASV Scanning (CRITICAL)

**Description:** No external Approved Scanning Vendor (ASV) scans have been conducted within the past 12 months. Internal vulnerability scans are run quarterly but external-facing CDE systems have not been scanned by an ASV.

---

### Gap 4: Req 3.5.1 — PAN Stored in Clear Text in Logs (HIGH)

**Description:** Primary Account Numbers (PANs) are logged in clear text in application debug logs, Nginx access logs, and AWS CloudWatch Logs. Grep across log storage found 14,827 full PANs in the past 30 days.

**Remediation:**

```nginx
# Nginx log_format — strip PAN from URL parameters
map $request_uri $sanitized_uri {
    "~^(?<before_pan>.*)(card_number=|pan=)(?<pan_value>[0-9]{13,19})(?<after_pan>.*)$" 
        "${before_pan}card_number=****-REDACTED-****${after_pan}";
    default $request_uri;
}
access_log /var/log/nginx/access.log custom_format;
```

---

### Gap 5: Req 7.2.1 — Overly Broad CDE Access (HIGH)

**Description:** Developer group (`dev-team`) has ReadWrite access to the production payment database. Fourteen developers have credentials capable of directly querying the CDE database containing full PAN data.

**Remediation:**

```sql
-- Revoke direct dev access to production
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM dev_team;
REVOKE ALL ON SCHEMA public FROM dev_team;
DROP ROLE dev_team;

-- Grant read-only access to masked views only
CREATE ROLE dev_readonly WITH LOGIN PASSWORD 'password_here';
GRANT USAGE ON SCHEMA masked_views TO dev_readonly;
GRANT SELECT ON masked_views.customers_masked TO dev_readonly;
GRANT SELECT ON masked_views.transactions_masked TO dev_readonly;
```

---

### Gap 6: Req 8.3.1 — No MFA for CDE Administrative Access (HIGH)

**Description:** SSH access to CDE servers and database administrative interfaces does not require multi-factor authentication. Root access to the payment database is granted via password-only authentication.

---

### Gap 7: Req 11.4.1 — No Annual Penetration Test (HIGH)

**Description:** RetailCo has never conducted a PCI-scoped external or internal penetration test. The last security assessment of any type was a vulnerability scan in 2023.

---

## Prioritized Remediation Roadmap

```mermaid
gantt
    title PCI DSS Remediation Roadmap
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d

    section Critical — 30 Days
    Enable Database Audit Logging (Req 10)    :crit1, 2025-05-20, 15d
    Implement CDE MFA (Req 8)                 :crit2, 2025-05-20, 10d
    ASV External Scan (Req 11)                :crit3, 2025-05-25, 5d
    PAN Masking in Logs (Req 3)               :crit4, 2025-05-20, 7d

    section High — 60 Days
    Restrict Developer CDE Access (Req 7)      :high1, after crit1, 10d
    Implement CI/CD with SAST (Req 6)          :high2, 2025-05-25, 25d
    PCI Penetration Test (Req 11)              :high3, after crit3, 10d

    section Medium — 90 Days
    Network Segmentation Review (Req 1)        :med1, after high2, 20d
    File Integrity Monitoring (Req 11)         :med2, after high1, 15d
    Formal Change Management Process (Req 6)   :med3, after high2, 20d
```

---

## Recommendations for Achieving Compliance

### Immediate Actions (P0 — 30 days)

1. Schedule and complete ASV external scanning with a PCI-approved vendor
2. Enable PostgreSQL audit logging (`pgaudit`) and ship logs to SIEM
3. Deploy MFA for all CDE administrative access (SSH, database admin, AWS Console)
4. Implement PAN masking/truncation in all log sources
5. Begin PCI-scoped penetration test (external + internal)

### Short-Term Actions (P1 — 30–60 days)

6. Revoke developer production database access; implement masked view access
7. Implement CI/CD pipeline with mandatory code review, SAST, and approval gates
8. Implement file integrity monitoring (AIDE/Tripwire) on CDE systems
9. Conduct formal network segmentation testing between CDE and non-CDE zones
10. Deploy database activity monitoring (DAM) solution

### Medium-Term Actions (P2 — 60–90 days)

11. Formalize change management process with documented approvals
12. Implement quarterly internal vulnerability scanning with remediation tracking
13. Conduct tabletop exercise for security incident response
14. Train all CDE personnel on PCI DSS awareness and secure coding practices
15. Implement automated user access review process (quarterly)

### Long-Term Strategy (P3 — 90–180 days)

16. Deploy tokenization to eliminate PAN storage in CDE
17. Implement P2PE (Point-to-Point Encryption) for in-store POS terminals
18. Migrate to zero-trust architecture for CDE access
19. Achieve continuous compliance monitoring via CSPM tooling
20. Target formal PCI DSS ROC assessment by Q4 2025

---

## Compliance Score Projection

```mermaid
graph LR
    A[Current: 61%<br/>May 2025] -->|Remediate 30 days| B[Projected: 75%<br/>June 2025]
    B -->|Remediate 60 days| C[Projected: 88%<br/>July 2025]
    C -->|Remediate 90 days| D[Target: 95%+<br/>Aug 2025]
    D -->|ROC Assessment| E[Compliant:<br/>Q4 2025]

    style A fill:#ff4d4d,color:white
    style B fill:#ff9933,color:white
    style C fill:#ffcc00,color:black
    style D fill:#66cc66,color:white
    style E fill:#339933,color:white
```

---

## Appendices

- **Appendix A:** Full Control Assessment Matrix (282 controls) — `ASG-PCI-2025-0074-controls.xlsx`
- **Appendix B:** Evidence Collection Log
- **Appendix C:** Interview Log (28 personnel interviewed)
- **Appendix D:** Network Diagrams (Tier 1 — Confidential)
- **Appendix E:** ROC Template (pre-populated for Q4 2025 assessment)

---

<div align="center">

**CONFIDENTIAL**

**End of Report**

</div>
