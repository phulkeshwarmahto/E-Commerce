import { useState } from "react";
import { useParams } from "react-router-dom";
import { ProductGrid } from "../components/product/ProductGrid";
import { RatingBar } from "../components/product/RatingBar";
import { ReviewCard } from "../components/review/ReviewCard";
import { ReviewForm } from "../components/review/ReviewForm";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { useAppContext } from "../hooks/useAppContext";
import { useProductDetail } from "../hooks/useProducts";
import { useReviews } from "../hooks/useReviews";
import { formatCurrency } from "../utils/formatCurrency";
import { validatePincode } from "../utils/validatePincode";

export function ProductDetailPage() {
  const { id } = useParams();
  const { product, relatedProducts, loading } = useProductDetail(id);
  const { reviews, submitReview } = useReviews(product?.id);
  const { cart, notify, isAuthenticated } = useAppContext();
  const [pincode, setPincode] = useState("");
  const [pinMessage, setPinMessage] = useState("");

  if (loading || !product) {
    return (
      <section className="page-content">
        <Spinner />
      </section>
    );
  }

  return (
    <section className="page-content">
      <div className="detail-layout">
        <div className="detail-img-col">
          <div className="detail-img-main" style={{ background: product.bg || "#f5f0e8" }}>
            {product.images?.[0]?.url ? (
              <img className="detail-photo" src={product.images[0].url} alt={product.name} />
            ) : (
              product.emoji || "📦"
            )}
            {product.badge ? <span className={`pcard-badge ${product.badge}`}>{product.badge}</span> : null}
          </div>
          <div className="detail-img-thumbs">
            {[0, 1, 2].map((index) => (
              <div key={index} className={`detail-thumb ${index === 0 ? "active" : ""}`}>
                {product.emoji || "📦"}
              </div>
            ))}
          </div>
        </div>
        <div className="detail-info-col">
          <div className="detail-brand">{product.category}</div>
          <h1 className="detail-name">{product.name}</h1>
          <div className="detail-rating">
            <span className="stars">{"★".repeat(Math.max(1, Math.round(product.rating)))}</span>
            <span>{product.rating.toFixed(1)}</span>
            <span className="rc">{product.reviewCount} ratings</span>
          </div>
          <div className="detail-price-row">
            <span className="detail-price">{formatCurrency(product.price)}</span>
            {product.originalPrice ? (
              <span className="detail-was">{formatCurrency(product.originalPrice)}</span>
            ) : null}
          </div>
          <div className={`detail-stock ${product.inStock ? "in" : "out"}`}>
            {product.inStock ? "✅ In Stock" : "❌ Out of Stock"}
          </div>
          <p className="detail-copy detail-copy-dark">{product.description}</p>
          <div className="detail-actions">
            <Button
              className="btn-cart"
              disabled={!product.inStock}
              onClick={() => {
                cart.addToCart(product);
                notify(`${product.name} added to cart.`);
              }}
            >
              🛒 Add to Cart
            </Button>
            <Button
              className="btn-buy"
              disabled={!product.inStock}
              onClick={() => {
                cart.addToCart(product);
                notify(`${product.name} added. Continue to checkout from cart.`);
              }}
            >
              ⚡ Buy Now
            </Button>
          </div>
          <div className="detail-delivery">
            <h4>📍 Delivery Info</h4>
            <div className="delivery-row">📦 Free delivery on orders above ₹500</div>
            <div className="delivery-row">↩️ 7-day easy returns</div>
            <div className="delivery-row">🔒 Secure & encrypted checkout</div>
            <div className="pin-check">
              <input
                placeholder="Enter pincode"
                value={pincode}
                onChange={(event) => setPincode(event.target.value)}
                maxLength={6}
              />
              <button
                onClick={() =>
                  setPinMessage(
                    validatePincode(pincode)
                      ? "✅ Delivery by Tue, expected 2–4 days."
                      : "❌ Enter valid 6-digit pincode.",
                  )
                }
              >
                Check
              </button>
            </div>
            {pinMessage ? <p className="pin-message">{pinMessage}</p> : null}
          </div>
          <div className="accordion-item">
            <div className="accordion-head">
              <span>📋 Product Details</span>
            </div>
            <div className="accordion-body">
              {Object.entries(product.specifications).flatMap(([key, value]) => [
                <span key={`${key}-k`}>{key}</span>,
                <span key={`${key}-v`}>{value}</span>,
              ])}
            </div>
          </div>
        </div>
      </div>

      <section className="reviews-section">
        <div className="sec-head" style={{ marginBottom: "1rem" }}>
          <div>
            <div className="sec-label">Customer Feedback</div>
            <h2>Reviews & Ratings</h2>
          </div>
        </div>
        <div className="rating-summary">
          <div className="big-rating">
            <strong>{product.rating.toFixed(1)}</strong>
            <div className="stars">{"★".repeat(Math.max(1, Math.round(product.rating)))}</div>
            <small>{reviews.length} reviews</small>
          </div>
          <div className="rating-bars">
            <div className="rbar-row">
              <span>5★</span>
              <RatingBar rating={product.rating} reviews={reviews} />
              <span>{reviews.length}</span>
            </div>
          </div>
        </div>
        {isAuthenticated ? (
          <ReviewForm
            productId={product.id}
            onSubmit={async (payload) => {
              await submitReview(payload);
              notify("Review submitted.");
            }}
          />
        ) : (
          <p>Sign in to leave a review.</p>
        )}
        <div className="review-list">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="sec-head">
          <div>
            <div className="sec-label">You May Also Like</div>
            <h2>Related Products</h2>
          </div>
        </div>
        <ProductGrid products={relatedProducts} />
      </section>
    </section>
  );
}
