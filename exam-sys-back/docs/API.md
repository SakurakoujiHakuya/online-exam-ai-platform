# exam-sys-back API 文档

## 说明

- 基础地址：`http://localhost:8000`
- 统一响应：`RestResponse<T>`
- 请求方法：当前业务接口均以 `POST` 为主
- `wx` 相关接口已下线，本文件只维护 `auth / common / admin / student` 四类接口

## 鉴权约定

- 公共接口：无需登录
- 管理员接口：需要管理员或教师权限
- 学生接口：需要学生权限
- 登录接口：由 Spring Security 接管

## 通用响应约定

- `code = 1`：请求成功
- `message`：提示信息
- `response` 或同等字段：业务数据

## Auth

| 路径 | 方法 | 鉴权 | 用途 | 请求要点 | 响应要点 |
| --- | --- | --- | --- | --- | --- |
| `/api/user/login` | POST | 公共 | 用户登录 | JSON 请求体，核心字段为 `userName`、`password`、`remember` | 建立登录态，供管理员端和学生端复用 |
| `/api/user/logout` | POST | 已登录 | 退出登录 | 无特殊请求体 | 清理当前登录态 |

## Common

| 路径 | 方法 | 鉴权 | 用途 | 请求要点 | 响应要点 |
| --- | --- | --- | --- | --- | --- |
| `/api/common/education/subject/list` | POST | 公共 | 获取学科列表 | 无请求体 | 返回 `List<Subject>` |
| `/api/common/education/group/list` | POST | 公共 | 获取用户分组列表 | 无请求体 | 返回 `List<GroupItemVM>` |

## Admin

### 仪表盘与 AI

| 路径 | 用途 | 请求要点 | 响应要点 |
| --- | --- | --- | --- |
| `/api/admin/dashboard/index` | 后台首页统计 | 无请求体 | `IndexVM` |
| `/api/admin/ai/config/all` | 获取 AI 配置列表 | 无请求体 | `List<AiConfig>` |
| `/api/admin/ai/config/select/{id}` | 查询单个 AI 配置 | 路径参数 `id` | `AiConfig` |
| `/api/admin/ai/config/edit` | 新增或编辑 AI 配置 | `AiConfig` | 保存后的配置对象 |
| `/api/admin/ai/config/delete/{id}` | 删除 AI 配置 | 路径参数 `id` | 删除结果 |
| `/api/admin/ai/config/set-active/{id}` | 切换生效 AI 配置 | 路径参数 `id` | 操作结果 |
| `/api/admin/ai/generate/question` | AI 生成题目 | `AiGenerateRequestVM` | 题目草稿与生成信息 |
| `/api/admin/ai/generate/analyze` | AI 生成分析文案 | `Map<String, Object>` | 分析文本 |
| `/api/admin/ai/generate/stats` | AI 生成统计解读 | `Map<String, String>` | 统计说明文本 |
| `/api/admin/ai/generate/paper` | AI 生成试卷 | `AiPaperGenerateVM` | `ExamPaperEditRequestVM` |
| `/api/admin/ai/learning-analysis/student/{studentId}` | 生成学生学习画像 | 路径参数 `studentId`，请求体为学习分析条件 | `LearningAnalysisVM` |

### 协作审核

| 路径 | 用途 | 请求要点 | 响应要点 |
| --- | --- | --- | --- |
| `/api/admin/collaboration/overview` | 协作概览 | 无请求体 | `CollaborationOverviewVM` |
| `/api/admin/collaboration/feedback/page` | 反馈分页 | `FeedbackReviewPageRequestVM` | `PageInfo<QuestionFeedbackResponseVM>` |
| `/api/admin/collaboration/feedback/detail/{id}` | 反馈详情 | 路径参数 `id` | `QuestionFeedbackDetailVM` |
| `/api/admin/collaboration/feedback/review` | 审核反馈 | `FeedbackReviewActionVM` | 操作结果 |
| `/api/admin/collaboration/solution/page` | 题解分页 | `SolutionReviewPageRequestVM` | `PageInfo<QuestionSolutionResponseVM>` |
| `/api/admin/collaboration/solution/detail/{id}` | 题解详情 | 路径参数 `id` | `QuestionSolutionDetailVM` |
| `/api/admin/collaboration/solution/review` | 审核题解 | `SolutionReviewActionVM` | 操作结果 |

