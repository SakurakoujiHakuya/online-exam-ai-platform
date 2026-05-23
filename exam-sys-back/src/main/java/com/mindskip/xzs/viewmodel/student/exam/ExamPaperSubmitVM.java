package com.mindskip.xzs.viewmodel.student.exam;


import javax.validation.constraints.NotNull;
import java.util.List;


public class ExamPaperSubmitVM {

    @NotNull
    private Integer id;

    private Integer doTime;

    private Integer taskExamId;

    private String score;

    private String userName;

    private String realName;

    private String studentName;

    private List<ExamPaperSubmitItemVM> answerItems;

    private Integer cheatCount;

    private Long startTime;

    private Integer suggestTime;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getDoTime() {
        return doTime;
    }

    public void setDoTime(Integer doTime) {
        this.doTime = doTime;
    }

    public Integer getTaskExamId() {
        return taskExamId;
    }

    public void setTaskExamId(Integer taskExamId) {
        this.taskExamId = taskExamId;
    }

    public String getScore() {
        return score;
    }

    public void setScore(String score) {
        this.score = score;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getRealName() {
        return realName;
    }

    public void setRealName(String realName) {
        this.realName = realName;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public List<ExamPaperSubmitItemVM> getAnswerItems() {
        return answerItems;
    }

    public void setAnswerItems(List<ExamPaperSubmitItemVM> answerItems) {
        this.answerItems = answerItems;
    }

    public Integer getCheatCount() {
        return cheatCount;
    }

    public void setCheatCount(Integer cheatCount) {
        this.cheatCount = cheatCount;
    }

    public Long getStartTime() {
        return startTime;
    }

    public void setStartTime(Long startTime) {
        this.startTime = startTime;
    }

    public Integer getSuggestTime() {
        return suggestTime;
    }

    public void setSuggestTime(Integer suggestTime) {
        this.suggestTime = suggestTime;
    }
}
