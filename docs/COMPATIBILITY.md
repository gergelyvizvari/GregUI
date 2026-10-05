# Compatibility and verification

## Browser policy

The owner selected React, UK/European apps, and at least two years of browser compatibility. For releases dated 29 September 2026, use the stable browser version current on 29 September 2024 as the rolling-window floor, plus subsequent versions. Freeze supported minima for a package major release; document any later drop as a breaking release.

Initial intended minimum major versions:

| Browser                  | Intended minimum                             | Verification status                     |
| ------------------------ | -------------------------------------------- | --------------------------------------- |
| Chrome desktop / Android | 129                                          | Historical browser/device check pending |
| Edge                     | 129                                          | Historical Windows/Edge check pending   |
| Firefox                  | 130                                          | Historical browser check pending        |
| Firefox ESR              | 115 and later ESR lines active in the window | Historical ESR check pending            |
| Safari macOS             | 18                                           | Real Safari/OS check pending            |
| Safari iOS/iPadOS        | 18                                           | Real device check pending               |

Sources: [Chrome 129](https://chromereleases.googleblog.com/2024/09/stable-channel-update-for-desktop_17.html), [Edge stable archive](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-relnote-archive-stable-channel), [Firefox 130](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/130), [ESR transition](https://support.mozilla.org/en-US/kb/firefox-enterprise-130-release-notes), [Safari 18](https://developer.apple.com/documentation/safari-release-notes/safari-18-release-notes).

Build output conservatively targets Chrome/Edge 109, Firefox 115 and Safari 16.4; these compilation targets do not enlarge the verified support claim. Required browser APIs must be checked separately. Decorative effects have opaque fallbacks. Modern WebKit is not proof of historical Safari behavior, and Chromium phone emulation is not iOS.

## Accessibility and privacy

Engineering target: WCAG 2.2 AA. Automated axe checks cover default views and all five presets in both modes. Interaction tests cover focus return/containment, keyboard tabs, cancellation, loading buttons, field associations and error focus. Token tests verify declared contrast pairs independently of rendered checks.

Still required before claiming production conformity: manual screen-reader runs (NVDA with Firefox/Chrome on Windows; VoiceOver with Safari on macOS/iOS), real target-device testing, page zoom and user text settings, application content and complete flows, procurement-specific EN 301 549 mapping, accessibility statements and any application-specific privacy obligations. No claim of GDPR certification or government approval.

Forced colors and reduced-motion adaptations are included. Color calculations use opaque pairs; glass content surfaces remain opaque. Custom themes, content and third-party integrations must be rechecked.

## Execution evidence

Commands and exact results are recorded in `docs/VERIFICATION.md`. Test results under `test-results/` are generated and ignored by Git. The workbench's quality page deliberately reports targets and remaining review rather than pretending to read live CI status.

React peer range: React/React DOM 19. The installed version is recorded in the lockfile. Browser compatibility and React-version compatibility are separate policies.
