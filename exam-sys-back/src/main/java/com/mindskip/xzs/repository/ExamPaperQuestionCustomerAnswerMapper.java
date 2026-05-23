package com.mindskip.xzs.repository;

import com.mindskip.xzs.domain.ExamPaperQuestionCustomerAnswer;
import com.mindskip.xzs.domain.other.ExamPaperAnswerUpdate;
import com.mindskip.xzs.domain.other.KeyValue;
import com.mindskip.xzs.viewmodel.admin.question.QuestionAnswerStatVM;
import com.mindskip.xzs.viewmodel.student.question.answer.QuestionPageStudentRequestVM;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;

@Mapper
public interface ExamPaperQuestionCustomerAnswerMapper extends BaseMapper<ExamPaperQuestionCustomerAnswer> {

    List<ExamPaperQuestionCustomerAnswer> selectListByPaperAnswerId(Integer id);

    List<ExamPaperQuestionCustomerAnswer> studentPage(QuestionPageStudentRequestVM requestVM);

    int insertList(List<ExamPaperQuestionCustomerAnswer> list);

    Integer selectAllCount();

    List<KeyValue> selectCountByDate(@Param("startTime") Date startTime, @Param("endTime") Date endTime);

    int updateScore(List<ExamPaperAnswerUpdate> examPaperAnswerUpdates);

    List<ExamPaperQuestionCustomerAnswer> selectListByPaperId(Integer paperId);

    List<ExamPaperQuestionCustomerAnswer> selectListByQuestionId(Integer questionId);

    List<QuestionAnswerStatVM> selectQuestionAnswerStats(@Param("questionIds") List<Integer> questionIds);

    List<ExamPaperQuestionCustomerAnswer> selectByUserIdAndDateRange(@Param("userId") Integer userId,
                                                                     @Param("startTime") Date startTime,
                                                                     @Param("endTime") Date endTime,
                                                                     @Param("subjectId") Integer subjectId);
}
