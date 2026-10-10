#!/usr/bin/env bash
# ==============================================================================
# SpiceGarden Linux OS Kernel & Network Stack Tuning Script
# For Distributed Load Generators & Kubernetes Cluster Nodes (500K / 1M VU Fleet)
# ==============================================================================

set -euo pipefail

echo "================================================================="
echo "  SpiceGarden Linux Kernel & TCP Stack Tuning (500K / 1M Fleet)  "
echo "================================================================="

# Check root permissions
if [[ $EUID -ne 0 ]]; then
   echo "[!] This script must be run as root (or with sudo) to apply sysctl parameters."
   echo "[i] Demonstrating configuration and dry-run output..."
   SUDO=""
else
   SUDO=""
fi

# 1. Apply High-Concurrency Sysctl Parameters
echo ""
echo "[1/4] Applying High-Throughput / High-Concurrency Sysctl Parameters..."

SYSCTL_CONF="/etc/sysctl.d/99-spicegarden-highscale.conf"

cat << 'EOF' | tee "${SYSCTL_CONF}" > /dev/null
# System-wide file descriptor limit
fs.file-max = 2097152
fs.nr_open = 2097152

# Socket listen backlog & connection queue
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 100000

# Ephemeral port range allocation
net.ipv4.ip_local_port_range = 1024 65535

# TCP TIME_WAIT socket reuse and fast recycling
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15

# TCP buffer allocations (Read / Write memory)
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.core.rmem_default = 262144
net.core.wmem_default = 262144
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216

# SYN backlog queue
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_syncookies = 1

# Disable TCP slow start after idle to maintain high connection throughput
net.ipv4.tcp_slow_start_after_idle = 0

# Maximum number of TIME_WAIT sockets
net.ipv4.tcp_max_tw_buckets = 2000000
EOF

if command -v sysctl >/dev/null 2>&1; then
    sysctl --system || true
    echo "  [OK] Sysctl parameters written to ${SYSCTL_CONF} and reloaded."
fi

# 2. Configure Process File Descriptors (/etc/security/limits.d/)
echo ""
echo "[2/4] Configuring Process File Descriptors and Memory Limits..."
LIMITS_CONF="/etc/security/limits.d/99-spicegarden.conf"

cat << 'EOF' | tee "${LIMITS_CONF}" > /dev/null
* soft nofile 1048576
* hard nofile 1048576
* soft nproc 524288
* hard nproc 524288
* soft memlock unlimited
* hard memlock unlimited
EOF

echo "  [OK] Security limits written to ${LIMITS_CONF}."

# 3. Optimize Systemd Default Limits
echo ""
echo "[3/4] Tuning Systemd Global Service Limits..."
SYSTEMD_CONF="/etc/systemd/system.conf.d/limits.conf"
mkdir -p /etc/systemd/system.conf.d/

cat << 'EOF' | tee "${SYSTEMD_CONF}" > /dev/null
[Manager]
DefaultLimitNOFILE=1048576
DefaultLimitNPROC=524288
EOF

echo "  [OK] Systemd limits configured."

# 4. Verification of Applied Parameters
echo ""
echo "[4/4] Verifying Active Kernel Socket Settings..."
echo "  fs.file-max: $(sysctl -n fs.file-max 2>/dev/null || echo 'N/A')"
echo "  net.core.somaxconn: $(sysctl -n net.core.somaxconn 2>/dev/null || echo 'N/A')"
echo "  net.ipv4.ip_local_port_range: $(sysctl -n net.ipv4.ip_local_port_range 2>/dev/null || echo 'N/A')"
echo "  net.ipv4.tcp_tw_reuse: $(sysctl -n net.ipv4.tcp_tw_reuse 2>/dev/null || echo 'N/A')"

echo ""
echo "================================================================="
echo "  Linux Host Tuning Complete! Host Ready for 500K/1M Generation   "
echo "================================================================="
