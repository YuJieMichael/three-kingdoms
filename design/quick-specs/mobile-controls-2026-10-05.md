# Mobile controls · v0.19.0

Scope: retain the realistic ancient-war style while making city, map, dialogs, navigation and automation usable on narrow screens. Existing desktop gameplay remains available. The user authorized all four follow-up items.

| ID | Acceptance requirement |
| --- | --- |
| MOB-01 | At 360 and 390 CSS pixels, the document has no horizontal overflow. Resource ribbon may scroll horizontally within its own region; its scrollability is explained. |
| MOB-02 | Main navigation, drawer close, modal close, map movement and primary actions have at least 44 × 44 CSS pixel targets. Compact labels remain readable. |
| MOB-03 | City slots remain individually selectable and preserve the original slot indices; narrower column count may increase vertical scrolling. |
| MOB-04 | Phone map uses six visible cells per axis with cells at least 44 pixels wide (seven cells would fall below 44 pixels at the measured 360-pixel inner width). Coordinate labels, minimap viewport outline and drag cell size reflect the current visible span; four-cell arrow pan remains valid with overlapping views. Arrow controls provide an alternative to dragging; coordinate inputs keep X/Y labels. |
| MOB-05 | Dialogs remain inside the viewport, scroll to all content and actions, and keep an accessible close action. Drawer can close through its visible close action, backdrop and Escape; focus returns to its opener. |
| MOB-06 | Automation settings use labeled controls in a single column on phones. Reserve amounts and research order are saved explicitly. Tick refresh does not discard unsaved edits or steal focus. |
| MOB-07 | Automation status explains paused/waiting/running states in text. Completion inbox retains messages beyond transient toast duration and exposes unread count. |

Verification: inspect real rendered screens at 360/390 widths through the available browser surface, exercise navigation, map pan/coordinate jump, city slot dialog, market and automation. Record screenshot paths and measured geometry. Desktop regression inspection is required. Narrow browser or iframe inspection is not physical-phone evidence. Real touch behavior, browser address-bar changes, virtual keyboard and device safe areas remain NOT ASSESSED without a phone.

Review approach: independent static UX inspection by ux-designer plus ui-programmer runtime evidence. No claim of independent runtime inspection unless performed separately.
