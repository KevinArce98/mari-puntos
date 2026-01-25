-- MariPuntos - Seed Global Achievements
-- These are template achievements that will be created for each user

-- Note: These are examples. In the actual app, achievements are created
-- per user by the PointsService when milestones are reached.

-- This script is for reference and can be used to manually create
-- achievement templates if needed in the future.

-- Points Milestone Achievements
-- INSERT INTO achievements ("title", "description", "type", "pointsReward", "requiredValue", "iconUrl", "createdAt", "updatedAt")
-- VALUES
--   ('First 100 Points', 'Earned your first 100 points', 'points_milestone', 50, 100, NULL, NOW(), NOW()),
--   ('500 Points Master', 'Accumulated 500 total points', 'points_milestone', 50, 500, NULL, NOW(), NOW()),
--   ('1000 Points Champion', 'Reached 1000 total points', 'points_milestone', 50, 1000, NULL, NOW(), NOW()),
--   ('5000 Points Legend', 'Achieved 5000 total points', 'points_milestone', 50, 5000, NULL, NOW(), NOW()),
--   ('10000 Points Titan', 'Reached the legendary 10000 points', 'points_milestone', 50, 10000, NULL, NOW(), NOW());

-- Level Milestone Achievements
-- INSERT INTO achievements ("title", "description", "type", "pointsReward", "requiredValue", "iconUrl", "createdAt", "updatedAt")
-- VALUES
--   ('Level 5 Champion', 'Reached level 5', 'level_milestone', 50, 5, NULL, NOW(), NOW()),
--   ('Level 10 Master', 'Reached level 10', 'level_milestone', 50, 10, NULL, NOW(), NOW()),
--   ('Level 25 Legend', 'Reached level 25', 'level_milestone', 50, 25, NULL, NOW(), NOW()),
--   ('Level 50 Titan', 'Reached level 50', 'level_milestone', 50, 50, NULL, NOW(), NOW()),
--   ('Level 100 Transcendent', 'Reached level 100', 'level_milestone', 50, 100, NULL, NOW(), NOW());

-- Action Count Achievements (Future)
-- INSERT INTO achievements ("title", "description", "type", "pointsReward", "requiredValue", "iconUrl", "createdAt", "updatedAt")
-- VALUES
--   ('First Action', 'Completed your first action', 'actions_completed', 25, 1, NULL, NOW(), NOW()),
--   ('10 Actions Complete', 'Completed 10 actions', 'actions_completed', 50, 10, NULL, NOW(), NOW()),
--   ('50 Actions Complete', 'Completed 50 actions', 'actions_completed', 100, 50, NULL, NOW(), NOW()),
--   ('100 Actions Complete', 'Completed 100 actions', 'actions_completed', 200, 100, NULL, NOW(), NOW());

-- Special Achievements (Future)
-- INSERT INTO achievements ("title", "description", "type", "pointsReward", "iconUrl", "createdAt", "updatedAt")
-- VALUES
--   ('Perfect Week', 'Completed actions every day for a week', 'special', 100, NULL, NOW(), NOW()),
--   ('Perfect Month', 'Completed actions every day for a month', 'special', 500, NULL, NOW(), NOW()),
--   ('Early Bird', 'Completed 10 actions before 9 AM', 'special', 75, NULL, NOW(), NOW()),
--   ('Night Owl', 'Completed 10 actions after 9 PM', 'special', 75, NULL, NOW(), NOW());

SELECT 'Achievement templates ready for implementation' AS status;
