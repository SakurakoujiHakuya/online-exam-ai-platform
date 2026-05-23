package com.mindskip.xzs.viewmodel.collaboration;

public class CollaborationOverviewVM {

    private Integer feedbackCount;
    private Double feedbackAdoptRate;
    private Integer revisionCount;
    private Integer tagRevisionCount;
    private Double aiQuestionAdoptRate;
    private Double recommendationAcceptRate;
    private Double recommendationUsefulRate;

    public Integer getFeedbackCount() {
        return feedbackCount;
    }

    public void setFeedbackCount(Integer feedbackCount) {
        this.feedbackCount = feedbackCount;
    }

    public Double getFeedbackAdoptRate() {
        return feedbackAdoptRate;
    }

    public void setFeedbackAdoptRate(Double feedbackAdoptRate) {
        this.feedbackAdoptRate = feedbackAdoptRate;
    }

    public Integer getRevisionCount() {
        return revisionCount;
    }

    public void setRevisionCount(Integer revisionCount) {
        this.revisionCount = revisionCount;
    }

    public Integer getTagRevisionCount() {
        return tagRevisionCount;
    }

    public void setTagRevisionCount(Integer tagRevisionCount) {
        this.tagRevisionCount = tagRevisionCount;
    }

    public Double getAiQuestionAdoptRate() {
        return aiQuestionAdoptRate;
    }

    public void setAiQuestionAdoptRate(Double aiQuestionAdoptRate) {
        this.aiQuestionAdoptRate = aiQuestionAdoptRate;
    }

    public Double getRecommendationAcceptRate() {
        return recommendationAcceptRate;
    }

    public void setRecommendationAcceptRate(Double recommendationAcceptRate) {
        this.recommendationAcceptRate = recommendationAcceptRate;
    }

    public Double getRecommendationUsefulRate() {
        return recommendationUsefulRate;
    }

    public void setRecommendationUsefulRate(Double recommendationUsefulRate) {
        this.recommendationUsefulRate = recommendationUsefulRate;
    }
}
