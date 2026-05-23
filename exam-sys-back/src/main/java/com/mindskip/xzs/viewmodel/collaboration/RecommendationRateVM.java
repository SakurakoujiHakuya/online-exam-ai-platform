package com.mindskip.xzs.viewmodel.collaboration;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

public class RecommendationRateVM {

    @NotNull
    private Integer recommendationId;

    @NotNull
    @Min(1)
    @Max(3)
    private Integer effectScore;

    public Integer getRecommendationId() {
        return recommendationId;
    }

    public void setRecommendationId(Integer recommendationId) {
        this.recommendationId = recommendationId;
    }

    public Integer getEffectScore() {
        return effectScore;
    }

    public void setEffectScore(Integer effectScore) {
        this.effectScore = effectScore;
    }
}
