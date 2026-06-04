import { optimizeCloudinaryUrl } from "../../utils/optimizeImage";

export function ReviewMedia({ media = [] }) {
  if (!media || !media.length) {
    return null;
  }

  return (
    <div className="review-media">
      {media.map((item, index) => {
        const src = typeof item === "string" ? item : item?.url;
        if (!src) return null;
        return <img key={index} src={optimizeCloudinaryUrl(src, { width: 150 })} alt="Review attachment" />;
      })}
    </div>
  );
}
