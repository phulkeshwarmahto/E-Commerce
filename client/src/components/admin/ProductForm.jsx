import { useEffect, useState } from "react";
import { categories } from "../../constants/categories";
import { Button } from "../ui/Button";
import { ImageUploadZone } from "./ImageUploadZone";

const baseState = {
  name: "",
  category: "Pantry",
  price: "",
  originalPrice: "",
  description: "",
  stockCount: 12,
  badge: "",
  imageUrl: "",
};

export function ProductForm({ product, onSubmit, onClose }) {
  const [form, setForm] = useState(baseState);

  useEffect(() => {
    if (!product) {
      setForm(baseState);
      return;
    }

    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice || "",
      description: product.description,
      stockCount: product.stockCount,
      badge: product.badge || "",
      imageUrl: product.images?.[0]?.url || "",
    });
  }, [product]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      ...product,
      ...form,
      images: form.imageUrl ? [{ url: form.imageUrl, alt: form.name, publicId: "manual" }] : [],
    });
    setForm(baseState);
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label className="field">
          <span className="field-label">Name</span>
          <input
            className="input"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Category</span>
          <select
            className="input"
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({ ...current, category: event.target.value }))
            }
          >
            {categories.filter((category) => category !== "All").map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-row">
        <label className="field">
          <span className="field-label">Price</span>
          <input
            className="input"
            type="number"
            value={form.price}
            onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Original price</span>
          <input
            className="input"
            type="number"
            value={form.originalPrice}
            onChange={(event) =>
              setForm((current) => ({ ...current, originalPrice: event.target.value }))
            }
          />
        </label>
      </div>
      <label className="field">
        <span className="field-label">Description</span>
        <textarea
          className="input textarea"
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({ ...current, description: event.target.value }))
          }
          required
        />
      </label>
      <div className="form-row">
        <label className="field">
          <span className="field-label">Stock count</span>
          <input
            className="input"
            type="number"
            value={form.stockCount}
            onChange={(event) =>
              setForm((current) => ({ ...current, stockCount: event.target.value }))
            }
          />
        </label>
        <label className="field">
          <span className="field-label">Badge</span>
          <select
            className="input"
            value={form.badge}
            onChange={(event) => setForm((current) => ({ ...current, badge: event.target.value }))}
          >
            <option value="">None</option>
            <option value="sale">sale</option>
            <option value="new">new</option>
          </select>
        </label>
      </div>
      <ImageUploadZone value={form.imageUrl} onChange={(imageUrl) => setForm((current) => ({ ...current, imageUrl }))} />
      <div className="modal-actions">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{product ? "Save Changes" : "Add Product"}</Button>
      </div>
    </form>
  );
}
