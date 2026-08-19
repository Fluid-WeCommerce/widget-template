# Fluid widget project guidance

Use `.agents/skills/fluid-widget-authoring/SKILL.md` for every widget change.
Read the linked reference for the task before editing source or metadata.

## Sources of truth

- `manifest.ts` owns package scope, package key, package version, and widget
  registrations. Each `defineWidget()` call owns its widget metadata, defaults,
  property schema, portal functions, and capabilities.
- `fluid.widget.config.ts` owns the linked Droplet ID and exports the package
  resolved from `manifest.ts`. It does not own package metadata.
- `src/` owns worker-safe widget components. The root `styles.css` owns package
  CSS and is imported once by `src/index.ts`.
- The installed SDK declarations and
  `node_modules/@fluid-app/portal-sdk/authoring/widget-api/` own exact API and
  property-field contracts.
- `node_modules/@fluid-app/fluid-cli-widget/authoring/commands.md` owns exact
  command syntax and options.
- `.fluid/` contains generated build and publication artifacts. Never edit it.

## Authoring rules

- Preserve existing work. Inspect `git status` before commands that can change
  files.
- Keep package and widget identifiers stable after publication. Published
  versions are immutable; increase `version` for each release. If a publish
  fails with `Package version already exists`, increase the patch version in
  `manifest.ts` and rerun it — an authorized publish authorizes this bump.
- Treat all props and portal-function results as partial or malformed JSON.
  Render an empty or error state instead of throwing during render.
- Declare every portal function and capability used by a widget in `uses`.
- Use semantic theme tokens. Use the `colorSelect` property field for colors.
  The legacy `color` field is deprecated. Do not add custom colors, fonts,
  radii, spacing, or styling controls when the theme engine already represents
  the design decision.
- Keep secrets, credentials, private endpoints, and tenant tokens out of worker
  code. Use a host portal function or server application for privileged work.
- `publish`, `push`, and version changes affect remote state. Do not run them
  unless the task authorizes that remote change. A dry run does not publish.

## Required verification

Run typecheck, validation, and build for a package change. Inspect the generated
manifest and the widget in a portal or builder host. Before publication, also
run the dry-run publish path and inspect the source diff. A successful build
does not authorize publication.
