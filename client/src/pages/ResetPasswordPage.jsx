import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPasswordRequest } from "../api/auth.api";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useDocumentMetadata({
    title: "Reset Password - GramBazaar",
    description: "Choose a new password for your GramBazaar account."
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Reset token is missing from the URL.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPasswordRequest({ token, password });
      setMessage(res.message || "Your password has been reset successfully.");
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    } catch (err) {
      setError(err?.message || "Failed to reset password. Token may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2c1a0e] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(44, 26, 14, 0.9), rgba(44, 26, 14, 0.95))" }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 mb-4">
          <span className="text-3xl">🛒</span>
          <span className="text-white font-extrabold text-2xl tracking-tight">
            Gram<span className="text-amber-400">Bazaar</span>
          </span>
        </button>
        <h2 className="text-center text-3xl font-extrabold text-white">
          Create New Password
        </h2>
        <p className="mt-2 text-center text-sm text-white/60">
          Please enter and confirm your new account password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-gray-100">
          {!token ? (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
              ❌ Invalid reset link. The reset token is missing. Please request a new link.
              <button
                onClick={() => navigate("/forgot-password")}
                className="block mx-auto mt-4 text-[#c4622d] font-bold hover:underline"
              >
                Go to Forgot Password Page
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c4622d] focus:ring-2 focus:ring-[#c4622d]/20 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm font-medium transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c4622d] focus:ring-2 focus:ring-[#c4622d]/20 transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                  ❌ {error}
                </div>
              )}

              {message && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
                  ✅ {message} Redirecting to login...
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading || !!message}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-white text-sm bg-[#c4622d] hover:bg-[#a35225] transition-all duration-150 shadow-sm ${loading || message ? "opacity-60 cursor-wait" : "hover:-translate-y-0.5 hover:shadow-md"}`}
                >
                  {loading ? "Resetting..." : "Save New Password →"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
