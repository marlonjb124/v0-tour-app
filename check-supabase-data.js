const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const supabaseUrl = 'https://pmdeyjcxsogqtofusgri.supabase.co';
// Get the anon key from your Supabase dashboard
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZGV5amN4c29ncXRvZnVzZ3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ4MDY0MzIsImV4cCI6MjA0MDM4MjQzMn0.YourRealAnonKeyHere';

console.log('🔍 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Anon key length:', supabaseAnonKey.length);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
  try {
    // Test basic connection
    console.log('\n1. Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('tours')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection failed:', testError.message);
      console.error('Error code:', testError.code);
      console.error('Error details:', testError.details);
      return;
    }
    
    console.log('✅ Basic connection successful');
    
    // Check tours table
    console.log('\n2. Checking tours table...');
    const { data: tours, error: toursError } = await supabase
      .from('tours')
      .select('id, title, description, price, city, is_active, category')
      .eq('is_active', true)
      .limit(10);
    
    if (toursError) {
      console.error('❌ Tours query failed:', toursError.message);
      return;
    }
    
    console.log(`✅ Found ${tours?.length || 0} active tours`);
    tours?.forEach((tour, i) => {
      console.log(`  ${i+1}. ${tour.title} - $${tour.price} (${tour.city}) [${tour.category || 'No category'}]`);
    });
    
    // Check cities
    console.log('\n3. Checking available cities...');
    const { data: cities, error: citiesError } = await supabase
      .from('tours')
      .select('city')
      .eq('is_active', true);
    
    if (!citiesError && cities) {
      const uniqueCities = [...new Set(cities.map(t => t.city))];
      console.log('Available cities:', uniqueCities.join(', '));
    }
    
    // Check categories
    console.log('\n4. Checking tour categories...');
    const { data: categorizedTours, error: categoryError } = await supabase
      .from('tours')
      .select('category')
      .not('category', 'is', null);
    
    if (!categoryError && categorizedTours) {
      const categories = [...new Set(categorizedTours.map(t => t.category))];
      console.log('Available categories:', categories.join(', '));
    }
    
    console.log('\n✅ Database check completed successfully!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkData();