### 学科、标签、分组

| 路径 | 用途 | 请求要点 | 响应要点 |
| --- | --- | --- | --- |
| `/api/admin/education/subject/list` | 获取学科列表 | 无请求体 | `List<Subject>` |
| `/api/admin/education/subject/page` | 学科分页 | `SubjectPageRequestVM` | `PageInfo<SubjectResponseVM>` |
| `/api/admin/education/subject/edit` | 学科编辑 | `SubjectEditRequestVM` | 保存结果 |
| `/api/admin/education/subject/select/{id}` | 学科详情 | 路径参数 `id` | `SubjectEditRequestVM` |
| `/api/admin/education/subject/delete/{id}` | 删除学科 | 路径参数 `id` | 操作结果 |
| `/api/admin/education/tag/list` | 标签列表 | 可带筛选 `Map<String, String>` | `List<Tag>` |
| `/api/admin/education/tag/page` | 标签分页 | `TagPageRequestVM` | `PageInfo<TagResponseVM>` |
| `/api/admin/education/tag/edit` | 标签编辑 | `TagEditRequestVM` | 操作结果 |
| `/api/admin/education/tag/select/{id}` | 标签详情 | 路径参数 `id` | `TagEditRequestVM` |
| `/api/admin/education/tag/delete/{id}` | 删除标签 | 路径参数 `id` | 操作结果 |
| `/api/admin/education/tag/remove-question/{tagId}/{questionId}` | 标签移除单题 | 路径参数 `tagId`、`questionId` | 操作结果 |
| `/api/admin/education/tag/remove-questions/{tagId}` | 标签批量移题 | 路径参数 `tagId`，请求体包含 `questionIds` | 操作结果 |
| `/api/admin/education/group/page` | 用户分组分页 | `UserGroupPageRequestVM` | `PageInfo<UserGroupResponseVM>` |
| `/api/admin/education/group/edit` | 用户分组编辑 | `UserGroupEditRequestVM` | 操作结果 |
| `/api/admin/education/group/select/{id}` | 用户分组详情 | 路径参数 `id` | `UserGroupEditRequestVM` |
| `/api/admin/education/group/delete/{id}` | 删除用户分组 | 路径参数 `id` | 操作结果 |

### 题目、试卷、任务、阅卷

| 路径 | 用途 | 请求要点 | 响应要点 |
| --- | --- | --- | --- |
| `/api/admin/question/page` | 题目分页 | `QuestionPageRequestVM` | `PageInfo<QuestionResponseVM>` |
| `/api/admin/question/edit` | 题目编辑 | `QuestionEditRequestVM` | 操作结果 |
| `/api/admin/question/select/{id}` | 题目详情 | 路径参数 `id` | `QuestionEditRequestVM` |
| `/api/admin/question/delete/{id}` | 删除题目 | 路径参数 `id` | 操作结果 |
| `/api/admin/question/stats/{id}` | 题目统计 | 路径参数 `id` | `QuestionStatsVM` |
| `/api/admin/question/adopt/{id}` | 采纳题目或协作结果 | 路径参数 `id` | 操作结果 |
| `/api/admin/exam/paper/page` | 试卷分页 | `ExamPaperPageRequestVM` | `PageInfo<ExamResponseVM>` |
| `/api/admin/exam/paper/taskExamPage` | 任务关联试卷分页 | `ExamPaperPageRequestVM` | `PageInfo<ExamResponseVM>` |
| `/api/admin/exam/paper/edit` | 试卷编辑 | `ExamPaperEditRequestVM` | 保存后的试卷数据 |
| `/api/admin/exam/paper/select/{id}` | 试卷详情 | 路径参数 `id` | `ExamPaperEditRequestVM` |
| `/api/admin/exam/paper/delete/{id}` | 删除试卷 | 路径参数 `id` | 操作结果 |
| `/api/admin/exam/paper/stats/{id}` | 试卷统计 | 路径参数 `id` | `PaperStatsVM` |
| `/api/admin/task/page` | 任务分页 | `TaskPageRequestVM` | `PageInfo<TaskPageResponseVM>` |
| `/api/admin/task/edit` | 任务编辑 | `TaskRequestVM` | 保存后的任务对象 |
| `/api/admin/task/select/{id}` | 任务详情 | 路径参数 `id` | `TaskRequestVM` |
| `/api/admin/task/delete/{id}` | 删除任务 | 路径参数 `id` | 操作结果 |
| `/api/admin/examPaperAnswer/page` | 答卷分页 | `ExamPaperAnswerPageRequestVM` | `PageInfo<ExamPaperAnswerPageResponseVM>` |
| `/api/admin/examPaperAnswer/read/{id}` | 读卷详情 | 路径参数 `id` | `ExamPaperReadVM` |
| `/api/admin/examPaperAnswer/edit` | 人工修改答卷 | `ExamPaperSubmitVM` | 操作结果 |

