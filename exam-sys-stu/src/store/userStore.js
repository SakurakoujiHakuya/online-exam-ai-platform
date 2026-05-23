import { create } from "zustand";
import Cookies from "js-cookie";

const useUserStore = create((set) => ({
  userInfo: null,
  userName: Cookies.get("studentUserName") || "",
  token: Cookies.get("studentToken") || "",
  messageCount: 0,

  setUserInfo: (info) => set({ userInfo: info }),
  setUserName: (name) => {
    Cookies.set("studentUserName", name);
    set({ userName: name });
  },
  setToken: (token) => {
    Cookies.set("studentToken", token);
    set({ token: token });
  },
  setMessageCount: (count) => set({ messageCount: count }),
  logout: () => {
    Cookies.remove("studentUserName");
    Cookies.remove("studentToken");
    set({ userInfo: null, userName: "", token: "" });
  },
}));

export default useUserStore;
