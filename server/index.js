require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("./db");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");
    const uniqueName = `${Date.now()}-${baseName}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Sadece JPG, PNG veya WEBP görseller yüklenebilir"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

function auth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Giriş gerekli" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token geçersiz" });
  }
}

function isValidEmail(email) {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
}

function isValidPhoneDigits(phone) {
  return /^[0-9]{10,15}$/.test(phone);
}

function isValidPropertyType(type) {
  return ["daire", "villa", "arsa", "ofis"].includes(type);
}

function isValidListingType(type) {
  return ["satilik", "kiralik"].includes(type);
}

function isValidInSite(value) {
  return ["evet", "hayir"].includes(value);
}

function isValidUsageStatus(value) {
  return ["bos", "kiracili", "mulk_sahibi"].includes(value);
}

function isValidTitleDeedStatus(value) {
  return [
    "Kat Mülkiyetli",
    "Kat İrtifaklı",
    "Hisseli Tapu",
    "Müstakil Tapu",
    "Arsa Tapulu",
  ].includes(value);
}

function isValidHeating(value) {
  return [
    "Yok",
    "Kombi (Doğalgaz)",
    "Merkezi Sistem",
    "Yerden Isıtma",
    "Klima",
    "Soba",
    "Elektrikli Isıtma",
  ].includes(value);
}

function isValidPortfolioStatus(value) {
  return ["aktif", "satildi", "kiralandi"].includes(value);
}

app.get("/api/health", (req, res) => {
  res.json({ message: "Server çalışıyor" });
});

app.get("/api/auth/me", auth, async (req, res) => {
  return res.json({ user: req.user });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email ve şifre zorunlu" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Email veya şifre hatalı" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Email veya şifre hatalı" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 60 * 60 * 1000,
    });

    res.json({ message: "Giriş başarılı" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Çıkış yapıldı" });
});

/* =========================
   CUSTOMERS
   ========================= */ 

app.get("/api/customers", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, first_name, last_name, email, phone, budget_max, notes, created_at FROM customers ORDER BY created_at DESC"
    );
    return res.json({ customers: result.rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
});

app.post("/api/customers", auth, async (req, res) => {
  const { first_name, last_name, email, phone, budget_max, notes } =
    req.body || {};

  if (!first_name || !last_name || !email || !phone) {
    return res.status(400).json({ message: "Zorunlu alanlar eksik" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Geçerli bir email giriniz" });
  }

  if (!isValidPhoneDigits(phone)) {
    return res
      .status(400)
      .json({ message: "Telefon sadece rakam olmalı (10-15 hane)" });
  }

  if (budget_max !== undefined && budget_max !== null && budget_max !== "") {
    const n = Number(budget_max);
    if (!Number.isFinite(n) || n < 0) {
      return res.status(400).json({ message: "Bütçe (max) geçersiz" });
    }
  }

  try {
    const result = await pool.query(
      `INSERT INTO customers (first_name, last_name, email, phone, budget_max, notes)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, first_name, last_name, email, phone, budget_max, notes, created_at`,
      [
        first_name.trim(),
        last_name.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        budget_max === "" ? null : budget_max ?? null,
        notes?.trim() || null,
      ]
    );

    return res.status(201).json({ customer: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ message: "Bu email veya telefon zaten kayıtlı" });
    }

    if (err.code === "23514") {
      return res.status(400).json({ message: "Gönderilen bilgiler geçersiz" });
    }

    console.log(err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
});

app.get("/api/customers/:id", auth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT id, first_name, last_name, email, phone, budget_max, notes, created_at FROM customers WHERE id=$1",
      [id]
    );

    const customer = result.rows[0];
    if (!customer) {
      return res.status(404).json({ message: "Müşteri bulunamadı" });
    }

    return res.json({ customer });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
});

app.put("/api/customers/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone, budget_max, notes } =
    req.body || {};

  if (!first_name || !last_name || !email || !phone) {
    return res.status(400).json({ message: "Zorunlu alanlar eksik" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Geçerli bir email giriniz" });
  }

  if (!isValidPhoneDigits(phone)) {
    return res
      .status(400)
      .json({ message: "Telefon sadece rakam olmalı (10-15 hane)" });
  }

  if (budget_max !== undefined && budget_max !== null && budget_max !== "") {
    const n = Number(budget_max);
    if (!Number.isFinite(n) || n < 0) {
      return res.status(400).json({ message: "Bütçe (max) geçersiz" });
    }
  }

  try {
    const result = await pool.query(
      `UPDATE customers
       SET first_name=$1, last_name=$2, email=$3, phone=$4, budget_max=$5, notes=$6
       WHERE id=$7
       RETURNING id, first_name, last_name, email, phone, budget_max, notes, created_at`,
      [
        first_name.trim(),
        last_name.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        budget_max === "" ? null : budget_max ?? null,
        notes?.trim() || null,
        id,
      ]
    );

    const updated = result.rows[0];
    if (!updated) {
      return res.status(404).json({ message: "Müşteri bulunamadı" });
    }

    return res.json({ customer: updated });
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ message: "Bu email veya telefon zaten kayıtlı" });
    }

    if (err.code === "23514") {
      return res.status(400).json({ message: "Gönderilen bilgiler geçersiz" });
    }

    console.log(err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
});

app.delete("/api/customers/:id", auth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM customers WHERE id=$1 RETURNING id",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Müşteri bulunamadı" });
    }

    return res.json({ message: "Müşteri silindi" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
});

/* =========================
   PORTFOLIO
   ========================= */

app.get("/api/portfolio", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          id,
          image_path,
          listing_type,
          price,
          property_type,
          gross_m2,
          room_count,
          city,
          district,
          heating,
          in_site,
          bathroom_count,
          building_age,
          usage_status,
          title_deed_status,
          status,
          created_at
       FROM portfolio
       ORDER BY created_at DESC`
    );

    return res.json({ portfolio: result.rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
});

