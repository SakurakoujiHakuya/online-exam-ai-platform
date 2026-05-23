package com.mindskip.xzs.viewmodel.collaboration;

import com.mindskip.xzs.viewmodel.admin.question.QuestionEditRequestVM;

public class QuestionSolutionDetailVM {

    private QuestionSolutionResponseVM contribution;
    private QuestionEditRequestVM question;

    public QuestionSolutionResponseVM getContribution() {
        return contribution;
    }

    public void setContribution(QuestionSolutionResponseVM contribution) {
        this.contribution = contribution;
    }

    public QuestionEditRequestVM getQuestion() {
        return question;
    }

    public void setQuestion(QuestionEditRequestVM question) {
        this.question = question;
    }
}
