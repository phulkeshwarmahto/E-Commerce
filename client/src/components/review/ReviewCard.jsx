import { formatDate } from "../../utils/formatDate";
import { StarRating } from "../ui/StarRating";
import { ReviewMedia } from "./ReviewMedia";

export function ReviewCard({ review }) {
  return (
    <article className="review-card">
      <div className="review-head">
        <div>
          <h4>{review.title}</h4>
          <p>{review.name}</p>
        </div>
        <div className="review-rating">
          <StarRating rating={review.rating} />
          <span>{formatDate(review.createdAt)}</span>
        </div>
      </div>
      <p>{review.body}</p>
      <ReviewMedia media={review.media} />
    </article>
  );
}
