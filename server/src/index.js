import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";

const system = readFileSync(new URL("./prompts/fortuneSystemPrompt.txt", import.meta.url), "utf8");
const fallbacks = JSON.parse(readFileSync(new URL("./data/fallbackFortunes.json", import.meta.url), "utf8"));
const client = new Anthropic(); // reads ANTHROPIC_API_KEY
const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/api/", rateLimit({ windowMs: 60 * 60 * 1000, max: 10, standardHeaders: true,
  message: { error: "rate_limited", message: "Plenty of cookies for now. Try again in a little while." } }));

// Keep user text short and plain: it is data, never instructions.
const clean = (s, n) => String(s ?? "").replace(/[^\p{L}\p{N} .,'’!?-]/gu, "").trim().slice(0, n);
const pick = (a) => a[Math.floor(Math.random() * a.length)];

app.post("/api/fortune", async (req, res) => {
  const { image, petName, personality, animalType, recent } = req.body ?? {};
  const meta = { animal_type: clean(animalType, 20) || "auto", pet_name: clean(petName, 30),
    personality_text: clean(personality, 100),
    recent_fortunes: Array.isArray(recent) ? recent.slice(0, 5).map((r) => clean(r, 140)) : [] };
  const content = [];
  if (typeof image === "string" && image.startsWith("data:image/jpeg;base64,"))
    content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: image.split(",")[1] } });
  content.push({ type: "text", text: JSON.stringify(meta) });
  try {
    const r = await client.messages.create({ model: process.env.MODEL || "claude-sonnet-5-5",
      max_tokens: 400, system, messages: [{ role: "user", content }] });
    const data = JSON.parse(r.content.map((b) => b.text ?? "").join("").replace(/```json|```/g, "").trim());
    if (data.error) return res.status(422).json({ error: "no_animal", message: "That photo doesn't seem to show an animal. Try another one." });
    if (typeof data.fortune !== "string" || !Array.isArray(data.lucky_numbers)) throw new Error("bad shape");
    res.json(data);
  } catch (e) {
    console.error(e.message);
    res.json(pick(fallbacks)); // calm fallback so the cookie always cracks
  }
});

app.listen(process.env.PORT || 3001, () => console.log("Fortune server ready"));