### 用户、消息、日志、上传

| 路径 | 用途 | 请求要点 | 响应要点 |
| --- | --- | --- | --- |
| `/api/admin/user/page/list` | 用户分页 | `UserPageRequestVM` | `PageInfo<UserResponseVM>` |
| `/api/admin/user/event/page/list` | 用户行为日志分页 | `UserEventPageRequestVM` | `PageInfo<UserEventLogVM>` |
| `/api/admin/user/select/{id}` | 用户详情 | 路径参数 `id` | `UserResponseVM` |
| `/api/admin/user/current` | 当前登录用户 | 无请求体 | `UserResponseVM` |
| `/api/admin/user/edit` | 新增用户 | `UserCreateVM` | `User` |
| `/api/admin/user/update` | 更新用户 | `UserUpdateVM` | `UserResponseVM` |
| `/api/admin/user/changeStatus/{id}` | 切换用户状态 | 路径参数 `id` | 新状态值 |
| `/api/admin/user/delete/{id}` | 删除用户 | 路径参数 `id` | 操作结果 |
| `/api/admin/user/selectByUserName` | 用户名联想 | `UserPageRequestVM` 中的用户名关键字 | `List<KeyValue>` |
| `/api/admin/message/page` | 消息分页 | `MessagePageRequestVM` | `PageInfo<MessageResponseVM>` |
| `/api/admin/message/send` | 发送消息 | `MessageSendVM` | 发送结果 |
| `/api/admin/exam/abnormal/page/list` | 异常日志分页 | `UserEventPageRequestVM` | `PageInfo<ExamAbnormalLog>` |
| `/api/admin/upload/configAndUpload` | 上传配置与上传 | `multipart/form-data` | 上传结果 |
| `/api/admin/upload/image` | 图片上传 | `multipart/form-data` | 图片地址 |

## Student

### 首页、学情、协作

| 路径 | 用途 | 请求要点 | 响应要点 |
| --- | --- | --- | --- |
| `/api/student/dashboard/index` | 学生首页概览 | 无请求体 | `IndexVM` |
| `/api/student/dashboard/task` | 学生任务列表 | 无请求体 | `List<TaskItemVm>` |
| `/api/student/ai/generatePaper` | AI 生成练习卷 | `AiPaperGenerateVM` | 新生成试卷 ID |
| `/api/student/ai/learning-analysis/me` | 我的学习分析 | `LearningAnalysisRequestVM` 可为空 | `LearningAnalysisVM` |
| `/api/student/collaboration/feedback/submit` | 提交题目反馈 | `QuestionFeedbackSubmitVM` | `QuestionFeedbackResponseVM` |
| `/api/student/collaboration/feedback/my` | 我的反馈 | 无请求体 | `List<QuestionFeedbackResponseVM>` |
| `/api/student/collaboration/solution/submit` | 提交题解 | `QuestionSolutionSubmitVM` | `QuestionSolutionResponseVM` |
| `/api/student/collaboration/question/{questionId}/adopted-solutions` | 查看已采纳题解 | 路径参数 `questionId` | `List<AdoptedSolutionVM>` |
| `/api/student/collaboration/recommendation/daily` | 获取每日推荐 | 可选 `rangeDays` | `DailyRecommendationVM` |
| `/api/student/collaboration/recommendation/build` | 构建推荐 | `RecommendationBuildVM` | `RecommendationBuildResultVM` |
| `/api/student/collaboration/recommendation/rate` | 推荐评分反馈 | `RecommendationRateVM` | 操作结果 |

