import { Client } from 'pg';
const connectionString = "postgresql://postgres.numzdnwdlysgodumavjg:XwTq2Cih50Kwqt1Y@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres";
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
async function run() {
  await client.connect();
  await client.query("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS enable_whatsapp_order boolean DEFAULT true;");
  await client.query("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS whatsapp_number text DEFAULT '+923175587278';");
  console.log("Columns added successfully");
  await client.end();
}
run();
