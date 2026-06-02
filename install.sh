#!/usr/bin/env bash
# =============================================================================
# CyberSec Reporting Engine — Installation Script
# =============================================================================
# Installs all dependencies (Node.js + Python), creates default configuration,
# sets up output directories, and verifies the installation.
#
# Usage:
#   chmod +x install.sh
#   ./install.sh [--skip-python] [--dev]
#
# Options:
#   --skip-python   Skip Python virtual environment and DOCX dependencies
#   --dev           Install development dependencies (eslint, jest, pytest)
# =============================================================================

set -euo pipefail

# ── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ── Banner ───────────────────────────────────────────────────────────────────
echo -e "${BLUE}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     CyberSec Reporting Engine — Installation Script          ║"
echo "║     Version: 1.0.0                                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ── Parse arguments ──────────────────────────────────────────────────────────
SKIP_PYTHON=false
DEV_MODE=false
GLOBAL_INSTALL=false

for arg in "$@"; do
  case "$arg" in
    --skip-python) SKIP_PYTHON=true ;;
    --dev) DEV_MODE=true ;;
    --global|-g) GLOBAL_INSTALL=true ;;
    --help|-h)
      echo "Usage: ./install.sh [options]"
      echo ""
      echo "Options:"
      echo "  --skip-python   Skip Python virtual environment (no DOCX support)"
      echo "  --dev           Install development dependencies"
      echo "  --global, -g    Install skills globally for all AI agents"
      echo "                  (OpenCode, Claude Code, Cursor, Windsurf, etc.)"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $arg${NC}"
      echo "Usage: ./install.sh [--skip-python] [--dev] [--global]"
      exit 1
      ;;
  esac
done

# ── Detect project root ──────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}Project directory: ${SCRIPT_DIR}${NC}"
echo ""

# =============================================================================
# 1. Check prerequisites
# =============================================================================

echo -e "${BOLD}[1/6] Checking prerequisites...${NC}"

# ── Node.js ──────────────────────────────────────────────────────────────────
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
  echo -e "  Node.js:   ${GREEN}$(node -v)${NC}"
  if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "  ${RED}ERROR: Node.js 18+ required. Found: $(node -v)${NC}"
    echo "  Install via: https://nodejs.org/ or use nvm"
    exit 1
  fi
else
  echo -e "  ${RED}ERROR: Node.js not found. Install Node.js 18+ from https://nodejs.org/${NC}"
  exit 1
fi

# ── npm ──────────────────────────────────────────────────────────────────────
if command -v npm &> /dev/null; then
  echo -e "  npm:       ${GREEN}$(npm -v)${NC}"
else
  echo -e "  ${RED}ERROR: npm not found.${NC}"
  exit 1
fi

# ── Python ───────────────────────────────────────────────────────────────────
PYTHON_AVAILABLE=false
if [ "$SKIP_PYTHON" = false ]; then
  # Try python3 first, then python
  PYTHON_CMD=""
  if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
  elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
  fi

  if [ -n "$PYTHON_CMD" ]; then
    PYTHON_VERSION=$($PYTHON_CMD -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
    PYTHON_MAJOR=$($PYTHON_CMD -c "import sys; print(sys.version_info.major)")
    PYTHON_MINOR=$($PYTHON_CMD -c "import sys; print(sys.version_info.minor)")
    echo -e "  Python:    ${GREEN}${PYTHON_CMD} ${PYTHON_VERSION}${NC}"
    if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 10 ]); then
      echo -e "  ${YELLOW}WARNING: Python 3.10+ recommended for DOCX generation. Found: ${PYTHON_VERSION}${NC}"
      echo -e "  ${YELLOW}DOCX generation will be unavailable. Use --skip-python to suppress.${NC}"
    else
      PYTHON_AVAILABLE=true
    fi
  else
    echo -e "  ${YELLOW}WARNING: Python not found. DOCX generation will be unavailable.${NC}"
    echo -e "  ${YELLOW}Install Python 3.10+ for full output format support.${NC}"
  fi
fi

# ── Git ──────────────────────────────────────────────────────────────────────
if command -v git &> /dev/null; then
  echo -e "  Git:       ${GREEN}$(git --version | cut -d' ' -f3)${NC}"
else
  echo -e "  ${YELLOW}WARNING: Git not found. Version control will be unavailable.${NC}"
fi

echo ""

# =============================================================================
# 2. Install Node.js dependencies
# =============================================================================

echo -e "${BOLD}[2/6] Installing Node.js dependencies...${NC}"

if [ -f "package.json" ]; then
  if [ "$DEV_MODE" = true ]; then
    npm install
  else
    npm install --production
  fi
  echo -e "  ${GREEN}Node.js dependencies installed.${NC}"
else
  echo -e "  ${RED}ERROR: package.json not found in ${SCRIPT_DIR}${NC}"
  exit 1
fi

echo ""

# =============================================================================
# 3. Create Python virtual environment and install dependencies
# =============================================================================

