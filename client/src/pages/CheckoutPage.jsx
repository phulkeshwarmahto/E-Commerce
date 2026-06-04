import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
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
  const [simulatingOrder, setSimulatingOrder] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      notify("Geolocation is not supported by your browser.");
      return;
    }

    setLocatingUser(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await response.json();

          if (data?.address) {
            const addr = data.address;
            setForm((prev) => ({
              ...prev,
              line1:
                [addr.road, addr.neighbourhood, addr.suburb]
                  .filter(Boolean)
                  .join(", ") || prev.line1,
              city:
                addr.city ||
                addr.town ||
                addr.village ||
                addr.county ||
                prev.city,
              state: addr.state || prev.state,
              pincode: addr.postcode || prev.pincode,
            }));
            notify("📍 Location detected! Please verify and fill remaining fields.");
          } else {
            notify("Could not determine address from your location.");
          }
        } catch {
          notify("Failed to fetch address from your location.");
        } finally {
          setLocatingUser(false);
        }
      },
      (error) => {
        setLocatingUser(false);
        if (error.code === error.PERMISSION_DENIED) {
          notify("Location access denied. Please allow location in your browser settings.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          notify("Location unavailable. Please try again.");
        } else {
          notify("Location request timed out. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const shippingFee = cart.items.reduce((sum, item) => sum + (item.deliveryFee || 0) * item.quantity, 0);
  const orderTotal = Math.max(cart.summary.subtotal + shippingFee - promo.discount, 0);

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

      try {
        await loadRazorpayScript();
        const paymentOrder = await createPaymentOrderRequest(order.id);
        const razorpayOptions = {
          key: paymentOrder.keyId,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency || "INR",
          name: "GramBazaar",
          description: `Order ${order.id}`,
          order_id: paymentOrder.razorpayOrderId,
          prefill: {
            name: form.name,
            contact: form.phone,
            method: paymentMethod === "upi" ? "upi" : undefined,
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
        };

        if (paymentMethod === "upi") {
          razorpayOptions.config = {
            display: {
              blocks: {
                upiBlock: {
                  name: "Pay via UPI",
                  instruments: [
                    {
                      method: "upi",
                    },
                  ],
                },
              },
              sequence: ["block.upiBlock"],
              preferences: {
                show_default_blocks: false,
              },
            },
          };
        }

        const checkout = new window.Razorpay(razorpayOptions);
        checkout.open();
      } catch (payError) {
        console.warn("Razorpay initialisation failed, falling back to simulator:", payError);
        notify("Razorpay Gateway unavailable. Launching interactive Payment Simulator...");
        setSimulatingOrder(order);
      }
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
                  onClick={handleUseMyLocation}
                  disabled={locatingUser}
                  className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 shadow-sm border-0 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                >
                  {locatingUser ? (
                    <>
                      <span className="inline-block w-3 h-3 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></span>
                      Detecting...
                    </>
                  ) : (
                    "📍 Use My Location"
                  )}
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

              <div className="space-y-1.5 border-b border-gray-100 pb-3 mb-3 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cart.summary.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className={shippingFee === 0 ? "text-emerald-600 font-semibold" : ""}>
                    {shippingFee === 0 ? "FREE 🎉" : formatCurrency(shippingFee)}
                  </span>
                </div>
                {promo.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({promo.code})</span>
                    <span>−{formatCurrency(promo.discount)}</span>
                  </div>
                )}
              </div>

              <div className="review-total flex justify-between items-baseline pt-2">
                <span>Order Total</span>
                <strong className="text-[#c4622d] text-lg font-black">{formatCurrency(orderTotal)}</strong>
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
            <span className="font-bold">{formatCurrency(orderTotal)}</span>
          </div>
        </aside>
      </div>

      {simulatingOrder && (
        <Modal title="Interactive Payment Simulator (Sandbox Mode)" onClose={() => setSimulatingOrder(null)}>
          <div className="flex flex-col gap-5 text-center py-2 max-w-sm mx-auto">
            <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl p-3 text-left">
              <div>
                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Gateway Sandbox Mode</p>
                <p className="text-xs text-amber-800 font-semibold mt-0.5 leading-relaxed">
                  Razorpay is currently unconfigured. Use this simulator to safely test and complete payment.
                </p>
              </div>
              <span className="text-2xl">⚡</span>
            </div>

            <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 flex flex-col items-center gap-3">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Amount Due</span>
              <span className="text-2xl font-black text-gray-900">{formatCurrency(orderTotal)}</span>
              <span className="text-[11px] font-semibold text-gray-500 bg-gray-200/50 px-2.5 py-1 rounded">
                Order Reference: {simulatingOrder.orderNumber}
              </span>
            </div>

            {paymentMethod === "upi" && (
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="relative w-36 h-36 bg-white border-2 border-[#c4622d] rounded-2xl flex items-center justify-center shadow-md p-2 overflow-hidden">
                  {/* Mock QR Representation */}
                  <div className="w-full h-full bg-slate-100 rounded-lg flex flex-col items-center justify-center gap-1 border border-dashed border-gray-300">
                    <span className="text-3xl">📲</span>
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Scan & Pay</span>
                  </div>
                  {/* Laser Scan line animation */}
                  <div className="absolute left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_8px_red] top-0 animate-[bounce_2s_infinite]" />
                </div>

                <div className="flex justify-between items-center w-full max-w-xs border border-gray-100 bg-gray-50/50 rounded-xl p-2.5 text-xs text-left">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">UPI VPA</span>
                    <span className="font-semibold text-gray-800 font-mono">pay@grambazaar</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("pay@grambazaar");
                      notify("UPI Address copied to clipboard!");
                    }}
                    className="text-[#c4622d] font-bold hover:underline"
                  >
                    Copy
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Session expires in:</span>
                  <SimulatorTimer onTimeout={() => setSimulatingOrder(null)} />
                </div>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="flex flex-col gap-3 py-2 text-left">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Simulated Card Details</p>
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-2xl p-4 shadow-md font-mono flex flex-col justify-between h-36">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold tracking-widest">GramBazaar Card</span>
                    <span className="text-xl">💳</span>
                  </div>
                  <div className="text-base tracking-widest my-2">4111 •••• •••• 1111</div>
                  <div className="flex justify-between text-[10px]">
                    <div>
                      <span className="block text-gray-400 text-[8px] uppercase">Cardholder</span>
                      <span>{form.name || "Pkm Tester"}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400 text-[8px] uppercase">Expires</span>
                      <span>12/30</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "netbanking" && (
              <div className="flex flex-col gap-3 py-2 text-left">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Simulated Net Banking Banks</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank"].map((bank) => (
                    <div key={bank} className="border border-gray-200 rounded-xl p-2.5 text-center font-semibold bg-gray-50 hover:bg-gray-100 transition-colors">
                      🏦 {bank}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <Button type="button" className="w-full py-2.5 font-bold" onClick={handleSimulatePayment}>
                🚀 Simulate Successful Payment
              </Button>
              <button
                type="button"
                className="text-xs text-gray-500 hover:text-gray-700 font-bold py-1 hover:underline transition-colors"
                onClick={() => setSimulatingOrder(null)}
              >
                Cancel and Return
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

function SimulatorTimer({ onTimeout }) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeout]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <span className="font-mono bg-red-50 text-red-600 px-2.5 py-1 rounded text-xs font-bold border border-red-200">
      ⏱️ {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </span>
  );
}
