package com.mindskip.xzs.viewmodel.collaboration;

import com.mindskip.xzs.base.BasePage;

public class SolutionReviewPageRequestVM extends BasePage {

    private Integer status;
    private Integer subjectId;

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Integer getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Integer subjectId) {
        this.subjectId = subjectId;
    }
}
