const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Función para limpiar y procesar texto
function cleanText(text) {
  if (!text) return null;
  return String(text).trim();
}

// Función para procesar arrays desde Excel (separados por comas o punto y coma)
function processArray(text) {
  if (!text) return [];
  return String(text).split(/[,;]/).map(item => item.trim()).filter(item => item.length > 0);
}

// Función para procesar precio
function processPrice(price) {
  if (!price) return 0;
  const cleanPrice = String(price).replace(/[^\d.,]/g, '').replace(',', '.');
  return parseFloat(cleanPrice) || 0;
}

// Función para procesar rating
function processRating(rating) {
  if (!rating) return 0;
  const cleanRating = parseFloat(String(rating).replace(',', '.'));
  return Math.min(Math.max(cleanRating || 0, 0), 5);
}

// Función para procesar coordenadas
function processCoordinates(lat, lon) {
  if (!lat || !lon) return null;
  const latitude = parseFloat(String(lat).replace(',', '.'));
  const longitude = parseFloat(String(lon).replace(',', '.'));
  if (isNaN(latitude) || isNaN(longitude)) return null;
  return { lat: latitude, lon: longitude };
}

// Función para determinar categoría basada en duración o tipo
function determineCategory(duration, tourType, city) {
  const durationText = String(duration || '').toLowerCase();
  const typeText = String(tourType || '').toLowerCase();
  
  // Si contiene "día" o "days" y número > 1, es multi-day
  if (durationText.includes('días') || durationText.includes('days')) {
    const days = parseInt(durationText.match(/\d+/)?.[0] || '1');
    if (days > 1) return 'multi_day';
  }
  
  // Si es ticket o entrada
  if (typeText.includes('ticket') || typeText.includes('entrada')) {
    return 'ticket';
  }
  
  // Si es de un día
  if (durationText.includes('día') || durationText.includes('day') || 
      durationText.includes('hora') || durationText.includes('hour')) {
    return 'one_day';
  }
  
  // Por defecto, tours en Perú son peru_in
  return 'peru_in';
}

// Función para determinar location_type
function determineLocationType(city, country) {
  const cityText = String(city || '').toLowerCase();
  const countryText = String(country || '').toLowerCase();
  
  // Ciudades peruanas conocidas
  const peruvianCities = ['lima', 'cusco', 'arequipa', 'puno', 'iquitos', 'trujillo', 'huancayo', 'ayacucho'];
  
  if (countryText.includes('perú') || countryText.includes('peru') ||
      peruvianCities.some(city => cityText.includes(city))) {
    return 'domestic';
  }
  
  return 'international';
}

// Mapeo de columnas del Excel (ajusta según tu archivo)
const columnMapping = {
  // Campos básicos
  'título': 'title',
  'title': 'title',
  'nombre': 'title',
  
  'descripción': 'description',
  'description': 'description',
  'descripción_corta': 'description',
  
  'descripción_completa': 'full_description',
  'full_description': 'full_description',
  'descripción_larga': 'full_description',
  
  'ciudad': 'city',
  'city': 'city',
  'destino': 'city',
  
  'ubicación': 'location',
  'location': 'location',
  'lugar': 'location',
  
  'punto_encuentro': 'meeting_point',
  'meeting_point': 'meeting_point',
  'punto_de_encuentro': 'meeting_point',
  
  // Precios
  'precio': 'price',
  'price': 'price',
  'costo': 'price',
  
  'precio_original': 'original_price',
  'original_price': 'original_price',
  'precio_antes': 'original_price',
  
  // Duración y capacidad
  'duración': 'duration',
  'duration': 'duration',
  'tiempo': 'duration',
  
  'grupo_máximo': 'max_group_size',
  'max_group_size': 'max_group_size',
  'capacidad': 'max_group_size',
  
  // Listas
  'highlights': 'highlights',
  'puntos_destacados': 'highlights',
  'lo_mejor': 'highlights',
  
  'incluido': 'included',
  'included': 'included',
  'incluye': 'included',
  
  // Políticas y ratings
  'política_cancelación': 'cancellation_policy',
  'cancellation_policy': 'cancellation_policy',
  'cancelación': 'cancellation_policy',
  
  'rating': 'rating',
  'valoración': 'rating',
  'puntuación': 'rating',
  
  'reviews': 'review_count',
  'reseñas': 'review_count',
  'comentarios': 'review_count',
  
  // Imágenes
  'imágenes': 'images',
  'images': 'images',
  'fotos': 'images',
  
  // Flags
  'destacado': 'is_featured',
  'featured': 'is_featured',
  'es_destacado': 'is_featured',
  
  'activo': 'is_active',
  'active': 'is_active',
  'disponible': 'is_active',
  
  // Categorización
  'categoría': 'category',
  'category': 'category',
  'tipo_tour': 'tour_type',
  'tipo': 'tour_type',
  
  // Coordenadas
  'latitud': 'latitude',
  'lat': 'latitude',
  'longitud': 'longitude',
  'lon': 'longitude',
  'lng': 'longitude',
  
  // País para determinar location_type
  'país': 'country',
  'country': 'country'
};

