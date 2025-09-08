const XLSX = require('xlsx');
const path = require('path');

// Función para leer y procesar el archivo Excel
function readExcelFile() {
  try {
    const filePath = path.join(__dirname, '..', 'FILTROS - Camila tours.xlsx');
    console.log('📖 Leyendo archivo:', filePath);
    
    // Leer el archivo Excel
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Primera hoja
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Encontradas ${rawData.length} filas de datos`);
    
    if (rawData.length === 0) {
      console.log('⚠️ No se encontraron datos en el archivo');
      return [];
    }
    
    // Mostrar las primeras columnas para entender la estructura
    console.log('📋 Columnas disponibles:', Object.keys(rawData[0]));
    console.log('📄 Primera fila de ejemplo:', rawData[0]);
    
    return rawData;
    
  } catch (error) {
    console.error('❌ Error leyendo archivo Excel:', error.message);
    return [];
  }
}

// Función para limpiar y procesar los datos
function processExcelData(rawData) {
  const tours = [];
  
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    
    try {
      // Mapear campos del Excel a la estructura de la BD
      // Ajusta estos nombres según las columnas de tu archivo Excel
      const tour = {
        title: cleanText(
          row['Título'] || row['TÍTULO'] || row['title'] || row['Nombre'] || row['Tour']
        ) || `Tour ${i + 1}`,
        
        description: cleanText(
          row['Descripción'] || row['DESCRIPCIÓN'] || row['description'] || row['Descripción Corta']
        ) || 'Experiencia única en Perú',
        
        full_description: cleanText(
          row['Descripción Completa'] || row['DESCRIPCIÓN COMPLETA'] || row['full_description'] ||
          row['Descripción Larga'] || row['Detalle']
        ),
        
        city: cleanText(
          row['Ciudad'] || row['CIUDAD'] || row['city'] || row['Destino'] || row['Ubicación']
        ) || 'Lima',
        
        location: cleanText(
          row['Ubicación'] || row['UBICACIÓN'] || row['location'] || row['Lugar']
        ),
        
        meeting_point: cleanText(
          row['Punto de Encuentro'] || row['PUNTO DE ENCUENTRO'] || row['meeting_point'] ||
          row['Punto Encuentro'] || row['Encuentro']
        ) || 'Por confirmar',
        
        price: processPrice(
          row['Precio'] || row['PRECIO'] || row['price'] || row['Costo'] || row['Tarifa']
        ),
        
        original_price: processPrice(
          row['Precio Original'] || row['PRECIO ORIGINAL'] || row['original_price'] ||
          row['Precio Antes'] || row['Precio Normal']
        ),
        
        duration: cleanText(
          row['Duración'] || row['DURACIÓN'] || row['duration'] || row['Tiempo'] || row['Horas']
        ) || 'Día completo',
        
        max_group_size: parseInt(
          row['Grupo Máximo'] || row['GRUPO MÁXIMO'] || row['max_group_size'] ||
          row['Capacidad'] || row['Personas'] || 20
        ),
        
        highlights: processArray(
          row['Highlights'] || row['HIGHLIGHTS'] || row['highlights'] || 
          row['Lo Mejor'] || row['Puntos Destacados'] || row['Incluye']
        ),
        
        included: processArray(
          row['Incluido'] || row['INCLUIDO'] || row['included'] || 
          row['Incluye'] || row['Servicios Incluidos']
        ),
        
        cancellation_policy: cleanText(
          row['Política de Cancelación'] || row['POLÍTICA DE CANCELACIÓN'] || 
          row['cancellation_policy'] || row['Cancelación']
        ) || 'Cancelación gratuita hasta 24 horas antes',
        
        rating: processRating(
          row['Rating'] || row['RATING'] || row['rating'] || 
          row['Valoración'] || row['Puntuación'] || row['Estrellas']
        ),
        
        review_count: parseInt(
          row['Reseñas'] || row['RESEÑAS'] || row['review_count'] || 
          row['Reviews'] || row['Comentarios'] || 0
        ),
        
        images: processArray(
          row['Imágenes'] || row['IMÁGENES'] || row['images'] || 
          row['Fotos'] || row['URLs']
        ),
        
        is_featured: processBoolean(
          row['Destacado'] || row['DESTACADO'] || row['is_featured'] || 
          row['Featured'] || row['Destacar']
        ),
        
        is_active: processBoolean(
          row['Activo'] || row['ACTIVO'] || row['is_active'] || 
          row['Active'] || row['Disponible']
        ),
        
        category: determineCategory(
          row['Categoría'] || row['CATEGORÍA'] || row['category'] || 
          row['Tipo'] || row['Clasificación'],
          row['Duración'] || row['DURACIÓN'] || row['duration']
        ),
        
        location_type: determineLocationType(
          row['Ciudad'] || row['CIUDAD'] || row['city'],
          row['País'] || row['PAÍS'] || row['country']
        ),
        
        tour_type: determineTourType(
          row['Tipo Tour'] || row['TIPO TOUR'] || row['tour_type'] || 
          row['Tipo'] || row['Modalidad']
        ),
        
        coordinates: processCoordinates(
          row['Latitud'] || row['LATITUD'] || row['lat'] || row['latitude'],
          row['Longitud'] || row['LONGITUD'] || row['lon'] || row['longitude']
        )
      };
      
      // Validar que tenga al menos título y ciudad
      if (tour.title && tour.city) {
        tours.push(tour);
      }
      
    } catch (error) {
      console.error(`❌ Error procesando fila ${i + 1}:`, error.message);
    }
  }
  
  console.log(`✅ Procesados ${tours.length} tours exitosamente`);
  return tours;
}

// Funciones auxiliares
function cleanText(text) {
  if (!text) return null;
  return String(text).trim();
}

function processArray(text) {
  if (!text) return [];
  return String(text).split(/[,;]/).map(item => item.trim()).filter(item => item.length > 0);
}

function processPrice(price) {
  if (!price) return 0;
  const cleanPrice = String(price).replace(/[^\d.,]/g, '').replace(',', '.');
  return parseFloat(cleanPrice) || 0;
}

function processRating(rating) {
  if (!rating) return 4.5; // Rating por defecto
  const cleanRating = parseFloat(String(rating).replace(',', '.'));
  return Math.min(Math.max(cleanRating || 4.5, 0), 5);
}

function processBoolean(value) {
  if (!value) return false;
  const str = String(value).toLowerCase();
  return str === 'true' || str === 'sí' || str === 'si' || str === 'yes' || str === '1';
}

function processCoordinates(lat, lon) {
  if (!lat || !lon) return null;
  const latitude = parseFloat(String(lat).replace(',', '.'));
  const longitude = parseFloat(String(lon).replace(',', '.'));
  if (isNaN(latitude) || isNaN(longitude)) return null;
  return { lat: latitude, lon: longitude };
}

function determineCategory(category, duration) {
  if (category) {
    const cat = String(category).toLowerCase();
    if (cat.includes('destacado') || cat.includes('featured')) return 'featured';
    if (cat.includes('varios') || cat.includes('multi')) return 'multi_day';
    if (cat.includes('día') || cat.includes('day')) return 'one_day';
    if (cat.includes('ticket') || cat.includes('entrada')) return 'ticket';
  }
  
  // Determinar por duración
  if (duration) {
    const dur = String(duration).toLowerCase();
    if (dur.includes('días') || dur.includes('days')) {
      const days = parseInt(dur.match(/\d+/)?.[0] || '1');
      if (days > 1) return 'multi_day';
    }
    if (dur.includes('hora') || dur.includes('hour')) return 'one_day';
  }
  
  return 'peru_in'; // Por defecto
}

function determineLocationType(city, country) {
  const cityText = String(city || '').toLowerCase();
  const countryText = String(country || '').toLowerCase();
  
  const peruvianCities = ['lima', 'cusco', 'arequipa', 'puno', 'iquitos', 'trujillo'];
  
  if (countryText.includes('perú') || countryText.includes('peru') ||
      peruvianCities.some(c => cityText.includes(c))) {
    return 'domestic';
  }
  
  return 'international';
}

function determineTourType(type) {
  if (!type) return 'tour';
  const typeText = String(type).toLowerCase();
  if (typeText.includes('ticket') || typeText.includes('entrada')) return 'ticket';
  return 'tour';
}

// Función principal
function main() {
  console.log('🚀 Iniciando carga de datos desde Excel...');
  
  // Leer datos del Excel
  const rawData = readExcelFile();
  if (rawData.length === 0) {
    console.log('❌ No hay datos para procesar');
    return;
  }
  
  // Procesar datos
  const tours = processExcelData(rawData);
  if (tours.length === 0) {
    console.log('❌ No se procesaron tours válidos');
    return;
  }
  
  // Mostrar datos procesados
  console.log('\n📋 Ejemplo de tour procesado:');
  console.log(JSON.stringify(tours[0], null, 2));
  
  // Exportar los datos para usar con MCP
  console.log(`\n💾 Tours procesados: ${tours.length}`);
  console.log('📤 Los datos están listos para cargar a Supabase');
  
  return tours;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { readExcelFile, processExcelData };

