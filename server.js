import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import path from "path";
import cors from "cors";
const app = express();
app.use(express.json());
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(cors({
  origin: "https://tarrot-gamma.vercel.app"
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

    // Send the text back to your browser
    res.json({ response: message.content[0].text });

  } catch (error) {
    console.error("Anthropic error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running at http://localhost:3000");
});

