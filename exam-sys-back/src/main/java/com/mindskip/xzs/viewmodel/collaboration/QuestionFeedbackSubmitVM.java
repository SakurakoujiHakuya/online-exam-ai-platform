package com.mindskip.xzs.viewmodel.collaboration;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class QuestionFeedbackSubmitVM {

    @NotNull
    private Integer questionId;

    @NotBlank
    private String feedbackType;

    @NotBlank
    private String feedbackContent;

    public Integer getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Integer questionId) {
        this.questionId = questionId;
    }

    public String getFeedbackType() {
        return feedbackType;
    }

    public void setFeedbackType(String feedbackType) {
        this.feedbackType = feedbackType;
    }

    public String getFeedbackContent() {
        return feedbackContent;
    }

    public void setFeedbackContent(String feedbackContent) {
        this.feedbackContent = feedbackContent;
    }
}
