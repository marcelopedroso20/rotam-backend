// db.js
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const useSSL = !process.env.DB_HOST?.includes("localhost");

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: useSSL
    ? { require: true, rejectUnauthorized: false } // 🔒 Render exige isso
    : false
});

export default pool;
