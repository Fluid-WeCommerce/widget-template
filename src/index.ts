import { widgetPackage } from "../manifest";

interface SourceWidgetLike {
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly icon?: string;
  readonly category?: string;
  readonly propertySchema?: Readonly<Record<string, unknown>>;
  readonly defaultProps?: Readonly<Record<string, unknown>>;
  readonly container?: string;
  readonly minSdkVersion?: string;
  readonly resizable?: unknown;
  readonly component: unknown;
}

interface RuntimeWidgetRegistration {
  readonly type: string;
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  readonly icon: string;
  readonly category: string;
  readonly propertySchema: Readonly<Record<string, unknown>>;
  readonly defaultProps: Readonly<Record<string, unknown>>;
  readonly container: string;
  readonly minSdkVersion: string;
  readonly resizable: boolean | "horizontal" | "vertical" | "both";
  readonly component: unknown;
}

interface LocalFluidWidgetsGlobal {
  registerPackage(registration: {
    readonly packageId: string;
    readonly version: string;
    readonly widgets: readonly RuntimeWidgetRegistration[];
  }): void;
}

const widgets = widgetPackage.widgets.map((widget: SourceWidgetLike) => {
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
    defaultProps: widget.defaultProps ?? {},
    container: widget.container ?? "block",
    minSdkVersion: widget.minSdkVersion ?? "0.0.0",
    resizable: normalizeResizable(widget.resizable),
    component: widget.component,
  } satisfies RuntimeWidgetRegistration;
});

const fluidWidgets =
  typeof window === "undefined"
    ? undefined
    : (window as Window & { readonly FluidWidgets?: LocalFluidWidgetsGlobal })
        .FluidWidgets;

if (fluidWidgets && typeof fluidWidgets.registerPackage === "function") {
  fluidWidgets.registerPackage({
    packageId: widgetPackage.packageId,
    version: widgetPackage.version,
    widgets,
  });
} else {
  console.warn("FluidWidgets registry is not installed.");
}

function normalizeResizable(
  resizable: unknown,
): RuntimeWidgetRegistration["resizable"] {
  if (
    resizable === true ||
    resizable === "horizontal" ||
    resizable === "vertical" ||
    resizable === "both"
  ) {
    return resizable;
  }

  if (isRecord(resizable)) {
    const horizontal = resizable.horizontal === true;
    const vertical = resizable.vertical === true;
    if (horizontal && vertical) return "both";
    if (horizontal) return "horizontal";
    if (vertical) return "vertical";
  }

  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export { widgetPackage } from "../manifest";
export { ReviewCarousel } from "./widgets/review-carousel/ReviewCarousel";
export type {
  ReviewCarouselProps,
  ReviewCarouselReview,
} from "./widgets/review-carousel/ReviewCarousel";
