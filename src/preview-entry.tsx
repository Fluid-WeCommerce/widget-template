import { createPreview } from "@fluid-app/portal-sdk/preview";
import "../styles.css";
import { widgetPackages } from "../manifest";

createPreview({
  widgetPackages: widgetPackages.map((widgetPackage) => ({
    manifestVersion: 1,
    packageId: widgetPackage.packageId,
    packageType: widgetPackage.packageType,
    version: widgetPackage.version,
    remoteEntryUrl: "/__runtime-entry__",
    cssUrls: widgetPackage.cssUrls,
    widgets: widgetPackage.widgets.map((widget) => {
      const type = `${widgetPackage.packageId}.${widget.name}`;
      return {
        type,
        name: widget.name,
        displayName: widget.displayName ?? widget.name,
        description: widget.description ?? `Custom widget ${widget.name}`,
        icon: widget.icon ?? "box",
        category: widget.category ?? "components",
        propertySchema: {
          ...widget.propertySchema,
          widgetType: type,
        },
        defaultProps: widget.defaultProps,
        container: widget.container ?? "block",
        minSdkVersion: widget.minSdkVersion ?? "0.0.0",
        resizable: normalizeResizable(widget.resizable),
      };
    }),
  })),
});

function normalizeResizable(
  resizable: unknown,
): boolean | "horizontal" | "vertical" | "both" {
  if (
    resizable === true ||
    resizable === "horizontal" ||
    resizable === "vertical" ||
    resizable === "both"
  ) {
    return resizable;
  }

  if (isRecord(resizable)) {
    const horizontal = resizable["horizontal"] === true;
    const vertical = resizable["vertical"] === true;
    if (horizontal && vertical) return "both";
    if (horizontal) return "horizontal";
    if (vertical) return "vertical";
  }

  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
