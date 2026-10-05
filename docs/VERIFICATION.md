# Verification record — 29 September 2026

## Authentication style selector

Added a labelled Preview style selector on the Authentication page, connected to the existing shared theme state. `npm run check` passed (53 unit/interaction/SSR tests and all builds). Four targeted browser checks passed across Chromium, Firefox, WebKit and mobile Chromium: all five styles switch in place, entered email survives switching, the selection stays synchronized across navigation, narrow reflow works and axe reports no violations. The desktop screenshot was visually reviewed.

## Editorial and material refinement

`npm run check` passed with 53 unit/interaction/SSR tests, TypeScript, the consumer styling boundary and all package/application builds. Formatting passed. The complete production-preview suite passed all 56 browser checks across Chromium, Firefox, WebKit and mobile Chromium emulation. This includes all five authentication materials in both light and dark modes, axe checks, existing authentication flows and narrow reflow. Desktop composition, mobile overview, dark Glass and the distinct authentication treatments were visually inspected.

An initial page opacity entrance caused transient contrast failures; the final entrance uses translation only. A final scoped icon-motion token also prevents nested reduced-motion themes inheriting hover movement. The eight targeted motion/reflow browser checks were repeated after that adjustment. Screenshots are saved in `images/editorial-overview.png` and `images/editorial-soft-auth.png`. These checks do not establish full accessibility conformance or historical-browser support.

## Optional Google/Apple controls

`npm run check` passed with 53 unit/interaction/SSR tests and all builds. Provider checks cover omitted/single/both buttons, no credential submission through provider callbacks, pending request locking, failure/retry and translated labels. All 12 targeted browser checks passed, including the existing auth flows and provider scenarios across Chromium, Firefox, WebKit and mobile Chromium, with axe and responsive checks. These are simulated provider callbacks; no real Google/Apple OAuth integration was executed.

## Authentication patterns

`npm run check` passed with 51 unit/interaction/SSR tests and all package/application builds. New checks cover translated password visibility, duplicate submission blocking, remember payloads, rejection/retry, code paste/autofill and clearing credentials between flows. The isolated tarball install also rendered the new LoginForm successfully. The existing 40 browser checks passed; all eight final auth checks passed, covering all six screens with axe, 320px reflow, Hungarian copy and complete login/registration/recovery/code flows in Chromium, Firefox, WebKit and mobile Chromium. Password mismatch feedback uses an inline error and field focus after a Firefox issue with native validation popups. Desktop and mobile screenshots were visually reviewed. No real authentication provider or email delivery is configured.

## Motion refinement

Shared control and overlay motion was checked with 47 unit/interaction/SSR tests and all builds. The browser run passed 36 checks and initially exposed four transient contrast failures during mode changes. Background-colour interpolation was removed so text/surface pairs switch together. All eight targeted reruns passed, covering all five styles in light/dark plus motion, overlay positioning, theme reduced motion and system reduced motion (including pseudo-elements) across all four browser projects. The settled dialog was visually inspected in the live workbench.

## Palette choices

Five palette families are available for every style, each in light/dark. `npm run check` passed with 47 unit/interaction/SSR tests, including contrast and JSON round trips for all 50 style/palette/mode combinations. Eight targeted browser checks passed across Chromium, Firefox, WebKit and mobile Chromium: palette selection, mode retention, Undo, saved draft restoration and default-view accessibility/reflow. The palette selector and a Forest Glass preview were visually inspected. This was targeted verification, not a repeat of the entire browser suite.

## Five-style redesign

All five presets now have individual light/dark palettes and component treatments. The redesigned workbench was inspected live, and all ten preset/mode screenshots plus the mobile overview were visually reviewed. The full production-preview browser suite passed again: 32 tests across Chromium, Firefox, WebKit and mobile Chromium emulation, including axe checks, theme editing, RTL dialogs, forms and narrow reflow. All 21 unit/interaction/SSR tests and package/application builds passed. These checks do not replace the outstanding manual accessibility and historic-browser validation below.

## Density follow-up

Compact and comfortable standard fields now render at 36px and 52px respectively on desktop, verified in Chromium, Firefox and WebKit. Touch-emulated fields render at 44px and 52px. Density controls padding, button sizes, field gaps and textarea minimum height; the shared font reset no longer overrides component font sizing. Desktop screenshots were reviewed, narrow layouts had no horizontal overflow, and axe checks passed for both densities in desktop/touch contexts. `npm run check` (21 tests and all builds) and formatting checks passed. This was targeted verification, not a repeat of the complete initial browser suite.

