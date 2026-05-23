package com.mindskip.xzs.viewmodel.ai;

import java.util.List;

public class LearningAnalysisVM {

    private Integer userId;

    private String userName;

    private String realName;

    private Integer subjectId;

    private String subjectName;

    private Integer rangeDays;

    private Integer totalPapers;

    private Integer totalQuestions;

    private Integer totalCorrectQuestions;

    private Integer practiceDays;

    private Double avgScoreRate;

    private Double avgQuestionCorrectRate;

    private Double avgDoTime;

    private List<LearningTrendPointVM> recentTrend;

    private List<LearningTypeStatVM> questionTypeStats;

    private List<LearningSubjectStatVM> subjectStats;

    private LearningAdviceVM report;

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getRealName() {
        return realName;
    }

    public void setRealName(String realName) {
        this.realName = realName;
    }

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

    public Integer getRangeDays() {
        return rangeDays;
    }

    public void setRangeDays(Integer rangeDays) {
        this.rangeDays = rangeDays;
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

    public Integer getPracticeDays() {
        return practiceDays;
    }

    public void setPracticeDays(Integer practiceDays) {
        this.practiceDays = practiceDays;
    }

    public Double getAvgScoreRate() {
        return avgScoreRate;
    }

    public void setAvgScoreRate(Double avgScoreRate) {
        this.avgScoreRate = avgScoreRate;
    }

    public Double getAvgQuestionCorrectRate() {
        return avgQuestionCorrectRate;
    }

    public void setAvgQuestionCorrectRate(Double avgQuestionCorrectRate) {
        this.avgQuestionCorrectRate = avgQuestionCorrectRate;
    }

    public Double getAvgDoTime() {
        return avgDoTime;
    }

    public void setAvgDoTime(Double avgDoTime) {
        this.avgDoTime = avgDoTime;
    }

    public List<LearningTrendPointVM> getRecentTrend() {
        return recentTrend;
    }

    public void setRecentTrend(List<LearningTrendPointVM> recentTrend) {
        this.recentTrend = recentTrend;
    }

    public List<LearningTypeStatVM> getQuestionTypeStats() {
        return questionTypeStats;
    }

    public void setQuestionTypeStats(List<LearningTypeStatVM> questionTypeStats) {
        this.questionTypeStats = questionTypeStats;
    }

    public List<LearningSubjectStatVM> getSubjectStats() {
        return subjectStats;
    }

    public void setSubjectStats(List<LearningSubjectStatVM> subjectStats) {
        this.subjectStats = subjectStats;
    }

    public LearningAdviceVM getReport() {
        return report;
    }

    public void setReport(LearningAdviceVM report) {
        this.report = report;
    }
}
