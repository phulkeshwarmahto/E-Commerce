import { formatDate } from "../../utils/formatDate";
import { StarRating } from "../ui/StarRating";
import { ReviewMedia } from "./ReviewMedia";

export function ReviewCard({ review, onReport }) {
  return (
    <article className="rcard">
      <div className="rcard-head">
        <div>
          <span className="rcard-name">{review.title || review.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
          <StarRating rating={review.rating} />
          <span className="rcard-date">{formatDate(review.createdAt)}</span>
          {onReport && (
            <button
              type="button"
              onClick={() => onReport(review)}
              title="Report this review"
              className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer border-0 bg-transparent text-[11px] font-semibold flex items-center gap-0.5 p-0.5 hover:underline"
            >
              ⚠️ Report
            </button>
          )}
        </div>
      </div>
      <div className="rcard-text">{review.body}</div>
      <ReviewMedia media={review.media} />
    </article>
  );
}
