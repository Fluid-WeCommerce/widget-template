import type { FluidWidgetConfig } from "@fluid-app/fluid-cli-widget";

const config = {
} satisfies FluidWidgetConfig;

const widgetConfig: FluidWidgetConfig = config;

export default config;
export const droplet = widgetConfig.droplet;
export { widgetPackage, widgetPackages } from "./manifest";
