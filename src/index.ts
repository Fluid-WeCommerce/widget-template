import { startWidgetPackage } from "@fluid-app/portal-sdk/widgets/worker";
import { widgetPackage } from "../fluid.widget.config";

// The production build discovers and extracts this stylesheet. Remote DOM hosts
// load the emitted CSS into the widget shadow root, so workers never execute it.
if (typeof document !== "undefined") {
  void import("../styles.css");
}

startWidgetPackage(widgetPackage);

export { widgetPackage } from "../fluid.widget.config";
export { ReviewCarousel } from "./widgets/review-carousel/ReviewCarousel";
export type {
  ReviewCarouselProps,
  ReviewCarouselReview,
} from "./widgets/review-carousel/ReviewCarousel";
