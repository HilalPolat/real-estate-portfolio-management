
require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("./db");

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("ADMIN_EMAIL ve ADMIN_PASSWORD tanımlanmalı.");
    process.exit(1);
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, 'admin')
       ON CONFLICT (email) DO NOTHING`,
      [email, password_hash]
    );

    console.log("Admin eklendi veya zaten mevcut.");

    process.exit(0);
  } catch (err) {
    console.error("Seed hatası:", err);
    process.exit(1);
  }
}

seedAdmin();
