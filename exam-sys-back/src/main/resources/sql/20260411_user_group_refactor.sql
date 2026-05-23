ALTER TABLE `t_user`
  CHANGE COLUMN `user_level` `user_group_id` INT NULL DEFAULT NULL;

ALTER TABLE `t_question`
  CHANGE COLUMN `grade_level` `user_group_id` INT NULL DEFAULT NULL;

ALTER TABLE `t_exam_paper`
  CHANGE COLUMN `grade_level` `user_group_id` INT NULL DEFAULT NULL;

ALTER TABLE `t_task_exam`
  CHANGE COLUMN `grade_level` `user_group_id` INT NULL DEFAULT NULL;

ALTER TABLE `t_subject`
  CHANGE COLUMN `level` `user_group_id` INT NULL DEFAULT NULL,
  CHANGE COLUMN `level_name` `user_group_name` VARCHAR(255) NULL DEFAULT NULL;

CREATE TABLE IF NOT EXISTS `t_user_group` (
  `id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `deleted` BIT(1) NOT NULL DEFAULT b'0',
  `create_time` DATETIME NULL DEFAULT NULL,
  `modify_time` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_t_user_group_name` (`name`)
);

INSERT INTO `t_user_group` (`id`, `name`, `deleted`, `create_time`, `modify_time`)
SELECT seeded.id, seeded.name, b'0', NOW(), NOW()
FROM (
  SELECT DISTINCT `user_group_id` AS id, CONCAT('用户组', `user_group_id`) AS name
  FROM `t_subject`
  WHERE `user_group_id` IS NOT NULL
) seeded
LEFT JOIN `t_user_group` existing ON existing.id = seeded.id
WHERE existing.id IS NULL;

UPDATE `t_subject` s
JOIN `t_user_group` g ON g.id = s.user_group_id
SET s.user_group_name = g.name
WHERE s.user_group_id IS NOT NULL;
