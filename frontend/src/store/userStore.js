import { create } from "zustand";

const getInitial = (key) => localStorage.getItem(key) || "";

export const useUserStore = create((set) => ({
  username: getInitial("username"),
  role: getInitial("role"),
  token: getInitial("token"),
  setUser: ({ username, role, token }) => {
    localStorage.setItem("username", username);
    localStorage.setItem("role", role);
    localStorage.setItem("token", token);
    set({ username, role, token });
  },
  clearUser: () => {
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    set({ username: "", role: "", token: "" });
  },
}));
