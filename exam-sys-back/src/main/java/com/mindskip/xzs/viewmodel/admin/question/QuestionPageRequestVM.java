package com.mindskip.xzs.viewmodel.admin.question;

import com.mindskip.xzs.base.BasePage;



public class QuestionPageRequestVM extends BasePage {

    private Integer id;
    private Integer userGroupId;
    private Integer subjectId;
    private Integer questionType;
    private String content;


    private Integer questionSource;

    private java.util.List<Integer> tagIds;

    private Integer tagMatchMode;

    private Integer hideInPracticeCenter;

    private String practiceHiddenTagName;

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

    public Integer getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Integer subjectId) {
        this.subjectId = subjectId;
    }

    public Integer getQuestionType() {
        return questionType;
    }

    public void setQuestionType(Integer questionType) {
        this.questionType = questionType;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getQuestionSource() {
        return questionSource;
    }

    public void setQuestionSource(Integer questionSource) {
        this.questionSource = questionSource;
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

    public Integer getHideInPracticeCenter() {
        return hideInPracticeCenter;
    }

    public void setHideInPracticeCenter(Integer hideInPracticeCenter) {
        this.hideInPracticeCenter = hideInPracticeCenter;
    }

    public String getPracticeHiddenTagName() {
        return practiceHiddenTagName;
    }

    public void setPracticeHiddenTagName(String practiceHiddenTagName) {
        this.practiceHiddenTagName = practiceHiddenTagName;
    }
}
