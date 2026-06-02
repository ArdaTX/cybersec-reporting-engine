# CyberSec Reporting Engine — Deployment Guide

> **Version:** 1.0.0 · **Last Updated:** 2026-06-01

---

## Table of Contents

1. [Local Deployment](#1-local-deployment)
2. [Docker Deployment](#2-docker-deployment)
3. [CI/CD Integration](#3-cicd-integration)
4. [Enterprise Deployment Considerations](#4-enterprise-deployment-considerations)
5. [Security Hardening for Production](#5-security-hardening-for-production)
6. [Monitoring and Logging](#6-monitoring-and-logging)
7. [Backup and Recovery](#7-backup-and-recovery)

---

## 1. Local Deployment

### Quick Install

```bash
# Clone
git clone https://github.com/ArdaTX/Cybersec-Reporting-Engine.git
cd cybersec-reporting-engine

# Install
npm install
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Verify
npm test
node cli.js --version
```

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 2 cores | 4+ cores |
| **RAM** | 2 GB | 8 GB |
| **Disk** | 500 MB | 5 GB |
| **Node.js** | 18.0 | 20 LTS |
| **Python** | 3.10 | 3.12 |
| **Chromium** | Any recent | Latest stable |

### System-Level Dependencies

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
  nodejs npm \
  python3 python3-venv python3-pip \
  chromium-browser \
  fonts-liberation \
  libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
  libxdamage1 libxfixes3 libxrandr2 libgbm1 \
  libpango-1.0-0 libcairo2 libasound2

# macOS
brew install node python@3.12 chromium
```

---

## 2. Docker Deployment

### Dockerfile

```dockerfile
# Dockerfile
FROM node:20-slim

# Install system dependencies for Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    python3 \
    python3-venv \
    python3-pip \
    fonts-liberation \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
    libxdamage1 libxfixes3 libxrandr2 libgbm1 \
    libpango-1.0-0 libcairo2 libasound2 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Chromium path for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --production

# Copy Python requirements
COPY requirements.txt ./
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install -r requirements.txt

# Copy application code
COPY . .

# Create output directory
RUN mkdir -p /app/output && chmod 777 /app/output

# Set Python path
ENV PATH="/opt/venv/bin:$PATH"

# Run as non-root user
RUN useradd -m -u 1000 reporter && chown -R reporter:reporter /app
USER reporter

ENTRYPOINT ["node", "cli.js"]
CMD ["--help"]
```

### Build and Run

```bash
# Build the image
docker build -t cybersec-reporting-engine:latest .

# Run a report generation
docker run --rm \
  -v $(pwd)/findings:/app/findings:ro \
  -v $(pwd)/output:/app/output \
  cybersec-reporting-engine:latest \
  generate -i /app/findings/pentest.yaml -o /app/output

# Interactive shell
docker run --rm -it \
  -v $(pwd):/workspace \
  -w /workspace \
  cybersec-reporting-engine:latest \
  /bin/bash
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  reporting-engine:
    build: .
    volumes:
      - ./findings:/app/findings:ro
      - ./output:/app/output
      - ./templates:/app/templates
      - ./.cybersecrc.yaml:/app/.cybersecrc.yaml:ro
    environment:
      - NODE_ENV=production
      - PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
      - PUPPETEER_SKIP_DOWNLOAD=true
    command: ["serve", "-p", "3000", "-d", "/app/output"]
    ports:
      - "3000:3000"

  # Optional: API wrapper service
  api:
    build: .
    volumes:
      - ./findings:/app/findings:ro
      - ./output:/app/output
    environment:
      - NODE_ENV=production
      - API_PORT=8080
    ports:
      - "8080:8080"
```

---

## 3. CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/generate-report.yml
name: Generate Security Report

on:
  workflow_dispatch:
    inputs:
      findings_file:
        description: 'Path to findings YAML file'
        required: true
      report_format:
        description: 'Output formats'
        required: true
        default: 'md,html,pdf'
        type: choice
        options:
          - 'md,html,pdf'
          - 'md,html,pdf,docx'
      theme:
        description: 'Report theme'
        default: 'enterprise-dark'
        type: choice
        options:
          - enterprise-dark
          - enterprise-light
          - executive-blue
          - security-ops

jobs:
  generate-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: |
          npm ci
          pip install -r requirements.txt

      - name: Generate report
        run: |
          node cli.js generate \
            --input "${{ github.event.inputs.findings_file }}" \
            --output ./deliverables/ \
            --formats "${{ github.event.inputs.report_format }}" \
            --theme "${{ github.event.inputs.theme }}"

      - name: Upload report artifacts
        uses: actions/upload-artifact@v4
        with:
          name: security-report
          path: ./deliverables/
          retention-days: 30

      - name: Create release
        if: github.ref == 'refs/heads/main'
        uses: softprops/action-gh-release@v1
        with:
          tag_name: report-${{ github.run_id }}
          name: "Security Report — Run #${{ github.run_id }}"
          files: ./deliverables/report-package.zip
```

### GitLab CI Pipeline

```yaml
# .gitlab-ci.yml
generate-report:
  stage: build
  image: node:20
  before_script:
    - apt-get update && apt-get install -y chromium-browser python3 python3-pip
    - npm ci
    - pip install -r requirements.txt
    - export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
    - export PUPPETEER_SKIP_DOWNLOAD=true
  script:
    - node cli.js generate -i findings/assessment.yaml -o ./output -f md,html,pdf --theme enterprise-dark
  artifacts:
    paths:
      - ./output/
    expire_in: 30 days
  only:
    - main
    - tags
```

### Triggering from Other Pipelines

```bash
# Call from any CI system
npx cybersec-report generate \
  --input "$FINDINGS_FILE" \
  --output "$ARTIFACT_DIR" \
  --formats "md,html,pdf" \
  --theme "enterprise-dark"
```

---

## 4. Enterprise Deployment Considerations

### High Availability

For enterprise environments requiring high availability:

```
┌─────────────────────────────────────────────────────┐
│                   Load Balancer                       │
│                  (HAProxy / Nginx)                    │
└─────────┬───────────────────────────┬───────────────┘
          │                           │
┌─────────▼─────────┐     ┌──────────▼──────────┐
│  Engine Instance 1 │     │  Engine Instance 2   │
│  (Node.js Worker)  │     │  (Node.js Worker)    │
└─────────┬─────────┘     └──────────┬──────────┘
          │                           │
┌─────────▼───────────────────────────▼───────────────┐
│              Shared Output Storage                    │
│           (NFS / S3 / Azure Blob)                    │
└─────────────────────────────────────────────────────┘
```

### Resource Allocation

| Deployment Size | Instances | CPU/Instance | RAM/Instance | Disk |
|----------------|-----------|-------------|--------------|------|
| **Small** (< 50 reports/day) | 1 | 2 vCPU | 4 GB | 20 GB |
| **Medium** (50-200 reports/day) | 2 | 4 vCPU | 8 GB | 100 GB |
| **Large** (200-1000 reports/day) | 4+ | 8 vCPU | 16 GB | 500 GB |

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cybersec-reporting-engine
spec:
  replicas: 2
  selector:
    matchLabels:
      app: reporting-engine
  template:
    metadata:
      labels:
        app: reporting-engine
    spec:
      containers:
      - name: engine
        image: cybersec-reporting-engine:latest
        resources:
          requests:
            memory: "2Gi"
            cpu: "1"
          limits:
            memory: "8Gi"
            cpu: "4"
        env:
        - name: NODE_ENV
          value: "production"
        - name: PUPPETEER_EXECUTABLE_PATH
          value: "/usr/bin/chromium"
        volumeMounts:
        - name: output
          mountPath: /app/output
        - name: config
          mountPath: /app/.cybersecrc.yaml
          subPath: .cybersecrc.yaml
      volumes:
      - name: output
        persistentVolumeClaim:
          claimName: reporting-output-pvc
      - name: config
        configMap:
          name: reporting-config
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: reporting-output-pvc
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 100Gi
```

---

## 5. Security Hardening for Production

### Environment Variables

```bash
# Production security settings
export NODE_ENV=production
export CYBERSEC_REPORT_DIR=/secure/output
export CYBERSEC_TMP_DIR=/secure/tmp
export CYBERSEC_MAX_FILE_SIZE=52428800    # 50MB max input
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
export PUPPETEER_SKIP_DOWNLOAD=true

# Disable debug features
export CYBERSEC_DEV_MODE=false
export CYBERSEC_LOG_LEVEL=warn
```

### Puppeteer Sandbox

In production containers, configure Puppeteer with appropriate sandbox settings. The engine uses `--no-sandbox` by default for container compatibility. For hardened environments, ensure proper seccomp profiles are configured.

### File System Security

```bash
# Secure output directory
mkdir -p /secure/output
chmod 750 /secure/output
chown reporter:reporter /secure/output

# Secure temp directory
mkdir -p /secure/tmp
chmod 700 /secure/tmp
```

### Input Validation

- All input files validated against JSON Schema before processing
- File sizes limited (configurable via `CYBERSEC_MAX_FILE_SIZE`)
- Path traversal prevented in file operations
- YAML parsing uses safe loaders only

### Network Security

- No outbound network calls during report generation (fully offline)
- Optional CVE enrichment extensions explicitly disabled by default
- Serve command binds to localhost only by default

### Dependency Audit

```bash
# Regular dependency auditing
npm audit
pip-audit  # Python dependency audit
```

---

## 6. Monitoring and Logging

### Log Levels

```bash
# Control logging verbosity
export CYBERSEC_LOG_LEVEL=error   # Production: errors only
export CYBERSEC_LOG_LEVEL=warn    # Staging: warnings + errors
export CYBERSEC_LOG_LEVEL=info    # Development: all messages
export CYBERSEC_LOG_LEVEL=debug   # Debugging: verbose output
```

### Progress Monitoring

The orchestrator emits structured progress events:

```javascript
// stage: 'markdown' | 'html' | 'pdf' | 'docx' | 'package' | 'overall'
// current: step number
// total: total steps
// detail: human-readable status string
{ stage: 'pdf', current: 1, total: 4, detail: 'Generating PDF...' }
```

### Health Check

```bash
# Basic health check
node cli.js --version

# Full health check (generates test report)
node cli.js init -d /tmp/health-check
node cli.js generate -i /tmp/health-check/findings/sample-findings.yaml -o /tmp/health-check/output
# Check exit code: 0 = healthy
```

### Metrics to Monitor

| Metric | Description | Alert Threshold |
|--------|-------------|----------------|
| Generation duration | Time to complete full pipeline | > 60 seconds |
| Failure rate | % of failed generations | > 5% |
| Disk usage | Output directory size | > 80% capacity |
| Memory usage | RSS of Node.js process | > 4 GB |
| DOCX subprocess failures | Python process errors | > 0 |

### Integration with Monitoring Tools

```javascript
// Example: Datadog custom metrics
orchestrator.on('progress', ({ stage, current, total, detail }) => {
  if (stage === 'overall' && current === total) {
    statsd.increment('report.generation.complete');
  }
});

orchestrator.on('error', ({ stage, error }) => {
  statsd.increment('report.generation.error', { stage });
});
```

---

## 7. Backup and Recovery

### What to Back Up

| Data | Location | Frequency | Retention |
|------|----------|-----------|-----------|
| **Findings data** | `findings/` | After each engagement | Indefinite |
| **Configuration** | `.cybersecrc.yaml` | On change | All versions |
| **Custom templates** | `templates/` | On change | All versions |
| **Custom themes** | `branding/themes/` | On change | All versions |
| **Custom skills** | `skills/` | On change | All versions |
| **Generated reports** | `output/` | Per generation | 90 days (configurable) |

### Backup Script

```bash
#!/bin/bash
# backup.sh — CyberSec Reporting Engine backup script

BACKUP_DIR="/backups/cybersec-reporting"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/cybersec-backup-${TIMESTAMP}.tar.gz"

mkdir -p "$BACKUP_DIR"

tar -czf "$BACKUP_FILE" \
  --exclude="node_modules" \
  --exclude=".venv" \
  --exclude="output/*.zip" \
  findings/ \
  templates/ \
  branding/ \
  skills/ \
  .cybersecrc.yaml \
  package.json

echo "Backup created: $BACKUP_FILE"

# Retain last 30 backups
ls -1t "${BACKUP_DIR}"/cybersec-backup-*.tar.gz | tail -n +31 | xargs rm -f
```

### Recovery Procedure

```bash
#!/bin/bash
# recover.sh — CyberSec Reporting Engine recovery script

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./recover.sh <backup-file.tar.gz>"
  exit 1
fi

# Extract backup
tar -xzf "$BACKUP_FILE"

# Reinstall dependencies
npm install
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Verify
npm test
echo "Recovery complete. Run: node cli.js generate -i findings/findings.yaml"
```

### Disaster Recovery Plan

1. **Restore** from latest backup using recovery script
2. **Reinstall** dependencies (`npm install && pip install -r requirements.txt`)
3. **Verify** with `npm test`
4. **Smoke test** generation with sample data
5. **Restore** output reports from secondary storage if needed

### Immutable Output Storage

For production deployments, store generated reports in immutable storage:

```bash
# AWS S3 with Object Lock (Write Once Read Many)
aws s3 cp ./output/ s3://reports-bucket/engagements/2026/ \
  --recursive \
  --storage-class STANDARD

# With retention policy
aws s3api put-object-retention \
  --bucket reports-bucket \
  --key engagements/2026/report.pdf \
  --retention '{"Mode":"GOVERNANCE","RetainUntilDate":"2031-06-01T00:00:00Z"}'
```

---

## Appendix: Full Docker Compose Production Stack

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  reporting-engine:
    build:
      context: .
      dockerfile: Dockerfile
    image: cybersec-reporting-engine:${VERSION:-latest}
    restart: unless-stopped
    volumes:
      - findings_data:/app/findings:ro
      - output_data:/app/output
      - template_data:/app/templates:ro
      - ./config/production.yaml:/app/.cybersecrc.yaml:ro
    environment:
      - NODE_ENV=production
      - PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
      - PUPPETEER_SKIP_DOWNLOAD=true
      - CYBERSEC_LOG_LEVEL=warn
      - CYBERSEC_MAX_FILE_SIZE=104857600
    healthcheck:
      test: ["CMD", "node", "cli.js", "--version"]
      interval: 30s
      timeout: 5s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
        reservations:
          cpus: '1'
          memory: 2G
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  report-viewer:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - output_data:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - reporting-engine

volumes:
  findings_data:
    driver: local
  output_data:
    driver: local
  template_data:
    driver: local
```