## Select chevron spacing follow-up

The shared single-select indicator now sits 0.8rem inside the logical end, with reserved label space. Chromium, Firefox and WebKit checks passed for keyboard type-ahead/selection, RTL dark mode, 320px reflow and axe checks on the affected preview. LTR, RTL and forced-colors screenshots were inspected. `npm run check` and `npm run format:check` passed; both consumer builds include the fix. The full 32-test browser suite below records the initial release, not a repeat run for this styling fix.

This records local execution for the initial 0.1.0 foundation. It is not a certification or a historical-browser support claim.

| Check                                     | Result                                                                                                          |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| TypeScript                                | Passed                                                                                                          |
| Consumer style boundary                   | Passed for workbench and independent example                                                                    |
| Unit, interaction and SSR/hydration tests | 21 passed                                                                                                       |
| Production builds                         | All three packages, workbench and consumer passed                                                               |
| Production-preview browser suite          | 32 passed across four projects                                                                                  |
| Isolated package installation             | Three tarballs installed outside the monorepo; public SSR render, theme export and stylesheet resolution passed |
| Formatting                                | Passed                                                                                                          |
| Dependency audit                          | 0 reported vulnerabilities at verification time                                                                 |
| Reusable skill validation                 | Passed; installed at `/Users/greg/.codex/skills/gregui-development`                                             |

Browser projects used Playwright 1.63.0 with Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6 on this Mac. The fourth project uses Chromium with iPhone 13 viewport/input emulation. It is not a real iPhone or Safari test.

The browser suite covers the overview, all five presets in both light/dark modes, axe WCAG A/AA rules, theme save/restore/undo/import/export, RTL dialog focus containment and return, settings validation, catalog filtering, supporting pages, 320px reflow and reduced motion. Axe reports no violations in the tested views. It does not prove complete WCAG conformance.

Desktop and mobile screenshots were visually reviewed. On narrow screens the current editor uses stacked full-width preview and controls; a persistent preview/control tab switch remains a workbench usability improvement from the longer-term brief.

A stale development optimization cache appeared after dependency upgrades. The final browser suite instead builds and serves a fresh production bundle on a dedicated test port, avoiding shared dev-server cache state. All final browser results above are from that production bundle.

Environment: Node 22.20.0, React 19.3.0, Vite 7.3.6 and Vitest 4.1.11. Exact dependency resolutions are in `package-lock.json`.

## Outstanding production validation

- Historical browser/OS versions listed in COMPATIBILITY.md, actual iOS/iPadOS devices and Windows Edge/ESR combinations.
- Manual NVDA and VoiceOver checks, actual browser zoom/text settings and broader user testing.
- Full forced-colors interaction review; CSS adaptations exist, but this record does not claim a manual Windows high-contrast test.
- App-specific content, complete workflows, third-party components, accessibility statements and applicable UK/EU privacy and procurement requirements.
- Registry publication and adoption in two real future apps. The isolated consumer verifies packaging, not those future application integrations.

CI is configured in `.github/workflows/quality.yml`; it has not run on a remote service as part of this local setup.

## Workflow component expansion

Added Accordion, Pagination, Stepper and Wizard, plus catalog examples and the Patterns → Onboarding demo. `npm run check` passed with 58 unit/interaction/SSR tests, type checking, the consumer styling boundary and all builds; formatting passed. Coverage includes independent disclosures, pagination bounds and localized labels, current/completed step semantics, async validation, focus movement, pending completion locking, failure/retry and server hydration of the new components.

All 12 targeted browser checks passed. Desktop and mobile screenshots were visually reviewed. Targeted browser verification covers required-field validation, retained values on Back/Continue, disclosure expansion, failed save/retry/success, paginated content, axe checks and responsive reflow across Chromium, Firefox, WebKit and mobile Chromium emulation. All ten material/mode combinations are checked for the Wizard and Stepper. This remains local automated evidence, not accessibility certification or historical-browser validation.

## Twenty-component application kit

The expansion adds the twenty exports documented in EXPANDED-COMPONENTS.md and interactive examples in the searchable catalog. `npm run check` passed with 75 unit/interaction/SSR tests, all package/application builds and the no-consumer-styles check. Type checking and formatting also passed. An isolated tarball install verified public rendering of TreeView, Timeline and Combobox along with existing components, stylesheet resolution and theme export.

