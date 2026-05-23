package com.mindskip.xzs.service.impl;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.mindskip.xzs.domain.AiRecommendationRecord;
import com.mindskip.xzs.domain.ExamPaper;
import com.mindskip.xzs.domain.ExamPaperQuestionCustomerAnswer;
import com.mindskip.xzs.domain.Question;
import com.mindskip.xzs.domain.QuestionFeedback;
import com.mindskip.xzs.domain.QuestionRevisionLog;
import com.mindskip.xzs.domain.QuestionSolutionContribution;
import com.mindskip.xzs.domain.Subject;
import com.mindskip.xzs.domain.User;
import com.mindskip.xzs.domain.enums.ExamPaperTypeEnum;
import com.mindskip.xzs.domain.enums.QuestionTypeEnum;
import com.mindskip.xzs.repository.AiRecommendationRecordMapper;
import com.mindskip.xzs.repository.ExamPaperQuestionCustomerAnswerMapper;
import com.mindskip.xzs.repository.QuestionFeedbackMapper;
import com.mindskip.xzs.repository.QuestionRevisionLogMapper;
import com.mindskip.xzs.repository.QuestionSolutionContributionMapper;
import com.mindskip.xzs.service.AiGenerationService;
import com.mindskip.xzs.service.ExamPaperService;
import com.mindskip.xzs.service.QuestionCollaborationService;
import com.mindskip.xzs.service.QuestionService;
import com.mindskip.xzs.service.SubjectService;
import com.mindskip.xzs.service.TagService;
import com.mindskip.xzs.service.UserService;
import com.mindskip.xzs.utility.DateTimeUtil;
import com.mindskip.xzs.utility.JsonUtil;
import com.mindskip.xzs.utility.PageInfoHelper;
import com.mindskip.xzs.viewmodel.admin.exam.ExamPaperEditRequestVM;
import com.mindskip.xzs.viewmodel.admin.exam.ExamPaperTitleItemVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionEditRequestVM;
import com.mindskip.xzs.viewmodel.collaboration.AdoptedSolutionVM;
import com.mindskip.xzs.viewmodel.collaboration.CollaborationAggregateInsightVM;
import com.mindskip.xzs.viewmodel.collaboration.CollaborationFeedbackAnalysisVM;
import com.mindskip.xzs.viewmodel.collaboration.CollaborationRecommendationCopyVM;
import com.mindskip.xzs.viewmodel.collaboration.CollaborationSolutionAnalysisVM;
import com.mindskip.xzs.viewmodel.collaboration.CollaborationOverviewVM;
import com.mindskip.xzs.viewmodel.collaboration.DailyRecommendationItemVM;
import com.mindskip.xzs.viewmodel.collaboration.DailyRecommendationVM;
import com.mindskip.xzs.viewmodel.collaboration.FeedbackReviewActionVM;
import com.mindskip.xzs.viewmodel.collaboration.FeedbackReviewPageRequestVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionFeedbackDetailVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionFeedbackRelatedVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionFeedbackResponseVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionFeedbackSubmitVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionSolutionDetailVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionSolutionResponseVM;
import com.mindskip.xzs.viewmodel.collaboration.QuestionSolutionSubmitVM;
import com.mindskip.xzs.viewmodel.collaboration.RecommendationBuildResultVM;
import com.mindskip.xzs.viewmodel.collaboration.RecommendationBuildVM;
import com.mindskip.xzs.viewmodel.collaboration.RecommendationRateVM;
import com.mindskip.xzs.viewmodel.collaboration.SolutionReviewActionVM;
import com.mindskip.xzs.viewmodel.collaboration.SolutionReviewPageRequestVM;
import com.mindskip.xzs.viewmodel.student.question.answer.QuestionPageStudentRequestVM;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class QuestionCollaborationServiceImpl implements QuestionCollaborationService {

    private static final Logger logger = LoggerFactory.getLogger(QuestionCollaborationServiceImpl.class);

    private static final int STATUS_PENDING = 1;
    private static final int STATUS_ADOPTED = 2;
    private static final int STATUS_REJECTED = 3;
    private static final int STATUS_MERGED = 4;
    private static final int SOURCE_STUDENT = 1;
    private static final String ANALYSIS_SOURCE_LLM = "llm";
    private static final String ANALYSIS_SOURCE_RULE_FALLBACK = "rule_fallback";

    private final QuestionFeedbackMapper questionFeedbackMapper;
    private final QuestionSolutionContributionMapper questionSolutionContributionMapper;
    private final QuestionRevisionLogMapper questionRevisionLogMapper;
    private final AiRecommendationRecordMapper aiRecommendationRecordMapper;
    private final QuestionService questionService;
    private final UserService userService;
    private final SubjectService subjectService;
    private final TagService tagService;
    private final ExamPaperQuestionCustomerAnswerMapper examPaperQuestionCustomerAnswerMapper;
    private final AiGenerationService aiGenerationService;
    private final ExamPaperService examPaperService;

    public QuestionCollaborationServiceImpl(QuestionFeedbackMapper questionFeedbackMapper,
                                            QuestionSolutionContributionMapper questionSolutionContributionMapper,
                                            QuestionRevisionLogMapper questionRevisionLogMapper,
                                            AiRecommendationRecordMapper aiRecommendationRecordMapper,
                                            QuestionService questionService,
                                            UserService userService,
                                            SubjectService subjectService,
                                            TagService tagService,
                                            ExamPaperQuestionCustomerAnswerMapper examPaperQuestionCustomerAnswerMapper,
                                            AiGenerationService aiGenerationService,
                                            ExamPaperService examPaperService) {
        this.questionFeedbackMapper = questionFeedbackMapper;
        this.questionSolutionContributionMapper = questionSolutionContributionMapper;
        this.questionRevisionLogMapper = questionRevisionLogMapper;
        this.aiRecommendationRecordMapper = aiRecommendationRecordMapper;
        this.questionService = questionService;
        this.userService = userService;
        this.subjectService = subjectService;
        this.tagService = tagService;
        this.examPaperQuestionCustomerAnswerMapper = examPaperQuestionCustomerAnswerMapper;
        this.aiGenerationService = aiGenerationService;
        this.examPaperService = examPaperService;
    }

    @Override
    @Transactional
    public QuestionFeedbackResponseVM submitFeedback(Integer studentId, Integer userGroupId, QuestionFeedbackSubmitVM model) {
        Question question = ensureAccessibleQuestion(model.getQuestionId(), userGroupId);
        QuestionEditRequestVM questionVM = questionService.getQuestionEditRequestVM(question);
        CollaborationFeedbackAnalysisVM analysis = analyzeFeedbackWithFallback(questionVM, model.getFeedbackType(), model.getFeedbackContent());

        QuestionFeedback feedback = new QuestionFeedback();
        feedback.setQuestionId(question.getId());
        feedback.setStudentId(studentId);
        feedback.setFeedbackType(model.getFeedbackType());
        feedback.setFeedbackContent(model.getFeedbackContent());
        feedback.setAiCategory(analysis.getCategory());
        feedback.setAiSummary(analysis.getSummary());
        feedback.setAiSuggestion(analysis.getSuggestion());
        feedback.setAnalysisSource(analysis.getSource());
        feedback.setStatus(STATUS_PENDING);
        feedback.setCreateTime(new Date());
        questionFeedbackMapper.insertSelective(feedback);
        return toFeedbackResponseVM(feedback);
    }

    @Override
    @Transactional
    public QuestionSolutionResponseVM submitSolution(Integer studentId, Integer userGroupId, QuestionSolutionSubmitVM model) {
        Question question = ensureAccessibleQuestion(model.getQuestionId(), userGroupId);
        QuestionEditRequestVM questionVM = questionService.getQuestionEditRequestVM(question);
        CollaborationSolutionAnalysisVM analysis = analyzeSolutionWithFallback(questionVM, model.getContent());

        QuestionSolutionContribution contribution = new QuestionSolutionContribution();
        contribution.setQuestionId(question.getId());
        contribution.setStudentId(studentId);
        contribution.setContent(model.getContent());
        contribution.setQualityScore(clampScore(analysis.getQualityScore()));
        contribution.setAiSummary(analysis.getSummary());
        contribution.setAiSuggestion(analysis.getSuggestion());
        contribution.setAnalysisSource(analysis.getSource());
        contribution.setStatus(STATUS_PENDING);
        contribution.setAdopted(false);
        contribution.setCreateTime(new Date());
        questionSolutionContributionMapper.insertSelective(contribution);
        return toSolutionResponseVM(contribution);
    }

    @Override
    public List<QuestionFeedbackResponseVM> listMyFeedback(Integer studentId) {
        return questionFeedbackMapper.selectByStudentId(studentId).stream()
                .map(this::toFeedbackResponseVM)
                .collect(Collectors.toList());
    }

    @Override
    public List<AdoptedSolutionVM> listAdoptedSolutions(Integer questionId) {
        return questionSolutionContributionMapper.selectAdoptedByQuestionId(questionId).stream()
                .map(contribution -> {
                    AdoptedSolutionVM vm = new AdoptedSolutionVM();
                    vm.setId(contribution.getId());
                    User student = userService.selectById(contribution.getStudentId());
                    vm.setStudentName(student == null ? "匿名同学" : fallback(student.getRealName(), student.getUserName()));
                    vm.setContent(contribution.getContent());
                    vm.setQualityScore(contribution.getQualityScore());
                    vm.setAiSummary(contribution.getAiSummary());
                    vm.setAnalysisSource(contribution.getAnalysisSource());
                    vm.setAnalysisSourceLabel(analysisSourceLabel(contribution.getAnalysisSource()));
                    vm.setReviewComment(contribution.getReviewComment());
                    vm.setCreateTime(DateTimeUtil.dateFormat(contribution.getCreateTime()));
                    return vm;
                })
                .collect(Collectors.toList());
    }

    @Override
    public PageInfo<QuestionFeedbackResponseVM> pageFeedbacks(FeedbackReviewPageRequestVM model) {
        int pageIndex = model.getPageIndex() == null || model.getPageIndex() <= 0 ? 1 : model.getPageIndex();
        int pageSize = model.getPageSize() == null || model.getPageSize() <= 0 ? 10 : model.getPageSize();
        PageInfo<QuestionFeedback> pageInfo = PageHelper.startPage(pageIndex, pageSize)
                .doSelectPageInfo(() -> questionFeedbackMapper.pageForAdmin(model));
        return PageInfoHelper.copyMap(pageInfo, this::toFeedbackResponseVM);
    }

    @Override
    public PageInfo<QuestionSolutionResponseVM> pageSolutions(SolutionReviewPageRequestVM model) {
        int pageIndex = model.getPageIndex() == null || model.getPageIndex() <= 0 ? 1 : model.getPageIndex();
        int pageSize = model.getPageSize() == null || model.getPageSize() <= 0 ? 10 : model.getPageSize();
        PageInfo<QuestionSolutionContribution> pageInfo = PageHelper.startPage(pageIndex, pageSize)
                .doSelectPageInfo(() -> questionSolutionContributionMapper.pageForAdmin(model));
        return PageInfoHelper.copyMap(pageInfo, this::toSolutionResponseVM);
    }

    @Override
    public QuestionFeedbackDetailVM getFeedbackDetail(Integer feedbackId) {
        QuestionFeedback feedback = questionFeedbackMapper.selectByPrimaryKey(feedbackId);
        if (feedback == null) {
            return null;
        }

        QuestionFeedbackDetailVM vm = new QuestionFeedbackDetailVM();
        vm.setFeedback(toFeedbackResponseVM(feedback));
        vm.setQuestion(questionService.getQuestionEditRequestVM(feedback.getQuestionId()));

        List<QuestionFeedback> related = questionFeedbackMapper.selectByQuestionId(feedback.getQuestionId());
        vm.setRelatedFeedbacks(related.stream().limit(8).map(item -> {
            QuestionFeedbackRelatedVM relatedVM = new QuestionFeedbackRelatedVM();
            relatedVM.setId(item.getId());
            User student = userService.selectById(item.getStudentId());
            relatedVM.setStudentName(student == null ? "匿名同学" : fallback(student.getRealName(), student.getUserName()));
            relatedVM.setFeedbackType(item.getFeedbackType());
            relatedVM.setFeedbackContent(item.getFeedbackContent());
            relatedVM.setCreateTime(DateTimeUtil.dateFormat(item.getCreateTime()));
            return relatedVM;
        }).collect(Collectors.toList()));

        CollaborationAggregateInsightVM insight = analyzeAggregateFeedbackWithFallback(vm.getQuestion(), related);
        vm.setAggregateSummary(insight.getSummary());
        vm.setAggregateSuggestion(insight.getSuggestion());
        vm.setAggregateSource(insight.getSource());
        vm.setAggregateSourceLabel(analysisSourceLabel(insight.getSource()));
        return vm;
    }

    @Override
    public QuestionSolutionDetailVM getSolutionDetail(Integer contributionId) {
        QuestionSolutionContribution contribution = questionSolutionContributionMapper.selectByPrimaryKey(contributionId);
        if (contribution == null) {
            return null;
        }

        QuestionSolutionDetailVM vm = new QuestionSolutionDetailVM();
        vm.setContribution(toSolutionResponseVM(contribution));
        vm.setQuestion(questionService.getQuestionEditRequestVM(contribution.getQuestionId()));
        return vm;
    }

    @Override
    @Transactional
    public String reviewFeedback(Integer teacherId, FeedbackReviewActionVM model) {
        QuestionFeedback feedback = questionFeedbackMapper.selectByPrimaryKey(model.getFeedbackId());
        if (feedback == null) {
            return "反馈不存在";
        }

        feedback.setStatus(model.getAction());
        feedback.setTeacherId(teacherId);
        feedback.setReviewComment(model.getReviewComment());
        feedback.setReviewTime(new Date());

        if (Objects.equals(model.getAction(), STATUS_ADOPTED) || Objects.equals(model.getAction(), STATUS_MERGED)) {
            QuestionEditRequestVM beforeVM = questionService.getQuestionEditRequestVM(feedback.getQuestionId());
            QuestionEditRequestVM afterVM = questionService.getQuestionEditRequestVM(feedback.getQuestionId());
            boolean changed = false;

            if (!isBlank(model.getUpdatedTitle()) && !Objects.equals(model.getUpdatedTitle(), beforeVM.getTitle())) {
                afterVM.setTitle(model.getUpdatedTitle());
                changed = true;
            }
            if (!isBlank(model.getUpdatedAnalyze()) && !Objects.equals(model.getUpdatedAnalyze(), beforeVM.getAnalyze())) {
                afterVM.setAnalyze(model.getUpdatedAnalyze());
                changed = true;
            }
            if (model.getTagIds() != null || !CollectionUtils.isEmpty(model.getNewTagNames())) {
                afterVM.setTagIds(model.getTagIds() == null ? new ArrayList<>() : model.getTagIds());
                afterVM.setNewTagNames(model.getNewTagNames());
                changed = true;
            }

            if (changed) {
                questionService.updateFullQuestion(afterVM, teacherId);
                saveRevisionLog(feedback.getQuestionId(), teacherId, feedback.getId(), beforeVM, afterVM,
                        resolveRevisionType(beforeVM, afterVM));
            }
        }

        questionFeedbackMapper.updateByPrimaryKeySelective(feedback);
        return "审核成功";
    }

    @Override
    @Transactional
    public String reviewSolution(Integer teacherId, SolutionReviewActionVM model) {
        QuestionSolutionContribution contribution = questionSolutionContributionMapper.selectByPrimaryKey(model.getContributionId());
        if (contribution == null) {
            return "解法不存在";
        }

        contribution.setStatus(model.getAction());
        contribution.setTeacherId(teacherId);
        contribution.setReviewComment(model.getReviewComment());
        contribution.setReviewTime(new Date());
        contribution.setAdopted(Objects.equals(model.getAction(), STATUS_ADOPTED) || Objects.equals(model.getAction(), STATUS_MERGED));
        questionSolutionContributionMapper.updateByPrimaryKeySelective(contribution);

        if (Boolean.TRUE.equals(contribution.getAdopted())) {
            QuestionRevisionLog log = new QuestionRevisionLog();
            log.setQuestionId(contribution.getQuestionId());
            log.setSourceType(SOURCE_STUDENT);
            log.setRevisionType("student_solution_adopted");
            log.setBeforeSnapshot("");
            log.setAfterSnapshot(contribution.getContent());
            log.setReviewerId(teacherId);
            log.setReferenceId(contribution.getId());
            log.setCreateTime(new Date());
            questionRevisionLogMapper.insertSelective(log);
        }
        return "审核成功";
    }

    @Override
    public CollaborationOverviewVM getOverview() {
        CollaborationOverviewVM vm = new CollaborationOverviewVM();
        int feedbackCount = defaultInt(questionFeedbackMapper.countAll());
        int feedbackAdopted = defaultInt(questionFeedbackMapper.countByStatus(STATUS_ADOPTED))
                + defaultInt(questionFeedbackMapper.countByStatus(STATUS_MERGED));
        int recommendationCount = defaultInt(aiRecommendationRecordMapper.countAll());
        int recommendationAccepted = defaultInt(aiRecommendationRecordMapper.countAccepted());
        int recommendationUseful = defaultInt(aiRecommendationRecordMapper.countUseful());

        vm.setFeedbackCount(feedbackCount);
        vm.setFeedbackAdoptRate(percent(feedbackAdopted, feedbackCount));
        vm.setRevisionCount(defaultInt(questionRevisionLogMapper.countAll()));
        vm.setTagRevisionCount(defaultInt(questionRevisionLogMapper.countByRevisionType("tag_update")));
        vm.setAiQuestionAdoptRate(0D);
        vm.setRecommendationAcceptRate(percent(recommendationAccepted, recommendationCount));
        vm.setRecommendationUsefulRate(percent(recommendationUseful, recommendationCount));
        return vm;
    }

    @Override
    public DailyRecommendationVM getDailyRecommendation(Integer studentId, Integer userGroupId, Integer rangeDays) {
        int safeRangeDays = rangeDays == null || rangeDays <= 0 ? 15 : rangeDays;
        Date endTime = new Date();
        Calendar calendar = Calendar.getInstance(DateTimeUtil.CHINA_TIME_ZONE);
        calendar.setTime(endTime);
        calendar.add(Calendar.DAY_OF_YEAR, -(safeRangeDays - 1));
        Date startTime = calendar.getTime();

        List<ExamPaperQuestionCustomerAnswer> wrongAnswers = examPaperQuestionCustomerAnswerMapper
                .selectByUserIdAndDateRange(studentId, startTime, endTime, null)
                .stream()
                .filter(item -> Boolean.FALSE.equals(item.getDoRight()))
                .filter(item -> item.getQuestionId() != null)
                .filter(item -> questionService.getAccessibleQuestion(item.getQuestionId(), userGroupId) != null)
                .collect(Collectors.toList());

        List<QuestionFeedback> recentFeedbacks = questionFeedbackMapper.selectByStudentId(studentId).stream()
                .filter(item -> item.getCreateTime() != null && !item.getCreateTime().before(startTime))
                .collect(Collectors.toList());

        DailyRecommendationVM vm = new DailyRecommendationVM();
        vm.setItems(buildRecommendationItems(wrongAnswers, recentFeedbacks));
        if (!CollectionUtils.isEmpty(vm.getItems())) {
            CollaborationRecommendationCopyVM copy = analyzeRecommendationCopyWithFallback(vm.getItems(), recentFeedbacks, safeRangeDays);
            vm.setItems(mergeRecommendationItems(vm.getItems(), copy));
            vm.setSummary(isBlank(copy.getSummary()) ? fallbackRecommendationSummary() : copy.getSummary());
            vm.setSource(copy.getSource());
            vm.setSourceLabel(analysisSourceLabel(copy.getSource()));
        } else {
            vm.setSummary("近期可用样本较少，建议先完成一组练习，系统会在积累数据后生成更精准的推荐。");
            vm.setSource(ANALYSIS_SOURCE_RULE_FALLBACK);
            vm.setSourceLabel(analysisSourceLabel(ANALYSIS_SOURCE_RULE_FALLBACK));
        }
        return vm;
    }

    @Override
    @Transactional
    public RecommendationBuildResultVM buildRecommendationPractice(Integer studentId, Integer userGroupId, RecommendationBuildVM model) {
        User student = userService.selectById(studentId);
        if (student == null) {
            throw new IllegalArgumentException("学生不存在");
        }

        Subject subject = subjectService.selectById(model.getSubjectId());
        if (subject == null || !Objects.equals(subject.getUserGroupId(), userGroupId)) {
            throw new IllegalArgumentException("学科不存在或无权访问");
        }

        List<Question> seedQuestions = CollectionUtils.isEmpty(model.getSeedQuestionIds())
                ? Collections.emptyList()
                : model.getSeedQuestionIds().stream()
                .filter(Objects::nonNull)
                .distinct()
                .map(id -> questionService.getAccessibleQuestion(id, userGroupId))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        Set<Integer> relatedTagIds = new LinkedHashSet<>();
        seedQuestions.forEach(question -> relatedTagIds.addAll(tagService.getQuestionTagIds(question.getId())));

        QuestionPageStudentRequestVM requestVM = new QuestionPageStudentRequestVM();
        requestVM.setPageIndex(1);
        requestVM.setPageSize(60);
        requestVM.setUserGroupId(userGroupId);
        requestVM.setSubjectId(model.getSubjectId());
        requestVM.setQuestionType(model.getQuestionType());
        if (!relatedTagIds.isEmpty()) {
            requestVM.setTagIds(new ArrayList<>(relatedTagIds));
            requestVM.setTagMatchMode(1);
        }

        List<Question> candidateQuestions = questionService.studentList(requestVM);
        if (CollectionUtils.isEmpty(candidateQuestions) && !relatedTagIds.isEmpty()) {
            requestVM.setTagIds(null);
            candidateQuestions = questionService.studentList(requestVM);
        }

        Set<Integer> seedQuestionIdSet = seedQuestions.stream().map(Question::getId).collect(Collectors.toSet());
        int questionCount = defaultPracticeQuestionCount(model.getQuestionType());

        List<Question> selectedQuestions = Stream.concat(seedQuestions.stream(), candidateQuestions.stream())
                .filter(Objects::nonNull)
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(Question::getId, question -> question, (left, right) -> left, LinkedHashMap::new),
                        map -> new ArrayList<>(map.values())
                ))
                .stream()
                .sorted(Comparator
                        .comparingInt((Question question) -> recommendationScore(question, seedQuestionIdSet, relatedTagIds, model.getQuestionType()))
                        .reversed()
                        .thenComparing(Question::getDifficult, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(Question::getId, Comparator.reverseOrder()))
                .limit(questionCount)
                .collect(Collectors.toList());

        if (CollectionUtils.isEmpty(selectedQuestions)) {
            throw new IllegalArgumentException("当前推荐条件下暂无可生成练习的题目");
        }

        ExamPaper paper = buildPracticePaperFromQuestions(student, selectedQuestions, model.getTitle());

        AiRecommendationRecord record = new AiRecommendationRecord();
        record.setStudentId(studentId);
        record.setRecommendationType(model.getStrategyKey());
        record.setTargetId(paper.getId());
        record.setReason(model.getReason());
        record.setAccepted(true);
        record.setPayload(JsonUtil.toJsonStr(model));
        record.setCreateTime(new Date());
        record.setModifyTime(new Date());
        aiRecommendationRecordMapper.insertSelective(record);

        RecommendationBuildResultVM resultVM = new RecommendationBuildResultVM();
        resultVM.setPaperId(paper.getId());
        resultVM.setRecommendationId(record.getId());
        return resultVM;
    }

    @Override
    @Transactional
    public String rateRecommendation(Integer studentId, RecommendationRateVM model) {
        AiRecommendationRecord record = aiRecommendationRecordMapper.selectByPrimaryKey(model.getRecommendationId());
        if (record == null || !Objects.equals(record.getStudentId(), studentId)) {
            return "推荐记录不存在";
        }
        record.setEffectScore(model.getEffectScore());
        record.setModifyTime(new Date());
        aiRecommendationRecordMapper.updateByPrimaryKeySelective(record);
        return "评价成功";
    }

    private Question ensureAccessibleQuestion(Integer questionId, Integer userGroupId) {
        Question question = questionService.getAccessibleQuestion(questionId, userGroupId);
        if (question == null) {
            throw new IllegalArgumentException("题目不存在或无权访问");
        }
        return question;
    }

    private QuestionFeedbackResponseVM toFeedbackResponseVM(QuestionFeedback feedback) {
        QuestionFeedbackResponseVM vm = new QuestionFeedbackResponseVM();
        vm.setId(feedback.getId());
        vm.setQuestionId(feedback.getQuestionId());
        vm.setFeedbackType(feedback.getFeedbackType());
        vm.setFeedbackContent(feedback.getFeedbackContent());
        vm.setAiCategory(feedback.getAiCategory());
        vm.setAiSummary(feedback.getAiSummary());
        vm.setAiSuggestion(feedback.getAiSuggestion());
        vm.setAnalysisSource(feedback.getAnalysisSource());
        vm.setAnalysisSourceLabel(analysisSourceLabel(feedback.getAnalysisSource()));
        vm.setStatus(feedback.getStatus());
        vm.setStatusName(statusName(feedback.getStatus()));
        vm.setCreateTime(DateTimeUtil.dateFormat(feedback.getCreateTime()));
        vm.setReviewTime(DateTimeUtil.dateFormat(feedback.getReviewTime()));
        vm.setReviewComment(feedback.getReviewComment());

        Question question = questionService.selectById(feedback.getQuestionId());
        if (question != null) {
            QuestionEditRequestVM questionVM = questionService.getQuestionEditRequestVM(question);
            vm.setShortTitle(buildShortTitle(questionVM.getTitle()));
            Subject subject = subjectService.selectById(question.getSubjectId());
            vm.setSubjectName(subject == null ? "" : subject.getName());
        }

        User student = userService.selectById(feedback.getStudentId());
        vm.setStudentName(student == null ? "匿名同学" : fallback(student.getRealName(), student.getUserName()));
        return vm;
    }

    private QuestionSolutionResponseVM toSolutionResponseVM(QuestionSolutionContribution contribution) {
        QuestionSolutionResponseVM vm = new QuestionSolutionResponseVM();
        vm.setId(contribution.getId());
        vm.setQuestionId(contribution.getQuestionId());
        vm.setContent(contribution.getContent());
        vm.setQualityScore(contribution.getQualityScore());
        vm.setStatus(contribution.getStatus());
        vm.setStatusName(statusName(contribution.getStatus()));
        vm.setAdopted(contribution.getAdopted());
        vm.setAiSummary(contribution.getAiSummary());
        vm.setAiSuggestion(contribution.getAiSuggestion());
        vm.setAnalysisSource(contribution.getAnalysisSource());
        vm.setAnalysisSourceLabel(analysisSourceLabel(contribution.getAnalysisSource()));
        vm.setCreateTime(DateTimeUtil.dateFormat(contribution.getCreateTime()));
        vm.setReviewTime(DateTimeUtil.dateFormat(contribution.getReviewTime()));
        vm.setReviewComment(contribution.getReviewComment());

        Question question = questionService.selectById(contribution.getQuestionId());
        if (question != null) {
            QuestionEditRequestVM questionVM = questionService.getQuestionEditRequestVM(question);
            vm.setShortTitle(buildShortTitle(questionVM.getTitle()));
            Subject subject = subjectService.selectById(question.getSubjectId());
            vm.setSubjectName(subject == null ? "" : subject.getName());
        }

        User student = userService.selectById(contribution.getStudentId());
        vm.setStudentName(student == null ? "匿名同学" : fallback(student.getRealName(), student.getUserName()));
        return vm;
    }

    private CollaborationFeedbackAnalysisVM analyzeFeedbackWithFallback(QuestionEditRequestVM questionVM, String feedbackType, String content) {
        try {
            CollaborationFeedbackAnalysisVM analysis = aiGenerationService.generateFeedbackAnalysis(questionVM, feedbackType, content);
            if (analysis != null && !isBlank(analysis.getCategory()) && !isBlank(analysis.getSummary()) && !isBlank(analysis.getSuggestion())) {
                analysis.setCategory(normalizeFeedbackCategory(analysis.getCategory(), feedbackType, content));
                analysis.setSummary(trimTo(analysis.getSummary(), 120));
                analysis.setSuggestion(trimTo(analysis.getSuggestion(), 120));
                analysis.setSource(ANALYSIS_SOURCE_LLM);
                return analysis;
            }
        } catch (Exception e) {
            logger.warn("Generate feedback analysis by AI failed, fallback to rule: {}", e.getMessage());
        }

        CollaborationFeedbackAnalysisVM fallback = new CollaborationFeedbackAnalysisVM();
        String normalizedType = normalizeFeedbackCategory(feedbackType, feedbackType, content);
        fallback.setCategory(normalizedType);
        fallback.setSummary(fallbackBuildFeedbackSummary(normalizedType, content));
        fallback.setSuggestion(fallbackBuildFeedbackSuggestion(normalizedType, questionVM));
        fallback.setSource(ANALYSIS_SOURCE_RULE_FALLBACK);
        return fallback;
    }

    private CollaborationSolutionAnalysisVM analyzeSolutionWithFallback(QuestionEditRequestVM questionVM, String content) {
        try {
            CollaborationSolutionAnalysisVM analysis = aiGenerationService.generateSolutionAnalysis(questionVM, content);
            if (analysis != null && analysis.getQualityScore() != null && !isBlank(analysis.getSummary()) && !isBlank(analysis.getSuggestion())) {
                analysis.setQualityScore(clampScore(analysis.getQualityScore()));
                analysis.setSummary(trimTo(analysis.getSummary(), 140));
                analysis.setSuggestion(trimTo(analysis.getSuggestion(), 140));
                analysis.setSource(ANALYSIS_SOURCE_LLM);
                return analysis;
            }
        } catch (Exception e) {
            logger.warn("Generate solution analysis by AI failed, fallback to rule: {}", e.getMessage());
        }

        CollaborationSolutionAnalysisVM fallback = new CollaborationSolutionAnalysisVM();
        fallback.setQualityScore(fallbackResolveSolutionQualityScore(content));
        fallback.setSummary(fallbackBuildSolutionSummary(questionVM, content));
        fallback.setSuggestion(fallbackBuildSolutionSuggestion(questionVM, content));
        fallback.setSource(ANALYSIS_SOURCE_RULE_FALLBACK);
        return fallback;
    }

    private CollaborationAggregateInsightVM analyzeAggregateFeedbackWithFallback(QuestionEditRequestVM questionVM, List<QuestionFeedback> related) {
        if (!CollectionUtils.isEmpty(related)) {
            try {
                CollaborationAggregateInsightVM insight = aiGenerationService.generateAggregateFeedbackInsight(questionVM, related);
                if (insight != null && !isBlank(insight.getSummary()) && !isBlank(insight.getSuggestion())) {
                    insight.setSummary(trimTo(insight.getSummary(), 180));
                    insight.setSuggestion(trimTo(insight.getSuggestion(), 180));
                    insight.setSource(ANALYSIS_SOURCE_LLM);
                    return insight;
                }
            } catch (Exception e) {
                logger.warn("Generate aggregate feedback insight by AI failed, fallback to rule: {}", e.getMessage());
            }
        }

        String[] fallbackInsight = fallbackBuildAggregateFeedbackInsight(questionVM, related);
        CollaborationAggregateInsightVM fallback = new CollaborationAggregateInsightVM();
        fallback.setSummary(fallbackInsight[0]);
        fallback.setSuggestion(fallbackInsight[1]);
        fallback.setSource(ANALYSIS_SOURCE_RULE_FALLBACK);
        return fallback;
    }

    private CollaborationRecommendationCopyVM analyzeRecommendationCopyWithFallback(List<DailyRecommendationItemVM> items,
                                                                                    List<QuestionFeedback> recentFeedbacks,
                                                                                    Integer rangeDays) {
        if (!CollectionUtils.isEmpty(items)) {
            try {
                CollaborationRecommendationCopyVM copy = aiGenerationService.generateRecommendationCopy(items, recentFeedbacks, rangeDays);
                if (copy != null && !CollectionUtils.isEmpty(copy.getItems())) {
                    copy.setSummary(isBlank(copy.getSummary()) ? fallbackRecommendationSummary() : trimTo(copy.getSummary(), 150));
                    copy.setSource(ANALYSIS_SOURCE_LLM);
                    return copy;
                }
            } catch (Exception e) {
                logger.warn("Generate recommendation copy by AI failed, fallback to rule: {}", e.getMessage());
            }
        }

        CollaborationRecommendationCopyVM fallback = new CollaborationRecommendationCopyVM();
        fallback.setSummary(fallbackRecommendationSummary());
        fallback.setItems(items);
        fallback.setSource(ANALYSIS_SOURCE_RULE_FALLBACK);
        return fallback;
    }

    private List<DailyRecommendationItemVM> mergeRecommendationItems(List<DailyRecommendationItemVM> fallbackItems,
                                                                     CollaborationRecommendationCopyVM copy) {
        if (CollectionUtils.isEmpty(fallbackItems)) {
            return Collections.emptyList();
        }
        Map<String, DailyRecommendationItemVM> aiItems = CollectionUtils.isEmpty(copy.getItems())
                ? Collections.emptyMap()
                : copy.getItems().stream()
                .filter(Objects::nonNull)
                .filter(item -> !isBlank(item.getStrategyKey()))
                .collect(Collectors.toMap(DailyRecommendationItemVM::getStrategyKey, item -> item, (left, right) -> left, LinkedHashMap::new));

        return fallbackItems.stream().map(item -> {
            DailyRecommendationItemVM merged = item;
            DailyRecommendationItemVM aiItem = aiItems.get(item.getStrategyKey());
            if (aiItem != null) {
                if (!isBlank(aiItem.getTitle())) {
                    merged.setTitle(trimTo(aiItem.getTitle(), 60));
                }
                if (!isBlank(aiItem.getReason())) {
                    merged.setReason(trimTo(aiItem.getReason(), 100));
                }
                merged.setSource(ANALYSIS_SOURCE_LLM);
            }
            if (isBlank(merged.getSource())) {
                merged.setSource(ANALYSIS_SOURCE_RULE_FALLBACK);
            }
            merged.setSourceLabel(analysisSourceLabel(merged.getSource()));
            return merged;
        }).collect(Collectors.toList());
    }

    private String normalizeFeedbackCategory(String category, String feedbackType, String content) {
        String candidate = isBlank(category) ? feedbackType : category;
        if ("题干表述不清".equals(candidate)
                || "答案有争议".equals(candidate)
                || "解析看不懂".equals(candidate)
                || "难度不匹配".equals(candidate)
                || "知识点标签可疑".equals(candidate)
                || "其他".equals(candidate)) {
            return candidate;
        }
        return fallbackResolveFeedbackCategory(feedbackType, content);
    }

    private String fallbackResolveFeedbackCategory(String feedbackType, String content) {
        if ("题干表述不清".equals(feedbackType)
                || "答案有争议".equals(feedbackType)
                || "解析看不懂".equals(feedbackType)
                || "难度不匹配".equals(feedbackType)
                || "知识点标签可疑".equals(feedbackType)
                || "其他".equals(feedbackType)) {
            return feedbackType;
        }
        if (content == null) {
            return "其他";
        }
        if (content.contains("解析")) {
            return "解析看不懂";
        }
        if (content.contains("答案")) {
            return "答案有争议";
        }
        if (content.contains("难")) {
            return "难度不匹配";
        }
        if (content.contains("标签")) {
            return "知识点标签可疑";
        }
        return "题干表述不清";
    }

    private String fallbackBuildFeedbackSummary(String feedbackType, String content) {
        String prefix = isBlank(feedbackType)
                ? "学生反馈了题目体验问题"
                : "学生反馈类型为“" + feedbackType + "”";
        return prefix + "，核心描述为：" + trimTo(content, 80);
    }

    private String fallbackBuildFeedbackSuggestion(String feedbackType, QuestionEditRequestVM questionVM) {
        if ("解析看不懂".equals(feedbackType)) {
            return "建议教师补充分步解析，必要时增加示例或关键步骤提示。";
        }
        if ("答案有争议".equals(feedbackType)) {
            return "建议教师复核标准答案与解析是否一致，并检查是否存在多解。";
        }
        if ("知识点标签可疑".equals(feedbackType)) {
            return "建议教师检查题目标签与知识点映射，必要时补充或修正标签。";
        }
        if ("难度不匹配".equals(feedbackType)) {
            return "建议教师结合当前题目解析深度与做题耗时，重新评估难度等级。";
        }
        return "建议教师复核题干表述是否清晰，并根据反馈补充提示信息。";
    }

    private Integer fallbackResolveSolutionQualityScore(String content) {
        int score = 55;
        if (!isBlank(content)) {
            if (content.length() > 80) {
                score += 15;
            }
            if (content.contains("因为") || content.contains("所以")) {
                score += 10;
            }
            if (content.contains("步骤") || content.contains("首先") || content.contains("其次")) {
                score += 10;
            }
            if (content.contains("错因") || content.contains("反思")) {
                score += 10;
            }
        }
        return Math.min(score, 95);
    }

    private String fallbackBuildSolutionSummary(QuestionEditRequestVM questionVM, String content) {
        return "该学生提交了解题思路/错因总结，内容重点为：" + trimTo(content, 90);
    }

    private String fallbackBuildSolutionSuggestion(QuestionEditRequestVM questionVM, String content) {
        if (!isBlank(content) && (content.contains("错因") || content.contains("反思"))) {
            return "这份解法包含明显的自我纠错过程，适合作为错因示例供同类题复盘参考。";
        }
        return "建议教师重点判断该解法是否体现关键步骤与易错点，符合条件可采纳为优秀思路。";
    }

    private String[] fallbackBuildAggregateFeedbackInsight(QuestionEditRequestVM questionVM, List<QuestionFeedback> related) {
        if (CollectionUtils.isEmpty(related)) {
            return new String[]{"当前暂无可聚合的反馈记录。", "建议继续观察学生使用情况后再决定是否调整题目。"};
        }

        Map<String, Long> typeCount = related.stream()
                .collect(Collectors.groupingBy(
                        item -> resolveFeedbackSignalCategory(item),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));

        String fallbackSummary = "当前该题共收到 " + related.size() + " 条反馈，主要集中在："
                + typeCount.entrySet().stream()
                .map(entry -> entry.getKey() + entry.getValue() + "条")
                .collect(Collectors.joining("、")) + "。";
        String topType = typeCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("题干表述不清");

        String analyzeText = stripHtml(questionVM.getAnalyze());
        String tagText = String.join("、", questionVM.getTagNames() == null ? Collections.emptyList() : questionVM.getTagNames());

        String suggestion;
        if ("解析看不懂".equals(topType)) {
            suggestion = isBlank(analyzeText)
                    ? "学生主要卡在解析理解，建议优先补充完整解析，并增加关键步骤提示。"
                    : "学生主要卡在解析理解，建议把现有解析拆成更清晰的分步说明，补充中间推导。";
        } else if ("答案有争议".equals(topType)) {
            suggestion = "学生对答案一致性存在疑问，建议先复核标准答案、判分逻辑与解析是否完全对应。";
        } else if ("知识点标签可疑".equals(topType)) {
            suggestion = isBlank(tagText)
                    ? "反馈集中在标签归属，建议补充知识点标签，方便后续推荐练习与统计。"
                    : "反馈集中在标签归属，建议检查当前标签“" + trimTo(tagText, 30) + "”是否准确覆盖该题。";
        } else if ("难度不匹配".equals(topType)) {
            suggestion = "学生对题目难度感知不一致，建议结合班级正确率和解析复杂度重新评估难度等级。";
        } else {
            suggestion = "学生主要反馈题干表达问题，建议先优化题干措辞，再核对是否缺少必要条件或提示。";
        }
        return new String[]{fallbackSummary, suggestion};
    }

    private String fallbackRecommendationSummary() {
        return "系统已结合最近错题、题型表现和题目反馈，为你整理出今日优先练习方向。";
    }

    private void saveRevisionLog(Integer questionId, Integer teacherId, Integer referenceId,
                                 QuestionEditRequestVM beforeVM, QuestionEditRequestVM afterVM, String revisionType) {
        QuestionRevisionLog log = new QuestionRevisionLog();
        log.setQuestionId(questionId);
        log.setSourceType(SOURCE_STUDENT);
        log.setRevisionType(revisionType);
        log.setBeforeSnapshot(JsonUtil.toJsonStr(beforeVM));
        log.setAfterSnapshot(JsonUtil.toJsonStr(afterVM));
        log.setReviewerId(teacherId);
        log.setReferenceId(referenceId);
        log.setCreateTime(new Date());
        questionRevisionLogMapper.insertSelective(log);
    }

    private String resolveRevisionType(QuestionEditRequestVM beforeVM, QuestionEditRequestVM afterVM) {
        if (!Objects.equals(beforeVM.getTagIds(), afterVM.getTagIds())) {
            return "tag_update";
        }
        if (!Objects.equals(beforeVM.getAnalyze(), afterVM.getAnalyze())) {
            return "analyze_update";
        }
        if (!Objects.equals(beforeVM.getTitle(), afterVM.getTitle())) {
            return "title_update";
        }
        return "feedback_update";
    }

    private List<DailyRecommendationItemVM> buildRecommendationItems(List<ExamPaperQuestionCustomerAnswer> wrongAnswers,
                                                                     List<QuestionFeedback> recentFeedbacks) {
        if (CollectionUtils.isEmpty(wrongAnswers)) {
            return Collections.emptyList();
        }

        List<DailyRecommendationItemVM> items = new ArrayList<>();

        Map<Integer, Long> questionCount = wrongAnswers.stream()
                .collect(Collectors.groupingBy(ExamPaperQuestionCustomerAnswer::getQuestionId, Collectors.counting()));
        List<Integer> highFreqQuestionIds = questionCount.entrySet().stream()
                .sorted(Map.Entry.<Integer, Long>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        if (!highFreqQuestionIds.isEmpty()) {
            Question question = questionService.selectById(highFreqQuestionIds.get(0));
            DailyRecommendationItemVM item = buildRecommendationItem(
                    "high_frequency_wrong",
                    "高频错题回炉训练",
                    "最近重复出错较多，建议优先做一轮定向巩固。",
                    question,
                    highFreqQuestionIds,
                    1
            );
            if (item != null) {
                items.add(item);
            }
        }

        Map<Integer, Long> weakTypeCount = wrongAnswers.stream()
                .filter(item -> item.getQuestionType() != null)
                .collect(Collectors.groupingBy(ExamPaperQuestionCustomerAnswer::getQuestionType, Collectors.counting()));
        Integer weakType = weakTypeCount.entrySet().stream()
                .sorted(Map.Entry.<Integer, Long>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .findFirst()
                .orElse(null);
        if (weakType != null) {
            Question weakQuestion = wrongAnswers.stream()
                    .filter(item -> Objects.equals(item.getQuestionType(), weakType))
                    .map(item -> questionService.selectById(item.getQuestionId()))
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(null);
            DailyRecommendationItemVM item = buildRecommendationItem(
                    "weak_question_type",
                    questionTypeLabel(weakType) + "专项巩固",
                    "该题型近期正确率偏低，适合单独拉出来做一组针对性训练。",
                    weakQuestion,
                    highFreqQuestionIds,
                    2
            );
            if (item != null) {
                item.setQuestionType(weakType);
                item.setQuestionTypeName(questionTypeLabel(weakType));
                items.add(item);
            }
        }

        List<QuestionFeedback> parseFeedbacks = recentFeedbacks.stream()
                .filter(item -> "解析看不懂".equals(resolveFeedbackSignalCategory(item)))
                .collect(Collectors.toList());
        if (!parseFeedbacks.isEmpty()) {
            QuestionFeedback latest = parseFeedbacks.get(0);
            Question question = questionService.selectById(latest.getQuestionId());
            DailyRecommendationItemVM item = buildRecommendationItem(
                    "parse_reinforce",
                    "解析理解补强练习",
                    "你最近对部分题目的解析理解存在障碍，建议做同专题补练并复盘解题步骤。",
                    question,
                    parseFeedbacks.stream().map(QuestionFeedback::getQuestionId).distinct().limit(5).collect(Collectors.toList()),
                    3
            );
            if (item != null) {
                items.add(item);
            }
        }

        return items.stream()
                .filter(Objects::nonNull)
                .limit(4)
                .collect(Collectors.toList());
    }

    private DailyRecommendationItemVM buildRecommendationItem(String strategyKey, String title, String reason,
                                                              Question question, List<Integer> seedQuestionIds,
                                                              int priority) {
        if (question == null) {
            return null;
        }
        Subject subject = subjectService.selectById(question.getSubjectId());
        DailyRecommendationItemVM item = new DailyRecommendationItemVM();
        item.setStrategyKey(strategyKey);
        item.setTitle(title);
        item.setReason(reason);
        item.setSubjectId(question.getSubjectId());
        item.setSubjectName(subject == null ? "" : subject.getName());
        item.setQuestionType(question.getQuestionType());
        item.setQuestionTypeName(questionTypeLabel(question.getQuestionType()));
        item.setPriority(priority);
        item.setSeedQuestionIds(seedQuestionIds);
        item.setSource(ANALYSIS_SOURCE_RULE_FALLBACK);
        item.setSourceLabel(analysisSourceLabel(ANALYSIS_SOURCE_RULE_FALLBACK));
        return item;
    }

    private String resolveFeedbackSignalCategory(QuestionFeedback feedback) {
        if (feedback == null) {
            return "未分类";
        }
        return normalizeFeedbackCategory(feedback.getAiCategory(), feedback.getFeedbackType(), feedback.getFeedbackContent());
    }

    private int clampScore(Integer score) {
        int safeScore = score == null ? 0 : score;
        return Math.max(0, Math.min(safeScore, 100));
    }

    private String analysisSourceLabel(String source) {
        if (ANALYSIS_SOURCE_LLM.equals(source)) {
            return "LLM";
        }
        return "规则兜底";
    }

    private int recommendationScore(Question question, Set<Integer> seedQuestionIds, Set<Integer> relatedTagIds, Integer questionType) {
        int score = 0;
        if (seedQuestionIds.contains(question.getId())) {
            score += 100;
        }
        if (questionType != null && Objects.equals(questionType, question.getQuestionType())) {
            score += 40;
        }
        if (!relatedTagIds.isEmpty()) {
            long hitCount = tagService.getQuestionTagIds(question.getId()).stream()
                    .filter(relatedTagIds::contains)
                    .count();
            score += (int) hitCount * 10;
        }
        score += Math.max(0, 6 - defaultInt(question.getDifficult()));
        return score;
    }

    private int defaultPracticeQuestionCount(Integer questionType) {
        if (Objects.equals(questionType, QuestionTypeEnum.ShortAnswer.getCode())) {
            return 6;
        }
        if (Objects.equals(questionType, QuestionTypeEnum.GapFilling.getCode())) {
            return 8;
        }
        return 10;
    }

    private ExamPaper buildPracticePaperFromQuestions(User user, List<Question> questions, String recommendationTitle) {
        List<Integer> subjectIds = questions.stream()
                .map(Question::getSubjectId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        if (subjectIds.size() != 1) {
            throw new IllegalArgumentException("当前仅支持同一学科题目生成练习卷");
        }

        List<QuestionEditRequestVM> questionItems = questions.stream()
                .filter(Objects::nonNull)
                .map(questionService::getQuestionEditRequestVM)
                .sorted(Comparator.comparing(QuestionEditRequestVM::getId))
                .collect(Collectors.toList());

        ExamPaperTitleItemVM titleItemVM = new ExamPaperTitleItemVM();
        titleItemVM.setName(fallback(recommendationTitle, "AI推荐强化练习"));
        titleItemVM.setQuestionItems(questionItems);

        ExamPaperEditRequestVM paperVM = new ExamPaperEditRequestVM();
        paperVM.setUserGroupId(user.getUserGroupId());
        paperVM.setSubjectId(subjectIds.get(0));
        paperVM.setPaperType(ExamPaperTypeEnum.CustomPractice.getCode());
        paperVM.setSuggestTime(Math.max(10, questionItems.size() * 3));
        paperVM.setName(fallback(recommendationTitle, "AI推荐强化练习") + "-" + DateTimeUtil.dateFormat(new Date(), "yyyyMMddHHmmss"));
        paperVM.setTitleItems(Collections.singletonList(titleItemVM));
        paperVM.setScore(String.valueOf(questionItems.stream()
                .map(QuestionEditRequestVM::getScore)
                .map(score -> isBlank(score) ? 0 : Integer.parseInt(score))
                .reduce(0, Integer::sum)));

        ExamPaper savedPaper = examPaperService.savePaperFromVM(paperVM, user);
        tagService.syncExamPaperTags(savedPaper.getId(),
                questionItems.stream()
                        .flatMap(item -> item.getTagIds() == null ? Stream.empty() : item.getTagIds().stream())
                        .filter(Objects::nonNull)
                        .distinct()
                        .collect(Collectors.toList()));
        return savedPaper;
    }

    private String statusName(Integer status) {
        if (Objects.equals(status, STATUS_PENDING)) {
            return "待审核";
        }
        if (Objects.equals(status, STATUS_ADOPTED)) {
            return "已采纳";
        }
        if (Objects.equals(status, STATUS_REJECTED)) {
            return "已驳回";
        }
        if (Objects.equals(status, STATUS_MERGED)) {
            return "已合并";
        }
        return "未知";
    }

    private String buildShortTitle(String title) {
        String plain = stripHtml(title);
        if (plain.length() <= 80) {
            return plain;
        }
        return plain.substring(0, 80) + "...";
    }

    private String stripHtml(String content) {
        if (content == null) {
            return "";
        }
        return content.replaceAll("<[^>]+>", " ")
                .replace("&nbsp;", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String trimTo(String content, int maxLength) {
        String safeContent = stripHtml(content);
        if (safeContent.length() <= maxLength) {
            return safeContent;
        }
        return safeContent.substring(0, maxLength) + "...";
    }

    private String questionTypeLabel(Integer questionType) {
        QuestionTypeEnum questionTypeEnum = QuestionTypeEnum.fromCode(questionType);
        return questionTypeEnum == null ? "综合题型" : questionTypeEnum.getName();
    }

    private Double percent(int numerator, int denominator) {
        if (denominator <= 0) {
            return 0D;
        }
        return BigDecimal.valueOf(numerator * 100D / denominator)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }

    private String fallback(String first, String second) {
        return isBlank(first) ? (isBlank(second) ? "" : second) : first;
    }

    private boolean isBlank(String content) {
        return content == null || content.trim().isEmpty();
    }
}
