import { ProductGrid } from "../components/product/ProductGrid";
import { useAppContext } from "../hooks/useAppContext";
import { useProducts } from "../hooks/useProducts";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";

export function WishlistPage() {
  const { wishlistIds } = useAppContext();
  const { products } = useProducts({});
  const items = products.filter((product) => wishlistIds.includes(product.id));

  useDocumentMetadata({
    title: "My Wishlist",
    description: "View and shop your saved favorites. Track prices and availability of your preferred organic products on GaramBazaar."
  });

  return (
    <section className="page-content">
      <div className="wishlist-page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <h2>❤️ My Wishlist ({items.length})</h2>
        {items.length ? (
          <ProductGrid products={items} />
        ) : (
          <div className="empty-state">
            <p>❤️</p>
            <h3>Your wishlist is empty</h3>
            <small>Heart products to save them here.</small>
          </div>
        )}
      </div>
    </section>
  );
}
