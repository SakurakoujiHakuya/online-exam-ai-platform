package com.mindskip.xzs.viewmodel.ai;

import java.util.List;

public class LearningAdviceVM {

    private String overallLevel;

    private String learningStatus;

    private List<String> strengths;

    private List<String> weaknesses;

    private List<String> riskPoints;

    private List<String> studentSuggestions;

    private List<String> teacherSuggestions;

    private Boolean aiGenerated;

    public String getOverallLevel() {
        return overallLevel;
    }

    public void setOverallLevel(String overallLevel) {
        this.overallLevel = overallLevel;
    }

    public String getLearningStatus() {
        return learningStatus;
    }

    public void setLearningStatus(String learningStatus) {
        this.learningStatus = learningStatus;
    }

    public List<String> getStrengths() {
        return strengths;
    }

    public void setStrengths(List<String> strengths) {
        this.strengths = strengths;
    }

    public List<String> getWeaknesses() {
        return weaknesses;
    }

    public void setWeaknesses(List<String> weaknesses) {
        this.weaknesses = weaknesses;
    }

    public List<String> getRiskPoints() {
        return riskPoints;
    }

    public void setRiskPoints(List<String> riskPoints) {
        this.riskPoints = riskPoints;
    }

    public List<String> getStudentSuggestions() {
        return studentSuggestions;
    }

    public void setStudentSuggestions(List<String> studentSuggestions) {
        this.studentSuggestions = studentSuggestions;
    }

    public List<String> getTeacherSuggestions() {
        return teacherSuggestions;
    }

    public void setTeacherSuggestions(List<String> teacherSuggestions) {
        this.teacherSuggestions = teacherSuggestions;
    }

    public Boolean getAiGenerated() {
        return aiGenerated;
    }

    public void setAiGenerated(Boolean aiGenerated) {
        this.aiGenerated = aiGenerated;
    }
}
