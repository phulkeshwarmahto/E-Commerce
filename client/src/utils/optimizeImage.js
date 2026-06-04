/**
 * Helper to dynamically inject Cloudinary performance transformation parameters.
 * - f_auto: chooses the best format (AVIF, WebP, PNG) automatically based on client browser support.
 * - q_auto: compresses the image quality dynamically without visual loss.
 * - w_XXX: resizes the image on-the-fly to the exact layout width.
 * 
 * Example URL:
 * https://res.cloudinary.com/cloud_name/image/upload/v12345/prod_id.jpg
 * becomes:
 * https://res.cloudinary.com/cloud_name/image/upload/f_auto,q_auto,w_400/v12345/prod_id.jpg
 */
export function optimizeCloudinaryUrl(url, { width, height, quality = "auto", format = "auto" } = {}) {
  if (!url || typeof url !== "string") return url;
  
  // Only optimize Cloudinary URLs
  if (!url.includes("res.cloudinary.com")) return url;

  // Prevent double-applying transformations
  if (url.includes("/f_auto") || url.includes("/q_auto")) return url;

  // Find the /upload/ part of the URL
  const uploadIndex = url.indexOf("/upload/");
  if (uploadIndex === -1) return url;

  const prefix = url.substring(0, uploadIndex + 8); // e.g. "https://res.cloudinary.com/cloud/image/upload/"
  const suffix = url.substring(uploadIndex + 8);

  const transforms = [];
  if (format) transforms.push(`f_${format}`);
  if (quality) transforms.push(`q_${quality}`);
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push("c_scale"); // Scale to fit layout boundary

  const transformString = transforms.join(",");
  return `${prefix}${transformString}/${suffix}`;
}
