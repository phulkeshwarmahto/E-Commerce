export class CartModel {
  static get(carts, userId) {
    return carts[userId] || [];
  }
}
