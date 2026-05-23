# exam-sys-admin

`exam-sys-admin` 是在线考试与练习平台的管理员端，面向教师和后台管理角色，负责题库维护、试卷编排、任务发布、阅卷统计、消息通知与 AI 配置管理。

## 功能清单

- 仪表盘：查看平台总览数据、考试与用户统计。
- AI 配置管理：维护可用模型配置、切换当前生效配置。
- AI 生成辅助：生成试题、试卷、分析文案与学生学习画像。
- 协作审核中心：审核学生题目反馈、题解投稿与推荐结果。
- 学生管理：分页查询学生、查看详情、状态切换、用户事件日志。
- 管理员管理：创建和维护后台账号。
- 题库管理：支持单选、多选、判断、填空、简答题的新增、编辑、统计与采纳。
- 试卷管理：试卷分页、详情编辑、考试统计、任务关联试卷查询。
- 任务管理：创建和维护练习任务或考试任务。
- 学科与标签管理：维护学科、知识标签、标签与题目关系、用户分组。
- 阅卷管理：查看答卷列表、读卷、人工调整判分结果。
- 消息中心：分页查看消息并向学生发送通知。
- 异常日志：查看考试异常上报记录。
- 个人中心：查看当前登录用户资料并更新信息。

## 页面模块

- `/dashboard`：平台总览
- `/ai-config`：AI 配置列表
- `/ai/student-report/:id`：学生学习画像
- `/collaboration/review`：协作审核中心
- `/user/student/*`：学生账号管理
- `/user/admin/*`：管理员账号管理
- `/exam/paper/*`：试卷管理与统计
- `/exam/question/*`：题库管理、题型编辑与统计
- `/exam/task/*`：任务管理
- `/education/subject/*`：学科管理
- `/education/tag/*`：标签与标签题目管理
- `/answer/*`：阅卷与答卷详情
- `/message/*`：消息分页与消息发送
- `/log/user/list`：用户行为日志
- `/log/abnormal/list`：考试异常日志
- `/profile/index`：个人中心

## 技术栈

- React 19
- Vite 6
- Ant Design 6
- Redux Toolkit
- React Router DOM 7
- Axios
- Sass
- ECharts

## 运行方式

### 依赖安装

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

默认开发端口为 `8001`，Vite 已将 `/api` 代理到 `http://localhost:8000`。

### 生产构建

```bash
npm run build
```

### 本地预览

```bash
npm run preview
```

## 环境变量

项目通过 `.env` 中的 `VITE_API_URL` 指定接口根地址。

- 开发联调：可保持为空，直接使用 Vite 代理。
- 独立部署：可设置为后端完整地址，例如 `http://localhost:8000`。

## 目录结构

```text
src/
├─ api/          接口封装，按业务模块拆分
├─ assets/       静态资源
├─ components/   通用组件
├─ hooks/        自定义 Hook
├─ layout/       管理后台整体布局
├─ pages/        页面级模块
├─ router/       路由定义
├─ store/        Redux 状态管理
├─ styles/       全局样式与主题
└─ utils/        请求封装与工具函数
```

## 接口对应关系

前端接口封装与后端模块基本一一对应：

- `src/api/aiConfig.js` -> `/api/admin/ai/config/**`
- `src/api/aiGeneration.js` -> `/api/admin/ai/**`
- `src/api/collaboration.js` -> `/api/admin/collaboration/**`
- `src/api/user.js` -> `/api/admin/user/**`
- `src/api/question.js` -> `/api/admin/question/**`
- `src/api/examPaper.js` -> `/api/admin/exam/paper/**`
- `src/api/task.js` -> `/api/admin/task/**`
- `src/api/message.js` -> `/api/admin/message/**`
- `src/api/subject.js` / `tag.js` / `group.js` -> `/api/common/education/**` 与 `/api/admin/education/**`

详细后端接口说明见后端项目文档中的 `docs/API.md`。
