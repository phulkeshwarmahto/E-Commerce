import { ProductGrid } from "../components/product/ProductGrid";
import { useAppContext } from "../hooks/useAppContext";
import { useProducts } from "../hooks/useProducts";

export function WishlistPage() {
  const { wishlistIds } = useAppContext();
  const { products } = useProducts({});
  const items = products.filter((product) => wishlistIds.includes(product.id));

  return (
    <section className="page-content">
      <div className="section-head">
        <h1 className="page-title">Wishlist</h1>
      </div>
      {items.length ? <ProductGrid products={items} /> : <p>Your wishlist is still empty.</p>}
    </section>
  );
}
