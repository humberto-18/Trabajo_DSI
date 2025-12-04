require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function inicializarBD() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saludos (
        id SERIAL PRIMARY KEY,
        texto TEXT NOT NULL
      )
    `);

    const resultado = await pool.query("SELECT COUNT(*) AS total FROM saludos");
    const total = parseInt(resultado.rows[0].total, 10);

    if (total === 0) {
      await pool.query(
        "INSERT INTO saludos (texto) VALUES ($1)",
        ["Hola"]
      );
      console.log("Se insertó un saludo inicial en la base de datos.");
    } else {
      console.log("La tabla saludos ya tiene datos.");
    }
  } catch (error) {
    console.log("Error al inicializar la base de datos:", error);
  }
}

app.get("/api/saludo", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT texto FROM saludos ORDER BY id DESC LIMIT 1"
    );

    if (resultado.rows.length === 0) {
      return res.json({
        mensaje: "No hay saludos en la base de datos aún.",
        horaServidor: new Date().toISOString(),
      });
    }

    res.json({
      mensaje: resultado.rows[0].texto,
      horaServidor: new Date().toISOString(),
    });
  } catch (error) {
    console.log("Error al obtener saludo:", error);
    res.status(500).json({ error: "Error al leer la base de datos" });
  }
});

app.post("/api/saludo", async (req, res) => {
  try {
    const texto = req.body.texto;

    if (!texto) {
      return res
        .status(400)
        .json({ error: "Falta el campo 'texto' en el body." });
    }

    const resultado = await pool.query(
      "INSERT INTO saludos (texto) VALUES ($1) RETURNING id",
      [texto]
    );

    res.json({
      mensaje: "Saludo guardado correctamente.",
      id: resultado.rows[0].id,
    });
  } catch (error) {
    console.log("Error al guardar saludo:", error);
    res.status(500).json({ error: "Error al escribir en la base de datos" });
  }
});

app.listen(PORT, () => {
  console.log("Servidor backend escuchando en el puerto " + PORT);
  inicializarBD();
});