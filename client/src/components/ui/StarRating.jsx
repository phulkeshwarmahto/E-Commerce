export function StarRating({ rating }) {
  return (
    <span className="stars" aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }, (_, index) => (index < Math.round(rating) ? "★" : "☆")).join("")}
    </span>
  );
}
