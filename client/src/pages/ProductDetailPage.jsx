import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductGrid } from "../components/product/ProductGrid";
import { ReviewCard } from "../components/review/ReviewCard";
import { ReviewForm } from "../components/review/ReviewForm";
import { Spinner } from "../components/ui/Spinner";
import { useAppContext } from "../hooks/useAppContext";
import { useProductDetail } from "../hooks/useProducts";
import { useReviews } from "../hooks/useReviews";
import { formatCurrency } from "../utils/formatCurrency";
import { validatePincode } from "../utils/validatePincode";
import { getProductFAQsRequest, createQuestionRequest } from "../api/faq.api";
import { ReportModal } from "../components/ui/ReportModal";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { optimizeCloudinaryUrl } from "../utils/optimizeImage";

// Star SVGs
function Star({ filled, half }) {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4"
      fill={filled ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="1.5">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => <Star key={i} filled={i < Math.round(rating)} />)}
    </div>
  );
}

const offers = [
  { icon: "🏦", title: "Bank Offer", desc: "10% instant discount on HDFC Bank cards, T&C apply" },
  { icon: "🎁", title: "Special Offer", desc: "Buy 2 get 1 free on select items from this category" },
  { icon: "💳", title: "No-Cost EMI",  desc: "Available on orders above ₹999 — 3, 6, 12 months" },
];

