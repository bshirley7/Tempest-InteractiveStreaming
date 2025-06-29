require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createPauseAdsTable() {
  console.log('Creating pause_ads table...\n');
  
  try {
    // Create table using direct SQL execution
    const createTableSQL = `
      -- Create pause_ads table
      CREATE TABLE IF NOT EXISTS pause_ads (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title text NOT NULL,
        message text NOT NULL,
        cta_text text NOT NULL DEFAULT 'Learn More',
        cta_link text NOT NULL,
        image_url text NOT NULL,
        company_logo_url text,
        is_active boolean DEFAULT false,
        priority integer DEFAULT 1,
        click_count integer DEFAULT 0,
        impression_count integer DEFAULT 0,
        created_by uuid,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );

      -- Enable RLS
      ALTER TABLE pause_ads ENABLE ROW LEVEL SECURITY;

      -- Create policies
      CREATE POLICY "Anyone can view active pause ads"
        ON pause_ads
        FOR SELECT
        USING (true);

      CREATE POLICY "Authenticated users can manage pause ads"
        ON pause_ads
        FOR ALL
        TO authenticated
        USING (true);

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_pause_ads_active ON pause_ads(is_active);
      CREATE INDEX IF NOT EXISTS idx_pause_ads_priority ON pause_ads(priority DESC);

      -- Create functions for incrementing analytics counters
      CREATE OR REPLACE FUNCTION increment_impression(ad_id uuid)
      RETURNS void AS $func$
      BEGIN
        UPDATE pause_ads 
        SET impression_count = impression_count + 1,
            updated_at = now()
        WHERE id = ad_id;
      END;
      $func$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION increment_click(ad_id uuid)
      RETURNS void AS $func$
      BEGIN
        UPDATE pause_ads 
        SET click_count = click_count + 1,
            updated_at = now()
        WHERE id = ad_id;
      END;
      $func$ LANGUAGE plpgsql;
    `;

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      console.log('RPC method failed, trying alternative...');
      
      // Alternative: Create a test record to see if table needs to be created manually
      const { error: testError } = await supabase
        .from('pause_ads')
        .select('id')
        .limit(1);
        
      if (testError && testError.message.includes('does not exist')) {
        console.error('❌ Table creation failed. Please run the SQL manually in Supabase SQL Editor:');
        console.log('\n--- Copy this SQL to Supabase SQL Editor ---');
        console.log(createTableSQL);
        console.log('\n--- End of SQL ---\n');
        return;
      }
    } else {
      console.log('✅ Table created via RPC');
    }

    // Test if table is accessible
    const { error: accessError } = await supabase
      .from('pause_ads')
      .select('count');

    if (accessError) {
      console.error('❌ Table created but not accessible:', accessError.message);
    } else {
      console.log('✅ Table is accessible and ready to use!');
      
      // Create a sample test ad
      const { data, error: insertError } = await supabase
        .from('pause_ads')
        .insert({
          title: 'Sample Test Ad',
          message: 'This is a test ad to verify the system is working correctly.',
          cta_text: 'Test Now',
          cta_link: 'https://example.com/test',
          image_url: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=1920&h=1080&fit=crop',
          company_logo_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=80&fit=crop',
          is_active: false,
          priority: 1
        })
        .select();

      if (insertError) {
        console.error('❌ Sample ad creation failed:', insertError.message);
      } else {
        console.log('✅ Sample test ad created successfully!');
        console.log('ID:', data[0]?.id);
      }
    }

  } catch (error) {
    console.error('Error creating table:', error);
  }
}

createPauseAdsTable()
  .then(() => {
    console.log('\nSetup completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });