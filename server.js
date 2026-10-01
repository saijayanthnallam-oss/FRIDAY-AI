require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const systemPrompt = `You are FRIDAY, an original AI assistant inspired by futuristic cinematic assistants.
Be helpful, concise, warm, and natural. Do not claim to control a device or perform an action unless the app actually did it.
For ordinary conversation, answer directly.`;

function localReply(message) {
  const m = message.toLowerCase().trim();
  if (/^(hi|hello|hey|hai)\b/.test(m))
    return "Hello. FRIDAY is online. How can I help you?";
  if (m.includes("who are you"))
    return "I'm FRIDAY, your personal AI assistant. I'm ready.";
  if (m.includes("time"))
    return `The current server time is ${new Date().toLocaleString()}.`;
  if (m.includes("capabil"))
    return "I can chat, speak responses, listen with your microphone when supported, search the web, and run cloud-connected features.";
  return "I'm online and ready. Connect a cloud AI provider in the server settings for full conversational intelligence.";
}

app.post("/api/chat", async (req, res) => {
  const message = String(req.body?.message || "").trim();
  if (!message) return res.status(400).json({ error: "Message is required." });

  const key = process.env.AI_API_KEY;
  const base = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  if (!key) {
    return res.json({
      reply: localReply(message),
      mode: "local",
      cloudConnected: false
    });
  }

  try {
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("AI provider error:", response.status, data);
      return res.status(502).json({
        error: "The cloud AI provider rejected the request.",
        detail: data?.error?.message || `HTTP ${response.status}`
      });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) return res.status(502).json({ error: "The cloud AI returned no response." });

    res.json({ reply, mode: "cloud", cloudConnected: true });
  } catch (err) {
    console.error(err);
    res.status(502).json({
      error: "Could not reach the cloud AI provider.",
      detail: err.message
    });
  }
});

app.get("/api/status", (_req, res) => {
  res.json({
    online: true,
    cloudConnected: Boolean(process.env.AI_API_KEY),
    model: process.env.AI_MODEL || "local"
  });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`FRIDAY running on port ${PORT}`);
});
