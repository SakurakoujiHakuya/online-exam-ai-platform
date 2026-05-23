package com.mindskip.xzs.viewmodel.collaboration;

import java.util.List;

import javax.validation.constraints.NotNull;

public class FeedbackReviewActionVM {

    @NotNull
    private Integer feedbackId;

    @NotNull
    private Integer action;

    private String reviewComment;
    private String updatedTitle;
    private String updatedAnalyze;
    private List<Integer> tagIds;
    private List<String> newTagNames;

    public Integer getFeedbackId() {
        return feedbackId;
    }

    public void setFeedbackId(Integer feedbackId) {
        this.feedbackId = feedbackId;
    }

    public Integer getAction() {
        return action;
    }

    public void setAction(Integer action) {
        this.action = action;
    }

    public String getReviewComment() {
        return reviewComment;
    }

    public void setReviewComment(String reviewComment) {
        this.reviewComment = reviewComment;
    }

    public String getUpdatedTitle() {
        return updatedTitle;
    }

    public void setUpdatedTitle(String updatedTitle) {
        this.updatedTitle = updatedTitle;
    }

    public String getUpdatedAnalyze() {
        return updatedAnalyze;
    }

    public void setUpdatedAnalyze(String updatedAnalyze) {
        this.updatedAnalyze = updatedAnalyze;
    }

    public List<Integer> getTagIds() {
        return tagIds;
    }

    public void setTagIds(List<Integer> tagIds) {
        this.tagIds = tagIds;
    }

    public List<String> getNewTagNames() {
        return newTagNames;
    }

    public void setNewTagNames(List<String> newTagNames) {
        this.newTagNames = newTagNames;
    }
}
