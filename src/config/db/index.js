import pgPromise from "pg-promise";
import dotenv from "dotenv";

dotenv.config({quiet: true});

const pgp = pgPromise({
    noWarnings: true
});

const cn = process.env.DB_HOST || process.env.DB_NAME || process.env.DB_USER
  ? {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    }
  : process.env.DATABASE_URL || {
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: '',
    };

export const db = pgp(cn);

export default db;