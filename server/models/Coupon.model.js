export class CouponModel {
  static find(coupons, code) {
    return coupons.find((coupon) => coupon.code === code.toUpperCase());
  }
}
