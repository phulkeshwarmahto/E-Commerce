import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductGrid } from "../components/product/ProductGrid";
import { Spinner } from "../components/ui/Spinner";
import { categories } from "../constants/categories";
import { useDebounce } from "../hooks/useDebounce";
import { useProducts } from "../hooks/useProducts";

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "All";
  const debouncedSearch = useDebounce(search);
  const filters = useMemo(
    () => ({ search: debouncedSearch, category }),
    [category, debouncedSearch],
  );
  const { products, loading, error } = useProducts(filters);

  return (
    <section className="page-content">
      <div className="section-head">
        <div>
          <p className="eyebrow">Shop</p>
          <h1 className="page-title">Curated natural goods</h1>
        </div>
      </div>
      <div className="filter-bar">
        <input
          className="input"
          value={search}
          placeholder="Search products"
          onChange={(event) => {
            const next = new URLSearchParams(searchParams);
            if (event.target.value) {
              next.set("search", event.target.value);
            } else {
              next.delete("search");
            }
            setSearchParams(next);
          }}
        />
        <select
          className="input"
          value={category}
          onChange={(event) => {
            const next = new URLSearchParams(searchParams);
            if (event.target.value === "All") {
              next.delete("category");
            } else {
              next.set("category", event.target.value);
            }
            setSearchParams(next);
          }}
        >
          {categories.map((entry) => (
            <option key={entry}>{entry}</option>
          ))}
        </select>
      </div>
      {loading ? <Spinner /> : null}
      {error ? <p>{error}</p> : null}
      {!loading && !error ? <ProductGrid products={products} /> : null}
    </section>
  );
}
