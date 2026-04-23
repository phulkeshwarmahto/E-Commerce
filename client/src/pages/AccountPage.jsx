import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useAppContext } from "../hooks/useAppContext";

export function AccountPage() {
  const { user, logout, orders } = useAppContext();

  if (!user) {
    return (
      <section className="page-content">
        <p>You are not signed in.</p>
        <Link className="button button-primary" to="/auth">
          Sign in
        </Link>
      </section>
    );
  }

  return (
    <section className="page-content account-layout">
      <article className="account-card">
        <p className="eyebrow">Member profile</p>
        <h1 className="page-title">{user.name}</h1>
        <p>{user.email}</p>
        <p>{user.membership} member</p>
        <Button variant="ghost" onClick={logout}>
          Sign out
        </Button>
      </article>
      <article className="summary-card">
        <h3>Quick view</h3>
        <div className="summary-row">
          <span>Total orders</span>
          <strong>{orders.orders.length}</strong>
        </div>
        <div className="summary-row">
          <span>Access level</span>
          <strong>{user.role}</strong>
        </div>
      </article>
    </section>
  );
}
