# gregUI — reusable UI system

Status: owner decisions recorded on 29 September 2026; the initial React foundation and workbench are now implemented. This document retains the full product direction, including future improvements. See [README](README.md) for delivered scope and [verification](docs/VERIFICATION.md) for executed checks and remaining production validation. No certification is claimed.

## Confirmed decisions

1. **Framework: React.** Build reusable React components. TypeScript is the proposed implementation language. Keep the library usable independently of Next.js, with SSR/hydration compatibility for applications that need it.
2. **Target regions: UK and Europe.** Plan for UK and EU accessibility and privacy requirements. Treat EU requirements as the initial European baseline; assess additional national and non-EU European requirements for each application's actual markets and sector.
3. **Browser compatibility: at least two years backward.** Interpret this as a rolling 24-month browser-version support window, rather than a device-age limit or a React-version guarantee. The operational policy below defines how releases maintain that window.

Internal distribution across owned apps remains the working assumption. These decisions are sufficient to start the React foundation; package publishing infrastructure can be selected before the first release.

## 1. Product Overview

gregUI is a shared UI platform for future applications: design tokens, accessible interactive components, responsive layouts, reusable application patterns, localization support and a theme preview/editor. Applications provide their data, content and business behavior; gregUI owns presentation.

Primary workflow: select a visual preset, configure brand tokens, compose an application using documented components and layouts, and contribute any missing reusable capability back to gregUI.

Confirmed scope: React and responsive web for desktop, tablet and mobile. Working assumptions: TypeScript, internal use across owned apps, English documentation and no account or backend for the initial preview tool.

## 2. Target Users and Core Problem

Primary users are developers and AI coding agents building the owner's future applications. Secondary users are designers maintaining brand themes and people testing accessibility.

The problem is repeated styling, inconsistent behavior, inaccessible custom controls and application-specific component forks. A button library alone will not solve this: shared form patterns, layout primitives and page structures are necessary too.

Organize public documentation by purpose rather than forcing atomic-design terminology. Internally distinguish foundations, components, layouts and patterns.

## 3. Value Proposition and Monetization

The intended benefit is faster application delivery with consistent behavior and centrally maintained UI improvements. Initial success means two separate applications can use the same package without local presentation overrides.

Assume an internal platform without billing, a public marketplace or a paid service. External distribution and commercial support can be considered later; neither is required for the first release.

## 4. MVP Scope

### Architecture and ownership

- Framework-independent token definitions: primitive values → semantic roles → component roles. Ship generated CSS variables and typed theme data.
- A component package with stable public APIs, shared accessibility behavior and explicit variant/size/state contracts.
- A layout and pattern layer for application composition.
- Localization support for package-owned messages, direction and formatting; application copy stays in the consuming application's catalogs.
- A separate preview/editor application, documentation and a small consuming-app example.
- Versioned releases with changelogs, compatibility notes, migration guidance and deprecation periods. Applications choose when to upgrade.

Proposed React repository layout: packages/tokens, packages/react, packages/localization, apps/playground and examples/consumer. Select dependencies against the 24-month browser policy. Publish the supported React peer-dependency range separately; browser support does not imply support for every React version.

### No application CSS contract

Applications compose Stack, Inline, Grid, Container, Section and page templates using typed token-based props. They select supported component variants and pass content, data and event handlers. Arbitrary style objects, utility-class styling and application-level selector overrides are outside the normal contract.

When a feature needs a new layout or visual behavior, first check existing primitives; then add the smallest reusable capability to gregUI, document it, validate it and release it. Business rules and domain-specific data processing remain in applications. Specialized visualizations can require dedicated shared packages; do not promise that every future interface can be anticipated now.

Enforce the contract in participating application repositories with import restrictions and checks for CSS files, style props and styling utilities. Publish clear exclusions for unavoidable third-party integration boundaries; shared adapters own their presentation. Avoid broad escape hatches that quietly recreate app-specific styling.

### Component roadmap

