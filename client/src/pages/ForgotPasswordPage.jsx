import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPasswordRequest } from "../api/auth.api";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useDocumentMetadata({
    title: "Forgot Password - GramBazaar",
    description: "Request a password reset link for your GramBazaar account."
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await forgotPasswordRequest({ email });
      setMessage(res.message || "A password reset link has been sent if the email exists.");
    } catch (err) {
      setError(err?.message || "Failed to send reset link. Please try again.");
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
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-white/60">
          Enter your email and we'll send you a password reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                ✅ {message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-white text-sm bg-[#c4622d] hover:bg-[#a35225] transition-all duration-150 shadow-sm ${loading ? "opacity-60 cursor-wait" : "hover:-translate-y-0.5 hover:shadow-md"}`}
              >
                {loading ? "Sending..." : "Send Reset Link →"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/auth")}
              className="text-sm font-semibold text-gray-500 hover:text-[#c4622d] transition-colors"
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
