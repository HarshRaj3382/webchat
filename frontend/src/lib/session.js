export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const redirectToLogin = () => {
  clearSession();

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};
