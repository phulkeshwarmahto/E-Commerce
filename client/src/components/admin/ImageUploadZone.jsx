import { useState } from "react";
import { uploadImageRequest } from "../../api/upload.api";
import { useAppContext } from "../../hooks/useAppContext";

import { useState } from "react";
import { uploadImageRequest, uploadImagesRequest } from "../../api/upload.api";
import { useAppContext } from "../../hooks/useAppContext";

export function ImageUploadZone({ value, onChange, label = "Product Image", multiple = false }) {
  const { notify } = useAppContext();
  const [uploading, setUploading] = useState(false);
  const [pasteUrl, setPasteUrl] = useState("");

  const handleFileChange = async (event) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) return;

    if (!multiple) {
      // Single Mode
      const file = files[0];
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", file);
        const res = await uploadImageRequest(formData);
        if (res && res.url) {
          onChange(res.url);
          notify("Image uploaded successfully! 📸");
        } else {
          notify("Failed to get image URL from response.");
        }
      } catch (err) {
        console.error("Upload error:", err);
        notify(err.message || "Failed to upload image.");
      } finally {
        setUploading(false);
      }
    } else {
      // Multiple Mode
      const currentImages = Array.isArray(value) ? value : [];
      if (currentImages.length + files.length > 10) {
        notify(`You can only upload up to 10 images. You currently have ${currentImages.length} images and tried to add ${files.length}.`);
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
          const newImages = res.images.map((img) => ({
            url: img.url,
            publicId: img.publicId || "cloudinary",
            alt: "",
          }));
          onChange([...currentImages, ...newImages]);
          notify(`Successfully uploaded ${newImages.length} image(s)! 📸`);
        } else {
          notify("Failed to get image details from response.");
        }
      } catch (err) {
        console.error("Upload error:", err);
        notify(err.message || "Failed to upload images.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleAddUrl = () => {
    if (!pasteUrl.trim()) return;
    if (!multiple) {
      onChange(pasteUrl.trim());
      setPasteUrl("");
      notify("Direct image link set!");
    } else {
      const currentImages = Array.isArray(value) ? value : [];
      if (currentImages.length >= 10) {
        notify("You can only upload up to 10 images.");
        return;
      }
      onChange([...currentImages, { url: pasteUrl.trim(), publicId: "manual", alt: "" }]);
      setPasteUrl("");
      notify("Direct image link added!");
    }
  };

  const handleRemoveImage = (index) => {
    const currentImages = Array.isArray(value) ? value : [];
    const updated = currentImages.filter((_, i) => i !== index);
    onChange(updated);
    notify("Image removed.");
  };

  const handleUpdateAlt = (index, newAlt) => {
    const currentImages = Array.isArray(value) ? value : [];
    const updated = currentImages.map((img, i) => i === index ? { ...img, alt: newAlt } : img);
    onChange(updated);
  };

  // For multiple mode, normalize value to array
  const imageList = multiple ? (Array.isArray(value) ? value : []) : [];

  return (
    <div className="bg-white/40 backdrop-blur-md border border-gray-200/60 rounded-2xl p-5 flex flex-col gap-5 text-xs shadow-sm hover:shadow-md transition-all duration-300">
      <span className="font-bold text-gray-800 text-sm tracking-wide block">{label}</span>

      {multiple ? (
        // Multiple Images UI
        <div className="flex flex-col gap-4">
          {imageList.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {imageList.map((img, index) => (
                <div key={index} className="relative group bg-gray-50 border border-gray-200 rounded-xl p-2 flex flex-col gap-2 transition-all duration-200 hover:border-emerald-500/50 hover:shadow-sm">
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100">
                    <img src={img.url} alt={img.alt || "Product image"} className="w-full h-full object-cover" />
                    
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm focus:outline-none"
                      title="Remove image"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    {/* Badge showing index */}
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[9px] font-bold rounded bg-gray-900/65 text-white">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Alt input for SEO */}
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded px-1.5 py-1 text-[10px] focus:outline-none focus:border-emerald-500"
                    placeholder="Image Alt text (SEO)"
                    value={img.alt || ""}
                    onChange={(e) => handleUpdateAlt(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {imageList.length < 10 && (
            <div className="flex flex-col sm:flex-row gap-4 items-center mt-2">
              <label className="w-full sm:w-auto button button-secondary cursor-pointer py-2.5 px-4 text-xs font-semibold text-center rounded-xl border border-gray-300 hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                {uploading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  <>
                    <span>📁 Upload Image Files</span>
                    <span className="text-[10px] text-gray-500 font-normal">({imageList.length}/10)</span>
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
              <span className="text-gray-400 text-[11px]">Choose up to {10 - imageList.length} more file(s) (JPEG, PNG, WebP)</span>
            </div>
          )}
        </div>
      ) : (
        // Single Image UI (same as original, but styled beautifully)
        <div className="flex gap-4 items-center">
          <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0 text-gray-400 shadow-inner">
            {value ? (
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">🖼️</span>
            )}
          </div>

          <div className="flex-grow flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="button button-secondary cursor-pointer py-1.5 px-3 text-[11px] font-semibold text-center rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors">
                {uploading ? "Uploading..." : "📁 Upload Image File"}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  disabled={uploading} 
                  className="hidden" 
                />
              </label>
              {value && (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="text-red-500 hover:text-red-700 font-semibold hover:underline transition-colors text-[11px]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Paste URL block */}
      {(!multiple || imageList.length < 10) && (
        <div className="field border-t border-gray-100 pt-4">
          <label className="label text-xs font-semibold text-gray-700 block mb-1.5">
            {multiple ? "Add Direct Image Link / URL" : "Or Paste Image Direct Link / URL"}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input py-2 flex-grow text-xs"
              value={pasteUrl}
              onChange={(event) => setPasteUrl(event.target.value)}
              placeholder="e.g. https://images.unsplash.com/photo-..."
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="button button-secondary px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              {multiple ? "Add" : "Set"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
