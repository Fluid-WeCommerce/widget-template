import { useMemo, useState } from "react";

export interface ReviewCarouselReview {
  readonly quote: string;
  readonly author: string;
  readonly role: string;
}

export interface ReviewCarouselProps {
  readonly eyebrow?: string;
  readonly title?: string;
  readonly reviews?: readonly ReviewCarouselReview[];
}

const defaultReviews: readonly ReviewCarouselReview[] = [
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
];

export function ReviewCarousel({
  eyebrow = "Customer stories",
  title = "Reviews that travel with your portal",
  reviews = defaultReviews,
}: ReviewCarouselProps): React.JSX.Element {
  const safeReviews = reviews.length > 0 ? reviews : defaultReviews;
  const [activeIndex, setActiveIndex] = useState(0);
  const activeReview = safeReviews[activeIndex] ?? safeReviews[0];

  const countLabel = useMemo(
    () => `${activeIndex + 1} / ${safeReviews.length}`,
    [activeIndex, safeReviews.length],
  );

  function goToPrevious(): void {
    setActiveIndex((current) =>
      current === 0 ? safeReviews.length - 1 : current - 1,
    );
  }

  function goToNext(): void {
    setActiveIndex((current) =>
      current === safeReviews.length - 1 ? 0 : current + 1,
    );
  }

  return (
    <section className="review-carousel" aria-label={title}>
      <p className="review-carousel__eyebrow">{eyebrow}</p>
      <h2 className="review-carousel__title">{title}</h2>
      <blockquote className="review-carousel__quote">
        “{activeReview.quote}”
      </blockquote>
      <div className="review-carousel__footer">
        <div>
          <p className="review-carousel__author">{activeReview.author}</p>
          <p className="review-carousel__role">{activeReview.role}</p>
        </div>
        <div className="review-carousel__controls" aria-label={countLabel}>
          <button
            className="review-carousel__button"
            type="button"
            aria-label="Show previous review"
            onClick={goToPrevious}
          >
            ←
          </button>
          <button
            className="review-carousel__button"
            type="button"
            aria-label="Show next review"
            onClick={goToNext}
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
