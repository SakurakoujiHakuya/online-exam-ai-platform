package com.mindskip.xzs.viewmodel.collaboration;

import com.mindskip.xzs.base.BasePage;

public class FeedbackReviewPageRequestVM extends BasePage {

    private Integer status;
    private String feedbackType;
    private Integer subjectId;

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getFeedbackType() {
        return feedbackType;
    }

    public void setFeedbackType(String feedbackType) {
        this.feedbackType = feedbackType;
    }

    public Integer getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Integer subjectId) {
        this.subjectId = subjectId;
    }
}
