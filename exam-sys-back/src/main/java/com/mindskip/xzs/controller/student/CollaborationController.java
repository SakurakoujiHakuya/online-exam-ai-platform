package com.mindskip.xzs.controller.student;

import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.domain.User;
import com.mindskip.xzs.service.QuestionCollaborationService;
import com.mindskip.xzs.viewmodel.collaboration.AdoptedSolutionVM;
import com.mindskip.xzs.viewmodel.collaboration.DailyRecommendationVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionFeedbackResponseVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionFeedbackSubmitVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionSolutionResponseVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionSolutionSubmitVM;
import com.mindskip.xzs.viewmodel.collaboration.RecommendationBuildResultVM;
import com.mindskip.xzs.viewmodel.collaboration.RecommendationBuildVM;
import com.mindskip.xzs.viewmodel.collaboration.RecommendationRateVM;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.List;

@RestController("StudentCollaborationController")
@RequestMapping("/api/student/collaboration")
public class CollaborationController extends BaseApiController {

    private final QuestionCollaborationService questionCollaborationService;

    @Autowired
    public CollaborationController(QuestionCollaborationService questionCollaborationService) {
        this.questionCollaborationService = questionCollaborationService;
    }

    @RequestMapping(value = "/feedback/submit", method = RequestMethod.POST)
    public RestResponse<QuestionFeedbackResponseVM> submitFeedback(@RequestBody @Valid QuestionFeedbackSubmitVM model) {
        User user = getCurrentUser();
        return RestResponse.ok(questionCollaborationService.submitFeedback(user.getId(), user.getUserGroupId(), model));
    }

    @RequestMapping(value = "/feedback/my", method = RequestMethod.POST)
    public RestResponse<List<QuestionFeedbackResponseVM>> myFeedback() {
        return RestResponse.ok(questionCollaborationService.listMyFeedback(getCurrentUser().getId()));
    }

    @RequestMapping(value = "/solution/submit", method = RequestMethod.POST)
    public RestResponse<QuestionSolutionResponseVM> submitSolution(@RequestBody @Valid QuestionSolutionSubmitVM model) {
        User user = getCurrentUser();
        return RestResponse.ok(questionCollaborationService.submitSolution(user.getId(), user.getUserGroupId(), model));
    }

    @RequestMapping(value = "/question/{questionId}/adopted-solutions", method = RequestMethod.POST)
    public RestResponse<List<AdoptedSolutionVM>> adoptedSolutions(@PathVariable Integer questionId) {
        return RestResponse.ok(questionCollaborationService.listAdoptedSolutions(questionId));
    }

    @RequestMapping(value = "/recommendation/daily", method = RequestMethod.POST)
    public RestResponse<DailyRecommendationVM> dailyRecommendation(@RequestParam(required = false) Integer rangeDays) {
        User user = getCurrentUser();
        return RestResponse.ok(questionCollaborationService.getDailyRecommendation(user.getId(), user.getUserGroupId(), rangeDays));
    }

    @RequestMapping(value = "/recommendation/build", method = RequestMethod.POST)
    public RestResponse<RecommendationBuildResultVM> buildRecommendation(@RequestBody @Valid RecommendationBuildVM model) {
        User user = getCurrentUser();
        return RestResponse.ok(questionCollaborationService.buildRecommendationPractice(user.getId(), user.getUserGroupId(), model));
    }

    @RequestMapping(value = "/recommendation/rate", method = RequestMethod.POST)
    public RestResponse<String> rateRecommendation(@RequestBody @Valid RecommendationRateVM model) {
        return RestResponse.ok(questionCollaborationService.rateRecommendation(getCurrentUser().getId(), model));
    }
}
