package com.mindskip.xzs.viewmodel.collaboration;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class QuestionSolutionSubmitVM {

    @NotNull
    private Integer questionId;

    @NotBlank
    private String content;

    public Integer getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Integer questionId) {
        this.questionId = questionId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
