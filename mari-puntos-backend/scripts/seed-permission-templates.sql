-- Seed Permission Templates
-- This script inserts system-wide permission templates that all couples can use

-- Gaming Templates
INSERT INTO permission_templates (title, description, category, "suggestedDurationHours", "suggestedPointsCost", "isSystemTemplate", metadata)
VALUES 
('Sesión de Gaming', 'Jugar videojuegos por unas horas', 'gaming', 2, 50, true, '{"icon": "game-controller-outline"}'),
('Maratón de Gaming', 'Sesión extendida de videojuegos', 'gaming', 4, 120, true, '{"icon": "game-controller"}'),
('Gaming Nocturno', 'Sesión de juegos después de la hora de dormir', 'gaming', 3, 100, true, '{"icon": "moon-outline"}');

-- Social Templates
INSERT INTO permission_templates (title, description, category, "suggestedDurationHours", "suggestedPointsCost", "isSystemTemplate", metadata)
VALUES 
('Salida con Amigos', 'Pasar tiempo con amigos', 'social', 3, 75, true, '{"icon": "people-outline"}'),
('Noche con Amigos', 'Salida nocturna con el grupo', 'social', 5, 150, true, '{"icon": "beer-outline"}'),
('Noche de Poker', 'Juegos de cartas con amigos', 'social', 4, 100, true, '{"icon": "cafe-outline"}'),
('Noche de Juegos', 'Juegos de mesa o actividades con amigos', 'social', 3, 75, true, '{"icon": "game-controller-outline"}');

-- Sports Templates
INSERT INTO permission_templates (title, description, category, "suggestedDurationHours", "suggestedPointsCost", "isSystemTemplate", metadata)
VALUES 
('Evento Deportivo', 'Ver o asistir a un evento deportivo', 'sports', 4, 100, true, '{"icon": "football-outline"}'),
('Partido de Fútbol', 'Ver partido de fútbol', 'sports', 3, 80, true, '{"icon": "football-outline"}'),
('Partido de Baloncesto', 'Ver partido de baloncesto', 'sports', 3, 80, true, '{"icon": "basketball-outline"}'),
('Día de Golf', 'Jugar golf con amigos', 'sports', 5, 150, true, '{"icon": "golf-outline"}'),
('Sesión de Gimnasio', 'Sesión extendida de gym o deportes', 'sports', 2, 40, true, '{"icon": "barbell-outline"}');

-- Hobbies Templates
INSERT INTO permission_templates (title, description, category, "suggestedDurationHours", "suggestedPointsCost", "isSystemTemplate", metadata)
VALUES 
('Tiempo para Hobbies', 'Dedicar tiempo a pasatiempos personales', 'hobbies', 2, 50, true, '{"icon": "color-palette-outline"}'),
('Tiempo de Taller', 'Trabajar en proyectos personales', 'hobbies', 3, 75, true, '{"icon": "build-outline"}'),
('Práctica Musical', 'Practicar instrumento musical', 'hobbies', 2, 40, true, '{"icon": "musical-notes-outline"}'),
('Sesión de Fotografía', 'Salir a tomar fotos', 'hobbies', 3, 70, true, '{"icon": "camera-outline"}');

-- Entertainment Templates
INSERT INTO permission_templates (title, description, category, "suggestedDurationHours", "suggestedPointsCost", "isSystemTemplate", metadata)
VALUES 
('Noche de Cine', 'Ir al cine', 'entertainment', 3, 60, true, '{"icon": "film-outline"}'),
('Concierto/Show', 'Asistir a un concierto o show en vivo', 'entertainment', 4, 120, true, '{"icon": "musical-notes-outline"}'),
('Noche de Fiesta', 'Entretenimiento nocturno general', 'entertainment', 4, 100, true, '{"icon": "moon-outline"}'),
('Noche de Bar/Club', 'Noche en bares o clubs', 'entertainment', 5, 150, true, '{"icon": "wine-outline"}');

-- Personal Time Templates
INSERT INTO permission_templates (title, description, category, "suggestedDurationHours", "suggestedPointsCost", "isSystemTemplate", metadata)
VALUES 
('Tiempo Personal', 'Tiempo personal sin estructura', 'personal_time', 2, 40, true, '{"icon": "bed-outline"}'),
('Mañana Relajada', 'Dormir hasta tarde y relajarse', 'personal_time', 3, 60, true, '{"icon": "cafe-outline"}'),
('Descanso Extendido', 'Tiempo extendido de relajación personal', 'personal_time', 4, 80, true, '{"icon": "bed-outline"}');

-- Other Templates
INSERT INTO permission_templates (title, description, category, "suggestedDurationHours", "suggestedPointsCost", "isSystemTemplate", metadata)
VALUES 
('Actividad Personalizada', 'Crea tu propio permiso', 'other', 2, 50, true, '{"icon": "sparkles-outline"}'),
('Ir de Compras', 'Tiempo de compras personales', 'other', 3, 70, true, '{"icon": "cart-outline"}'),
('Viaje Corto', 'Escapada corta o paseo', 'other', 6, 200, true, '{"icon": "car-sport-outline"}');
