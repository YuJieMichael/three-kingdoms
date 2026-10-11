# Classic Strategy Depth Implementation Plan

> For implementers: execute only extracted task brief. Use TDD and report evidence.

**Goal:** Complete all seven selected systems as one reviewable candidate, maintaining existing saves and real costs.
**Spec:** design/quick-specs/classic-strategy-depth-2026-10-11.md and seven linked subsystem specs.
**Architecture:** Existing pure rules modules, engine transaction boundaries, DOM UI; sequential implementation to protect shared global files.
**Tech:** Plain JavaScript/HTML/CSS, node:test, no new dependencies.

## Global Constraints

- Work only in /Users/lihuazeng/.codex/worktrees/nanman-campaign/superpower on feat/classic-strategy-depth. Never push/merge/publish. Never dispatch child agents.
- Read AGENTS.md and task-specific spec, not the complete umbrella plan. User permits recommended design choices without another question; raise concrete ambiguities to controller.
- Preserve original saves, battle snapshots, source city attribution and earned resources. New state migrated strictly, read-only projections never mutate saves. Transactions must rollback when persistence fails.
- Every new global file registered in index.html and all six test script lists from AGENTS. Rebuild shared runtime if changing engine or earlier script.
- UI Chinese, short icons/cards, accessible labels and >=44px mobile targets; no new framework. UI details hidden by default only when not needed to make decision.
- TDD: focused meaningful failing tests first, then implementation; node --check changed JS; focused tests while iterating, npm test once before task commit. Do not bump version until integration.
- Write full report to provided report path (changes, tests RED/GREEN, self-review, concerns); return ONLY status/commit/test summary/report path. No unsolicited release.

### Task 1: Recovery-first recruitment

**Spec:** design/quick-specs/classic-recovery-2026-10-11.md
**Files:** war-care.js, training-templates.js, engine.js, war-care-ui.js and/or relevant training UI, web-edition.css; tests/recovery-training.test.cjs

1. Read existing paths and spec; write focused RED tests before product changes.
2. Implement the following contract:

Expose Game.recoveryView() pure and Game.setRecoveryPriority(boolean) transaction; policy is a city-local optional opt-in flag in WarCare state with explicit migration, preserve old WarCare prices/ledger. TrainingTemplates.plan receives recovery counts through optional api.recoverable; missing/default means legacy. Only affordable wounded after max(24h salary, automation gold reserve) count as expected recovery. WarCare automatic healing always reserves same budget while opting recovery priority; manual heal quote shows salary impact. Recovery-priority setter does not silently switch autoHeal or active template; tell player when heal is paused and don't reserve wounded that cannot actually be automatically recovered. Both auto flags on + priority produces actual heal before recruiting. Copy city locals on switch/creation and validate all cities. Tests: old target ignores181 wounds; new800 target+619 resident+181 affordablewounds queues0 until heal; insufficient funds must queue actual uncovered deficit; no deployed contribution; delayed/manual recovery does not grant free soldiers; storage failures of new setter and touched heal/autoHeal rollback entire state; offline/multicity preserve old queue behavior. Expose compact checkbox and separate healthy/queued/recoverable/deficit figures.

3. Add compact Chinese UI and meaningful tests. Run focused test, syntax checks, regenerate runtime.
4. Run npm test once, commit only task files, self-review, report RED/GREEN and actual results.

### Task 2: Public stage-based training targets

**Spec:** design/quick-specs/classic-training-targets-2026-10-11.md
**Files:** world-navigation.js (or new training-targets.js), engine.js, world-navigation-ui.js/app.js; tests/training-targets.test.cjs

1. Read existing paths and spec; write focused RED tests before product changes.
2. Implement the following contract:

Expose Game.trainingTargets(stage) pure with stage ids beginner/advanced/famous, levels1–3/4–6/7–10 and limit5; use existing world public intel filtering and nearby radius6. Each returned id,name,level,distance,intel label and reason only; never call hidden strength/risk scoring. Use existing scout/dispatch flows via short stage chips on nearby UI; show scout first for unknowns, no fictitious victory percentage/XP. Battle result short link to actual recovery. Tests: poisoning hidden army produces unchanged selection and labels; readonly equality; exclude owned/locked targets; bounds/ordering/limit; existing nearby/favorites unchanged; authority and blocked saves cannot mutate via links.

3. Add compact Chinese UI and meaningful tests. Run focused test, syntax checks, regenerate runtime.
4. Run npm test once, commit only task files, self-review, report RED/GREEN and actual results.

### Task 3: Owned named-city economic specialty

**Spec:** design/quick-specs/classic-territory-2026-10-11.md
**Files:** city-strategy.js, engine.js rates/trainSeconds (or existing production hook), city-strategy-ui.js / city UI; tests/named-territory.test.cjs

