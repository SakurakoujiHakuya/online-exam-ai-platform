package com.mindskip.xzs.viewmodel.collaboration;

import java.util.List;

import com.mindskip.xzs.viewmodel.admin.question.QuestionEditRequestVM;

public class QuestionFeedbackDetailVM {

    private QuestionFeedbackResponseVM feedback;
    private QuestionEditRequestVM question;
    private List<QuestionFeedbackRelatedVM> relatedFeedbacks;
    private String aggregateSummary;
    private String aggregateSuggestion;
    private String aggregateSource;
    private String aggregateSourceLabel;

    public QuestionFeedbackResponseVM getFeedback() {
        return feedback;
    }

    public void setFeedback(QuestionFeedbackResponseVM feedback) {
        this.feedback = feedback;
    }

    public QuestionEditRequestVM getQuestion() {
        return question;
    }

    public void setQuestion(QuestionEditRequestVM question) {
        this.question = question;
    }

    public List<QuestionFeedbackRelatedVM> getRelatedFeedbacks() {
        return relatedFeedbacks;
    }

    public void setRelatedFeedbacks(List<QuestionFeedbackRelatedVM> relatedFeedbacks) {
        this.relatedFeedbacks = relatedFeedbacks;
    }

    public String getAggregateSummary() {
        return aggregateSummary;
    }

    public void setAggregateSummary(String aggregateSummary) {
        this.aggregateSummary = aggregateSummary;
    }

    public String getAggregateSuggestion() {
        return aggregateSuggestion;
    }

    public void setAggregateSuggestion(String aggregateSuggestion) {
        this.aggregateSuggestion = aggregateSuggestion;
    }

    public String getAggregateSource() {
        return aggregateSource;
    }

    public void setAggregateSource(String aggregateSource) {
        this.aggregateSource = aggregateSource;
    }

    public String getAggregateSourceLabel() {
        return aggregateSourceLabel;
    }

    public void setAggregateSourceLabel(String aggregateSourceLabel) {
        this.aggregateSourceLabel = aggregateSourceLabel;
    }
}
