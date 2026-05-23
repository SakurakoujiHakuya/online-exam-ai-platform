package com.mindskip.xzs.controller.student;

import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.domain.*;
import com.mindskip.xzs.domain.enums.ExamPaperAnswerStatusEnum;
import com.mindskip.xzs.event.CalculateExamPaperAnswerCompleteEvent;
import com.mindskip.xzs.event.UserEvent;
import com.mindskip.xzs.service.ExamPaperAnswerService;
import com.mindskip.xzs.service.ExamPaperService;
import com.mindskip.xzs.service.SubjectService;
import com.mindskip.xzs.service.TaskExamService;
import com.mindskip.xzs.utility.DateTimeUtil;
import com.mindskip.xzs.utility.ExamUtil;
import com.mindskip.xzs.utility.PageInfoHelper;
import com.mindskip.xzs.viewmodel.admin.exam.ExamPaperEditRequestVM;
import com.mindskip.xzs.viewmodel.student.exam.ExamPaperReadVM;
import com.mindskip.xzs.viewmodel.student.exam.ExamPaperSubmitVM;
import com.mindskip.xzs.viewmodel.student.exampaper.ExamPaperAnswerPageResponseVM;
import com.mindskip.xzs.viewmodel.student.exampaper.ExamPaperAnswerPageVM;
import com.github.pagehelper.PageInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Date;
import java.util.Objects;

@RestController("StudentExamPaperAnswerController")
@RequestMapping(value = "/api/student/exampaper/answer")
public class ExamPaperAnswerController extends BaseApiController {

    private final ExamPaperAnswerService examPaperAnswerService;
    private final ExamPaperService examPaperService;
    private final SubjectService subjectService;
    private final TaskExamService taskExamService;
    private final ApplicationEventPublisher eventPublisher;

    @Autowired
    public ExamPaperAnswerController(ExamPaperAnswerService examPaperAnswerService, ExamPaperService examPaperService, SubjectService subjectService, TaskExamService taskExamService, ApplicationEventPublisher eventPublisher) {
        this.examPaperAnswerService = examPaperAnswerService;
        this.examPaperService = examPaperService;
        this.subjectService = subjectService;
        this.taskExamService = taskExamService;
        this.eventPublisher = eventPublisher;
    }


    @RequestMapping(value = "/pageList", method = RequestMethod.POST)
    public RestResponse<PageInfo<ExamPaperAnswerPageResponseVM>> pageList(@RequestBody @Valid ExamPaperAnswerPageVM model) {
        model.setCreateUser(getCurrentUser().getId());
        PageInfo<ExamPaperAnswer> pageInfo = examPaperAnswerService.studentPage(model);
        PageInfo<ExamPaperAnswerPageResponseVM> page = PageInfoHelper.copyMap(pageInfo, e -> {
            ExamPaperAnswerPageResponseVM vm = modelMapper.map(e, ExamPaperAnswerPageResponseVM.class);
            Subject subject = subjectService.selectById(vm.getSubjectId());
            vm.setDoTime(ExamUtil.secondToVM(e.getDoTime()));
            vm.setSystemScore(ExamUtil.scoreToVM(e.getSystemScore()));
            vm.setUserScore(ExamUtil.scoreToVM(e.getUserScore()));
            vm.setPaperScore(ExamUtil.scoreToVM(e.getPaperScore()));
            vm.setSubjectName(subject == null ? "" : subject.getName());
            vm.setCreateTime(DateTimeUtil.dateFormat(e.getCreateTime()));
            return vm;
        });
        return RestResponse.ok(page);
    }


    @RequestMapping(value = "/answerSubmit", method = RequestMethod.POST)
    public RestResponse<String> answerSubmit(@RequestBody @Valid ExamPaperSubmitVM examPaperSubmitVM) {
        User user = getCurrentUser();
        ExamPaper sourcePaper = examPaperService.selectById(examPaperSubmitVM.getId());
        if (sourcePaper == null || !Objects.equals(sourcePaper.getUserGroupId(), user.getUserGroupId())) {
            return RestResponse.fail(4, "无权提交该试卷");
        }
        ExamPaperAnswerInfo examPaperAnswerInfo = examPaperAnswerService.calculateExamPaperAnswer(examPaperSubmitVM, user);
        if (null == examPaperAnswerInfo) {
            return RestResponse.fail(2, "试卷不能重复做");
        }
        if (null == examPaperAnswerInfo.getExamPaperAnswer()) {
            return RestResponse.fail(3, "计算异常");
        }

        ExamPaperAnswer examPaperAnswer = examPaperAnswerInfo.getExamPaperAnswer();
        // If it was already in "Going" status, we should take its ID to update it.
        ExamPaperAnswer currentAnswer = examPaperAnswerService.getByPidUidStatus(examPaperSubmitVM.getId(), user.getId(), com.mindskip.xzs.domain.enums.ExamPaperAnswerStatusEnum.Going.getCode());
        if (currentAnswer != null) {
            examPaperAnswer.setId(currentAnswer.getId());
        }

        Integer userScore = examPaperAnswer.getUserScore();
        String scoreVm = ExamUtil.scoreToVM(userScore);
        UserEventLog userEventLog = new UserEventLog(user.getId(), user.getUserName(), user.getRealName(), new Date());
        String content = user.getUserName() + " 提交试卷：" + examPaperAnswerInfo.getExamPaper().getName()
                + " 得分：" + scoreVm
                + " 耗时：" + ExamUtil.secondToVM(examPaperAnswer.getDoTime());
        userEventLog.setContent(content);

        // Original event publication will handle persistence via listener
        eventPublisher.publishEvent(new CalculateExamPaperAnswerCompleteEvent(examPaperAnswerInfo));
        eventPublisher.publishEvent(new UserEvent(userEventLog));
        return RestResponse.ok(scoreVm);
    }

