import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, scrollable = false }) {
  return (
    <div className={scrollable ? "product-hscroll" : "product-grid"}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
