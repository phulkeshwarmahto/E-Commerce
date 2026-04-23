export const registerValidator = [
  (req) => (!req.body.name ? "Name is required." : null),
  (req) => (!req.body.email ? "Email is required." : null),
  (req) => (!req.body.password ? "Password is required." : null),
];

export const loginValidator = [
  (req) => (!req.body.email ? "Email is required." : null),
  (req) => (!req.body.password ? "Password is required." : null),
];
