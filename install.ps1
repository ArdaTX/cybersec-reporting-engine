<#
.SYNOPSIS
    CyberSec Reporting Engine — Windows Installation Script
.DESCRIPTION
    Installs all dependencies (Node.js + Python), creates default configuration,
    sets up output directories, and verifies the installation on Windows.
.PARAMETER SkipPython
    Skip Python virtual environment and DOCX dependencies
.PARAMETER Dev
    Install development dependencies (eslint, jest, pytest)
.PARAMETER Global
    Install skills globally for all AI agents
.EXAMPLE
    .\install.ps1
.EXAMPLE
    .\install.ps1 -SkipPython
.EXAMPLE
    .\install.ps1 -Dev
.EXAMPLE
    .\install.ps1 -Global
#>

param(
    [switch]$SkipPython,
    [switch]$Dev,
    [switch]$Global,
    [switch]$Help
)

# ── Help ──────────────────────────────────────────────────────────────────────
if ($Help) {
    Write-Host "Usage: .\install.ps1 [options]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -SkipPython   Skip Python virtual environment (no DOCX support)"
    Write-Host "  -Dev          Install development dependencies"
    Write-Host "  -Global       Install skills globally for all AI agents"
    exit 0
}

# ── Banner ────────────────────────────────────────────────────────────────────
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║     CyberSec Reporting Engine — Windows Installation        ║" -ForegroundColor Blue
Write-Host "║     Version: 1.0.0                                          ║" -ForegroundColor Blue
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# ── Detect project root ───────────────────────────────────────────────────────
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir
Write-Host "Project directory: $ScriptDir" -ForegroundColor Blue
Write-Host ""

# =============================================================================
# 1. Check prerequisites
# =============================================================================
Write-Host "[1/6] Checking prerequisites..." -ForegroundColor White

