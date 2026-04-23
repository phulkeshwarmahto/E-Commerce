export class OrderModel {
  static byUser(orders, userId) {
    return orders.filter((order) => order.userId === userId);
  }
}
