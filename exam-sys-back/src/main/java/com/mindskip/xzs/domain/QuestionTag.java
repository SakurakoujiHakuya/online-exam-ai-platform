package com.mindskip.xzs.domain;

import java.io.Serializable;

public class QuestionTag implements Serializable {

    private static final long serialVersionUID = -4496868469752230382L;

    private Integer id;

    private Integer questionId;

    private Integer tagId;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Integer questionId) {
        this.questionId = questionId;
    }

    public Integer getTagId() {
        return tagId;
    }

    public void setTagId(Integer tagId) {
        this.tagId = tagId;
    }
}
