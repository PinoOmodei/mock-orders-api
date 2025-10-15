import express from "express";
import cors from "cors";
import fs from "fs-extra";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🧾 Logger (middleware. Notare l'uso di res.on(), per eseguire del codice DOPO l'esecuzione dell'endpoint. Cool!)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// Implementazione security con token fisso (e endpoint health per check)
// ✅ Endpoint pubblico di health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Mock Orders API",
    timestamp: new Date().toISOString(),
  });
});

// 🔐 Middleware di sicurezza: richiede x-api-key in header per tutto il resto
app.use((req, res, next) => {
  if (req.path === "/health") return next(); // escluso
  const token = req.headers["x-api-key"];
  if (!token || token !== process.env.API_KEY) {
    return res
      .status(401)
      .json({ error: "Unauthorized: invalid or missing API key" });
  }
  next();
});


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
  
