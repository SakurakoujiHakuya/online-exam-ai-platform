package com.mindskip.xzs.viewmodel.ai;

public class LearningSubjectStatVM {

    private Integer subjectId;

    private String subjectName;

    private Integer totalPapers;

    private Integer totalQuestions;

    private Integer totalCorrectQuestions;

    private Double avgScoreRate;

    private Double avgCorrectRate;

    private Double avgDoTime;

    private String evaluation;

    public Integer getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Integer subjectId) {
        this.subjectId = subjectId;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public Integer getTotalPapers() {
        return totalPapers;
    }

    public void setTotalPapers(Integer totalPapers) {
        this.totalPapers = totalPapers;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Integer getTotalCorrectQuestions() {
        return totalCorrectQuestions;
    }

    public void setTotalCorrectQuestions(Integer totalCorrectQuestions) {
        this.totalCorrectQuestions = totalCorrectQuestions;
    }

    public Double getAvgScoreRate() {
        return avgScoreRate;
    }

    public void setAvgScoreRate(Double avgScoreRate) {
        this.avgScoreRate = avgScoreRate;
    }

    public Double getAvgCorrectRate() {
        return avgCorrectRate;
    }

    public void setAvgCorrectRate(Double avgCorrectRate) {
        this.avgCorrectRate = avgCorrectRate;
    }

    public Double getAvgDoTime() {
        return avgDoTime;
    }

    public void setAvgDoTime(Double avgDoTime) {
        this.avgDoTime = avgDoTime;
    }

    public String getEvaluation() {
        return evaluation;
    }

    public void setEvaluation(String evaluation) {
        this.evaluation = evaluation;
    }
}