    @RequestMapping(value = "/answerStart", method = RequestMethod.POST)
    public RestResponse<ExamPaperSubmitVM> answerStart(@RequestBody ExamPaperSubmitVM model) {
        User user = getCurrentUser();
        ExamPaper examPaper = examPaperService.selectById(model.getId());
        if (examPaper == null || !Objects.equals(examPaper.getUserGroupId(), user.getUserGroupId())) {
            return RestResponse.fail(6, "无权进入该试卷");
        }
        
        // 检查考试时间限制
        if (examPaper.getPaperType() == com.mindskip.xzs.domain.enums.ExamPaperTypeEnum.Task.getCode()) {
             Integer taskId = examPaper.getTaskExamId();
             if (taskId != null) {
                 TaskExam taskExam = taskExamService.selectById(taskId);
                 if (taskExam != null) {
                     Date now = new Date();
                     if (taskExam.getStartTime() != null && now.before(taskExam.getStartTime())) {
                         return RestResponse.fail(4, "考试未开始");
                     }
                     if (taskExam.getEndTime() != null && now.after(taskExam.getEndTime())) {
                         return RestResponse.fail(5, "考试已结束");
                     }
                 }
             }
        }

        ExamPaperAnswer examPaperAnswer;
        String lockKey = (user.getId() + ":" + model.getId()).intern();
        synchronized (lockKey) {
            examPaperAnswer = examPaperAnswerService.getByPidUidStatus(model.getId(), user.getId(), com.mindskip.xzs.domain.enums.ExamPaperAnswerStatusEnum.Going.getCode());
            if (examPaperAnswer == null) {
                examPaperAnswer = new ExamPaperAnswer();
                examPaperAnswer.setExamPaperId(examPaper.getId());
                examPaperAnswer.setPaperName(examPaper.getName());
                examPaperAnswer.setPaperType(examPaper.getPaperType());
                examPaperAnswer.setSubjectId(examPaper.getSubjectId());
                examPaperAnswer.setCreateUser(user.getId());
                examPaperAnswer.setCreateTime(new Date());
                examPaperAnswer.setDoTime(0);
                examPaperAnswer.setCheatCount(0);
                examPaperAnswer.setStatus(com.mindskip.xzs.domain.enums.ExamPaperAnswerStatusEnum.Going.getCode());
                examPaperAnswerService.insertByFilter(examPaperAnswer);
            }
        }
        
        ExamPaperSubmitVM vm = new ExamPaperSubmitVM();
        vm.setId(examPaperAnswer.getId()); // Result answer ID
        vm.setDoTime(examPaperAnswer.getDoTime());
        vm.setCheatCount(examPaperAnswer.getCheatCount());
        vm.setStartTime(examPaperAnswer.getCreateTime().getTime());
        vm.setSuggestTime(examPaper.getSuggestTime());
        return RestResponse.ok(vm);
    }

    @RequestMapping(value = "/stateSync", method = RequestMethod.POST)
    public RestResponse<String> stateSync(@RequestBody ExamPaperSubmitVM model) {
        examPaperAnswerService.stateSync(model);
        return RestResponse.ok("success");
    }


    @RequestMapping(value = "/edit", method = RequestMethod.POST)
    public RestResponse<String> edit(@RequestBody @Valid ExamPaperSubmitVM examPaperSubmitVM) {
        boolean notJudge = examPaperSubmitVM.getAnswerItems().stream().anyMatch(i -> i.getDoRight() == null && i.getScore() == null);
        if (notJudge) {
            return RestResponse.fail(2, "有未批改题目");
        }

        ExamPaperAnswer examPaperAnswer = examPaperAnswerService.selectById(examPaperSubmitVM.getId());

        // 考试试卷只能由教师批改
        if (com.mindskip.xzs.domain.enums.ExamPaperTypeEnum.Task.getCode() == examPaperAnswer.getPaperType()) {
            return RestResponse.fail(4, "考试试卷只能由教师批改");
        }

        ExamPaperAnswerStatusEnum examPaperAnswerStatusEnum = ExamPaperAnswerStatusEnum.fromCode(examPaperAnswer.getStatus());
        if (examPaperAnswerStatusEnum == ExamPaperAnswerStatusEnum.Complete) {
            return RestResponse.fail(3, "试卷已完成");
        }
        String score = examPaperAnswerService.judge(examPaperSubmitVM);
        User user = getCurrentUser();
        UserEventLog userEventLog = new UserEventLog(user.getId(), user.getUserName(), user.getRealName(), new Date());
        String content = user.getUserName() + " 批改试卷：" + examPaperAnswer.getPaperName() + " 得分：" + score;
        userEventLog.setContent(content);
        eventPublisher.publishEvent(new UserEvent(userEventLog));
        return RestResponse.ok(score);
    }

    @RequestMapping(value = "/read/{id}", method = RequestMethod.POST)
    public RestResponse<ExamPaperReadVM> read(@PathVariable Integer id) {
        ExamPaperAnswer examPaperAnswer = examPaperAnswerService.selectById(id);
        ExamPaperReadVM vm = new ExamPaperReadVM();
        ExamPaperEditRequestVM paper = examPaperService.examPaperToVM(examPaperAnswer.getExamPaperId());
        ExamPaperSubmitVM answer = examPaperAnswerService.examPaperAnswerToVM(examPaperAnswer.getId());
        vm.setPaper(paper);
        vm.setAnswer(answer);
        return RestResponse.ok(vm);
    }


}
