import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    const ollamaRes = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:3b",
        prompt: prompt,
        stream: false,
      }),
    });

    const text = await ollamaRes.text();
    const data = JSON.parse(text);
    return NextResponse.json({ reply: data.response });

  } catch (err) {
    console.error("Chat route error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}