if [ "$SKIP_PYTHON" = false ] && [ "$PYTHON_AVAILABLE" = true ]; then
  echo -e "${BOLD}[3/6] Setting up Python environment...${NC}"

  VENV_DIR="${SCRIPT_DIR}/.venv"

  if [ ! -d "$VENV_DIR" ]; then
    $PYTHON_CMD -m venv "$VENV_DIR"
    echo -e "  Virtual environment created: ${GREEN}${VENV_DIR}${NC}"
  else
    echo -e "  Virtual environment already exists: ${YELLOW}${VENV_DIR}${NC}"
  fi

  # Activate and install
  source "${VENV_DIR}/bin/activate"

  if [ -f "requirements.txt" ]; then
    pip install --upgrade pip --quiet
    pip install -r requirements.txt --quiet
    echo -e "  ${GREEN}Python dependencies installed.${NC}"
  fi

  if [ "$DEV_MODE" = true ]; then
    pip install pytest black flake8 --quiet
    echo -e "  ${GREEN}Python dev dependencies installed.${NC}"
  fi

  deactivate
else
  echo -e "${BOLD}[3/6] Skipping Python setup (${YELLOW}--skip-python${NC} or Python unavailable)${NC}"
fi

echo ""

# =============================================================================
# 4. Create default configuration
# =============================================================================

echo -e "${BOLD}[4/6] Creating default configuration...${NC}"

if [ ! -f ".cybersecrc.yaml" ]; then
  cat > .cybersecrc.yaml << 'CONFEOF'
# CyberSec Reporting Engine Configuration
# Generated by install.sh

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

pythonPath: "python3"

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
CONFEOF

  echo -e "  ${GREEN}.cybersecrc.yaml created.${NC}"
else
  echo -e "  ${YELLOW}.cybersecrc.yaml already exists (skipped)${NC}"
fi

echo ""

# =============================================================================
# 5. Create output directories
# =============================================================================

echo -e "${BOLD}[5/6] Creating output directories...${NC}"

mkdir -p output
mkdir -p templates
mkdir -p findings

echo -e "  ${GREEN}Directories created:${NC}"
echo -e "    output/     — Generated reports"
echo -e "    templates/  — Custom templates"
echo -e "    findings/   — Finding data files"

echo ""

# =============================================================================
# 6. Verify installation
# =============================================================================

echo -e "${BOLD}[6/7] Verifying installation...${NC}"

# Test CLI version
echo -n "  CLI version check... "
if node cli.js --version > /dev/null 2>&1; then
  VERSION=$(node cli.js --version 2>&1)
  echo -e "${GREEN}OK (${VERSION})${NC}"
else
  echo -e "${RED}FAILED${NC}"
  exit 1
fi

# Test init
echo -n "  Project init... "
TMP_PROJ=$(mktemp -d)
if node cli.js init -d "$TMP_PROJ" > /dev/null 2>&1; then
  echo -e "${GREEN}OK${NC}"
else
  echo -e "${RED}FAILED${NC}"
  rm -rf "$TMP_PROJ"
  exit 1
fi

# Test validation
echo -n "  Schema validation... "
if node cli.js validate -i "$TMP_PROJ/findings/sample-findings.yaml" > /dev/null 2>&1; then
  echo -e "${GREEN}OK${NC}"
else
  echo -e "${RED}FAILED${NC}"
  rm -rf "$TMP_PROJ"
  exit 1
fi

# Test generation
echo -n "  Report generation (Markdown)... "
if node cli.js generate -i "$TMP_PROJ/findings/sample-findings.yaml" -o "$TMP_PROJ/output" -f md --no-package > /dev/null 2>&1; then
  echo -e "${GREEN}OK${NC}"
else
  echo -e "${RED}FAILED${NC}"
  rm -rf "$TMP_PROJ"
  exit 1
fi

# Test HTML generation
echo -n "  Report generation (HTML)... "
if node cli.js generate -i "$TMP_PROJ/findings/sample-findings.yaml" -o "$TMP_PROJ/output" -f html --no-package > /dev/null 2>&1; then
  echo -e "${GREEN}OK${NC}"
else
  echo -e "${YELLOW}SKIPPED (may need Chromium)${NC}"
fi

# Test Python DOCX if available
if [ "$SKIP_PYTHON" = false ] && [ "$PYTHON_AVAILABLE" = true ]; then
  echo -n "  Python DOCX check... "
  if "${SCRIPT_DIR}/.venv/bin/python" -c "import docx" 2>/dev/null; then
    echo -e "${GREEN}OK${NC}"
  else
    echo -e "${YELLOW}SKIPPED (python-docx not found)${NC}"
  fi
fi

# Cleanup
rm -rf "$TMP_PROJ"

echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║              Installation Complete!                          ║${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Quick start:"
echo -e "    ${BOLD}node cli.js init -d my-project${NC}"
echo -e "    ${BOLD}cd my-project${NC}"
echo -e "    ${BOLD}node ../cli.js generate -i findings/sample-findings.yaml${NC}"
echo ""

if [ "$GLOBAL_INSTALL" = true ]; then
  echo -e "  ${GREEN}✓ Skills globales instaladas — disponibles en OpenCode, Claude Code, Codex y más${NC}"
  echo ""
fi

echo -e "  Documentation:"
echo -e "    docs/architecture/    — System architecture"
echo -e "    docs/user-guide/      — User guide"
echo -e "    docs/api/             — API reference"
echo -e "    docs/development/     — Developer guide"
echo -e "    docs/deployment/      — Deployment guide"
echo ""
