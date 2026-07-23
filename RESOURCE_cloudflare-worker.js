// Copy this code into your Cloudflare Worker script.
// The browser sends requests here, and the worker keeps the OpenAI key safe.

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    const apiKey = env.OPENAI_API_KEY;
    const apiUrl = "https://api.openai.com/v1/chat/completions";

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "The worker is not configured yet." }),
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Please send valid JSON." }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const messages = Array.isArray(body?.messages) ? body.messages : [];

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "A messages array is required." }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const safeMessages = messages.map((message) => ({
      role: message?.role || "user",
      content: String(message?.content || "").slice(0, 1500),
    }));

    const requestBody = {
      model: "gpt-4.1",
      messages: safeMessages,
      max_completion_tokens: 300,
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json().catch(() => ({}));

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: corsHeaders,
    });
  },
};
