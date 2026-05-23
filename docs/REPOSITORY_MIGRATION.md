# 仓库迁移说明

本项目最初由三个独立仓库维护：

| 模块 | 原仓库 |
| --- | --- |
| 管理端 | `git@github.com:SakurakoujiHakuya/exam-sys-admin.git` |
| 学生端 | `git@github.com:SakurakoujiHakuya/exam-sys-stu.git` |
| 后端 | `git@github.com:SakurakoujiHakuya/exam-sys-back.git` |

现在项目已整理为 monorepo：

```text
.
├── exam-sys-admin/
├── exam-sys-stu/
├── exam-sys-back/
├── docs/
├── docker-compose.yml
└── README.md
```

## 本次整理做了什么

- 在根目录新增主 README，用一个仓库展示完整系统。
- 增加 `docs/screenshots/`，集中存放学生端和管理端实机截图。
- 增加根 `.gitignore`，统一忽略前后端构建产物、依赖目录、IDE 文件和历史 Git 元数据。
- 将三个子项目原本的 `.git` 目录改名为 `.git-legacy`，避免总仓库把子目录识别成 submodule。

## 历史 Git 元数据

三个子目录中的 `.git-legacy` 是原独立仓库的本地 Git 元数据备份，默认被根 `.gitignore` 忽略，不会提交到新仓库。

如果以后需要临时回到某个旧仓库状态，可在对应目录中把 `.git-legacy` 改回 `.git`：

```bash
cd exam-sys-admin
mv .git-legacy .git
```

恢复后请注意：该目录会重新变成独立 Git 仓库，不适合直接放在 monorepo 中提交。用完后建议再改回 `.git-legacy`。

## 推荐发布方式

1. 在 GitHub 新建一个主仓库，例如 `exam-system` 或 `online-exam-ai-platform`。
2. 将当前根目录作为主仓库推送到新仓库。
3. 原三个仓库保留为归档仓库，并在它们的 README 顶部添加迁移说明：

```md
> 本项目已合并到主仓库维护：[online-exam-ai-platform](https://github.com/SakurakoujiHakuya/online-exam-ai-platform)
```

4. 后续开发优先在主仓库维护，避免三端接口、截图、部署文档再次分散。
