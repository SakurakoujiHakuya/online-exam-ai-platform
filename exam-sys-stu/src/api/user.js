import { post } from "@/utils/request";

export default {
  getUserEvent: () => post("/api/student/user/log"),
  getCurrentUser: () => post("/api/student/user/current"),
  update: (data) => post("/api/student/user/update", data),
  messagePageList: (data) => post("/api/student/user/message/page", data),
  unReadCount: () => post("/api/student/user/message/unreadCount"),
  read: (id) => post("/api/student/user/message/read/" + id),
};
