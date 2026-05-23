package com.mindskip.xzs.viewmodel.ai;

public class LearningImprovementVM {

    private Integer subjectId;
    private String subjectName;
    private Double beforeCorrectRate;
    private Double afterCorrectRate;
    private Double delta;

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

    public Double getBeforeCorrectRate() {
        return beforeCorrectRate;
    }

    public void setBeforeCorrectRate(Double beforeCorrectRate) {
        this.beforeCorrectRate = beforeCorrectRate;
    }

    public Double getAfterCorrectRate() {
        return afterCorrectRate;
    }

    public void setAfterCorrectRate(Double afterCorrectRate) {
        this.afterCorrectRate = afterCorrectRate;
    }

    public Double getDelta() {
        return delta;
    }

    public void setDelta(Double delta) {
        this.delta = delta;
    }
}
