const AUTH_KEY = "GaramBazaar_auth";

export const getStoredSession = () => {
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const setStoredSession = (session) => {
  if (!session) {
    localStorage.removeItem(AUTH_KEY);
    return;
  }
  const { token, ...safeSession } = session;
  localStorage.setItem(AUTH_KEY, JSON.stringify(safeSession));
};

export const clearStoredSession = () => {
  localStorage.removeItem(AUTH_KEY);
};
