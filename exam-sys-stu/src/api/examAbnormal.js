import { post } from "@/utils/request";

export default {
  report: (query) => post("/api/student/exam/abnormal/report", query),
};
