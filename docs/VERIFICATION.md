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

### Field editor components — 2026-10-06

Added FieldEditorItem and TagInput with a workbench example. `npm run check` passed (84 tests, types, consumer styling boundary, package/workbench/consumer builds); `npm run format:check` passed. Analise Lab consumes the rebuilt local tarball; its 66 tests and production build passed. Fixture-only Chromium integration checked 17 choices, an unbroken long token, attached removal controls, input alignment in compact/comfortable density, 390px containment, keyboard add/remove focus, preview focus return, and unchanged reference metadata. Desktop/mobile screenshots were visually inspected. Mobile viewport emulation is not a physical-device test; no new Firefox/WebKit or assistive-technology coverage is claimed.

### HighlightedTextarea — 2026-10-06

Added a native plain-text editor with decorative whole-word emphasis and a workbench example. `npm run check` passed (86 tests, types, style boundary and all builds). Analise Lab passed 69 tests, typecheck and production build. Fixture-only Chromium checks passed for exact field-name matching, reactive field renames, literal text preservation, paste cleanup with native undo, synchronized scrolling, resizing and 390px containment. Desktop/mobile and dark-mode screenshots were visually inspected. No saved prompt data was changed during browser verification. No new Firefox/WebKit, physical-device or screen-reader verification is claimed.

## Theme selector — 6 October 2026

Added the controlled ThemeSelector with all five styles/palettes, light/dark mode, consumer-owned translated labels and a workbench preview. `npm run check` passed (88 tests, type checking, consumer style boundary and package/workbench/consumer builds); `npm run format:check` passed. The Analise consumer passed its type check, production build and 71 unit tests, including all 50 stored appearance combinations and invalid-value recovery. Its isolated Chromium Settings workflow passed admin, runner, tester and local fixtures at desktop and 390px mobile widths, exercising all choices, mode changes, Tab focus, persistence across reload, density retention and tab navigation. Desktop/mobile Glass + Plum dark screenshots were visually inspected. No new Firefox/WebKit, real-device or assistive-technology claims are made.

### Large workflow dialog — 2026-10-06

Added opt-in Dialog size="large" with a bounded desktop surface, scrolling content and fixed header/footer; existing default dialogs remain unchanged. Package check passed (88 tests, types, style boundary and builds). Analise Lab check passed (72 tests and build). Live Chromium verified four-step run setup navigation, preserved selections, disabled start with incomplete selections and focus return after closing. No paid runs were started. Mobile and cross-browser coverage were not rerun.

### ThumbnailChoice — 2026-10-06

Added native checkbox selection cards with contain-fit image previews and text fallback, plus a catalog example and interaction test for whole-card/keyboard selection. Package check passed (89 tests, types, boundaries, builds); Analise Lab passed 72 tests and build. Uses existing authenticated asset retrieval with object-URL cleanup. Desktop Chromium preview checked in the run setup; no paid runs started. Physical touch-device and cross-browser checks were not rerun.

ThumbnailChoice visual refinement: larger contain-fit previews, corner checkboxes, softer selected borders and stronger captions. Live desktop Chromium gallery visually checked; shared interaction tests remain passing (89), and consumer tests/build passed (72). No mobile or cross-browser verification added.

2026-10-06: Added compact read-only ImageRegion preview and a portrait catalog example. Consumer desktop verification covers the Playground preview; annotation mode remains at natural geometry.

### Extended appearance catalogue — 2026-10-06

Added Editorial, Porcelain, Aurora, Studio and Canvas; Ocean, Rose and Amber palettes; and palette-aware PresetOption previews. All 160 preset/palette/mode combinations pass declared contrast checks and import/export/mode-switch tests. `npm run check` passed with 155 tests, types, consumer style boundaries and all builds. Analise consumer passed 85 tests and its production build, including account preference validation, ordered saves and account-switch isolation. Desktop Chromium appearance picker visually inspected. No new Firefox/WebKit or assistive-technology verification claimed.

### Material styles — 2026-10-06

Added Joyful, Professional, Clay and Neumorphic with component-wide material treatment and new catalogue previews. All 224 style/palette/mode combinations pass declared contrast and round-trip tests; `npm run check` passes with 195 tests and all builds. Analise passes 85 tests and production build; final material refinements also pass consumer type checking and appearance tests. Live desktop Chromium inspected Clay light, Neumorphic light/dark and Joyful light. Preserved focus outlines; no horizontal overflow in the inspected desktop viewport. Mobile and other browser engines were not rerun.

### Contemporary directions — 2026-10-06

Redesigned Workspace (professional) and Bloom (joyful) as complete contemporary shells, with Iris/Lagoon palettes, sidebar treatments, navigation icons in the Analise consumer, lighter controls, rounded typography and full-workspace preview cards. Five featured styles replace the expanded picker; legacy IDs remain importable. Shared checks cover all 280 preset/palette/mode combinations (223 tests overall). Desktop Chromium inspected both complete directions. Physical devices and other engines were not rerun.

## 2026-10-06 — responsive previews and restrained material depth

