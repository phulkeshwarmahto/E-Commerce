import { Link } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";

export function AccountPage() {
  const { user, logout, orders } = useAppContext();

  if (!user) {
    return (
      <section className="page-content">
        <div className="guest-account">
          <div className="guest-emoji">👤</div>
          <h2>Welcome to GramBazaar</h2>
          <p>Sign in to access your orders, wishlist, and account settings.</p>
          <Link className="hero-cta guest-btn" to="/auth">
            Sign In →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-content">
      <div className="account-page">
        <h2 className="account-title">👤 My Account</h2>
        <div className="account-grid">
          <div>
            <div className="profile-card">
              <div className="profile-avatar">
                {user.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="profile-name">{user.name}</div>
              <div className="profile-email">{user.email}</div>
              <div className="profile-badge">⭐ {user.membership}</div>
              <div className="account-stat-grid">
                <div className="account-stat">
                  <strong>{orders.orders.length}</strong>
                  <span>Orders</span>
                </div>
                <div className="account-stat">
                  <strong>{user.role}</strong>
                  <span>Access</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="account-links">
              <Link className="acct-link" to="/orders">
                <span className="al-icon">📦</span>My Orders<span className="al-arrow">›</span>
              </Link>
              <Link className="acct-link" to="/wishlist">
                <span className="al-icon">❤️</span>My Wishlist<span className="al-arrow">›</span>
              </Link>
              <Link className="acct-link" to="/checkout">
                <span className="al-icon">📍</span>Saved Addresses<span className="al-arrow">›</span>
              </Link>
              <button className="acct-link signout-link" onClick={logout}>
                <span className="al-icon">🚪</span>Sign Out<span className="al-arrow">›</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
