import { useCallback, useEffect, useState } from "react";
import { createReviewRequest, getReviewsRequest } from "../api/reviews.api";

export function useReviews(productId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadReviews = useCallback(async () => {
    if (!productId) {
      setReviews([]);
      return;
    }

    setLoading(true);
    try {
      const data = await getReviewsRequest(productId);
      setReviews(data.reviews);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadReviews().catch(() => {});
  }, [loadReviews]);

  const submitReview = async (payload) => {
    const data = await createReviewRequest(payload);
    setReviews((current) => [data.review, ...current]);
    return data.review;
  };

  return { reviews, loading, submitReview };
}
