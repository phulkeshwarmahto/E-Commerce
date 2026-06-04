import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { uploadImagesRequest } from "../../api/upload.api";
import { useAppContext } from "../../hooks/useAppContext";

export function ReviewForm({ productId, onSubmit }) {
  const { notify } = useAppContext();
  const [form, setForm] = useState({ title: "", body: "", rating: 5 });
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) return;

    if (media.length + files.length > 5) {
      notify("You can upload up to 5 images for a review.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });
      const res = await uploadImagesRequest(formData);
      if (res && res.images) {
        const urls = res.images.map((img) => img.url);
        setMedia((current) => [...current, ...urls]);
        notify("Review image(s) uploaded successfully! 📸");
      } else {
        notify("Failed to upload review image(s).");
      }
    } catch (err) {
      console.error("Upload error:", err);
      notify(err.message || "Failed to upload image(s).");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMedia = (index) => {
    setMedia((current) => current.filter((_, i) => i !== index));
    notify("Removed attachment.");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      productId,
      ...form,
      media,
    });
    setForm({ title: "", body: "", rating: 5 });
    setMedia([]);
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>✍️ Write a Review</h3>
      <div className="form-row">
        <Input
          label="Title"
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          placeholder="Short headline"
        />
        <label className="field">
          <span className="field-label">Rating</span>
          <select
            className="input"
            value={form.rating}
            onChange={(event) =>
              setForm((current) => ({ ...current, rating: Number(event.target.value) }))
            }
          >
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        <span className="field-label">Review</span>
        <textarea
          className="review-textarea"
          value={form.body}
          onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
          placeholder="How did it feel, taste, or perform?"
          required
        />
      </label>

      {/* Review Image Upload Area */}
      <div className="review-media-upload mt-4 mb-4">
        <span className="field-label block font-semibold text-xs text-gray-700 mb-2">📸 Attach Photos (Optional)</span>
        
        {media.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {media.map((url, index) => (
              <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
                <img src={url} alt="Review attachment preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveMedia(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 rounded-bl-lg flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm focus:outline-none"
                  title="Remove image"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {media.length < 5 && (
          <label className="inline-flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 hover:border-emerald-500 rounded-xl px-4 py-2.5 bg-gray-50/50 hover:bg-emerald-50/10 transition-all text-xs font-medium text-gray-600">
            {uploading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading...
              </span>
            ) : (
              <>
                <span>📁 Choose Photos</span>
                <span className="text-[10px] text-gray-400 font-normal">({media.length}/5)</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      <Button className="review-submit-btn" type="submit" disabled={uploading}>
        Post Review →
      </Button>
    </form>
  );
}
