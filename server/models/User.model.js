export class UserModel {
  static findByEmail(users, email) {
    return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  }
}
