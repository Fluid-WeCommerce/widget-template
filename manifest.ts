import { defineWidget, defineWidgetPackage } from "@fluid-app/portal-sdk";
import "./styles.css";
import { ReviewCarousel } from "./src/widgets/review-carousel/ReviewCarousel";

export const reviewCarouselWidget = defineWidget({
  name: "ReviewCarousel",
  component: ReviewCarousel,
  displayName: "Review Carousel",
  description: "A carousel for customer quotes and testimonials.",
  icon: "message-circle-heart",
  category: "components",
  container: "card",
  resizable: { horizontal: true, minWidth: 320 },
  defaultProps: {
    eyebrow: "Customer stories",
    title: "Reviews that travel with your portal",
    reviews: [
      {
        quote:
          "Fluid widgets let us ship focused portal experiences without coupling releases to the host application.",
        author: "Maya Chen",
        role: "VP of Customer Experience",
      },
      {
        quote:
          "The package boundary keeps authoring fast while still giving our team a clean publish path.",
        author: "Jordan Ellis",
        role: "Solutions Architect",
      },
      {
        quote:
          "We can preview, validate, and publish a reusable widget package from a small standalone project.",
        author: "Avery Brooks",
        role: "Portal Engineer",
      },
    ],
  },
  propertySchema: {
    tabsConfig: [{ id: "content", label: "Content" }],
    dataSourceTargetProps: ["eyebrow", "title", "reviews"],
    fields: [
      {
        key: "eyebrow",
        label: "Eyebrow",
        type: "text",
        defaultValue: "Customer stories",
        tab: "content",
        group: "Copy",
      },
      {
        key: "title",
        label: "Title",
        type: "text",
        defaultValue: "Reviews that travel with your portal",
        tab: "content",
        group: "Copy",
      },
    ],
  },
});

export const widgetPackage = defineWidgetPackage({
  scope: "droplet",
  version: "0.1.0",
  packageType: "droplet",
  remoteEntryUrl: "widget.js",
  widgets: [reviewCarouselWidget],
});

export const widgetPackages = [widgetPackage] as const;

export default widgetPackage;
