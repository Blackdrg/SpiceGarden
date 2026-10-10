#!/usr/bin/env bash
# infra/load-tests/500k/distributed/setup-generator.sh
# Automated Linux Kernel, Network, and Resource Tuning for 500K k6 Load Generator Nodes

set -euo pipefail

echo "=========================================================="
echo " [SpiceGarden] 500K Generator Node Kernel & Network Tuning"
echo "=========================================================="

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root (sudo)" 
   exit 1
fi

echo "--> [1/4] Applying Linux /etc/sysctl.conf tuning..."
cat <<'EOF' > /etc/sysctl.d/99-k6-load-generator.conf
# File descriptor limits
fs.file-max = 2097152
fs.nr_open = 2097152

# Ephemeral port range allocation (64,511 available ports per outbound IP)
net.ipv4.ip_local_port_range = 1024 65535

# TCP connection lifecycle & TIME_WAIT recycling
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_max_tw_buckets = 2000000

# Connection backlog & socket buffer scaling
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 100000
net.ipv4.tcp_max_syn_backlog = 65535

# Socket read & write memory limits (16 MB)
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.core.rmem_default = 1048576
net.core.wmem_default = 1048576
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216

# Disable slow start on idling connections
net.ipv4.tcp_slow_start_after_idle = 0
EOF

sysctl --system > /dev/null
echo "    sysctl tuning applied successfully."

echo "--> [2/4] Applying /etc/security/limits.conf process limits..."
cat <<'EOF' > /etc/security/limits.d/99-k6-limits.conf
*       soft    nofile      1048576
*       hard    nofile      1048576
*       soft    nproc       524288
*       hard    nproc       524288
root    soft    nofile      1048576
root    hard    nofile      1048576
EOF
echo "    ulimit nofile set to 1,048,576."

echo "--> [3/4] Verifying k6 installation..."
if ! command -v k6 &> /dev/null; then
    echo "    Installing k6 official package..."
    if command -v apt-get &> /dev/null; then
        apt-get update -qq && apt-get install -y -qq gnupg2 ca-certificates curl
        curl -s https://dl.k6.io/key.gpg | gpg --dearmor -o /usr/share/keyrings/k6-archive-keyring.gpg
        echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list
        apt-get update -qq && apt-get install -y -qq k6
    elif command -v yum &> /dev/null; then
        dnf install -y https://dl.k6.io/rpm/repo.rpm || yum install -y https://dl.k6.io/rpm/repo.rpm
        yum install -y k6
    fi
fi
k6 version

echo "--> [4/4] Generator node is tuned and certified for high-concurrency generation."
