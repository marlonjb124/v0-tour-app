const XLSX = require('xlsx');
const path = require('path');

// Función para leer todos los tours del Excel
function loadAllToursFromExcel() {
  try {
    const filePath = path.join(__dirname, '..', 'FILTROS - Camila tours.xlsx');
    console.log('📖 Leyendo archivo completo:', filePath);
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    console.log(`📊 Total de filas en Excel: ${rawData.length}`);
    
    return rawData;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return [];
  }
}

// Función para procesar un tour individual
function processTour(row, index) {
  try {
    const title = cleanText(row['TITULO'] || row['TITUTLO']) || `Tour ${index + 1}`;
    const city = cleanText(row['LOCATION']) || 'Lima';
    const country = cleanText(row['COUNTRY']) || 'Perú';
    const tipoTour = cleanText(row['TIPO TOUR']) || 'Half day';
    const duration = row['DURATIONS (HOURS)'] || 8;
    const adultPrice = row['ADULT'] || 50;
    const childPrice = row['CHILD'] || 25;
    const includes = row['INCLUDES'] || '';
    const highlights = row['HIGHLIGHTS'] || '';
    const tourProgram = row['TOUR PROGRAM'] || '';
    const characteristics = row['CARACTERISTICAS DEL SERVICIO'] || '';
    const languages = row['LANGUAGES'] || 'Spanish';
    const anticipation = row['PURCHASE ANTICIPATION (HOURS)'] || 24;
    const noIncludes = row['NO INCLUDES'] || '';
    const beforeYouGo = row['BEFORE YOU GO'] || '';
    const accessibility = row['Accesibilidad'] || '';
    
    // Procesar datos
    const tour = {
      title: title,
      description: generateDescription(city, tipoTour, duration),
      full_description: cleanText(tourProgram) || generateFullDescription(city, includes, characteristics),
      city: city,
      location: city,
      meeting_point: extractMeetingPoint(characteristics, tourProgram, city),
      price: processPrice(adultPrice),
      original_price: calculateOriginalPrice(adultPrice),
      duration: processDuration(duration),
      max_group_size: determineGroupSize(characteristics),
      highlights: processHighlights(highlights),
      included: processArray(includes),
      cancellation_policy: generateCancellationPolicy(anticipation),
      rating: generateRating(),
      review_count: generateReviewCount(),
      images: generateImages(city),
      is_featured: Math.random() > 0.7,
      is_active: true,
      category: determineCategory(tipoTour, duration),
      location_type: country.toLowerCase().includes('perú') ? 'domestic' : 'international',
      tour_type: 'tour',
      coordinates: getCityCoordinates(city)
    };
    
    return tour;
    
  } catch (error) {
    console.error(`❌ Error procesando fila ${index + 1}:`, error.message);
    return null;
  }
}

// Funciones auxiliares
function cleanText(text) {
  if (!text) return null;
  return String(text).trim().replace(/\r\n/g, ' ').replace(/\s+/g, ' ');
}

