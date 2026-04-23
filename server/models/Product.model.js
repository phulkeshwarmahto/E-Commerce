export class ProductModel {
  static featured(products) {
    return products.filter((product) => product.isFeatured);
  }
}
