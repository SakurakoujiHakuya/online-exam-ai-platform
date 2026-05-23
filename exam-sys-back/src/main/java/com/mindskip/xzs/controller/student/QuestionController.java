package com.mindskip.xzs.controller.student;

import com.github.pagehelper.PageInfo;
import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.domain.ExamPaper;
import com.mindskip.xzs.domain.Question;
import com.mindskip.xzs.domain.Subject;
import com.mindskip.xzs.domain.User;
import com.mindskip.xzs.domain.enums.ExamPaperTypeEnum;
import com.mindskip.xzs.service.ExamPaperService;
import com.mindskip.xzs.service.QuestionService;
import com.mindskip.xzs.service.SubjectService;
import com.mindskip.xzs.service.TagService;
import com.mindskip.xzs.utility.DateTimeUtil;
import com.mindskip.xzs.utility.PageInfoHelper;
import com.mindskip.xzs.viewmodel.admin.exam.ExamPaperEditRequestVM;
import com.mindskip.xzs.viewmodel.admin.exam.ExamPaperTitleItemVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionAnswerStatVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionEditRequestVM;
import com.mindskip.xzs.viewmodel.student.question.QuestionPracticeBuildVM;
import com.mindskip.xzs.viewmodel.student.question.answer.QuestionPageStudentRequestVM;
import com.mindskip.xzs.viewmodel.student.question.answer.QuestionPageStudentResponseVM;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController("StudentQuestionController")
@RequestMapping(value = "/api/student/question")
public class QuestionController extends BaseApiController {

    private final QuestionService questionService;
    private final ExamPaperService examPaperService;
    private final SubjectService subjectService;
    private final TagService tagService;

    @Autowired
    public QuestionController(QuestionService questionService,
                              ExamPaperService examPaperService,
                              SubjectService subjectService,
                              TagService tagService) {
        this.questionService = questionService;
        this.examPaperService = examPaperService;
        this.subjectService = subjectService;
        this.tagService = tagService;
    }

    @RequestMapping(value = "/pageList", method = RequestMethod.POST)
    public RestResponse<PageInfo<QuestionPageStudentResponseVM>> pageList(@RequestBody @Valid QuestionPageStudentRequestVM model) {
        User user = getCurrentUser();
        applyStudentScope(model, user);
        PageInfo<Question> pageInfo = questionService.studentPage(model);
        return RestResponse.ok(buildQuestionPage(pageInfo, user));
    }

    @RequestMapping(value = "/select/{id}", method = RequestMethod.POST)
    public RestResponse<QuestionEditRequestVM> select(@PathVariable Integer id) {
        User user = getCurrentUser();
        Question question = questionService.getPracticeCenterAccessibleQuestion(id, user.getUserGroupId());
        if (question == null) {
            return RestResponse.fail(2, "无权查看该题目");
        }
        return RestResponse.ok(questionService.getQuestionEditRequestVM(question));
    }

    @RequestMapping(value = "/practice/build", method = RequestMethod.POST)
    public RestResponse<Integer> buildPracticePaper(@RequestBody @Valid QuestionPracticeBuildVM model) {
        User user = getCurrentUser();
        if (CollectionUtils.isEmpty(model.getQuestionIds())) {
            return RestResponse.fail(2, "请至少选择一道题目");
        }

        List<Question> questions = model.getQuestionIds().stream()
                .distinct()
                .map(id -> questionService.getPracticeCenterAccessibleQuestion(id, user.getUserGroupId()))
                .collect(Collectors.toList());
        if (questions.stream().anyMatch(Objects::isNull)) {
            return RestResponse.fail(3, "所选题目中包含无权限内容");
        }

        return RestResponse.ok(buildPracticePaperFromQuestions(user, questions).getId());
    }

    @RequestMapping(value = "/practice/build-by-query", method = RequestMethod.POST)
    public RestResponse<Integer> buildPracticePaperByQuery(@RequestBody @Valid QuestionPageStudentRequestVM model) {
        User user = getCurrentUser();
        applyStudentScope(model, user);

        List<Question> questions = questionService.studentList(model).stream()
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(Question::getId).reversed())
                .collect(Collectors.toList());
        if (CollectionUtils.isEmpty(questions)) {
            return RestResponse.fail(2, "当前筛选条件下没有可生成练习卷的题目");
        }

        int questionCount = model.getQuestionCount() == null || model.getQuestionCount() <= 0
                ? questions.size()
                : Math.min(model.getQuestionCount(), questions.size());

