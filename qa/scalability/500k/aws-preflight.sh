#!/usr/bin/env bash
# ==============================================================================
# SpiceGarden AWS 500K Deployment Pre-Flight Gate (Linux / Bash)
# ==============================================================================

set -uo pipefail

echo "================================================================="
echo "  SpiceGarden AWS 500K Deployment Pre-Flight Gate (Bash)         "
echo "================================================================="

PREFLIGHT_PASSED=true
BLOCKERS=()

# 1. AWS CLI Check
echo ""
echo "[1/7] Checking AWS CLI installation..."
if ! command -v aws >/dev/null 2>&1; then
    echo "  [FAIL] AWS CLI is not installed or not in PATH."
    BLOCKERS+=("AWS CLI binary not found in PATH")
    PREFLIGHT_PASSED=false
else
    echo "  [OK] AWS CLI binary found: $(which aws)"
fi

# 2. STS Identity & Active Credentials Check
echo ""
echo "[2/7] Checking AWS STS Identity & Active Credentials..."
if command -v aws >/dev/null 2>&1; then
    if aws sts get-caller-identity >/dev/null 2>&1; then
        IDENTITY=$(aws sts get-caller-identity --output json)
        echo "  [OK] Active AWS Identity verified: ${IDENTITY}"
    else
        echo "  [FAIL] AWS credentials not configured or expired."
        BLOCKERS+=("AWS STS authentication failed (no valid access keys / role)")
        PREFLIGHT_PASSED=false
    fi
else
    echo "  [SKIPPED] Cannot verify STS without AWS CLI."
fi

# 3. Target Region Configuration
echo ""
echo "[3/7] Checking AWS Target Region..."
REGION="${AWS_DEFAULT_REGION:-us-east-1}"
echo "  [INFO] Target Region: ${REGION}"

# 4. Terraform Binary Check
echo ""
echo "[4/7] Checking Terraform CLI installation..."
if ! command -v terraform >/dev/null 2>&1; then
    echo "  [FAIL] Terraform binary not found in PATH."
    BLOCKERS+=("Terraform binary not found")
    PREFLIGHT_PASSED=false
else
    echo "  [OK] Terraform binary found: $(which terraform)"
fi

# 5. kubectl Binary Check
echo ""
echo "[5/7] Checking kubectl CLI installation..."
if ! command -v kubectl >/dev/null 2>&1; then
    echo "  [WARN] kubectl binary not found in PATH."
else
    echo "  [OK] kubectl binary found: $(which kubectl)"
fi

# 6. k6 Binary Check
echo ""
echo "[6/7] Checking k6 load generator toolchain..."
if ! command -v k6 >/dev/null 2>&1; then
    echo "  [WARN] k6 binary not found locally (Generator fleet will run k6 on EC2 Linux nodes)."
else
    echo "  [OK] k6 binary found locally: $(which k6)"
fi

# 7. Verdict
echo ""
echo "================================================================="
if [ "$PREFLIGHT_PASSED" = true ]; then
    echo "  PRE-FLIGHT VERDICT: AWS_PREFLIGHT_PASS                         "
    echo "  Cloud infrastructure provisioning and 500K load test may proceed."
    echo "================================================================="
    exit 0
else
    echo "  PRE-FLIGHT VERDICT: AWS_PREFLIGHT_BLOCKED                      "
    echo "  Blockers identified:"
    for b in "${BLOCKERS[@]}"; do
        echo "    - $b"
    done
    echo "================================================================="
    exit 1
fi
