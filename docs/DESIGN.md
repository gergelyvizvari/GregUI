# Visual direction

The September 2026 redesign uses five deliberately different material treatments. Each has an independent light and dark palette; semantic roles keep the colour editor and exports consistent.

| Preset   | Direction                        | Component treatment                                                                 |
| -------- | -------------------------------- | ----------------------------------------------------------------------------------- |
| Flat     | Forest, quiet precision          | Clean planes, restrained corners, fine borders, minimal elevation                   |
| Glass    | Plum, luminous depth             | Atmospheric backdrop, rounded translucent panels, inner highlights, layered shadows |
| Soft     | Clay, tactile surfaces           | Warm tonal planes, opposing raised shadows, inset fields                            |
| Elevated | Blue, layered clarity            | White or navy cards, floating elevation, polished action buttons                    |
| Outline  | Ink and cream, graphic structure | Hard borders, offset shadows, squared corners, uppercase actions                    |

Glass cards use mode-specific translucent tints, diagonal reflections and illuminated edges over a blurred, saturated backdrop. Inputs and overlay content retain opaque surfaces; text itself stays fully opaque. Consumers should verify text contrast against their actual backdrop. Soft fields retain visible borders rather than relying on shadows to communicate their boundaries. Focus indicators, control sizing, labels and keyboard behaviour remain shared across styles.

The workbench uses stable paper-and-ink framing so editing a theme does not change the inspector itself. Its specimen picker renders actual preset tokens, and the live preview combines a settings form, project summary and dialog example. Responsive composition and all styling live in the shared React/token packages.

## Editing and compatibility

Selecting a preset in the workbench loads its default colours, corners and typography, while retaining the current mode, theme name, density and motion preference. Undo restores the previous draft. Each style offers all five palette families (Forest, Plum, Clay, Cobalt, Ink & cream). Choosing a palette preserves the style, shape, typography and density. Changing mode loads the matching family's light/dark colours; custom colour sets fall back to the style defaults. Individual colour roles remain editable afterwards.

Existing version 1 theme documents remain valid and keep their stored colours. The updated shared component treatments apply to them; `createTheme` now returns the new default palettes. No theme-schema migration is required.

## Design reference

A Stitch concept informed the editorial workbench framing and specimen collection: project `4403547716249507436`, “gregUI — visual language redesign”. The reference was translated into package-owned React components and tokens. Any certification or integration labels generated in that concept were excluded; executed checks and remaining limitations are recorded in [VERIFICATION.md](VERIFICATION.md).

## Motion

Shared motion uses 120ms press feedback and decelerating cubic-bezier curves. Control/entrance timings vary by material: Flat 160/240ms, Glass 240/380ms, Soft 260/400ms, Elevated 200/320ms and Outline 120/220ms. Buttons lift subtly for fine pointers, switches slide using transforms (including RTL), fields receive a soft focus halo, and tabs fade their content in. Dialogs combine a small upward movement and scale; drawers enter from their logical edge; fullscreen views use a short vertical entrance. Popovers and tooltips scale from their anchored origin. Closing overlays stays immediate so dismissal is not delayed.

The system and theme reduced-motion settings disable transitions and animations, including pseudo-elements such as switch thumbs. Hover/press displacement is also suppressed. Keyboard focus indicators remain immediate. No decorative looping animation or global palette interpolation is introduced; text stays legible during theme changes.

## Editorial refinement — 29 September 2026

The second pass changes hierarchy and composition across the shared system. The navigation uses a subdued canvas and quieter icons. The overview has a two-column editorial header, a larger constrained heading and a single material study as its visual anchor. Actions sit under the introduction; the specimen collection and preview follow in a consistent sequence. Auth demo controls occupy one compact grid instead of multiple full-width rows, and explanatory text has secondary visual weight.

Material identity extends beyond palette: Soft uses a system serif for default display/section headings, Glass uses rounded actions and precise rim highlights, Outline keeps sharp forms and shorter motion, Elevated separates floating surfaces, and Flat stays direct. Explicit humanist/mono font choices still override the default display face. Shadows were reduced where stacked rings and large blurs made surfaces feel heavy. Input boundaries and semantic colour roles retain their contrast checks.

`ThemeArtwork` is a decorative CSS material study reused in editorial headers and auth introductions. Its five layers inherit palette, shape, surface and motion tokens. Pointer hover opens the stack slightly; it has no automatic loop, no semantic content and no downloaded assets. Compact artwork disappears from auth introductions on small screens. `PageHeader artwork` enables editorial composition, and optional `AppShell viewKey` provides a short positional entrance plus scroll reset when changing views. Page transitions keep text fully opaque. All effects honour reduced motion.

### Research translated into implementation

- [Linear's March 2026 refresh](https://linear.app/now/behind-the-latest-design-refresh): make navigation recede, give elements different visual weights, reduce redundant separators. Applied to the shell, inspector and demo controls.
- [Google's M3 Expressive research](https://design.google/library/expressive-material-design-google-research): use shape, size, colour and grouping to direct attention. Applied to display typography, distinct action geometry and material-specific timing.
- [Apple's Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/): treat material as a way of distinguishing layers. Applied selectively to decorative glass and rim highlights; essential content remains opaque.

These are design references, not claims that gregUI implements those platforms' systems or has their validation evidence.
