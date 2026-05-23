package com.mindskip.xzs.viewmodel.collaboration;

import javax.validation.constraints.NotNull;

public class SolutionReviewActionVM {

    @NotNull
    private Integer contributionId;

    @NotNull
    private Integer action;

    private String reviewComment;

    public Integer getContributionId() {
        return contributionId;
    }

    public void setContributionId(Integer contributionId) {
        this.contributionId = contributionId;
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
}
