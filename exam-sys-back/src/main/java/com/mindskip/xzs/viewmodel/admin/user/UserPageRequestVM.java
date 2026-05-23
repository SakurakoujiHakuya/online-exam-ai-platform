package com.mindskip.xzs.viewmodel.admin.user;

import com.mindskip.xzs.base.BasePage;


public class UserPageRequestVM extends BasePage {

    private String userName;
    private Integer role;
    private Integer userGroupId;
    private Integer sex;
    private Boolean excellent;

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Integer getRole() {
        return role;
    }

    public void setRole(Integer role) {
        this.role = role;
    }

    public Integer getUserLevel() {
        return userGroupId;
    }

    public void setUserLevel(Integer userLevel) {
        this.userGroupId = userLevel;
    }

    public Integer getUserGroupId() {
        return userGroupId;
    }

    public void setUserGroupId(Integer userGroupId) {
        this.userGroupId = userGroupId;
    }

    public Integer getSex() {
        return sex;
    }

    public void setSex(Integer sex) {
        this.sex = sex;
    }

    public Boolean getExcellent() {
        return excellent;
    }

    public void setExcellent(Boolean excellent) {
        this.excellent = excellent;
    }
}
