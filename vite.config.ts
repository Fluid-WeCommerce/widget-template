import { defineConfig } from "vite";
import type { Plugin, ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";

export default defineConfig({
  plugins: [react(), fluidWidgetDevRoutes()],
  resolve: {
    conditions: [
      "fluid-widget-authoring",
      "module",
      "browser",
      "development|production",
    ],
  },
  ssr: {
    noExternal: ["@fluid-app/portal-sdk"],
    resolve: {
      conditions: [
        "fluid-widget-authoring",
        "module",
        "node",
        "development|production",
      ],
    },
  },
});

function fluidWidgetDevRoutes(): Plugin {
  return {
    name: "fluid-widget-dev-routes",
    apply: "serve",
    configureServer(server: ViteDevServer) {
      const devRoutesHandler = async (
        req: DevRequest,
        res: DevResponse,
        next: (err?: unknown) => void,
      ): Promise<void> => {
        const pathname = (req.url ?? "").split("?")[0] ?? "";

        if (
          pathname === "/builder-preview" ||
          pathname === "/builder-preview/"
        ) {
          await sendTransformedHtml(
            server,
            res,
            "/builder-preview",
            getBuilderPreviewHtml(),
          );
          return;
        }

        if (pathname === "/__preview__" || pathname === "/__preview__/") {
          await sendTransformedHtml(
            server,
            res,
            "/__preview__",
            getPreviewHtml(),
          );
          return;
        }

        if (
          pathname === "/__runtime-entry__" ||
          pathname === "/__runtime-entry__/"
        ) {
          sendJavaScript(req, res, 'void import("/src/index.ts");\n');
          return;
        }

        if (pathname === "/__manifests__" || pathname === "/__manifests__/") {
          await sendManifests(server, req, res);
          return;
        }

        next();
      };

      server.middlewares.use(devRoutesHandler);
    },
  };
}

async function sendManifests(
  server: ViteDevServer,
  req: DevRequest,
  res: DevResponse,
): Promise<void> {
  if (handleOptions(req, res)) return;

  try {
    const configModule = (await server.ssrLoadModule(
      "/fluid.widget.config.ts",
    )) as Record<string, unknown>;
    sendJson(
      res,
      sourceWidgetPackagesToManifests(readWidgetPackages(configModule)),
    );
  } catch (err) {
    server.config.logger.error(
      `[fluid] Failed to load widget manifests: ${err}`,
    );
    sendJson(res, { error: String(err) }, 500);
  }
}

async function sendTransformedHtml(
  server: ViteDevServer,
  res: DevResponse,
  route: string,
  html: string,
): Promise<void> {
  try {
    const transformed = await server.transformIndexHtml(route, html);
    setCorsHeaders(res);
    res.setHeader("Content-Type", "text/html");
    res.statusCode = 200;
    res.end(transformed);
  } catch (err) {
    server.config.logger.error(`[fluid] Failed to serve ${route}: ${err}`);
    setCorsHeaders(res);
    res.statusCode = 500;
    res.end(`${route} failed to load`);
  }
}

function sendJavaScript(
  req: DevRequest,
  res: DevResponse,
  source: string,
): void {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);
  res.setHeader("Content-Type", "text/javascript");
  res.statusCode = 200;
  res.end(source);
}

function sendJson(res: DevResponse, body: unknown, statusCode = 200): void {
  setCorsHeaders(res);
  res.setHeader("Content-Type", "application/json");
  res.statusCode = statusCode;
  res.end(JSON.stringify(body, null, 2));
}

function handleOptions(req: DevRequest, res: DevResponse): boolean {
  if (req.method !== "OPTIONS") return false;
  setCorsHeaders(res);
  res.statusCode = 204;
  res.end();
  return true;
}

function setCorsHeaders(res: DevResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function getBuilderPreviewHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fluid Widget Builder Preview</title>
  </head>
  <body>
    <div id="builder-preview-root"></div>
    <script type="module" src="/src/builder-preview.tsx"></script>
  </body>
</html>`;
}

function getPreviewHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fluid Widget Iframe Preview</title>
  </head>
  <body>
    <div id="preview-root"></div>
    <script type="module" src="/src/preview-entry.tsx"></script>
  </body>
</html>`;
}

type DevRequest = IncomingMessage;
type DevResponse = ServerResponse;

interface SourceWidgetPackage {
  readonly packageId: string;
  readonly version?: string;
  readonly widgets: readonly SourceWidget[];
}

interface SourceWidget {
  readonly name?: unknown;
  readonly displayName?: unknown;
  readonly description?: unknown;
  readonly icon?: unknown;
  readonly category?: unknown;
  readonly propertySchema?: unknown;
  readonly defaultProps?: unknown;
  readonly container?: unknown;
  readonly minSdkVersion?: unknown;
  readonly resizable?: unknown;
}

function readWidgetPackages(
  configModule: Record<string, unknown>,
): SourceWidgetPackage[] {
  const packages: SourceWidgetPackage[] = [];
  const seen = new Set<string>();
  const candidates = [
    configModule["widgetPackage"],
    ...(Array.isArray(configModule["widgetPackages"])
      ? configModule["widgetPackages"]
      : []),
    configModule["default"],
  ];

  for (const candidate of candidates) {
    if (!isSourceWidgetPackage(candidate) || seen.has(candidate.packageId)) {
      continue;
    }

    packages.push(candidate);
    seen.add(candidate.packageId);
  }

  return packages;
}

function sourceWidgetPackagesToManifests(
  widgetPackages: readonly SourceWidgetPackage[],
): Record<string, unknown>[] {
  return widgetPackages.flatMap((widgetPackage) =>
    widgetPackage.widgets.flatMap((widget) => {
      const name = readString(widget.name);
      if (!name) return [];

      const type = `${widgetPackage.packageId}.${name}`;
      const displayName = readString(widget.displayName) ?? name;
      return [
        {
          manifestVersion: 1,
          type,
          displayName,
          description:
            readString(widget.description) ?? `Custom widget ${displayName}`,
          icon: readString(widget.icon) ?? "box",
          category: readString(widget.category) ?? "components",
          propertySchema: {
            ...readRecord(widget.propertySchema),
            widgetType: type,
          },
          defaultProps: readRecord(widget.defaultProps),
          container: readString(widget.container) ?? "block",
          minSdkVersion: readString(widget.minSdkVersion) ?? "0.0.0",
          resizable: normalizeResizable(widget.resizable),
        },
      ];
    }),
  );
}

function normalizeResizable(value: unknown): boolean | string {
  if (
    value === true ||
    value === "horizontal" ||
    value === "vertical" ||
    value === "both"
  ) {
    return value;
  }

  if (isRecord(value)) {
    const horizontal = value["horizontal"] === true;
    const vertical = value["vertical"] === true;
    if (horizontal && vertical) return "both";
    if (horizontal) return "horizontal";
    if (vertical) return "vertical";
  }

  return false;
}

function isSourceWidgetPackage(value: unknown): value is SourceWidgetPackage {
  return (
    isRecord(value) &&
    typeof value["packageId"] === "string" &&
    Array.isArray(value["widgets"])
  );
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function readRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? { ...value } : {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
