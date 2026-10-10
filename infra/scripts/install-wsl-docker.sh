#!/bin/bash
set -e
echo 'Acquire::Check-Valid-Until "false";' | sudo tee /etc/apt/apt.conf.d/99no-check-valid > /dev/null
sudo rm -rf /var/lib/apt/lists/*
sudo apt-get update -o Acquire::Check-Valid-Until=false -o Acquire::Retries=5 2>&1 | tail -3
sudo apt-get install -y docker.io 2>&1 | tail -10
dockerd --version 2>/dev/null || echo "dockerd not available"