1. Read existing paths and spec; write focused RED tests before product changes.
2. Implement the following contract:

Expose CityStrategy.territory(s,cityMeta) pure with food/wood/stone/iron/gold factors and trainFactor, bonuses as spec. Runtime applies exactly once AFTER existing city specialty and named tier factors, only actual built owned named city scope. No global effect on other city rates, no change in-transit duration/queued training timestamps, no added claim state. UI actual per-hour gain plus missing controls using NamedCitySystem.progress existing; existing development one-off separate. Tests ordinary1, named unbuilt1, granaryfood1.05, mine3materials1.05, pass new train.95, balancedgold1.05; repeated reads/ticks no duplicate factor; secondary city attribution; old queue and frozen rewards unchanged.

3. Add compact Chinese UI and meaningful tests. Run focused test, syntax checks, regenerate runtime.
4. Run npm test once, commit only task files, self-review, report RED/GREEN and actual results.

### Task 4: Five named-city hero stories

**Spec:** design/quick-specs/classic-heroes-2026-10-11.md
**Files:** named-city-data.js, named-garrison.js, hero-system.js, hero-identity.js, hero-catalog.js, engine.js, appropriate hero UI; tests/named-hero-stories.test.cjs

1. Read existing paths and spec; write focused RED tests before product changes.
2. Implement the following contract:

Add nodes named_changshan/named_changsha/named_xiliang/named_xuchang/named_chaisang with five hero definitions, stable ids local_7100000000000006..10 in same order. Freeze existing famous-prefecture access requirement at original ceil(5/3)=2 ordinary named counties; do not compute from enlarged roster. New cities county or prefecture consistent with same rule. New stats from retained same-name wild definitions; garrison raw level20, growth enrollment capture/start65/65/70/65/70, so not ×3 leadership. Use short original stories and supply/loyalty siege hints; dynamic identity table maps stablecity IDs. Existing retired wild counterparts remain valid but prevent creating second recruited stable identity for same named hero (including direct/defeated-hero paths); old legitimately duplicated saves remain readable. No boxes for newcity capture. Distinct locations insideWORLD_SIZE not collision existing nodes. Tests siege loyalty capture true actual paths,1..3lvl loss+title gates, migrated five→ten garrisons, tampered source/capture invalid, retained wild save valid, originals threshold unchanged, no new city firstcapturebox.

3. Add compact Chinese UI and meaningful tests. Run focused test, syntax checks, regenerate runtime.
4. Run npm test once, commit only task files, self-review, report RED/GREEN and actual results.

### Task 5: Opt-in active NPC camps

**Spec:** design/quick-specs/classic-factions-2026-10-11.md
**Files:** new faction-system.js and faction-ui.js, npc-defense-data.js/npc-defense.js/engine.js/world UI plus registration lists; tests/faction-system.test.cjs

1. Read existing paths and spec; write focused RED tests before product changes.
2. Implement the following contract:

Expose Game.factionView(), factionToggleQuote(enabled), setFactionsEnabled(enabled,key); module FactionSystem pure view and explicit tick/settle. Save root realm.factions version1 {enabled:false, nextAt:0, seq:0, camps:[], last:null}; each camp strict {id,faction,node,sourceCity,createdAt,readyAt,status} statuses camp/incoming, ids seq-derived; retain attacked camp until settlement, seq monotonic capped safeinteger; last strict last action metadata. Only singleplayer ticking, maxone overdue transition, schedule nextAt=now+6h rather than catchup loop. Targets selected from current/source city home radius6 public eligible unownedwild and exclude hero rumors/landmarks/liveexpeditions/garrisons/camps. Max3 camps. Factions army fixed level factor based source hall capped5: yellow militia80 spear30 archer40, shanyue shield60 spear50 archer30, wuhuan cavalry45 spear30 archer30 (times level). Rewards food1000 gold500 timeslevel, xp existing defenseXP formula; real warnings15min and explicit new frozen faction meta + validation, no repurpose mismatched RegionalFront ledger. Add NPCDefense requestFaction and validate frozen incoming/battle against canonical meta; cityDefense held troops/WarCare all real. Busycity postpone without accumulating attacks. Frozen attack survives disabling; toggled-off stops additional ticks. UI camps concise map badge, sourcecity/cooldown; attack preview respects beacon intel. Existing actual wild battle victory removes associated camp only exactsame target; losing keepscamp. Test enabledgates/stalequotes/atomic failures; 30dayoffline bounded1; targetedcity correct when switched; freeze/validation/tamper; activebattle excluded; victory/defeat only once; campfull no4th; disable midwarning; multiplayer inert. New field migration cannot silently opt-in.

3. Add compact Chinese UI and meaningful tests. Run focused test, syntax checks, regenerate runtime.
4. Run npm test once, commit only task files, self-review, report RED/GREEN and actual results.

