import { fluidWidgetDevPlugin } from "@fluid-app/fluid-cli-widget/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), fluidWidgetDevPlugin()],
  ssr: {
    noExternal: ["@fluid-app/portal-sdk"],
  },
});
