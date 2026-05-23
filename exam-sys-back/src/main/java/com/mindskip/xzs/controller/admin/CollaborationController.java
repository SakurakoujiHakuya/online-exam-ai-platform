package com.mindskip.xzs.controller.admin;

import com.github.pagehelper.PageInfo;
import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.service.QuestionCollaborationService;
import com.mindskip.xzs.viewmodel.collaboration.CollaborationOverviewVM;
import com.mindskip.xzs.viewmodel.collaboration.FeedbackReviewActionVM;
import com.mindskip.xzs.viewmodel.collaboration.FeedbackReviewPageRequestVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionFeedbackDetailVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionFeedbackResponseVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionSolutionDetailVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionSolutionResponseVM;
import com.mindskip.xzs.viewmodel.collaboration.SolutionReviewActionVM;
import com.mindskip.xzs.viewmodel.collaboration.SolutionReviewPageRequestVM;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController("AdminCollaborationController")
@RequestMapping("/api/admin/collaboration")
public class CollaborationController extends BaseApiController {

    private final QuestionCollaborationService questionCollaborationService;

    @Autowired
    public CollaborationController(QuestionCollaborationService questionCollaborationService) {
        this.questionCollaborationService = questionCollaborationService;
    }

    @RequestMapping(value = "/overview", method = RequestMethod.POST)
    public RestResponse<CollaborationOverviewVM> overview() {
        return RestResponse.ok(questionCollaborationService.getOverview());
    }

    @RequestMapping(value = "/feedback/page", method = RequestMethod.POST)
    public RestResponse<PageInfo<QuestionFeedbackResponseVM>> feedbackPage(@RequestBody FeedbackReviewPageRequestVM model) {
        return RestResponse.ok(questionCollaborationService.pageFeedbacks(model));
    }

    @RequestMapping(value = "/feedback/detail/{id}", method = RequestMethod.POST)
    public RestResponse<QuestionFeedbackDetailVM> feedbackDetail(@PathVariable Integer id) {
        return RestResponse.ok(questionCollaborationService.getFeedbackDetail(id));
    }

    @RequestMapping(value = "/feedback/review", method = RequestMethod.POST)
    public RestResponse<String> reviewFeedback(@RequestBody @Valid FeedbackReviewActionVM model) {
        return RestResponse.ok(questionCollaborationService.reviewFeedback(getCurrentUser().getId(), model));
    }

    @RequestMapping(value = "/solution/page", method = RequestMethod.POST)
    public RestResponse<PageInfo<QuestionSolutionResponseVM>> solutionPage(@RequestBody SolutionReviewPageRequestVM model) {
        return RestResponse.ok(questionCollaborationService.pageSolutions(model));
    }

    @RequestMapping(value = "/solution/detail/{id}", method = RequestMethod.POST)
    public RestResponse<QuestionSolutionDetailVM> solutionDetail(@PathVariable Integer id) {
        return RestResponse.ok(questionCollaborationService.getSolutionDetail(id));
    }

    @RequestMapping(value = "/solution/review", method = RequestMethod.POST)
    public RestResponse<String> reviewSolution(@RequestBody @Valid SolutionReviewActionVM model) {
        return RestResponse.ok(questionCollaborationService.reviewSolution(getCurrentUser().getId(), model));
    }
}
