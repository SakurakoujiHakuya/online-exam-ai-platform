package com.mindskip.xzs.viewmodel.student.question.answer;

import com.mindskip.xzs.base.BasePage;

public class QuestionPageStudentRequestVM extends BasePage {
    private Integer createUser;
    private Integer subjectId;
    private Integer userGroupId;
    private Integer questionType;
    private Integer questionCount;
    private java.util.List<Integer> tagIds;
    private Integer tagMatchMode;
    private String excludeTagName;

    public Integer getCreateUser() {
        return createUser;
    }

    public void setCreateUser(Integer createUser) {
        this.createUser = createUser;
    }

    public Integer getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Integer subjectId) {
        this.subjectId = subjectId;
    }

    public Integer getUserGroupId() {
        return userGroupId;
    }

    public void setUserGroupId(Integer userGroupId) {
        this.userGroupId = userGroupId;
    }

    public Integer getQuestionType() {
        return questionType;
    }

    public void setQuestionType(Integer questionType) {
        this.questionType = questionType;
    }

    public Integer getQuestionCount() {
        return questionCount;
    }

    public void setQuestionCount(Integer questionCount) {
        this.questionCount = questionCount;
    }

    public java.util.List<Integer> getTagIds() {
        return tagIds;
    }

    public void setTagIds(java.util.List<Integer> tagIds) {
        this.tagIds = tagIds;
    }

    public Integer getTagMatchMode() {
        return tagMatchMode;
    }

    public void setTagMatchMode(Integer tagMatchMode) {
        this.tagMatchMode = tagMatchMode;
    }

    public String getExcludeTagName() {
        return excludeTagName;
    }

    public void setExcludeTagName(String excludeTagName) {
        this.excludeTagName = excludeTagName;
    }
}
