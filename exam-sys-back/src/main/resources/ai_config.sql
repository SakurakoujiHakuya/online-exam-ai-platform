-- AI 大模型配置表
CREATE TABLE `t_ai_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL COMMENT '配置显示名称',
  `provider` varchar(255) DEFAULT NULL COMMENT '服务商 (openai/azure/custom)',
  `api_key` varchar(255) DEFAULT NULL COMMENT 'API 密钥',
  `base_url` varchar(255) DEFAULT NULL COMMENT '接口地址',
  `model_name` varchar(255) DEFAULT NULL COMMENT '默认模型名',
  `config_json` text COMMENT '扩展参数 (JSON)',
  `create_time` datetime DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