### 学科、标签、试卷、答题

| 路径 | 用途 | 请求要点 | 响应要点 |
| --- | --- | --- | --- |
| `/api/student/education/subject/list` | 学科列表 | 无请求体 | `List<SubjectVM>` |
| `/api/student/education/subject/select/{id}` | 学科详情 | 路径参数 `id` | `SubjectEditRequestVM` |
| `/api/student/education/tag/list` | 标签列表 | 可选筛选 `Map<String, Object>` | `List<Tag>` |
| `/api/student/exam/paper/pageList` | 试卷分页 | `ExamPaperPageVM` | `PageInfo<ExamPaperPageResponseVM>` |
| `/api/student/exam/paper/select/{id}` | 试卷详情 | 路径参数 `id` | `ExamPaperEditRequestVM` |
| `/api/student/exampaper/answer/pageList` | 我的答卷分页 | `ExamPaperAnswerPageVM` | `PageInfo<ExamPaperAnswerPageResponseVM>` |
| `/api/student/exampaper/answer/answerStart` | 开始作答 | `ExamPaperSubmitVM`，至少包含试卷标识 | `ExamPaperSubmitVM` |
| `/api/student/exampaper/answer/stateSync` | 作答状态同步 | `ExamPaperSubmitVM` | 操作结果 |
| `/api/student/exampaper/answer/answerSubmit` | 提交答卷 | `ExamPaperSubmitVM` | 操作结果 |
| `/api/student/exampaper/answer/edit` | 编辑答卷 | `ExamPaperSubmitVM` | 操作结果 |
| `/api/student/exampaper/answer/read/{id}` | 查看答卷 | 路径参数 `id` | `ExamPaperReadVM` |
| `/api/student/exam/abnormal/report` | 考试异常上报 | `ExamAbnormalLog` | 记录 ID |

### 题目练习、用户中心、上传

| 路径 | 用途 | 请求要点 | 响应要点 |
| --- | --- | --- | --- |
| `/api/student/question/pageList` | 题目分页 / 错题查询 | `QuestionPageStudentRequestVM` | `PageInfo<QuestionPageStudentResponseVM>` |
| `/api/student/question/select/{id}` | 题目详情 | 路径参数 `id` | `QuestionEditRequestVM` |
| `/api/student/question/practice/build` | 构建专项练习 | `QuestionPracticeBuildVM` | 新试卷 ID |
| `/api/student/question/practice/build-by-query` | 按筛选构建练习 | `QuestionPageStudentRequestVM` | 新试卷 ID |
| `/api/student/question/answer/page` | 问答题分页 | `QuestionPageStudentRequestVM` | `PageInfo<QuestionPageStudentResponseVM>` |
| `/api/student/question/answer/select/{id}` | 问答题详情 | 路径参数 `id` | `QuestionAnswerVM` |
| `/api/student/user/current` | 当前学生信息 | 无请求体 | `UserResponseVM` |
| `/api/student/user/register` | 学生注册 | `UserRegisterVM` | 无数据体 |
| `/api/student/user/update` | 更新资料 | `UserUpdateVM` | `UserResponseVM` |
| `/api/student/user/log` | 我的行为记录 | 无请求体 | `List<UserEventLogVM>` |
| `/api/student/user/message/page` | 消息分页 | `MessageRequestVM` | `PageInfo<MessageResponseVM>` |
| `/api/student/user/message/unreadCount` | 未读消息数 | 无请求体 | `Integer` |
| `/api/student/user/message/read/{id}` | 标记已读 | 路径参数 `id` | 无数据体 |
| `/api/student/upload/image` | 学生端图片上传 | `multipart/form-data` | 图片地址 |