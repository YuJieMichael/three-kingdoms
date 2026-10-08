# ADR-0001: Plain-JavaScript browser engine with no framework or build step

## Status

Proposed

> Reverse-documented from the shipped code on 2026-10-08. Moving this to `Accepted` needs the project owner's explicit confirmation.

## Date

2026-10-08

## Last Verified

2026-10-08 (against v0.34.17)

## Decision Makers

Project owner (original decision, not recorded); documented by Claude Code.

## Summary

The single-player game needs to run on desktop and phone with nothing to install. The client is plain JavaScript files loaded by `index.html`, with no framework, bundler or third-party runtime dependency.

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Custom browser engine (plain JavaScript, HTML, CSS) |
| **Domain** | Core |
| **Layer** | Foundation |
| **Knowledge Risk** | LOW |
| **References Consulted** | `DEVELOPMENT.md`, `package.json`, `index.html` |
| **Post-Cutoff APIs Used** | None |
| **Verification Required** | None |

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | None |
| **Enables** | ADR-0002, ADR-0003 |
| **Blocks** | None |
| **Ordering Note** | Foundational. |

## Context

### Problem Statement

The game is a strategy prototype iterated in small versions. It needs to be playable from a phone or computer via a link (GitHub Pages) and editable by one developer without a toolchain.

### Current State

About 80 JavaScript modules and about 25 stylesheets at the repository root, versioned by a `?v=` query string. `engine.js` owns rules and settlement; `*-ui.js` modules render; `*-data.js` modules hold numbers. `npm start` runs `server.cjs` for local use. `DEVELOPMENT.md` states there is no third-party runtime dependency and no compile step for the client.

### Constraints

- Must work as static files on GitHub Pages (`.nojekyll` is present).
- Must work on phone-width screens.
- One developer; changes should be visible after a refresh.

### Requirements

- Rules are deterministic enough to replay on the server (see ADR-0002).
- Data tables are separate from rendering so balance can change without touching UI.

## Decision

Keep the client as plain JavaScript modules loaded directly by the browser. Rules live in `engine.js` and `*-system.js`; data in `*-data.js`; presentation in `*-ui.js` and CSS. No framework, bundler or runtime npm dependency is added to the client.

### Architecture

```
index.html
  ├─ *-data.js      numbers and definitions
  ├─ engine.js      rules, settlement, state (global Game)
  ├─ *-system.js    feature rules
  └─ *-ui.js + *.css   rendering, reads state, dispatches actions
```

### Implementation Guidelines

- New features follow the data / system / ui split.
- Bump the `?v=` version on all asset URLs when shipping, so browsers do not serve stale files.
- Dev-only tooling (tests, SQL checks) may use npm devDependencies; the shipped client may not.

## Alternatives Considered

### Alternative 1: A UI framework with a bundler

Not recorded in the repository; the reason it was not chosen is inferred (no toolchain, quick iteration), not documented. Confirm with the owner.

## Consequences

### Positive

- Zero install and zero build; deploys as static files.
- Easy to read and patch.

### Negative

- Global scope shared by many files; load order matters.
- No type checking or module boundaries enforced by tooling.
- Stale-cache bugs if the version string is not bumped.

### Neutral

- Tests run with Node's built-in runner (`node --test tests/*.test.cjs`).

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Global name collisions between modules | Medium | Medium | Naming conventions; tests |
| Stale cached CSS/JS after a release | Medium | Low | Bump `?v=` on every release |

## Performance Implications

Not measured. No budget has been set.

## Migration Plan

None; this documents the current state.

**Rollback plan**: Not applicable.

## Validation Criteria

- [ ] `npm test` passes on a machine with Node 18+.
- [ ] The game loads from static hosting with no server.

## GDD Requirements Addressed

Foundational — no GDD requirement. Enables every system in `design/gdd/systems-index.md`.

## Related

- `DEVELOPMENT.md`, `RULES.md`
- ADR-0002, ADR-0003
