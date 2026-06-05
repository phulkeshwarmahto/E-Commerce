import { useEffect, useState } from "react";
import { formatDate } from "../../utils/formatDate";
import { StarRating } from "../ui/StarRating";
import { ReviewMedia } from "./ReviewMedia";
import { useAppContext } from "../../hooks/useAppContext";
import { voteReviewRequest } from "../../api/reviews.api";

export function ReviewCard({ review: initialReview, onReport }) {
  const { user, notify } = useAppContext();
  const [review, setReview] = useState(initialReview);

  useEffect(() => {
    setReview(initialReview);
  }, [initialReview]);

  const upvotesCount = review.upvotes?.length || 0;
  const downvotesCount = review.downvotes?.length || 0;

  const currentUserId = user?.id || user?._id;
  const isUpvoted = review.upvotes?.includes(currentUserId);
  const isDownvoted = review.downvotes?.includes(currentUserId);

  const handleVote = async (direction) => {
    if (!user) {
      notify("Please log in to vote on reviews.");
      return;
    }

    const newDirection = (direction === "up" && isUpvoted) || (direction === "down" && isDownvoted)
      ? "none"
      : direction;

    try {
      const res = await voteReviewRequest(review.id || review._id, newDirection);
      if (res.success && res.review) {
        setReview(res.review);
      }
    } catch (err) {
      notify(err.message || "Failed to submit vote.");
    }
  };

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

      {/* Helpful / Not Helpful Voting section */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
        <span className="font-semibold text-[10px] uppercase tracking-wider text-gray-400">Was this review helpful?</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleVote("up")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all cursor-pointer font-bold ${
              isUpvoted
                ? "bg-emerald-50 border-emerald-300 text-emerald-600 shadow-sm"
                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            👍 Helpful ({upvotesCount})
          </button>
          <button
            type="button"
            onClick={() => handleVote("down")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all cursor-pointer font-bold ${
              isDownvoted
                ? "bg-red-50 border-red-300 text-red-600 shadow-sm"
                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            👎 Not Helpful ({downvotesCount})
          </button>
        </div>
      </div>
    </article>
  );
}
