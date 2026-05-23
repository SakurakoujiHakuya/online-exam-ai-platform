package com.mindskip.xzs.controller.student;

import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.domain.ExamAbnormalLog;
import com.mindskip.xzs.domain.ExamPaperAnswer;
import com.mindskip.xzs.domain.User;
import com.mindskip.xzs.service.ExamAbnormalLogService;
import com.mindskip.xzs.service.ExamPaperAnswerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;

@RestController("StudentExamAbnormalController")
@RequestMapping(value = "/api/student/exam/abnormal")
public class ExamAbnormalController extends BaseApiController {

    private final ExamAbnormalLogService examAbnormalLogService;
    private final ExamPaperAnswerService examPaperAnswerService;

    @Autowired
    public ExamAbnormalController(ExamAbnormalLogService examAbnormalLogService, ExamPaperAnswerService examPaperAnswerService) {
        this.examAbnormalLogService = examAbnormalLogService;
        this.examPaperAnswerService = examPaperAnswerService;
    }

    @RequestMapping(value = "/report", method = RequestMethod.POST)
    public RestResponse<Integer> report(@RequestBody ExamAbnormalLog model) {
        User user = getCurrentUser();
        model.setUserId(user.getId());
        model.setUserName(user.getUserName());
        model.setRealName(user.getRealName());
        model.setCreateTime(new Date());
        examAbnormalLogService.insert(model);

        Integer cheatCount = 0;
        ExamPaperAnswer examPaperAnswer = examPaperAnswerService.getByPidUid(model.getExamPaperId(), user.getId());
        if (examPaperAnswer != null) {
            cheatCount = examPaperAnswer.getCheatCount();
            if (cheatCount == null) {
                cheatCount = 0;
            }
            cheatCount++;
            examPaperAnswer.setCheatCount(cheatCount);
            examPaperAnswerService.updateByIdFilter(examPaperAnswer);
        }

        return RestResponse.ok(cheatCount);
    }
}
