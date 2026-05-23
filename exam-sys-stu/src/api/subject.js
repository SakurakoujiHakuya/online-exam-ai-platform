import { post } from "@/utils/request";

export default {
  list: () => post("/api/student/education/subject/list"),
  select: (id) => post("/api/student/education/subject/select/" + id),
};
