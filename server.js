import express from "express";
import cors from "cors";
import fs from "fs-extra";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const DB_PATH = "./db.json";

// Funzione helper per caricare il database
async function loadDB() {
  try {
    return await fs.readJSON(DB_PATH);
  } catch (err) {
    console.error("Errore nel caricamento di db.json:", err);
    throw new Error("Database non accessibile");
  }
}

// Endpoint base
app.get("/", (req, res) => {
  res.json({ message: "Mock Orders API - ready" });
});

// ✅ Endpoint: /orders/search?email=
app.get("/orders/search", async (req, res) => {
  const email = req.query.email?.toLowerCase();

  if (!email) {
    return res
      .status(400)
      .json({ error: "Missing required query parameter: email" });
  }

  try {
    const db = await loadDB();
    const results = db.orders.filter(
      (order) => order.customerEmail?.toLowerCase() === email
    );

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: `No orders found for email ${email}` });
    }

    res.json({ orders: results });
  } catch (err) {
    console.error("Errore nella ricerca ordini:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Endpoint: /orders/:id
app.get("/orders/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const db = await loadDB();
    const order = db.orders.find((o) => o.id === id);

    if (!order) {
      return res.status(404).json({ error: "Ordine non trovato" });
    }

    res.json(order);
  } catch (err) {
    console.error("Errore nel caricamento ordine:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Avvio server
app.listen(PORT, () => {
  console.log(`✅ Mock Orders API in ascolto su http://localhost:${PORT}`);
});
  
