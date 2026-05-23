package com.mindskip.xzs.viewmodel.admin.question;

import com.mindskip.xzs.viewmodel.BaseVM;



public class QuestionResponseVM extends BaseVM {

    private Integer id;

    private Integer questionType;

    private Integer textContentId;

    private String createTime;

    private Integer subjectId;

    private Integer createUser;

    private String score;

    private Integer status;

    private String correct;

    private Integer analyzeTextContentId;

    private Integer difficult;

    private String shortTitle;

    private Integer isAi;

    private java.util.List<String> tagNames;

    private Integer answerCount;

    private String correctRate;

    private Boolean hideInPracticeCenter;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getQuestionType() {
        return questionType;
    }

    public void setQuestionType(Integer questionType) {
        this.questionType = questionType;
    }

    public Integer getTextContentId() {
        return textContentId;
    }

    public void setTextContentId(Integer textContentId) {
        this.textContentId = textContentId;
    }

    public String getCreateTime() {
        return createTime;
    }

    public void setCreateTime(String createTime) {
        this.createTime = createTime;
    }

    public Integer getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Integer subjectId) {
        this.subjectId = subjectId;
    }

    public Integer getCreateUser() {
        return createUser;
    }

    public void setCreateUser(Integer createUser) {
        this.createUser = createUser;
    }

    public String getScore() {
        return score;
    }

    public void setScore(String score) {
        this.score = score;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getCorrect() {
        return correct;
    }

    public void setCorrect(String correct) {
        this.correct = correct;
    }

    public Integer getAnalyzeTextContentId() {
        return analyzeTextContentId;
    }

    public void setAnalyzeTextContentId(Integer analyzeTextContentId) {
        this.analyzeTextContentId = analyzeTextContentId;
    }

    public Integer getDifficult() {
        return difficult;
    }

    public void setDifficult(Integer difficult) {
        this.difficult = difficult;
    }

    public String getShortTitle() {
        return shortTitle;
    }

    public void setShortTitle(String shortTitle) {
        this.shortTitle = shortTitle;
    }

    public Integer getIsAi() {
        return isAi;
    }

    public void setIsAi(Integer isAi) {
        this.isAi = isAi;
    }

    public java.util.List<String> getTagNames() {
        return tagNames;
    }

    public void setTagNames(java.util.List<String> tagNames) {
        this.tagNames = tagNames;
    }

    public Integer getAnswerCount() {
        return answerCount;
    }

    public void setAnswerCount(Integer answerCount) {
        this.answerCount = answerCount;
    }

    public String getCorrectRate() {
        return correctRate;
    }

    public void setCorrectRate(String correctRate) {
        this.correctRate = correctRate;
    }

    public Boolean getHideInPracticeCenter() {
        return hideInPracticeCenter;
    }

    public void setHideInPracticeCenter(Boolean hideInPracticeCenter) {
        this.hideInPracticeCenter = hideInPracticeCenter;
    }
}
