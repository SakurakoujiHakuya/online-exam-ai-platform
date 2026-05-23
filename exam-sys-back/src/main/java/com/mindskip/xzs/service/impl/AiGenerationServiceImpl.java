package com.mindskip.xzs.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindskip.xzs.domain.AiConfig;
import com.mindskip.xzs.domain.ExamPaperAnswer;
import com.mindskip.xzs.domain.ExamPaperQuestionCustomerAnswer;
import com.mindskip.xzs.domain.QuestionFeedback;
import com.mindskip.xzs.domain.Subject;
import com.mindskip.xzs.domain.User;
import com.mindskip.xzs.domain.enums.ExamPaperTypeEnum;
import com.mindskip.xzs.repository.ExamPaperAnswerMapper;
import com.mindskip.xzs.repository.ExamPaperQuestionCustomerAnswerMapper;
import com.mindskip.xzs.service.AiConfigService;
import com.mindskip.xzs.service.AiGenerationService;
import com.mindskip.xzs.service.ExamPaperService;
import com.mindskip.xzs.service.QuestionService;
import com.mindskip.xzs.service.SubjectService;
import com.mindskip.xzs.service.UserService;
import com.mindskip.xzs.utility.DateTimeUtil;
import com.mindskip.xzs.viewmodel.admin.ai.AiGenerateRequestVM;
import com.mindskip.xzs.viewmodel.ai.LearningAdviceVM;
import com.mindskip.xzs.viewmodel.ai.LearningAnalysisRequestVM;
import com.mindskip.xzs.viewmodel.ai.LearningAnalysisVM;
import com.mindskip.xzs.viewmodel.ai.LearningSubjectStatVM;
import com.mindskip.xzs.viewmodel.ai.LearningTrendPointVM;
import com.mindskip.xzs.viewmodel.ai.LearningTypeStatVM;
import com.mindskip.xzs.viewmodel.admin.exam.ExamPaperEditRequestVM;
import com.mindskip.xzs.viewmodel.admin.exam.ExamPaperTitleItemVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionEditItemVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionEditRequestVM;
import com.mindskip.xzs.viewmodel.collaboration.CollaborationAggregateInsightVM;
import com.mindskip.xzs.viewmodel.collaboration.CollaborationFeedbackAnalysisVM;
import com.mindskip.xzs.viewmodel.collaboration.CollaborationRecommendationCopyVM;
import com.mindskip.xzs.viewmodel.collaboration.CollaborationSolutionAnalysisVM;
import com.mindskip.xzs.viewmodel.collaboration.DailyRecommendationItemVM;
import com.mindskip.xzs.viewmodel.student.ai.AiPaperGenerateVM;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiGenerationServiceImpl implements AiGenerationService {

    private final static Logger logger = LoggerFactory.getLogger(AiGenerationServiceImpl.class);
    private final AiConfigService aiConfigService;
    private final ExamPaperService examPaperService;
    private final QuestionService questionService;
    private final UserService userService;
    private final SubjectService subjectService;
    private final ExamPaperAnswerMapper examPaperAnswerMapper;
    private final ExamPaperQuestionCustomerAnswerMapper examPaperQuestionCustomerAnswerMapper;
    private static final int AI_CONNECT_TIMEOUT_MILLIS = 10000;
    private static final int AI_READ_TIMEOUT_MILLIS = 120000;
    private final RestTemplate restTemplate = buildRestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiGenerationServiceImpl(AiConfigService aiConfigService, ExamPaperService examPaperService,
                                   QuestionService questionService, UserService userService,
                                   SubjectService subjectService, ExamPaperAnswerMapper examPaperAnswerMapper,
                                   ExamPaperQuestionCustomerAnswerMapper examPaperQuestionCustomerAnswerMapper) {
        this.aiConfigService = aiConfigService;
        this.examPaperService = examPaperService;
        this.questionService = questionService;
        this.userService = userService;
        this.subjectService = subjectService;
        this.examPaperAnswerMapper = examPaperAnswerMapper;
        this.examPaperQuestionCustomerAnswerMapper = examPaperQuestionCustomerAnswerMapper;
    }

    @Override
    public Map<String, Object> generateQuestion(AiGenerateRequestVM model) {
        AiConfig config = getFirstActiveConfig();
        String systemPrompt = getSystemPrompt(model.getQuestionType());
        String userPrompt = String.format("知识点/主题: %s\n参考文本: %s\n难度系数: %d星", 
                model.getTopic(), model.getReferenceText() != null ? model.getReferenceText() : "无", model.getDifficult());

        String aiResponse = callAi(config, systemPrompt, userPrompt);
        return parseQuestionJson(aiResponse);
    }

    @Override
    public String generateAnalyze(Map<String, Object> model) {
        AiConfig config = getFirstActiveConfig();
        String systemPrompt = "你是一个专业的教育专家，请根据提供的【题干】和【选项/答案】，生成一段详细、易懂的题目解析。直接返回解析内容，不要包含其他解释。";
        String userPrompt = String.format("题干: %s\n内容: %s", model.get("title"), model.get("content"));

        return callAi(config, systemPrompt, userPrompt);
    }

    @Override
    public String generateStats(String context) {
        AiConfig config = getFirstActiveConfig();
        String systemPrompt = "你是一个专业的考试数据分析师。请根据提供的考试统计数据（可能是试卷整体数据或单题数据），进行深入分析，指出优缺点，并给出针对性的教学建议。请直接返回分析结论和建议，使用 Markdown 格式，保持专业且简洁。不要包含 <think> 标签或推理过程。";
        return callAi(config, systemPrompt, context);
    }

    @Override
    @Transactional
    public ExamPaperEditRequestVM generatePaperPreview(AiPaperGenerateVM model, User user) {
        List<QuestionEditRequestVM> allQuestions = new ArrayList<>();
        
        for (Map.Entry<Integer, Integer> entry : model.getQuestionCountMap().entrySet()) {
            Integer type = entry.getKey();
            Integer count = entry.getValue();
            if (count > 0) {
                // 生成一类题目的 prompt
                List<QuestionEditRequestVM> typeQuestions = generateQuestionsByType(type, count, model.getTopic(), model.getDifficult(), model.getSubjectId());
                allQuestions.addAll(typeQuestions);
            }
        }

        if (allQuestions.isEmpty()) {
            throw new RuntimeException("未能生成任何题目，请检查输入参数");
        }

        // 重要：在组装试卷前，必须先将生成的题目保存到数据库
        for (QuestionEditRequestVM qvm : allQuestions) {
            // 设置一些默认值，防止由于缺少字段导致的保存失败
            if (qvm.getScore() == null) qvm.setScore("5");
            qvm.setIsAi(1); // 标记为 AI 生成
            // 调用 questionService 保存题目，获取数据库生成的 ID
            com.mindskip.xzs.domain.Question savedQuestion = questionService.insertFullQuestion(qvm, user.getId());
            qvm.setId(savedQuestion.getId());
        }

        // 组装试卷
        ExamPaperEditRequestVM paperVM = new ExamPaperEditRequestVM();
        paperVM.setSubjectId(model.getSubjectId());
        paperVM.setUserGroupId(user.getUserGroupId() != null ? user.getUserGroupId() : 1);
        paperVM.setPaperType(model.getPaperType() != null ? model.getPaperType() : ExamPaperTypeEnum.AI.getCode());
        String timeStr = LocalDateTime.now(ZoneId.of(DateTimeUtil.APP_TIME_ZONE)).format(DateTimeFormatter.ofPattern("MMddHHmm"));
        paperVM.setName("AI练习-" + model.getTopic() + "-" + timeStr);
        paperVM.setSuggestTime(allQuestions.size() * 2);

        ExamPaperTitleItemVM titleItem = new ExamPaperTitleItemVM();
        titleItem.setName("AI智能练习题目");
        titleItem.setQuestionItems(allQuestions);
        paperVM.setTitleItems(Collections.singletonList(titleItem));

        // 计算总分
        int totalScore = allQuestions.stream().mapToInt(q -> Integer.parseInt(q.getScore())).sum();
        paperVM.setScore(String.valueOf(totalScore));

        return paperVM;
    }

    @Override
    @Transactional
    public Integer generatePaper(AiPaperGenerateVM model, User user) {
        ExamPaperEditRequestVM paperVM = generatePaperPreview(model, user);
        return examPaperService.savePaperFromVM(paperVM, user).getId();
    }

    @Override
    public LearningAnalysisVM generateLearningAnalysis(Integer studentId, LearningAnalysisRequestVM model) {
        LearningAnalysisRequestVM safeModel = model == null ? new LearningAnalysisRequestVM() : model;
        Integer rangeDays = safeModel.getRangeDays() == null || safeModel.getRangeDays() <= 0 ? 15 : safeModel.getRangeDays();
        Date endTime = new Date();
        Calendar calendar = Calendar.getInstance(DateTimeUtil.CHINA_TIME_ZONE);
        calendar.setTime(endTime);
        calendar.add(Calendar.DAY_OF_YEAR, -(rangeDays - 1));
        Date startTime = calendar.getTime();

        User student = userService.selectById(studentId);
        Subject subject = safeModel.getSubjectId() == null ? null : subjectService.selectById(safeModel.getSubjectId());
        List<ExamPaperAnswer> paperAnswers = examPaperAnswerMapper.selectByUserIdAndDateRange(studentId, startTime, endTime, safeModel.getSubjectId());
        List<ExamPaperQuestionCustomerAnswer> questionAnswers = examPaperQuestionCustomerAnswerMapper.selectByUserIdAndDateRange(studentId, startTime, endTime, safeModel.getSubjectId());

        LearningAnalysisVM vm = new LearningAnalysisVM();
        vm.setUserId(studentId);
        vm.setUserName(student == null ? "" : student.getUserName());
        vm.setRealName(student == null ? "" : student.getRealName());
        vm.setSubjectId(safeModel.getSubjectId());
        vm.setSubjectName(subject == null ? "全部学科" : subject.getName());
        vm.setRangeDays(rangeDays);

        int totalPapers = paperAnswers.size();
        int totalQuestions = questionAnswers.isEmpty()
                ? paperAnswers.stream().mapToInt(p -> defaultInt(p.getQuestionCount())).sum()
                : questionAnswers.size();
        int totalCorrectQuestions = questionAnswers.isEmpty()
                ? paperAnswers.stream().mapToInt(p -> defaultInt(p.getQuestionCorrect())).sum()
                : (int) questionAnswers.stream().filter(q -> Boolean.TRUE.equals(q.getDoRight())).count();
        int practiceDays = (int) paperAnswers.stream()
                .filter(p -> p.getCreateTime() != null)
                .map(p -> DateTimeUtil.dateFormat(p.getCreateTime(), DateTimeUtil.STANDER_SHORT_FORMAT))
                .distinct()
                .count();

        vm.setTotalPapers(totalPapers);
        vm.setTotalQuestions(totalQuestions);
        vm.setTotalCorrectQuestions(totalCorrectQuestions);
        vm.setPracticeDays(practiceDays);
        vm.setAvgScoreRate(calculateAverageScoreRate(paperAnswers));
        vm.setAvgQuestionCorrectRate(totalQuestions == 0 ? 0D : round(totalCorrectQuestions * 100D / totalQuestions));
        vm.setAvgDoTime(calculateAverageDoTime(paperAnswers));
        vm.setRecentTrend(buildTrend(paperAnswers));
        vm.setQuestionTypeStats(buildTypeStats(questionAnswers));
        vm.setSubjectStats(buildSubjectStats(studentId, startTime, endTime, safeModel.getSubjectId()));
        vm.setReport(buildLearningAdvice(vm));
        return vm;
    }

    @Override
    public CollaborationFeedbackAnalysisVM generateFeedbackAnalysis(QuestionEditRequestVM questionVM, String feedbackType, String feedbackContent) {
        AiConfig config = getFirstActiveConfig();
        String systemPrompt = "你是一名教学协同分析助手。请分析学生对题目的反馈，只返回 JSON 对象，不要返回 markdown、解释文字、代码块或 think 标签。"
                + "JSON 字段必须包含 category、summary、suggestion。"
                + "category 必须从以下标签中选择一个：题干表述不清、答案有争议、解析看不懂、难度不匹配、知识点标签可疑、其他。"
                + "summary 用 1 句概括学生核心问题，suggestion 用 1 句给教师可执行建议。";
        String userPrompt = "题目上下文：\n"
                + buildQuestionContext(questionVM)
                + "\n学生自报反馈类型：" + safeText(feedbackType, "未提供")
                + "\n学生原始反馈：\n" + safeText(feedbackContent, "无");
        String aiResponse = callAi(config, systemPrompt, userPrompt);
        CollaborationFeedbackAnalysisVM result = readJsonObject(aiResponse, CollaborationFeedbackAnalysisVM.class);
        result.setSource("llm");
        return result;
    }

    @Override
    public CollaborationSolutionAnalysisVM generateSolutionAnalysis(QuestionEditRequestVM questionVM, String solutionContent) {
        AiConfig config = getFirstActiveConfig();
        String systemPrompt = "你是一名教学协同分析助手。请分析学生提交的解题思路或错因总结，只返回 JSON 对象，不要返回 markdown、解释文字、代码块或 think 标签。"
                + "JSON 字段必须包含 qualityScore、summary、suggestion。"
                + "qualityScore 为 0 到 100 的整数，summary 用 1 句概括内容价值，suggestion 用 1 句给教师审核建议。";
        String userPrompt = "题目上下文：\n"
                + buildQuestionContext(questionVM)
                + "\n学生提交内容：\n" + safeText(solutionContent, "无");
        String aiResponse = callAi(config, systemPrompt, userPrompt);
        CollaborationSolutionAnalysisVM result = readJsonObject(aiResponse, CollaborationSolutionAnalysisVM.class);
        result.setSource("llm");
        return result;
    }

    @Override
    public CollaborationAggregateInsightVM generateAggregateFeedbackInsight(QuestionEditRequestVM questionVM, List<QuestionFeedback> relatedFeedbacks) {
        AiConfig config = getFirstActiveConfig();
        String systemPrompt = "你是一名教学协同分析助手。请综合多条学生反馈，生成题目层面的聚合结论，只返回 JSON 对象，不要返回 markdown、解释文字、代码块或 think 标签。"
                + "JSON 字段必须包含 summary、suggestion。"
                + "summary 需要概括整体反馈趋势，suggestion 需要给教师明确的优化方向。";
        String userPrompt = "题目上下文：\n"
                + buildQuestionContext(questionVM)
                + "\n相关反馈列表：\n" + buildRelatedFeedbackContext(relatedFeedbacks);
        String aiResponse = callAi(config, systemPrompt, userPrompt);
        CollaborationAggregateInsightVM result = readJsonObject(aiResponse, CollaborationAggregateInsightVM.class);
        result.setSource("llm");
        return result;
    }

    @Override
    public CollaborationRecommendationCopyVM generateRecommendationCopy(List<DailyRecommendationItemVM> items, List<QuestionFeedback> recentFeedbacks, Integer rangeDays) {
        AiConfig config = getFirstActiveConfig();
        String systemPrompt = "你是一名学习推荐文案助手。你会基于已经筛好的候选练习方向润色推荐文案，但不能改动推荐策略本身。"
                + "只返回 JSON 对象，不要返回 markdown、解释文字、代码块或 think 标签。"
                + "JSON 字段必须包含 summary、items。"
                + "items 中每个对象必须保留原有 strategyKey、subjectId、subjectName、questionType、questionTypeName、priority、seedQuestionIds，"
                + "只允许重写 title 和 reason，summary 需概括今日推荐依据。";
        String userPrompt = "统计范围天数：" + (rangeDays == null ? 15 : rangeDays)
                + "\n近期反馈摘要：\n" + buildRecentFeedbackSummary(recentFeedbacks)
                + "\n候选推荐项(JSON)：\n" + toJson(items);
        String aiResponse = callAi(config, systemPrompt, userPrompt);
        CollaborationRecommendationCopyVM result = readJsonObject(aiResponse, CollaborationRecommendationCopyVM.class);
        result.setSource("llm");
        return result;
    }

    private List<QuestionEditRequestVM> generateQuestionsByType(Integer type, Integer count, String topic, Integer difficult, Integer subjectId) {
        AiConfig config = getFirstActiveConfig();
        String formatDesc = getFormatDesc(type);
        String typeName = getTypeName(type);
        String sharedReadingRule = buildSharedReadingRule(type, count, topic);
        
        String systemPrompt = String.format("你是一个专业的教育命题专家。请严格按照 JSON 格式出【%d】道关于知识点【%s】的【%s】。难度要求为【%d】星（1-5星）。\n" +
                "【格式要求】\n" +
                "1. 必须且只能直接返回一个完整的 JSON 数组，不要包含任何解释性文字、<think> 标签或 markdown 代码块。\n" +
                "2. 数组中每个对象的格式必须完全符合以下示例：\n" +
                "   [%s, ...]\n" +
                "3. 所有属性名和字符串值必须用双引号包围。\n" +
                "4. 字符串值内部禁止出现英文双引号；需要引用原文时一律使用中文引号“”。\n" +
                "5. 禁止使用 HTML 标签、XML 标签、markdown、反斜杠和未转义换行；title、content、analyze 都必须是纯文本。\n" +
                "6. correct 必须与题型匹配，score 和 difficult 必须是数字。\n" +
                "%s",
                count, topic, typeName, difficult, formatDesc, sharedReadingRule);
        
        String userPrompt = "请立即生成并返回 JSON 数组。";
        String aiResponse = callAi(config, systemPrompt, userPrompt);
        
        try {
            List<Map<String, Object>> questionMaps = readQuestionMapList(config, aiResponse, typeName, count, formatDesc);
            List<QuestionEditRequestVM> vms = new ArrayList<>();
            for (Map<String, Object> map : questionMaps) {
                QuestionEditRequestVM vm = mapToQuestionVM(map, type, subjectId);
                vms.add(vm);
            }
            return vms;
        } catch (Exception e) {
            logger.error("Parse AI Multi-Question JSON error: " + aiResponse, e);
            throw new RuntimeException(typeName + "生成失败：" + e.getMessage());
        }
    }

    private String buildSharedReadingRule(Integer type, Integer count, String topic) {
        if (type == null || type != 3 || count == null || count < 2 || topic == null) {
            return "";
        }
        String lowerTopic = topic.toLowerCase(Locale.ROOT);
        boolean sharedReading = topic.contains("阅读理解")
                || topic.contains("同一道阅读")
                || topic.contains("同一篇")
                || topic.contains("阅读材料")
                || lowerTopic.contains("reading");
        if (!sharedReading) {
            return "";
        }
        return "7. 特别要求：本组判断题必须围绕同一篇小学英语阅读材料生成。"
                + "数组里的每一道判断题都要基于同一篇短文；每个 title 必须以完全相同的【阅读材料：...】开头，"
                + "再写【判断：...】陈述句，便于前端即使按独立题展示也能保持上下文一致。";
    }

    private List<Map<String, Object>> readQuestionMapList(AiConfig config, String aiResponse, String typeName,
                                                          Integer count, String formatDesc) throws Exception {
        String jsonStr = extractJsonArray(aiResponse);
        try {
            return objectMapper.readValue(jsonStr, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception parseError) {
            logger.warn("AI {} JSON parse failed, trying repair. Error={}", typeName, parseError.getMessage());
            String repaired = repairJsonArray(config, jsonStr, typeName, count, formatDesc, parseError.getMessage());
            String repairedJson = extractJsonArray(repaired);
            return objectMapper.readValue(repairedJson, new TypeReference<List<Map<String, Object>>>() {});
        }
    }

    private String repairJsonArray(AiConfig config, String brokenJson, String typeName, Integer count,
                                   String formatDesc, String parseError) {
        String systemPrompt = "你是 JSON 修复器。用户会给你一段不合法的题目 JSON 数组文本。"
                + "请只返回修复后的合法 JSON 数组，不要解释，不要 markdown，不要代码块，不要 think 标签。"
                + "必须保留题目原意；无法保留的字段可合理补全。"
                + "所有字符串必须是纯文本，禁止 HTML 标签，禁止字符串外出现任何文字。"
                + "字符串内部如果需要引用原文，使用中文引号“”，不要使用英文双引号。";
        String userPrompt = "题型：" + typeName
                + "\n期望数量：" + count
                + "\n对象格式示例：" + formatDesc
                + "\n解析错误：" + parseError
                + "\n待修复文本：\n" + brokenJson;
        return callAi(config, systemPrompt, userPrompt);
    }

    private String getFormatDesc(Integer type) {
        switch (type) {
            case 1: return "{\"title\": \"\", \"items\": [{\"prefix\": \"A\", \"content\": \"\"}, ...], \"correct\": \"A\", \"analyze\": \"\", \"score\": 5, \"difficult\": 3}";
            case 2: return "{\"title\": \"\", \"items\": [{\"prefix\": \"A\", \"content\": \"\"}, ...], \"correct\": \"A,B\", \"analyze\": \"\", \"score\": 10, \"difficult\": 4}";
            case 3: return "{\"title\": \"\", \"correct\": \"正确\", \"analyze\": \"\", \"score\": 2, \"difficult\": 2}";
            case 4: return "{\"title\": \"题干中的空格请用下划线____表示\", \"correct\": \"多个空请用逗号隔开\", \"analyze\": \"\", \"score\": 5, \"difficult\": 3}";
            case 5: return "{\"title\": \"\", \"correct\": \"参考答案\", \"analyze\": \"\", \"score\": 20, \"difficult\": 5}";
            default: return "";
        }
    }

    private String getTypeName(Integer type) {
        switch (type) {
            case 1: return "单选题";
            case 2: return "多选题";
            case 3: return "判断题";
            case 4: return "填空题";
            case 5: return "简答题";
            default: return "未知题型";
        }
    }

    private String extractJsonArray(String content) {
        String jsonStr = content.trim();
        
        // 强力去除 <think>...</think> 块
        if (jsonStr.contains("<think>")) {
            int endThink = jsonStr.lastIndexOf("</think>");
            if (endThink != -1) {
                jsonStr = jsonStr.substring(endThink + 8).trim();
            } else {
                int startThink = jsonStr.indexOf("<think>");
                int firstBracketAfterThink = jsonStr.indexOf("[", startThink);
                if (firstBracketAfterThink != -1) {
                    jsonStr = jsonStr.substring(firstBracketAfterThink).trim();
                }
            }
        }
        
        // 针对某些模型可能返回 ```json ... ``` 的情况
        if (jsonStr.contains("```json")) {
            int start = jsonStr.indexOf("```json") + 7;
            int end = jsonStr.lastIndexOf("```");
            if (end > start) {
                jsonStr = jsonStr.substring(start, end).trim();
            }
        } else if (jsonStr.contains("```")) {
            int start = jsonStr.indexOf("```") + 3;
            int end = jsonStr.lastIndexOf("```");
            if (end > start) {
                jsonStr = jsonStr.substring(start, end).trim();
            }
        }

        int firstBracket = jsonStr.indexOf("[");
        int lastBracket = jsonStr.lastIndexOf("]");
        if (firstBracket != -1 && lastBracket != -1 && lastBracket > firstBracket) {
            jsonStr = jsonStr.substring(firstBracket, lastBracket + 1);
        }
        
        // 最后的简单补救：修正一些明显的 JSON 语法错误（如常见的引号后漏掉冒号，虽然不常用但可以尝试）
        // 比如把 "correct"" 替换为 "correct":
        // 但为了通用性，这里只做简单的 trim
        return jsonStr;
    }

    private QuestionEditRequestVM mapToQuestionVM(Map<String, Object> map, Integer type, Integer subjectId) {
        QuestionEditRequestVM vm = new QuestionEditRequestVM();
        vm.setQuestionType(type);
        vm.setSubjectId(subjectId);
        vm.setTitle(stripUnsafeAiText(asString(map.get("title"), "")));
        vm.setAnalyze(stripUnsafeAiText(asString(map.get("analyze"), "")));
        vm.setScore(String.valueOf(asInt(map.get("score"), 5)));
        vm.setDifficult(asInt(map.get("difficult"), 3));
        
        List<QuestionEditItemVM> items = new ArrayList<>();
        vm.setItems(items);

        if (type == 1 || type == 2) {
            Object itemsObj = map.get("items");
            if (itemsObj instanceof List) {
                List<Map<String, Object>> itemsList = (List<Map<String, Object>>) itemsObj;
                for (Map<String, Object> itemMap : itemsList) {
                    QuestionEditItemVM item = new QuestionEditItemVM();
                    item.setPrefix(asString(itemMap.get("prefix"), ""));
                    item.setContent(stripUnsafeAiText(asString(itemMap.get("content"), "")));
                    items.add(item);
                }
            }
            vm.setCorrect(asString(map.get("correct"), ""));
        } else if (type == 3) { // 判断题
            // 自动补齐判断题选项
            QuestionEditItemVM item1 = new QuestionEditItemVM();
            item1.setPrefix("A");
            item1.setContent("正确");
            items.add(item1);
            
            QuestionEditItemVM item2 = new QuestionEditItemVM();
            item2.setPrefix("B");
            item2.setContent("错误");
            items.add(item2);
            
            String correct = asString(map.get("correct"), "");
            if (correct.contains("错") || correct.equalsIgnoreCase("false") || correct.equalsIgnoreCase("B")) {
                vm.setCorrect("错误");
            } else {
                vm.setCorrect("正确");
            }
        } else if (type == 4) { // 填空题
            String correct = asString(map.get("correct"), "");
            vm.setCorrect(correct);
            // 填空题的每一个填空都需要一个 QuestionEditItemVM，content 为正确答案
            String[] answers = correct.split("[,，/]");
            int prefixIdx = 1;
            for (String ans : answers) {
                QuestionEditItemVM item = new QuestionEditItemVM();
                item.setPrefix(String.valueOf(prefixIdx++));
                item.setContent(ans.trim());
                items.add(item);
            }
        } else if (type == 5) { // 简答题
            vm.setCorrect(asString(map.get("correct"), ""));
        }
        
        return vm;
    }

    private String asString(Object value, String fallback) {
        if (value == null) {
            return fallback;
        }
        String text = String.valueOf(value).trim();
        return text.isEmpty() ? fallback : text;
    }

    private Integer asInt(Object value, Integer fallback) {
        if (value == null) {
            return fallback;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        try {
            return Integer.parseInt(String.valueOf(value).trim());
        } catch (Exception e) {
            return fallback;
        }
    }

    private String stripUnsafeAiText(String text) {
        if (text == null) {
            return "";
        }
        return text.replaceAll("<[^>]+>", "")
                .replace("\\\"", "”")
                .replace("\"", "”")
                .trim();
    }

    private AiConfig getFirstActiveConfig() {
        // 优先获取管理员手动设置的启用配置
        AiConfig active = aiConfigService.getActive();
        if (active != null) {
            return active;
        }
        // 回退：如果没有任何配置被标记为启用，则使用第一条
        List<AiConfig> configs = aiConfigService.allList();
        if (configs.isEmpty()) {
            throw new RuntimeException("请先在系统配置中添加 AI 接口配置");
        }
        return configs.get(0);
    }

    private String getSystemPrompt(Integer questionType) {
        String typeDesc;
        String formatDesc;
        switch (questionType) {
            case 1: 
                typeDesc = "单选题";
                formatDesc = "{\"title\": \"\", \"items\": [{\"prefix\": \"A\", \"content\": \"\"}, ...], \"correct\": \"A\", \"analyze\": \"\", \"score\": 5, \"difficult\": 3}";
                break;
            case 2: 
                typeDesc = "多选题";
                formatDesc = "{\"title\": \"\", \"items\": [{\"prefix\": \"A\", \"content\": \"\"}, ...], \"correct\": \"A,B\", \"analyze\": \"\", \"score\": 10, \"difficult\": 4}";
                break;
            case 3: 
                typeDesc = "判断题";
                formatDesc = "{\"title\": \"\", \"correct\": \"正确\", \"analyze\": \"\", \"score\": 2, \"difficult\": 2}";
                break;
            case 4: 
                typeDesc = "填空题";
                formatDesc = "{\"title\": \"题干中的空格请用下划线____表示\", \"correct\": \"多个空请用逗号隔开\", \"analyze\": \"\", \"score\": 5, \"difficult\": 3}";
                break;
            case 5: 
                typeDesc = "简答题";
                formatDesc = "{\"title\": \"\", \"correct\": \"参考答案\", \"analyze\": \"\", \"score\": 20, \"difficult\": 5}";
                break;
            default:
                throw new RuntimeException("不支持的题目类型");
        }

        return String.format("你是一个专业的教育命题专家。请出一道【%s】。必须直接返回 JSON 对象，不要包含 <think> 标签、推理过程、总结、对话或 markdown 代码块标识。只返回 JSON 对象内容，不要有任何前导或后继文字。所有字符串必须是纯文本，禁止 HTML 标签；字符串内部需要引用原文时使用中文引号“”，不要使用英文双引号。JSON 结构如下: %s", typeDesc, formatDesc);
    }

    private String callAi(AiConfig config, String systemPrompt, String userPrompt) {
        long startTime = System.currentTimeMillis();
        String requestUrl = config.getBaseUrl() + "/chat/completions";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(config.getApiKey());

            Map<String, Object> body = new HashMap<>();
            body.put("model", config.getModelName());
            
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(createMessage("system", systemPrompt));
            messages.add(createMessage("user", userPrompt));
            body.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(requestUrl, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                if (responseBody == null) {
                    throw new RuntimeException("AI 响应体为空");
                }
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (choices == null || choices.isEmpty()) {
                    throw new RuntimeException("AI 返回内容为空 (choices is empty)");
                }
                Map<String, Object> firstChoice = choices.get(0);
                Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                if (message == null) {
                    throw new RuntimeException("AI 返回消息为空");
                }
                logger.info("AI call success: URL={}, Model={}, Duration={}ms", requestUrl, config.getModelName(), System.currentTimeMillis() - startTime);
                return (String) message.get("content");
            } else {
                throw new RuntimeException("AI 接口状态异常: " + response.getStatusCodeValue());
            }
        } catch (Exception e) {
            logger.error("AI call error: URL=" + requestUrl + ", Model=" + config.getModelName() + ", Duration=" + (System.currentTimeMillis() - startTime) + "ms, Error=" + e.getMessage(), e);
            throw new RuntimeException("AI 服务通讯异常: " + e.getMessage());
        }
    }

    private RestTemplate buildRestTemplate() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(AI_CONNECT_TIMEOUT_MILLIS);
        requestFactory.setReadTimeout(AI_READ_TIMEOUT_MILLIS);
        return new RestTemplate(requestFactory);
    }

    private Map<String, String> createMessage(String role, String content) {
        Map<String, String> msg = new HashMap<>();
        msg.put("role", role);
        msg.put("content", content);
        return msg;
    }

    private <T> T readJsonObject(String content, Class<T> clazz) {
        try {
            return objectMapper.readValue(extractJsonObject(content), clazz);
        } catch (Exception e) {
            logger.error("Parse AI structured JSON error: {}", content, e);
            throw new RuntimeException("AI 结构化结果解析失败: " + e.getMessage());
        }
    }

    private Map<String, Object> parseQuestionJson(String content) {
        try {
            String jsonStr = content == null ? "" : content.trim();

            // 针对 MiniMax-M2.5 等推理模型，强力去除 <think>...</think> 块
            if (jsonStr.contains("<think>")) {
                int endThink = jsonStr.lastIndexOf("</think>");
                if (endThink != -1) {
                    jsonStr = jsonStr.substring(endThink + 8).trim();
                } else {
                    // 如果只有开始标签没有结束标签，尝试切掉开始标签后的内容
                    int startThink = jsonStr.indexOf("<think>");
                    // 寻找 think 块之后的第一个 '{'
                    int firstBraceAfterThink = jsonStr.indexOf("{", startThink);
                    if (firstBraceAfterThink != -1) {
                        jsonStr = jsonStr.substring(firstBraceAfterThink).trim();
                    }
                }
            }
            
            // 查找第一个 '{' 和最后一个 '}' 以提取 JSON 块，防止 AI 返回额外说明文字
            int firstBrace = jsonStr.indexOf("{");
            int lastBrace = jsonStr.lastIndexOf("}");
            if (firstBrace != -1 && lastBrace != -1 && lastBrace > firstBrace) {
                jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
            }

            // 再次尝试处理可能存在的 markdown 标记 (针对 substring 后的情况)
            if (jsonStr.startsWith("```json")) {
                jsonStr = jsonStr.substring(7, jsonStr.length() - 3);
            } else if (jsonStr.startsWith("```")) {
                jsonStr = jsonStr.substring(3, jsonStr.length() - 3);
            }
            
            return objectMapper.readValue(jsonStr, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            logger.warn("Parse AI single question JSON failed, trying repair. Error={}", e.getMessage());
            try {
                AiConfig config = getFirstActiveConfig();
                String repaired = repairJsonObject(config, content, e.getMessage());
                return objectMapper.readValue(extractJsonObject(repaired), new TypeReference<Map<String, Object>>() {});
            } catch (Exception repairError) {
                logger.error("Parse AI JSON error: " + content, repairError);
                throw new RuntimeException("AI 生成的数据格式解析失败，请点击重试。主要原因: " + repairError.getMessage());
            }
        }
    }

    private String repairJsonObject(AiConfig config, String brokenJson, String parseError) {
        String systemPrompt = "你是 JSON 修复器。用户会给你一段不合法的题目 JSON 对象文本。"
                + "请只返回修复后的合法 JSON 对象，不要解释，不要 markdown，不要代码块，不要 think 标签。"
                + "所有字符串必须是纯文本，禁止 HTML 标签。字符串内部如果需要引用原文，使用中文引号“”，不要使用英文双引号。";
        String userPrompt = "解析错误：" + parseError + "\n待修复文本：\n" + brokenJson;
        return callAi(config, systemPrompt, userPrompt);
    }

    private List<LearningTrendPointVM> buildTrend(List<ExamPaperAnswer> paperAnswers) {
        List<LearningTrendPointVM> points = new ArrayList<>();
        List<ExamPaperAnswer> tail = paperAnswers.size() > 10 ? paperAnswers.subList(paperAnswers.size() - 10, paperAnswers.size()) : paperAnswers;
        for (ExamPaperAnswer paperAnswer : tail) {
            LearningTrendPointVM point = new LearningTrendPointVM();
            point.setLabel(paperAnswer.getCreateTime() == null ? "-" : DateTimeUtil.dateFormat(paperAnswer.getCreateTime(), "MM-dd"));
            point.setPaperName(paperAnswer.getPaperName());
            point.setScoreRate(toPercent(paperAnswer.getUserScore(), paperAnswer.getPaperScore()));
            point.setCorrectRate(toPercent(paperAnswer.getQuestionCorrect(), paperAnswer.getQuestionCount()));
            points.add(point);
        }
        return points;
    }

    private List<LearningTypeStatVM> buildTypeStats(List<ExamPaperQuestionCustomerAnswer> questionAnswers) {
        Map<Integer, List<ExamPaperQuestionCustomerAnswer>> grouped = questionAnswers.stream()
                .collect(Collectors.groupingBy(ExamPaperQuestionCustomerAnswer::getQuestionType, TreeMap::new, Collectors.toList()));
        List<LearningTypeStatVM> stats = new ArrayList<>();
        for (Map.Entry<Integer, List<ExamPaperQuestionCustomerAnswer>> entry : grouped.entrySet()) {
            List<ExamPaperQuestionCustomerAnswer> values = entry.getValue();
            LearningTypeStatVM stat = new LearningTypeStatVM();
            stat.setQuestionType(entry.getKey());
            stat.setTypeName(getQuestionTypeLabel(entry.getKey()));
            stat.setTotalCount(values.size());
            stat.setCorrectCount((int) values.stream().filter(v -> Boolean.TRUE.equals(v.getDoRight())).count());
            stat.setCorrectRate(values.isEmpty() ? 0D : round(stat.getCorrectCount() * 100D / values.size()));
            stat.setAvgDoTime(round(values.stream().filter(v -> v.getDoTime() != null).mapToInt(ExamPaperQuestionCustomerAnswer::getDoTime).average().orElse(0D)));
            stats.add(stat);
        }
        return stats;
    }

    private List<LearningSubjectStatVM> buildSubjectStats(Integer studentId, Date startTime, Date endTime, Integer selectedSubjectId) {
        if (selectedSubjectId != null) {
            return buildSingleSubjectStat(studentId, startTime, endTime, selectedSubjectId);
        }
        List<ExamPaperAnswer> allPapers = examPaperAnswerMapper.selectByUserIdAndDateRange(studentId, startTime, endTime, null);
        List<ExamPaperQuestionCustomerAnswer> allQuestions = examPaperQuestionCustomerAnswerMapper.selectByUserIdAndDateRange(studentId, startTime, endTime, null);
        Map<Integer, List<ExamPaperAnswer>> paperGroup = allPapers.stream().filter(p -> p.getSubjectId() != null)
                .collect(Collectors.groupingBy(ExamPaperAnswer::getSubjectId, TreeMap::new, Collectors.toList()));
        Map<Integer, List<ExamPaperQuestionCustomerAnswer>> questionGroup = allQuestions.stream().filter(q -> q.getSubjectId() != null)
                .collect(Collectors.groupingBy(ExamPaperQuestionCustomerAnswer::getSubjectId, TreeMap::new, Collectors.toList()));
        Set<Integer> subjectIds = new TreeSet<>();
        subjectIds.addAll(paperGroup.keySet());
        subjectIds.addAll(questionGroup.keySet());

        List<LearningSubjectStatVM> result = new ArrayList<>();
        for (Integer subjectId : subjectIds) {
            result.add(buildSubjectStat(subjectId, paperGroup.get(subjectId), questionGroup.get(subjectId)));
        }
        return result;
    }

    private List<LearningSubjectStatVM> buildSingleSubjectStat(Integer studentId, Date startTime, Date endTime, Integer subjectId) {
        List<LearningSubjectStatVM> result = new ArrayList<>();
        result.add(buildSubjectStat(subjectId,
                examPaperAnswerMapper.selectByUserIdAndDateRange(studentId, startTime, endTime, subjectId),
                examPaperQuestionCustomerAnswerMapper.selectByUserIdAndDateRange(studentId, startTime, endTime, subjectId)));
        return result;
    }

    private LearningSubjectStatVM buildSubjectStat(Integer subjectId, List<ExamPaperAnswer> papers, List<ExamPaperQuestionCustomerAnswer> questions) {
        List<ExamPaperAnswer> safePapers = papers == null ? Collections.emptyList() : papers;
        List<ExamPaperQuestionCustomerAnswer> safeQuestions = questions == null ? Collections.emptyList() : questions;
        Subject subject = subjectService.selectById(subjectId);
        int totalQuestions = safeQuestions.isEmpty() ? safePapers.stream().mapToInt(p -> defaultInt(p.getQuestionCount())).sum() : safeQuestions.size();
        int totalCorrectQuestions = safeQuestions.isEmpty() ? safePapers.stream().mapToInt(p -> defaultInt(p.getQuestionCorrect())).sum() : (int) safeQuestions.stream().filter(q -> Boolean.TRUE.equals(q.getDoRight())).count();

        LearningSubjectStatVM stat = new LearningSubjectStatVM();
        stat.setSubjectId(subjectId);
        stat.setSubjectName(subject == null ? "未知学科" : subject.getName());
        stat.setTotalPapers(safePapers.size());
        stat.setTotalQuestions(totalQuestions);
        stat.setTotalCorrectQuestions(totalCorrectQuestions);
        stat.setAvgScoreRate(calculateAverageScoreRate(safePapers));
        stat.setAvgCorrectRate(totalQuestions == 0 ? 0D : round(totalCorrectQuestions * 100D / totalQuestions));
        stat.setAvgDoTime(calculateAverageDoTime(safePapers));
        stat.setEvaluation(buildSubjectEvaluation(stat));
        return stat;
    }

    private String buildSubjectEvaluation(LearningSubjectStatVM stat) {
        if (stat.getTotalPapers() == null || stat.getTotalPapers() == 0) {
            return "近期该学科练习数据较少，建议继续积累样本后再观察变化。";
        }
        if (stat.getAvgScoreRate() != null && stat.getAvgScoreRate() >= 85) {
            return "该学科整体掌握较好，能够保持较高得分率，可适当增加综合题训练。";
        }
        if (stat.getAvgScoreRate() != null && stat.getAvgScoreRate() >= 70) {
            return "该学科基础较稳，但仍有提升空间，建议通过专题训练强化薄弱点。";
        }
        if (stat.getAvgScoreRate() != null && stat.getAvgScoreRate() >= 60) {
            return "该学科处于中等水平，建议从高频错题和核心知识点开始巩固。";
        }
        return "该学科当前表现偏弱，建议优先安排基础知识回顾和分层练习。";
    }

    private Double calculateAverageScoreRate(List<ExamPaperAnswer> paperAnswers) {
        return round(paperAnswers.stream().filter(p -> defaultInt(p.getPaperScore()) > 0)
                .mapToDouble(p -> defaultInt(p.getUserScore()) * 100D / p.getPaperScore()).average().orElse(0D));
    }

    private Double calculateAverageDoTime(List<ExamPaperAnswer> paperAnswers) {
        return round(paperAnswers.stream().filter(p -> p.getDoTime() != null).mapToInt(ExamPaperAnswer::getDoTime).average().orElse(0D));
    }

    private LearningAdviceVM buildLearningAdvice(LearningAnalysisVM vm) {
        try {
            AiConfig config = getFirstActiveConfig();
            String systemPrompt = "你是一名教育数据分析顾问。请根据学生近期学习数据生成结构化学情分析，只返回 JSON 对象，不要返回 markdown、解释文字或 think 标签。JSON 字段必须包含 overallLevel、learningStatus、strengths、weaknesses、riskPoints、studentSuggestions、teacherSuggestions。";
            String aiResponse = callAi(config, systemPrompt, buildLearningContext(vm));
            LearningAdviceVM report = objectMapper.readValue(extractJsonObject(aiResponse), LearningAdviceVM.class);
            report.setAiGenerated(true);
            return normalizeLearningAdvice(report, vm);
        } catch (Exception e) {
            logger.warn("Generate learning analysis by AI failed, fallback to heuristic report: {}", e.getMessage());
            LearningAdviceVM report = buildHeuristicAdvice(vm);
            report.setAiGenerated(false);
            return report;
        }
    }

    private LearningAdviceVM normalizeLearningAdvice(LearningAdviceVM report, LearningAnalysisVM vm) {
        LearningAdviceVM fallback = buildHeuristicAdvice(vm);
        report.setOverallLevel(isBlank(report.getOverallLevel()) ? fallback.getOverallLevel() : report.getOverallLevel());
        report.setLearningStatus(isBlank(report.getLearningStatus()) ? fallback.getLearningStatus() : report.getLearningStatus());
        report.setStrengths(emptyToFallback(report.getStrengths(), fallback.getStrengths()));
        report.setWeaknesses(emptyToFallback(report.getWeaknesses(), fallback.getWeaknesses()));
        report.setRiskPoints(emptyToFallback(report.getRiskPoints(), fallback.getRiskPoints()));
        report.setStudentSuggestions(emptyToFallback(report.getStudentSuggestions(), fallback.getStudentSuggestions()));
        report.setTeacherSuggestions(emptyToFallback(report.getTeacherSuggestions(), fallback.getTeacherSuggestions()));
        return report;
    }

    private LearningAdviceVM buildHeuristicAdvice(LearningAnalysisVM vm) {
        LearningAdviceVM report = new LearningAdviceVM();
        report.setOverallLevel(resolveOverallLevel(vm.getAvgScoreRate()));
        report.setLearningStatus(buildLearningStatus(vm));
        report.setStrengths(buildStrengths(vm));
        report.setWeaknesses(buildWeaknesses(vm));
        report.setRiskPoints(buildRiskPoints(vm));
        report.setStudentSuggestions(buildStudentSuggestions(vm));
        report.setTeacherSuggestions(buildTeacherSuggestions(vm));
        return report;
    }

    private String buildLearningContext(LearningAnalysisVM vm) {
        StringBuilder builder = new StringBuilder();
        builder.append("学生信息:\n");
        builder.append("用户名: ").append(vm.getUserName()).append("\n");
        builder.append("姓名: ").append(vm.getRealName()).append("\n");
        builder.append("统计范围: 最近").append(vm.getRangeDays()).append("天\n");
        builder.append("当前学科视图: ").append(vm.getSubjectName()).append("\n\n");
        builder.append("总体学习概览:\n");
        builder.append("练习试卷数: ").append(vm.getTotalPapers()).append("\n");
        builder.append("练习天数: ").append(vm.getPracticeDays()).append("\n");
        builder.append("总题量: ").append(vm.getTotalQuestions()).append("\n");
        builder.append("答对题数: ").append(vm.getTotalCorrectQuestions()).append("\n");
        builder.append("平均得分率: ").append(vm.getAvgScoreRate()).append("%\n");
        builder.append("平均正确率: ").append(vm.getAvgQuestionCorrectRate()).append("%\n");
        builder.append("平均用时: ").append(vm.getAvgDoTime()).append("秒\n\n");
        builder.append("各学科评价:\n");
        for (LearningSubjectStatVM stat : vm.getSubjectStats()) {
            builder.append("- ").append(stat.getSubjectName()).append(": 得分率=").append(stat.getAvgScoreRate())
                    .append("%, 正确率=").append(stat.getAvgCorrectRate()).append("%, 平均用时=")
                    .append(stat.getAvgDoTime()).append("秒, 评价=").append(stat.getEvaluation()).append("\n");
        }
        builder.append("\n按题型统计:\n");
        for (LearningTypeStatVM stat : vm.getQuestionTypeStats()) {
            builder.append("- ").append(stat.getTypeName()).append(": 题量=").append(stat.getTotalCount())
                    .append(", 正确率=").append(stat.getCorrectRate()).append("%, 平均用时=").append(stat.getAvgDoTime()).append("秒\n");
        }
        builder.append("\n最近成绩趋势:\n");
        for (LearningTrendPointVM point : vm.getRecentTrend()) {
            builder.append("- ").append(point.getLabel()).append(" ").append(point.getPaperName())
                    .append(": 得分率=").append(point.getScoreRate()).append("%, 正确率=").append(point.getCorrectRate()).append("%\n");
        }
        return builder.toString();
    }

    private String extractJsonObject(String content) {
        String jsonStr = content == null ? "" : content.trim();
        if (jsonStr.contains("<think>")) {
            int endThink = jsonStr.lastIndexOf("</think>");
            if (endThink != -1) {
                jsonStr = jsonStr.substring(endThink + 8).trim();
            }
        }
        if (jsonStr.startsWith("```json")) {
            jsonStr = jsonStr.substring(7, jsonStr.length() - 3).trim();
        } else if (jsonStr.startsWith("```")) {
            jsonStr = jsonStr.substring(3, jsonStr.length() - 3).trim();
        }
        int firstBrace = jsonStr.indexOf("{");
        int lastBrace = jsonStr.lastIndexOf("}");
        if (firstBrace != -1 && lastBrace != -1 && lastBrace > firstBrace) {
            return jsonStr.substring(firstBrace, lastBrace + 1);
        }
        return jsonStr;
    }

    private String buildQuestionContext(QuestionEditRequestVM questionVM) {
        if (questionVM == null) {
            return "无题目上下文";
        }
        StringBuilder builder = new StringBuilder();
        builder.append("题干：").append(safeText(stripHtml(questionVM.getTitle()), "无")).append("\n");
        builder.append("解析：").append(safeText(stripHtml(questionVM.getAnalyze()), "无")).append("\n");
        builder.append("标签：").append(questionVM.getTagNames() == null || questionVM.getTagNames().isEmpty()
                ? "无"
                : String.join("、", questionVM.getTagNames())).append("\n");
        builder.append("题型：").append(getQuestionTypeLabel(questionVM.getQuestionType())).append("\n");
        builder.append("难度：").append(questionVM.getDifficult() == null ? "未知" : questionVM.getDifficult());
        return builder.toString();
    }

    private String buildRelatedFeedbackContext(List<QuestionFeedback> relatedFeedbacks) {
        if (relatedFeedbacks == null || relatedFeedbacks.isEmpty()) {
            return "暂无相关反馈";
        }
        StringBuilder builder = new StringBuilder();
        int limit = Math.min(relatedFeedbacks.size(), 12);
        for (int i = 0; i < limit; i++) {
            QuestionFeedback item = relatedFeedbacks.get(i);
            builder.append(i + 1)
                    .append(". 类型=")
                    .append(safeText(item.getAiCategory(), safeText(item.getFeedbackType(), "未分类")))
                    .append("；内容=")
                    .append(safeText(trimTo(stripHtml(item.getFeedbackContent()), 120), "无"))
                    .append("\n");
        }
        return builder.toString();
    }

    private String buildRecentFeedbackSummary(List<QuestionFeedback> recentFeedbacks) {
        if (recentFeedbacks == null || recentFeedbacks.isEmpty()) {
            return "近期无额外反馈样本";
        }
        Map<String, Long> categoryCount = recentFeedbacks.stream()
                .collect(Collectors.groupingBy(
                        item -> safeText(item.getAiCategory(), safeText(item.getFeedbackType(), "未分类")),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
        return categoryCount.entrySet().stream()
                .map(entry -> entry.getKey() + ":" + entry.getValue() + "条")
                .collect(Collectors.joining("；"));
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            throw new RuntimeException("序列化 AI 上下文失败: " + e.getMessage());
        }
    }

    private String safeText(String text, String fallback) {
        return isBlank(text) ? fallback : text;
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
        if (content == null || content.length() <= maxLength) {
            return content == null ? "" : content;
        }
        return content.substring(0, maxLength) + "...";
    }

    private String resolveOverallLevel(Double avgScoreRate) {
        double rate = avgScoreRate == null ? 0D : avgScoreRate;
        if (rate >= 85) {
            return "优秀";
        }
        if (rate >= 70) {
            return "良好";
        }
        if (rate >= 60) {
            return "中等";
        }
        return "待提升";
    }

    private String buildLearningStatus(LearningAnalysisVM vm) {
        String trendText = "整体状态较稳定";
        if (vm.getRecentTrend() != null && vm.getRecentTrend().size() >= 4) {
            int half = vm.getRecentTrend().size() / 2;
            double firstHalf = vm.getRecentTrend().subList(0, half).stream().mapToDouble(t -> t.getScoreRate() == null ? 0D : t.getScoreRate()).average().orElse(0D);
            double secondHalf = vm.getRecentTrend().subList(half, vm.getRecentTrend().size()).stream().mapToDouble(t -> t.getScoreRate() == null ? 0D : t.getScoreRate()).average().orElse(0D);
            if (secondHalf - firstHalf >= 5) {
                trendText = "近期成绩呈上升趋势";
            } else if (firstHalf - secondHalf >= 5) {
                trendText = "近期成绩有所波动并略有下滑";
            }
        }
        LearningTypeStatVM weakType = getWeakestType(vm);
        if (weakType == null) {
            return trendText + "，但近期练习数据仍偏少，建议继续积累样本。";
        }
        return trendText + "，当前在" + weakType.getTypeName() + "上的正确率相对偏低，需要针对性强化。";
    }

    private List<String> buildStrengths(LearningAnalysisVM vm) {
        List<String> result = new ArrayList<>();
        if (vm.getPracticeDays() != null && vm.getPracticeDays() >= Math.max(3, vm.getRangeDays() / 4)) {
            result.add("近期练习频率较稳定，学习连续性较好。");
        }
        List<LearningTypeStatVM> topTypes = vm.getQuestionTypeStats().stream()
                .sorted(Comparator.comparing(LearningTypeStatVM::getCorrectRate, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(2).collect(Collectors.toList());
        for (LearningTypeStatVM stat : topTypes) {
            if (stat.getCorrectRate() != null && stat.getCorrectRate() >= 70) {
                result.add(stat.getTypeName() + "表现较好，正确率达到" + stat.getCorrectRate() + "%。");
            }
        }
        List<LearningSubjectStatVM> goodSubjects = vm.getSubjectStats().stream().filter(s -> s.getAvgScoreRate() != null && s.getAvgScoreRate() >= 75).limit(1).collect(Collectors.toList());
        for (LearningSubjectStatVM stat : goodSubjects) {
            result.add(stat.getSubjectName() + "整体表现较好，可继续保持并适当提升综合应用能力。");
        }
        if (result.isEmpty()) {
            result.add("已经具备一定基础，继续保持规律练习可逐步提升稳定性。");
        }
        return result;
    }

    private List<String> buildWeaknesses(LearningAnalysisVM vm) {
        List<String> result = new ArrayList<>();
        List<LearningTypeStatVM> weakTypes = vm.getQuestionTypeStats().stream()
                .sorted(Comparator.comparing(LearningTypeStatVM::getCorrectRate, Comparator.nullsLast(Comparator.naturalOrder())))
                .limit(2).collect(Collectors.toList());
        for (LearningTypeStatVM stat : weakTypes) {
            result.add(stat.getTypeName() + "正确率为" + stat.getCorrectRate() + "%，是当前需要优先补强的题型。");
        }
        List<LearningSubjectStatVM> weakSubjects = vm.getSubjectStats().stream().filter(s -> s.getAvgScoreRate() != null && s.getAvgScoreRate() < 60).limit(1).collect(Collectors.toList());
        for (LearningSubjectStatVM stat : weakSubjects) {
            result.add(stat.getSubjectName() + "学科表现相对薄弱，建议安排更连续的基础巩固训练。");
        }
        if (result.isEmpty()) {
            result.add("当前没有特别突出的短板，但仍需继续通过练习巩固。");
        }
        return result;
    }

    private List<String> buildRiskPoints(LearningAnalysisVM vm) {
        List<String> result = new ArrayList<>();
        if (vm.getAvgDoTime() != null && vm.getAvgDoTime() > 180) {
            result.add("做题耗时偏长，考试中可能出现时间分配不足的问题。");
        }
        if (vm.getPracticeDays() != null && vm.getPracticeDays() < Math.max(2, vm.getRangeDays() / 6)) {
            result.add("近期练习天数较少，学习节奏存在中断风险。");
        }
        LearningTypeStatVM weakType = getWeakestType(vm);
        if (weakType != null && weakType.getCorrectRate() != null && weakType.getCorrectRate() < 50) {
            result.add(weakType.getTypeName() + "薄弱较明显，若不及时补强会影响整体成绩稳定性。");
        }
        if (result.isEmpty()) {
            result.add("当前整体风险可控，重点保持稳定训练并定期复盘错题。");
        }
        return result;
    }

    private List<String> buildStudentSuggestions(LearningAnalysisVM vm) {
        List<String> result = new ArrayList<>();
        LearningTypeStatVM weakType = getWeakestType(vm);
        if (weakType != null) {
            result.add("优先进行" + weakType.getTypeName() + "专项训练，每次集中练习 10 到 15 题。");
        }
        LearningSubjectStatVM weakSubject = vm.getSubjectStats().stream()
                .min(Comparator.comparing(LearningSubjectStatVM::getAvgScoreRate, Comparator.nullsLast(Comparator.naturalOrder()))).orElse(null);
        if (weakSubject != null) {
            result.add("本周优先复习" + weakSubject.getSubjectName() + "的核心知识点，并结合错题重新梳理解题思路。");
        }
        result.add("整理最近错题，按知识点归类并在 24 小时内完成一次重做。");
        return result;
    }

    private List<String> buildTeacherSuggestions(LearningAnalysisVM vm) {
        List<String> result = new ArrayList<>();
        LearningTypeStatVM weakType = getWeakestType(vm);
        if (weakType != null) {
            result.add("教学中优先讲解" + weakType.getTypeName() + "的典型错题与解题步骤。");
        }
        LearningSubjectStatVM weakSubject = vm.getSubjectStats().stream()
                .min(Comparator.comparing(LearningSubjectStatVM::getAvgScoreRate, Comparator.nullsLast(Comparator.naturalOrder()))).orElse(null);
        if (weakSubject != null) {
            result.add("针对" + weakSubject.getSubjectName() + "安排分层训练，先补基础再提高综合应用。");
        }
        if (vm.getAvgDoTime() != null && vm.getAvgDoTime() > 180) {
            result.add("可加入限时训练或课堂演示，帮助学生优化审题与答题时间分配。");
        } else {
            result.add("可通过阶段性小测跟踪掌握情况，观察是否具备进一步拔高条件。");
        }
        return result;
    }

    private LearningTypeStatVM getWeakestType(LearningAnalysisVM vm) {
        return vm.getQuestionTypeStats() == null ? null : vm.getQuestionTypeStats().stream()
                .filter(s -> s.getTotalCount() != null && s.getTotalCount() > 0)
                .min(Comparator.comparing(LearningTypeStatVM::getCorrectRate, Comparator.nullsLast(Comparator.naturalOrder()))).orElse(null);
    }

    private String getQuestionTypeLabel(Integer questionType) {
        if (questionType == null) {
            return "未知题型";
        }
        switch (questionType) {
            case 1:
                return "单选题";
            case 2:
                return "多选题";
            case 3:
                return "判断题";
            case 4:
                return "填空题";
            case 5:
                return "简答题";
            default:
                return "未知题型";
        }
    }

    private Double toPercent(Integer numerator, Integer denominator) {
        if (defaultInt(denominator) <= 0) {
            return 0D;
        }
        return round(defaultInt(numerator) * 100D / denominator);
    }

    private int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }

    private Double round(double value) {
        return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    private boolean isBlank(String text) {
        return text == null || text.trim().isEmpty();
    }

    private List<String> emptyToFallback(List<String> value, List<String> fallback) {
        return value == null || value.isEmpty() ? fallback : value;
    }
}
