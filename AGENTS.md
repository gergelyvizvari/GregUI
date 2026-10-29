# gregUI workspace

## Product mission

gregUI is the shared visual and interaction foundation for the owner's future applications. Its long-term responsibility is to cover nearly all commonly used visual components, layouts and reusable UI workflows. Build coherent, configurable experiences as well as individual controls.

Treat common features as complete UI journeys. For example, authentication coverage should include sign-in, registration, forgotten-password and reset flows, email verification, social sign-in, and passwordless sign-in using an emailed one-time code, including request, entry, resend, pending, error, retry and success states.

Expose typed, provider-independent interfaces and callbacks so applications can connect their chosen services. gregUI owns reusable presentation, accessibility and interaction behaviour; applications own business rules, credentials, delivery, authentication providers, sessions, persistence and navigation.

When an application needs a common visual capability that gregUI lacks, prefer extending the shared package over creating an application-specific implementation. Keep specialised domain behaviour in consumers.

This mission defines the intended coverage, not the current implementation status. Check public exports and component documentation before using a capability; document missing flows as development candidates.

## Development rules

Read README.md and docs/COMPONENTS.md before changing public APIs. The confirmed product scope is React, UK/Europe and a rolling 24-month browser policy; distinguish support targets from executed verification.

Keep all presentation in packages/react or packages/tokens. apps/playground and examples/consumer use public exports and contain no CSS or arbitrary style/className props. Add reusable component/layout capabilities instead of local app overrides. Keep business logic and application copy in consumers.

Consumers resolve built package exports. Run npm run build:packages after library changes before preview/browser tests. npm run check verifies types, style boundaries, tests and builds. npm run test:e2e checks browser workflows. npm run test:package verifies tarballs outside this workspace and needs registry/cache access. npm run format:check verifies formatting.

Keep theme parsing, all presets, the accent setting, light/dark colors, locale/RTL, portal inheritance and accessibility contracts aligned. Never turn automated checks into a certification claim. Record actual verification and remaining gaps in docs/VERIFICATION.md.

The portable reusable skill is skills/gregui-development/SKILL.md. Change its instructions only when actual APIs or workflows change.

For AI task orientation, read docs/AI-GUIDE.md. Proposed component work is tracked separately in docs/COMPONENT-ROADMAP.md; do not treat proposals as existing APIs.
