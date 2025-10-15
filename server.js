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

async function loadDB() {
  return await fs.readJSON(DB_PATH);
}

app.get("/", (req, res) => {
  res.json({ message: "Mock Orders API - ready" });
});

app.get("/orders/:id", async (req, res) => {
  const { id } = req.params;
  const db = await loadDB();
  const order = db.orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({ error: "Ordine non trovato" });
  }
  res.json(order);
});

app.listen(PORT, () => {
  console.log(`✅ Mock Orders API in ascolto su http://localhost:${PORT}`);
});
