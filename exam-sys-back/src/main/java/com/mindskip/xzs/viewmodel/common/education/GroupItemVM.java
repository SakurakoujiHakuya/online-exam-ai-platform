package com.mindskip.xzs.viewmodel.common.education;

public class GroupItemVM {

    private Integer userGroupId;

    private String userGroupName;

    public GroupItemVM() {
    }

    public GroupItemVM(Integer userGroupId, String userGroupName) {
        this.userGroupId = userGroupId;
        this.userGroupName = userGroupName;
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

    public String getLevelName() {
        return userGroupName;
    }

    public void setLevelName(String levelName) {
        this.userGroupName = levelName;
    }

    public String getUserGroupName() {
        return userGroupName;
    }

    public void setUserGroupName(String userGroupName) {
        this.userGroupName = userGroupName;
    }
}
