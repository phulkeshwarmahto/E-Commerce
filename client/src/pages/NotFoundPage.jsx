import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="page-content success-card">
      <p className="eyebrow">404</p>
      <h1 className="page-title">That page wandered off.</h1>
      <Link className="button button-primary" to="/">
        Back home
      </Link>
    </section>
  );
}
