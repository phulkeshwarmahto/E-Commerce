import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { createPaymentOrderRequest, verifyPaymentRequest, verifyUpiPaymentRequest } from "../api/payment.api";
import { useAppContext } from "../hooks/useAppContext";
import { formatCurrency } from "../utils/formatCurrency";

const paymentOptions = [
  { id: "upi", icon: "📲", name: "UPI", desc: "PhonePe, GPay, Paytm" },
  { id: "card", icon: "💳", name: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay" },
  { id: "netbanking", icon: "🏦", name: "Net Banking", desc: "All major Indian banks" },
  { id: "cod", icon: "💵", name: "Cash on Delivery", desc: "Pay when you receive" },
];

const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, orders, isAuthenticated, notify, user } = useAppContext();
  const promo = location.state || { code: "", discount: 0 };
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiOrderId, setUpiOrderId] = useState("");
  const [upiTotal, setUpiTotal] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes

  useEffect(() => {
    if (!showUpiModal) return;
    if (timerSeconds <= 0) {
      setShowUpiModal(false);
      notify("Payment session expired. Please try placing your order again.");
      return;
    }
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [showUpiModal, timerSeconds]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleUpiSuccess = async (orderId) => {
    try {
      setPlacingOrder(true);
      await verifyUpiPaymentRequest(orderId);
      cart.clearCart();
      setShowUpiModal(false);
      notify(`UPI Payment successful for order ${orderId}.`);
      navigate(`/order-success/${orderId}`);
    } catch (error) {
      notify(error.message || "Failed to confirm UPI payment.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="page-content">
        <p>Please sign in before checkout.</p>
        <Button onClick={() => navigate("/auth")}>Go to sign in</Button>
      </section>
    );
  }

  if (user?.role === "seller") {
    return (
      <section className="page-content text-center py-20 min-h-screen">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
          <span className="text-5xl">🏪</span>
          <h2 className="text-2xl font-black text-gray-900 mt-4 mb-2">Merchant Checkout Restricted</h2>
          <p className="text-gray-500 text-sm mb-6">
            Sellers are restricted from placing orders on the store. Only viewing is enabled.
          </p>
          <button
            onClick={() => navigate("/seller")}
            className="w-full bg-[#c4622d] text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-md transition-all text-sm"
          >
            Go to Seller Dashboard
          </button>
        </div>
      </section>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPlacingOrder(true);

    try {
      const order = await orders.placeOrder({
        items: cart.items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: form,
        paymentMethod,
        couponCode: promo.code,
      });

      if (paymentMethod === "cod") {
        cart.clearCart();
        notify(`Order ${order.id} placed.`);
        navigate(`/order-success/${order.id}`);
        return;
      }

      if (paymentMethod === "upi") {
        setUpiOrderId(order.id);
        setUpiTotal(Math.max(cart.summary.subtotal - promo.discount, 0));
        setTimerSeconds(300);
        setShowUpiModal(true);
        return;
      }

      await loadRazorpayScript();
      const paymentOrder = await createPaymentOrderRequest(order.id);
      const checkout = new window.Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency || "INR",
        name: "GramBazaar",
        description: `Order ${order.id}`,
        order_id: paymentOrder.razorpayOrderId,
        prefill: {
          name: form.name,
          contact: form.phone,
        },
        handler: async (response) => {
          await verifyPaymentRequest({
            orderId: order.id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          cart.clearCart();
          notify(`Payment received for ${order.id}.`);
          navigate(`/order-success/${order.id}`);
        },
      });
      checkout.open();
    } catch (error) {
      notify(error.message || "Could not place order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <section className="page-content">
      <div className="checkout-layout">
        <div className="steps">
          {["Delivery Address", "Payment", "Review & Pay"].map((label, index) => (
            <div
              key={label}
              className={`step ${step === index + 1 ? "active" : step > index + 1 ? "done" : ""}`}
            >
              {label}
            </div>
          ))}
        </div>

        <form className="form-section" onSubmit={handleSubmit}>
          {step === 1 ? (
            <>
              <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3 flex-wrap gap-2">
                <h3 className="m-0 text-lg font-extrabold text-[#2c1a0e]">📍 Delivery Address</h3>
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      name: "Pkm Tester",
                      phone: "9876543210",
                      line1: "123 Bazaar Lane",
                      city: "Mumbai",
                      state: "Maharashtra",
                      pincode: "400001",
                    })
                  }
                  className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 shadow-sm border-0 cursor-pointer"
                >
                  🚀 Quick Fill Test Address
                </button>
              </div>
              <div className="form-row">
                <Input label="Full name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
                <Input label="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} required />
              </div>
              <div className="form-row full">
                <Input label="Address line" value={form.line1} onChange={(event) => setForm((current) => ({ ...current, line1: event.target.value }))} required />
              </div>
              <div className="form-row">
                <Input label="City" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} required />
                <Input label="State" value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} required />
              </div>
              <div className="form-row full">
                <Input label="Pincode" value={form.pincode} onChange={(event) => setForm((current) => ({ ...current, pincode: event.target.value }))} required />
              </div>
              <Button className="next-btn" type="button" onClick={() => setStep(2)}>
                Continue to Payment →
              </Button>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <h3>💳 Payment Method</h3>
              <div className="payment-options">
                {paymentOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`pay-option ${paymentMethod === option.id ? "selected" : ""}`}
                    onClick={() => setPaymentMethod(option.id)}
                    type="button"
                  >
                    <span className="pay-icon">{option.icon}</span>
                    <div>
                      <div className="pay-name">{option.name}</div>
                      <div className="pay-desc">{option.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="checkout-actions">
                <Button className="next-btn next-btn-secondary" type="button" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button className="next-btn" type="button" onClick={() => setStep(3)}>
                  Review Order →
                </Button>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <h3>📋 Review Your Order</h3>
              <div className="review-box">
                <strong>Delivering to:</strong>
                <p>
                  {form.name} · {form.phone}
                  <br />
                  {form.line1}, {form.city}, {form.state} — {form.pincode}
                </p>
              </div>
              <div className="review-box">
                <strong>Payment:</strong>
                <p>{paymentOptions.find((option) => option.id === paymentMethod)?.name}</p>
              </div>
              <div className="review-total">
                <span>Order Total</span>
                <strong>{formatCurrency(Math.max(cart.summary.subtotal - promo.discount, 0))}</strong>
              </div>
              <div className="checkout-actions">
                <Button className="next-btn next-btn-secondary" type="button" onClick={() => setStep(2)}>
                  ← Back
                </Button>
                <Button className="next-btn place-btn" type="submit" disabled={!cart.items.length || placingOrder}>
                  {placingOrder ? "Placing..." : "✅ Place Order"}
                </Button>
              </div>
            </>
          ) : null}
        </form>

        <aside className="mini-cart">
          <h4>Your Items ({cart.summary.itemCount})</h4>
          {cart.items.map((item) => (
            <div key={item.id} className="mini-item">
              <span className="me">{item.emoji || "📦"}</span>
              <span className="mn">
                {item.name} ×{item.quantity}
              </span>
              <span className="mp">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="mini-total">
            <span>Total</span>
            <span>{formatCurrency(Math.max(cart.summary.subtotal - promo.discount, 0))}</span>
          </div>
        </aside>
      </div>

      {showUpiModal && (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <style>{`
            @keyframes scan {
              0% { top: 0%; }
              50% { top: 100%; }
              100% { top: 0%; }
            }
            .scan-line {
              height: 2px;
              background: #f59e0b;
              box-shadow: 0 0 8px #f59e0b;
              animation: scan 4s linear infinite;
            }
          `}</style>
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-amber-100 overflow-hidden transform scale-100 transition-all duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-[#c4622d] text-white py-5 px-6 text-center">
              <span className="text-4xl">📲</span>
              <h3 className="text-lg font-black mt-2 mb-1 text-white">UPI QR Code Payment</h3>
              <p className="text-white/80 text-[0.65rem] font-semibold uppercase tracking-wider">GramBazaar Payment Gateway</p>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col items-center">
              {/* Timer & Amount */}
              <div className="flex justify-between items-center w-full bg-amber-50 rounded-xl px-4 py-3 border border-amber-100 mb-5">
                <div className="text-left">
                  <div className="text-[0.65rem] text-gray-500 font-bold uppercase tracking-wider">Amount to Pay</div>
                  <div className="text-base font-black text-gray-800">{formatCurrency(upiTotal)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[0.65rem] text-gray-500 font-bold uppercase tracking-wider">Time Remaining</div>
                  <div className={`text-sm font-bold ${timerSeconds < 60 ? "text-red-500" : "text-amber-600"}`}>
                    ⏱️ {formatTimer(timerSeconds)}
                  </div>
                </div>
              </div>

              {/* Dynamic QR Code Wrapper */}
              <div className="relative w-48 h-48 border-4 border-amber-400/30 rounded-2xl p-2 bg-white flex items-center justify-center shadow-inner overflow-hidden mb-5 group">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `upi://pay?pa=grambazaar@ybl&pn=GramBazaar&am=${upiTotal}&cu=INR&tn=Order_${upiOrderId}`
                  )}`}
                  alt="Scan to Pay via UPI"
                  className="w-full h-full object-contain rounded-lg"
                />
                {/* Animate Scan Line */}
                <div className="absolute left-0 right-0 scan-line" style={{ position: "absolute" }} />
              </div>

              <p className="text-center text-[0.72rem] text-gray-500 leading-relaxed mb-5">
                Scan the QR code above using GPay, PhonePe, Paytm, or any BHIM UPI app to pay.
              </p>

              {/* UPI ID Info with Copy */}
              <div className="w-full border border-gray-200 rounded-xl p-3 flex items-center justify-between bg-gray-50 text-xs mb-5">
                <div className="text-left">
                  <span className="text-[0.6rem] text-gray-400 font-bold uppercase block">Merchant UPI ID</span>
                  <strong className="text-gray-700 font-semibold">grambazaar@ybl</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("grambazaar@ybl");
                    notify("UPI ID copied to clipboard!");
                  }}
                  className="text-[0.7rem] bg-amber-400 hover:bg-amber-500 font-bold px-2.5 py-1 rounded-md text-gray-900 transition-colors shadow-sm border-0 cursor-pointer"
                >
                  📋 Copy
                </button>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-2">
                <button
                  type="button"
                  onClick={() => handleUpiSuccess(upiOrderId)}
                  disabled={placingOrder}
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3 px-5 rounded-xl hover:shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer border-0 shadow-sm"
                >
                  {placingOrder ? (
                    "Processing..."
                  ) : (
                    <>
                      <span>✅</span>
                      <span>Simulate Successful Payment Scan</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpiModal(false)}
                  disabled={placingOrder}
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-600 font-bold py-2.5 px-5 rounded-xl transition-all text-xs cursor-pointer bg-transparent"
                >
                  ❌ Cancel Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
