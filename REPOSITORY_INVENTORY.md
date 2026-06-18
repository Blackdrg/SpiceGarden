# Repository Inventory

Generated: 2026-06-17T21:30+05:30  
Evidence: `git ls-files`, workspace package manifests, source scans, build/lint/test command output.

## Count Method

- Tracked files use `git ls-files` in the repository root.
- Source files exclude `dist/`, `.d.ts`, `.map`, and `.bak` files.
- Component/service/controller/module/entity counts are source-pattern counts from tracked files.
- React component count is a declaration-pattern count using `git grep` for exported/const PascalCase component declarations.

## Global Inventory

| Metric | Count | Evidence |
| :--- | ---: | :--- |
| Total tracked files | 2,729 | `git ls-files \| Measure-Object -Line` |
| Tracked source files | 726 | TS/TSX/JS/JSX excluding generated artifacts |
| Total TS files | 746 | `git ls-files` extension count |
| Total TSX files | 146 | `git ls-files` extension count |
| Total JS files | 769 | `git ls-files` extension count |
| Total JSX files | 0 | `git ls-files` extension count |
| Total JSON files | 133 | `git ls-files` extension count |
| Total YAML files | 21 | `git ls-files` extension count |
| Total YML files | 12 | `git ls-files` extension count |
| Total Docker files | 1 | root `Dockerfile` |
| Total Kubernetes manifests | 8 | `infra/k8s/*.yaml` |
| Total test files | 185 | tracked files matching test/spec/e2e patterns |
| React component declarations | 204 | `git grep` component declaration pattern |
| Hook declarations | 38 | `git grep` `useX` declaration pattern |
| Services | 92 | `@Injectable` pattern plus frontend service files |
| Controllers | 43 | `@Controller` decorator pattern; 41 controller files |
| Modules | 54 | `@Module` decorator pattern; 55 backend module files |
| Entity decorators | 69 | `@Entity` decorator pattern; 68 entity files |

## Breakdown by Application

| Area | Total tracked files | Source files | TS | TSX | JS | JSX | JSON | YAML/YML | Tests | Controllers | Services | Modules | Entities | Pages | Screens | Hooks |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `apps/backend` | 1,797 | 339 | 301 | 0 | 38 | 0 | 6 | 6 | 139 | 41 | 77 | 54 | 68 | 0 | 0 | 0 |
| `apps/customer-web` | 90 | 51 | 20 | 27 | 4 | 0 | 16 | 0 | 3 | 0 | 0 | 0 | 0 | 24 | 0 | 7 |
| `apps/customer-mobile` | 121 | 66 | 20 | 24 | 22 | 0 | 13 | 0 | 11 | 0 | 3 | 0 | 0 | 0 | 15 | 2 |
| `apps/delivery-partner` | 81 | 29 | 8 | 12 | 9 | 0 | 8 | 0 | 3 | 0 | 2 | 0 | 0 | 0 | 0 | 12 | 1 |
| `apps/restaurant-dashboard` | 37 | 21 | 6 | 11 | 4 | 0 | 8 | 0 | 3 | 0 | 0 | 0 | 0 | 11 | 0 | 0 |
| `apps/super-admin` | 43 | 26 | 7 | 14 | 5 | 0 | 9 | 0 | 4 | 0 | 0 | 0 | 0 | 15 | 0 | 0 |
| `apps/launcher` | 92 | 27 | 9 | 3 | 15 | 0 | 7 | 2 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `packages` | 200 | 127 | 20 | 54 | 53 | 0 | 10 | 0 | 14 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `infra` | 67 | 13 | 0 | 0 | 13 | 0 | 3 | 17 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `scripts` | 22 | 18 | 1 | 0 | 17 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `docs` | 11 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

## Verified Command Evidence

| Command | Result |
| :--- | :--- |
| `git status --short` | No output at start of audit; working tree was clean before documentation generation |
| `npm run build` | Exit `0`; all workspaces built |
| `npm run lint` | Exit `0`; all workspaces linted |
| `npm run test:unit` | Exit `0`; root workspace unit gates passed |
| `npm audit --audit-level=high` | Exit `0`; 0 high, 0 critical |
| `npm audit` | Exit `1`; 31 moderate findings remain |

## Notes

- The backend dominates tracked files because generated `dist` artifacts are tracked in the repository.
- Backend entity files count 68, but `apps/backend/src/db/db.module.ts` imports 40 entities into TypeORM plus one Mongoose review schema.
- Frontend route/screen counts include `_app.tsx` where present because it is a tracked page/screen file.
