# ADR-0003: Local save in browser storage with a single-writer lease and recovery copies

## Status

Accepted

> Reverse-documented from the shipped code on 2026-10-08; accepted by the project owner on 2026-10-08.

## Date

2026-10-08

## Last Verified

2026-10-08 (read from `engine.js`; behaviour was not run under test)

## Decision Makers

Project owner (original decision, not recorded); documented by Claude Code.

## Summary

Single-player progress must survive reloads and several open tabs without one tab silently overwriting another. Progress is stored in browser `localStorage` under one key; a short-lived writer lease decides which page may save, and older copies are kept as backup and recovery entries.

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Custom browser engine (see ADR-0001) |
| **Domain** | Core |
| **Layer** | Foundation |
| **Knowledge Risk** | LOW |
| **References Consulted** | `engine.js` (save session code), `app.js` (`visibilitychange`, `pagehide`, `pageshow` handlers) |
| **Post-Cutoff APIs Used** | None |
| **Verification Required** | Test two tabs open at once; test storage that throws (private window) |

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | ADR-0001 |
| **Enables** | Offline progress, export/import |
| **Blocks** | None |
| **Ordering Note** | Online saves (ADR-0002) are separate from this local save. |

## Context

### Problem Statement

A game with timers and offline progress is saved often. With two tabs open, last-write-wins would lose progress.

### Current State

In `engine.js`:

- The save lives under one `localStorage` key.
- A session key stores `{owner, until}`, a lease that expires after `LEASE_MS`. Each page has a random owner id.
- Before writing, the page checks that the stored value is still what it last read; if not, it reports a `conflict` and pauses instead of overwriting.
- The previous valid state is copied to a backup key; replaced raw saves are archived under `…-recovery-<time>-<owner>-<n>` keys.
- Helpers exist to read session info, export the raw save and take over the lease. `app.js` releases the lease on `pagehide`.
- The settings dialog offers export and import of saves.

### Constraints

- Only browser storage is available offline.
- Storage can throw or be cleared (private windows, blocked site data).

### Requirements

- Never silently overwrite a newer save from another tab.
- Keep a way back after a bad write or a takeover.
- The player can export and restore progress by hand.

## Decision

Keep the save in `localStorage` with a single-writer lease, optimistic conflict detection, one rolling backup and archived recovery copies. A page that loses the lease stops saving and tells the player.

### Architecture

```
page A ──lease──► localStorage[KEY]      ◄── page B (read-only while A holds lease)
                  localStorage[BACKUP]
                  localStorage[KEY-recovery-*]
```

### Implementation Guidelines

- Any new persisted field must be covered by the save validator, so old saves migrate rather than fail.
- Wrap storage access in try/catch; the game must still render with storage unavailable.

## Alternatives Considered

### Alternative 1: Last-write-wins in a single key

Not chosen as far as the code shows (the conflict check exists to avoid it). No written rationale; confirm with the owner.

## Consequences

### Positive

- No silent overwrite across tabs.
- Recoverable after conflicts or takeovers.

### Negative

- Recovery entries accumulate in storage and are not shown to be pruned.
- The lease can make a second tab read-only until takeover.

### Neutral

- Saves are per browser and per device unless exported or synced online.

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Storage quota filled by recovery entries | Low | Medium | Add pruning (not implemented) |
| Player clears site data and loses progress | Medium | High | Export reminder in settings |

## Performance Implications

Not measured.

## Migration Plan

None; this documents the current state.

**Rollback plan**: Not applicable.

## Validation Criteria

- [ ] Two tabs open: the second does not overwrite the first.
- [ ] A save can be exported and imported back.
- [ ] With storage throwing, the game still loads.

## GDD Requirements Addressed

Foundational — no GDD requirement. Enables reliable single-player progress (`design/game-brief.md`: "可靠存档").

## Related

- ADR-0001, ADR-0002
- `engine.js` save-session code; `tests/` save-related tests