The complete browser suite passed 81 checks with three intentional skips: the ten-material/mode matrix runs once in Chromium rather than repeating in each project. Targeted browser checks passed for all twenty examples in Chromium, Firefox, WebKit and mobile Chromium emulation, including axe and overflow checks, tree keyboard navigation, combobox selection/Escape, command focus return, profile saving, invitation/role changes, comments and approval. The material/mode matrix checks the whole catalog in Chromium. Unit tests additionally exercise RTL tree expansion, numeric sorting and selection, upload rejection, required consent categories, pending locks, failure/retry and draft retention. Desktop screenshots exposed excessively wrapped table headers; the table now scrolls within its named region and uses compact, accessibly labelled selection controls. Desktop data/profile/tree/timeline and a 320px dark Soft tree were visually reviewed. After expanding single search results to the full catalog width, all four targeted catalog checks passed again; the rebuilt data-table screenshot was visually reviewed.

See the component contracts for deliberate first-version limits: no server data engine, tree virtualisation, rich text editor, file-transfer service, payment processor or permission enforcement is bundled. These are UI components with typed application callbacks. Historical-browser and manual assistive-technology validation remain outstanding as recorded above.

## Usability review

The pricing screenshot and catalog review led to the changes recorded in USABILITY-REVIEW.md: explicit current-plan state, shared pricing locks, clearer table/list selection, combobox selection and scrolling, action-menu dismissal, file clearing and role/privacy save feedback. Package/application builds, type checking and style boundaries passed; the final unit/interaction/SSR run passed 79 tests. Formatting passed. The targeted browser run passed 21 checks across Chromium, Firefox, WebKit and mobile Chromium emulation, with three intentional skips for the catalog-wide theme matrix (run once in Chromium). Pricing itself was exercised in all ten preset/mode combinations in every project. Desktop and mobile pricing screenshots were visually reviewed. This is targeted verification, not a repeat of the entire previous regression suite or a full usability certification.

## ImageRegion — 2026-09-29

`npm run check` passed with 80 tests, including keyboard creation, movement, resizing and removal of image regions. The workbench example passed typecheck and production build. GregTest browser integration verified pointer selection, keyboard editing, upload/persistence and responsive read-only rendering at 390px; Chromium only. Broader browser/assistive-technology verification of this new component remains unperformed.

## 2026-10-03 — editorial application surfaces

Added opt-in AppShell editorial/dashboard appearances, brandMark, FeaturePanel, MediaCard and PulseMark. Default shell API remains compatible. Workbench Patterns contains image-led examples. Verified: 80 unit/interaction/SSR tests, all builds including independent consumer, types and formatting; three targeted Chromium checks (default accessibility, supporting-page accessibility, 320px/reduced-motion reflow) passed. CityLink consumer passed its build and eight existing browser regression tests. No new manual visual verification or authenticated CityLink admin browser validation was completed; these remain required before declaring visual acceptance. No additional Firefox/WebKit coverage was run for this change.

### City Pulse follow-up

Added immersive FeaturePanel, EditorialLead, SignalCard, ChipLink and AccentLink with explicit hex/4.5:1 action-palette validation. 82 unit/interaction/SSR tests, workspace types/style boundary, all builds and formatting passed. Two targeted Chromium supporting-page axe and 320px/reduced-motion tests passed. New CityLink homepage axe/reflow assertions passed at 1280px and 390px. Manual visual acceptance remains unverified due to the host browser access restriction. No new Firefox/WebKit claims.

## 2026-10-05 — Dashboard sidebar overflow and density

Dashboard sidebars now stay within 100dvh and scroll independently, including wheel containment. Dashboard navigation uses density padding and retains 44px minimum targets. No public API change. CityLink consumes the built package through a new local tarball; no package was published.

Verification: npm run check passed (82 tests, type/style checks, package/workbench/consumer builds). Chromium workbench default-view accessibility and five-preset light/dark checks passed (2 tests). CityLink's HU/EN regression covers a 1366×600 viewport, reaching and activating bottom navigation by keyboard without moving the document, control alignment, and 390px reflow; broader admin tests cover mobile drawer Escape/focus and axe. A live local CityLink admin was visually inspected. This is not cross-browser certification or manual screen-reader acceptance.
