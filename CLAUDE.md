# Claude Code Game Studios -- Game Studio Agent Architecture

Indie game development managed through 49 coordinated Claude Code subagents.
Each agent owns a specific domain, enforcing separation of concerns and quality.

## 本项目规则（三国城志 / 山河策）

- **提交和合并到 `main` 时禁止使用 `[skip ci]`**，提交说明的标题和正文里都不要出现这几个字（GitHub 在说明任何位置看到它都会跳过测试）。2026-10-07 连续 36 个提交跳过测试，规则改了没人发现，导致 26 个测试失效。
- 推送前在仓库根目录运行 `npm test`（Node ≥ 18），全部通过再推；CI 在每次推送和拉取请求时自动运行同一套测试。
- 发布流程：在分支上改动 → 开拉取请求 → CI 通过 → 合并到 `main`，GitHub Pages 自动发布。
- 每次发布都要更新版本号：`index.html` 里所有 `?v=`、`package.json` 的 `version`、README 标题与更新说明，三处一致（`tests/release-version.test.cjs` 会检查）。不改 `?v=`，玩家浏览器可能继续用旧文件。
- 修改 `index.html` 中位于 `engine.js` 及之前的任何脚本后，运行 `node scripts/build-online-runtime.cjs` 重新生成在线服务端规则，并一起提交 `supabase/functions/_shared/game-runtime.mjs`。
- 架构决定见 `docs/architecture/adr-*.md`，系统总表见 `design/gdd/systems-index.md`。

## Technology Stack

- **Engine**: Custom browser engine — plain JavaScript, HTML and CSS, no framework (ADR-0001)
- **Language**: JavaScript (browser globals, loaded in order by `index.html`)
- **Version Control**: Git; feature branches merged to `main` through pull requests
- **Build System**: None for the client (static files on GitHub Pages); tests with `npm test`
- **Asset Pipeline**: Static files under `assets/`, referenced by relative paths

> **Note**: Engine-specialist agents exist for Godot, Unity, and Unreal with
> dedicated sub-specialists. Use the set matching your engine.

## Project Structure

@.claude/docs/directory-structure.md

## Engine Version Reference

<!-- ENGINE-REFERENCE-IMPORT: the line below is engine-specific. /setup-engine
     rewrites it to @docs/engine-reference/<engine>/VERSION.md for the chosen
     engine, so a Unity or Unreal project stops loading the Godot reference every
     session. It defaults to Godot (the template's example engine); skills that
     need the pinned version read docs/engine-reference/<engine>/VERSION.md on
     demand regardless of this import. -->
@docs/engine-reference/godot/VERSION.md


## Technical Preferences

`project.yaml` at the repo root is the primary config store — engine, specialists,
naming, platform, performance, modes. Skills resolve it via `resolve_config`
(see `.claude/docs/config-resolution.md`).

`.claude/docs/technical-preferences.md` is the **legacy fallback**, read on demand
when a key is absent from `project.yaml`. It is no longer imported here: before
`/setup-engine` runs it is almost entirely `[TO BE CONFIGURED]` placeholders, and
after it runs `project.yaml` holds the real values.

## Coordination Rules

@.claude/docs/coordination-rules.md

## Collaboration Protocol

**User-driven collaboration, not autonomous execution.**
Every task follows: **Question -> Options -> Decision -> Draft -> Approval**

- Agents MUST ask "May I write this to [filepath]?" before using Write/Edit tools
- Agents MUST show drafts or summaries before requesting approval
- Multi-file changes require explicit approval for the full changeset
- No commits without user instruction

See `docs/COLLABORATIVE-DESIGN-PRINCIPLE.md` for full protocol and examples.

> **First session?** If the project has no engine configured and no game concept,
> run `/start` to begin the guided onboarding flow.

## Coding Standards

@.claude/docs/coding-standards.md

## Context Management

Read `.claude/docs/context-management.md` on demand — it is a reference, not
session context. Two of its conventions are load-bearing and cited by name
elsewhere in the repo, so they are restated here rather than lost:

- **`production/session-state/active.md` is the session checkpoint.** The file is
  the memory, not the conversation. Read it first after any compaction, crash, or
  `/clear`.
- **Helpers in `.claude/scripts/` emit observations, never verdicts.** A script
  that scores or judges will eventually contradict a mode or override it cannot
  see. (Cited by `artifact-check.sh` and `adr-dep-graph.sh`.)
