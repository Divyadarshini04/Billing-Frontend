export const tokenManager = {
  getToken: () => localStorage.getItem("authToken"),
  setToken: (token) => {
    localStorage.setItem("authToken", token);
  },
  removeToken: () => {
    localStorage.removeItem("authToken");
  }
};
