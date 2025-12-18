export const TOKEN_KEY = "token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const isLoggedIn = () => !!getToken();

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event("auth-change"));
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("auth-change"));
};
