import { useState } from "react";
import { promoConfig } from "../../constants/promoConfig";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function PromoCode({ subtotal, onApply }) {
  const [code, setCode] = useState("");

  const handleApply = () => {
    const normalized = code.trim().toUpperCase();
    const promo = promoConfig[normalized];

    if (!promo) {
      onApply({ code: "", discount: 0, message: "That code is not available." });
      return;
    }

    const discount = promo < 1 ? Math.round(subtotal * promo) : promo;
    onApply({ code: normalized, discount, message: `${normalized} applied.` });
  };

  return (
    <div className="promo-row">
      <Input placeholder="GRAM10" value={code} onChange={(event) => setCode(event.target.value)} />
      <Button variant="secondary" onClick={handleApply}>
        Apply
      </Button>
    </div>
  );
}
