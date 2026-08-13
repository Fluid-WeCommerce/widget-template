# my-widget

A standalone Fluid Remote DOM widget package associated with an existing
Droplet. This project publishes widget code and metadata. It does not create a
Droplet, portal application, iframe preview, or backend service.

## Start development

Requirements: Node.js, pnpm, and a Fluid CLI login for commands that read or
write Droplet state.

```bash
pnpm install
pnpm run widget:link
pnpm dev
```

`pnpm dev` starts Vite, normally on http://localhost:5174. It serves the live
package descriptor at `/__widget-packages__` and the worker bootstrap at
`/__runtime-entry__`. A portal or builder host loads those endpoints. The
command does not create a separate preview application or publication build.

`widget:link` selects an existing Droplet and writes its ID to
`fluid.widget.config.ts`. If the ID is already present, validation and local
builds do not require a login.

## Project map

| Path | Owner and lifecycle |
| --- | --- |
| `manifest.ts` | Author-owned package scope, key, version, and widget registrations. Edit for every release or registration change. |
| `fluid.widget.config.ts` | Author-owned Droplet link and package export. Change the Droplet only when intentionally relinking the project. |
| `src/index.ts` | Worker entry that starts the package and imports package CSS. |
| `src/widgets/` | Author-owned widget components. The starter widget is an example and can be replaced. |
| `styles.css` | Author-owned, package-scoped runtime CSS. Keep its guarded import in `src/index.ts`. |
| `src/vite-env.d.ts` | Vite environment type declarations. |
| `vite.config.ts`, `tsconfig.json` | Build configuration. Change only for a concrete toolchain requirement. |
| `package.json` | Project scripts and dependencies. Author-owned after scaffold creation. |
| lockfile | Dependency resolution. Commit when dependency changes are intentional. |
| `.gitignore` | Source-control exclusions for local and generated files. |
| `.oxlintrc.json` | Generated lint configuration. Change only when project lint policy changes. |
| `README.md` | Human setup, lifecycle, and recovery guidance. |
| `AGENTS.md`, `CLAUDE.md` | Root coding-agent guidance. `CLAUDE.md` points to the canonical `AGENTS.md`. |
| `.agents/skills/fluid-widget-authoring/` | Widget task procedures and reference guidance. |
| `.claude/skills/` | Compatibility view of the same skill. Do not maintain different instructions there. |
| `.fluid/widget-build/` | Temporary compilation workspace. Generated and safe to recreate. |
| `.fluid/tmp/` | Temporary CLI state. Generated and safe to recreate. |
| `.fluid/widget-dist/` | Publication output: `widget.js`, `manifest.json`, `publish-manifest.json`, CSS, maps, and referenced assets. Generated; never edit or commit it. |
| `node_modules/` | Installed dependencies. Generated. |

## Package ownership

`manifest.ts` is the package contract. Use the installed generated API for its
complete fields, accepted values, and widget-definition shape; this README does
not repeat them. Keep package identity, widget registration, defaults,
property-schema metadata, and declared runtime uses together there.

`fluid.widget.config.ts` links that package to a Droplet. It does not define
package identity, version, or widgets.

All metadata and props must satisfy the installed JSON-value types. Do not
maintain a separate value whitelist in project documentation.

## Theme compliance

Widgets must work with the active portal theme and its supported color modes.
Use the host semantic CSS variables for colors, typography, spacing, radii,
borders, focus rings, and charts. Use a semantic property only when authors
need to choose among theme roles.

Use `type: "colorSelect"` for a color property. It stores a semantic token.
The legacy `type: "color"` field is deprecated because it stores an arbitrary
color that can conflict with the theme. Avoid `colorPicker`, literal colors,
custom font controls, and custom radius or spacing controls unless the product
requirement cannot be expressed by the theme engine. Document any necessary
exception in the field description and provide a theme-derived default.

## Validate and build

```bash
pnpm typecheck
pnpm validate
pnpm build
```

Validation checks package metadata and source configuration. Build validates,
typechecks, and writes `.fluid/widget-dist/`. Inspect `manifest.json` and the
widget in a portal host; a successful build cannot prove visual, accessibility,
or theme compatibility.

If a build fails, fix the first reported source or metadata error. Remove only
generated `.fluid/widget-build/`, `.fluid/tmp/`, or `.fluid/widget-dist/` when
a clean retry is needed. Do not delete author source or configuration.

## Publish and inspect

```bash
pnpm run widget:publish --dry-run
pnpm run widget:publish
pnpm exec fluid widget status
pnpm exec fluid widget logs
```

The dry run builds and validates the upload payload without creating a remote
version. Actual publication requires authentication and creates an immutable
Droplet widget version. Increase `version` in `manifest.ts` before publishing a
new release.

`fluid widget push` first attempts source synchronization and then publication.
Repository divergence stops before publication. If source synchronization is
unavailable, the command can continue with publication only. Publication can
also fail after source synchronization succeeds. Read the phase result before
retrying; do not assume either phase rolled back the other.

## Network-enabled widgets

Declare `networkAccess` in the widget `uses` array only for public HTTP APIs.
A portal author must approve each exact package ID, package version, and
capability version. Updating any value invalidates the previous grant.

Granted fetch uses the worker's native origin. Fluid does not inject cookies,
credentials, tokens, or headers. The installed runtime API owns the exact
destination and ambient-API contract. DNS results and redirect destinations
are not revalidated, so package review remains required. Any portal data given
to the widget can be sent to an external service. Worker isolation does not
protect the reputation of `*.fluid.app` from widget behavior.

## Detailed guidance

- `.agents/skills/fluid-widget-authoring/SKILL.md`
- Installed API contract:
  `node_modules/@fluid-app/portal-sdk/authoring/widget-api/api.md`
- Installed command contract:
  `node_modules/@fluid-app/fluid-cli-widget/authoring/commands.md`
