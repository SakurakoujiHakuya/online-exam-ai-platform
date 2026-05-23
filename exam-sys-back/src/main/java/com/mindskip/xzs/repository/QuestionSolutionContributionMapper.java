package com.mindskip.xzs.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.mindskip.xzs.domain.QuestionSolutionContribution;
import com.mindskip.xzs.viewmodel.collaboration.SolutionReviewPageRequestVM;

@Mapper
public interface QuestionSolutionContributionMapper extends BaseMapper<QuestionSolutionContribution> {

    List<QuestionSolutionContribution> pageForAdmin(SolutionReviewPageRequestVM requestVM);

    List<QuestionSolutionContribution> selectByStudentId(Integer studentId);

    List<QuestionSolutionContribution> selectAdoptedByQuestionId(Integer questionId);

    Integer countByStatus(@Param("status") Integer status);
}
