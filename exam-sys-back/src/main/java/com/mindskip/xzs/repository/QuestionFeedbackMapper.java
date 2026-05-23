package com.mindskip.xzs.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.mindskip.xzs.domain.QuestionFeedback;
import com.mindskip.xzs.viewmodel.collaboration.FeedbackReviewPageRequestVM;

@Mapper
public interface QuestionFeedbackMapper extends BaseMapper<QuestionFeedback> {

    List<QuestionFeedback> pageForAdmin(FeedbackReviewPageRequestVM requestVM);

    List<QuestionFeedback> selectByStudentId(Integer studentId);

    List<QuestionFeedback> selectByQuestionId(Integer questionId);

    List<QuestionFeedback> selectByQuestionIds(@Param("questionIds") List<Integer> questionIds);

    Integer countAll();

    Integer countByStatus(@Param("status") Integer status);
}
