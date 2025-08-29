-- =============================================
-- DIRECT SQL SCRIPT FOR SUPABASE DASHBOARD
-- Replace existing tours with authentic Peruvian tours
-- =============================================

-- First, clean existing data
DELETE FROM public.tour_availability;
DELETE FROM public.bookings;
DELETE FROM public.tours;

-- Reset sequences if needed
-- ALTER SEQUENCE tours_id_seq RESTART WITH 1;

-- Insert authentic Peruvian tours
INSERT INTO public.tours (
  title, description, full_description, city, location, meeting_point,
  price, original_price, duration, max_group_size, highlights, included,
  cancellation_policy, rating, review_count, images, is_featured, is_active
) VALUES
  -- Machu Picchu (Most popular)
  (
    'Tour Completo a Machu Picchu',
    'Descubre la maravilla del mundo en una experiencia inolvidable',
    'Viaja en tren panorámico hasta Aguas Calientes y explora la ciudadela inca de Machu Picchu con guías expertos. Aprende sobre la historia, arquitectura y misterios de esta antigua civilización mientras disfrutas de vistas espectaculares de los Andes.',
    'Cusco',
    'Ciudadela de Machu Picchu',
    'Estación San Pedro, Cusco',
    280.00,
    320.00,
    'Día completo (12 horas)',
    16,
    '["Tren panorámico ida y vuelta", "Guía certificado", "Entrada a Machu Picchu", "Vistas espectaculares de los Andes", "Historia de la civilización inca"]',
    '["Transporte en tren", "Guía profesional", "Entrada a Machu Picchu", "Bus Aguas Calientes-Machu Picchu", "Almuerzo buffet"]',
    'Cancelación gratuita hasta 48 horas antes del tour',
    4.9,
    1247,
    '["https://images.unsplash.com/photo-1587595431973-160d0d94add1", "https://images.unsplash.com/photo-1526392060635-9d6019884377"]',
    true,
    true
  ),
  
  -- Valle Sagrado
  (
    'Valle Sagrado de los Incas',
    'Explora pueblos andinos y sitios arqueológicos únicos',
    'Recorre el místico Valle Sagrado visitando Pisaq, Ollantaytambo y Chinchero. Conoce comunidades locales, mercados tradicionales y fortalezas incas mientras disfrutas de paisajes andinos espectaculares.',
    'Cusco',
    'Valle Sagrado',
    'Plaza de Armas, Cusco',
    85.00,
    110.00,
    'Día completo (8 horas)',
    20,
    '["Mercado de Pisaq", "Fortaleza de Ollantaytambo", "Pueblo de Chinchero", "Paisajes andinos", "Cultura viva"]',
    '["Transporte turístico", "Guía especializado", "Almuerzo típico", "Entradas a sitios arqueológicos"]',
    'Cancelación gratuita hasta 24 horas antes del tour',
    4.7,
    892,
    '["https://images.unsplash.com/photo-1531065208531-4036c0dba3ca", "https://images.unsplash.com/photo-1539650116574-75c0c6d73f05"]',
    true,
    true
  ),
  
  -- Cusco City Tour
  (
    'City Tour Cusco - Capital del Imperio Inca',
    'Descubre la historia inca y colonial de Cusco',
    'Explora el centro histórico de Cusco, Patrimonio de la Humanidad por UNESCO. Visita la Catedral, Qorikancha (Templo del Sol), San Pedro y los sitios arqueológicos cercanos como Sacsayhuamán.',
    'Cusco',
    'Centro Histórico de Cusco',
    'Plaza de Armas, Cusco',
    45.00,
    60.00,
    '4 horas',
    25,
    '["Catedral de Cusco", "Templo Qorikancha", "Fortaleza Sacsayhuamán", "Barrio San Blas", "Arquitectura inca y colonial"]',
    '["Guía certificado", "Transporte", "Entradas incluidas", "Mapa de Cusco"]',
    'Cancelación gratuita hasta 4 horas antes del tour',
    4.6,
    634,
    '["https://images.unsplash.com/photo-1526392060635-9d6019884377", "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699"]',
    false,
    true
  ),
  
  -- Lima Colonial
  (
    'Lima Colonial y Moderna',
    'Explora el centro histórico y distritos modernos de Lima',
    'Conoce Lima desde sus orígenes coloniales hasta su modernidad. Visita el centro histórico UNESCO, Miraflores, Barranco y degusta la reconocida gastronomía peruana.',
    'Lima',
    'Centro Histórico y Miraflores',
    'Plaza de Armas, Lima',
    65.00,
    80.00,
    '6 horas',
    18,
    '["Centro histórico UNESCO", "Catedral de Lima", "Palacio de Gobierno", "Malecón de Miraflores", "Distrito bohemio de Barranco"]',
    '["Transporte turístico", "Guía profesional", "Degustación gastronómica", "Entradas a museos"]',
    'Cancelación gratuita hasta 12 horas antes del tour',
    4.5,
    428,
    '["https://images.unsplash.com/photo-1531428445069-9d96e9daa0a7", "https://images.unsplash.com/photo-1544197150-b99a580bb7a8"]',
    true,
    true
  ),
  
  -- Lima Gastronómico
  (
    'Tour Gastronómico por Lima',
    'Descubre los sabores de la capital gastronómica de Sudamérica',
    'Degusta los platos más emblemáticos de la cocina peruana en mercados locales y restaurantes tradicionales. Aprende sobre ingredientes nativos y técnicas culinarias ancestrales.',
    'Lima',
    'Mercados y restaurantes locales',
    'Mercado Central de Lima',
    75.00,
    95.00,
    '4 horas',
    12,
    '["Ceviche fresco", "Anticuchos tradicionales", "Pisco Sour", "Mercados locales", "Ingredientes nativos"]',
    '["Guía gastronómico", "Degustaciones incluidas", "Bebidas", "Recetario peruano"]',
    'Cancelación gratuita hasta 24 horas antes del tour',
    4.8,
    567,
    '["https://images.unsplash.com/photo-1414235077428-338989a2e8c0", "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa"]',
    true,
    true
  ),
  
  -- Cañón del Colca
  (
    'Cañón del Colca - Cóndores en Vuelo',
    'Observa el majestuoso vuelo de los cóndores en el cañón más profundo',
    'Viaja al impresionante Cañón del Colca, uno de los cañones más profundos del mundo. Observa cóndores en su hábitat natural, visita pueblos tradicionales y disfruta de aguas termales naturales.',
    'Arequipa',
    'Cañón del Colca',
    'Plaza de Armas, Arequipa',
    120.00,
    150.00,
    '2 días / 1 noche',
    14,
    '["Vuelo de cóndores", "Mirador Cruz del Cóndor", "Pueblos tradicionales", "Aguas termales", "Paisajes andinos"]',
    '["Transporte turístico", "Alojamiento rural", "Guía naturalista", "Desayunos", "Entradas"]',
    'Cancelación gratuita hasta 72 horas antes del tour',
    4.7,
    341,
    '["https://images.unsplash.com/photo-1464822759844-d150ad6d1dd4", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"]',
    true,
    true
  ),
  
  -- Arequipa City Tour
  (
    'City Tour Arequipa - La Ciudad Blanca',
    'Explora la arquitectura colonial de sillar volcánico blanco',
    'Descubre por qué Arequipa es conocida como "La Ciudad Blanca". Visita el Monasterio de Santa Catalina, la Plaza de Armas y aprende sobre la arquitectura única hecha de sillar volcánico.',
    'Arequipa',
    'Centro Histórico de Arequipa',
    'Plaza de Armas, Arequipa',
    50.00,
    65.00,
    '3 horas',
    20,
    '["Monasterio Santa Catalina", "Catedral de Arequipa", "Arquitectura de sillar", "Mirador de Yanahuara", "Casa del Moral"]',
    '["Guía local", "Entradas incluidas", "Transporte", "Mapa turístico"]',
    'Cancelación gratuita hasta 6 horas antes del tour',
    4.4,
    289,
    '["https://images.unsplash.com/photo-1541961017774-22349e4a1262", "https://images.unsplash.com/photo-1518709268805-4e9042af2176"]',
    false,
    true
  ),
  
  -- Lago Titicaca
  (
    'Lago Titicaca - Islas Flotantes Uros',
    'Navega por el lago navegable más alto del mundo',
    'Explora las fascinantes islas artificiales de los Uros hechas completamente de totora. Aprende sobre esta antigua cultura lacustre y disfruta de la navegación en el místico Lago Titicaca.',
    'Puno',
    'Lago Titicaca',
    'Puerto de Puno',
    45.00,
    60.00,
    '4 horas',
    16,
    '["Islas flotantes de totora", "Cultura Uros", "Lago navegable más alto del mundo", "Navegación en balsas tradicionales", "Artesanías locales"]',
    '["Transporte lacustre", "Guía bilingüe", "Entrada a islas", "Demostración cultural"]',
    'Cancelación gratuita hasta 12 horas antes del tour',
    4.6,
    523,
    '["https://images.unsplash.com/photo-1469474968028-56623f02e42e", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"]',
    true,
    true
  ),
  
  -- Huacachina
  (
    'Oasis de Huacachina y Sandboarding',
    'Aventura en dunas y oasis en el desierto peruano',
    'Vive la emoción del sandboarding y paseos en buggy por las impresionantes dunas de Ica. Relájate en el hermoso oasis de Huacachina, una laguna natural rodeada de palmeras en medio del desierto.',
    'Ica',
    'Desierto de Ica y Oasis de Huacachina',
    'Oasis de Huacachina',
    55.00,
    70.00,
    '3 horas',
    12,
    '["Sandboarding extremo", "Paseo en buggy", "Oasis natural", "Dunas espectaculares", "Atardecer en el desierto"]',
    '["Equipo de sandboarding", "Buggy y conductor", "Instructor de sandboarding", "Seguro de aventura"]',
    'Cancelación gratuita hasta 24 horas antes del tour',
    4.8,
    412,
    '["https://images.unsplash.com/photo-1544551763-46a013bb70d5", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"]',
    true,
    true
  ),
  
  -- Islas Ballestas
  (
    'Islas Ballestas - Galápagos Peruanos',
    'Observa vida marina en las Islas Ballestas',
    'Navega hacia las Islas Ballestas para observar leones marinos, pingüinos de Humboldt, pelícanos y otras especies en su hábitat natural. Conocidas como los "Galápagos Peruanos" por su rica biodiversidad.',
    'Paracas',
    'Islas Ballestas',
    'Puerto de Paracas',
    35.00,
    45.00,
    '2.5 horas',
    18,
    '["Leones marinos", "Pingüinos de Humboldt", "Aves marinas", "Candelabro de Paracas", "Biodiversidad marina"]',
    '["Lancha rápida", "Guía naturalista", "Chalecos salvavidas", "Entrada a la reserva"]',
    'Cancelación gratuita hasta 6 horas antes del tour',
    4.5,
    687,
    '["https://images.unsplash.com/photo-1544551763-46a013bb70d5", "https://images.unsplash.com/photo-1469474968028-56623f02e42e"]',
    false,
    true
  );

-- Generate tour availability for the next 60 days
INSERT INTO public.tour_availability (tour_id, available_date, time_slots, available_spots, is_available)
SELECT 
  t.id,
  CURRENT_DATE + (generate_series(1, 60) || ' days')::interval as available_date,
  CASE 
    WHEN t.duration LIKE '%completo%' OR t.duration LIKE '%día%' OR t.duration LIKE '%noche%' THEN '["08:00"]'::jsonb
    ELSE '["08:00", "14:00"]'::jsonb
  END as time_slots,
  t.max_group_size as available_spots,
  true as is_available
FROM public.tours t;