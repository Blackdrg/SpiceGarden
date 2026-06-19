# Deployment Flow

```mermaid
flowchart TD
    Start([Development]) --> Build
    Build --> Lint[Lint Check<br/>npm run lint]
    Lint -->|Pass| Test[Run Tests<br/>npm run test]
    Lint -->|Fail| LintFail[Fix Lint Issues]
    LintFail --> Lint
    
    Test -->|Pass| SecurityCheck[Security Tests<br/>infra/scripts/security-tests.js]
    Test -->|Fail| TestFail[Fix Tests]
    TestFail --> Test
    
    SecurityCheck -->|Pass| BuildProd[Production Build<br/>tsc]
    BuildProd --> Docker[Docker Build]
    
    Docker --> Push[Push to Registry<br/>ghcr.io/spicegarden/backend]
    
    Push --> Deploy[Deploy to K8s]
    
    Deploy --> HPA[HPA Check<br/>3-20 replicas]
    Deploy --> PDB[PDB Check<br/>minAvailable: 2]
    Deploy --> NetworkPolicy[Network Policy<br/>Apply]
    
    HPA --> Ready[Ready for Traffic]
    PDB --> Ready
    NetworkPolicy --> Ready
    
    Ready --> Monitoring[Prometheus Monitoring]
    Monitoring --> Alerting[Alertmanager Alerts]
    
    subgraph BackupJob
        CronJob[Daily Backup<br/>02:00 UTC CronJob] --> PostgresBackup[PostgreSQL Dump]
        CronJob --> MongoBackup[MongoDB Dump]
        CronJob --> RedisBackup[Redis RDB]
        PostgresBackup --> LocalStorage[Save to PVC<br/>100Gi]
    end
    
    subgraph Rollback
        Failed[Deployment Fails] --> Rollback[Rollback to Previous]
        Rollback --> AlertCritical[Critical Alert]
    end
```