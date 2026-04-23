import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function ReviewForm({ productId, onSubmit }) {
  const [form, setForm] = useState({ title: "", body: "", rating: 5 });

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      productId,
      ...form,
    });
    setForm({ title: "", body: "", rating: 5 });
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
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
          className="input textarea"
          value={form.body}
          onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
          placeholder="How did it feel, taste, or perform?"
          required
        />
      </label>
      <Button type="submit">Submit Review</Button>
    </form>
  );
}
