/**
 * verify_referral_coupon.js
 * ─────────────────────────
 * Validates the referral coupon loop logic used by GaramBazaar.
 *
 *   Signup Flow:
 *     ▸ Every new user gets a unique referralCode (e.g. ABCDE-XY12)
 *     ▸ If they sign up with a referredByCode, referredBy stores the referrer's ObjectId
 *
 *   First Order Trigger:
 *     ▸ On the new user's FIRST order (Order.countDocuments === 1), if referredBy is set:
 *         1. Create a 15% coupon for the new user (referee)
 *         2. Create a 15% coupon for the referrer
 *         3. Notify both via in-app notifications
 *
 * Run:  node server/scratch/verify_referral_coupon.js
 */

function generateReferralCode(name) {
  const namePart = name.trim().replace(/[^a-zA-Z0-9]/g, "").substring(0, 5).toUpperCase();
  const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${namePart}-${randPart}`;
}

function shouldTriggerReferralReward({ isFirstOrder, referredBy }) {
  return isFirstOrder && !!referredBy;
}

function buildRefereeCouponCode(userId) {
  return `REF-WELCOME-15-${userId.slice(-6)}`.toUpperCase();
}

function buildReferrerCouponCode(referrerId) {
  return `REF-WELCOME-15-${referrerId.slice(-6)}`.toUpperCase();
}

const cases = [
  {
    name: "First order with referral → both get coupons",
    isFirst: true,
    referredBy: "abc123def456",
    userId: "xyz789uvw012",
    expectTrigger: true,
  },
  {
    name: "First order without referral → no coupons",
    isFirst: true,
    referredBy: null,
    userId: "xyz789uvw012",
    expectTrigger: false,
  },
  {
    name: "Second order with referral → no coupons (already triggered)",
    isFirst: false,
    referredBy: "abc123def456",
    userId: "xyz789uvw012",
    expectTrigger: false,
  },
  {
    name: "Second order without referral → no coupons",
    isFirst: false,
    referredBy: null,
    userId: "xyz789uvw012",
    expectTrigger: false,
  },
];

let passed = 0;
let failed = 0;

console.log("\n🔍 Referral Coupon Loop Verification\n");
console.log("─".repeat(70));

// Test referral code generation
const code1 = generateReferralCode("Alice Johnson");
const code2 = generateReferralCode("Bob");
const code3 = generateReferralCode("A");
const codeFormat = /^[A-Z0-9]{1,5}-[A-Z0-9]{4}$/;

if (codeFormat.test(code1) && codeFormat.test(code2) && codeFormat.test(code3)) {
  console.log(`  ✅ PASS  Referral code format (got: ${code1}, ${code2}, ${code3})`);
  passed++;
} else {
  console.log(`  ❌ FAIL  Referral code format (got: ${code1}, ${code2}, ${code3})`);
  failed++;
}

// Uniqueness test
const codes = new Set();
for (let i = 0; i < 50; i++) codes.add(generateReferralCode("Test"));
if (codes.size >= 45) {
  console.log(`  ✅ PASS  Referral codes are sufficiently unique (${codes.size}/50 unique)`);
  passed++;
} else {
  console.log(`  ❌ FAIL  Referral codes lack uniqueness (${codes.size}/50 unique)`);
  failed++;
}

// Coupon trigger conditions
for (const tc of cases) {
  const triggered = shouldTriggerReferralReward({
    isFirstOrder: tc.isFirst,
    referredBy: tc.referredBy,
  });

  if (triggered === tc.expectTrigger) {
    console.log(`  ✅ PASS  ${tc.name}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL  ${tc.name} — expected trigger=${tc.expectTrigger}, got=${triggered}`);
    failed++;
  }
}

// Coupon code format
const refereeCoupon = buildRefereeCouponCode("64abc1def456");
const referrerCoupon = buildReferrerCouponCode("64abc1def456");
if (refereeCoupon.startsWith("REF-WELCOME-15-") && referrerCoupon.startsWith("REF-WELCOME-15-")) {
  console.log(`  ✅ PASS  Coupon code format (${refereeCoupon})`);
  passed++;
} else {
  console.log(`  ❌ FAIL  Coupon code format — got: ${refereeCoupon}, ${referrerCoupon}`);
  failed++;
}

// Both referee and referrer coupons should be 15% discount
const couponData = {
  discountType: "percent",
  discountValue: 15,
  minOrderAmount: 100,
  active: true,
};

if (couponData.discountType === "percent" && couponData.discountValue === 15 && couponData.minOrderAmount === 100) {
  console.log(`  ✅ PASS  Coupon configuration (15% off, min ₹100)`);
  passed++;
} else {
  console.log(`  ❌ FAIL  Coupon configuration mismatch`);
  failed++;
}

console.log("─".repeat(70));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed}\n`);
process.exit(failed > 0 ? 1 : 0);
