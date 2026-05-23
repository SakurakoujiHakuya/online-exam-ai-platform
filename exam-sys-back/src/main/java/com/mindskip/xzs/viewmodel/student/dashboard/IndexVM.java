package com.mindskip.xzs.viewmodel.student.dashboard;


import com.mindskip.xzs.viewmodel.admin.dashboard.ExcellentStudentVM;

import java.util.List;

public class IndexVM {
    private List<PaperInfo> fixedPaper;
    private List<PaperInfo> aiPaper;
    private List<ExcellentStudentVM> excellentStudents;

    public List<PaperInfo> getFixedPaper() {
        return fixedPaper;
    }

    public void setFixedPaper(List<PaperInfo> fixedPaper) {
        this.fixedPaper = fixedPaper;
    }

    public List<PaperInfo> getAiPaper() {
        return aiPaper;
    }

    public void setAiPaper(List<PaperInfo> aiPaper) {
        this.aiPaper = aiPaper;
    }


    public List<ExcellentStudentVM> getExcellentStudents() {
        return excellentStudents;
    }

    public void setExcellentStudents(List<ExcellentStudentVM> excellentStudents) {
        this.excellentStudents = excellentStudents;
    }
}
