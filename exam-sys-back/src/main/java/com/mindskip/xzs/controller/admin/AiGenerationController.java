package com.mindskip.xzs.controller.admin;

import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.domain.User;
import com.mindskip.xzs.service.AiGenerationService;
import com.mindskip.xzs.viewmodel.admin.ai.AiGenerateRequestVM;
import com.mindskip.xzs.viewmodel.ai.LearningAnalysisRequestVM;
import com.mindskip.xzs.viewmodel.ai.LearningAnalysisVM;
import com.mindskip.xzs.viewmodel.admin.exam.ExamPaperEditRequestVM;
import com.mindskip.xzs.viewmodel.student.ai.AiPaperGenerateVM;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/ai")
public class AiGenerationController extends BaseApiController {

    private final AiGenerationService aiGenerationService;

    public AiGenerationController(AiGenerationService aiGenerationService) {
        this.aiGenerationService = aiGenerationService;
    }

    @PostMapping("/generate/question")
    public RestResponse<Map<String, Object>> generateQuestion(@RequestBody @Valid AiGenerateRequestVM model) {
        Map<String, Object> result = aiGenerationService.generateQuestion(model);
        return RestResponse.ok(result);
    }

    @PostMapping("/generate/analyze")
    public RestResponse<String> generateAnalyze(@RequestBody Map<String, Object> model) {
        String result = aiGenerationService.generateAnalyze(model);
        return RestResponse.ok(result);
    }

    @PostMapping("/generate/stats")
    public RestResponse<String> generateStats(@RequestBody Map<String, String> model) {
        String result = aiGenerationService.generateStats(model.get("context"));
        return RestResponse.ok(result);
    }

    @PostMapping("/generate/paper")
    public RestResponse<ExamPaperEditRequestVM> generatePaper(@RequestBody @Valid AiPaperGenerateVM model) {
        User user = getCurrentUser();
        ExamPaperEditRequestVM result = aiGenerationService.generatePaperPreview(model, user);
        return RestResponse.ok(result);
    }

    @PostMapping("/learning-analysis/student/{studentId}")
    public RestResponse<LearningAnalysisVM> generateLearningAnalysis(@PathVariable Integer studentId,
                                                                     @RequestBody(required = false) LearningAnalysisRequestVM model) {
        LearningAnalysisVM result = aiGenerationService.generateLearningAnalysis(studentId, model);
        return RestResponse.ok(result);
    }
}
