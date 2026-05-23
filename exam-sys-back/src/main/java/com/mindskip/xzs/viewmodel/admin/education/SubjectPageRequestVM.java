package com.mindskip.xzs.viewmodel.admin.education;

import com.mindskip.xzs.base.BasePage;



public class SubjectPageRequestVM extends BasePage {
    private Integer id;
    private Integer userGroupId;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getLevel() {
        return userGroupId;
    }

    public void setLevel(Integer level) {
        this.userGroupId = level;
    }

    public Integer getUserGroupId() {
        return userGroupId;
    }

    public void setUserGroupId(Integer userGroupId) {
        this.userGroupId = userGroupId;
    }
}