| Area         | Initial release                                                                                                       | Later expansion                                                              |
| ------------ | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Foundations  | Semantic colors, typography, spacing, borders, radius, elevation, motion, layers, breakpoints, icons                  | Additional brand assets and specialized typography                           |
| Actions      | Button, icon button, link, button group                                                                               | Split button and advanced action menus                                       |
| Forms        | Field, label, hint, error, text/password inputs, textarea, native select, checkbox, radio, switch, form/error summary | Combobox, date/time inputs, file upload, slider, complex validation patterns |
| Layout       | Stack, Inline, Grid, Container, divider, card, section, app shell, page header, full-page layout                      | Multi-panel workspace, advanced responsive templates                         |
| Overlays     | Dialog, alert dialog, drawer, backdrop, tooltip, popover                                                              | Complex command palette and coordinated overlay workflows                    |
| Navigation   | Skip link, breadcrumbs, tabs, navigation list                                                                         | Pagination, stepper, command navigation                                      |
| Feedback     | Alert, status message, progress, spinner, skeleton, empty state                                                       | Toast queue and rich activity feedback                                       |
| Data display | Text, heading, badge, list, description list, simple semantic table                                                   | Sorting/filtering tables, tree view, charts, virtualization                  |
| Patterns     | Accessible form, settings page, confirmation flow, loading/error/empty page                                           | Consent preferences, search/filter workflows, multi-step flows               |

Interactive components document keyboard behavior, focus management, accessible names, disabled/read-only/loading/error states and controlled state where applicable. Prefer proven accessible behavior primitives where compatible with the selected stack; do not rebuild difficult interactions merely for ownership of their code.

### Five required visual presets

1. Flat: clear borders, low elevation and straightforward surfaces; default foundation.
2. Glass: translucent decorative surfaces with bounded backgrounds and opaque fallbacks.
3. Soft/neumorphic: gentle paired shadows with explicit control boundaries and visible selected/focus states.
4. Elevated: solid layered surfaces, restrained shadows and strong hierarchy.
5. High-definition outline: crisp borders, minimal effects and distinct interactive states.

Every preset supports light/dark modes, adjustable brand colors and shared component behavior. Compact/comfortable density is a separate setting; it must not remove usable target sizes. Forced-colors support is an accessibility behavior across presets, not a sixth decorative skin.

### Theme editor

Edit semantic roles for background, surface, text, muted text, border, primary action, focus, success, warning and danger. Also edit typography, radius, spacing/density, elevation and motion settings within supported bounds.

Show affected components and states immediately. Display computed contrast for relevant foreground/background pairs; identify unsupported or unverified combinations. Transparent surfaces require evaluation against their actual backgrounds. A palette calculation alone cannot certify accessibility.

Allow draft previews of invalid themes, but distinguish them clearly and block their publication as validated themes. Export/import versioned theme JSON and generated package-compatible tokens. Validate schema, values and migrations on import. Support reset, undo and comparison against the original preset. Initial persistence is explicit local save/download, with no remote service or telemetry.

### Accessibility and public-sector readiness

Use WCAG 2.2 AA as the engineering baseline for UK and European apps. UK government guidance identifies this standard for public-sector websites. For EU public-sector and applicable product/service requirements, also map the relevant EN 301 549 criteria, Web Accessibility Directive, European Accessibility Act and national implementation to each application. WCAG alone does not cover every applicable requirement.

