/** Local-storage helpers for JWT tokens. Keep keys in one place. */
const ACCESS = "homico.access";
const REFRESH = "homico.refresh";

export const getAccessToken = () => localStorage.getItem(ACCESS);
export const getRefreshToken = () => localStorage.getItem(REFRESH);

export const setTokens = ({ access, refresh }) => {
  if (access) localStorage.setItem(ACCESS, access);
  if (refresh) localStorage.setItem(REFRESH, refresh);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
};
