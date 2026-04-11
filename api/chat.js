export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY environment variable." });
  }

  const { message, history } = req.body || {};
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Missing message payload." });
  }

  const messages = [
    {
      role: "system",
      content:
        "You are a helpful and concise first-home buying assistant for Finland. Answer questions about neighbourhoods, financing, first-time buyer support, and mortgage readiness in a clear and friendly way.",
    },
    ...((Array.isArray(history) && history.length > 0)
      ? history.map((item) => ({ role: item.role, content: item.content })).slice(-10)
      : []),
    { role: "user", content: message },
  ];

  try {
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await openAiResponse.json();
    if (!openAiResponse.ok) {
      return res.status(openAiResponse.status).json({ error: data?.error?.message || "OpenAI request failed." });
    }

    const reply = data.choices?.[0]?.message?.content?.trim();
    return res.status(200).json({ reply: reply || "I couldn't generate a response. Please try again." });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ error: "AI chat is currently unavailable." });
  }
}
