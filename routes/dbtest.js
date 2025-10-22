// routes/dbtest.js
import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  let client;
  try {
    client = await pool.connect();
    const now = await client.query("SELECT NOW() AS data_atual");
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    res.json({
      success: true,
      data_atual: now.rows[0].data_atual,
      tabelas: tables.rows.map(t => t.table_name),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (client) client.release();
  }
});

export default router;
