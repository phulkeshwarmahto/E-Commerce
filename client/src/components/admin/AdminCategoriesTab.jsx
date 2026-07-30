import { useState } from "react";
import { createCategoryRequest, updateCategoryRequest, deleteCategoryRequest } from "../../api/category.api";

export function AdminCategoriesTab({ categories, reloadCategories, notify, confirm }) {
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("📦");
  const [editingCategory, setEditingCategory] = useState(null);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      await createCategoryRequest({ name: newCatName.trim(), emoji: newCatEmoji.trim() });
      notify(`Category "${newCatName}" created!`);
      setNewCatName("");
      setNewCatEmoji("📦");
      reloadCategories();
    } catch (err) {
      notify(err.message || "Failed to create category.");
    }
  };

  const handleSaveCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    try {
      await updateCategoryRequest(editingCategory.id, {
        name: editingCategory.name.trim(),
        emoji: editingCategory.emoji.trim(),
      });
      notify("Category updated successfully.");
      setEditingCategory(null);
      reloadCategories();
    } catch (err) {
      notify(err.message || "Failed to update category.");
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (await confirm(`Delete category "${name}"?`)) {
      try {
        await deleteCategoryRequest(id);
        notify(`Category "${name}" deleted.`);
        reloadCategories();
      } catch (err) {
        notify(err.message || "Failed to delete category.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">📁 Add New Category</h2>
        <p className="text-xs text-gray-500 mb-4">Create new taxonomy classifications for general store products.</p>

        <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-center text-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Emoji"
            value={newCatEmoji}
            onChange={(e) => setNewCatEmoji(e.target.value)}
          />
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Category Name (e.g. Organic Spices)"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            required
          />
          <button
            type="submit"
            className="py-2.5 px-6 bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
          >
            ➕ Add Category
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Product Categories ({categories.length})</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex items-center justify-between gap-3 hover:shadow-sm transition-all"
            >
              {editingCategory?.id === cat.id ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    className="w-12 px-1 py-1 border border-gray-300 rounded text-center"
                    value={editingCategory.emoji}
                    onChange={(e) => setEditingCategory({ ...editingCategory, emoji: e.target.value })}
                  />
                  <input
                    type="text"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  />
                  <button
                    type="button"
                    className="text-xs text-green-700 font-bold"
                    onClick={handleSaveCategory}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="text-xs text-gray-500"
                    onClick={() => setEditingCategory(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.emoji || "📦"}</span>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{cat.name}</h4>
                      <span className="text-[10px] text-gray-400 font-mono">slug: {cat.slug}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-xs text-blue-600 font-semibold hover:underline"
                      onClick={() => setEditingCategory({ id: cat.id, name: cat.name, emoji: cat.emoji })}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-xs text-red-600 font-semibold hover:underline"
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
