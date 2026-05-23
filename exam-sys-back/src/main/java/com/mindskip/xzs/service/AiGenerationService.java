package com.mindskip.xzs.service;

import com.mindskip.xzs.domain.QuestionFeedback;
import com.mindskip.xzs.domain.User;
import com.mindskip.xzs.viewmodel.admin.ai.AiGenerateRequestVM;
import com.mindskip.xzs.viewmodel.ai.LearningAnalysisRequestVM;
import com.mindskip.xzs.viewmodel.ai.LearningAnalysisVM;
import com.mindskip.xzs.viewmodel.admin.exam.ExamPaperEditRequestVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionEditRequestVM;
import com.mindskip.xzs.viewmodel.collaboration.CollaborationAggregateInsightVM;
import com.mindskip.xzs.viewmodel.collaboration.CollaborationFeedbackAnalysisVM;
import com.mindskip.xzs.viewmodel.collaboration.CollaborationRecommendationCopyVM;
import com.mindskip.xzs.viewmodel.collaboration.CollaborationSolutionAnalysisVM;
import com.mindskip.xzs.viewmodel.collaboration.DailyRecommendationItemVM;
import com.mindskip.xzs.viewmodel.student.ai.AiPaperGenerateVM;

import java.util.List;
import java.util.Map;

public interface AiGenerationService {
    Map<String, Object> generateQuestion(AiGenerateRequestVM model);
    String generateAnalyze(Map<String, Object> model);
    String generateStats(String context);
    Integer generatePaper(AiPaperGenerateVM model, User user);
    ExamPaperEditRequestVM generatePaperPreview(AiPaperGenerateVM model, User user);
    LearningAnalysisVM generateLearningAnalysis(Integer studentId, LearningAnalysisRequestVM model);
    CollaborationFeedbackAnalysisVM generateFeedbackAnalysis(QuestionEditRequestVM questionVM, String feedbackType, String feedbackContent);
    CollaborationSolutionAnalysisVM generateSolutionAnalysis(QuestionEditRequestVM questionVM, String solutionContent);
    CollaborationAggregateInsightVM generateAggregateFeedbackInsight(QuestionEditRequestVM questionVM, List<QuestionFeedback> relatedFeedbacks);
    CollaborationRecommendationCopyVM generateRecommendationCopy(List<DailyRecommendationItemVM> items, List<QuestionFeedback> recentFeedbacks, Integer rangeDays);
}
