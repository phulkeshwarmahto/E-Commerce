import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../../hooks/useAppContext";

const footerLinks = {
  Shop: [
    { label: "Pantry", to: "/shop?category=Pantry" },
    { label: "Beverages", to: "/shop?category=Beverages" },
    { label: "Home", to: "/shop?category=Home" },
    { label: "Personal Care", to: "/shop?category=Personal+Care" },
    { label: "Health", to: "/shop?category=Health" },
  ],
  Help: [
    { label: "Shipping Policy", to: "/info/shipping-policy" },
    { label: "Easy Returns", to: "/info/easy-returns" },
    { label: "Track Order", to: "/orders" },
    { label: "Contact Us", to: "/contact" },
    { label: "FAQ", to: "/info/faq" },
  ],
  Company: [
    { label: "About Us", to: "/info/about-us" },
    { label: "Blog", to: "/info/blog" },
    { label: "Purity vs Aggregators", to: "/vs-competitors" },
    { label: "Careers", to: "/info/careers" },
    { label: "Press", to: "/info/press" },
    { label: "Sustainability", to: "/info/sustainability" },
  ],
};

const paymentMethods = ["VISA", "Mastercard", "UPI", "Razorpay", "Net Banking", "COD"];

const socialLinks = [
  { label: "Facebook", icon: "f", href: "https://facebook.com/GaramBazaar" },
  { label: "Instagram", icon: "in", href: "https://instagram.com/GaramBazaar" },
  { label: "Twitter/X", icon: "𝕏", href: "https://x.com/GaramBazaar" },
  { label: "YouTube", icon: "▶", href: "https://youtube.com/GaramBazaar" },
];

export function Footer() {
  const { notify } = useAppContext();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(
    localStorage.getItem("newsletter_subscribed") === "true"
  );

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      notify("Please enter a valid email address.");
      return;
    }
    localStorage.setItem("newsletter_subscribed", "true");
    setIsSubscribed(true);
    notify("Subscribed successfully! Thank you for staying in the loop.");
  };

  return (
    <>
      {/* ── Newsletter Strip ──────────────────────────────────────── */}
      {!isSubscribed && (
        <div className="bg-[#c4622d] py-8 px-4 md:px-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="text-center md:text-left flex-1">
              <p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-1">Stay in the loop</p>
              <h3 className="text-white text-xl md:text-2xl font-bold">Get exclusive deals & new arrivals</h3>
            </div>
            <form
              className="flex w-full md:w-auto min-w-0 md:min-w-[380px] rounded-lg overflow-hidden
                         shadow-lg border border-white/20"
              onSubmit={handleSubscribe}
            >
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 text-sm text-gray-800 bg-white outline-none min-w-0"
              />
              <button
                type="submit"
                className="bg-[#2c1a0e] hover:bg-black text-amber-400 font-bold
                           text-sm px-5 py-3 whitespace-nowrap transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Main Footer ──────────────────────────────────────────── */}
      <footer className="bg-[#131921] text-gray-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14
                        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber-400 text-2xl">🛒</span>
              <span className="text-white font-extrabold text-xl tracking-tight">
                Gram<span className="text-amber-400">Bazaar</span>
              </span>
            </div>
            <p className="text-gray-400 text-[0.82rem] leading-relaxed mb-5">
              Everyday essentials, thoughtfully sourced from artisans and local producers across India.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-amber-400 hover:text-gray-900
                             flex items-center justify-center text-xs font-bold text-white
                             transition-colors duration-150"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-gray-400 text-[0.82rem] hover:text-amber-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Payment Methods ──────────────────────────────────────── */}
        <div className="border-t border-white/10 px-4 md:px-8 py-5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center
                          justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-gray-500 text-[0.72rem] uppercase tracking-wider mr-1">Accepted payments:</span>
              {paymentMethods.map((pm) => (
                <span
                  key={pm}
                  className="px-2.5 py-1 rounded border border-white/15 bg-white/5
                             text-[0.68rem] font-semibold text-gray-300 whitespace-nowrap"
                >
                  {pm}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-[0.72rem] text-gray-500">
              <span>🔒 SSL Secured</span>
              <span>🛡️ Buyer Protected</span>
              <span>🌿 100% Natural</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Footer Bottom Bar ────────────────────────────────────── */}
      <div className="bg-[#0d1117] text-gray-500 text-[0.72rem] text-center py-3 px-4">
        © 2026 GaramBazaar Pvt. Ltd. · All rights reserved · Built with care in India 🇮🇳
      </div>
    </>
  );
}
