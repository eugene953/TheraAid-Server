import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Accept self-signed SSL certs from Supabase
  },
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Failed to connect to Supabase PostgreSQL:', err);
  } else {
    console.log('✅ Connected to Supabase PostgreSQL successfully!');
    release();
  }
});

export default pool;
