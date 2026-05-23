package com.mindskip.xzs.viewmodel.student.ai;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Map;

public class AiPaperGenerateVM {

    @NotNull
    private Integer subjectId;

    @NotBlank
    private String topic;

    @Min(1)
    @Max(5)
    private Integer difficult;

    // Map of question type (Integer) to count (Integer)
    private Map<Integer, Integer> questionCountMap;

    private Integer paperType;

    public Integer getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Integer subjectId) {
        this.subjectId = subjectId;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public Integer getDifficult() {
        return difficult;
    }

    public void setDifficult(Integer difficult) {
        this.difficult = difficult;
    }

    public Map<Integer, Integer> getQuestionCountMap() {
        return questionCountMap;
    }

    public void setQuestionCountMap(Map<Integer, Integer> questionCountMap) {
        this.questionCountMap = questionCountMap;
    }

    public Integer getPaperType() {
        return paperType;
    }

    public void setPaperType(Integer paperType) {
        this.paperType = paperType;
    }
}
