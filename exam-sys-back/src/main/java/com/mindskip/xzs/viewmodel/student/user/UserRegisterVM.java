package com.mindskip.xzs.viewmodel.student.user;


import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class UserRegisterVM {

    @NotBlank
    private String userName;

    @NotBlank
    private String realName;

    @NotBlank
    private String password;

    @NotNull
    private Integer userGroupId;

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getRealName() {
        return realName;
    }

    public void setRealName(String realName) {
        this.realName = realName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
}
