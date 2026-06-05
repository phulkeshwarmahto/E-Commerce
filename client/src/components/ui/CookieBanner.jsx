import { useEffect, useState } from "react";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("grambazaar_cookies_accepted");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("grambazaar_cookies_accepted", "accepted");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("grambazaar_cookies_accepted", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-white/95 backdrop-blur-md border border-gray-150 rounded-2xl p-5 shadow-2xl z-50 flex flex-col gap-4 animate-slide-up">
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5 select-none">🍪</span>
        <div className="space-y-1">
          <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Cookie Policy Acceptance</h4>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            GramBazaar uses essential session cookies to save items in your shopping cart and keep you logged in. By accepting, you consent to our privacy guidelines.
          </p>
        </div>
      </div>
      <div className="flex gap-2.5 justify-end">
        <button
          type="button"
          onClick={handleDecline}
          className="px-3.5 py-2 border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl text-[10px] font-bold transition-all cursor-pointer bg-white"
        >
          Decline Optional
        </button>
        <button
          type="button"
          onClick={handleAccept}
          className="px-3.5 py-2 bg-[#c4622d] hover:bg-[#e07a4a] text-white rounded-xl text-[10px] font-extrabold transition-all cursor-pointer border-0 shadow-md"
        >
          Accept cookies
        </button>
      </div>
    </div>
  );
}
