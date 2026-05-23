package com.mindskip.xzs.viewmodel.admin.exam;

import com.mindskip.xzs.domain.other.KeyValue;
import java.util.List;

public class PaperStatsVM {
    private Integer id;
    private String name;
    private Integer paperScore;
    private Integer totalCount;
    private String maxScore;
    private String minScore;
    private String avgScore;
    private String passRate;
    private String excellenceRate;
    private String avgDoTime;
    private List<KeyValue> scoreDistribution;
    private List<QuestionStatsVM> questionItems;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getPaperScore() {
        return paperScore;
    }

    public void setPaperScore(Integer paperScore) {
        this.paperScore = paperScore;
    }

    public Integer getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(Integer totalCount) {
        this.totalCount = totalCount;
    }

    public String getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(String maxScore) {
        this.maxScore = maxScore;
    }

    public String getMinScore() {
        return minScore;
    }

    public void setMinScore(String minScore) {
        this.minScore = minScore;
    }

    public String getAvgScore() {
        return avgScore;
    }

    public void setAvgScore(String avgScore) {
        this.avgScore = avgScore;
    }

    public String getPassRate() {
        return passRate;
    }

    public void setPassRate(String passRate) {
        this.passRate = passRate;
    }

    public String getExcellenceRate() {
        return excellenceRate;
    }

    public void setExcellenceRate(String excellenceRate) {
        this.excellenceRate = excellenceRate;
    }

    public String getAvgDoTime() {
        return avgDoTime;
    }

    public void setAvgDoTime(String avgDoTime) {
        this.avgDoTime = avgDoTime;
    }

    public List<KeyValue> getScoreDistribution() {
        return scoreDistribution;
    }

    public void setScoreDistribution(List<KeyValue> scoreDistribution) {
        this.scoreDistribution = scoreDistribution;
    }

    public List<QuestionStatsVM> getQuestionItems() {
        return questionItems;
    }

    public void setQuestionItems(List<QuestionStatsVM> questionItems) {
        this.questionItems = questionItems;
    }
}
