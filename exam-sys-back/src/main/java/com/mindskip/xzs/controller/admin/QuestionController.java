package com.mindskip.xzs.controller.admin;

import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.base.SystemCode;
import com.mindskip.xzs.domain.Question;
import com.mindskip.xzs.domain.TextContent;
import com.mindskip.xzs.domain.enums.QuestionTypeEnum;
import com.mindskip.xzs.domain.question.QuestionObject;
import com.mindskip.xzs.service.QuestionService;
import com.mindskip.xzs.service.TagService;
import com.mindskip.xzs.service.TextContentService;
import com.mindskip.xzs.utility.*;
import com.mindskip.xzs.viewmodel.admin.exam.QuestionStatsVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionAnswerStatVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionEditRequestVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionPageRequestVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionResponseVM;
import com.github.pagehelper.PageInfo;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController("AdminQuestionController")
@RequestMapping(value = "/api/admin/question")
public class QuestionController extends BaseApiController {

    private final QuestionService questionService;
    private final TextContentService textContentService;
    private final TagService tagService;

    @Autowired
    public QuestionController(QuestionService questionService, TextContentService textContentService, TagService tagService) {
        this.questionService = questionService;
        this.textContentService = textContentService;
        this.tagService = tagService;
    }

    @RequestMapping(value = "/page", method = RequestMethod.POST)
    public RestResponse<PageInfo<QuestionResponseVM>> pageList(@RequestBody QuestionPageRequestVM model) {
        model.setPracticeHiddenTagName(TagService.PRACTICE_HIDDEN_TAG_NAME);
        PageInfo<Question> pageInfo = questionService.page(model);
        PageInfo<QuestionResponseVM> page = PageInfoHelper.copyMap(pageInfo, q -> {
            QuestionResponseVM vm = modelMapper.map(q, QuestionResponseVM.class);
            vm.setCreateTime(DateTimeUtil.dateFormat(q.getCreateTime()));
            vm.setScore(ExamUtil.scoreToVM(q.getScore()));
            TextContent textContent = textContentService.selectById(q.getInfoTextContentId());
            QuestionObject questionObject = JsonUtil.toJsonObject(textContent.getContent(), QuestionObject.class);
            String clearHtml = HtmlUtil.clear(questionObject.getTitleContent());
            vm.setShortTitle(clearHtml);
            return vm;
        });
        java.util.Map<Integer, java.util.List<String>> tagNameMap = tagService.mapQuestionTagNames(page.getList().stream().map(QuestionResponseVM::getId).collect(java.util.stream.Collectors.toList()));
        java.util.Map<Integer, QuestionAnswerStatVM> answerStatMap = questionService.mapQuestionAnswerStats(page.getList().stream().map(QuestionResponseVM::getId).collect(java.util.stream.Collectors.toList()));
        page.getList().forEach(vm -> {
            java.util.List<String> tagNames = tagNameMap.getOrDefault(vm.getId(), java.util.Collections.emptyList());
            vm.setHideInPracticeCenter(tagNames.contains(TagService.PRACTICE_HIDDEN_TAG_NAME));
            vm.setTagNames(tagNames.stream()
                    .filter(tagName -> !TagService.PRACTICE_HIDDEN_TAG_NAME.equals(tagName))
                    .collect(java.util.stream.Collectors.toList()));
            QuestionAnswerStatVM stat = answerStatMap.get(vm.getId());
            vm.setAnswerCount(stat == null ? 0 : stat.getAnswerCount());
            vm.setCorrectRate(stat == null || stat.getCorrectRate() == null ? "0.0%" : String.format("%.1f%%", stat.getCorrectRate()));
        });
        return RestResponse.ok(page);
    }

    @RequestMapping(value = "/edit", method = RequestMethod.POST)
    public RestResponse<String> edit(@RequestBody @Valid QuestionEditRequestVM model) {
        RestResponse<String> validQuestionEditRequestResult = validQuestionEditRequestVM(model);
        if (validQuestionEditRequestResult.getCode() != SystemCode.OK.getCode()) {
            return validQuestionEditRequestResult;
        }

        if (null == model.getId()) {
            questionService.insertFullQuestion(model, getCurrentUser().getId());
        } else {
            questionService.updateFullQuestion(model, getCurrentUser().getId());
        }

        return RestResponse.ok();
    }

    @RequestMapping(value = "/select/{id}", method = RequestMethod.POST)
    public RestResponse<QuestionEditRequestVM> select(@PathVariable Integer id) {
        QuestionEditRequestVM newVM = questionService.getQuestionEditRequestVM(id);
        return RestResponse.ok(newVM);
    }


    @RequestMapping(value = "/delete/{id}", method = RequestMethod.POST)
    public RestResponse<String> delete(@PathVariable Integer id) {
        Question question = questionService.selectById(id);
        question.setDeleted(true);
        questionService.updateByIdFilter(question);
        return RestResponse.ok();
    }

    @RequestMapping(value = "/stats/{id}", method = RequestMethod.POST)
    public RestResponse<QuestionStatsVM> stats(@PathVariable Integer id) {
        QuestionStatsVM vm = questionService.statistics(id);
        return RestResponse.ok(vm);
    }

    private RestResponse<String> validQuestionEditRequestVM(QuestionEditRequestVM model) {
        int qType = model.getQuestionType().intValue();
        boolean requireCorrect = qType == QuestionTypeEnum.SingleChoice.getCode() || qType == QuestionTypeEnum.TrueFalse.getCode();
        if (requireCorrect) {
            if (StringUtils.isBlank(model.getCorrect())) {
                String errorMsg = ErrorUtil.parameterErrorFormat("correct", "不能为空");
                return new RestResponse<>(SystemCode.ParameterValidError.getCode(), errorMsg);
            }
        }

        if (qType == QuestionTypeEnum.GapFilling.getCode()) {
            Integer fillSumScore = model.getItems().stream().mapToInt(d -> ExamUtil.scoreFromVM(d.getScore())).sum();
            Integer questionScore = ExamUtil.scoreFromVM(model.getScore());
            if (!fillSumScore.equals(questionScore)) {
                String errorMsg = ErrorUtil.parameterErrorFormat("score", "空分数和与题目总分不相等");
                return new RestResponse<>(SystemCode.ParameterValidError.getCode(), errorMsg);
            }
        }
        return RestResponse.ok();
    }

    @RequestMapping(value = "/adopt/{id}", method = RequestMethod.POST)
    public RestResponse<String> adopt(@PathVariable Integer id) {
        Question question = questionService.selectById(id);
        if (question == null) {
            return RestResponse.fail(2, "题目不存在");
        }
        question.setCreateUser(getCurrentUser().getId());
        question.setIsAi(0);
        questionService.updateByIdFilter(question);
        return RestResponse.ok();
    }
}
