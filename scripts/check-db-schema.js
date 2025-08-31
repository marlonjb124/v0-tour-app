require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  console.log('Please set the following environment variables in your .env.local file:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseSchema() {
  console.log('Checking database schema...');
  
  try {
    // Check if tours table exists
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (tablesError) throw tablesError;
    
    console.log('\nAvailable tables:');
    tables.forEach(table => console.log(`- ${table.tablename}`));
    
    // Check tours table columns
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'tours')
      .order('ordinal_position');

    if (columnsError) throw columnsError;
    
    console.log('\nTours table columns:');
    columns.forEach(col => {
      console.log(`- ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check for required columns
    const requiredColumns = [
      'id', 'title', 'description', 'price', 'duration', 
      'category', 'location', 'is_active', 'image_url', 'highlights'
    ];
    
    const missingColumns = requiredColumns.filter(col => 
      !columns.some(c => c.column_name === col)
    );
    
    if (missingColumns.length > 0) {
      console.log('\n❌ Missing required columns:', missingColumns.join(', '));
    } else {
      console.log('\n✅ All required columns exist in the tours table');
    }
    
    // Check existing categories
    const { data: categories, error: categoriesError } = await supabase
      .from('tours')
      .select('category')
      .not('category', 'is', null)
      .limit(100);
    
    if (!categoriesError && categories.length > 0) {
      const uniqueCategories = [...new Set(categories.map(t => t.category))];
      console.log('\nExisting tour categories:', uniqueCategories.join(', '));
    }
    
    // Check sample data
    const { data: sampleTours, error: toursError } = await supabase
      .from('tours')
      .select('*')
      .limit(5);
    
    if (!toursError && sampleTours.length > 0) {
      console.log('\nSample tours:');
      sampleTours.forEach((tour, index) => {
        console.log(`\nTour #${index + 1}:`);
        console.log(`- ID: ${tour.id}`);
        console.log(`- Title: ${tour.title}`);
        console.log(`- Category: ${tour.category || 'Not set'}`);
        console.log(`- Location: ${tour.location || 'Not set'}`);
        console.log(`- Duration: ${tour.duration} days`);
        console.log(`- Price: $${tour.price}`);
        console.log(`- Active: ${tour.is_active ? 'Yes' : 'No'}`);
      });
    } else if (toursError) {
      console.error('Error fetching sample tours:', toursError);
    } else {
      console.log('\nNo tours found in the database.');
    }
    
  } catch (error) {
    console.error('Error checking database schema:', error);
  }
}

// Run the function
checkDatabaseSchema();
