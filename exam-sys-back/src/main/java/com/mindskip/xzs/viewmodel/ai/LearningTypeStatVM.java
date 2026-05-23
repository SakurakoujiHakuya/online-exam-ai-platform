package com.mindskip.xzs.viewmodel.ai;

public class LearningTypeStatVM {

    private Integer questionType;

    private String typeName;

    private Integer totalCount;

    private Integer correctCount;

    private Double correctRate;

    private Double avgDoTime;

    public Integer getQuestionType() {
        return questionType;
    }

    public void setQuestionType(Integer questionType) {
        this.questionType = questionType;
    }

    public String getTypeName() {
        return typeName;
    }

    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }

    public Integer getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(Integer totalCount) {
        this.totalCount = totalCount;
    }

    public Integer getCorrectCount() {
        return correctCount;
    }

    public void setCorrectCount(Integer correctCount) {
        this.correctCount = correctCount;
    }

    public Double getCorrectRate() {
        return correctRate;
    }

    public void setCorrectRate(Double correctRate) {
        this.correctRate = correctRate;
    }

    public Double getAvgDoTime() {
        return avgDoTime;
    }

    public void setAvgDoTime(Double avgDoTime) {
        this.avgDoTime = avgDoTime;
    }
}
