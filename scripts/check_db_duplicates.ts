import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicates() {
    console.log('Fetching products...');
    const { data: products, error } = await supabase
        .from('products')
        .select('id, title, seller_id, category');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    if (!products || products.length === 0) {
        console.log('No products found.');
        return;
    }

    console.log(`Total products found: ${products.length}`);

    const titleCounts: Record<string, number> = {};
    const duplicates: string[] = [];

    products.forEach(p => {
        const key = p.title; // Check duplicates by title primarily
        titleCounts[key] = (titleCounts[key] || 0) + 1;
        if (titleCounts[key] === 2) {
            duplicates.push(key);
        }
    });

    if (duplicates.length > 0) {
        console.log('\nPotential Duplicates Found (by Title):');
        duplicates.forEach(title => {
            console.log(`- "${title}": ${titleCounts[title]} instances`);
        });
    } else {
        console.log('\nNo duplicates found by title.');
    }

    // Also list all categories found
    const categories = [...new Set(products.map(p => p.category))];
    console.log('\nCategories present:', categories);
}

checkDuplicates();
