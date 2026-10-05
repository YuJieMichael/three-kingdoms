# Mobile UX inspection · v0.19.0

Reviewer: ux-designer subagent, independent of the ui-programmer implementation. Scope: static review of `war-theme.css`, `grid-world.js`, `classic-ui.js` and independent viewing of the ui-programmer's saved screenshots. The reviewer did not run a separate browser session. Requirements: `design/quick-specs/mobile-controls-2026-10-05.md`.

## Findings

The phone map now uses six cells per axis; this is a justified refinement from the initial seven-cell proposal. With the available width at 360 pixels, seven would fail the 44-pixel target. Bounds, axis labels, minimap viewport and drag scale use the same dynamic span. Desktop retains nine. Arrow controls retain four-cell movement with overlapping views.

City keeps its six-column physical layout so the reserved hall cells and slot positions remain meaningful; reducing columns would distort that layout. Single-column side panels and larger targets increase vertical scrolling. The saved market screenshot shows the modal, labels, number field and complete actions within the narrow viewport.

The drawer has visible close and backdrop controls, Escape closes it, and focus returns to the newly rendered opener. Header, primary navigation, modal close and the footer view action have 44-pixel minimum targets in the final CSS. Automation CSS supports stacked labeled fields on phones.

## Runtime evidence supplied by ui-programmer

These measurements are attributed to the implementer, not independently rerun by this reviewer:

| Check | Evidence |
| --- | --- |
| Narrow document overflow | 360 client / 360 scroll pixels; 390 client / 390 scroll pixels |
| Phone map cells | 36 cells; minimum 47.33 × 47.33 pixels |
| City slots | minimum 49.66 × 72 pixels |
| Primary navigation | 48.57 × 44 pixels |
| 390-pixel dialog | width 370; client / scroll width 368 / 368; height 565; close 44 × 44 |
| Drawer keyboard | Enter opens; Escape closes and returns focus |

Saved screenshots independently viewed: `/Users/lihuazeng/Documents/Codex/2026-10-05/e/outputs/v0.19.0/mobile-map.png` and `mobile-market.png`. City evidence is also available as `mobile-city.png` in that folder. Screenshots are narrow iframe views inside a desktop browser.

## CONCERNS

- Physical-phone touch, virtual keyboard, address-bar height changes and device safe areas: **NOT ASSESSED**. Narrow iframe evidence supports responsive layout only.
- Automation reserve-edit stability, completion inbox and final desktop regression remain for the parent release inspection; this receipt does not certify them from CSS alone.
- Resource ribbon intentionally scrolls horizontally; request sent to implementer to expose that affordance in its accessible label. Small resource-rate/capacity text remains secondary; core controls and values are legible in supplied images.

Disposition: responsive city/map/market and drawer changes satisfy the inspected requirements, with the stated evidence limits. No independent browser playtest or physical-device certification claimed.

## Assistant follow-up static review

Reviewed `automation-ui.js`, `automation-system.js`, relevant engine functions and the 500-millisecond app refresh. The native dialog is outside `#app`, so shell rendering does not replace it. `showModal` clears `manualModalContext`, and the assistant intentionally leaves it null; completion ticks update status and inbox rather than recreating the reserve form. Save uses explicit labeled controls and feedback with a polite live region. Unread records persist independently of toast duration, are bounded to 30, and support marking all read.

Priority and reserve explanations match the inspected implementation: chosen eligible/affordable technology ranks first, development direction follows, then lowest level; unavailable choices fall through. Automatic payments respect reserves, manual payments may use them, and construction gets payment precedence. Validation rejects blank, fractional, negative and oversized reserve values. Save may start eligible automation immediately, consistent with the displayed settings purpose.

No substantive static blocker found. Two minor presentation recommendations sent to parent: exclude checkbox from full-width/44-pixel input styling while keeping its label touch target, and give upgrade status the same status semantics as research. Parent is separately checking desktop and narrow assistant runtime; screenshots were not yet available at the time of this follow-up.
