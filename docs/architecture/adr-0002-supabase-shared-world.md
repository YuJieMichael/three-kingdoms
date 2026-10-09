# ADR-0002: Supabase backend for the shared world, with server-side rule authority

## Status

Accepted

> Reverse-documented from the shipped code on 2026-10-08; accepted by the project owner on 2026-10-08.

## Date

2026-10-08

## Last Verified

2026-10-08 (against v0.34.17; file layout only, the live deployment was not inspected)

## Decision Makers

Project owner (original decision, not recorded); documented by Claude Code.

## Summary

Shared-world features (accounts, private cloud saves, contested cities, alliances) need an authority that players cannot tamper with. The game uses Supabase (Postgres plus two Edge Functions), with the same engine code built for the server and a whitelist of commands the server will accept.

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Custom browser engine (see ADR-0001) |
| **Domain** | Networking |
| **Layer** | Foundation |
| **Knowledge Risk** | MEDIUM — Supabase platform behaviour should be re-checked before changes |
| **References Consulted** | `DEVELOPMENT.md`, `package.json`, `supabase/`, `online/` |
| **Post-Cutoff APIs Used** | None known |
| **Verification Required** | Re-run `npm run online:sql-check` before any migration change |

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | ADR-0001 |
| **Enables** | Shared-world, alliance and market systems (index #22) |
| **Blocks** | None |
| **Ordering Note** | The single-player game must keep working with no online service configured. |

## Context

### Problem Statement

A client-only game cannot enforce who owns a contested city, or stop edited saves from entering a shared world.

### Current State

- `online-client.js` and `online-ui.js` on the client.
- `supabase/migrations/` plus Edge Functions `game-api` and `game-tick`.
- `online/runtime.mjs`, `service.mjs`, `world.mjs`, `supabase-store.mjs` implement the server rules and storage adapter.
- `scripts/build-online-runtime.cjs` builds a server runtime from the client engine; `online/local-server.mjs` runs it locally; `scripts/verify-online-sql.mjs` runs the migrations unmodified on PGlite 0.5.8.
- `DEVELOPMENT.md`: without an online service configured, each device keeps its own local progress.

### Constraints

- Free or low-cost hosting; one developer.
- Single-player must not depend on the backend.

### Requirements

- The server accepts only a fixed whitelist of commands and settles results itself.
- Retried or repeated commands must not double-charge or double-reward.
- Migrations can be verified without a live Supabase project.

## Decision

Use Supabase for auth, storage and the two Edge Functions. Build the server rules from the same engine source as the client so both settle identically. The client sends commands; the server validates against the whitelist and returns authoritative results.

### Architecture

```
client (online-client.js)
   │ commands
   ▼
Edge Function game-api ──► online/runtime (engine build) ──► Postgres (migrations)
Edge Function game-tick ──► scheduled world settlement ───────►
```

### Implementation Guidelines

- Every new online action must be added to the server whitelist and covered by a test.
- Migrations must pass `online:sql-check` without edits.
- Features not yet backed by server authority must be disabled in shared mode rather than silently run client-side (the hero-stratagems GDD does this for stratagems).

## Alternatives Considered

### Alternative 1: Client-only game, no shared world

The shared world is a stated goal in `design/game-brief.md`'s later stages; whether other backends were considered is not recorded. Confirm with the owner.

## Consequences

### Positive

- Tamper resistance for shared state.
- Same rules on both sides, so fewer divergence bugs.
- SQL can be verified offline.

### Negative

- Vendor dependence on Supabase.
- The server runtime must be rebuilt whenever the engine changes.
- Features need both a client and a server path before they can be enabled online.

### Neutral

- Online acceptance is tracked separately from single-player acceptance.

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Server runtime drifts from the client engine | Medium | High | Build step plus replay tests |
| Edited saves enter the shared world | Medium | High | Command whitelist, server validation |

## Performance Implications

Not measured.

## Migration Plan

None; this documents the current state.

**Rollback plan**: The single-player path works without it.

## Validation Criteria

- [ ] `npm run online:sql-check` passes.
- [ ] The game works with no online service configured.

## GDD Requirements Addressed

| GDD Document | System | Requirement | How This ADR Satisfies It |
|---|---|---|---|
| `design/quick-specs/realm-online-v0.28.0.md` | Shared world | Authoritative shared-world state | Server-side command whitelist and settlement |

## Related

- ADR-0001, ADR-0003
- `supabase/`, `online/`, `online-client.js`
