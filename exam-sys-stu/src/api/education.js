import { post } from "@/utils/request";

export default {
  getGroupList: () => post("/api/common/education/group/list"),
};
