const XLSX = require('xlsx');
const path = require('path');

// Función para leer y procesar el archivo Excel de Camila
function loadCamilaTours() {
  try {
    const filePath = path.join(__dirname, '..', 'FILTROS - Camila tours.xlsx');
    console.log('📖 Leyendo archivo:', filePath);
    
    // Leer el archivo Excel
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Encontradas ${rawData.length} filas de datos`);
    
    const tours = [];
    
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      
      try {
        // Procesar datos específicos del Excel de Camila
        const tour = {
          title: cleanText(row['TITULO'] || row['TITUTLO']) || `Tour en ${row['LOCATION'] || 'Perú'}`,
          
          description: generateDescription(row),
          
          full_description: cleanText(row['TOUR PROGRAM']) || generateFullDescription(row),
          
          city: cleanText(row['LOCATION']) || 'Lima',
          
          location: cleanText(row['LOCATION']) || 'Perú',
          
          meeting_point: extractMeetingPoint(row) || 'Por confirmar según ubicación',
          
          price: processPrice(row['ADULT']),
          
          original_price: calculateOriginalPrice(row['ADULT']),
          
          duration: processDuration(row['DURATIONS (HOURS)']),
          
          max_group_size: determineGroupSize(row['CARACTERISTICAS DEL SERVICIO']),
          
          highlights: processHighlights(row['HIGHLIGHTS']),
          
          included: processArray(row['INCLUDES']),
          
          cancellation_policy: generateCancellationPolicy(row['PURCHASE ANTICIPATION (HOURS)']),
          
          rating: generateRating(),
          
          review_count: generateReviewCount(),
          
          images: generateImages(row['LOCATION']),
          
          is_featured: Math.random() > 0.7, // 30% destacados
          
          is_active: true,
          
          category: determineCategory(row['TIPO TOUR'], row['DURATIONS (HOURS)']),
          
          location_type: row['COUNTRY']?.toLowerCase().includes('perú') ? 'domestic' : 'international',
          
          tour_type: 'tour',
          
          coordinates: getCityCoordinates(row['LOCATION'])
        };
        
        tours.push(tour);
        
      } catch (error) {
        console.error(`❌ Error procesando fila ${i + 1}:`, error.message);
      }
    }
    
    console.log(`✅ Procesados ${tours.length} tours`);
    return tours;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return [];
  }
}

// Funciones auxiliares específicas
function cleanText(text) {
  if (!text) return null;
  return String(text).trim().replace(/\r\n/g, ' ').replace(/\s+/g, ' ');
}

function generateDescription(row) {
  const location = row['LOCATION'] || 'Perú';
  const type = row['TIPO TOUR'] || 'tour';
  const duration = row['DURATIONS (HOURS)'] || 8;
  
  const descriptions = [
    `Descubre la magia de ${location} en esta experiencia de ${duration} horas`,
    `Explora ${location} con nuestro ${type.toLowerCase()} especializado`,
    `Vive una aventura inolvidable en ${location}`,
    `Conoce lo mejor de ${location} en este tour exclusivo`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateFullDescription(row) {
  const program = cleanText(row['TOUR PROGRAM']);
  if (program) return program;
  
  const location = row['LOCATION'] || 'Perú';
  const includes = row['INCLUDES'] || '';
  const characteristics = row['CARACTERISTICAS DEL SERVICIO'] || '';
  
  return `Sumérgete en una experiencia única en ${location}. ${characteristics} ${includes} Este tour te llevará a descubrir los lugares más emblemáticos y la cultura local de manera auténtica.`;
}

function extractMeetingPoint(row) {
  const characteristics = row['CARACTERISTICAS DEL SERVICIO'] || '';
  if (characteristics.includes('Recogida en el hotel')) {
    return 'Recogida en su hotel (área urbana)';
  }
  
  const program = row['TOUR PROGRAM'] || '';
  if (program.includes('puerto')) {
    return 'Puerto principal de la ciudad';
  }
  
  return `Plaza principal de ${row['LOCATION'] || 'la ciudad'}`;
}

function processPrice(adultPrice) {
  if (!adultPrice) return Math.floor(Math.random() * 100) + 50;
  const price = parseFloat(String(adultPrice).replace(/[^\d.,]/g, '').replace(',', '.'));
  return price || Math.floor(Math.random() * 100) + 50;
}

function calculateOriginalPrice(price) {
  const basePrice = processPrice(price);
  // 30% de los tours tienen descuento
  if (Math.random() > 0.7) {
    return Math.floor(basePrice * 1.2); // 20% de descuento
  }
  return null;
}

function processDuration(hours) {
  if (!hours) return 'Día completo';
  const h = parseInt(hours);
  if (h <= 4) return `${h} horas`;
  if (h <= 8) return 'Medio día';
  if (h <= 12) return 'Día completo';
  return `${Math.ceil(h / 24)} días`;
}

function determineGroupSize(characteristics) {
  if (!characteristics) return 20;
  const char = String(characteristics).toLowerCase();
  if (char.includes('small group')) return 12;
  if (char.includes('private')) return 6;
  return 20;
}

function processHighlights(highlights) {
  if (!highlights) return [];
  return processArray(highlights).slice(0, 5); // Máximo 5 highlights
}

function processArray(text) {
  if (!text) return [];
  return String(text)
    .split(/[,;\n\r]/)
    .map(item => item.trim())
    .filter(item => item.length > 0 && item !== '-')
    .slice(0, 10); // Máximo 10 items
}

function generateCancellationPolicy(anticipationHours) {
  const hours = parseInt(anticipationHours) || 24;
  return `Cancelación gratuita hasta ${hours} horas antes del tour`;
}

function generateRating() {
  // Ratings entre 4.0 y 5.0
  return (Math.random() * 1 + 4).toFixed(1);
}

function generateReviewCount() {
  // Entre 50 y 1000 reviews
  return Math.floor(Math.random() * 950) + 50;
}

function generateImages(location) {
  const cityImages = {
    'Iquitos': ['/ballestas-islands-sea-lions-penguins-peru.png'],
    'Lima': ['/lima-historic-center-colonial-architecture-cathedr.png', '/barranco-miraflores-lima-pacific-ocean-cliffs.png'],
    'Cusco': ['/machu-picchu-sunrise-andes-mountains-peru.png', '/sacsayhuaman-fortress-cusco-stone-walls.png'],
    'Arequipa': ['/santa-catalina-monastery-arequipa-colonial-archite.png', '/colca-canyon-condors-arequipa-peru-andes.png'],
    'Puno': ['/lake-titicaca-floating-islands-uros-peru-bolivia.png', '/uros-islands-reed-boats-titicaca-traditional-cultu.png'],
    'Nazca': ['/nazca-lines-peru-desert-geoglyphs-aerial-view.png'],
    'Huacachina': ['/huacachina-oasis-desert-sand-dunes-peru.png'],
    'Valle Sagrado': ['/sacred-valley-peru-andes-mountains-terraces.png']
  };
  
  return cityImages[location] || ['/machu-picchu-ruins.png'];
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
    'Valle Sagrado': { lat: -13.1631, lon: -72.545 }
  };
  
  return coordinates[city] || { lat: -12.0464, lon: -77.0428 }; // Default: Lima
}

// Exportar los datos como SQL statements para usar con MCP
function generateSQLStatements(tours) {
  const statements = [];
  
  for (const tour of tours) {
    const sql = `
INSERT INTO tours (
  title, description, full_description, city, location, meeting_point,
  price, original_price, duration, max_group_size, highlights, included,
  cancellation_policy, rating, review_count, images, is_featured, is_active,
  category, location_type, tour_type, coordinates
) VALUES (
  ${escapeSQLString(tour.title)},
  ${escapeSQLString(tour.description)},
  ${escapeSQLString(tour.full_description)},
  ${escapeSQLString(tour.city)},
  ${escapeSQLString(tour.location)},
  ${escapeSQLString(tour.meeting_point)},
  ${tour.price},
  ${tour.original_price || 'NULL'},
  ${escapeSQLString(tour.duration)},
  ${tour.max_group_size},
  ${escapeJSONArray(tour.highlights)},
  ${escapeJSONArray(tour.included)},
  ${escapeSQLString(tour.cancellation_policy)},
  ${tour.rating},
  ${tour.review_count},
  ${escapeJSONArray(tour.images)},
  ${tour.is_featured},
  ${tour.is_active},
  ${escapeSQLString(tour.category)},
  ${escapeSQLString(tour.location_type)},
  ${escapeSQLString(tour.tour_type)},
  ${tour.coordinates ? `'${JSON.stringify(tour.coordinates)}'::jsonb` : 'NULL'}
);`;
    
    statements.push(sql.trim());
  }
  
  return statements;
}

function escapeSQLString(str) {
  if (!str) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escapeJSONArray(arr) {
  if (!arr || arr.length === 0) return "'[]'::jsonb";
  return `'${JSON.stringify(arr)}'::jsonb`;
}

// Función principal
function main() {
  console.log('🚀 Cargando tours de Camila...');
  
  const tours = loadCamilaTours();
  if (tours.length === 0) {
    console.log('❌ No se cargaron tours');
    return;
  }
  
  // Generar SQL statements
  const sqlStatements = generateSQLStatements(tours);
  
  console.log('\n📋 Ejemplos de tours procesados:');
  console.log(tours.slice(0, 2).map(t => ({
    title: t.title,
    city: t.city,
    price: t.price,
    duration: t.duration,
    category: t.category
  })));
  
  console.log(`\n💾 Tours procesados: ${tours.length}`);
  console.log('📤 SQL generado para Supabase');
  
  // Escribir SQL a archivo
  const fs = require('fs');
  const sqlContent = sqlStatements.join('\n\n');
  fs.writeFileSync(path.join(__dirname, 'camila-tours.sql'), sqlContent);
  console.log('📁 SQL guardado en: scripts/camila-tours.sql');
  
  return tours;
}

if (require.main === module) {
  main();
}

module.exports = { loadCamilaTours, generateSQLStatements };

