package com.mindskip.xzs.viewmodel.collaboration;

import java.util.List;

public class CollaborationRecommendationCopyVM {

    private String summary;
    private List<DailyRecommendationItemVM> items;
    private String source;

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<DailyRecommendationItemVM> getItems() {
        return items;
    }

    public void setItems(List<DailyRecommendationItemVM> items) {
        this.items = items;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}
