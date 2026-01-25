-- MariPuntos - Seed Levels Data
-- Run this script to populate the levels table with predefined levels

-- Clear existing levels (optional)
-- DELETE FROM levels;

-- Insert predefined levels
INSERT INTO levels ("levelNumber", "title", "description", "pointsRequired", "iconUrl", "badgeUrl", "rewards", "metadata", "createdAt", "updatedAt")
VALUES
  (1, 'Novice Helper', 'Just getting started on your journey', 0, NULL, NULL, '{"bonus": "Welcome bonus"}', '{"color": "#gray"}', NOW(), NOW()),
  (2, 'Eager Assistant', 'Starting to show commitment', 100, NULL, NULL, '{"bonus": "10 bonus points"}', '{"color": "#bronze"}', NOW(), NOW()),
  (3, 'Reliable Partner', 'Consistently helping out', 200, NULL, NULL, '{"bonus": "20 bonus points"}', '{"color": "#bronze"}', NOW(), NOW()),
  (4, 'Dedicated Contributor', 'Going above and beyond', 300, NULL, NULL, '{"bonus": "30 bonus points"}', '{"color": "#silver"}', NOW(), NOW()),
  (5, 'Household Hero', 'A true household champion', 400, NULL, NULL, '{"bonus": "50 bonus points", "unlock": "Special rewards"}', '{"color": "#silver"}', NOW(), NOW()),
  (6, 'Super Helper', 'Exceptional dedication', 500, NULL, NULL, '{"bonus": "60 bonus points"}', '{"color": "#gold"}', NOW(), NOW()),
  (7, 'Master of Tasks', 'Mastering the art of helping', 600, NULL, NULL, '{"bonus": "70 bonus points"}', '{"color": "#gold"}', NOW(), NOW()),
  (8, 'Elite Partner', 'Among the best', 700, NULL, NULL, '{"bonus": "80 bonus points"}', '{"color": "#gold"}', NOW(), NOW()),
  (9, 'Legendary Helper', 'Legendary status achieved', 800, NULL, NULL, '{"bonus": "90 bonus points"}', '{"color": "#platinum"}', NOW(), NOW()),
  (10, 'Ultimate Champion', 'The ultimate household champion', 900, NULL, NULL, '{"bonus": "100 bonus points", "unlock": "All premium rewards"}', '{"color": "#platinum"}', NOW(), NOW()),
  (15, 'Grand Master', 'Extraordinary commitment', 1400, NULL, NULL, '{"bonus": "150 bonus points"}', '{"color": "#diamond"}', NOW(), NOW()),
  (20, 'Supreme Legend', 'Supreme legendary status', 1900, NULL, NULL, '{"bonus": "200 bonus points"}', '{"color": "#diamond"}', NOW(), NOW()),
  (25, 'Mythical Hero', 'Mythical status achieved', 2400, NULL, NULL, '{"bonus": "250 bonus points"}', '{"color": "#mythic"}', NOW(), NOW()),
  (50, 'Eternal Champion', 'Eternal champion of the household', 4900, NULL, NULL, '{"bonus": "500 bonus points", "unlock": "Exclusive eternal rewards"}', '{"color": "#eternal"}', NOW(), NOW()),
  (100, 'Transcendent Master', 'Transcended all expectations', 9900, NULL, NULL, '{"bonus": "1000 bonus points", "unlock": "Ultimate rewards"}', '{"color": "#transcendent"}', NOW(), NOW())
ON CONFLICT ("levelNumber") DO NOTHING;

-- Verify insertion
SELECT "levelNumber", "title", "pointsRequired" FROM levels ORDER BY "levelNumber";
