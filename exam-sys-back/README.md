# exam-sys-back

`exam-sys-back` 是在线考试与练习平台的后端服务，负责鉴权、题库管理、试卷编排、在线答题、阅卷、协作反馈、学习分析、消息通知与资源上传。当前版本仅保留 Web 管理端与 Web 学生端接口

## 系统职责

- 提供统一登录与退出能力。
- 为管理员端提供 AI 配置、题库、试卷、任务、用户、消息、审核等接口。
- 为学生端提供试卷列表、答题、错题、学习报告、协作反馈、个人中心等接口。
- 维护学科、标签、用户分组等公共基础数据。
- 提供文件上传与考试异常上报能力。

## 技术栈

- Java 8
- Spring Boot 2.1.6.RELEASE
- Spring Security
- MyBatis
- PageHelper
- MySQL 8
- Undertow

## 模块划分

- `controller/admin`：管理员与教师角色使用的后台接口
- `controller/student`：学生端接口
- `controller`：公共接口与错误处理
- `service`：业务服务层
- `repository`：MyBatis Mapper 接口
- `src/main/resources/mapper`：Mapper XML
- `src/main/resources/sql`：增量 SQL 与迁移脚本
- `configuration/spring/security`：登录、权限与登出配置

## 快速启动

### 1. 准备数据库

- MySQL 数据库名：`xzs`
- 开发环境默认配置见 `src/main/resources/application-dev.yml`
- 默认开发连接：

```text
jdbc:mysql://localhost:3306/xzs
username: root
password: 123456
```

### 2. 运行迁移

如果当前数据库仍包含旧版 `wx` 字段或 `t_user_token` 表，请先备份，再执行：

```text
src/main/resources/sql/20260417_remove_wx_support.sql
```

该脚本会：

- 删除 `t_user.wx_open_id`
- 删除 `t_user_token`

### 3. 启动服务

使用 Maven Wrapper：

```bash
./mvnw spring-boot:run
```

Windows:

```bash
mvnw.cmd spring-boot:run
```

默认端口为 `8000`。

### 4. 打包

```bash
./mvnw clean package
```

## 配置说明

- `application.yml`：通用配置、端口、MyBatis、权限放行、七牛上传配置
- `application-dev.yml`：开发环境数据库连接
- `application-prod.yml` / `application-test.yml` / `application-pre.yml`：环境差异配置

当前公开放行的业务路径主要为：

- `/api/student/user/register`
- `/api/admin/upload/configAndUpload`
- `/api/admin/upload/auth`

登录与退出由 Spring Security 处理：

- `POST /api/user/login`
- `POST /api/user/logout`

## 鉴权与权限

- `/api/admin/**`：管理员或教师角色访问
- `/api/student/**`：学生角色访问
- `/api/common/**`：公共查询接口
- 登录采用 Spring Security 表单登录链路，前端通过 AJAX 提交 JSON 请求体
- 管理员端通过 `withCredentials` 访问，学生端会额外带上 `token` 请求头

## 主要功能模块

- AI 配置与 AI 生成
- 协作审核与推荐反馈
- 学科、标签、用户分组
- 试卷、题目、任务管理
- 答卷阅卷与统计
- 学生学情分析
- 消息中心
- 用户与行为日志
- 考试异常日志
- 图片与资源上传

## 接口文档

详细接口说明见 [docs/API.md](./docs/API.md)。

文档按以下分组维护：

- 鉴权接口
- 公共接口
- 管理员接口
- 学生接口

## 与前端协作关系

- 管理员端默认开发地址：`http://localhost:8001`
- 学生端默认开发地址：`http://localhost:8002`
- 两个前端在本地开发时都通过 `/api` 代理到本服务
