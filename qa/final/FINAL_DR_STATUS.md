# SPICEGARDEN — FINAL DISASTER RECOVERY (DR) STATUS

## 1. Disaster Recovery Parameters & Objectives

* **Target Recovery Time Objective (RTO)**: `< 15 minutes` (Automated IaC cluster rebuild & state hydration).
* **Target Recovery Point Objective (RPO)**: `< 5 minutes` (Continuous PostgreSQL WAL streaming & S3 snapshot backups).
* **Measured RTO**: `READY_NOT_EXECUTED` (Physical restore drill requires active AWS account).
* **Measured RPO**: `READY_NOT_EXECUTED` (Physical restore drill requires active AWS account).

## 2. DR Automation Scripts
* Backup Script: `infra/scripts/backup.sh` (Automates database dump and S3 sync).
* Restore Script: `infra/scripts/disaster-recovery.sh` (Automates database restore and schema verification).
