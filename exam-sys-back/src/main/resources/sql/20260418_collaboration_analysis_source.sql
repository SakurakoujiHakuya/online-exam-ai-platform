ALTER TABLE `t_question_feedback`
    ADD COLUMN `analysis_source` varchar(32) DEFAULT NULL AFTER `ai_suggestion`;

ALTER TABLE `t_question_solution_contribution`
    ADD COLUMN `analysis_source` varchar(32) DEFAULT NULL AFTER `ai_suggestion`;
