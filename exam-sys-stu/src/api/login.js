import { post } from "@/utils/request";

export default {
  login: (query) => post("/api/user/login", query),
  logout: () => post("/api/user/logout"),
  getCurrentUser: () => post("/api/user/current"),
};
