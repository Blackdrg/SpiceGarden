# Proposed Deletions

**Generated:** 2026-06-21

## Proposed Deletions

None.

## Rationale

The active constraint forbids deletion, archiving, wholesale replacement, or removal of files, folders, modules, tests, docs, or configs without explicit approval. Current completion work preserved stubbed/partial components and documented them instead.

## Non-Deletion Recommendations

- Free or redirect disk space for build artifacts.
- Keep historical docs marked as historical.
- Keep `packages/grpc-transport` quarantined/partial unless a future approved gRPC implementation is requested.
- Keep runtime security/load validation scripts rather than removing them; they require a running backend to be meaningful.
