/**
 * verify_loyalty_points.js
 * ────────────────────────
 * Validates the loyalty-points logic used by GaramBazaar.
 *
 *   ▸ Points earning : 1 pt per ₹100 spent (floor)
 *   ▸ Tier thresholds: Silver (0–500), Gold (501–1500), Platinum (1501+)
 *   ▸ Checkout discount: Silver → 0%, Gold → 5%, Platinum → 10%
 *
 * Run:  node server/scratch/verify_loyalty_points.js
 */

function calcPointsEarned(orderTotal) {
  return Math.floor(orderTotal / 100);
}

function calcTier(loyaltyPoints) {
  if (loyaltyPoints > 1500) return "Platinum";
  if (loyaltyPoints > 500) return "Gold";
  return "Silver";
}

function calcCheckoutDiscount(loyaltyPoints, subtotal) {
  let pct = 0;
  if (loyaltyPoints > 1500) pct = 10;
  else if (loyaltyPoints > 500) pct = 5;
  return Math.round((subtotal * pct) / 100);
}

const cases = [
  { name: "New user – zero points",       pts: 0,    subtotal: 1000, expectTier: "Silver",   expectDiscount: 0   },
  { name: "Edge – exactly 500 pts",       pts: 500,  subtotal: 1000, expectTier: "Silver",   expectDiscount: 0   },
  { name: "Gold threshold – 501 pts",     pts: 501,  subtotal: 1000, expectTier: "Gold",     expectDiscount: 50  },
  { name: "Gold upper – 1500 pts",        pts: 1500, subtotal: 1000, expectTier: "Gold",     expectDiscount: 50  },
  { name: "Platinum threshold – 1501 pts",pts: 1501, subtotal: 1000, expectTier: "Platinum", expectDiscount: 100 },
  { name: "Platinum – 3000 pts",          pts: 3000, subtotal: 2500, expectTier: "Platinum", expectDiscount: 250 },
  { name: "Points earned from ₹1350",     pts: 0,    subtotal: 1350, expectTier: "Silver",   expectDiscount: 0,  expectPointsEarned: 13 },
  { name: "Points earned from ₹99",       pts: 0,    subtotal: 99,   expectTier: "Silver",   expectDiscount: 0,  expectPointsEarned: 0  },
];

let passed = 0;
let failed = 0;

console.log("\n🔍 Loyalty Points Verification\n");
console.log("─".repeat(70));

for (const tc of cases) {
  const tier = calcTier(tc.pts);
  const discount = calcCheckoutDiscount(tc.pts, tc.subtotal);
  const earnedCheck = tc.expectPointsEarned !== undefined;

  let ok = tier === tc.expectTier && discount === tc.expectDiscount;
  if (earnedCheck) {
    const earned = calcPointsEarned(tc.subtotal);
    ok = ok && earned === tc.expectPointsEarned;
  }

  if (ok) {
    console.log(`  ✅ PASS  ${tc.name}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL  ${tc.name}`);
    console.log(`          Expected tier=${tc.expectTier}, got=${tier}`);
    console.log(`          Expected discount=${tc.expectDiscount}, got=${discount}`);
    if (earnedCheck) {
      console.log(`          Expected pointsEarned=${tc.expectPointsEarned}, got=${calcPointsEarned(tc.subtotal)}`);
    }
    failed++;
  }
}

console.log("─".repeat(70));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${cases.length}\n`);
process.exit(failed > 0 ? 1 : 0);
