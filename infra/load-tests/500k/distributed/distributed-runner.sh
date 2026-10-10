#!/usr/bin/env bash
# infra/load-tests/500k/distributed/distributed-runner.sh
# Orchestrates 500,000 VU load test across distributed Linux EC2 generator fleet

set -euo pipefail

TARGET_HOST="${1:-http://localhost:3001}"
WS_TARGET="${2:-ws://localhost:3001}"
TOTAL_VUS="${3:-500000}"
GENERATOR_COUNT="${4:-25}"

VUS_PER_GENERATOR=$((TOTAL_VUS / GENERATOR_COUNT))

echo "=========================================================="
echo " [SpiceGarden] Distributed 500K k6 Load Test Launcher"
echo "=========================================================="
echo " Target Host:           ${TARGET_HOST}"
echo " WebSocket Target:      ${WS_TARGET}"
echo " Total Target VUs:      ${TOTAL_VUS}"
echo " Generator Nodes:       ${GENERATOR_COUNT}"
echo " VUs Per Generator:     ${VUS_PER_GENERATOR}"
echo "=========================================================="

GENERATOR_IPS_FILE="infra/load-tests/500k/distributed/generator-ips.txt"

if [[ ! -f "${GENERATOR_IPS_FILE}" ]]; then
    echo "Notice: ${GENERATOR_IPS_FILE} not found. Running in standalone / single-node mode."
    echo "Executing k6 with TARGET_VUS=${TOTAL_VUS}..."
    TARGET_VUS="${TOTAL_VUS}" BASE_URL="${TARGET_HOST}" WS_URL="${WS_TARGET}" k6 run infra/load-tests/500k/main.js
    exit 0
fi

echo "--> Dispatching test execution across ${GENERATOR_COUNT} Linux generator instances..."
INDEX=0
while IFS= read -r IP || [[ -n "$IP" ]]; do
    [[ -z "$IP" || "$IP" =~ ^# ]] && continue
    INDEX=$((INDEX + 1))
    echo "    [Node ${INDEX}/${GENERATOR_COUNT}] Launching ${VUS_PER_GENERATOR} VUs on ${IP}..."
    ssh -o StrictHostKeyChecking=no "ubuntu@${IP}" \
        "TARGET_VUS=${VUS_PER_GENERATOR} BASE_URL=${TARGET_HOST} WS_URL=${WS_TARGET} k6 run --out json=/tmp/k6-telemetry-node-${INDEX}.json main.js" &
done < "${GENERATOR_IPS_FILE}"

echo "--> All generator nodes launched. Awaiting completion of distributed workload..."
wait
echo "--> Distributed 500K execution completed. Aggregating raw telemetry artifacts..."
