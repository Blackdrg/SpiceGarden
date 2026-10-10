# SpiceGarden — Hyperscale Multi-Tier Capacity Models

All tiers from 50k to 1M VUs are mathematical derivations:

| Target Tier | Model Pods | Modeled RPS | PostgreSQL Spec | Redis Cluster Spec | Load-Gen Nodes | Classification |
| :---: | :---: | :---: | :--- | :--- | :---: | :--- |
| **50,000 VUs** | 5 Pods | 6,900 | 1x Primary + 1x Replica | 2 Nodes | 2x c6i.2xlarge | `CAPACITY MODEL` |
| **100,000 VUs** | 10 Pods | 13,200 | 1x Primary + 2x Replicas | 4 Nodes | 4x c6i.2xlarge | `CAPACITY MODEL` |
| **250,000 VUs** | 25 Pods | 34,000 | 1x Primary + 3x Replicas | 6 Nodes | 10x c6i.2xlarge | `CAPACITY MODEL` |
| **500,000 VUs** | 50 Pods | 58,000 | 1x Primary + 4x Replicas | 8 Nodes | 20x c6i.2xlarge | `CAPACITY MODEL` |
| **1,000,000 VUs**| 120 Pods | 140,000 | 1x db.r6g.16xlarge + 4x Replicas | 12 Shards | 40x c6i.2xlarge | `1M VU CAPACITY MODEL` |
