#!/usr/bin/env bash
# ==============================================================================
# SpiceGarden 500K Physical Benchmark Master Runner (Linux / Bash)
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_URL="${TARGET_URL:-http://localhost:3001}"
LIVE_AWS="${LIVE_AWS:-false}"

echo "================================================================="
echo "  SpiceGarden 500K Physical Benchmark Master Automation (Bash)   "
echo "================================================================="

# 1. Linux Kernel Tuning
echo ""
echo "[Step 1/6] Running Linux Kernel & Socket Tuning..."
bash "${SCRIPT_DIR}/tune-local-os-network.sh" || true

# 2. Capacity Model Validation
echo ""
echo "[Step 2/6] Validating 500K Analytical Capacity Model..."
node "${SCRIPT_DIR}/validate-500k-capacity-model.js"

# 3. Master 500K Benchmark Execution
echo ""
echo "[Step 3/6] Executing Master 500K Benchmark..."
node "${SCRIPT_DIR}/run-500k-physical-benchmark.js"

# 4. Dual-Run Reproduction Suite
echo ""
echo "[Step 4/6] Executing 500K Reproduction Parity Suite..."
node "${SCRIPT_DIR}/run-500k-reproduction-suite.js"

# 5. Cloud Chaos Matrix
echo ""
echo "[Step 5/6] Executing Cloud Chaos Matrix Experiments..."
node "${SCRIPT_DIR}/run-500k-cloud-chaos-matrix.js"

# 6. Disaster Recovery Drill
echo ""
echo "[Step 6/6] Executing Multi-Region Disaster Recovery Drill..."
node "${SCRIPT_DIR}/run-500k-dr-drill.js"

echo ""
echo "================================================================="
echo "  All 500K Benchmarks and Validation Drills Completed!           "
echo "================================================================="
