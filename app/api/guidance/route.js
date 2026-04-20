import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:3b",
        prompt: prompt,
        stream: false,
        format: "json",
        // In your Ollama API call, add these options:
options: {
  temperature: 0.3,
  num_predict: 4096,    // ← increase this from default
  num_ctx: 8192,        // ← increase context window
}
      }),
    });

    if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);

    const ollamaData = await res.json();
    const text = ollamaData.response?.trim() || "";
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    return NextResponse.json(JSON.parse(cleaned));
  } catch (error) {
    console.error("❌ Ollama Error:", error.message);
    return NextResponse.json(
      { error: "Make sure Ollama is running! Run: ollama run llama3.2:3b" },
      { status: 500 }
    );
  }
}