# AGENTS.md

Guidance for AI coding tools working in this standalone Fluid widget project.

This repository is a generated Fluid widget package. Treat these instructions as the source of truth for code generated here. Do not assume the parent Fluid monorepo is present.

## Project boundary

- This project contains a widget package only. Do not scaffold droplets, portal apps, Next.js apps, Rails code, API servers, or monorepo packages here.
- Use React, TypeScript, Vite, and the Fluid widget CLI scripts already in `package.json`.
- Keep widget source under `src/widgets/` and package metadata in `manifest.ts`.
- Keep the Remote DOM worker entry in `src/index.ts`; it should call `startWidgetPackage()` once.
- Keep package ownership in `fluid.widget.config.ts`. For droplet-owned widgets, link or set the droplet with `pnpm run widget:link` or `fluid widget link`; do not hard-code a droplet into component source.
- Runtime CSS belongs in `styles.css` or files imported by the worker build graph. Keep the guarded CSS import in `src/index.ts` so the builder emits a stylesheet without executing DOM-oriented CSS loading inside the worker.

## Manifest authoring

Use `defineWidget()`, `defineWidgetPackage()`, and `startWidgetPackage()` from `@fluid-app/portal-sdk/widgets/worker`.

### `defineWidget()` checklist

Each widget should define:

- `name`: stable, URL-safe widget name. Use letters, numbers, underscore, hyphen, or tilde. Changing it changes the generated widget type.
- `component`: React component that renders the widget.
- `displayName`, `description`, `icon`, and `category`: palette metadata for the builder.
- `defaultProps`: JSON-serializable default props. Do not use functions, Dates, undefined values, class instances, NaN, or Infinity.
- `propertySchema`: JSON-serializable editable fields for the builder property panel.
- `container`: usually `block` or `card`; use `inline` only for inline content and `fullscreen` only for true full-screen experiences.
- `uses`: every typed portal function called by this widget. Pass the imported function values; never hand-author capability strings.
- `resizable`: omit or set false for fixed widgets; otherwise use `true`, `horizontal`, `vertical`, `both`, or an object with horizontal/vertical booleans and optional min sizes.

## Typed portal functions

Import worker-safe portal functions from
`@fluid-app/portal-sdk/widgets/worker`, call them directly, and declare the
same function values in `defineWidget({ uses: [...] })`:

```ts
import {
  defineWidget,
  getUserAccount,
  navigateTo,
} from "@fluid-app/portal-sdk/widgets/worker";

async function openProfile(): Promise<void> {
  const account = await getUserAccount();
  await navigateTo(account.slug);
}

export const profileButtonWidget = defineWidget({
  name: "ProfileButton",
  component: ProfileButton,
  uses: [getUserAccount, navigateTo],
});
```

Available built-ins are `getUserAccount`, `getStore`, `getPortalApp`,
`getPortalProfile`, `getNavigationState`, `buildPortalHref`, `navigateTo`,
`getFullscreenState`, `requestFullscreen`, and `exitFullscreen`. Getters return
resolved data instead of query snapshots. Navigation accepts a slug string,
`{ slug }`, or `{ href }`.

`uses` is required for every called function. `defineWidget()` converts it to
the existing descriptor declarations, and both the worker and host enforce the
declaration. A `PortalFunctionError` with code `NOT_DECLARED` means the called
function must be added to the widget's `uses` array. Do not write a raw
`capabilities` array.

For public third-party HTTP APIs, import the declarative `networkAccess`
marker and include it in `uses`. The builder asks the portal author for
consent before adding the widget:

```ts
import {
  defineWidget,
  networkAccess,
} from "@fluid-app/portal-sdk/widgets/worker";

export const weatherWidget = defineWidget({
  name: "Weather",
  component: Weather,
  uses: [networkAccess],
});
```

The worker then uses standard `fetch` directly. Fluid does not add tokens,
cookies, credentials, or headers. Direct requests to `fluid.app`, the current
portal origin, loopback, and private-network addresses are blocked. Redirects
are handled by native fetch and are not inspected, so network approval remains
a package-trust decision. WebSocket, EventSource, WebTransport, and
streaming-specific APIs are not part of this capability.

`getUserAccount()` may include email, but deliberately excludes phone numbers,
addresses, payment data, credentials, government or tax identifiers, dates of
birth, raw metadata, and unknown future fields. Widgets cannot access the
host's `tenantClient`; use a purpose-built portal function.

Define a company-specific typed function with
`definePortalFunction<Output, Input>({ capability, version, method })`, call it
directly, and include it in `uses`. The portal owner implements the same
function with `implementPortalFunction(function, handler)` under
`remoteWidgets.functions`. Built-in functions cannot be overridden and
duplicate custom implementations are rejected.

