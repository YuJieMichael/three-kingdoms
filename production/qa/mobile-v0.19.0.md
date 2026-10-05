# v0.19.0 mobile browser layout QA

Date: 2026-10-05. Implementer: ui-programmer. Responsive inspection uses CUA browser automation on a local same-origin iframe preview (`tools/mobile-preview.html`), with **actual child layout viewports** 360 × 780 and 390 × 844. This is browser responsive validation, not physical-phone testing.

## Observed cases

| Case | Result |
| --- | --- |
| City document horizontal bounds | 360 client / 360 scroll; 390 client / 390 scroll |
| City tile target at 360 | Minimum 49.66 × 72 px; preserves six-column spatial coordinates and reserved hall cells |
| Main navigation at 360 | Minimum 48.57 × 44 px |
| Phone map | 6 × 6 visible tiles; minimum 47.33 × 47.33 px at 360; desktop retains 9 × 9 |
| Map selection | Selecting 青竹林 updates selected details and coordinates; pane scrolls to details |
| Drawer keyboard | Enter opens; Escape closes; `aria-expanded=false` and focus returns to new opener after render |
| Resource transaction | Opened through drawer; typed 12345 into number field without transaction submission |
| Market dialog at 390 | 370 px outer width; 368 client / 368 scroll; ~565 px height; close target 44 × 44 |
| Resource ribbon | Local horizontal scrolling, document remains within viewport |
| Queue layout | One column on phone; city actions retain finger-sized targets |
| Parse and whitespace | `node --check` for grid-world.js and classic-ui.js; `git diff --check` passed |

## Evidence

- `/Users/lihuazeng/Documents/Codex/2026-10-05/e/outputs/v0.19.0/mobile-city.png`
- `/Users/lihuazeng/Documents/Codex/2026-10-05/e/outputs/v0.19.0/mobile-market.png`
- `/Users/lihuazeng/Documents/Codex/2026-10-05/e/outputs/v0.19.0/mobile-map.png`

## Limits

Physical iOS/Android devices, software keyboard viewport resizing, touch drag gesture behavior, safe-area/notch conditions, gamepad and screen-reader behavior were not tested. Browser iframe locator pointer clicks on an offscreen header returned an automation location error; supported keyboard locator actions verified the drawer flow. Map tile pointer selection was verified. No paid/external action or save-reset was used.

Engine-specific validation: not assessed; project is direct browser DOM/CSS with no configured game engine. Accessibility compliance tier: not assessed because there is no committed accessibility requirements file; scoped target size and keyboard behavior were checked.
