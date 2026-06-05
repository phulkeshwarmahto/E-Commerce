import { useEffect, useState } from "react";
import { useAppContext } from "../../hooks/useAppContext";
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
  images: [],
  deliveryFee: "",
  variants: [],
  quantityDiscounts: [],
};

export function ProductForm({ product, onSubmit, onClose }) {
  const { categories } = useAppContext();
  const [form, setForm] = useState(baseState);
  const [newVariant, setNewVariant] = useState({
    name: "",
    price: "",
    originalPrice: "",
    stockCount: "",
  });

  const [newDiscount, setNewDiscount] = useState({ quantity: "", discountPercent: "" });

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
      images: product.images || [],
      deliveryFee: product.deliveryFee !== undefined ? product.deliveryFee : "",
      variants: product.variants || [],
      quantityDiscounts: product.quantityDiscounts || [],
    });
  }, [product]);

  const handleAddVariant = () => {
    if (!newVariant.name || !newVariant.price) {
      alert("Please enter variant name and price.");
      return;
    }
    const variant = {
      name: newVariant.name,
      price: Number(newVariant.price),
      originalPrice: newVariant.originalPrice ? Number(newVariant.originalPrice) : null,
      stockCount: Number(newVariant.stockCount || 0),
    };
    setForm((current) => ({
      ...current,
      variants: [...(current.variants || []), variant],
    }));
    setNewVariant({
      name: "",
      price: "",
      originalPrice: "",
      stockCount: "",
    });
  };

  const handleRemoveVariant = (indexToRemove) => {
    setForm((current) => ({
      ...current,
      variants: (current.variants || []).filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleAddDiscount = () => {
    if (!newDiscount.quantity || !newDiscount.discountPercent) {
      alert("Please enter quantity and discount percent.");
      return;
    }
    const q = Number(newDiscount.quantity);
    const d = Number(newDiscount.discountPercent);
    if (q < 2) {
      alert("Quantity must be at least 2.");
      return;
    }
    if (d < 1 || d > 99) {
      alert("Discount percent must be between 1 and 99.");
      return;
    }
    setForm((current) => ({
      ...current,
      quantityDiscounts: [
        ...(current.quantityDiscounts || []),
        { quantity: q, discountPercent: d }
      ].sort((a, b) => a.quantity - b.quantity)
    }));
    setNewDiscount({ quantity: "", discountPercent: "" });
  };

  const handleRemoveDiscount = (indexToRemove) => {
    setForm((current) => ({
      ...current,
      quantityDiscounts: (current.quantityDiscounts || []).filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      ...product,
      ...form,
      deliveryFee: Number(form.deliveryFee || 0),
      images: form.images || [],
      variants: form.variants || [],
      quantityDiscounts: form.quantityDiscounts || [],
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
            {categories.filter((category) => category.name !== "All").map((category) => (
              <option key={category.id || category.name} value={category.name}>{category.name}</option>
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
        <label className="field">
          <span className="field-label">Delivery Fee (₹)</span>
          <input
            className="input"
            type="number"
            min="0"
            placeholder="0 for free delivery"
            value={form.deliveryFee}
            onChange={(event) =>
              setForm((current) => ({ ...current, deliveryFee: event.target.value }))
            }
          />
        </label>
      </div>

      <div className="variants-container border border-dashed border-bd/60 rounded-xl p-4 mb-6 bg-dk/5">
        <h3 className="text-sm font-semibold text-orange mb-1">Product Variants (Weight / Size)</h3>
        <p className="text-[0.75rem] text-dk/60 mb-4">
          Add options like "250g", "1kg", or "pack of 4" with custom pricing and stock.
        </p>

        {form.variants && form.variants.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {form.variants.map((v, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-orange/10 border border-orange/20 text-orange rounded-full px-3 py-1 text-xs"
              >
                <span className="font-bold">{v.name}</span>
                <span className="opacity-75">
                  ₹{v.price} {v.originalPrice ? <del className="text-[10px]">₹{v.originalPrice}</del> : ""} (Stock: {v.stockCount})
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(idx)}
                  className="hover:text-red-500 font-bold ml-1"
                  title="Remove variant"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
          <label className="field mb-0">
            <span className="field-label text-[10px]">Variant Name</span>
            <input
              className="input text-xs py-1"
              placeholder="e.g. 500g"
              value={newVariant.name}
              onChange={(e) => setNewVariant((c) => ({ ...c, name: e.target.value }))}
            />
          </label>
          <label className="field mb-0">
            <span className="field-label text-[10px]">Price (₹)</span>
            <input
              className="input text-xs py-1"
              type="number"
              placeholder="150"
              value={newVariant.price}
              onChange={(e) => setNewVariant((c) => ({ ...c, price: e.target.value }))}
            />
          </label>
          <label className="field mb-0">
            <span className="field-label text-[10px]">Original Price (₹)</span>
            <input
              className="input text-xs py-1"
              type="number"
              placeholder="180"
              value={newVariant.originalPrice}
              onChange={(e) => setNewVariant((c) => ({ ...c, originalPrice: e.target.value }))}
            />
          </label>
          <div className="flex gap-2 items-end">
            <label className="field mb-0 flex-1">
              <span className="field-label text-[10px]">Stock</span>
              <input
                className="input text-xs py-1"
                type="number"
                placeholder="20"
                value={newVariant.stockCount}
                onChange={(e) => setNewVariant((c) => ({ ...c, stockCount: e.target.value }))}
              />
            </label>
            <Button
              type="button"
              variant="secondary"
              className="h-[38px] px-3 text-xs shrink-0"
              onClick={handleAddVariant}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
      <div className="quantity-discounts-container border border-dashed border-bd/60 rounded-xl p-4 mb-6 bg-dk/5">
        <h3 className="text-sm font-semibold text-orange mb-1">Quantity / Bulk Discounts</h3>
        <p className="text-[0.75rem] text-dk/60 mb-4">
          Add tiered discounts for purchasing multiple quantities (e.g. Buy 3+ get 10% off).
        </p>

        {form.quantityDiscounts && form.quantityDiscounts.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {form.quantityDiscounts.map((qd, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-orange/10 border border-orange/20 text-orange rounded-full px-3 py-1 text-xs"
              >
                <span className="font-bold">Buy {qd.quantity}+</span>
                <span className="opacity-75">{qd.discountPercent}% Off</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDiscount(idx)}
                  className="hover:text-red-500 font-bold ml-1"
                  title="Remove discount tier"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
          <label className="field mb-0">
            <span className="field-label text-[10px]">Minimum Quantity</span>
            <input
              className="input text-xs py-1"
              type="number"
              min="2"
              placeholder="e.g. 3"
              value={newDiscount.quantity}
              onChange={(e) => setNewDiscount((c) => ({ ...c, quantity: e.target.value }))}
            />
          </label>
          <label className="field mb-0">
            <span className="field-label text-[10px]">Discount (%)</span>
            <input
              className="input text-xs py-1"
              type="number"
              min="1"
              max="99"
              placeholder="e.g. 10"
              value={newDiscount.discountPercent}
              onChange={(e) => setNewDiscount((c) => ({ ...c, discountPercent: e.target.value }))}
            />
          </label>
          <Button
            type="button"
            variant="secondary"
            className="h-[38px] px-3 text-xs shrink-0 w-full sm:w-auto"
            onClick={handleAddDiscount}
          >
            Add Discount Tier
          </Button>
        </div>
      </div>

      <ImageUploadZone
        value={form.images}
        onChange={(images) => setForm((current) => ({ ...current, images }))}
        multiple={true}
        label="Product Images (Up to 10)"
      />
      <div className="modal-actions">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{product ? "Save Changes" : "Add Product"}</Button>
      </div>
    </form>
  );
}