# ── Node.js ───────────────────────────────────────────────────────────────────
try {
    $nodeVersion = node -v 2>$null
    if ($nodeVersion) {
        $nodeMajor = [int]($nodeVersion -replace '[vV]','' -replace '\..*','')
        Write-Host "  Node.js:   $nodeVersion" -ForegroundColor Green
        if ($nodeMajor -lt 18) {
            Write-Host "  ERROR: Node.js 18+ required. Found: $nodeVersion" -ForegroundColor Red
            Write-Host "  Install from: https://nodejs.org/"
            exit 1
        }
    } else {
        throw "not found"
    }
} catch {
    Write-Host "  ERROR: Node.js not found. Install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# ── npm ───────────────────────────────────────────────────────────────────────
try {
    $npmVersion = npm -v 2>$null
    if ($npmVersion) {
        Write-Host "  npm:       $npmVersion" -ForegroundColor Green
    } else {
        throw "not found"
    }
} catch {
    Write-Host "  ERROR: npm not found." -ForegroundColor Red
    exit 1
}

# ── Python ────────────────────────────────────────────────────────────────────
$PythonAvailable = $false
$PythonCmd = $null
if (-not $SkipPython) {
    # Try python first, then python3
    try {
        $pyVer = & python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>$null
        if ($pyVer) {
            $PythonCmd = "python"
            $pyMajor = [int]($pyVer -split '\.')[0]
            $pyMinor = [int]($pyVer -split '\.')[1]
            Write-Host "  Python:    python $pyVer" -ForegroundColor Green
            if ($pyMajor -ge 3 -and $pyMinor -ge 10) {
                $PythonAvailable = $true
            } else {
                Write-Host "  WARNING: Python 3.10+ recommended for DOCX. Found: $pyVer" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "  WARNING: Python not found. DOCX generation unavailable." -ForegroundColor Yellow
        Write-Host "  Install Python 3.10+ from https://www.python.org/downloads/" -ForegroundColor Yellow
    }
}

# ── Git ───────────────────────────────────────────────────────────────────────
try {
    $gitVer = git --version 2>$null
    if ($gitVer) {
        Write-Host "  Git:       $gitVer" -ForegroundColor Green
    }
} catch {
    Write-Host "  WARNING: Git not found. Version control unavailable." -ForegroundColor Yellow
}

Write-Host ""

# =============================================================================
# 2. Install Node.js dependencies
# =============================================================================
Write-Host "[2/6] Installing Node.js dependencies..." -ForegroundColor White

if (Test-Path "package.json") {
    if ($Dev) {
        npm install
    } else {
        npm install --production
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR: npm install failed." -ForegroundColor Red
        exit 1
    }
    Write-Host "  Node.js dependencies installed." -ForegroundColor Green
} else {
    Write-Host "  ERROR: package.json not found in $ScriptDir" -ForegroundColor Red
    exit 1
}

Write-Host ""

# =============================================================================
# 3. Create Python virtual environment and install dependencies
# =============================================================================
if (-not $SkipPython -and $PythonAvailable) {
    Write-Host "[3/6] Setting up Python environment..." -ForegroundColor White

    $VenvDir = Join-Path $ScriptDir ".venv"

    if (-not (Test-Path $VenvDir)) {
        & $PythonCmd -m venv $VenvDir
        Write-Host "  Virtual environment created: $VenvDir" -ForegroundColor Green
    } else {
        Write-Host "  Virtual environment already exists: $VenvDir" -ForegroundColor Yellow
    }

    # Activate and install
    $ActivateScript = Join-Path $VenvDir "Scripts\Activate.ps1"
    . $ActivateScript

    if (Test-Path "requirements.txt") {
        python -m pip install --upgrade pip --quiet
        python -m pip install -r requirements.txt --quiet
        Write-Host "  Python dependencies installed." -ForegroundColor Green
    }

    if ($Dev) {
        python -m pip install pytest black flake8 --quiet
        Write-Host "  Python dev dependencies installed." -ForegroundColor Green
    }

    deactivate
} else {
    Write-Host "[3/6] Skipping Python setup (use -SkipPython or Python unavailable)" -ForegroundColor Yellow
}

Write-Host ""

# =============================================================================
# 4. Create default configuration
# =============================================================================
Write-Host "[4/6] Creating default configuration..." -ForegroundColor White

if (-not (Test-Path ".cybersecrc.yaml")) {
    @"
# CyberSec Reporting Engine Configuration
# Generated by install.ps1

metadata:
  author: "Security Assessment Team"
  classification: "CONFIDENTIAL"

output:
  formats:
    - md
    - html
    - pdf
  directory: "./output"
  createPackage: true
  theme: default
  pageSize: a4

markdown:
  templateDir: "./templates"

html:
  theme: default
  interactive: true
  showKpiWidgets: true

pdf:
  pageSize: a4
  landscape: false
  displayHeaderFooter: true
  outline: true

docx:
  fontBody: "Calibri"
  fontHeading: "Calibri Light"
  pageMarginCm: 2.54
  coverPage: true
  tableOfContents: true

pythonPath: "python"

severity:
  critical:
    label: "CRITICAL"
    color: "#DC2626"
    priority: 1
  high:
    label: "HIGH"
    color: "#EA580C"
    priority: 2
  medium:
    label: "MEDIUM"
    color: "#CA8A04"
    priority: 3
  low:
    label: "LOW"
    color: "#16A34A"
    priority: 4
  info:
    label: "INFO"
    color: "#2563EB"
    priority: 5

variables:
  companyName: "CyberSec Inc."
  reportType: "Security Assessment"
"@ | Out-File -FilePath ".cybersecrc.yaml" -Encoding utf8

    Write-Host "  .cybersecrc.yaml created." -ForegroundColor Green
} else {
    Write-Host "  .cybersecrc.yaml already exists (skipped)" -ForegroundColor Yellow
}

Write-Host ""

# =============================================================================
# 5. Create output directories
# =============================================================================
Write-Host "[5/6] Creating output directories..." -ForegroundColor White

New-Item -ItemType Directory -Force -Path "output" | Out-Null
New-Item -ItemType Directory -Force -Path "templates" | Out-Null
New-Item -ItemType Directory -Force -Path "findings" | Out-Null

Write-Host "  Directories created:" -ForegroundColor Green
Write-Host "    output/     - Generated reports"
Write-Host "    templates/  - Custom templates"
Write-Host "    findings/   - Finding data files"

Write-Host ""

# =============================================================================
# 6. Verify installation
# =============================================================================
Write-Host "[6/6] Verifying installation..." -ForegroundColor White

# Test CLI version
Write-Host -NoNewline "  CLI version check... "
try {
    $version = & node cli.js --version 2>&1
    Write-Host "OK ($version)" -ForegroundColor Green
} catch {
    Write-Host "FAILED" -ForegroundColor Red
    exit 1
}

# Test init
Write-Host -NoNewline "  Project init... "
$tmpProj = Join-Path $env:TEMP "cybersec-test-$(Get-Random)"
try {
    $null = & node cli.js init -d $tmpProj 2>&1
    Write-Host "OK" -ForegroundColor Green
} catch {
    Write-Host "FAILED" -ForegroundColor Red
    if (Test-Path $tmpProj) { Remove-Item -Recurse -Force $tmpProj }
    exit 1
}

# Test validation
Write-Host -NoNewline "  Schema validation... "
$sampleFindings = Join-Path $tmpProj "findings/sample-findings.yaml"
try {
    $null = & node cli.js validate -i $sampleFindings 2>&1
    Write-Host "OK" -ForegroundColor Green
} catch {
    Write-Host "FAILED" -ForegroundColor Red
    if (Test-Path $tmpProj) { Remove-Item -Recurse -Force $tmpProj }
    exit 1
}

# Test generation (Markdown)
Write-Host -NoNewline "  Report generation (Markdown)... "
try {
    $null = & node cli.js generate -i $sampleFindings -o "$tmpProj/output" -f md --no-package 2>&1
    Write-Host "OK" -ForegroundColor Green
} catch {
    Write-Host "FAILED" -ForegroundColor Red
    if (Test-Path $tmpProj) { Remove-Item -Recurse -Force $tmpProj }
    exit 1
}

# Test HTML generation
Write-Host -NoNewline "  Report generation (HTML)... "
try {
    $null = & node cli.js generate -i $sampleFindings -o "$tmpProj/output" -f html --no-package 2>&1
    Write-Host "OK" -ForegroundColor Green
} catch {
    Write-Host "SKIPPED (may need Chromium)" -ForegroundColor Yellow
}

# Cleanup
if (Test-Path $tmpProj) { Remove-Item -Recurse -Force $tmpProj }

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              Installation Complete!                          ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  Quick start:" -ForegroundColor White
Write-Host "    node cli.js init -d my-project"
Write-Host "    cd my-project"
Write-Host "    node ..\cli.js generate -i findings\sample-findings.yaml"
Write-Host ""

if ($Global) {
    Write-Host "  Skills installed — available in OpenCode, Claude Code, Codex and more" -ForegroundColor Green
    Write-Host ""
}

Write-Host "  Documentation:"
Write-Host "    docs/architecture/    - System architecture"
Write-Host "    docs/user-guide/      - User guide"
Write-Host "    docs/api/             - API reference"
Write-Host "    docs/development/     - Developer guide"
Write-Host "    docs/deployment/      - Deployment guide"
Write-Host ""
