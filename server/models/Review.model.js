export class ReviewModel {
  static byProduct(reviews, productId) {
    return reviews.filter((review) => review.productId === productId);
  }
}
