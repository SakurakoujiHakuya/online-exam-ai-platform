# exam-sys-stu

`exam-sys-stu` 是在线考试与练习平台的学生端，覆盖注册登录、试卷练习、在线考试、错题整理、学习报告、消息通知与 AI 练习推荐等学习流程。

## 功能清单

- 登录与注册：学生账号注册、登录、退出。
- 首页看板：查看个人学习概览与任务提醒。
- 试卷中心：分页浏览试卷、查看试卷详情、进入练习或考试。
- 在线答题：开始答题、暂存、状态同步、提交试卷。
- 试卷回顾：查看已完成试卷与历史作答详情。
- AI 练习：根据知识点、筛选条件或推荐结果构建专项练习。
- 学习报告：查看个人学习分析结果与 AI 学情摘要。
- 错题本：分页查看错题与题目详情。
- 练习记录：查看历史考试与练习记录。
- 协作学习：提交题目反馈、题解、查看已采纳题解、获取每日推荐。
- 个人中心：维护个人资料与头像。
- 消息中心：查看站内消息、未读数、已读状态更新。
- 异常上报：考试过程中提交异常日志。

## 核心页面

- `/login`：登录页
- `/register`：注册页
- `/index`：首页
- `/paper/index`：试卷中心
- `/do`：在线答题
- `/read`：答卷查看
- `/edit`：答卷编辑
- `/ai/practice`：AI 练习构建
- `/ai/report`：学习报告
- `/record/index`：练习记录
- `/question/index`：错题本
- `/user/index`：个人中心
- `/user/message`：消息中心

## 技术栈

- React 18
- Vite 7
- Ant Design 5
- React Router DOM 6
- Axios
- Zustand
- js-cookie

## 运行方式

### 依赖安装

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

默认开发端口为 `8002`，Vite 已将 `/api` 代理到 `http://localhost:8000`。

### 生产构建

```bash
npm run build
```

### 本地预览

```bash
npm run preview
```

## 请求与鉴权说明

- 所有请求统一由 `src/utils/request.js` 发起。
- 学生端会从 `studentToken` Cookie 中读取令牌，并写入请求头 `token`。
- 非 `code = 1` 的响应会统一进入错误提示；鉴权失效时会跳转登录页。

## 目录结构

```text
src/
├─ api/          学生端接口封装
├─ assets/       图片与静态资源
├─ layout/       页面布局
├─ router/       路由定义
├─ store/        Zustand 状态
├─ styles/       全局样式
├─ utils/        Axios 封装与工具函数
└─ views/        页面视图
```

## 主要接口模块

- `src/api/login.js`：登录、退出、当前用户
- `src/api/register.js`：学生注册
- `src/api/dashboard.js`：首页看板与任务
- `src/api/examPaper.js` / `examPaperAnswer.js`：试卷列表、开始作答、提交、读卷
- `src/api/questionPractice.js` / `questionAnswer.js`：错题、题目详情与专项练习
- `src/api/ai.js`：AI 组卷与学情分析
- `src/api/collaboration.js`：反馈、题解、推荐
- `src/api/user.js`：个人信息、消息中心、操作日志
- `src/api/subject.js` / `tag.js` / `education.js`：学科、标签、分组数据

详细接口定义见后端项目中的 `docs/API.md`。
