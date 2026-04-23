export function ReviewMedia({ media = [] }) {
  if (!media.length) {
    return null;
  }

  return (
    <div className="review-media">
      {media.map((item) => (
        <img key={item.url} src={item.url} alt="Review attachment" />
      ))}
    </div>
  );
}
