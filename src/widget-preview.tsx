import { createRoot } from "react-dom/client";
import "../styles.css";
import { ReviewCarousel } from "./widgets/review-carousel/ReviewCarousel";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing #root element");
}

createRoot(rootElement).render(
  <main className="fluid-widget-preview-shell">
    <div className="fluid-widget-preview-frame">
      <ReviewCarousel />
    </div>
  </main>,
);
