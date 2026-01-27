-- Update existing permission templates to Spanish and add proper icons
-- Run this script to update already created templates

-- Update Gaming Session
UPDATE permission_templates
SET 
    title = 'Sesión de Gaming',
    description = 'Jugar videojuegos',
    metadata = '{"icon": "game-controller-outline"}'::jsonb
WHERE title IN ('Gaming Session', 'Sesión de Gaming') AND "isSystemTemplate" = true;

-- Update Friends Hangout
UPDATE permission_templates
SET 
    title = 'Salida con Amigos',
    description = 'Pasar tiempo con amigos',
    metadata = '{"icon": "people-outline"}'::jsonb
WHERE title IN ('Friends Hangout', 'Salida con Amigos') AND "isSystemTemplate" = true;

-- Update Sports Event
UPDATE permission_templates
SET 
    title = 'Evento Deportivo',
    description = 'Ver o asistir a un evento deportivo',
    metadata = '{"icon": "football-outline"}'::jsonb
WHERE title IN ('Sports Event', 'Evento Deportivo') AND "isSystemTemplate" = true;

-- Update Night Out
UPDATE permission_templates
SET 
    title = 'Noche de Fiesta',
    description = 'Salir por la noche',
    metadata = '{"icon": "moon-outline"}'::jsonb
WHERE title IN ('Night Out', 'Noche de Fiesta') AND "isSystemTemplate" = true;

-- Update Hobby Time
UPDATE permission_templates
SET 
    title = 'Tiempo para Hobbies',
    description = 'Dedicar tiempo a pasatiempos personales',
    metadata = '{"icon": "color-palette-outline"}'::jsonb
WHERE title IN ('Hobby Time', 'Tiempo para Hobbies') AND "isSystemTemplate" = true;

-- Update Personal Time
UPDATE permission_templates
SET 
    title = 'Tiempo Personal',
    description = 'Tiempo personal sin estructura',
    metadata = '{"icon": "bed-outline"}'::jsonb
WHERE title IN ('Personal Time', 'Tiempo Personal') AND "isSystemTemplate" = true;

-- Verify the update
SELECT id, title, description, category, metadata
FROM permission_templates
WHERE "isSystemTemplate" = true
ORDER BY category, title;
