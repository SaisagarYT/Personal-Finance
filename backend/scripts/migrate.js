import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');
  const sqlPath = path.resolve('life_os_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log(`Executing life_os_schema.sql (${sql.length} bytes)...`);
  
  await client.query(sql);
  console.log('Migration executed successfully!');

  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log(`\nPublic tables in Supabase (${res.rows.length} total):`);
  console.log(res.rows.map(r => r.table_name).join(', '));
  await client.end();
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
