/**
 * verify_quantity_discounts.js
 * ────────────────────────────
 * Validates the tiered quantity-discount logic used by GaramBazaar.
 *
 *   ▸ Product may have quantityDiscounts: [{ quantity, discountPercent }]
 *   ▸ The highest-tier discount whose threshold is met is applied
 *   ▸ Discount is applied per-unit
 *
 * Run:  node server/scratch/verify_quantity_discounts.js
 */

function applyQuantityDiscount(unitPrice, qty, quantityDiscounts) {
  let applicableDiscountPercent = 0;
  for (const qd of quantityDiscounts) {
    if (qty >= qd.quantity && qd.discountPercent > applicableDiscountPercent) {
      applicableDiscountPercent = qd.discountPercent;
    }
  }
  const discountedPrice = applicableDiscountPercent > 0
    ? Math.round(unitPrice * (1 - applicableDiscountPercent / 100))
    : unitPrice;
  return { discountedPrice, applicableDiscountPercent, lineTotal: discountedPrice * qty };
}

const sampleDiscounts = [
  { quantity: 3, discountPercent: 5 },
  { quantity: 10, discountPercent: 12 },
  { quantity: 25, discountPercent: 20 },
];

const cases = [
  { name: "Qty 1 → no discount",   price: 200, qty: 1,  expect: { pct: 0,  unit: 200, total: 200  } },
  { name: "Qty 2 → no discount",   price: 200, qty: 2,  expect: { pct: 0,  unit: 200, total: 400  } },
  { name: "Qty 3 → 5% off",        price: 200, qty: 3,  expect: { pct: 5,  unit: 190, total: 570  } },
  { name: "Qty 9 → still 5% off",  price: 200, qty: 9,  expect: { pct: 5,  unit: 190, total: 1710 } },
  { name: "Qty 10 → 12% off",      price: 200, qty: 10, expect: { pct: 12, unit: 176, total: 1760 } },
  { name: "Qty 24 → still 12% off",price: 200, qty: 24, expect: { pct: 12, unit: 176, total: 4224 } },
  { name: "Qty 25 → 20% off",      price: 200, qty: 25, expect: { pct: 20, unit: 160, total: 4000 } },
  { name: "Qty 100 → 20% off",     price: 200, qty: 100,expect: { pct: 20, unit: 160, total: 16000} },
  { name: "No tiers configured",    price: 500, qty: 10, expect: { pct: 0,  unit: 500, total: 5000 }, noTiers: true },
];

let passed = 0;
let failed = 0;

console.log("\n🔍 Quantity Discounts Verification\n");
console.log("─".repeat(70));

for (const tc of cases) {
  const tiers = tc.noTiers ? [] : sampleDiscounts;
  const result = applyQuantityDiscount(tc.price, tc.qty, tiers);

  const ok =
    result.applicableDiscountPercent === tc.expect.pct &&
    result.discountedPrice === tc.expect.unit &&
    result.lineTotal === tc.expect.total;

  if (ok) {
    console.log(`  ✅ PASS  ${tc.name}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL  ${tc.name}`);
    console.log(`          Expected pct=${tc.expect.pct}, unit=${tc.expect.unit}, total=${tc.expect.total}`);
    console.log(`          Got      pct=${result.applicableDiscountPercent}, unit=${result.discountedPrice}, total=${result.lineTotal}`);
    failed++;
  }
}

console.log("─".repeat(70));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${cases.length}\n`);
process.exit(failed > 0 ? 1 : 0);
