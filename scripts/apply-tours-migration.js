const fs = require('fs');
const path = require('path');

// Simular las llamadas MCP que necesitamos hacer
function simulateMCPCalls() {
  const sqlFile = path.join(__dirname, 'camila-tours.sql');
  
  if (!fs.existsSync(sqlFile)) {
    console.log('❌ Archivo SQL no encontrado. Ejecuta primero: node scripts/load-camila-tours.js');
    return;
  }
  
  const sqlContent = fs.readFileSync(sqlFile, 'utf-8');
  
  // Dividir por INSERT statements
  const insertStatements = sqlContent
    .split(/INSERT INTO tours/)
    .filter(stmt => stmt.trim().length > 0)
    .map(stmt => stmt.startsWith('INSERT INTO tours') ? stmt : 'INSERT INTO tours' + stmt);
  
  console.log(`📊 Encontrados ${insertStatements.length} tours para insertar`);
  
  // Generar las llamadas MCP que necesitas hacer manualmente
  console.log('\n🔧 Llamadas MCP a realizar:');
  console.log('='.repeat(50));
  
  for (let i = 0; i < Math.min(insertStatements.length, 10); i++) {
    const statement = insertStatements[i].trim();
    console.log(`\n📋 Tour ${i + 1}:`);
    console.log('```');
    console.log(`mcp_supabase_apply_migration:`);
    console.log(`  name: load_camila_tours_batch_${i + 1}`);
    console.log(`  query: |`);
    // Limpiar y acortar la query para mostrar
    const cleanQuery = statement
      .replace(/'/g, "''")
      .substring(0, 500) + (statement.length > 500 ? '...' : '');
    console.log(`    ${cleanQuery}`);
    console.log('```');
  }
  
  if (insertStatements.length > 10) {
    console.log(`\n... y ${insertStatements.length - 10} más`);
  }
  
  // También crear un archivo con tours básicos para cargar manualmente
  const basicTours = [
    {
      title: 'Tour Completo a Machu Picchu',
      description: 'Descubre la maravilla del mundo en una experiencia inolvidable',
      city: 'Cusco',
      price: 280,
      category: 'multi_day'
    },
    {
      title: 'City Tour Lima Colonial y Moderna',
      description: 'Explora el centro histórico y distritos modernos de Lima',
      city: 'Lima', 
      price: 65,
      category: 'one_day'
    },
    {
      title: 'Valle Sagrado de los Incas',
      description: 'Explora pueblos andinos y sitios arqueológicos únicos',
      city: 'Cusco',
      price: 85,
      category: 'one_day'
    },
    {
      title: 'Lago Titicaca - Islas Flotantes Uros',
      description: 'Navega por el lago navegable más alto del mundo',
      city: 'Puno',
      price: 45,
      category: 'one_day'
    },
    {
      title: 'Líneas de Nazca - Sobrevuelo',
      description: 'Observa los misteriosos geoglifos desde el aire',
      city: 'Nazca',
      price: 120,
      category: 'one_day'
    }
  ];
  
  console.log('\n\n🎯 Tours básicos para probar (formato simplificado):');
  console.log('='.repeat(50));
  
  basicTours.forEach((tour, i) => {
    const sql = `
INSERT INTO tours (
  title, description, full_description, city, location, meeting_point,
  price, duration, max_group_size, highlights, included,
  cancellation_policy, rating, review_count, images, is_featured, is_active,
  category, location_type, tour_type, coordinates
) VALUES (
  '${tour.title}',
  '${tour.description}',
  '${tour.description} - Experiencia única en ${tour.city}',
  '${tour.city}',
  '${tour.city}',
  'Plaza principal de ${tour.city}',
  ${tour.price},
  'Día completo',
  20,
  '["Guía especializado", "Transporte incluido", "Experiencia única"]'::jsonb,
  '["Transporte", "Guía profesional", "Entradas"]'::jsonb,
  'Cancelación gratuita hasta 24 horas antes',
  4.5,
  150,
  '["/machu-picchu-sunrise-andes-mountains-peru.png"]'::jsonb,
  true,
  true,
  '${tour.category}',
  'domestic',
  'tour',
  '{"lat": -12.0464, "lon": -77.0428}'::jsonb
);`.trim();
    
    console.log(`\n📋 Tour básico ${i + 1} - ${tour.title}:`);
    console.log(sql);
  });
}

if (require.main === module) {
  simulateMCPCalls();
}

module.exports = { simulateMCPCalls };

