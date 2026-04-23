import { Link } from "react-router-dom";
import { ProductGrid } from "../components/product/ProductGrid";
import { Spinner } from "../components/ui/Spinner";
import { categories } from "../constants/categories";
import { useProducts } from "../hooks/useProducts";
import { useTimer } from "../hooks/useTimer";

export function HomePage() {
  const { featured, loading } = useProducts({ featured: true });
  const timer = useTimer();

  return (
    <section className="page-content">
      <section className="hero">
        <div>
          <p className="eyebrow">India's organic marketplace</p>
          <h1>Small-batch essentials for a calmer, cleaner everyday routine.</h1>
          <p className="hero-copy">
            The old single-file storefront is now a full-stack app with API-backed products,
            orders, reviews, and admin management.
          </p>
          <Link className="hero-link" to="/shop">
            Start shopping
          </Link>
        </div>
        <div className="hero-panel">
          <span>Deal of the Day</span>
          <strong>{timer.days}d {timer.hours}h {timer.minutes}m</strong>
          <p>Wild honey, Darjeeling tea, and pantry bundles are moving fast this week.</p>
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <h2>Browse by category</h2>
        </div>
        <div className="category-strip">
          {categories.filter((category) => category !== "All").map((category) => (
            <Link key={category} className="category-chip" to={`/shop?category=${encodeURIComponent(category)}`}>
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <h2>Featured products</h2>
          <Link to="/shop">View all</Link>
        </div>
        {loading ? <Spinner /> : <ProductGrid products={featured} />}
      </section>
    </section>
  );
}
