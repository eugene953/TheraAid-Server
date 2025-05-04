import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'eugene953',
  database: 'MentalHealhSupportBot',
});

// Test the connection
pool.connect(
  (
    err: Error | undefined,
    client: PoolClient | undefined,
    release: (() => void) | undefined
  ) => {
    if (err) {
      console.error('No Connection to PostgreSQL Database', err.stack);
    } else if (client && release) {
      console.log('PostgreSQL Database Connected Successfully');
      release();
    }
  }
);

export default pool;