### Task 6: Practical combined-arms lessons

**Spec:** design/quick-specs/classic-tactics-2026-10-11.md
**Files:** tactical-lessons.js, tactical lesson UI/battle UI, appropriate manual UI; tests/combined-arms-lessons.test.cjs

1. Read existing paths and spec; write focused RED tests before product changes.
2. Implement the following contract:

Add lesson ids shield_archer/spear_cavalry/siege_gate using existing real resolveBattleRound with fixed reusable unit rows. Shield lesson hold frontline and fireback; spear lesson uses actual existing spear-vs-cavalry counter; siege lesson real gate with rams and existing target siege rules. Do not fabricate lesson fakevictory after entering or roundthreshold, finish won only actual battlewin; objectives require named observed event and tactical effect or gatebreak. Provide brief3-line purpose/actions/failurehint, perlesson meaningful direct player controls. If existing basic branch simplifies result extend onlynew lessonbranch, preserve prior lessons. No persistent rewards/army changes. Realworld dispatch ownarmy role hints based ManualData only, knownenemy types can show actualcounterchart; hidden army must not affect. Tests copied resources/army/xp unchanged before/after exercise; real successful tactic vs demonstrated failed tactic on each lesson; oldlesson creation/results unchanged; no forged completed objective onzero rounds; 390 accessible buttons.

3. Add compact Chinese UI and meaningful tests. Run focused test, syntax checks, regenerate runtime.
4. Run npm test once, commit only task files, self-review, report RED/GREEN and actual results.

### Task 7: Two historical campaigns

**Spec:** design/quick-specs/classic-campaigns-2026-10-11.md
**Files:** battlefield-data.js, battlefield-system.js, battlefield UI and equipment box config if required; tests/historical-campaigns.test.cjs

1. Read existing paths and spec; write focused RED tests before product changes.
2. Implement the following contract:

Campaign IDs ten_eunuchs and dongzhuo. Add actual percampaign config/nodes with9main+6side+3acts and distinct short storybeats; preserve old defaultyellow getters and old frozen records. Each main dependent previous main plus explicit valuablebranch choice; finalvictory main9. Secondary support nodes same mechanisms types in existing config; medical/supply/scout/aid route at leastoneeach. Hero thresholds15/20; inherit existing simple/normal/hard rental limit800/1200/2000, pools3000/4500/7500, factors1/1.75/3 and1/1.25/1.5. Baseprestige1400/1600 and xp240/280; side100/20 each; perday each independently first full+1box, repeat .5xp/prestige no furtherboxes. Existing corresponding yellow/barbarian box reward reuse explicitly visible; randomallslots unaffected. New campaigns unlock simple immediately ateligiblehero, higher difficulty previoussimple/normal samecampaign. Extend save migration explicit dictionaries/configstrict (do not loosen arbitrary IDs). Snapshot provenance node/campaign/reward and sourcecity correctness all existing. Tests30nodes dependencies and all3difficulty progression, imported old activeyellow/nanman exactsnapshots remainvalid, new firstday/repeat independent across campaigns+difficulties, no rewardexploit frompartial/abandon/reload, rented sourcepool no realarmycharge beyondtokens, strict unknowncampaign reject. Normal earnedinput routes simulated as integration not grantlevel in balance evidence.

3. Add compact Chinese UI and meaningful tests. Run focused test, syntax checks, regenerate runtime.
4. Run npm test once, commit only task files, self-review, report RED/GREEN and actual results.

### Task 8: Integration verification and release candidate

**Files:** tests/balance/classic-strategy-depth.cjs, design/balance/classic-strategy-depth-2026-10-11.{md,json}, production/qa/classic-strategy-depth-0.34.72.md; index.html/package.json/README.md/HANDOFF.

Controller completes: validate normal earned inputs1/7/19 (existing evidence/classic-mobile-0.34.71/earned-opening inputs) through real recovery-training, public-target scout+battle, actual named city ownership/rates, NPC tick bounded offline and two campaigns using legitimatelyeligiblehero. If earnedinput insufficient forhero20 do not granthero/resource; retain actual refusal, designprobes separate labelled fixtures. Tests may use fixtures for contract; earnedbalance no grants. Screenshots390/440/1280 allnewentrypoints through UI; nohorizontaloverflow/consoleerrors, no hiddenwarintel. Version candidate0.34.72 consistent all?v/README/package. Rebuild runtime, npm test final; broadfinalreview strongest agent andonefixwave. Archive allrulings QA, remove only this plan scratch after reviewclean. Push featurebranch and create PR with CIgreen (authorizedroutinecandidatepreparation), attachartifact, nevermerge untilnew发布. Include honest limitations realSafari/unverifiedearnedroutes.
