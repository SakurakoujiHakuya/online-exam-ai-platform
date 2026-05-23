package com.mindskip.xzs.viewmodel.collaboration;

import java.util.List;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class RecommendationBuildVM {

    @NotBlank
    private String strategyKey;

    @NotBlank
    private String title;

    @NotBlank
    private String reason;

    @NotNull
    private Integer subjectId;

    private Integer questionType;
    private List<Integer> seedQuestionIds;
    private String source;
    private String sourceLabel;

    public String getStrategyKey() {
        return strategyKey;
    }

    public void setStrategyKey(String strategyKey) {
        this.strategyKey = strategyKey;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Integer getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Integer subjectId) {
        this.subjectId = subjectId;
    }

    public Integer getQuestionType() {
        return questionType;
    }

    public void setQuestionType(Integer questionType) {
        this.questionType = questionType;
    }

    public List<Integer> getSeedQuestionIds() {
        return seedQuestionIds;
    }

    public void setSeedQuestionIds(List<Integer> seedQuestionIds) {
        this.seedQuestionIds = seedQuestionIds;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getSourceLabel() {
        return sourceLabel;
    }

    public void setSourceLabel(String sourceLabel) {
        this.sourceLabel = sourceLabel;
    }
}
