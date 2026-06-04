import { useState, useEffect } from "react";
import { promoConfig } from "../../constants/promoConfig";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { getCouponsRequest } from "../../api/coupon.api";

export function PromoCode({ subtotal, onApply }) {
  const [code, setCode] = useState("");
  const [dbCoupons, setDbCoupons] = useState([]);

  useEffect(() => {
    getCouponsRequest()
      .then((res) => {
        if (res && res.coupons) {
          setDbCoupons(res.coupons);
        }
      })
      .catch((err) => console.error("Error fetching coupons:", err));
  }, []);

  const handleApply = () => {
    const normalized = code.trim().toUpperCase();

    // Check local config
    const promo = promoConfig[normalized];
    if (promo) {
      const discount = promo < 1 ? Math.round(subtotal * promo) : promo;
      onApply({ code: normalized, discount, message: `${normalized} applied.` });
      return;
    }

    // Check DB coupons
    const dbCoupon = dbCoupons.find((c) => c.code === normalized && c.active);
    if (dbCoupon) {
      if (subtotal < dbCoupon.minOrderAmount) {
        onApply({
          code: "",
          discount: 0,
          message: `Minimum order amount of ₹${dbCoupon.minOrderAmount} required.`,
        });
        return;
      }
      if (dbCoupon.expiresAt && new Date(dbCoupon.expiresAt).getTime() < Date.now()) {
        onApply({ code: "", discount: 0, message: "Coupon code is expired." });
        return;
      }

      const discount =
        dbCoupon.discountType === "percent"
          ? Math.round((subtotal * dbCoupon.discountValue) / 100)
          : dbCoupon.discountValue;

      onApply({ code: normalized, discount, message: `${normalized} applied.` });
      return;
    }

    onApply({ code: "", discount: 0, message: "That code is not available." });
  };

  return (
    <div className="promo-row">
      <Input placeholder="Have a discount code?" value={code} onChange={(event) => setCode(event.target.value)} />
      <Button variant="secondary" onClick={handleApply}>
        Apply
      </Button>
    </div>
  );
}
