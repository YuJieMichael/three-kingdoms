# Adoption Plan — 三国城志 / 山河策

Date: 2026-10-08 · Stage: Production · Rigor: standard (workflow tier: standard)

Audit method: read-only, run by hand from `/adopt`'s instructions (the skill itself was not loaded in the originating session). GDD sections were checked with `gdd-structure-check.sh`; stories and the brief were compared against the templates by eye.

## Summary

| Artifact | Found | Verdict |
|---|---|---|
| Game brief | `design/game-brief.md` | Compliant: Core loop, Player goal & fail state, MVP, Out of scope, Build order all present |
| GDDs | 1 (`design/gdd/hero-stratagems.md`) | Missing Formulas (required: the system has numeric rules); Player Fantasy and Tuning Knobs advisory |
| Quick specs | 26 in `design/quick-specs/` | Not GDDs; they hold most of the design. No systems index points at them |
| ADRs | 0 | Gap: no recorded architecture decisions |
| Stories | 5 in `production/epics/` | 3 match the template header; 2 use a different layout (see below) |
| Infra | `project.yaml`, `stage.txt`, `tr-registry.yaml`, `design/registry/entities.yaml` | Present. Stage was unset until today; now `Production` |

## Migration steps (priority order)

1. [x] **Add `## Formulas` to `design/gdd/hero-stratagems.md`.** Required at standard rigor. Copy the numeric rules from its balance notes in `design/balance/`.
2. [x] **Create `design/gdd/systems-index.md`.** List the systems in the game and link each to its quick spec. This gives the template skills one entry point without rewriting 26 specs.
3. [x] **Normalise the two odd stories.**
   - `production/epics/original-systems/story-001-eight-systems.md`: rename `## 验收` to `## Acceptance Criteria`.
   - `production/epics/command-ui/01-interface-simplification.md`: add the `**ID:**`, `**Layer:**`, `**GDD:**`, `**ADR Governing Implementation:**` header fields the other three have.
4. [x] **Write 3 ADRs for decisions that already exist in code**, via `/architecture-decision`:
   - Plain-JS browser engine with no framework or build step.
   - Supabase for the shared online world, with a local PGlite server for tests.
   - Save and save-takeover model.
5. [ ] **Promote quick specs to GDDs only when a system is next touched.** Do not bulk-convert; the specs work as they are and the standard tier does not require it.

## Not gaps at this tier

Art bible, UX specs and sprint plans are not required at `standard`. A visual-direction note would still help the UI polish work, but it is optional.

## Notes

- Engine is not configured in `project.yaml`. This is a custom browser engine, so `/setup-engine` has no matching preset; pick "other" if prompted.
- Tests (61 files in `tests/`) run with `node --test`; Node was not installed on the machine used for this audit, so none were run.
