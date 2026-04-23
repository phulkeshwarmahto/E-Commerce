import { formatDate } from "../../utils/formatDate";
import { StarRating } from "../ui/StarRating";
import { ReviewMedia } from "./ReviewMedia";

export function ReviewCard({ review }) {
  return (
    <article className="rcard">
      <div className="rcard-head">
        <div>
          <span className="rcard-name">{review.title || review.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
          <StarRating rating={review.rating} />
          <span className="rcard-date">{formatDate(review.createdAt)}</span>
        </div>
      </div>
      <div className="rcard-text">{review.body}</div>
      <ReviewMedia media={review.media} />
    </article>
  );
}