Restored Flat as the sixth featured choice. The picker uses the shared width-aware auto grid; miniature previews hide their decorative rail in narrow cards. Clay and Neumorphic controls and nested cards use restrained shadows. Glass outer cards are translucent over a coloured workspace background; inputs remain opaque. `npm run check` passed (223 tests and all builds); the Analise consumer passed 85 tests, types and production build. Browser screenshots of isolated shared-component fixtures were inspected in desktop light/dark Glass and in 320px dark Clay and 390px light Glass iframe viewports. This is viewport verification, not a physical-device or cross-engine claim.

## 2026-10-06 — panel grouping and table separators

Tables now use the subtle line colour for the outer border and row dividers, with a lightly tinted header. Interactive control/focus borders are unchanged. Analise groups previously bare library filters/table, run selectors, saved responses, prompt list and tester search into Cards. Shared checks passed (223 tests and builds); consumer checks passed (85 tests, types and build). The live Test cases page was visually inspected in dark Forest, including the filter panel alongside the case editor. Other browser engines were not rerun.

## 2026-10-06 — card action alignment

Added optional Card footer composition and applied it to Analise's three home actions. Shared checks passed (223 tests and builds); consumer checks passed (85 tests, types and build). A Chromium fixture using the actual shared components showed all three 52px buttons at y=131.3984375 despite the middle card having no description. No fixed card height or filler text is used.

## 2026-10-06 — compact selection column

DataColumn supports `width: 'compact'`; the forced 34rem DataTable minimum has been removed so natural column sizes determine scrolling. Analise's selection header is `#`. Live Chromium inspection measured the selection column at 60px and the whole table at 452.67px within its 453px container, with all three action icons visible. Shared check passed (223 tests/builds), consumer check passed (85 tests/build).

## 2026-10-06 — themed accordions

Accordion border, radius, fill, shadow and blur now follow panel material variables; internal dividers use the subtle line colour. Expandable field-editor rows also use themed corners and restrained nested shadows. Shared check passed (223 tests/builds) and Analise check passed (85 tests/build). The final field-editor CSS refinement was package-built and visually inspected in live Chromium. Workspace-theme Comparison accordions were opened and closed with Enter; focus remained visible, open corners measured 12px, and nested rule rows were visually checked. Other engines were not rerun.

## 2026-10-06 — quieter page hierarchy

Added compact Metric composition, restrained nested card/accordion/editor borders and shadows, and reduced DataTable cell padding without shrinking controls. Analise uses compact library summaries, ghost row actions, and a full-width list when no case editor is selected. Shared checks passed (223 tests/builds) and consumer checks passed (85 tests/build). Live Chromium inspection covered the summary strip, denser table and case editor side by side in Workspace. The user's open editor was preserved; the no-selection full-width branch was code/type checked rather than exercised in that live session.

## 2026-10-06 — quiet visual guidance

Workspace fields use a lightly tinted opaque surface. Shared field labels/card headings and code-block corners follow a quieter hierarchy. DataTable activeRowId links an open detail panel to its row independently of bulk selection; selected and hovered rows receive restrained palette-derived tints. Buttons no longer translate on hover/press, and row transitions respect reduced motion. Shared check passed (223 tests/builds); Analise check passed (90 tests/build). Live Chromium Workspace inspection confirmed the open 128.jpg row marked active while remaining unchecked, alongside the editor. Other themes/engines were not manually rechecked in this pass.

### Clay card spacing (2026-10-06)

Clay cards now reserve 24px around content while preserving larger padding and explicit zero-padding surfaces. `npm run check` passed (223 tests, types, consumer style boundary and builds). The packaged Analise consumer passed typechecking and its tester-preview browser flow; desktop (1440px) and mobile (390px) Playground screenshots were inspected with the Rose/Clay light theme, including the empty results and test-case cards. No horizontal overflow was detected. Other browser engines and dark-mode visual review were not run for this change.

### Accordion header spacing (2026-10-06)

`npm run check` passed (223 tests, typecheck, style boundary and builds), as did `npm run format:check` and the Analise consumer typecheck. Chromium screenshots were inspected for Workspace and Clay light themes, expanded/collapsed headers and mobile layout. Single-line headers measured 56px high with 16px vertical padding; horizontal insets measured 20px for Workspace and 24px for Clay. Enter/Space toggling and mobile overflow checks passed. Dark mode and other browser engines were not visually checked.

## File upload adoption — 7 October 2026

The existing FileUpload now includes an upload icon, themed native selector button and visible container focus, plus optional directory selection and consumer hint. Directory drops are deliberately ignored; native directory selection preserves relative paths. The workbench includes a folder example. `npm run check` passed (224 tests, style boundary, types and all builds); `npm run format:check` passed. The targeted file-clearing browser workflow passed in Chromium and mobile Chromium emulation. In analisePrompt, the local tarball was installed and all six native upload fields were replaced; image selection, filename display, clearing, focus, directory attribute and narrow containment passed browser checks, and desktop/mobile screenshots were inspected. The consumer's 98 tests and production build passed. No real upload requests were made during browser checks; directory-picker interaction, Firefox/WebKit and real mobile devices were not exercised in this change.

## Compact instruction editor — 7 October 2026

