export const buildProductQuery = (products, query = {}) => {
  const search = (query.search || "").trim().toLowerCase();
  const category = query.category || "All";
  const featured = query.featured === "true";

  return products.filter((product) => {
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search) ||
      product.tags.some((tag) => tag.toLowerCase().includes(search));

    const matchesCategory = category === "All" || product.category === category;
    const matchesFeatured = !featured || product.isFeatured;

    return matchesSearch && matchesCategory && matchesFeatured;
  });
};
