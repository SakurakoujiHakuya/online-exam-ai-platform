package com.mindskip.xzs.service.impl;

import com.mindskip.xzs.domain.other.KeyValue;
import com.mindskip.xzs.domain.ExamPaper;
import com.mindskip.xzs.domain.ExamPaperQuestionCustomerAnswer;
import com.mindskip.xzs.domain.Question;
import com.mindskip.xzs.domain.QuestionFeedback;
import com.mindskip.xzs.domain.QuestionRevisionLog;
import com.mindskip.xzs.domain.QuestionSolutionContribution;
import com.mindskip.xzs.domain.TextContent;
import com.mindskip.xzs.domain.User;
import com.mindskip.xzs.domain.exam.ExamPaperTitleItemObject;
import com.mindskip.xzs.domain.enums.QuestionStatusEnum;
import com.mindskip.xzs.domain.enums.QuestionTypeEnum;
import com.mindskip.xzs.domain.question.QuestionItemObject;
import com.mindskip.xzs.domain.question.QuestionObject;
import com.mindskip.xzs.repository.ExamPaperMapper;
import com.mindskip.xzs.repository.ExamPaperQuestionCustomerAnswerMapper;
import com.mindskip.xzs.repository.QuestionFeedbackMapper;
import com.mindskip.xzs.repository.QuestionMapper;
import com.mindskip.xzs.repository.QuestionRevisionLogMapper;
import com.mindskip.xzs.repository.QuestionSolutionContributionMapper;
import com.mindskip.xzs.service.QuestionService;
import com.mindskip.xzs.service.SubjectService;
import com.mindskip.xzs.service.TagService;
import com.mindskip.xzs.service.TextContentService;
import com.mindskip.xzs.service.UserService;
import com.mindskip.xzs.utility.*;
import com.mindskip.xzs.viewmodel.admin.exam.QuestionStatsVM;
import com.mindskip.xzs.viewmodel.admin.exam.QuestionStatsFeedbackVM;
import com.mindskip.xzs.viewmodel.admin.exam.QuestionStatsRevisionVM;
import com.mindskip.xzs.viewmodel.admin.exam.QuestionStatsSolutionVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionAnswerStatVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionEditItemVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionEditRequestVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionPageRequestVM;
import com.mindskip.xzs.viewmodel.student.question.answer.QuestionPageStudentRequestVM;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class QuestionServiceImpl extends BaseServiceImpl<Question> implements QuestionService {

    protected final static ModelMapper modelMapper = ModelMapperSingle.Instance();
    private final QuestionMapper questionMapper;
    private final ExamPaperMapper examPaperMapper;
    private final TextContentService textContentService;
    private final SubjectService subjectService;
    private final ExamPaperQuestionCustomerAnswerMapper examPaperQuestionCustomerAnswerMapper;
    private final TagService tagService;
    private final QuestionFeedbackMapper questionFeedbackMapper;
    private final QuestionSolutionContributionMapper questionSolutionContributionMapper;
    private final QuestionRevisionLogMapper questionRevisionLogMapper;
    private final UserService userService;

    @Autowired
    public QuestionServiceImpl(QuestionMapper questionMapper,
                               ExamPaperMapper examPaperMapper,
                               TextContentService textContentService,
                               SubjectService subjectService,
                               ExamPaperQuestionCustomerAnswerMapper examPaperQuestionCustomerAnswerMapper,
                               TagService tagService,
                               QuestionFeedbackMapper questionFeedbackMapper,
                               QuestionSolutionContributionMapper questionSolutionContributionMapper,
                               QuestionRevisionLogMapper questionRevisionLogMapper,
                               UserService userService) {
        super(questionMapper);
        this.textContentService = textContentService;
        this.questionMapper = questionMapper;
        this.examPaperMapper = examPaperMapper;
        this.subjectService = subjectService;
        this.examPaperQuestionCustomerAnswerMapper = examPaperQuestionCustomerAnswerMapper;
        this.tagService = tagService;
        this.questionFeedbackMapper = questionFeedbackMapper;
        this.questionSolutionContributionMapper = questionSolutionContributionMapper;
        this.questionRevisionLogMapper = questionRevisionLogMapper;
        this.userService = userService;
    }

    @Override
    public PageInfo<Question> page(QuestionPageRequestVM requestVM) {
        return PageHelper.startPage(requestVM.getPageIndex(), requestVM.getPageSize(), "id desc").doSelectPageInfo(() ->
                questionMapper.page(requestVM)
        );
    }

    @Override
    public PageInfo<Question> studentPage(QuestionPageStudentRequestVM requestVM) {
        return PageHelper.startPage(requestVM.getPageIndex(), requestVM.getPageSize(), "id desc").doSelectPageInfo(() ->
                questionMapper.studentPage(requestVM)
        );
    }

    @Override
    public List<Question> studentList(QuestionPageStudentRequestVM requestVM) {
        return questionMapper.studentPage(requestVM);
    }


    @Override
    @Transactional
    public Question insertFullQuestion(QuestionEditRequestVM model, Integer userId) {
        Date now = new Date();
        Integer userGroupId = subjectService.userGroupIdBySubjectId(model.getSubjectId());
        List<Integer> tagIds = resolveQuestionTagIds(model, userId);

        //题干、解析、选项等 插入
        TextContent infoTextContent = new TextContent();
        infoTextContent.setCreateTime(now);
        setQuestionInfoFromVM(infoTextContent, model);
        textContentService.insertByFilter(infoTextContent);

        Question question = new Question();
        question.setSubjectId(model.getSubjectId());
        question.setUserGroupId(userGroupId);
        question.setCreateTime(now);
        question.setQuestionType(model.getQuestionType());
        question.setStatus(QuestionStatusEnum.OK.getCode());
        question.setCorrectFromVM(model.getCorrect(), model.getCorrectArray());
        question.setScore(ExamUtil.scoreFromVM(model.getScore()));
        question.setDifficult(model.getDifficult());
        question.setInfoTextContentId(infoTextContent.getId());
        question.setCreateUser(userId);
        question.setDeleted(false);
        question.setIsAi(model.getIsAi());
        questionMapper.insertSelective(question);
        tagService.syncQuestionTags(question.getId(), tagIds);
        return question;
    }

    @Override
    @Transactional
    public Question updateFullQuestion(QuestionEditRequestVM model, Integer userId) {
        Integer userGroupId = subjectService.userGroupIdBySubjectId(model.getSubjectId());
        List<Integer> tagIds = resolveQuestionTagIds(model, userId);
        Question question = questionMapper.selectByPrimaryKey(model.getId());
        question.setSubjectId(model.getSubjectId());
        question.setUserGroupId(userGroupId);
        question.setScore(ExamUtil.scoreFromVM(model.getScore()));
        question.setDifficult(model.getDifficult());
        question.setCorrectFromVM(model.getCorrect(), model.getCorrectArray());
        if (model.getIsAi() != null) {
            question.setIsAi(model.getIsAi());
        }
        questionMapper.updateByPrimaryKeySelective(question);

        //题干、解析、选项等 更新
        TextContent infoTextContent = textContentService.selectById(question.getInfoTextContentId());
        setQuestionInfoFromVM(infoTextContent, model);
        textContentService.updateByIdFilter(infoTextContent);
        tagService.syncQuestionTags(question.getId(), tagIds);

        return question;
    }

    @Override
    public QuestionEditRequestVM getQuestionEditRequestVM(Integer questionId) {
        //题目映射
        Question question = questionMapper.selectByPrimaryKey(questionId);
        return getQuestionEditRequestVM(question);
    }

    @Override
    public QuestionEditRequestVM getQuestionEditRequestVM(Question question) {
        //题目映射
        TextContent questionInfoTextContent = textContentService.selectById(question.getInfoTextContentId());
        QuestionObject questionObject = JsonUtil.toJsonObject(questionInfoTextContent.getContent(), QuestionObject.class);
        QuestionEditRequestVM questionEditRequestVM = modelMapper.map(question, QuestionEditRequestVM.class);
        questionEditRequestVM.setTitle(questionObject.getTitleContent());

        //答案
        QuestionTypeEnum questionTypeEnum = QuestionTypeEnum.fromCode(question.getQuestionType());
        switch (questionTypeEnum) {
            case SingleChoice:
            case TrueFalse:
                questionEditRequestVM.setCorrect(question.getCorrect());
                break;
            case MultipleChoice:
                questionEditRequestVM.setCorrectArray(ExamUtil.contentToArray(question.getCorrect()));
                break;
            case GapFilling:
                List<String> correctContent = questionObject.getQuestionItemObjects().stream().map(d -> d.getContent()).collect(Collectors.toList());
                questionEditRequestVM.setCorrectArray(correctContent);
                break;
            case ShortAnswer:
                questionEditRequestVM.setCorrect(questionObject.getCorrect());
                break;
            default:
                break;
        }
        questionEditRequestVM.setScore(ExamUtil.scoreToVM(question.getScore()));
        questionEditRequestVM.setAnalyze(questionObject.getAnalyze());


        //题目项映射
        List<QuestionEditItemVM> editItems = questionObject.getQuestionItemObjects().stream().map(o -> {
            QuestionEditItemVM questionEditItemVM = modelMapper.map(o, QuestionEditItemVM.class);
            if (o.getScore() != null) {
                questionEditItemVM.setScore(ExamUtil.scoreToVM(o.getScore()));
            }
            return questionEditItemVM;
        }).collect(Collectors.toList());
        questionEditRequestVM.setItems(editItems);
        Integer hiddenTagId = tagService.getTagIdByName(TagService.PRACTICE_HIDDEN_TAG_NAME);
        List<Integer> questionTagIds = tagService.getQuestionTagIds(question.getId());
        List<String> questionTagNames = tagService.getQuestionTagNames(question.getId());
        boolean hideInPracticeCenter = questionTagNames.stream()
                .anyMatch(TagService.PRACTICE_HIDDEN_TAG_NAME::equals);
        questionEditRequestVM.setHideInPracticeCenter(hideInPracticeCenter);
        questionEditRequestVM.setTagIds(filterHiddenTagIds(questionTagIds, hiddenTagId));
        questionEditRequestVM.setTagNames(filterHiddenTagNames(questionTagNames));
        return questionEditRequestVM;
    }

    public void setQuestionInfoFromVM(TextContent infoTextContent, QuestionEditRequestVM model) {
        List<QuestionItemObject> itemObjects = model.getItems().stream().map(i ->
                {
                    QuestionItemObject item = new QuestionItemObject();
                    item.setPrefix(i.getPrefix());
                    item.setContent(i.getContent());
                    item.setItemUuid(i.getItemUuid());
                    item.setScore(ExamUtil.scoreFromVM(i.getScore()));
                    return item;
                }
        ).collect(Collectors.toList());
        QuestionObject questionObject = new QuestionObject();
        questionObject.setQuestionItemObjects(itemObjects);
        questionObject.setAnalyze(model.getAnalyze());
        questionObject.setTitleContent(model.getTitle());
        questionObject.setCorrect(model.getCorrect());
        infoTextContent.setContent(JsonUtil.toJsonStr(questionObject));
    }

    @Override
    public Integer selectAllCount() {
        return questionMapper.selectAllCount();
    }

    @Override
    public List<Integer> selectMothCount() {
        Date startTime = DateTimeUtil.getMonthStartDay();
        Date endTime = DateTimeUtil.getMonthEndDay();
        List<String> mothStartToNowFormat = DateTimeUtil.MothStartToNowFormat();
        List<KeyValue> mouthCount = questionMapper.selectCountByDate(startTime, endTime);
        return mothStartToNowFormat.stream().map(md -> {
            KeyValue keyValue = mouthCount.stream().filter(kv -> kv.getName().equals(md)).findAny().orElse(null);
            return null == keyValue ? 0 : keyValue.getValue();
        }).collect(Collectors.toList());
    }


    @Override
    public QuestionStatsVM statistics(Integer id) {
        Question question = questionMapper.selectByPrimaryKey(id);
        if (question == null) {
            return null;
        }
        List<ExamPaperQuestionCustomerAnswer> answers = examPaperQuestionCustomerAnswerMapper.selectListByQuestionId(id);
        List<QuestionFeedback> feedbacks = questionFeedbackMapper.selectByQuestionId(id);
        List<QuestionSolutionContribution> adoptedSolutions = questionSolutionContributionMapper.selectAdoptedByQuestionId(id);
        List<QuestionRevisionLog> revisionLogs = questionRevisionLogMapper.selectByQuestionId(id);

        QuestionStatsVM vm = new QuestionStatsVM();
        vm.setId(id);
        vm.setQuestionType(question.getQuestionType());
        vm.setHideInPracticeCenter(tagService.getQuestionTagNames(id).stream()
                .anyMatch(TagService.PRACTICE_HIDDEN_TAG_NAME::equals));
        vm.setFeedbackCount(feedbacks == null ? 0 : feedbacks.size());
        int adoptedFeedbackCount = feedbacks == null ? 0 : (int) feedbacks.stream()
                .filter(Objects::nonNull)
                .filter(item -> Objects.equals(item.getStatus(), 2) || Objects.equals(item.getStatus(), 4))
                .count();
        vm.setFeedbackAdoptRate(feedbacks == null || feedbacks.isEmpty()
                ? "0.0%"
                : String.format("%.1f%%", (double) adoptedFeedbackCount / feedbacks.size() * 100));
        vm.setAdoptedSolutionCount(adoptedSolutions == null ? 0 : adoptedSolutions.size());
        vm.setRevisionCount(revisionLogs == null ? 0 : revisionLogs.size());
        vm.setFeedbackTypeDistribution(buildFeedbackTypeDistribution(feedbacks));
        vm.setRecentFeedbacks(buildRecentFeedbacks(feedbacks));
        vm.setAdoptedSolutions(buildAdoptedSolutions(adoptedSolutions));
        vm.setRevisionLogs(buildRevisionLogs(revisionLogs));

        if (answers == null || answers.isEmpty()) {
            vm.setTotalCount(0);
            return vm;
        }

        vm.setTotalCount(answers.size());
        long correctCount = answers.stream().filter(Objects::nonNull).filter(a -> a.getDoRight() != null && a.getDoRight()).count();
        vm.setCorrectRate(String.format("%.1f%%", (double) correctCount / answers.size() * 100));
        double avgDoTime = answers.stream().filter(Objects::nonNull).mapToInt(a -> a.getDoTime() == null ? 0 : a.getDoTime()).average().orElse(0);
        vm.setAvgDoTime(String.format("%.1f", avgDoTime));

        // Answer Distribution (for choices)
        QuestionTypeEnum typeEnum = QuestionTypeEnum.fromCode(question.getQuestionType());
        if (typeEnum == QuestionTypeEnum.SingleChoice || typeEnum == QuestionTypeEnum.MultipleChoice || typeEnum == QuestionTypeEnum.TrueFalse) {
            List<KeyValue> distribution = answers.stream()
                    .filter(Objects::nonNull)
                    .filter(a -> a.getAnswer() != null)
                    .collect(Collectors.groupingBy(ExamPaperQuestionCustomerAnswer::getAnswer, Collectors.counting()))
                    .entrySet().stream()
                    .map(e -> new KeyValue(e.getKey(), e.getValue().intValue()))
                    .collect(Collectors.toList());
            vm.setAnswerDistribution(distribution);
        }

        // Time Distribution
        List<KeyValue> timeDistribution = Arrays.asList(
                new KeyValue("<10s", (int) answers.stream().filter(Objects::nonNull).filter(a -> (a.getDoTime() != null && a.getDoTime() < 10)).count()),
                new KeyValue("10s-30s", (int) answers.stream().filter(Objects::nonNull).filter(a -> (a.getDoTime() != null && a.getDoTime() >= 10 && a.getDoTime() < 30)).count()),
                new KeyValue("30s-60s", (int) answers.stream().filter(Objects::nonNull).filter(a -> (a.getDoTime() != null && a.getDoTime() >= 30 && a.getDoTime() < 60)).count()),
                new KeyValue(">60s", (int) answers.stream().filter(Objects::nonNull).filter(a -> (a.getDoTime() != null && a.getDoTime() >= 60)).count())
        );
        vm.setTimeDistribution(timeDistribution);

        return vm;
    }

    private List<KeyValue> buildFeedbackTypeDistribution(List<QuestionFeedback> feedbacks) {
        if (feedbacks == null || feedbacks.isEmpty()) {
            return Collections.emptyList();
        }
        return feedbacks.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(
                        item -> item.getFeedbackType() == null ? "未分类" : item.getFeedbackType(),
                        LinkedHashMap::new,
                        Collectors.counting()))
                .entrySet()
                .stream()
                .map(entry -> new KeyValue(entry.getKey(), entry.getValue().intValue()))
                .collect(Collectors.toList());
    }

    private List<QuestionStatsFeedbackVM> buildRecentFeedbacks(List<QuestionFeedback> feedbacks) {
        if (feedbacks == null || feedbacks.isEmpty()) {
            return Collections.emptyList();
        }
        return feedbacks.stream()
                .filter(Objects::nonNull)
                .sorted((left, right) -> {
                    Date leftTime = left.getCreateTime();
                    Date rightTime = right.getCreateTime();
                    if (leftTime == null && rightTime == null) {
                        return 0;
                    }
                    if (leftTime == null) {
                        return 1;
                    }
                    if (rightTime == null) {
                        return -1;
                    }
                    return rightTime.compareTo(leftTime);
                })
                .limit(8)
                .map(item -> {
                    QuestionStatsFeedbackVM feedbackVM = new QuestionStatsFeedbackVM();
                    feedbackVM.setId(item.getId());
                    feedbackVM.setStudentName(resolveUserName(item.getStudentId()));
                    feedbackVM.setFeedbackType(item.getFeedbackType());
                    feedbackVM.setFeedbackContent(item.getFeedbackContent());
                    feedbackVM.setStatusName(feedbackStatusName(item.getStatus()));
                    feedbackVM.setAiSummary(item.getAiSummary());
                    feedbackVM.setReviewComment(item.getReviewComment());
                    feedbackVM.setCreateTime(DateTimeUtil.dateFormat(item.getCreateTime()));
                    return feedbackVM;
                })
                .collect(Collectors.toList());
    }

    private List<QuestionStatsSolutionVM> buildAdoptedSolutions(List<QuestionSolutionContribution> adoptedSolutions) {
        if (adoptedSolutions == null || adoptedSolutions.isEmpty()) {
            return Collections.emptyList();
        }
        return adoptedSolutions.stream()
                .filter(Objects::nonNull)
                .limit(6)
                .map(item -> {
                    QuestionStatsSolutionVM solutionVM = new QuestionStatsSolutionVM();
                    solutionVM.setId(item.getId());
                    solutionVM.setStudentName(resolveUserName(item.getStudentId()));
                    solutionVM.setContent(item.getContent());
                    solutionVM.setQualityScore(item.getQualityScore());
                    solutionVM.setAiSummary(item.getAiSummary());
                    solutionVM.setReviewComment(item.getReviewComment());
                    solutionVM.setCreateTime(DateTimeUtil.dateFormat(item.getCreateTime()));
                    return solutionVM;
                })
                .collect(Collectors.toList());
    }

    private List<QuestionStatsRevisionVM> buildRevisionLogs(List<QuestionRevisionLog> revisionLogs) {
        if (revisionLogs == null || revisionLogs.isEmpty()) {
            return Collections.emptyList();
        }
        return revisionLogs.stream()
                .filter(Objects::nonNull)
                .limit(8)
                .map(item -> {
                    QuestionStatsRevisionVM revisionVM = new QuestionStatsRevisionVM();
                    revisionVM.setId(item.getId());
                    revisionVM.setRevisionType(revisionTypeName(item.getRevisionType()));
                    revisionVM.setReviewerName(resolveUserName(item.getReviewerId()));
                    revisionVM.setChangeSummary(buildRevisionSummary(item));
                    revisionVM.setCreateTime(DateTimeUtil.dateFormat(item.getCreateTime()));
                    return revisionVM;
                })
                .collect(Collectors.toList());
    }

    private String resolveUserName(Integer userId) {
        if (userId == null) {
            return "系统";
        }
        User user = userService.selectById(userId);
        if (user == null) {
            return "未知用户";
        }
        String realName = user.getRealName();
        if (realName != null && !realName.trim().isEmpty()) {
            return realName;
        }
        return user.getUserName();
    }

    private String feedbackStatusName(Integer status) {
        if (Objects.equals(status, 1)) {
            return "待审核";
        }
        if (Objects.equals(status, 2)) {
            return "已采纳";
        }
        if (Objects.equals(status, 3)) {
            return "已驳回";
        }
        if (Objects.equals(status, 4)) {
            return "已合并";
        }
        return "未知";
    }

    private String revisionTypeName(String revisionType) {
        if ("tag_update".equals(revisionType)) {
            return "标签修订";
        }
        if ("analyze_update".equals(revisionType)) {
            return "解析修订";
        }
        if ("title_update".equals(revisionType)) {
            return "题干修订";
        }
        if ("student_solution_adopted".equals(revisionType)) {
            return "采纳学生思路";
        }
        return "题目修订";
    }

    private String buildRevisionSummary(QuestionRevisionLog revisionLog) {
        String afterSnapshot = revisionLog.getAfterSnapshot();
        if (afterSnapshot == null || afterSnapshot.trim().isEmpty()) {
            return revisionTypeName(revisionLog.getRevisionType());
        }
        String summary = HtmlUtil.clear(afterSnapshot).replaceAll("\\s+", " ").trim();
        if (summary.length() <= 80) {
            return summary;
        }
        return summary.substring(0, 80) + "...";
    }

    @Override
    public Map<Integer, QuestionAnswerStatVM> mapQuestionAnswerStats(List<Integer> questionIds) {
        if (questionIds == null || questionIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return examPaperQuestionCustomerAnswerMapper.selectQuestionAnswerStats(questionIds).stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(QuestionAnswerStatVM::getQuestionId, stat -> stat));
    }

    @Override
    public Question getAccessibleQuestion(Integer id, Integer userGroupId) {
        Question question = questionMapper.selectByPrimaryKey(id);
        if (question == null) {
            return null;
        }
        return Objects.equals(question.getUserGroupId(), userGroupId) ? question : null;
    }

    @Override
    public Question getPracticeCenterAccessibleQuestion(Integer id, Integer userGroupId) {
        Question question = getAccessibleQuestion(id, userGroupId);
        if (question == null) {
            return null;
        }
        boolean hideInPracticeCenter = tagService.getQuestionTagNames(question.getId()).stream()
                .anyMatch(TagService.PRACTICE_HIDDEN_TAG_NAME::equals);
        return hideInPracticeCenter ? null : question;
    }

    @Override
    public Integer countReferenceByUserGroup(Integer questionId, Integer userGroupId) {
        List<ExamPaper> papers = examPaperMapper.selectByUserGroupAndPaperTypes(userGroupId, Arrays.asList(
                1,
                6,
                7,
                8
        ));
        return (int) papers.stream()
                .filter(Objects::nonNull)
                .map(ExamPaper::getFrameTextContentId)
                .filter(Objects::nonNull)
                .map(textContentService::selectById)
                .filter(Objects::nonNull)
                .flatMap(content -> {
                    List<ExamPaperTitleItemObject> titleItems = JsonUtil.toJsonListObject(content.getContent(), ExamPaperTitleItemObject.class);
                    if (titleItems == null) {
                        return Stream.empty();
                    }
                    return titleItems.stream()
                            .filter(Objects::nonNull)
                            .flatMap(titleItem -> titleItem.getQuestionItems() == null ? Stream.empty() : titleItem.getQuestionItems().stream())
                            .filter(Objects::nonNull)
                            .map(item -> item.getId());
                })
                .filter(questionId::equals)
                .mapToInt(item -> 1)
                .sum();
    }

    private List<Integer> resolveQuestionTagIds(QuestionEditRequestVM model, Integer userId) {
        Integer hiddenTagId = tagService.getTagIdByName(TagService.PRACTICE_HIDDEN_TAG_NAME);
        List<Integer> tagIds = filterHiddenTagIds(model.getTagIds(), hiddenTagId);
        List<String> newTagNames = filterHiddenTagNames(model.getNewTagNames());
        if (Boolean.TRUE.equals(model.getHideInPracticeCenter())) {
            newTagNames = new ArrayList<>(newTagNames);
            newTagNames.add(TagService.PRACTICE_HIDDEN_TAG_NAME);
        }
        return tagService.resolveTagIds(tagIds, newTagNames, userId);
    }

    private List<Integer> filterHiddenTagIds(List<Integer> tagIds, Integer hiddenTagId) {
        if (tagIds == null || tagIds.isEmpty()) {
            return Collections.emptyList();
        }
        return tagIds.stream()
                .filter(Objects::nonNull)
                .filter(tagId -> !Objects.equals(tagId, hiddenTagId))
                .distinct()
                .collect(Collectors.toList());
    }

    private List<String> filterHiddenTagNames(List<String> tagNames) {
        if (tagNames == null || tagNames.isEmpty()) {
            return Collections.emptyList();
        }
        return tagNames.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .filter(name -> !TagService.PRACTICE_HIDDEN_TAG_NAME.equals(name))
                .distinct()
                .collect(Collectors.toList());
    }
}
