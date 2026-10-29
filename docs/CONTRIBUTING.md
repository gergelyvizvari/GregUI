# Extending gregUI

1. Check existing composition and variants first. Add domain-neutral behavior or a supported prop when there is a reusable need; keep application business logic in the consumer.
2. Add semantic tokens only when the role cannot be expressed with existing tokens. All theme presets/modes must define the role; update parsing, contrast pairs and docs together.
3. Implement styling in `packages/react/src/styles.css`. Public APIs omit arbitrary class/style overrides. Use native HTML or existing Radix primitives for interaction semantics.
4. Add a workbench example for meaningful states, usage and keyboard behavior. Expose translated package-owned labels through localization; do not embed application translation catalogs in the package.
5. Test changed behavior, not merely the markup you wrote. Include focus, validation, RTL, theme portals, responsive/reduced-motion states when affected.
6. Run `npm run check`, relevant browser tests and `npm run format:check`. Verify the independent consumer still builds. New claims need evidence recorded in the compatibility/verification documents.
7. Record consumer-facing changes and migration steps. Before 1.0, breaking APIs require a new minor release with explicit migration notes; after 1.0, use a new major release. Browser-minimum drops always require an explicitly announced breaking release.

Do not publish packages or upload user data as part of ordinary local development. Choose registry/access and application adoption separately.

`npm run check:styles` (part of `npm run check`) also runs `scripts/check-library-styles.mjs`. It counts hard-coded hex colours, `rgb()`/`hsl()` colours with literal numbers and literal `font-size` values in `packages/react/src/styles.css`, and fails when any count rises above `scripts/style-literal-baseline.json`, listing the new lines. Write new rules with `var(--g-…)` colour roles and `var(--g-type-…)` sizes instead (add a semantic token if no role fits), `z-index: var(--g-z-…)` layers and the named `breakpoints` widths. If a literal is genuinely required, run `node scripts/check-library-styles.mjs --update` and justify the higher baseline in the commit message; when you remove literals, run it to lower the baseline. Branches that touch the stylesheet in parallel should not regenerate the baseline to resolve conflicts without re-checking what was added.

The workspace style-boundary script checks CSS files, JSX class/style attributes and common styling imports in the two consumer source directories. It is a useful convention check, not a sandbox against arbitrary JavaScript-generated styles. Add new consumer source roots to the script when adding apps.
