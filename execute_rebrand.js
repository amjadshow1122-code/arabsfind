import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env file
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length === 2) {
    env[parts[0].trim()] = parts[1].trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Connected to DB via REST.");

  try {
    // 1. Delete all existing products and categories
    await supabase.from('order_items').delete().neq('id', 0);
    await supabase.from('cart_items').delete().neq('id', 0);
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log("Deleted old products and categories.");

    // 2. Insert new categories
    const categories = [
      { name: 'Perfumes', slug: 'perfumes', image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', description: 'Premium designer perfumes and fragrances.' },
      { name: 'Attars', slug: 'attars', image_url: 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=800&q=80', description: 'Authentic traditional attar oils.' },
      { name: 'Muslim Caps', slug: 'muslim-caps', image_url: 'https://images.unsplash.com/photo-1616422285623-146b9a896677?w=800&q=80', description: 'Hand-crafted Muslim prayer caps and kufis.' },
      { name: 'Accessories', slug: 'accessories', image_url: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80', description: 'Islamic accessories, tasbih, and lifestyle items.' }
    ];

    const { data: insertedCats, error: catErr } = await supabase.from('categories').insert(categories).select();
    if (catErr) throw catErr;
    
    console.log("Inserted new categories.");

    const catMap = {};
    insertedCats.forEach(c => catMap[c.name] = c.id);

    // 4. Insert sample products
    const products = [
      { category_id: catMap['Perfumes'], name: 'Royal Oud Parfum', price: 299, original_price: 350, description: 'An majestic blend of pure oud wood and sweet amber.', image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', brand: 'Moavia', is_featured: true, stock: 10 },
      { category_id: catMap['Attars'], name: 'Jasmine Musk Attar', price: 45, original_price: 60, description: 'Alcohol-free jasmine musk attar.', image_url: 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=800&q=80', brand: 'Al-Haramain', is_featured: true, stock: 20 },
      { category_id: catMap['Muslim Caps'], name: 'Premium Velvet Kufi', price: 25, original_price: 30, description: 'Soft velvet kufi cap for daily wear.', image_url: 'https://images.unsplash.com/photo-1616422285623-146b9a896677?w=800&q=80', brand: 'Sunnah Wear', is_featured: true, stock: 50 },
      { category_id: catMap['Accessories'], name: 'Olive Wood Tasbih', price: 35, original_price: 45, description: 'Handcrafted olive wood tasbih from Palestine.', image_url: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80', brand: 'Artisan', is_featured: true, stock: 15 }
    ];

    const { error: prodErr } = await supabase.from('products').insert(products);
    if (prodErr) throw prodErr;

    console.log("Inserted sample products.");

    // 5. Update site_settings
    const headerConfig = {
      "logo": "",
      "top_bar": "Free Shipping on Orders Over $100!",
      "nav_links": [
        { "label": "Perfumes", "url": "/shop?category=Perfumes" },
        { "label": "Attars", "url": "/shop?category=Attars" },
        { "label": "Caps", "url": "/shop?category=Muslim%20Caps" },
        { "label": "Accessories", "url": "/shop?category=Accessories" },
        { "label": "About Us", "url": "/about" }
      ]
    };
    const footerConfig = {
      "copyright": "© 2026 MoaviaFragrance. All rights reserved.",
      "description": "Premium fragrances, authentic attars, and Islamic wear.",
      "social_links": {
        "instagram": "https://instagram.com/moaviafragrance",
        "facebook": "https://facebook.com/moaviafragrance"
      }
    };
    const { error: setErr } = await supabase.from('site_settings').update({ header_config: headerConfig, footer_config: footerConfig }).eq('id', 1);
    if (setErr) throw setErr;

    console.log("Updated site_settings.");

  } catch (err) {
    console.error("Error:", err);
  }
}

run();