Custom function inputs and outputs must contain JSON values only: null,
booleans, finite numbers, strings, arrays, and objects composed from those
values. Do not use `undefined`, functions, Dates, Maps, Sets, class instances,
`NaN`, or `Infinity`; the runtime validates both requests and responses.

### `defineWidgetPackage()` checklist

The generated package is droplet-owned:

- `scope` is the namespace passed at project creation.
- `packageType` must stay `droplet`.
- `version` must be SemVer without build metadata, such as `1.2.3` or `1.2.3-beta.1`.
- Do not author `workerEntryUrl`; dev and build inject the served worker artifact URL.
- `widgets` must contain at least one `defineWidget()` result.
- Do not manually set `packageStableId` for the default droplet template. The CLI injects the linked droplet as the stable package key during validation, build, and publish.

## Property schema reference

A property schema describes the builder editing UI. Use this shape:

```ts
propertySchema: {
  tabsConfig: [{ id: "content", label: "Content" }],
  dataSourceTargetProps: ["title", "items"],
  fields: [
    {
      key: "title",
      label: "Title",
      type: "text",
      defaultValue: "Featured items",
      tab: "content",
      group: "Copy",
    },
  ],
}
```

Base field keys:

- `key`: prop key written into widget props. For visual-only fields such as section headers, use a unique non-prop key.
- `label`: human-readable property label.
- `type`: one of the supported field types below.
- `description`: optional helper text.
- `defaultValue`: optional JSON-serializable value matching the prop.
- `tab`: optional tab id from `tabsConfig`.
- `group`: optional group label inside a tab.
- `advanced`: true for theme override controls; advanced fields render in the Custom styling group.
- `requiresKeyValue`: conditionally show the field when another prop has a value. Arrays are AND logic.

Supported field types:

- `text`: single-line string. Optional `placeholder`, `maxLength`, `tokenSuggestions`.
- `textarea`: multi-line string. Optional `placeholder`, `rows`, `maxLength`.
- `number`: numeric input. Optional `min`, `max`, `step`.
- `boolean`: toggle.
- `select`: dropdown. Requires `options` with `label` and `value` entries.
- `color`: basic color value.
- `range`: slider. Requires `min` and `max`; optional `step`.
- `dataSource`: data-source selector/configuration entry point.
- `resource`: single shareable/resource selector. Optional `allowedTypes`.
- `image`: media picker. Optional `accept` as `image`, `video`, or `any`.
- `alignment`: alignment picker. Requires `options.verticalEnabled` and `options.horizontalEnabled`.
- `slider`: numeric slider with optional `unit` suffix plus `min`, `max`, and `step`.
- `colorPicker`: color picker with optional `swatches`.
- `sectionHeader`: visual grouping header with optional `subtitle`.
- `separator`: visual separator.
- `buttonGroup`: segmented control. Requires `options`; each option has `value` plus optional `label`, `ariaLabel`, and icon.
- `colorSelect`: semantic theme color selector. Optional `excludeColors`.
- `sectionLayoutSelect`: visual layout selector.
- `background`: combined resource/color background control.
- `contentPosition`: 3-by-3 content position picker.
- `textSizeSelect`: theme text size selector.
- `cssUnit`: number plus unit. Optional `allowedUnits`, `defaultUnit`, and min/max/step maps per unit.
- `fontPicker`: Google font picker with optional `placeholder`.
- `stringArray`: editable list of strings with optional `placeholder`.
- `borderRadius`: composite radius editor. Requires `keys.topLeft`, `keys.topRight`, `keys.bottomLeft`, and `keys.bottomRight` mapping to real prop keys.
- `screenPicker`: portal screen picker. Optional `includeSystemItems`.

Data-source-ready props:

- Add bindable prop keys to `dataSourceTargetProps`.
- Keep those prop types serializable and tolerant of missing, empty, or partially populated data.
- For arrays, render empty states and validate each item before reading nested properties.
- Keep manual defaults in `defaultProps`; data sources should override props without requiring component rewrites.
- If selected data needs per-item settings, add `itemConfigSchema` with its own `fields` array.

## Component quality bar

- Components must be deterministic, portable, and host-safe. Avoid direct assumptions about the embedding portal, route, global CSS reset, or parent DOM.
- Props are untrusted. Provide defaults, guard array access, and handle nullish values.
- Use stable keys for lists. Do not use array indexes when items have stable ids.
- Avoid side effects during render. Use effects only for host-safe subscriptions and clean them up.
- Do not fetch data directly unless the widget explicitly owns that integration. Prefer props and data-source-ready schemas.
- Keep bundle weight small. Avoid large UI kits or date/chart libraries unless the widget truly needs them.
- Do not store secrets, API tokens, or tenant-specific credentials in source, props, or defaultProps.

