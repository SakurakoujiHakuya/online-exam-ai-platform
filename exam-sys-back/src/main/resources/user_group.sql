CREATE TABLE IF NOT EXISTS `t_user_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `deleted` bit(1) NOT NULL DEFAULT b'0',
  `create_time` datetime DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_t_user_group_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `t_user_group` (`id`, `name`, `deleted`, `create_time`, `modify_time`)
SELECT seeded.id, seeded.name, b'0', NOW(), NOW()
FROM (
  SELECT DISTINCT
    `level` AS id,
    COALESCE(NULLIF(`level_name`, ''), CONCAT('用户组', `level`)) AS name
  FROM `t_subject`
  WHERE `deleted` = 0 AND `level` IS NOT NULL
) AS seeded
LEFT JOIN `t_user_group` existing ON existing.id = seeded.id
WHERE existing.id IS NULL;
