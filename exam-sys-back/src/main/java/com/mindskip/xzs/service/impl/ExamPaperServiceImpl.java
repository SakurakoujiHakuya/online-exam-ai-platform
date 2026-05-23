package com.mindskip.xzs.service.impl;

import com.mindskip.xzs.domain.*;
import com.mindskip.xzs.domain.exam.ExamPaperQuestionItemObject;
import com.mindskip.xzs.domain.exam.ExamPaperTitleItemObject;
import com.mindskip.xzs.domain.question.QuestionObject;
import com.mindskip.xzs.domain.other.KeyValue;
import java.util.Collections;
import java.util.Objects;
import com.mindskip.xzs.repository.*;
import com.mindskip.xzs.service.*;
import com.mindskip.xzs.service.enums.ActionEnum;
import com.mindskip.xzs.utility.*;
import com.mindskip.xzs.viewmodel.admin.exam.*;
import com.mindskip.xzs.viewmodel.admin.question.QuestionEditRequestVM;
import com.mindskip.xzs.viewmodel.student.dashboard.PaperFilter;
import com.mindskip.xzs.viewmodel.student.dashboard.PaperInfo;
import com.mindskip.xzs.viewmodel.student.exam.ExamPaperPageVM;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class ExamPaperServiceImpl extends BaseServiceImpl<ExamPaper> implements ExamPaperService {

    protected final static ModelMapper modelMapper = ModelMapperSingle.Instance();
    private final ExamPaperMapper examPaperMapper;
    private final QuestionMapper questionMapper;
    private final TextContentService textContentService;
    private final QuestionService questionService;
    private final SubjectService subjectService;
    private final ExamPaperAnswerMapper examPaperAnswerMapper;
    private final ExamPaperQuestionCustomerAnswerMapper examPaperQuestionCustomerAnswerMapper;
    private final TagService tagService;

    @Autowired
    public ExamPaperServiceImpl(ExamPaperMapper examPaperMapper, QuestionMapper questionMapper, TextContentService textContentService, QuestionService questionService, SubjectService subjectService, ExamPaperAnswerMapper examPaperAnswerMapper, ExamPaperQuestionCustomerAnswerMapper examPaperQuestionCustomerAnswerMapper, TagService tagService) {
        super(examPaperMapper);
        this.examPaperMapper = examPaperMapper;
        this.questionMapper = questionMapper;
        this.textContentService = textContentService;
        this.questionService = questionService;
        this.subjectService = subjectService;
        this.examPaperAnswerMapper = examPaperAnswerMapper;
        this.examPaperQuestionCustomerAnswerMapper = examPaperQuestionCustomerAnswerMapper;
        this.tagService = tagService;
    }


    @Override
    public PageInfo<ExamPaper> page(ExamPaperPageRequestVM requestVM) {
        return PageHelper.startPage(requestVM.getPageIndex(), requestVM.getPageSize(), "id desc").doSelectPageInfo(() ->
                examPaperMapper.page(requestVM));
    }

    @Override
    public PageInfo<ExamPaper> taskExamPage(ExamPaperPageRequestVM requestVM) {
        return PageHelper.startPage(requestVM.getPageIndex(), requestVM.getPageSize(), "id desc").doSelectPageInfo(() ->
                examPaperMapper.taskExamPage(requestVM));
    }

    @Override
    public PageInfo<ExamPaper> studentPage(ExamPaperPageVM requestVM) {
        return PageHelper.startPage(requestVM.getPageIndex(), requestVM.getPageSize(), "id desc").doSelectPageInfo(() ->
                examPaperMapper.studentPage(requestVM));
    }


    @Override
    @Transactional
    public ExamPaper savePaperFromVM(ExamPaperEditRequestVM examPaperEditRequestVM, User user) {
        ActionEnum actionEnum = (examPaperEditRequestVM.getId() == null) ? ActionEnum.ADD : ActionEnum.UPDATE;
        Date now = new Date();
        List<ExamPaperTitleItemVM> titleItemsVM = examPaperEditRequestVM.getTitleItems();
        List<ExamPaperTitleItemObject> frameTextContentList = frameTextContentFromVM(titleItemsVM);
        String frameTextContentStr = JsonUtil.toJsonStr(frameTextContentList);
        List<Integer> tagIds = tagService.resolveTagIds(examPaperEditRequestVM.getTagIds(), examPaperEditRequestVM.getNewTagNames(), user.getId());

        ExamPaper examPaper;
        if (actionEnum == ActionEnum.ADD) {
            examPaper = modelMapper.map(examPaperEditRequestVM, ExamPaper.class);
            TextContent frameTextContent = new TextContent(frameTextContentStr, now);
            textContentService.insertByFilter(frameTextContent);
            examPaper.setFrameTextContentId(frameTextContent.getId());
            examPaper.setCreateTime(now);
            examPaper.setCreateUser(user.getId());
            examPaper.setDeleted(false);
            examPaperFromVM(examPaperEditRequestVM, examPaper, titleItemsVM);
            examPaperMapper.insertSelective(examPaper);
        } else {
            examPaper = examPaperMapper.selectByPrimaryKey(examPaperEditRequestVM.getId());
            TextContent frameTextContent = textContentService.selectById(examPaper.getFrameTextContentId());
            frameTextContent.setContent(frameTextContentStr);
            textContentService.updateByIdFilter(frameTextContent);
            modelMapper.map(examPaperEditRequestVM, examPaper);
            examPaperFromVM(examPaperEditRequestVM, examPaper, titleItemsVM);
            examPaperMapper.updateByPrimaryKeySelective(examPaper);
        }
        tagService.syncExamPaperTags(examPaper.getId(), tagIds);
        return examPaper;
    }

    @Override
    public ExamPaperEditRequestVM examPaperToVM(Integer id) {
        ExamPaper examPaper = examPaperMapper.selectByPrimaryKey(id);
        ExamPaperEditRequestVM vm = modelMapper.map(examPaper, ExamPaperEditRequestVM.class);
        vm.setUserGroupId(examPaper.getUserGroupId());
        TextContent frameTextContent = textContentService.selectById(examPaper.getFrameTextContentId());
        List<ExamPaperTitleItemObject> examPaperTitleItemObjects = JsonUtil.toJsonListObject(frameTextContent.getContent(), ExamPaperTitleItemObject.class);
        List<Integer> questionIds = examPaperTitleItemObjects.stream()
                .flatMap(t -> t.getQuestionItems().stream()
                        .map(q -> q.getId()))
                .collect(Collectors.toList());
        List<Question> questions = questionMapper.selectByIds(questionIds);
        List<ExamPaperTitleItemVM> examPaperTitleItemVMS = examPaperTitleItemObjects.stream().map(t -> {
            ExamPaperTitleItemVM tTitleVM = modelMapper.map(t, ExamPaperTitleItemVM.class);
            List<QuestionEditRequestVM> questionItemsVM = t.getQuestionItems().stream().map(i -> {
                Question question = questions.stream().filter(q -> q.getId().equals(i.getId())).findFirst().get();
                QuestionEditRequestVM questionEditRequestVM = questionService.getQuestionEditRequestVM(question);
                questionEditRequestVM.setItemOrder(i.getItemOrder());
                return questionEditRequestVM;
            }).collect(Collectors.toList());
            tTitleVM.setQuestionItems(questionItemsVM);
            return tTitleVM;
        }).collect(Collectors.toList());
        vm.setTitleItems(examPaperTitleItemVMS);
        vm.setScore(ExamUtil.scoreToVM(examPaper.getScore()));
        vm.setTagIds(tagService.getExamPaperTagIds(id));
        vm.setTagNames(tagService.getExamPaperTagNames(id));
        return vm;
    }

    @Override
    public List<PaperInfo> indexPaper(PaperFilter paperFilter) {
        return examPaperMapper.indexPaper(paperFilter);
    }


    @Override
    public Integer selectAllCount() {
        return examPaperMapper.selectAllCount();
    }

    @Override
    public List<Integer> selectMothCount() {
        Date startTime = DateTimeUtil.getMonthStartDay();
        Date endTime = DateTimeUtil.getMonthEndDay();
        List<KeyValue> mouthCount = examPaperMapper.selectCountByDate(startTime, endTime);
        List<String> mothStartToNowFormat = DateTimeUtil.MothStartToNowFormat();
        return mothStartToNowFormat.stream().map(md -> {
            KeyValue keyValue = mouthCount.stream().filter(kv -> kv.getName().equals(md)).findAny().orElse(null);
            return null == keyValue ? 0 : keyValue.getValue();
        }).collect(Collectors.toList());
    }

    private void examPaperFromVM(ExamPaperEditRequestVM examPaperEditRequestVM, ExamPaper examPaper, List<ExamPaperTitleItemVM> titleItemsVM) {
        Integer userGroupId = subjectService.userGroupIdBySubjectId(examPaperEditRequestVM.getSubjectId());
        Integer questionCount = titleItemsVM.stream()
                .mapToInt(t -> t.getQuestionItems().size()).sum();
        Integer score = titleItemsVM.stream().
                flatMapToInt(t -> t.getQuestionItems().stream()
                        .mapToInt(q -> ExamUtil.scoreFromVM(q.getScore()))
                ).sum();
        examPaper.setQuestionCount(questionCount);
        examPaper.setScore(score);
        examPaper.setUserGroupId(userGroupId);
    }

    private List<ExamPaperTitleItemObject> frameTextContentFromVM(List<ExamPaperTitleItemVM> titleItems) {
        AtomicInteger index = new AtomicInteger(1);
        return titleItems.stream().map(t -> {
            ExamPaperTitleItemObject titleItem = modelMapper.map(t, ExamPaperTitleItemObject.class);
            List<ExamPaperQuestionItemObject> questionItems = t.getQuestionItems().stream()
                    .map(q -> {
                        ExamPaperQuestionItemObject examPaperQuestionItemObject = modelMapper.map(q, ExamPaperQuestionItemObject.class);
                        examPaperQuestionItemObject.setItemOrder(index.getAndIncrement());
                        return examPaperQuestionItemObject;
                    })
                    .collect(Collectors.toList());
            titleItem.setQuestionItems(questionItems);
            return titleItem;
        }).collect(Collectors.toList());
    }

    @Override
    public PaperStatsVM statistics(Integer id) {
        ExamPaper examPaper = examPaperMapper.selectByPrimaryKey(id);
        if (examPaper == null) {
            return null;
        }
        List<ExamPaperAnswer> answers = examPaperAnswerMapper.selectListByPaperId(id);
        List<ExamPaperQuestionCustomerAnswer> questionAnswers = examPaperQuestionCustomerAnswerMapper.selectListByPaperId(id);

        PaperStatsVM vm = new PaperStatsVM();
        vm.setId(id);
        vm.setName(examPaper.getName());
        vm.setPaperScore(examPaper.getScore());

        if (answers == null || answers.isEmpty()) {
            vm.setTotalCount(0);
            return vm;
        }

        vm.setTotalCount(answers.size());
        double maxScore = answers.stream().filter(Objects::nonNull).mapToInt(a -> a.getUserScore() == null ? 0 : a.getUserScore()).max().orElse(0);
        double minScore = answers.stream().filter(Objects::nonNull).mapToInt(a -> a.getUserScore() == null ? 0 : a.getUserScore()).min().orElse(0);
        double avgScore = answers.stream().filter(Objects::nonNull).mapToInt(a -> a.getUserScore() == null ? 0 : a.getUserScore()).average().orElse(0);
        double avgDoTime = answers.stream().filter(Objects::nonNull).mapToInt(a -> a.getDoTime() == null ? 0 : a.getDoTime()).average().orElse(0);

        Integer paperScore = examPaper.getScore() == null ? 0 : examPaper.getScore();
        long passCount = answers.stream().filter(Objects::nonNull).filter(a -> (a.getUserScore() == null ? 0 : a.getUserScore()) >= paperScore * 0.6).count();
        long excellenceCount = answers.stream().filter(Objects::nonNull).filter(a -> (a.getUserScore() == null ? 0 : a.getUserScore()) >= paperScore * 0.85).count();

        vm.setMaxScore(String.format("%.1f", maxScore / 10.0));
        vm.setMinScore(String.format("%.1f", minScore / 10.0));
        vm.setAvgScore(String.format("%.1f", avgScore / 10.0));
        vm.setAvgDoTime(String.format("%.0f", avgDoTime));
        vm.setPassRate(String.format("%.1f%%", (double) passCount / answers.size() * 100));
        vm.setExcellenceRate(String.format("%.1f%%", (double) excellenceCount / answers.size() * 100));

        // Score Distribution
        List<KeyValue> scoreDistribution = Arrays.asList(
                new KeyValue("0-60%", (int) answers.stream().filter(Objects::nonNull).filter(a -> (a.getUserScore() == null ? 0 : a.getUserScore()) < paperScore * 0.6).count()),
                new KeyValue("60-85%", (int) answers.stream().filter(Objects::nonNull).filter(a -> (a.getUserScore() == null ? 0 : a.getUserScore()) >= paperScore * 0.6 && (a.getUserScore() == null ? 0 : a.getUserScore()) < paperScore * 0.85).count()),
                new KeyValue("85-100%", (int) excellenceCount)
        );
        vm.setScoreDistribution(scoreDistribution);

        // Question Stats
        TextContent frameTextContent = textContentService.selectById(examPaper.getFrameTextContentId());
        if (frameTextContent == null || frameTextContent.getContent() == null) {
            vm.setQuestionItems(Collections.emptyList());
            return vm;
        }
        List<ExamPaperTitleItemObject> titleItems = JsonUtil.toJsonListObject(frameTextContent.getContent(), ExamPaperTitleItemObject.class);
        if (titleItems == null) {
            vm.setQuestionItems(Collections.emptyList());
            return vm;
        }

        List<Integer> questionIds = titleItems.stream().filter(Objects::nonNull)
                .flatMap(t -> t.getQuestionItems() == null ? java.util.stream.Stream.empty() : t.getQuestionItems().stream())
                .filter(Objects::nonNull)
                .map(ExamPaperQuestionItemObject::getId)
                .collect(Collectors.toList());
        List<Question> questions = questionIds.isEmpty() ? Collections.emptyList() : questionMapper.selectByIds(questionIds);

        List<QuestionStatsVM> questionItems = titleItems.stream().filter(Objects::nonNull).flatMap(t -> {
            if (t.getQuestionItems() == null) return java.util.stream.Stream.empty();
            return t.getQuestionItems().stream().filter(Objects::nonNull).map(q -> {
                QuestionStatsVM qvm = new QuestionStatsVM();
                qvm.setId(q.getId());
                qvm.setItemOrder(q.getItemOrder());
                
                Question question = questions.stream().filter(qu -> qu.getId().equals(q.getId())).findFirst().orElse(null);
                if (question != null) {
                    qvm.setQuestionType(question.getQuestionType());
                    qvm.setCorrect(question.getCorrect());
                    TextContent questionInfoTextContent = textContentService.selectById(question.getInfoTextContentId());
                    if (questionInfoTextContent != null) {
                        QuestionObject questionObject = JsonUtil.toJsonObject(questionInfoTextContent.getContent(), QuestionObject.class);
                        qvm.setTitle(questionObject.getTitleContent());
                        qvm.setItems(JsonUtil.toJsonStr(questionObject.getQuestionItemObjects()));
                    }
                }

                List<ExamPaperQuestionCustomerAnswer> qAnswers = questionAnswers.stream().filter(qa -> qa != null && q.getId().equals(qa.getQuestionId())).collect(Collectors.toList());
                if (qAnswers.isEmpty()) {
                    qvm.setTotalCount(0);
                    qvm.setCorrectRate("0%");
                    qvm.setAvgDoTime("0");
                } else {
                    qvm.setTotalCount(qAnswers.size());
                    long correctCount = qAnswers.stream().filter(a -> a.getDoRight() != null && a.getDoRight()).count();
                    qvm.setCorrectRate(String.format("%.1f%%", (double) correctCount / qAnswers.size() * 100));
                    double qAvgDoTime = qAnswers.stream().mapToInt(a -> a.getDoTime() == null ? 0 : a.getDoTime()).average().orElse(0);
                    qvm.setAvgDoTime(String.format("%.1f", qAvgDoTime));

                    // Answer Distribution
                    List<KeyValue> distribution = qAnswers.stream()
                        .filter(Objects::nonNull)
                        .filter(a -> a.getAnswer() != null)
                        .collect(Collectors.groupingBy(ExamPaperQuestionCustomerAnswer::getAnswer, Collectors.counting()))
                        .entrySet().stream()
                        .map(e -> new KeyValue(e.getKey(), e.getValue().intValue()))
                        .collect(Collectors.toList());
                    qvm.setAnswerDistribution(distribution);
                }
                return qvm;
            });
        }).collect(Collectors.toList());
        vm.setQuestionItems(questionItems);

        return vm;
    }
}
