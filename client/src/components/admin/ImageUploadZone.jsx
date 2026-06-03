import { useState } from "react";
import { uploadImageRequest } from "../../api/upload.api";
import { useAppContext } from "../../hooks/useAppContext";

export function ImageUploadZone({ value, onChange }) {
  const { notify } = useAppContext();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

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
      notify(err.message || "Failed to upload image. Cloudinary may be down. You can paste a direct URL instead.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-4 text-xs">
      <div className="flex gap-4 items-center">
        {/* Preview Box */}
        <div className="w-20 h-20 bg-gray-100 border border-gray-300 rounded-xl overflow-hidden flex items-center justify-center shrink-0 text-gray-400">
          {value ? (
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">🖼️</span>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-grow flex flex-col gap-2">
          <span className="font-bold text-gray-700 block">Product Image</span>
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
                className="text-red-500 hover:text-red-700 font-bold hover:underline transition-colors text-[11px]"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Paste URL block */}
      <div className="field">
        <label className="label text-xs font-semibold text-gray-700">Or Paste Image Direct Link / URL</label>
        <input
          type="text"
          className="input py-2"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="e.g. https://images.unsplash.com/photo-..."
        />
      </div>
    </div>
  );
}
