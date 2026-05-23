# Railway 部署说明

本后端是 Spring Boot + MySQL，推荐在 Railway 中拆成两个服务：

- `exam-sys-back`：从本目录的 `Dockerfile` 构建后端镜像。
- `mysql`：使用 Railway 的 MySQL 数据库服务。Railway 的 MySQL 服务会从官方 MySQL Docker image 部署，并自动提供连接变量。

Railway 不会像本地一样长期直接运行 `docker-compose.yml`。Compose 中的 `backend` 和 `mysql` 在 Railway 上应分别对应两个服务。

## 1. 创建 MySQL 服务

在 Railway 项目中点击 `+ New`，选择 `Database` -> `MySQL`。

创建后，MySQL 服务会提供这些变量：

- `MYSQLHOST`
- `MYSQLPORT`
- `MYSQLUSER`
- `MYSQLPASSWORD`
- `MYSQLDATABASE`
- `MYSQL_URL`

## 2. 创建后端服务

从 GitHub 仓库创建服务时，后端服务设置如下：

- Root Directory: `/exam-sys-back`
- Config File: `/exam-sys-back/railway.toml`
- Public Networking: Generate Domain

本目录的 `railway.toml` 会让 Railway 使用 `Dockerfile` 构建，并用 `/health` 做健康检查。

## 3. 绑定数据库变量

在后端服务的 Variables 中，把 MySQL 服务变量引用过来：

```text
MYSQLHOST=${{mysql.MYSQLHOST}}
MYSQLPORT=${{mysql.MYSQLPORT}}
MYSQLUSER=${{mysql.MYSQLUSER}}
MYSQLPASSWORD=${{mysql.MYSQLPASSWORD}}
MYSQLDATABASE=${{mysql.MYSQLDATABASE}}
```

如果你的 MySQL 服务名不是 `mysql`，把上面的 `mysql` 改成 Railway 画布上的实际服务名。

后端生产配置见 `src/main/resources/application-prod.yml`，会自动读取 Railway 的 `PORT` 和这些 `MYSQL*` 变量。不要把 `MYSQL_URL` 直接设置成 Spring 的 `spring.datasource.url`，Railway 提供的 `MYSQL_URL` 常见格式不是 `jdbc:mysql://...`。

## 4. 初始化数据库

Railway 创建的 MySQL 服务不会自动执行仓库里的 SQL 文件。首次部署后，需要导入：

```text
backup/init.sql
```

导入前建议检查并替换 `t_ai_config` 里的 API key 示例值，不要把真实密钥提交或导入到共享环境。

可选方式：

- 在 Railway MySQL 的 Data/Query 页面执行 SQL。
- 用 Railway 提供的 TCP Proxy 连接 MySQL 后，通过本地 MySQL 客户端导入。

示例：

```bash
mysql -h <TCP_PROXY_HOST> -P <TCP_PROXY_PORT> -u <MYSQLUSER> -p <MYSQLDATABASE> < backup/init.sql
```

## 5. 本地 Docker 验证

本地仍可用根目录的 compose 同时启动 MySQL 和后端：

```bash
docker compose up --build
```

后端本地地址：

```text
http://localhost:8000/health
```

## 6. 部署检查

部署成功后访问：

```text
https://<your-railway-domain>/health
```

返回：

```json
{"status":"ok"}
```

说明容器、端口和健康检查已经正常。
