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
    <article className="product-card">
      <div className="product-image" style={{ backgroundImage: `url(${product.images?.[0]?.url})` }}>
        <ProductBadge badge={product.badge} />
        <button className="wishlist-button" onClick={() => toggleWishlist(product.id)}>
          {isWishlisted ? "♥" : "♡"}
        </button>
      </div>
      <div className="product-body">
        <p className="eyebrow">{product.category}</p>
        <Link className="product-title" to={`/products/${product.slug}`}>
          {product.name}
        </Link>
        <div className="rating-row">
          <StarRating rating={product.rating} />
          <span>{product.rating.toFixed(1)}</span>
          <span>({product.reviewCount})</span>
        </div>
        <p className="product-price">
          {formatCurrency(product.price)}
          {product.originalPrice ? <span>{formatCurrency(product.originalPrice)}</span> : null}
        </p>
        {discount ? <p className="discount-copy">{discount}% off today</p> : null}
        <Button
          variant="secondary"
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
