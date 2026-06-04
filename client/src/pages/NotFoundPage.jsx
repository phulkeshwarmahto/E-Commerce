import { Link } from "react-router-dom";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";

export function NotFoundPage() {
  useDocumentMetadata({
    title: "Page Not Found",
    description: "The page you are looking for does not exist on GramBazaar.",
    noindex: true
  });

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