## Accessibility requirements

- Use semantic HTML first: sections, headings, buttons, lists, forms, and labels.
- Every interactive control must be keyboard reachable and have a visible focus state.
- Icon-only buttons need `aria-label`.
- Images need meaningful alt text, or empty alt text when decorative.
- Preserve heading order inside the widget; do not choose headings based only on size.
- Announce dynamic changes when necessary with appropriate ARIA live regions.
- Meet contrast expectations by using theme foreground/background token pairs.
- Respect reduced motion for animation-heavy widgets.

## Theme and styling guidance

Fluid hosts provide semantic CSS variables. Prefer those over hard-coded colors:

- Surfaces: `--background`, `--card`, `--popover`.
- Text on surfaces: `--foreground`, `--card-foreground`, `--popover-foreground`.
- Brand/action: `--primary`, `--primary-foreground`.
- Supporting UI: `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`.
- Status and chrome: `--destructive`, `--destructive-foreground`, `--border`, `--input`, `--ring`.
- Charts: `--chart-1` through `--chart-5`.
- Radius: `--radius`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`.
- Theme engine aliases may also provide `--font-header`, `--font-body`, `--font-size-extra-small`, `--font-size-small`, `--font-size-regular`, `--font-size-large`, `--font-size-extra-large`, and `--font-size-giant`.

Tailwind equivalents, when Tailwind is available in a host, are the semantic utilities: `bg-background`, `text-foreground`, `bg-card`, `text-card-foreground`, `bg-primary`, `text-primary-foreground`, `border-border`, `ring-ring`, `rounded-lg`, and text sizes such as `text-sm` or `text-xl`. In this standalone template, plain CSS is the safest runtime default.

Light/dark behavior:

- The portal switches theme values with `data-theme-mode="dark"` and may also honor system dark mode when configured.
- Do not write separate hard-coded dark palettes unless absolutely necessary. Use semantic variables so the host theme controls both modes.
- If you need mode-specific refinements, scope them to `[data-theme-mode="dark"]` and keep them token-based.
- Avoid styling that only works on white backgrounds. Use semantic variables and verify against representative light, dark, and high-contrast host token values.

Runtime CSS rules:

**A stylesheet is the only way to style a widget. Inline styles do not work.**

The host sanitizes every Remote DOM mutation before it reaches the shadow root. The
`style` attribute is rejected and `<style>` elements are a banned tag, so:

- `style={{ color: "red" }}` on any element is **silently dropped**. The element renders
  with no styling and no error — this is the single most common reason a widget "looks
  broken" or "came out unstyled".
- An inline `<style>` block never renders.
- Only CSS reachable from the widget build graph is published as a `cssUrls` artifact and
  adopted into the shadow root.

So: put every rule in a stylesheet, give elements `className`s, and target those classes.
Never reach for an inline style — it will not survive.

- Put runtime selectors in `styles.css` or imported CSS modules.
- Keep selectors prefixed with the widget name to avoid leaking styles into the host.
- Do not rely on global body styles for runtime appearance.
- Ensure CSS is reachable from the guarded import in `src/index.ts` or another module included in the widget build, otherwise CSS artifacts may not be published.
- Test through a portal or builder host using the generated Remote DOM endpoints. Do not add a direct React host preview for third-party widgets.

## Validation workflow

Before considering changes complete, run:

```bash
pnpm typecheck
pnpm validate
pnpm build
```

Use `pnpm dev` for local descriptor and worker endpoints, and `pnpm run widget:publish --dry-run` when checking publish readiness without uploading.

Common failures and fixes:

- Missing droplet UUID: run `pnpm run widget:link` or pass `--droplet` to validate/build/publish commands.
- No source package found: ensure `fluid.widget.config.ts` exports `widgetPackage` or `widgetPackages` from `manifest.ts`.
- Invalid package type: keep `packageType: "droplet"` in `defineWidgetPackage()`.
- Invalid widget name or package key: use URL-safe names only.
- Invalid version: use SemVer without build metadata.
- Non-serializable metadata: remove functions, undefined values, Dates, NaN, Infinity, Maps, Sets, and class instances from `propertySchema` and `defaultProps`.
- CSS URL mismatch: import runtime CSS into the bundle or remove manual `cssUrls` entries.
- Build succeeds but styles are missing: confirm the CSS import is reachable from `src/index.ts` or the widget component.
- Local development works but the published widget fails: check that browser-only APIs are guarded and no local-only URLs or environment variables are required at runtime.
