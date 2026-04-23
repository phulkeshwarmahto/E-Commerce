import { Link } from "react-router-dom";
import { useAppContext } from "../../hooks/useAppContext";
import { calculateDiscount } from "../../utils/calculateDiscount";
import { formatCurrency } from "../../utils/formatCurrency";
import { Button } from "../ui/Button";
import { StarRating } from "../ui/StarRating";
import { ProductBadge } from "./ProductBadge";

export function ProductCard({ product }) {
  const { cart, wishlistIds, toggleWishlist, notify } = useAppContext();
  const discount = calculateDiscount(product.price, product.originalPrice);
  const isWishlisted = wishlistIds.includes(product.id);

  return (
    <article className="pcard">
      <div className="pcard-img" style={{ background: product.bg || "#f5f0e8" }}>
        {product.images?.[0]?.url ? (
          <img className="pcard-photo" src={product.images[0].url} alt={product.name} />
        ) : (
          <span>{product.emoji || "📦"}</span>
        )}
        <ProductBadge badge={product.badge} />
        <button className={`pcard-wl ${isWishlisted ? "active" : ""}`} onClick={() => toggleWishlist(product.id)}>
          {isWishlisted ? "♥" : "♡"}
        </button>
        {!product.inStock ? <div className="pcard-out">Out of Stock</div> : null}
      </div>
      <div className="pcard-body">
        <p className="pcard-cat">{product.category}</p>
        <Link className="pcard-name" to={`/products/${product.slug}`}>
          {product.name}
        </Link>
        <div className="pcard-rating">
          <StarRating rating={product.rating} />
          <span>{product.rating.toFixed(1)}</span>
          <span>({product.reviewCount})</span>
        </div>
        <div className="pcard-price-row">
          <span className="pcard-price">{formatCurrency(product.price)}</span>
          {product.originalPrice ? (
            <span className="pcard-orig">{formatCurrency(product.originalPrice)}</span>
          ) : null}
          {discount ? <span className="pcard-off">{discount}% off</span> : null}
        </div>
        <Button
          className={`pcard-add ${!product.inStock ? "disabled" : ""}`}
          variant="secondary"
          disabled={!product.inStock}
          onClick={() => {
            cart.addToCart(product);
            notify(`${product.name} added to cart.`);
          }}
        >
          Add to Cart
        </Button>
      </div>
    </article>
  );
}
