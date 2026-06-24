> HISTORICAL DOCUMENT
> This report reflects a prior audit state and is superseded by:
> `docs/CANONICAL_PROJECT_STATE_2026-06-20.md`
> and the latest README / status reports.

# CURRENT_DEPENDENCY_REPORT.md

**Generated:** 2026-06-18

## Dependency Graph Status

```
npm ls --workspaces --depth=0 - PASSED (Exit code 0)
```

No invalid installs, missing dependencies, or version conflicts detected.

### Workspace Dependencies

| Workspace | Direct Dependencies | Status |
| :--- | :---: | :--- |
| backend | 57 | ✅ Clean |
| customer-mobile | 26 | ✅ Clean |
| customer-web | 26 | ✅ Clean |
| delivery-partner | 14 | ✅ Clean |
| launcher | 21 | ✅ Clean |
| restaurant-dashboard | 17 | ✅ Clean |
| super-admin | 18 | ✅ Clean |
| api-types | 4 | ✅ Clean |
| grpc-transport | 0 | ✅ Clean |
| proto | 0 | ✅ Clean |
| shared | 2 | ✅ Clean |
| ui | 2 | ✅ Clean |

### Root Package Dependencies

| Package | Version |
| :--- | :--- |
| typescript | ^5.1.6 |
| electron | ^42.4.0 |
| uuid | ^8.3.2 |

### Overrides Applied

| Package | Version |
| :--- | :--- |
| engine.io | ^6.6.9 |
| form-data | ^4.0.6 |
| socket.io | ^4.8.3 |
| ws | ^8.21.0 |
| next/postcss | ^8.5.10 |

### Security Vulnerabilities

```
npm audit --audit-level=high - PASSED (0 high, 0 critical)
npm audit - Exit code 1; 31 moderate findings remain
```

| Severity | Count | Action Required |
| :--- | :---: | :--- |
| High | 0 | No |
| Critical | 0 | No |
| Moderate | 31 | Evaluate upgrade or document risk acceptance |
| Low | 0 | No |

### Dependency Health Recommendations

1. Upgrade or document 31 moderate advisories.
2. Preserve high/critical audit gate in CI.
3. Avoid disruptive `npm audit fix --force` without dependency impact review.