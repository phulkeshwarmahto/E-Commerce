export const generateToken = (user) => {
  const payload = JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return Buffer.from(payload).toString("base64url");
};

export const parseToken = (token) => {
  try {
    return JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
  } catch {
    return null;
  }
};
