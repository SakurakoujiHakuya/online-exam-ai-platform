CREATE TABLE IF NOT EXISTS `t_question_feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `student_id` int NOT NULL,
  `feedback_type` varchar(64) NOT NULL,
  `feedback_content` text NOT NULL,
  `ai_category` varchar(64) DEFAULT NULL,
  `ai_summary` text,
  `ai_suggestion` text,
  `analysis_source` varchar(32) DEFAULT NULL,
  `status` int NOT NULL DEFAULT '1',
  `teacher_id` int DEFAULT NULL,
  `review_comment` text,
  `create_time` datetime NOT NULL,
  `review_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_question_feedback_question` (`question_id`),
  KEY `idx_question_feedback_student` (`student_id`),
  KEY `idx_question_feedback_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `t_question_solution_contribution` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `student_id` int NOT NULL,
  `content` text NOT NULL,
  `quality_score` int DEFAULT NULL,
  `status` int NOT NULL DEFAULT '1',
  `adopted` bit(1) NOT NULL DEFAULT b'0',
  `ai_summary` text,
  `ai_suggestion` text,
  `analysis_source` varchar(32) DEFAULT NULL,
  `teacher_id` int DEFAULT NULL,
  `review_comment` text,
  `create_time` datetime NOT NULL,
  `review_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_solution_question` (`question_id`),
  KEY `idx_solution_student` (`student_id`),
  KEY `idx_solution_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `t_question_revision_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `source_type` int NOT NULL,
  `revision_type` varchar(64) NOT NULL,
  `before_snapshot` longtext,
  `after_snapshot` longtext,
  `reviewer_id` int DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_revision_question` (`question_id`),
  KEY `idx_revision_type` (`revision_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `t_ai_recommendation_record` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `recommendation_type` varchar(64) NOT NULL,
  `target_id` int DEFAULT NULL,
  `reason` text,
  `accepted` bit(1) DEFAULT NULL,
  `effect_score` int DEFAULT NULL,
  `payload` longtext,
  `create_time` datetime NOT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ai_recommendation_student` (`student_id`),
  KEY `idx_ai_recommendation_type` (`recommendation_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
