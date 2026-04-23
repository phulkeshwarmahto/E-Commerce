export function RatingBar({ rating, reviews }) {
  const width = `${Math.min((reviews.length ? rating / 5 : 0) * 100, 100)}%`;

  return (
    <div className="rating-bar">
      <div style={{ width }} />
    </div>
  );
}