        return RestResponse.ok(buildPracticePaperFromQuestions(user, questions.subList(0, questionCount)).getId());
    }

    private void applyStudentScope(QuestionPageStudentRequestVM model, User user) {
        model.setCreateUser(user.getId());
        model.setUserGroupId(user.getUserGroupId());
        model.setExcludeTagName(TagService.PRACTICE_HIDDEN_TAG_NAME);
    }

    private PageInfo<QuestionPageStudentResponseVM> buildQuestionPage(PageInfo<Question> pageInfo, User user) {
        List<Integer> questionIds = pageInfo.getList().stream().map(Question::getId).collect(Collectors.toList());
        java.util.Map<Integer, List<String>> tagNameMap = tagService.mapQuestionTagNames(questionIds);
        java.util.Map<Integer, QuestionAnswerStatVM> answerStatMap = questionService.mapQuestionAnswerStats(questionIds);

        return PageInfoHelper.copyMap(pageInfo, question -> {
            QuestionEditRequestVM detail = questionService.getQuestionEditRequestVM(question);
            Subject subject = subjectService.selectById(question.getSubjectId());
            QuestionAnswerStatVM answerStat = answerStatMap.get(question.getId());

            QuestionPageStudentResponseVM vm = new QuestionPageStudentResponseVM();
            vm.setId(question.getId());
            vm.setQuestionType(question.getQuestionType());
            vm.setCreateTime(DateTimeUtil.dateFormat(question.getCreateTime()));
            vm.setSubjectName(subject == null ? null : subject.getName());
            vm.setTitle(detail.getTitle());
            vm.setShortTitle(buildShortTitle(detail.getTitle()));
            vm.setDifficult(question.getDifficult());
            vm.setTagNames(tagNameMap.getOrDefault(question.getId(), Collections.emptyList()));
            vm.setAnswerCount(answerStat == null ? 0 : answerStat.getAnswerCount());
            vm.setCorrectRate(answerStat == null || answerStat.getCorrectRate() == null ? "0.0%" : String.format("%.1f%%", answerStat.getCorrectRate()));
            vm.setReferencedCount(questionService.countReferenceByUserGroup(question.getId(), user.getUserGroupId()));
            return vm;
        });
    }

    private ExamPaper buildPracticePaperFromQuestions(User user, List<Question> questions) {
        List<Integer> subjectIds = questions.stream().map(Question::getSubjectId).distinct().collect(Collectors.toList());
        if (subjectIds.size() != 1) {
            throw new IllegalArgumentException("当前仅支持同一学科题目生成练习卷");
        }

        List<QuestionEditRequestVM> questionItems = questions.stream()
                .filter(Objects::nonNull)
                .distinct()
                .map(questionService::getQuestionEditRequestVM)
                .sorted(Comparator.comparing(QuestionEditRequestVM::getId))
                .collect(Collectors.toList());

        ExamPaperTitleItemVM titleItemVM = new ExamPaperTitleItemVM();
        titleItemVM.setName("自选题练习");
        titleItemVM.setQuestionItems(questionItems);

        ExamPaperEditRequestVM paperVM = new ExamPaperEditRequestVM();
        paperVM.setUserGroupId(user.getUserGroupId());
        paperVM.setSubjectId(subjectIds.get(0));
        paperVM.setPaperType(ExamPaperTypeEnum.CustomPractice.getCode());
        paperVM.setSuggestTime(Math.max(10, questionItems.size() * 3));
        paperVM.setName("自选题练习-" + DateTimeUtil.dateFormat(new Date(), "yyyyMMddHHmmss"));
        paperVM.setTitleItems(Collections.singletonList(titleItemVM));

        ExamPaper savedPaper = examPaperService.savePaperFromVM(paperVM, user);
        tagService.syncExamPaperTags(savedPaper.getId(),
                questionItems.stream()
                        .filter(Objects::nonNull)
                        .flatMap(item -> item.getTagIds() == null ? Stream.<Integer>empty() : item.getTagIds().stream())
                        .distinct()
                        .collect(Collectors.toList()));
        return savedPaper;
    }

    private String buildShortTitle(String title) {
        if (title == null) {
            return "";
        }
        String plain = title.replaceAll("<[^>]+>", "").replaceAll("\\s+", " ").trim();
        if (plain.length() <= 80) {
            return plain;
        }
        return plain.substring(0, 80) + "...";
    }
}
