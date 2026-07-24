import type { FluidWidgetConfig } from "@fluid-app/fluid-cli-widget";
import { widgetPackage as sourceWidgetPackage } from "./manifest";

const config = {
} satisfies FluidWidgetConfig;

const widgetConfig: FluidWidgetConfig = config;
const packageStableId = widgetConfig.droplet;

export const widgetPackage = packageStableId
  ? {
      ...sourceWidgetPackage,
      packageStableId,
      packageId: `${sourceWidgetPackage.scope}.${packageStableId}` as const,
    }
  : sourceWidgetPackage;
export const widgetPackages = [widgetPackage] as const;

export default config;
export const droplet = widgetConfig.droplet;
