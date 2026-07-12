import { createElement } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import { widgetPackages } from "../manifest";

interface SourceWidget {
  readonly name: string;
  readonly component: React.ComponentType<Record<string, unknown>>;
  readonly displayName?: string;
  readonly description?: string;
  readonly defaultProps?: Readonly<Record<string, unknown>>;
}

interface SourceWidgetPackage {
  readonly packageId: string;
  readonly widgets: readonly SourceWidget[];
}

const packages = widgetPackages as readonly SourceWidgetPackage[];
const widgets = packages.flatMap((widgetPackage) =>
  widgetPackage.widgets.map((widget) => ({ widgetPackage, widget })),
);

const rootElement = document.getElementById("builder-preview-root");

if (!rootElement) {
  throw new Error("Missing #builder-preview-root element");
}

createRoot(rootElement).render(
  <main className="fluid-widget-preview-shell fluid-widget-builder-preview">
    <header className="fluid-widget-builder-preview__header">
      <p className="fluid-widget-builder-preview__eyebrow">Fluid Widget Dev</p>
      <h1 className="fluid-widget-builder-preview__title">Builder preview</h1>
      <p className="fluid-widget-builder-preview__description">
        Rendering {widgets.length} widget{widgets.length === 1 ? "" : "s"} from
        this package without requiring a portal host.
      </p>
    </header>

    <div className="fluid-widget-builder-preview__grid">
      {widgets.map(({ widgetPackage, widget }) => (
        <section
          className="fluid-widget-builder-preview__card"
          key={`${widgetPackage.packageId}.${widget.name}`}
        >
          <div className="fluid-widget-builder-preview__meta">
            <p className="fluid-widget-builder-preview__widget-name">
              {widget.displayName ?? widget.name}
            </p>
            <code>
              {widgetPackage.packageId}.{widget.name}
            </code>
            {widget.description ? <p>{widget.description}</p> : null}
          </div>
          <div className="fluid-widget-builder-preview__surface">
            {createElement(widget.component, widget.defaultProps ?? {})}
          </div>
        </section>
      ))}
    </div>
  </main>,
);
