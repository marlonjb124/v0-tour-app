const fs = require('fs');
const path = require('path');

// Función para cargar todos los tours del Excel en lotes
async function loadAllExcelTours() {
  try {
    console.log('🚀 Cargando todos los tours del Excel...');
    
    // Leer el archivo SQL generado
    const sqlFilePath = path.join(__dirname, 'tours-excel-exact.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Dividir en statements individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && stmt.includes('INSERT INTO tours_excel'));
    
    console.log(`📊 Encontrados ${statements.length} statements SQL`);
    
    // Procesar en lotes de 10
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < statements.length; i += batchSize) {
      batches.push(statements.slice(i, i + batchSize));
    }
    
    console.log(`📦 Procesando en ${batches.length} lotes de ${batchSize} tours cada uno`);
    
    // Crear archivos SQL por lotes
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchContent = batch.join(';\n\n') + ';';
      
      const batchFileName = `tours-excel-batch-${i + 1}.sql`;
      const batchFilePath = path.join(__dirname, batchFileName);
      
      fs.writeFileSync(batchFilePath, batchContent);
      console.log(`✅ Lote ${i + 1} guardado: ${batchFileName} (${batch.length} tours)`);
    }
    
    console.log(`\n💾 Total: ${statements.length} tours divididos en ${batches.length} lotes`);
    console.log('📁 Archivos SQL generados para carga por lotes');
    
    return {
      totalTours: statements.length,
      totalBatches: batches.length,
      batchSize: batchSize
    };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Función para generar un resumen de los tours
function generateToursSummary() {
  try {
    const sqlFilePath = path.join(__dirname, 'tours-excel-exact.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Extraer información básica de cada tour
    const tourMatches = sqlContent.match(/INSERT INTO tours_excel[^;]+;/g) || [];
    
    const summary = {
      totalTours: tourMatches.length,
      locations: new Set(),
      countries: new Set(),
      tourTypes: new Set(),
      priceRange: { min: Infinity, max: 0 },
      durationRange: { min: Infinity, max: 0 }
    };
    
    tourMatches.forEach((match, index) => {
      // Extraer datos básicos usando regex
      const locationMatch = match.match(/location,\s*'([^']+)'/);
      const countryMatch = match.match(/country,\s*'([^']+)'/);
      const tipoMatch = match.match(/tipo_tour,\s*'([^']+)'/);
      const adultMatch = match.match(/adult,\s*([0-9.]+)/);
      const durationMatch = match.match(/durations_hours,\s*([0-9]+)/);
      
      if (locationMatch) summary.locations.add(locationMatch[1]);
      if (countryMatch) summary.countries.add(countryMatch[1]);
      if (tipoMatch) summary.tourTypes.add(tipoMatch[1]);
      
      if (adultMatch) {
        const price = parseFloat(adultMatch[1]);
        summary.priceRange.min = Math.min(summary.priceRange.min, price);
        summary.priceRange.max = Math.max(summary.priceRange.max, price);
      }
      
      if (durationMatch) {
        const duration = parseInt(durationMatch[1]);
        summary.durationRange.min = Math.min(summary.durationRange.min, duration);
        summary.durationRange.max = Math.max(summary.durationRange.max, duration);
      }
    });
    
    return {
      ...summary,
      locations: Array.from(summary.locations).sort(),
      countries: Array.from(summary.countries).sort(),
      tourTypes: Array.from(summary.tourTypes).sort()
    };
    
  } catch (error) {
    console.error('❌ Error generando resumen:', error.message);
    return null;
  }
}

// Función principal
async function main() {
  console.log('📋 Generando lotes para carga de todos los tours del Excel...\n');
  
  const result = await loadAllExcelTours();
  if (!result) {
    console.log('❌ No se pudieron generar los lotes');
    return;
  }
  
  console.log('\n📊 Resumen de tours:');
  const summary = generateToursSummary();
  if (summary) {
    console.log(`- Total tours: ${summary.totalTours}`);
    console.log(`- Países: ${summary.countries.join(', ')}`);
    console.log(`- Ubicaciones: ${summary.locations.length} (${summary.locations.slice(0, 5).join(', ')}${summary.locations.length > 5 ? '...' : ''})`);
    console.log(`- Tipos de tour: ${summary.tourTypes.join(', ')}`);
    console.log(`- Rango de precios: $${summary.priceRange.min} - $${summary.priceRange.max}`);
    console.log(`- Rango de duración: ${summary.durationRange.min} - ${summary.durationRange.max} horas`);
  }
  
  console.log('\n✅ Archivos listos para carga en Supabase');
  console.log('💡 Usa los archivos tours-excel-batch-X.sql para cargar por lotes');
}

if (require.main === module) {
  main();
}

module.exports = { loadAllExcelTours, generateToursSummary };

