import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import path from "path";
import cors from "cors";
import sqlite3 from "sqlite3";
import fs from "fs";
const app = express();
app.use(express.json());
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data dir exists
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Initialize SQLite DB
const db = new sqlite3.Database(path.join(dataDir, "history.db"), (err) => {
  if (err) {
    console.error("Error opening database", err.message);
  } else {
    db.run(`CREATE TABLE IF NOT EXISTS qa_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT,
      cards TEXT,
      answer TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      "https://tarrot-gamma.vercel.app",
      "https://odoo-test.familyfoodsmarket.com",
      "http://localhost:3000",
      "http://localhost:5500",
      "http://127.0.0.1:5500"
    ];
    // Allow requests with no origin, or in the allowed list, or from any familyfoodsmarket.com subdomain
    if (!origin || allowed.includes(origin) || origin.endsWith(".familyfoodsmarket.com")) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.static(path.join(__dirname, "public")));

// Create the Anthropic client once — reused for every request
const client = new Anthropic();
app.post("/ask", async (req, res) => {
  const { question, selectedCards } = req.body;

  // Build card list
const cardList = selectedCards
    .map((c, i) => {
      const position = ["Past", "Present", "Future"][i];
      return `${position}: ${c.name}`;
    })
    .join("\n");
    console.log(selectedCards);

  // Build prompt
const prompt = `You are an honest and funny tarot reader.
The user asked: "${question}";
The user picked these cards, representing Past, Present and Future:
${cardList}
Give an insightful tarot reading with no flattery and use easy language, have a firm position and use witty language. use the same language as the question asked. do not use quote sign. dont add title and special characters`;

  try {
    // This is the template from Anthropic — adapted for your app
    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt        // ← your tarot prompt instead of "Hello world"
        }
      ]
    });

    const answer = message.content[0].text;

    // Save to DB and clean up older than 30 days
    db.serialize(() => {
      db.run(`DELETE FROM qa_history WHERE created_at < datetime('now', '-30 days')`);
      const stmt = db.prepare(`INSERT INTO qa_history (question, cards, answer) VALUES (?, ?, ?)`);
      stmt.run(question, cardList, answer);
      stmt.finalize();
    });

    // Send the text back to your browser
    res.json({ response: answer });

  } catch (error) {
    console.error("Anthropic error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running at https://tarrot-production.up.railway.app");
});

