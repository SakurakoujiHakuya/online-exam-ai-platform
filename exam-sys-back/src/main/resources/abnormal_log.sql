-- ----------------------------
-- Table structure for t_exam_abnormal_log
-- ----------------------------
CREATE TABLE `t_exam_abnormal_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `real_name` varchar(255) DEFAULT NULL,
  `exam_paper_id` int DEFAULT NULL,
  `exam_paper_name` varchar(255) DEFAULT NULL,
  `abnormal_type` int DEFAULT NULL COMMENT '1.切屏 2.强制交卷',
  `content` text DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=COMPACT;
