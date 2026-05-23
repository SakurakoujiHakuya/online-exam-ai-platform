package com.mindskip.xzs.controller.student;

import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.domain.User;
import com.mindskip.xzs.service.AiGenerationService;
import com.mindskip.xzs.viewmodel.ai.LearningAnalysisRequestVM;
import com.mindskip.xzs.viewmodel.ai.LearningAnalysisVM;
import com.mindskip.xzs.viewmodel.student.ai.AiPaperGenerateVM;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController("StudentAiController")
@RequestMapping(value = "/api/student/ai")
public class AiController extends BaseApiController {

    private final AiGenerationService aiGenerationService;

    @Autowired
    public AiController(AiGenerationService aiGenerationService) {
        this.aiGenerationService = aiGenerationService;
    }

    @RequestMapping(value = "/generatePaper", method = RequestMethod.POST)
    public RestResponse<Integer> generatePaper(@RequestBody @Valid AiPaperGenerateVM model) {
        User user = getCurrentUser();
        Integer paperId = aiGenerationService.generatePaper(model, user);
        return RestResponse.ok(paperId);
    }

    @RequestMapping(value = "/learning-analysis/me", method = RequestMethod.POST)
    public RestResponse<LearningAnalysisVM> myLearningAnalysis(@RequestBody(required = false) LearningAnalysisRequestVM model) {
        User user = getCurrentUser();
        LearningAnalysisVM result = aiGenerationService.generateLearningAnalysis(user.getId(), model);
        return RestResponse.ok(result);
    }
}
