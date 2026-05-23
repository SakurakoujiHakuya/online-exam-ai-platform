package com.mindskip.xzs.viewmodel.admin.task;

import com.mindskip.xzs.base.BasePage;



public class TaskPageRequestVM extends BasePage {
    private Integer userGroupId;

    public Integer getGradeLevel() {
        return userGroupId;
    }

    public void setGradeLevel(Integer gradeLevel) {
        this.userGroupId = gradeLevel;
    }

    public Integer getUserGroupId() {
        return userGroupId;
    }

    public void setUserGroupId(Integer userGroupId) {
        this.userGroupId = userGroupId;
    }
}
