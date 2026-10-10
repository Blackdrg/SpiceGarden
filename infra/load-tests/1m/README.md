# SpiceGarden 1M VU Distributed Load Testing Architecture

## Overview
This directory contains the authoritative 1M VU distributed load testing harness for SpiceGarden Enterprise SaaS.

### Directory Structure
* [`scenario.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/1m/scenario.js): Master k6 test scenario with multi-workload ramp-up stages.
* [`config.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/1m/config.js): Environment endpoints, think time parameters, and headers.
* [`thresholds.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/1m/thresholds.js): Strict SLA acceptance criteria.
* `workloads/`: Independent workload modules (browse, search, cart, checkout, tracking, admin).
* `data/`: Synthetic multi-tenant entities (tenants, users, restaurants, menu items).
* `distributed/`: Kubernetes k6 Operator TestRun CRDs and deployment scripts for 40-node worker fleets.
