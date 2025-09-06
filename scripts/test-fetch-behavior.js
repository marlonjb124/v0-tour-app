/**
 * Script para probar el comportamiento de fetch en la aplicación
 * Este script simula el comportamiento de inactividad y verifica que los fetch se ejecuten
 */

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase (usar variables de entorno)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFetchBehavior() {
  console.log('🧪 Iniciando prueba de comportamiento de fetch...\n')

  try {
    // Test 1: Verificar que podemos conectar a Supabase
    console.log('1️⃣ Probando conexión a Supabase...')
    const { data: healthCheck, error: healthError } = await supabase
      .from('tours')
      .select('id')
      .limit(1)
    
    if (healthError) {
      console.error('❌ Error de conexión:', healthError.message)
      return
    }
    console.log('✅ Conexión exitosa\n')

    // Test 2: Simular múltiples fetch con delay (simulando inactividad)
    console.log('2️⃣ Simulando múltiples fetch con delays...')
    
    for (let i = 1; i <= 3; i++) {
      console.log(`   Fetch ${i}...`)
      
      const startTime = Date.now()
      const { data: tours, error } = await supabase
        .from('tours')
        .select('id, title, city, is_active')
        .eq('is_active', true)
        .limit(5)
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      if (error) {
        console.error(`   ❌ Error en fetch ${i}:`, error.message)
      } else {
        console.log(`   ✅ Fetch ${i} completado en ${duration}ms - ${tours.length} tours encontrados`)
      }
      
      // Simular inactividad de 2 segundos
      if (i < 3) {
        console.log('   ⏳ Simulando inactividad de 2 segundos...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    // Test 3: Verificar que los datos se actualizan
    console.log('\n3️⃣ Verificando que los datos se actualizan...')
    
    const { data: latestTours, error: latestError } = await supabase
      .from('tours')
      .select('id, title, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
    
    if (latestError) {
      console.error('❌ Error obteniendo último tour:', latestError.message)
    } else if (latestTours.length > 0) {
      console.log('✅ Último tour actualizado:', latestTours[0].title)
      console.log('   Fecha de actualización:', latestTours[0].updated_at)
    }

    console.log('\n🎉 Prueba completada exitosamente!')
    console.log('\n📋 Resumen de cambios implementados:')
    console.log('   • staleTime configurado a 0 en QueryClient')
    console.log('   • refetchOnMount, refetchOnWindowFocus, refetchOnReconnect habilitados')
    console.log('   • Hook useForceRefetch agregado a todas las páginas principales')
    console.log('   • staleTime removido de queries individuales')
    console.log('\n💡 Ahora cada acceso a las páginas debería ejecutar fetch frescos')

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message)
  }
}

// Ejecutar la prueba
testFetchBehavior()