// Función principal para procesar el archivo Excel
async function loadToursFromExcel(filePath) {
  try {
    console.log('📖 Leyendo archivo Excel:', filePath);
    
    // Leer el archivo Excel
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Primera hoja
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Encontradas ${rawData.length} filas de datos`);
    
    if (rawData.length === 0) {
      console.log('⚠️ No se encontraron datos en el archivo');
      return;
    }
    
    // Mostrar las columnas disponibles
    console.log('📋 Columnas disponibles:', Object.keys(rawData[0]));
    
    const tours = [];
    
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      
      try {
        // Crear objeto tour mapeando las columnas
        const tour = {};
        
        // Mapear cada columna del Excel a los campos de la base de datos
        for (const [excelColumn, dbField] of Object.entries(columnMapping)) {
          const value = row[excelColumn] || row[excelColumn.toUpperCase()] || row[excelColumn.toLowerCase()];
          if (value !== undefined && value !== null && value !== '') {
            tour[dbField] = value;
          }
        }
        
        // Procesar campos específicos
        const processedTour = {
          title: cleanText(tour.title) || `Tour ${i + 1}`,
          description: cleanText(tour.description) || 'Descripción no disponible',
          full_description: cleanText(tour.full_description),
          city: cleanText(tour.city) || 'No especificado',
          location: cleanText(tour.location) || cleanText(tour.city) || 'No especificado',
          meeting_point: cleanText(tour.meeting_point) || 'Por confirmar',
          price: processPrice(tour.price),
          original_price: processPrice(tour.original_price),
          duration: cleanText(tour.duration) || 'Por confirmar',
          max_group_size: parseInt(tour.max_group_size) || 20,
          highlights: processArray(tour.highlights),
          included: processArray(tour.included),
          cancellation_policy: cleanText(tour.cancellation_policy) || 'Consultar política de cancelación',
          rating: processRating(tour.rating),
          review_count: parseInt(tour.review_count) || 0,
          images: processArray(tour.images),
          is_featured: Boolean(tour.is_featured),
          is_active: tour.is_active !== false, // Por defecto true
          category: tour.category || determineCategory(tour.duration, tour.tour_type, tour.city),
          location_type: tour.location_type || determineLocationType(tour.city, tour.country),
          tour_type: tour.tour_type || 'tour',
          coordinates: processCoordinates(tour.latitude, tour.longitude)
        };
        
        tours.push(processedTour);
        
      } catch (error) {
        console.error(`❌ Error procesando fila ${i + 1}:`, error.message);
      }
    }
    
    console.log(`✅ Procesados ${tours.length} tours exitosamente`);
    
    // Insertar tours en la base de datos
    if (tours.length > 0) {
      console.log('💾 Insertando tours en la base de datos...');
      
      // Primero, limpiar tours existentes si se desea (opcional)
      const shouldClearExisting = process.argv.includes('--clear-existing');
      if (shouldClearExisting) {
        console.log('🗑️ Eliminando tours existentes...');
        await supabase.from('tours').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      }
      
      // Insertar en lotes de 50
      const batchSize = 50;
      for (let i = 0; i < tours.length; i += batchSize) {
        const batch = tours.slice(i, i + batchSize);
        
        const { data, error } = await supabase
          .from('tours')
          .insert(batch);
        
        if (error) {
          console.error(`❌ Error insertando lote ${Math.floor(i / batchSize) + 1}:`, error);
        } else {
          console.log(`✅ Lote ${Math.floor(i / batchSize) + 1} insertado exitosamente (${batch.length} tours)`);
        }
      }
      
      console.log('🎉 Carga de tours completada!');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecución del script
if (require.main === module) {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.log('📖 Uso: node load-tours-from-excel.js <ruta-archivo-excel> [--clear-existing]');
    console.log('📖 Ejemplo: node load-tours-from-excel.js ./FILTROS.xlsx');
    console.log('📖 Ejemplo (limpiando datos existentes): node load-tours-from-excel.js ./FILTROS.xlsx --clear-existing');
    process.exit(1);
  }
  
  loadToursFromExcel(filePath);
}

module.exports = { loadToursFromExcel };

