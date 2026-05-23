package com.mindskip.xzs.viewmodel.admin.education;

import com.mindskip.xzs.viewmodel.BaseVM;



public class SubjectResponseVM extends BaseVM {
    private Integer id;

    private String name;

    private Integer userGroupId;

    private String userGroupName;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