export function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { product, relatedProducts, loading } = useProductDetail(id);
  const { reviews, submitReview } = useReviews(product?.id);
  const { cart, notify, isAuthenticated, user, orders } = useAppContext();
  const [pincode, setPincode] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [offersExpanded, setOffersExpanded] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(true);

  const orderList = orders?.orders || [];
  const hasPurchased = orderList.some(order => 
    order.status !== "Cancelled" && 
    order.items?.some(item => (item.productId === product?.id || item.productId === product?._id))
  );

  // SEO Dynamic Metadata
  useDocumentMetadata({
    title: product ? `${product.name} - Buy Online` : "Loading Product...",
    description: product ? `${product.description.slice(0, 150)}... Sourced directly from local partners, secure payments, free shipping on orders above ₹500.` : "Loading product details...",
    schema: product ? {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": product.images?.[0]?.url || "",
      "description": product.description,
      "sku": product.id,
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "INR",
        "price": product.price,
        "itemCondition": "https://schema.org/NewCondition",
        "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      },
      ...(product.reviewCount > 0 ? {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": product.rating,
          "reviewCount": product.reviewCount
        }
      } : {})
    } : null
  });

  // Report States
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState({ type: "product", id: "", name: "" });

  const handleOpenReport = (type, id, name) => {
    setReportTarget({ type, id, name });
    setReportModalOpen(true);
  };

  // FAQ States
  const [faqs, setFaqs] = useState([]);
  const [questionDraft, setQuestionDraft] = useState("");
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  useEffect(() => {
    if (product?.id) {
      getProductFAQsRequest(product.id)
        .then((data) => {
          setFaqs(data.faqs || []);
        })
        .catch(() => {});
    }
  }, [product?.id]);

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!questionDraft.trim()) return;
    setSubmittingQuestion(true);
    try {
      const res = await createQuestionRequest({
        productId: product.id,
        question: questionDraft.trim(),
      });
      notify("Your question was submitted! Merchants/admins will answer it shortly.");
      setFaqs((current) => [res.faq, ...current]);
      setQuestionDraft("");
    } catch (err) {
      notify(err.message || "Failed to submit question.");
    } finally {
      setSubmittingQuestion(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const ratingCounts = Array.from({ length: 5 }, (_, i) => {
    const star = 5 - i;
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    return { star, count };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[0.75rem] text-gray-500 mb-5 flex-wrap">
          <button onClick={() => navigate("/")} className="hover:text-[#c4622d] transition-colors">Home</button>
          <span>›</span>
          <button onClick={() => navigate("/shop")} className="hover:text-[#c4622d] transition-colors">Shop</button>
          <span>›</span>
          <button onClick={() => navigate(`/shop?category=${product.category}`)} className="hover:text-[#c4622d] transition-colors">
            {product.category}
          </button>
          <span>›</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* ── Main Detail Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] lg:grid-cols-[420px_1fr_280px] gap-5 lg:gap-6 items-start">

          {/* ── Image Column ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div
              className="rounded-2xl overflow-hidden border border-gray-200 bg-white
                         flex items-center justify-center relative"
              style={{ background: product.bg || "#f5f0e8", minHeight: "320px" }}
            >
              {product.images?.[0]?.url ? (
                <img
                  className="w-full h-[320px] md:h-[380px] object-cover"
                  src={optimizeCloudinaryUrl(product.images[selectedThumb]?.url || product.images[0].url, { width: 800 })}
                  alt={product.name}
                />
              ) : (
                <span className="text-[8rem] select-none">{product.emoji || "📦"}</span>
              )}
              {product.badge && (
                <span className={`absolute top-3 left-3 px-2.5 py-1 rounded text-[0.65rem] font-bold uppercase tracking-wide
                  ${product.badge === "sale" ? "bg-[#c4622d] text-white" : "bg-emerald-600 text-white"}`}>
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedThumb(i)}
                    className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center
                               text-2xl overflow-hidden transition-all shrink-0
                               ${selectedThumb === i
                                 ? "border-[#c4622d] shadow-sm"
                                 : "border-gray-200 hover:border-gray-400"}`}
                    style={{ background: product.bg || "#f5f0e8" }}
                  >
                    <img src={optimizeCloudinaryUrl(img.url, { width: 150 })} alt={`${product.name} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info Column ── */}
          <div className="space-y-4">
            {/* Category + name + Report */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-[0.72rem] font-bold uppercase tracking-widest text-[#9b6b3a] mb-1">
                  {product.category}
                </p>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
                  {product.name}
                </h1>
              </div>
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => handleOpenReport("product", product.id, product.name)}
                  className="text-gray-400 hover:text-red-600 transition-colors text-xs font-semibold flex items-center gap-1 border border-gray-200 hover:border-red-200 rounded-lg px-2.5 py-1 bg-white cursor-pointer hover:bg-red-50/20"
                >
                  ⚠️ Report
                </button>
              )}
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-3 flex-wrap">
              <StarRow rating={product.rating} />
              <span className="text-amber-500 font-bold text-sm">{product.rating.toFixed(1)}</span>
              <span className="text-gray-400 text-sm">|</span>
              <span className="text-blue-600 text-sm hover:underline cursor-pointer">
                {product.reviewCount} ratings
              </span>
            </div>

            {/* Price */}
            <div className="border-t border-dashed border-gray-200 pt-4">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-base text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span>
                )}
                {discount > 0 && (
                  <span className="text-base font-bold text-emerald-600">{discount}% off</span>
                )}
              </div>
              {product.originalPrice && (
                <p className="text-emerald-600 font-semibold text-sm mt-1">
                  You save {formatCurrency(product.originalPrice - product.price)}
                </p>
              )}
            </div>

            {/* Stock */}
            <div>
              <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full
                ${product.inStock
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-600 border border-red-200"}`}>
                <span className="w-2 h-2 rounded-full inline-block"
                  style={{ background: product.inStock ? "#16a34a" : "#dc2626" }} />
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-[0.88rem] leading-relaxed">{product.description}</p>

            {/* Offers */}
            <div className="bg-[#f5f0e8] rounded-xl border border-[#e0d5c5] p-4">
              <p className="font-bold text-[#2c1a0e] text-sm mb-3">🏷️ Available Offers</p>
              <div className="space-y-2.5">
                {(offersExpanded ? offers : offers.slice(0, 2)).map((o) => (
                  <div key={o.title} className="flex gap-2.5">
                    <span className="text-base flex-shrink-0">{o.icon}</span>
                    <p className="text-[0.78rem] text-gray-700 leading-snug">
                      <strong className="text-gray-900">{o.title}: </strong>{o.desc}
                    </p>
                  </div>
                ))}
              </div>
              {offers.length > 2 && (
                <button
                  onClick={() => setOffersExpanded(!offersExpanded)}
                  className="text-[#c4622d] text-[0.78rem] font-semibold hover:underline mt-2"
                >
                  {offersExpanded ? "See less" : `+${offers.length - 2} more offers`}
                </button>
              )}
            </div>

            {/* Specifications (accordion) */}
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
              <button
                onClick={() => setSpecsOpen(!specsOpen)}
                className="w-full flex items-center justify-between px-4 py-3
                           font-bold text-gray-800 text-sm hover:bg-gray-50 transition-colors"
              >
                <span>📋 Product Specifications</span>
                <svg viewBox="0 0 20 20" fill="currentColor"
                  className={`w-4 h-4 transition-transform ${specsOpen ? "rotate-180" : ""}`}>
                  <path fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd" />
                </svg>
              </button>
              {specsOpen && (
                <div className="border-t border-gray-100">
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(product.specifications || {}).map(([key, val], idx) => (
                        <tr key={key} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          <td className="px-4 py-2.5 font-semibold text-gray-600 w-2/5 border-b border-gray-100">{key}</td>
                          <td className="px-4 py-2.5 text-gray-800 border-b border-gray-100">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ── Sticky Buy Panel ── */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
              {/* Price */}
              <div>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-400 line-through ml-2">{formatCurrency(product.originalPrice)}</span>
                )}
              </div>

              {/* Stock pill */}
              <div className={`text-sm font-semibold ${product.inStock ? "text-emerald-600" : "text-red-500"}`}>
                {product.inStock ? "✓ In Stock" : "✗ Currently Unavailable"}
              </div>

              {/* Delivery info */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <p className="text-[0.78rem] font-bold text-gray-700 mb-2">📍 Delivery Info</p>
                {[
                  "📦 Free delivery on orders above ₹500",
                  "↩️ 7-day easy returns",
                  "🔒 Secure & encrypted checkout",
                ].map((line) => (
                  <p key={line} className="text-[0.75rem] text-gray-600">{line}</p>
                ))}
              </div>

              {/* Pincode check */}
              <div>
                <p className="text-[0.75rem] font-semibold text-gray-700 mb-1.5">Check delivery availability</p>
                <div className="flex gap-2">
                  <input
                    placeholder="Enter pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    maxLength={6}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm
                               focus:outline-none focus:border-[#c4622d] focus:ring-1 focus:ring-[#c4622d]/30"
                  />
                  <button
                    onClick={() =>
                      setPinMessage(
                        validatePincode(pincode)
                          ? "✅ Delivery by Tue, 2–4 days."
                          : "❌ Enter valid 6-digit pincode."
                      )
                    }
                    className="bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold
                               px-4 py-2 rounded-lg transition-colors"
                  >
                    Check
                  </button>
                </div>
                {pinMessage && (
                  <p className="text-[0.75rem] mt-1.5 font-medium text-gray-700">{pinMessage}</p>
                )}
              </div>

              {/* CTA Buttons */}
              {user?.role === "seller" ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-center text-xs font-semibold leading-relaxed shadow-sm">
                  🏪 Merchant Viewing Mode: <br /> Sellers are restricted from purchasing products.
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  <button
                    disabled={!product.inStock}
                    onClick={() => { cart.addToCart(product); notify(`${product.name} added to cart.`); }}
                    className={`w-full py-3 rounded-xl font-bold text-sm border-2 transition-all
                      ${product.inStock
                        ? "border-[#c4622d] text-[#c4622d] hover:bg-[#c4622d] hover:text-white"
                        : "border-gray-300 text-gray-400 cursor-not-allowed opacity-50"}`}
                  >
                    🛒 Add to Cart
                  </button>
                  <button
                    disabled={!product.inStock}
                    onClick={() => { cart.addToCart(product); navigate("/cart"); }}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all
                      ${product.inStock
                        ? "bg-[#c4622d] hover:bg-[#e07a4a] text-white shadow-sm"
                        : "bg-gray-300 text-gray-400 cursor-not-allowed opacity-50"}`}
                  >
                    ⚡ Buy Now
                  </button>
                </div>
              )}

              {/* Trust mini-row */}
              <div className="flex justify-around pt-1 border-t border-gray-100">
                {[["🔒", "Secure"], ["↩️", "Returns"], ["🌿", "Natural"]].map(([icon, lbl]) => (
                  <div key={lbl} className="flex flex-col items-center gap-1 text-center">
                    <span className="text-lg">{icon}</span>
                    <span className="text-[0.62rem] text-gray-500 font-medium">{lbl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Reviews Section ── */}
        <section className="mt-10 bg-white rounded-2xl border border-gray-200 p-5 md:p-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#9b6b3a] mb-0.5">
                Customer Feedback
              </p>
              <h2 className="text-xl font-bold text-[#2c1a0e]">Reviews & Ratings</h2>
            </div>
          </div>

          {/* Rating Summary */}
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 mb-8 p-5
                          bg-[#f5f0e8] rounded-xl border border-[#e0d5c5]">
            {/* Big number */}
            <div className="flex flex-col items-center justify-center text-center px-6 border-r border-[#e0d5c5]">
              <strong className="text-5xl font-extrabold text-[#2c1a0e]">{product.rating.toFixed(1)}</strong>
              <StarRow rating={product.rating} />
              <p className="text-[0.72rem] text-gray-500 mt-1">{reviews.length} reviews</p>
            </div>

            {/* Rating bars 5★ → 1★ */}
            <div className="space-y-2 flex-1">
              {ratingCounts.map(({ star, count }) => {
                const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-600 w-4 text-right">{star}★</span>
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review Form */}
          {user?.role === "seller" ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-6 text-xs font-semibold leading-relaxed shadow-sm">
              🏪 Merchant Viewing Mode: Sellers cannot submit ratings or reviews.
            </div>
          ) : isAuthenticated ? (
            hasPurchased ? (
              <div className="mb-8">
                <h3 className="font-bold text-gray-800 mb-3 text-sm">Write a Review</h3>
                <ReviewForm
                  productId={product.id}
                  onSubmit={async (payload) => {
                    try {
                      await submitReview(payload);
                      notify("Review submitted successfully! Thank you. 🌟");
                    } catch (err) {
                      notify(err.message || "Failed to submit review.");
                    }
                  }}
                />
              </div>
            ) : (
              <div className="bg-amber-50 border border-[#e0d5c5] rounded-2xl p-5 mb-6 text-xs text-amber-805 flex items-start gap-3.5 shadow-sm max-w-2xl">
                <span className="text-xl shrink-0">🔒</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm mb-1">Verified Purchase Required</p>
                  <p className="text-gray-600 leading-relaxed">
                    Only verified buyers who have purchased this product can leave a review. 
                    If you placed an order, please wait for payment confirmation or check its status under 
                    <button onClick={() => navigate("/orders")} className="underline font-semibold text-amber-800 hover:text-amber-900 ml-1">My Orders</button>.
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700">
              <button onClick={() => navigate("/auth")} className="font-semibold underline">Sign in</button> to leave a review.
            </div>
          )}

          {/* Review List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onReport={isAuthenticated ? (rev) => handleOpenReport("review", rev.id, `Review by ${rev.name}`) : null}
              />
            ))}
            {reviews.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-8">No reviews yet. Be the first!</p>
            )}
          </div>
        </section>

        {/* ── FAQ / Q&A Section ── */}
        <section className="mt-8 bg-white rounded-2xl border border-gray-200 p-5 md:p-8 text-left">
          <div className="mb-6">
            <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#9b6b3a] mb-0.5">
              Have Questions?
            </p>
            <h2 className="text-xl font-bold text-[#2c1a0e]">Customer Questions & Answers</h2>
          </div>

          {/* Ask a question form */}
          {user?.role === "seller" ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-6 text-xs font-semibold leading-relaxed shadow-sm">
              🏪 Merchant Viewing Mode: Sellers cannot submit product questions.
            </div>
          ) : isAuthenticated ? (
            <form onSubmit={handleQuestionSubmit} className="mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <label className="text-xs font-bold text-gray-600 block mb-1.5">Ask a question about this product</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., Is this product organic/gluten-free?"
                  value={questionDraft}
                  onChange={(e) => setQuestionDraft(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#c4622d] transition-all bg-white"
                  required
                />
                <button
                  type="submit"
                  disabled={submittingQuestion || !questionDraft.trim()}
                  className="bg-[#c4622d] hover:bg-[#a95223] disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm"
                >
                  {submittingQuestion ? "Submitting..." : "Ask Question"}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700">
              <button onClick={() => navigate("/auth")} className="font-semibold underline">Sign in</button> to ask a question.
            </div>
          )}

          {/* Questions list */}
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.id} className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex gap-3 items-start">
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded shrink-0">Q</span>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900 text-sm">{faq.question}</p>
                    <p className="text-[0.68rem] text-gray-400 font-semibold">Asked by {faq.buyerName} on {new Date(faq.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start mt-3 pl-2 border-l-2 border-purple-200 text-left">
                  <span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded shrink-0">A</span>
                  <div className="space-y-1">
                    {faq.isAnswered ? (
                      <>
                        <p className="text-gray-700 text-sm leading-relaxed">{faq.answer}</p>
                        <p className="text-[0.68rem] text-gray-400 font-semibold">
                          Answered by {faq.answeredByName || "Merchant"}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-400 text-xs italic">This question hasn't been answered by the merchant yet.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {faqs.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No questions asked about this product yet. Ask yours above!
              </p>
            )}
          </div>
        </section>

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <section className="mt-8">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#9b6b3a] mb-0.5">
                  You May Also Like
                </p>
                <h2 className="text-xl font-bold text-[#2c1a0e]">Related Products</h2>
              </div>
            </div>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
        {/* Report Modal */}
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          reportType={reportTarget.type}
          targetId={reportTarget.id}
          targetName={reportTarget.name}
        />
      </div>
    </div>
  );
}
