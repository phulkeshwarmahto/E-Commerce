export function ReviewMedia({ media = [] }) {
  if (!media || !media.length) {
    return null;
  }

  return (
    <div className="review-media">
      {media.map((item, index) => {
        const src = typeof item === "string" ? item : item?.url;
        if (!src) return null;
        return <img key={index} src={src} alt="Review attachment" />;
      })}
    </div>
  );
}
