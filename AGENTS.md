# gregUI workspace

Read README.md and docs/COMPONENTS.md before changing public APIs. The confirmed product scope is React, UK/Europe and a rolling 24-month browser policy; distinguish support targets from executed verification.

Keep all presentation in packages/react or packages/tokens. apps/playground and examples/consumer use public exports and contain no CSS or arbitrary style/className props. Add reusable component/layout capabilities instead of local app overrides. Keep business logic and application copy in consumers.

Consumers resolve built package exports. Run npm run build:packages after library changes before preview/browser tests. npm run check verifies types, style boundaries, tests and builds. npm run test:e2e checks browser workflows. npm run test:package verifies tarballs outside this workspace and needs registry/cache access. npm run format:check verifies formatting.

Keep theme parsing, all fourteen presets, light/dark colors, locale/RTL, portal inheritance and accessibility contracts aligned. Never turn automated checks into a certification claim. Record actual verification and remaining gaps in docs/VERIFICATION.md.

The portable reusable skill is skills/gregui-development/SKILL.md. Change its instructions only when actual APIs or workflows change.
