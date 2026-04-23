import { Link } from "react-router-dom";
import { ProductGrid } from "../components/product/ProductGrid";
import { Spinner } from "../components/ui/Spinner";
import { categories } from "../constants/categories";
import { useProducts } from "../hooks/useProducts";
import { useTimer } from "../hooks/useTimer";

export function HomePage() {
  const { products, featured, loading } = useProducts({});
  const timer = useTimer();
  const deal = [...products]
    .filter((product) => product.originalPrice)
    .sort(
      (left, right) =>
        (right.originalPrice - right.price) / right.originalPrice -
        (left.originalPrice - left.price) / left.originalPrice,
    )[0];
  const topProducts = [...products].sort((left, right) => right.rating - left.rating).slice(0, 8);
  const newArrivals = products.filter((product) => product.badge === "new").slice(0, 8);
  const categoryEmoji = {
    All: "🛒",
    Pantry: "🫙",
    Beverages: "☕",
    Home: "🏠",
    "Personal Care": "💆",
    Health: "💊",
  };

  return (
    <section className="page-content">
      <section className="hero">
        <div className="hero-text fade-up">
          <div className="hero-tag">🌿 100% Natural & Organic</div>
          <h1>
            India's Finest
            <br />
            <em>Everyday Essentials</em>
          </h1>
          <p>
            From Himalayan kitchens to your doorstep. Artisan products, pure ingredients, honest
            prices, and the full app now follows the same design language as `Replica.jsx`.
          </p>
          <Link className="hero-cta" to="/shop">
            Shop Now →
          </Link>
        </div>
        <div className="hero-emoji fade-up stagger-2">🛍️</div>
      </section>

      <div className="trust-bar">
        {[
          ["🚚", "Free Delivery ₹500+"],
          ["🌿", "100% Natural"],
          ["↩️", "7-Day Returns"],
          ["🔒", "Secure Checkout"],
          ["⭐", "50K+ Happy Customers"],
        ].map(([icon, text]) => (
          <div className="trust-item" key={text}>
            <span>{icon}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      <section className="section fade-up stagger-1">
        <div className="sec-head">
          <div>
            <div className="sec-label">Browse By</div>
            <h2>Categories</h2>
          </div>
        </div>
        <div className="hscroll">
          {categories.map((category) => (
            <Link
              key={category}
              className="cat-card"
              to={category === "All" ? "/shop" : `/shop?category=${encodeURIComponent(category)}`}
            >
              <div className="cat-emoji">{categoryEmoji[category]}</div>
              <div className="cat-name">{category}</div>
            </Link>
          ))}
        </div>
      </section>

      {deal ? (
        <div className="deal-section fade-up stagger-2">
          <div className="deal-card">
            <div style={{ flex: 1 }}>
              <div className="deal-label">⚡ Deal of the Day</div>
              <div className="deal-name">{deal.name}</div>
              <div className="deal-desc">{deal.description}</div>
              <div className="deal-price">
                <span className="now">₹{deal.price}</span>
                <span className="was">₹{deal.originalPrice}</span>
                <span className="off">
                  {Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)}% OFF
                </span>
              </div>
              <div className="deal-timer">
                {[
                  [timer.days, "Days"],
                  [timer.hours, "Hrs"],
                  [timer.minutes, "Min"],
                ].map(([value, label]) => (
                  <div key={label} className="timer-box">
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <Link className="hero-cta" to={`/products/${deal.slug}`}>
                Shop Deal →
              </Link>
            </div>
            <div className="deal-emoji">{deal.emoji || "🍯"}</div>
          </div>
        </div>
      ) : null}

      <div className="section fade-up stagger-3">
        <div className="sec-head">
          <div>
            <div className="sec-label">Highest Rated</div>
            <h2>Top Picks</h2>
          </div>
          <Link to="/shop">See all →</Link>
        </div>
        {loading ? <Spinner /> : <ProductGrid products={topProducts.length ? topProducts : featured} />}
      </div>

      <div className="promo-strip fade-up stagger-4">
        <div className="promo-card promo-dark">
          <div>
            <h3>Free Delivery</h3>
            <p>On orders above ₹500. No minimum on select items.</p>
          </div>
          <div className="pe">🚚</div>
        </div>
        <div className="promo-card promo-green">
          <div>
            <h3>100% Natural</h3>
            <p>All products verified. No harmful additives.</p>
          </div>
          <div className="pe">🌿</div>
        </div>
      </div>

      <div className="section fade-up">
        <div className="sec-head">
          <div>
            <div className="sec-label">Just In</div>
            <h2>New Arrivals</h2>
          </div>
          <Link to="/shop">See all →</Link>
        </div>
        {loading ? <Spinner /> : <ProductGrid products={newArrivals.length ? newArrivals : featured} />}
      </div>
    </section>
  );
}