function generateDescription(city, tipoTour, duration) {
  const descriptions = [
    `Descubre la magia de ${city} en esta experiencia única`,
    `Explora ${city} con nuestro ${tipoTour.toLowerCase()} especializado`,
    `Vive una aventura inolvidable en ${city}`,
    `Conoce lo mejor de ${city} en este tour exclusivo`,
    `Sumérgete en la cultura y naturaleza de ${city}`
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateFullDescription(city, includes, characteristics) {
  const program = `Experiencia completa en ${city}. ${characteristics} ${includes} Este tour te llevará a descubrir los lugares más emblemáticos y la cultura local de manera auténtica.`;
  return program;
}

function extractMeetingPoint(characteristics, program, city) {
  if (characteristics && characteristics.includes('Recogida en el hotel')) {
    return 'Recogida en su hotel (área urbana)';
  }
  if (program && program.includes('puerto')) {
    return 'Puerto principal de la ciudad';
  }
  if (program && program.includes('aeropuerto')) {
    return 'Aeropuerto de la ciudad';
  }
  return `Plaza principal de ${city}`;
}

function processPrice(price) {
  if (!price) return Math.floor(Math.random() * 100) + 50;
  const cleanPrice = parseFloat(String(price).replace(/[^\d.,]/g, '').replace(',', '.'));
  return cleanPrice || Math.floor(Math.random() * 100) + 50;
}

function calculateOriginalPrice(price) {
  const basePrice = processPrice(price);
  if (Math.random() > 0.7) {
    return Math.floor(basePrice * 1.2);
  }
  return null;
}

function processDuration(hours) {
  if (!hours) return 'Día completo';
  const h = parseInt(hours);
  if (h <= 2) return `${h} horas`;
  if (h <= 4) return `${h} horas`;
  if (h <= 6) return 'Medio día';
  if (h <= 8) return 'Medio día';
  if (h <= 12) return 'Día completo';
  if (h <= 24) return '1 día';
  return `${Math.ceil(h / 24)} días`;
}

function determineGroupSize(characteristics) {
  if (!characteristics) return 20;
  const char = String(characteristics).toLowerCase();
  if (char.includes('small group')) return 12;
  if (char.includes('private')) return 6;
  if (char.includes('grupo pequeño')) return 10;
  return 20;
}

function processHighlights(highlights) {
  if (!highlights) return [];
  return processArray(highlights).slice(0, 5);
}

function processArray(text) {
  if (!text) return [];
  return String(text)
    .split(/[,;\n\r]/)
    .map(item => item.trim())
    .filter(item => item.length > 0 && item !== '-')
    .slice(0, 10);
}

function generateCancellationPolicy(hours) {
  const h = parseInt(hours) || 24;
  return `Cancelación gratuita hasta ${h} horas antes del tour`;
}

function generateRating() {
  return (Math.random() * 1 + 4).toFixed(1);
}

function generateReviewCount() {
  return Math.floor(Math.random() * 950) + 50;
}

function generateImages(city) {
  const cityImages = {
    'Iquitos': ['/ballestas-islands-sea-lions-penguins-peru.png'],
    'Lima': ['/lima-historic-center-colonial-architecture-cathedr.png', '/barranco-miraflores-lima-pacific-ocean-cliffs.png'],
    'Cusco': ['/machu-picchu-sunrise-andes-mountains-peru.png', '/sacsayhuaman-fortress-cusco-stone-walls.png'],
    'Arequipa': ['/santa-catalina-monastery-arequipa-colonial-archite.png', '/colca-canyon-condors-arequipa-peru-andes.png'],
    'Puno': ['/lake-titicaca-floating-islands-uros-peru-bolivia.png', '/uros-islands-reed-boats-titicaca-traditional-cultu.png'],
    'Nazca': ['/nazca-lines-peru-desert-geoglyphs-aerial-view.png'],
    'Huacachina': ['/huacachina-oasis-desert-sand-dunes-peru.png'],
    'Valle Sagrado': ['/sacred-valley-peru-andes-mountains-terraces.png'],
    'Trujillo': ['/machu-picchu-ruins.png'],
    'Chiclayo': ['/machu-picchu-ruins.png'],
    'Huaraz': ['/sacred-valley-peru-andes-mountains-terraces.png'],
    'Tumbes': ['/ballestas-islands-sea-lions-penguins-peru.png'],
    'Tarapoto': ['/ballestas-islands-sea-lions-penguins-peru.png'],
    'Moyobamba': ['/sacred-valley-peru-andes-mountains-terraces.png'],
    'Pisco': ['/huacachina-oasis-desert-sand-dunes-peru.png'],
    'Paracas': ['/ballestas-islands-sea-lions-penguins-peru.png'],
    'Ica': ['/huacachina-oasis-desert-sand-dunes-peru.png'],
    'Puerto Maldonado': ['/ballestas-islands-sea-lions-penguins-peru.png'],
    'Chachapoyas': ['/machu-picchu-ruins.png'],
    'Cajamarca': ['/machu-picchu-ruins.png'],
    'Huancayo': ['/sacred-valley-peru-andes-mountains-terraces.png'],
    'Tarma': ['/sacred-valley-peru-andes-mountains-terraces.png'],
    'Oxapampa': ['/sacred-valley-peru-andes-mountains-terraces.png'],
    'Ayacucho': ['/machu-picchu-ruins.png'],
    'Máncora': ['/machu-picchu-ruins.png']
  };
  
  return cityImages[city] || ['/machu-picchu-ruins.png'];
}

function determineCategory(tipoTour, duration) {
  if (!tipoTour) return 'peru_in';
  
  const type = String(tipoTour).toLowerCase();
  const hours = parseInt(duration) || 8;
  
  if (type.includes('full day') || hours >= 8) {
    if (hours > 24) return 'multi_day';
    return 'one_day';
  }
  
  if (type.includes('half day') || hours <= 6) {
    return 'one_day';
  }
  
  return 'peru_in';
}

function getCityCoordinates(city) {
  const coordinates = {
    'Iquitos': { lat: -3.7437, lon: -73.2516 },
    'Lima': { lat: -12.0464, lon: -77.0428 },
    'Cusco': { lat: -13.5319, lon: -71.9675 },
    'Arequipa': { lat: -16.4090, lon: -71.5375 },
    'Puno': { lat: -15.8402, lon: -70.0219 },
    'Nazca': { lat: -14.8249, lon: -74.9280 },
    'Huacachina': { lat: -14.0873, lon: -75.7626 },
    'Valle Sagrado': { lat: -13.1631, lon: -72.545 },
    'Trujillo': { lat: -8.1116, lon: -79.0287 },
    'Chiclayo': { lat: -6.7714, lon: -79.8374 },
    'Huaraz': { lat: -9.5254, lon: -77.5286 },
    'Tumbes': { lat: -3.5679, lon: -80.4515 },
    'Tarapoto': { lat: -6.4889, lon: -76.3648 },
    'Moyobamba': { lat: -6.0342, lon: -76.9706 },
    'Pisco': { lat: -13.7099, lon: -76.2084 },
    'Paracas': { lat: -13.8348, lon: -76.2815 },
    'Ica': { lat: -14.0678, lon: -75.7286 },
    'Puerto Maldonado': { lat: -12.5931, lon: -69.1892 },
    'Chachapoyas': { lat: -6.2309, lon: -77.8695 },
    'Cajamarca': { lat: -7.1631, lon: -78.5164 },
    'Huancayo': { lat: -12.0685, lon: -75.2041 },
    'Tarma': { lat: -11.4185, lon: -75.6885 },
    'Oxapampa': { lat: -10.5877, lon: -75.4026 },
    'Ayacucho': { lat: -13.1631, lon: -74.2236 },
    'Máncora': { lat: -4.1086, lon: -81.0456 }
  };
  
  return coordinates[city] || { lat: -12.0464, lon: -77.0428 };
}

// Función principal
function main() {
  console.log('🚀 Cargando todos los tours del Excel...');
  
  const rawData = loadAllToursFromExcel();
  if (rawData.length === 0) {
    console.log('❌ No se encontraron datos');
    return;
  }
  
  const allTours = [];
  
  for (let i = 0; i < rawData.length; i++) {
    const tour = processTour(rawData[i], i);
    if (tour) {
      allTours.push(tour);
    }
  }
  
  console.log(`✅ Procesados ${allTours.length} tours del Excel`);
  
  // Mostrar algunos ejemplos
  console.log('\n📋 Ejemplos de tours procesados:');
  allTours.slice(0, 3).forEach((tour, i) => {
    console.log(`${i + 1}. ${tour.title} - ${tour.city} - $${tour.price}`);
  });
  
  // Generar SQL para los tours faltantes (asumiendo que ya tenemos 39)
  const remainingTours = allTours.slice(39); // Los últimos 12 tours
  console.log(`\n📤 Tours faltantes a cargar: ${remainingTours.length}`);
  
  if (remainingTours.length > 0) {
    console.log('\n🎯 Tours que faltan por cargar:');
    remainingTours.forEach((tour, i) => {
      console.log(`${i + 1}. ${tour.title} - ${tour.city} - $${tour.price} - ${tour.duration}`);
    });
  }
  
  return allTours;
}

if (require.main === module) {
  main();
}

module.exports = { loadAllToursFromExcel, processTour };

