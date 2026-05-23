package com.mindskip.xzs.viewmodel.admin.exam;

import com.mindskip.xzs.base.BasePage;

import java.util.List;

public class ExamPaperPageRequestVM extends BasePage {

    private Integer id;
    private Integer subjectId;
    private Integer userGroupId;
    private Integer paperType;
    private List<Integer> paperTypeArray;
    private Integer taskExamId;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Integer subjectId) {
        this.subjectId = subjectId;
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

    public Integer getPaperType() {
        return paperType;
    }

    public void setPaperType(Integer paperType) {
        this.paperType = paperType;
    }

    public List<Integer> getPaperTypeArray() {
        return paperTypeArray;
    }

    public void setPaperTypeArray(List<Integer> paperTypeArray) {
        this.paperTypeArray = paperTypeArray;
    }

    public Integer getTaskExamId() {
        return taskExamId;
    }

    public void setTaskExamId(Integer taskExamId) {
        this.taskExamId = taskExamId;
    }
}
