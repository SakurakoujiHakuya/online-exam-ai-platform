package com.mindskip.xzs.service;

import com.mindskip.xzs.domain.Question;
import com.mindskip.xzs.viewmodel.admin.exam.QuestionStatsVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionAnswerStatVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionEditRequestVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionPageRequestVM;
import com.mindskip.xzs.viewmodel.student.question.answer.QuestionPageStudentRequestVM;
import com.github.pagehelper.PageInfo;

import java.util.List;

public interface QuestionService extends BaseService<Question> {

    PageInfo<Question> page(QuestionPageRequestVM requestVM);

    PageInfo<Question> studentPage(QuestionPageStudentRequestVM requestVM);

    List<Question> studentList(QuestionPageStudentRequestVM requestVM);

    Question insertFullQuestion(QuestionEditRequestVM model, Integer userId);

    Question updateFullQuestion(QuestionEditRequestVM model, Integer userId);

    QuestionEditRequestVM getQuestionEditRequestVM(Integer questionId);

    QuestionEditRequestVM getQuestionEditRequestVM(Question question);

    Integer selectAllCount();

    List<Integer> selectMothCount();

    QuestionStatsVM statistics(Integer id);

    java.util.Map<Integer, QuestionAnswerStatVM> mapQuestionAnswerStats(List<Integer> questionIds);

    Question getAccessibleQuestion(Integer id, Integer userGroupId);

    Question getPracticeCenterAccessibleQuestion(Integer id, Integer userGroupId);

    Integer countReferenceByUserGroup(Integer questionId, Integer userGroupId);
}