app.post(
  "/api/portfolio",
  auth,
  upload.single("image"),
  async (req, res) => {
    const {
      listing_type,
      price,
      property_type,
      gross_m2,
      room_count,
      city,
      district,
      heating,
      in_site,
      bathroom_count,
      building_age,
      usage_status,
      title_deed_status,
    } = req.body || {};

    const isLand = property_type === "arsa";

    if (
      !listing_type ||
      price === undefined ||
      price === null ||
      !property_type ||
      gross_m2 === undefined ||
      gross_m2 === null ||
      !city ||
      !district ||
      !in_site ||
      !usage_status ||
      !title_deed_status
    ) {
      return res.status(400).json({ message: "Zorunlu alanlar eksik" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Görsel zorunlu" });
    }

    const priceNumber = Number(price);
    const grossM2Number = Number(gross_m2);

    let bathroomCountNumber = null;
    let buildingAgeNumber = null;

    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      return res.status(400).json({ message: "Geçerli bir fiyat giriniz" });
    }

    if (!Number.isFinite(grossM2Number) || grossM2Number <= 0) {
      return res.status(400).json({ message: "Geçerli bir m² değeri giriniz" });
    }

    if (
      !isLand &&
      bathroom_count !== undefined &&
      bathroom_count !== null &&
      bathroom_count !== ""
    ) {
      bathroomCountNumber = Number(bathroom_count);

      if (!Number.isFinite(bathroomCountNumber) || bathroomCountNumber < 0) {
        return res
          .status(400)
          .json({ message: "Geçerli bir banyo sayısı giriniz" });
      }
    }

    if (
      !isLand &&
      building_age !== undefined &&
      building_age !== null &&
      building_age !== ""
    ) {
      buildingAgeNumber = Number(building_age);

      if (!Number.isFinite(buildingAgeNumber) || buildingAgeNumber < 0) {
        return res
          .status(400)
          .json({ message: "Geçerli bir bina yaşı giriniz" });
      }
    }

    if (!isValidPropertyType(property_type)) {
      return res.status(400).json({ message: "Geçersiz emlak tipi" });
    }

    if (!isValidListingType(listing_type)) {
      return res.status(400).json({ message: "Geçersiz ilan tipi" });
    }

    if (!isLand && heating && !isValidHeating(heating)) {
      return res.status(400).json({ message: "Geçersiz ısıtma bilgisi" });
    }

    if (!isValidInSite(in_site)) {
      return res.status(400).json({ message: "Geçersiz site bilgisi" });
    }

    if (!isValidUsageStatus(usage_status)) {
      return res.status(400).json({ message: "Geçersiz kullanım durumu" });
    }

    if (!isValidTitleDeedStatus(title_deed_status)) {
      return res.status(400).json({ message: "Geçersiz tapu durumu" });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    try {
      const result = await pool.query(
        `INSERT INTO portfolio (
          image_path,
          listing_type,
          price,
          property_type,
          gross_m2,
          room_count,
          city,
          district,
          heating,
          in_site,
          bathroom_count,
          building_age,
          usage_status,
          title_deed_status,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING
          id,
          image_path,
          listing_type,
          price,
          property_type,
          gross_m2,
          room_count,
          city,
          district,
          heating,
          in_site,
          bathroom_count,
          building_age,
          usage_status,
          title_deed_status,
          status,
          created_at`,
        [
          imagePath,
          listing_type.trim().toLowerCase(),
          priceNumber,
          property_type.trim().toLowerCase(),
          grossM2Number,
          isLand ? null : room_count?.trim() || null,
          city.trim(),
          district.trim(),
          isLand ? null : heating?.trim() || null,
          in_site.trim().toLowerCase(),
          isLand ? null : bathroomCountNumber,
          isLand ? null : buildingAgeNumber,
          usage_status.trim().toLowerCase(),
          title_deed_status.trim(),
          "aktif",
        ]
      );

      return res.status(201).json({ portfolioItem: result.rows[0] });
    } catch (err) {
      if (err.code === "23514") {
        return res
          .status(400)
          .json({ message: "Gönderilen bilgiler geçersiz" });
      }

      console.log(err);
      return res.status(500).json({ message: "Sunucu hatası" });
    }
  }
);

app.get("/api/portfolio/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT
          id,
          image_path,
          listing_type,
          price,
          property_type,
          gross_m2,
          room_count,
          city,
          district,
          heating,
          in_site,
          bathroom_count,
          building_age,
          usage_status,
          title_deed_status,
          status,
          created_at
       FROM portfolio
       WHERE id = $1`,
      [id]
    );

    const portfolioItem = result.rows[0];

    if (!portfolioItem) {
      return res.status(404).json({ message: "Portföy bulunamadı" });
    }

    return res.json({ portfolioItem });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
});

app.put(
  "/api/portfolio/:id",
  auth,
  upload.single("image"),
  async (req, res) => {
    const { id } = req.params;
    const {
      listing_type,
      price,
      property_type,
      gross_m2,
      room_count,
      city,
      district,
      heating,
      in_site,
      bathroom_count,
      building_age,
      usage_status,
      title_deed_status,
    } = req.body || {};

    const isLand = property_type === "arsa";

    if (
      !listing_type ||
      price === undefined ||
      price === null ||
      !property_type ||
      gross_m2 === undefined ||
      gross_m2 === null ||
      !city ||
      !district ||
      !in_site ||
      !usage_status ||
      !title_deed_status
    ) {
      return res.status(400).json({ message: "Zorunlu alanlar eksik" });
    }

    const priceNumber = Number(price);
    const grossM2Number = Number(gross_m2);

    let bathroomCountNumber = null;
    let buildingAgeNumber = null;

    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      return res.status(400).json({ message: "Geçerli bir fiyat giriniz" });
    }

    if (!Number.isFinite(grossM2Number) || grossM2Number <= 0) {
      return res.status(400).json({ message: "Geçerli bir m² değeri giriniz" });
    }

    if (
      !isLand &&
      bathroom_count !== undefined &&
      bathroom_count !== null &&
      bathroom_count !== ""
    ) {
      bathroomCountNumber = Number(bathroom_count);

      if (!Number.isFinite(bathroomCountNumber) || bathroomCountNumber < 0) {
        return res
          .status(400)
          .json({ message: "Geçerli bir banyo sayısı giriniz" });
      }
    }

    if (
      !isLand &&
      building_age !== undefined &&
      building_age !== null &&
      building_age !== ""
    ) {
      buildingAgeNumber = Number(building_age);

      if (!Number.isFinite(buildingAgeNumber) || buildingAgeNumber < 0) {
        return res
          .status(400)
          .json({ message: "Geçerli bir bina yaşı giriniz" });
      }
    }

    if (!isValidPropertyType(property_type)) {
      return res.status(400).json({ message: "Geçersiz emlak tipi" });
    }

    if (!isValidListingType(listing_type)) {
      return res.status(400).json({ message: "Geçersiz ilan tipi" });
    }

    if (!isLand && heating && !isValidHeating(heating)) {
      return res.status(400).json({ message: "Geçersiz ısıtma bilgisi" });
    }

    if (!isValidInSite(in_site)) {
      return res.status(400).json({ message: "Geçersiz site bilgisi" });
    }

    if (!isValidUsageStatus(usage_status)) {
      return res.status(400).json({ message: "Geçersiz kullanım durumu" });
    }

    if (!isValidTitleDeedStatus(title_deed_status)) {
      return res.status(400).json({ message: "Geçersiz tapu durumu" });
    }

    try {
      let imagePath = null;

      if (req.file) {
        imagePath = `/uploads/${req.file.filename}`;
      }

      const result = await pool.query(
        `UPDATE portfolio
         SET image_path = COALESCE($1, image_path),
             listing_type = $2,
             price = $3,
             property_type = $4,
             gross_m2 = $5,
             room_count = $6,
             city = $7,
             district = $8,
             heating = $9,
             in_site = $10,
             bathroom_count = $11,
             building_age = $12,
             usage_status = $13,
             title_deed_status = $14
         WHERE id = $15
         RETURNING
           id,
           image_path,
           listing_type,
           price,
           property_type,
           gross_m2,
           room_count,
           city,
           district,
           heating,
           in_site,
           bathroom_count,
           building_age,
           usage_status,
           title_deed_status,
           status,
           created_at`,
        [
          imagePath,
          listing_type.trim().toLowerCase(),
          priceNumber,
          property_type.trim().toLowerCase(),
          grossM2Number,
          isLand ? null : room_count?.trim() || null,
          city.trim(),
          district.trim(),
          isLand ? null : heating?.trim() || null,
          in_site.trim().toLowerCase(),
          isLand ? null : bathroomCountNumber,
          isLand ? null : buildingAgeNumber,
          usage_status.trim().toLowerCase(),
          title_deed_status.trim(),
          id,
        ]
      );

      const updated = result.rows[0];

      if (!updated) {
        return res.status(404).json({ message: "Portföy bulunamadı" });
      }

      return res.json({ portfolioItem: updated });
    } catch (err) {
      if (err.code === "23514") {
        return res
          .status(400)
          .json({ message: "Gönderilen bilgiler geçersiz" });
      }

      console.log(err);
      return res.status(500).json({ message: "Sunucu hatası" });
    }
  }
);

app.patch("/api/portfolio/:id/status", auth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!status) {
    return res.status(400).json({ message: "Durum bilgisi zorunlu" });
  }

  if (!isValidPortfolioStatus(status)) {
    return res.status(400).json({ message: "Geçersiz portföy durumu" });
  }

  try {
    const result = await pool.query(
      `UPDATE portfolio
       SET status = $1
       WHERE id = $2
       RETURNING
         id,
         image_path,
         listing_type,
         price,
         property_type,
         gross_m2,
         room_count,
         city,
         district,
         heating,
         in_site,
         bathroom_count,
         building_age,
         usage_status,
         title_deed_status,
         status,
         created_at`,
      [status, id]
    );

    const updated = result.rows[0];

    if (!updated) {
      return res.status(404).json({ message: "Portföy bulunamadı" });
    }

    return res.json({
      message: "Portföy durumu güncellendi",
      portfolioItem: updated,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
});

app.delete("/api/portfolio/:id", auth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM portfolio WHERE id = $1 RETURNING id, image_path",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Portföy bulunamadı" });
    }

    return res.json({ message: "Portföy silindi" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "Dosya boyutu en fazla 5 MB olabilir" });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err) {
    return res.status(400).json({ message: err.message });
  }

  next();
});

app.listen(process.env.PORT, () => {
  console.log(`Server ${process.env.PORT} portunda çalışıyor`);
});