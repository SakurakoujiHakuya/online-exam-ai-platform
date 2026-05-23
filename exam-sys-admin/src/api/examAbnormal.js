import { post } from "@/utils/request";

export default {
  pageList: (query) => post("/api/admin/exam/abnormal/page/list", query),
};