Added opt-in HighlightedTextarea small size: 14px on wide, fine-pointer screens with matching mirror typography; narrow/touch screens retain 16px. `npm run check` passed (224 tests and all builds). The analisePrompt consumer typecheck passed; Chromium checks verified both sizes, matching highlight layers, text editing, paste cleanup, native undo and narrow containment. Desktop screenshot inspected. No new browser-support claims.

## Shared instruction font — 7 October 2026

HighlightedTextarea now offers opt-in body typography with same-width emphasis to preserve native caret/wrapping alignment. The default monospace variant remains unchanged. Library check passed (224 tests and all builds); consumer typecheck and Chromium desktop/mobile checks passed for shared font family, matching mirror typography, scroll synchronization, paste, undo and text editing. Desktop screenshot inspected.

## Glass scrolling backdrop — 7 October 2026

The main-content decorative background is viewport-fixed so Glass gradients stay anchored while content scrolls. `npm run check` passed (224 tests, types, consumer style boundary and all builds). CityLink, using linked built exports, was checked in Chromium at 1440px and 390px: document scrolling reached 338px and 400px, both gradient layers resolved to fixed attachment, and no horizontal overflow occurred. Desktop before/after and mobile scrolled screenshots were visually inspected. The public page uses demo content. Authenticated admin, dark mode, Firefox/WebKit and physical mobile devices were not checked in this pass; this is not a full accessibility or browser-support certification.

## More translucent Glass cards — 7 October 2026

Card surface tint was reduced from 82% to 60%, with 24px backdrop blur and 1.25 saturation. Library `npm run check` passed (224 tests, types, style boundary and builds). The featured-preset light/dark accessibility workflow passed in Chromium and mobile Chromium emulation; Glass light/dark desktop screenshots were visually inspected. These checks cover the workbench backdrops, not arbitrary consumer backgrounds. Firefox, WebKit and physical devices were not checked in this pass.

## Glass reflections and illuminated edges — 7 October 2026

Glass now combines mode-specific 36%/46% surface tints, a diagonal reflection, illuminated inset edges, 18px blur, 1.65 saturation and three background light fields. Reduced transparency and missing backdrop-filter support fall back to solid surfaces. Library `npm run check` passed (224 tests and builds); the featured-preset light/dark accessibility workflow passed on Chromium and mobile Chromium emulation. The Analise Playground was previewed using intercepted fixture responses with no server writes; light/dark desktop and mobile views had no horizontal overflow, and desktop plus light mobile screenshots were inspected. Firefox, WebKit, physical mobile devices and arbitrary consumer backgrounds remain unverified.

## Warm mist background — 7 October 2026

Replaced the saturated Glass background spots with broad, low-chroma mist and warm diffused light, with separate dark-mode strengths. Preview and workspace backgrounds share the atmosphere; the workspace background now continues below short content. Library check passed (224 tests and builds), as did the Chromium/mobile Chromium featured-preset light/dark accessibility workflow. Analise check passed (106 tests and production build). Installed-package Playground screenshots were inspected in light/dark desktop and light mobile using mocked API responses; neither mode overflowed at 390px. No real data writes or provider calls were made. Other browser engines and physical devices remain unverified.

### AppShell viewport fill (2026-10-07)

The workspace now owns decorative backgrounds and uses a flex column so main content fills the remaining viewport height. Verified a short Glass dashboard rendered from the packaged components at 554×747 and 1920×1080 in the Codex browser: main/workspace bottom equals viewport height, with no horizontal overflow. The authenticated Analise screens were not inspected because the local app required sign-in. `npm run check` passed (224 tests and builds); the changed stylesheet passes Prettier.

## Sticky toolbar — 2026-10-07

Added opt-in AppShell `stickyToolbar`. `npm run check` passed (224 tests and package/consumer builds); `npm run format:check` passed. In the Analise consumer, Chromium with isolated local fixtures kept the toolbar at y=0 after scrolling 419px at 1440px width and 500px at 390px width. Consumer typecheck passed. Other browser engines and physical mobile devices were not tested for this change.

## 2026-10-11 — long-form editor composition

EditorLayout, FormSection and FormActions added for local CityLink integration. npm run check passed: 225 tests plus type/style boundaries, packages, workbench and independent consumer builds. Targeted Chromium/mobile Document editor tests passed (2/2), with light/dark axe and overflow checks. Changed source files pass Prettier. CityLink linked exports rebuilt; profile-to-event flows and save/focus/relationship checks passed in HU 390px and EN 1280px fixtures. No package publication or deployment. Firefox/WebKit, full browser suite, screen readers and physical devices were not revalidated for this addition.

## 2026-10-12 — BrandPreview

Added a shared, theme-scoped brand landing preview with decorative logo/cover, identity fallback, optional translated hero and 390px compact width. Workbench Patterns includes a specimen. `npm run check`: 226 passing tests and builds; `npm run format:check` passes. CityLink consumer browser checks cover HU/EN city and organisation editors, mobile/desktop width, light-to-dark theme change, media decoding, hero visibility, axe and overflow. This is simulated consumer data, not device certification or a full browser matrix.
