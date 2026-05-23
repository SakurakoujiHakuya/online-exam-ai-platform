package com.mindskip.xzs.viewmodel.student.question;

import javax.validation.constraints.NotEmpty;
import java.util.List;

public class QuestionPracticeBuildVM {

    @NotEmpty
    private List<Integer> questionIds;

    public List<Integer> getQuestionIds() {
        return questionIds;
    }

    public void setQuestionIds(List<Integer> questionIds) {
        this.questionIds = questionIds;
    }
}
