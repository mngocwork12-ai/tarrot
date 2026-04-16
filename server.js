import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import path from "path";
const app = express();
app.use(express.json());
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

// Create the Anthropic client once — reused for every request
const client = new Anthropic();
app.post("/ask", async (req, res) => {
  const { question, selectedCards } = req.body;

  // Build card list
  const cardList = selectedCards
    .map((c, i) => {
      const position = ["Past", "Present", "Future"][i];
      return `${position}: ${c.name} (${c.number})`;
    })
    .join("\n");

  // Build prompt
  const prompt = `You are a wise and thoughtful tarot reader.
The user asked: "${question}"
They drew these cards:
${cardList}
Give a warm, insightful tarot reading.`;

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

