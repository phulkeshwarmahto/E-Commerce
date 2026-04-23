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
        <div className="detail-image" style={{ backgroundImage: `url(${product.images?.[0]?.url})` }} />
        <div className="detail-content">
          <p className="eyebrow">{product.category}</p>
          <h1 className="page-title">{product.name}</h1>
          <p className="detail-price">{formatCurrency(product.price)}</p>
          <p className="detail-copy">{product.description}</p>
          <div className="spec-grid">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="spec-card">
                <span>{key}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="detail-actions">
            <Button
              onClick={() => {
                cart.addToCart(product);
                notify(`${product.name} added to cart.`);
              }}
            >
              Add to Cart
            </Button>
            <div className="pincode-box">
              <span>Pincode check</span>
              <p>{validatePincode("834001") ? "Delivery available in 2-4 days." : "Enter a valid pincode."}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="section-block">
        <div className="section-head">
          <h2>Ratings & reviews</h2>
        </div>
        <div className="review-summary">
          <strong>{product.rating.toFixed(1)}</strong>
          <RatingBar rating={product.rating} reviews={reviews} />
          <span>{reviews.length} reviews</span>
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

      <section className="section-block">
        <div className="section-head">
          <h2>Related products</h2>
        </div>
        <ProductGrid products={relatedProducts} />
      </section>
    </section>
  );
}
