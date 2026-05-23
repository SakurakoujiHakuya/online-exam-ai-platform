package com.mindskip.xzs.domain;

import java.io.Serializable;

public class ExamPaperTag implements Serializable {

    private static final long serialVersionUID = -403445668440850571L;

    private Integer id;

    private Integer examPaperId;

    private Integer tagId;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getExamPaperId() {
        return examPaperId;
    }

    public void setExamPaperId(Integer examPaperId) {
        this.examPaperId = examPaperId;
    }

    public Integer getTagId() {
        return tagId;
    }

    public void setTagId(Integer tagId) {
        this.tagId = tagId;
    }
}
