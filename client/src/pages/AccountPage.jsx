import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import { Input } from "../components/ui/Input";

export function AccountPage() {
  const { user, logout, orders, updateProfile, notify } = useAppContext();
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Edit profile states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [saving, setSaving] = useState(false);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;
    setSaving(true);
    try {
      await updateProfile({
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
      });
      notify("Profile updated successfully.");
      setIsEditing(false);
    } catch (err) {
      notify(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

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
          <div className={`mobile-collapsible ${profileOpen ? "is-open" : ""}`}>
            <button
              aria-expanded={profileOpen}
              className="mobile-toggle"
              onClick={() => setProfileOpen((current) => !current)}
              type="button"
            >
              <span>Account Details</span>
              <span>{profileOpen ? "Hide" : "Show"}</span>
            </button>
            <div className="profile-card mobile-collapsible-content">
              <div className="profile-avatar">
                {user.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="flex flex-col gap-3.5 mt-2">
                  <Input
                    label="Full Name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                  <div className="flex flex-col gap-1">
                    <Input
                      label="Phone Number"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                    />
                    <span className="text-[10px] text-gray-400 italic block mt-0.5 leading-tight">
                      Optional here, but mandatory at checkout.
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={saving || !editForm.name.trim()}
                      className="flex-1 bg-[#c4622d] text-white text-xs font-bold py-2 rounded-xl border-0 hover:bg-[#a95223] transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditForm({ name: user.name, phone: user.phone || "" });
                        setIsEditing(false);
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 text-xs font-bold py-2 rounded-xl border border-gray-200 hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="profile-name">{user.name}</div>
                  <div className="profile-email">{user.email}</div>
                  {user.phone && <div className="text-xs text-gray-600 font-semibold mb-3">📞 {user.phone}</div>}
                  <div className="profile-badge">⭐ {user.membership}</div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full mt-1 bg-amber-400 hover:bg-amber-500 text-gray-900 text-xs font-bold py-2 px-4 rounded-xl transition-all duration-150 cursor-pointer border-0 shadow-sm"
                  >
                    ✏️ Edit Profile
                  </button>
                </>
              )}
              <div className="account-stat-grid mt-4">
                {user?.role !== "seller" && (
                  <div className="account-stat">
                    <strong>{orders.orders.length}</strong>
                    <span>Orders</span>
                  </div>
                )}
                <div className="account-stat">
                  <strong>{user.role}</strong>
                  <span>Access</span>
                </div>
              </div>
            </div>
          </div>
          <div className={`mobile-collapsible ${settingsOpen ? "is-open" : ""}`}>
            <button
              aria-expanded={settingsOpen}
              className="mobile-toggle"
              onClick={() => setSettingsOpen((current) => !current)}
              type="button"
            >
              <span>User Settings</span>
              <span>{settingsOpen ? "Hide" : "Show"}</span>
            </button>
            <div className="account-links mobile-collapsible-content">
              {user?.role !== "seller" && (
                <Link className="acct-link" to="/orders">
                  <span className="al-icon">📦</span>My Orders<span className="al-arrow">›</span>
                </Link>
              )}
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
