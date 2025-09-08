const XLSX = require('xlsx');
const path = require('path');

// Función para cargar datos con estructura exacta del Excel
function loadExcelExactStructure() {
  try {
    const filePath = path.join(__dirname, '..', 'FILTROS - Camila tours.xlsx');
    console.log('📖 Leyendo archivo:', filePath);
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    console.log(`📊 Encontradas ${rawData.length} filas de datos`);
    
    const tours = [];
    
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      
      try {
        const tour = {
          item: parseInt(row['ITEM']) || i + 1,
          country: cleanText(row['COUNTRY']) || 'Perú',
          location: cleanText(row['LOCATION']) || 'Lima',
          tipo_tour: cleanText(row['TIPO TOUR']) || 'Half day',
          titulo: cleanText(row['TITULO'] || row['TITUTLO']) || `Tour ${i + 1}`,
          durations_hours: parseInt(row['DURATIONS (HOURS)']) || 8,
          rango_horario_inicio: cleanText(row['RANGO HORARIO INICIO']) || 'Por confirmar',
          hora_inicio: cleanText(row['HORA DE INICIO']) || 'Por confirmar',
          hora_fin: cleanText(row['HORA FIN']) || 'Por confirmar',
          caracteristicas_servicio: cleanText(row['CARACTERISTICAS DEL SERVICIO']) || 'Servicio estándar',
          languages: cleanText(row['LANGUAGES']) || 'Spanish',
          purchase_anticipation_hours: parseInt(row['PURCHASE ANTICIPATION (HOURS)']) || 24,
          adult: parseFloat(row['ADULT']) || 50.00,
          child: parseFloat(row['CHILD']) || 25.00,
          edad_ninos: cleanText(row['Edad Niños']) || '3 a 8 años',
          includes: cleanText(row['INCLUDES']) || 'Servicios básicos incluidos',
          no_includes: cleanText(row['NO INCLUDES']) || 'Servicios no incluidos',
          before_you_go: cleanText(row['BEFORE YOU GO']) || 'Recomendaciones generales',
          accesibilidad: cleanText(row['Accesibilidad']) || 'Accesible para la mayoría',
          highlights: cleanText(row['HIGHLIGHTS']) || 'Experiencia única',
          tour_program: cleanText(row['TOUR PROGRAM']) || 'Programa detallado del tour'
        };
        
        tours.push(tour);
        
      } catch (error) {
        console.error(`❌ Error procesando fila ${i + 1}:`, error.message);
      }
    }
    
    console.log(`✅ Procesados ${tours.length} tours con estructura del Excel`);
    
    // Mostrar algunos ejemplos
    console.log('\n📋 Ejemplos de tours procesados:');
    tours.slice(0, 3).forEach((tour, i) => {
      console.log(`${i + 1}. ${tour.titulo} - ${tour.location} - $${tour.adult} - ${tour.durations_hours}h`);
    });
    
    return tours;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return [];
  }
}

// Función auxiliar para limpiar texto
function cleanText(text) {
  if (!text) return null;
  return String(text).trim().replace(/\r\n/g, ' ').replace(/\s+/g, ' ');
}

// Función para generar SQL de inserción
function generateInsertSQL(tours) {
  const sqlStatements = [];
  
  for (const tour of tours) {
    const sql = `
INSERT INTO tours_excel (
  item, country, location, tipo_tour, titulo, durations_hours,
  rango_horario_inicio, hora_inicio, hora_fin, caracteristicas_servicio,
  languages, purchase_anticipation_hours, adult, child, edad_ninos,
  includes, no_includes, before_you_go, accesibilidad, highlights, tour_program
) VALUES (
  ${tour.item},
  ${escapeSQLString(tour.country)},
  ${escapeSQLString(tour.location)},
  ${escapeSQLString(tour.tipo_tour)},
  ${escapeSQLString(tour.titulo)},
  ${tour.durations_hours},
  ${escapeSQLString(tour.rango_horario_inicio)},
  ${escapeSQLString(tour.hora_inicio)},
  ${escapeSQLString(tour.hora_fin)},
  ${escapeSQLString(tour.caracteristicas_servicio)},
  ${escapeSQLString(tour.languages)},
  ${tour.purchase_anticipation_hours},
  ${tour.adult},
  ${tour.child},
  ${escapeSQLString(tour.edad_ninos)},
  ${escapeSQLString(tour.includes)},
  ${escapeSQLString(tour.no_includes)},
  ${escapeSQLString(tour.before_you_go)},
  ${escapeSQLString(tour.accesibilidad)},
  ${escapeSQLString(tour.highlights)},
  ${escapeSQLString(tour.tour_program)}
);`.trim();
    
    sqlStatements.push(sql);
  }
  
  return sqlStatements;
}

function escapeSQLString(str) {
  if (!str) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

// Función principal
function main() {
  console.log('🚀 Cargando tours con estructura exacta del Excel...');
  
  const tours = loadExcelExactStructure();
  if (tours.length === 0) {
    console.log('❌ No se cargaron tours');
    return;
  }
  
  // Generar SQL
  const sqlStatements = generateInsertSQL(tours);
  
  // Escribir SQL a archivo
  const fs = require('fs');
  const sqlContent = sqlStatements.join('\n\n');
  fs.writeFileSync(path.join(__dirname, 'tours-excel-exact.sql'), sqlContent);
  console.log('📁 SQL guardado en: scripts/tours-excel-exact.sql');
  
  console.log(`\n💾 Tours procesados: ${tours.length}`);
  console.log('📤 SQL generado para Supabase con estructura exacta del Excel');
  
  return tours;
}

if (require.main === module) {
  main();
}

module.exports = { loadExcelExactStructure, generateInsertSQL };

