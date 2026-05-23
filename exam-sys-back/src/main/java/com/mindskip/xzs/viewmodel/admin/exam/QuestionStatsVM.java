package com.mindskip.xzs.viewmodel.admin.exam;

import com.mindskip.xzs.domain.other.KeyValue;
import java.util.List;

public class QuestionStatsVM {
    private Integer id;
    private Integer questionType;
    private String title;
    private String correct;
    private String items;
    private Integer itemOrder;
    private Integer totalCount;
    private String correctRate;
    private String avgDoTime;
    private Boolean hideInPracticeCenter;
    private List<KeyValue> answerDistribution;
    private List<KeyValue> timeDistribution;
    private Integer feedbackCount;
    private String feedbackAdoptRate;
    private Integer adoptedSolutionCount;
    private Integer revisionCount;
    private List<KeyValue> feedbackTypeDistribution;
    private List<QuestionStatsFeedbackVM> recentFeedbacks;
    private List<QuestionStatsSolutionVM> adoptedSolutions;
    private List<QuestionStatsRevisionVM> revisionLogs;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getQuestionType() {
        return questionType;
    }

    public void setQuestionType(Integer questionType) {
        this.questionType = questionType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCorrect() {
        return correct;
    }

    public void setCorrect(String correct) {
        this.correct = correct;
    }

    public String getItems() {
        return items;
    }

    public void setItems(String items) {
        this.items = items;
    }

    public Integer getItemOrder() {
        return itemOrder;
    }

    public void setItemOrder(Integer itemOrder) {
        this.itemOrder = itemOrder;
    }

    public Integer getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(Integer totalCount) {
        this.totalCount = totalCount;
    }

    public String getCorrectRate() {
        return correctRate;
    }

    public void setCorrectRate(String correctRate) {
        this.correctRate = correctRate;
    }

    public String getAvgDoTime() {
        return avgDoTime;
    }

    public void setAvgDoTime(String avgDoTime) {
        this.avgDoTime = avgDoTime;
    }

    public Boolean getHideInPracticeCenter() {
        return hideInPracticeCenter;
    }

    public void setHideInPracticeCenter(Boolean hideInPracticeCenter) {
        this.hideInPracticeCenter = hideInPracticeCenter;
    }

    public List<KeyValue> getAnswerDistribution() {
        return answerDistribution;
    }

    public void setAnswerDistribution(List<KeyValue> answerDistribution) {
        this.answerDistribution = answerDistribution;
    }

    public List<KeyValue> getTimeDistribution() {
        return timeDistribution;
    }

    public void setTimeDistribution(List<KeyValue> timeDistribution) {
        this.timeDistribution = timeDistribution;
    }

    public Integer getFeedbackCount() {
        return feedbackCount;
    }

    public void setFeedbackCount(Integer feedbackCount) {
        this.feedbackCount = feedbackCount;
    }

    public String getFeedbackAdoptRate() {
        return feedbackAdoptRate;
    }

    public void setFeedbackAdoptRate(String feedbackAdoptRate) {
        this.feedbackAdoptRate = feedbackAdoptRate;
    }

    public Integer getAdoptedSolutionCount() {
        return adoptedSolutionCount;
    }

    public void setAdoptedSolutionCount(Integer adoptedSolutionCount) {
        this.adoptedSolutionCount = adoptedSolutionCount;
    }

    public Integer getRevisionCount() {
        return revisionCount;
    }

    public void setRevisionCount(Integer revisionCount) {
        this.revisionCount = revisionCount;
    }

    public List<KeyValue> getFeedbackTypeDistribution() {
        return feedbackTypeDistribution;
    }

    public void setFeedbackTypeDistribution(List<KeyValue> feedbackTypeDistribution) {
        this.feedbackTypeDistribution = feedbackTypeDistribution;
    }

    public List<QuestionStatsFeedbackVM> getRecentFeedbacks() {
        return recentFeedbacks;
    }

    public void setRecentFeedbacks(List<QuestionStatsFeedbackVM> recentFeedbacks) {
        this.recentFeedbacks = recentFeedbacks;
    }

    public List<QuestionStatsSolutionVM> getAdoptedSolutions() {
        return adoptedSolutions;
    }

    public void setAdoptedSolutions(List<QuestionStatsSolutionVM> adoptedSolutions) {
        this.adoptedSolutions = adoptedSolutions;
    }

    public List<QuestionStatsRevisionVM> getRevisionLogs() {
        return revisionLogs;
    }

    public void setRevisionLogs(List<QuestionStatsRevisionVM> revisionLogs) {
        this.revisionLogs = revisionLogs;
    }
}
