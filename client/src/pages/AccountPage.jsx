import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import { Input } from "../components/ui/Input";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { changePasswordRequest, sendVerificationRequest, deleteAccountRequest } from "../api/auth.api";

export function AccountPage() {
  const { user, logout, orders, updateProfile, notify } = useAppContext();
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useDocumentMetadata({
    title: "My Account Profile",
    description: "Manage your personal profile, addresses, delivery settings, and account information on GramBazaar."
  });

  // Edit profile states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [saving, setSaving] = useState(false);

  // Phase 2 States
  const [verifying, setVerifying] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) return;
    setChangingPassword(true);
    try {
      await changePasswordRequest(passwordForm);
      notify("Password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setShowPasswordForm(false);
    } catch (err) {
      notify(err.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSendVerification = async () => {
    setVerifying(true);
    try {
      await sendVerificationRequest();
      notify("Verification link sent to your email address!");
    } catch (err) {
      notify(err.message || "Failed to send verification email.");
    } finally {
      setVerifying(false);
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm("Are you sure you want to deactivate your account? This action is permanent and you will be logged out.")) {
      setDeactivating(true);
      try {
        await deleteAccountRequest();
        notify("Your account has been deactivated. Logging out...");
        setTimeout(() => {
          logout();
        }, 2000);
      } catch (err) {
        notify(err.message || "Failed to deactivate account.");
        setDeactivating(false);
      }
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

        {/* Verification Alert Banner */}
        {!user.isVerified && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl shrink-0">📧</span>
              <div className="text-left">
                <h4 className="text-sm font-bold text-amber-800">Verify your email address</h4>
                <p className="text-[11px] text-amber-700 mt-0.5">Please verify your email to unlock all features, reviews, and secure storefront listings.</p>
              </div>
            </div>
            <button
              onClick={handleSendVerification}
              disabled={verifying}
              className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-all border-0 cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {verifying ? "Sending..." : "Send Verification Link"}
            </button>
          </div>
        )}

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
              <button className="acct-link signout-link border-0 w-full text-left bg-transparent cursor-pointer" onClick={logout}>
                <span className="al-icon">🚪</span>Sign Out<span className="al-arrow">›</span>
              </button>

              {/* Password Change and Deactivation section */}
              <div className="border-t border-gray-200/50 mt-4 pt-4 space-y-4">
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="w-full text-left acct-link !border-0 bg-transparent flex items-center justify-between cursor-pointer py-1.5"
                >
                  <span className="flex items-center gap-2"><span className="al-icon">🔐</span> Change Password</span>
                  <span className="text-xs text-gray-400 font-bold">{showPasswordForm ? "Hide ▲" : "Show ▼"}</span>
                </button>
                {showPasswordForm && (
                  <form onSubmit={handlePasswordSubmit} className="bg-gray-50/50 border border-gray-150 rounded-2xl p-4 space-y-3 mt-2 text-left">
                    <Input
                      type="password"
                      label="Current Password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                    />
                    <Input
                      type="password"
                      label="New Password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                    />
                    <button
                      type="submit"
                      disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
                      className="w-full bg-[#c4622d] hover:bg-[#a95223] text-white font-bold py-2 rounded-xl text-xs shadow-sm cursor-pointer border-0 disabled:opacity-50 mt-2"
                    >
                      {changingPassword ? "Updating Password..." : "Change Password"}
                    </button>
                  </form>
                )}
                
                <button
                  onClick={handleDeactivate}
                  disabled={deactivating}
                  className="w-full text-left acct-link !border-0 bg-transparent flex items-center gap-2 cursor-pointer py-1.5 text-red-650 hover:text-red-750 font-bold"
                >
                  <span className="al-icon">🗑️</span> {deactivating ? "Deactivating..." : "Deactivate Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
