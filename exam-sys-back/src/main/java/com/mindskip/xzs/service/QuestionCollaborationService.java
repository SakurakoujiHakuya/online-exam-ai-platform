package com.mindskip.xzs.service;

import java.util.List;

import com.github.pagehelper.PageInfo;
import com.mindskip.xzs.viewmodel.collaboration.AdoptedSolutionVM;
import com.mindskip.xzs.viewmodel.collaboration.CollaborationOverviewVM;
import com.mindskip.xzs.viewmodel.collaboration.DailyRecommendationVM;
import com.mindskip.xzs.viewmodel.collaboration.FeedbackReviewActionVM;
import com.mindskip.xzs.viewmodel.collaboration.FeedbackReviewPageRequestVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionFeedbackDetailVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionFeedbackResponseVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionFeedbackSubmitVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionSolutionDetailVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionSolutionResponseVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionSolutionSubmitVM;
import com.mindskip.xzs.viewmodel.collaboration.RecommendationBuildResultVM;
import com.mindskip.xzs.viewmodel.collaboration.RecommendationBuildVM;
import com.mindskip.xzs.viewmodel.collaboration.RecommendationRateVM;
import com.mindskip.xzs.viewmodel.collaboration.SolutionReviewActionVM;
import com.mindskip.xzs.viewmodel.collaboration.SolutionReviewPageRequestVM;

public interface QuestionCollaborationService {

    QuestionFeedbackResponseVM submitFeedback(Integer studentId, Integer userGroupId, QuestionFeedbackSubmitVM model);

    QuestionSolutionResponseVM submitSolution(Integer studentId, Integer userGroupId, QuestionSolutionSubmitVM model);

    List<QuestionFeedbackResponseVM> listMyFeedback(Integer studentId);

    List<AdoptedSolutionVM> listAdoptedSolutions(Integer questionId);

    PageInfo<QuestionFeedbackResponseVM> pageFeedbacks(FeedbackReviewPageRequestVM model);

    PageInfo<QuestionSolutionResponseVM> pageSolutions(SolutionReviewPageRequestVM model);

    QuestionFeedbackDetailVM getFeedbackDetail(Integer feedbackId);

    QuestionSolutionDetailVM getSolutionDetail(Integer contributionId);

    String reviewFeedback(Integer teacherId, FeedbackReviewActionVM model);

    String reviewSolution(Integer teacherId, SolutionReviewActionVM model);

    CollaborationOverviewVM getOverview();

    DailyRecommendationVM getDailyRecommendation(Integer studentId, Integer userGroupId, Integer rangeDays);

    RecommendationBuildResultVM buildRecommendationPractice(Integer studentId, Integer userGroupId, RecommendationBuildVM model);

    String rateRecommendation(Integer studentId, RecommendationRateVM model);
}
