

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, 
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Failed to connect to Supabase PostgreSQL:', err.stack);
  } else {
    console.log('Connected to Supabase PostgreSQL successfully!');
    release();
  }
});

export default pool;
