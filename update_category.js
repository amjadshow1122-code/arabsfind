import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres.numzdnwdlysgodumavjg:XwTq2Cih50Kwqt1Y@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres";

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();
    
    const updateQuery = "UPDATE products SET category = 'Perfume' WHERE category ILIKE '%test%' OR category = 'test' OR category = 'Test'";
    const res = await client.query(updateQuery);
    console.log(`Updated ${res.rowCount} products from 'test' to 'Perfume'.`);

  } catch (err) {
    console.error("Error updating products:", err);
  } finally {
    await client.end();
  }
}

main();
