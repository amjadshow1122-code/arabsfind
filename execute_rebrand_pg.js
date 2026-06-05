import { Client } from 'pg';

const connectionString = "postgresql://postgres.numzdnwdlysgodumavjg:XwTq2Cih50Kwqt1Y@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres";

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to DB via PG Pooler 5432!");
    
    // 1. Delete all existing products and categories
    await client.query('DELETE FROM order_items;');
    await client.query('DELETE FROM cart_items;');
    await client.query('DELETE FROM products;');
    await client.query('DELETE FROM categories;');

    console.log("Deleted old products and categories.");

    // 2. Insert new categories
    const categories = [
      { name: 'Perfumes', slug: 'perfumes', icon: 'droplet', image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', description: 'Premium designer perfumes and fragrances.' },
      { name: 'Attars', slug: 'attars', icon: 'droplet', image_url: 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=800&q=80', description: 'Authentic traditional attar oils.' },
      { name: 'Muslim Caps', slug: 'muslim-caps', icon: 'hash', image_url: 'https://images.unsplash.com/photo-1616422285623-146b9a896677?w=800&q=80', description: 'Hand-crafted Muslim prayer caps and kufis.' },
      { name: 'Accessories', slug: 'accessories', icon: 'watch', image_url: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80', description: 'Islamic accessories, tasbih, and lifestyle items.' }
    ];

    for (const cat of categories) {
      await client.query(`
        INSERT INTO categories (name, slug, icon, image_url, description) 
        VALUES ($1, $2, $3, $4, $5)
      `, [cat.name, cat.slug, cat.icon, cat.image_url, cat.description]);
    }
    console.log("Inserted new categories.");

    // 3. Get category IDs
    const res = await client.query('SELECT id, name FROM categories;');
    const catMap = {};
    res.rows.forEach(r => catMap[r.name] = r.id);

    // 4. Insert sample products
    const products = [
      { category_id: catMap['Perfumes'], name: 'Royal Oud Parfum', price: 299, original_price: 350, description: 'An majestic blend of pure oud wood and sweet amber.', image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', brand: 'Moavia', is_featured: true, stock: 10 },
      { category_id: catMap['Attars'], name: 'Jasmine Musk Attar', price: 45, original_price: 60, description: 'Alcohol-free jasmine musk attar.', image_url: 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=800&q=80', brand: 'Al-Haramain', is_featured: true, stock: 20 },
      { category_id: catMap['Muslim Caps'], name: 'Premium Velvet Kufi', price: 25, original_price: 30, description: 'Soft velvet kufi cap for daily wear.', image_url: 'https://images.unsplash.com/photo-1616422285623-146b9a896677?w=800&q=80', brand: 'Sunnah Wear', is_featured: true, stock: 50 },
      { category_id: catMap['Accessories'], name: 'Olive Wood Tasbih', price: 35, original_price: 45, description: 'Handcrafted olive wood tasbih from Palestine.', image_url: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80', brand: 'Artisan', is_featured: true, stock: 15 }
    ];

    for (const p of products) {
      await client.query(`
        INSERT INTO products (category_id, name, price, original_price, description, image_url, brand, is_featured, stock) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [p.category_id, p.name, p.price, p.original_price, p.description, p.image_url, p.brand, p.is_featured, p.stock]);
    }
    console.log("Inserted sample products.");

    // 5. Update site_settings
    const headerConfig = {
      "logo": "",
      "top_bar": "Free Shipping on Orders Over $100!",
      "nav_links": [
        { "label": "Perfumes", "url": "/shop?category=perfumes" },
        { "label": "Attars", "url": "/shop?category=attars" },
        { "label": "Caps", "url": "/shop?category=muslim-caps" },
        { "label": "Accessories", "url": "/shop?category=accessories" },
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
    await client.query('UPDATE site_settings SET header_config = $1, footer_config = $2 WHERE id = 1;', [JSON.stringify(headerConfig), JSON.stringify(footerConfig)]);
    console.log("Updated site_settings.");
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
