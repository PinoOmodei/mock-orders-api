# Mock Orders API

Un semplice server mock per testare l'assistente clienti GPT con endpoint di esempio `/orders/:id`.

## 🚀 Avvio rapido

```bash
npm install
npm start
```

Server in ascolto su `http://localhost:3000`

## 📚 Endpoint

- `GET /orders/:id` → restituisce un ordine mock

## 🧩 Integrazione GPT (Actions)

1. Pubblica `openapi.yaml` su GitHub (URL raw)
2. Aggiungi l'azione nel GPT Builder, impostando l'Auth su `none`
3. GPT potrà chiamare `/orders/{id}` direttamente