Maintain a dated requirements register distinguishing published standards from versions formally harmonised for a particular directive. The European Commission explains that a new WCAG or EN 301 549 version does not automatically change legal obligations. Verify the applicable reference when preparing a release or procurement claim. Sources: [EU standards and harmonisation](https://digital-strategy.ec.europa.eu/en/policies/web-accessibility-directive-standards-and-harmonisation), [changes to accessibility standards](https://digital-strategy.ec.europa.eu/en/policies/latest-changes-accessibility-standard).

Acceptance coverage includes semantic HTML, keyboard operation, visible and unobscured focus, correct dialog focus containment/return, accessible names and errors, screen-reader announcements, contrast, non-color status cues, zoom/reflow, reduced motion, forced colors and touch input. Aim for 44px touch targets where practical; this is a product usability target, distinct from WCAG 2.2 AA's 24px minimum criterion and its exceptions.

Test components and realistic complete workflows. Automated checks are supplemented by manual keyboard and screen-reader checks on a documented browser/assistive-technology matrix. No claim of certification based solely on automated tests or the component package. Applications retain responsibility for content, page structure, complete processes and deployment-specific accessibility statements.

Sources: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [target size criterion](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum/), [UK public-sector requirements](https://www.gov.uk/guidance/accessibility-requirements-for-public-sector-websites-and-apps).

### Privacy support

No default analytics, tracking identifiers, external font calls or third-party network requests from UI components. Do not log field values. Use synthetic content in previews. Expose hooks for application-level consent and privacy flows when required.

Plan for both EU GDPR and UK GDPR, with application-specific national privacy and electronic-communications requirements where applicable. GDPR compliance depends on the application's processing, lawful basis, retention, security and organizational practices. A UI package cannot guarantee it. Consent controls, if added, must connect to actual application behavior rather than merely display a banner.

Source: [ICO — data protection by design and default](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/guide-to-accountability-and-governance/data-protection-by-design-and-by-default/).

### Localization

Avoid hardcoded package-owned English strings and sentence concatenation. Provide replaceable messages, plurals and locale-sensitive number/date formatting, explicit locale/time-zone inputs and correct language/direction metadata. Use logical layout properties for RTL where supported by the agreed browser matrix. Ensure identifiers and server/client rendering stay stable.

Validate long translated strings, pseudolocalization and at least one RTL example. Applications select their translation system through an adapter; gregUI should not require one app-wide translation vendor.

### Release and verification gates

Every new component or variant includes API documentation, state examples, accessibility expectations and responsive behavior. Meaningful interaction tests cover behavior, while visual checks cover representative preset/mode/density combinations. Validate all five presets before advertising parity.

Release gates: type/build checks; public package exports and clean consumer installation; interaction and accessibility checks; agreed browser matrix; visual regressions; keyboard and screen-reader checks for affected interactions; SSR/hydration checks if the chosen framework requires them. Record known limitations and affected versions.

### Delivery sequence

1. Use the confirmed React, UK/Europe and 24-month browser scope to pin the initial browser/OS matrix and compatible dependencies; retain internal distribution as the working assumption.
2. Implement one vertical slice: tokens, Flat theme, layout primitives, Button, Field/Input, Dialog and a responsive settings page in a separate consumer.
3. Add theme editing and the other four presets; verify shared behavior and accessible states.
4. Complete the initial component catalog, localization adapter and documentation.
5. Validate with a second real application, refine missing shared patterns and publish the first supported version.

Do not add authentication, billing, cloud theme storage, a native mobile library, a full rich-text editor or an enterprise data grid to the initial scope.

### Reusable skills

Once the first implementation establishes real conventions, create project-specific skills for: consuming gregUI without local styling; extending a component/variant; and validating themes and releases. Their instructions must reference actual commands, APIs and evidence requirements. The first combined development skill is now implemented at `skills/gregui-development/SKILL.md` and installed in the owner’s personal skills directory. Split it into separate skills only when real workflows warrant it.

## 5. Screen Map

| Screen/surface            | User and purpose                   | Main content and states                                                                                                                |
| ------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Overview                  | Developer onboarding               | Install/use instructions, preset previews, browser support and version status                                                          |
| Foundations               | Designer/developer token reference | Color roles, typography, spacing, motion, layers and usage examples                                                                    |
| Component catalog         | Developer discovery                | Search, categories, component preview and documented variants                                                                          |
| Component detail          | Developer implementation/testing   | API, keyboard behavior, examples, responsive/RTL previews and state gallery                                                            |
| Theme editor              | Designer brand configuration       | Semantic token controls, five presets, live previews, contrast findings, undo/reset/import/export                                      |
| Pattern gallery           | App builder composition            | Form, settings, full-page flow, dialog/drawer and data page examples                                                                   |
| Quality and compatibility | Maintainer evidence                | Supported versions, verification results, manual-check records and known limitations; clearly distinguish planned from executed checks |

The preview/editor's own controls also use gregUI. Keep editor chrome visually stable while scoping edited themes to the preview, so a broken draft palette does not make editing unusable.

## 6. Responsive UX Rules

- Design from narrow widths upward; validate content at 320 CSS pixels and zoomed layouts, with documented exceptions such as intrinsically two-dimensional tables.
- Use content-driven breakpoints and flexible layout primitives. Support desktop, tablet, portrait/landscape phones, mouse, keyboard and touch.
- Collapse catalog navigation into an accessible drawer on small screens. Keep primary page actions reachable without obscuring focused elements.
- Forms become a single column when labels and controls cannot fit comfortably. Do not truncate essential instructions or errors.
- Complex dialogs may use a full-screen presentation on phones without changing their accessible purpose or resetting state. Drawers need an explicit modal/non-modal contract.
- Preserve semantic table relationships; provide a labeled scroll region or an intentional alternative representation when needed.
- On phones, switch the editor between controls and preview with labeled navigation rather than compressing both panes beyond usability.
- Browser support follows the rolling 24-month policy below. Required features have functional fallbacks; decorative blur, animation and shadows can degrade without loss of content, keyboard operation or essential controls.

### Browser support policy

- Cover desktop Chrome, Edge, Firefox and Safari; iOS/iPadOS Safari; Android Chrome; and Firefox ESR versions active during the supported window. Other embedded webviews or browsers need explicit validation before a support claim.
- At release date D, include the stable version current at D minus 24 calendar months and all subsequent stable versions through D for each listed family. Including the version current at the cutoff avoids leaving a gap when its release predates that cutoff. Record exact versions and supported OS combinations in the release matrix.
- For an initial release dated 29 September 2026, the window would begin on 29 September 2024. The initial intended major-version minima and vendor references are now recorded in `docs/COMPATIBILITY.md`; historical browser/device tests remain pending.
- Test the oldest supported and current versions per browser family, plus intermediate versions with known feature differences. Run real Safari/iOS checks for the target versions; a current WebKit test engine does not prove older Safari support. Record untested combinations honestly.
- Select JavaScript output, CSS features, dependencies and any focused polyfills against the oldest supported versions. Use feature detection and progressive enhancement. Essential behavior must work without optional blur or other decorative effects.
- Freeze the declared matrix for each package major version. Advance minimum versions only in a documented major release, preserving at least 24 months at that release date. This keeps a routine patch from silently dropping a consuming application's browser support.
- Track React peer versions separately. The browser policy concerns functional compatibility, not a recommendation to keep outdated browsers installed or a guarantee of their vendor security support.

## 7. Visual Theme Direction

The default environment should feel precise and dependable: readable system typography, spacious forms, clear surface boundaries, restrained color and predictable hierarchy. Decorative effects are opt-in presets with identical component semantics.

Use semantic roles rather than component-specific arbitrary colors. Keep status colors distinct from branding. Use a consistent spacing scale, type scale, corner-radius scale and layer ordering. Light/dark, density and brand choices must not create independent component forks.

Government-facing applications may require their jurisdiction's established design language and service patterns. None of the five presets is automatically government-approved.

## 8. AI Designer Brief

Design a responsive UI-system workbench named gregUI for developers and designers building multiple applications from a shared component library. Its job is to demonstrate reusable components, configure brand themes and expose quality evidence.

Design these screens in order: overview, foundations, component catalog/detail, theme editor, pattern gallery, quality/compatibility. On desktop use persistent navigation, a clear page heading and a generous main workspace. In the theme editor provide token controls beside a live preview, with validation findings and import/export actions. On phones use a navigation drawer and separate accessible controls/preview views.

Show Flat, Glass, Soft/neumorphic, Elevated and High-definition outline presets applied to the same form, buttons, card and dialog. Include light and dark examples; keep visible focus, readable labels and explicit control boundaries in every style. The editor chrome stays stable while the preview changes.

Include normal, hover, focus, disabled, loading, invalid and success examples where meaningful. Show long translations, an RTL preview, narrow layouts, theme validation errors and empty search results. Label quality evidence as illustrative until real verification is available. Do not imply legal certification or invent accounts, billing or cloud collaboration features.
