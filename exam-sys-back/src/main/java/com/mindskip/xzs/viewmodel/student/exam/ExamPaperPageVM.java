package com.mindskip.xzs.viewmodel.student.exam;

import com.mindskip.xzs.base.BasePage;

import java.util.List;

public class ExamPaperPageVM extends BasePage {
    private Integer paperType;
    private List<Integer> paperTypeArray;
    private Integer subjectId;
    private Integer userGroupId;

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
}
