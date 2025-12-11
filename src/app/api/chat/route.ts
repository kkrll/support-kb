import { systemPrompt, findMatch } from "@/kb";
import { defaultModel } from "@/lib/openrouter";

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json();
    
    console.log("=== Chat API Request ===");
    console.log("Model:", model || defaultModel);
    console.log("Messages count:", messages.length);
    
    // Extract text from the last message
    const lastMessage = messages[messages.length - 1];
    const lastMessageText = lastMessage?.content || "";

    console.log("User message:", lastMessageText);

    const match = findMatch(lastMessageText);
    console.log("KB match:", match ? `${match.id} (${match.category})` : "none");

    const context = match
      ? `\n\nОтвет из базы знаний:\n${match.answer}${
          match.followup ? `\n\nДополнительно: ${match.followup}` : ""
        }`
      : "\n\nВ базе знаний нет точного ответа. Постарайся помочь или предложи связаться с поддержкой.";

    const selectedModel = model || defaultModel;
    console.log("Calling OpenRouter with model:", selectedModel);

    // Call OpenRouter API directly
    const openrouterMessages = [
      { role: "system", content: systemPrompt + context },
      ...messages,
    ];

    console.log("Sending to OpenRouter:", JSON.stringify(openrouterMessages, null, 2));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Support KB",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: openrouterMessages,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter error:", errorData);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    console.log("Streaming response from OpenRouter");
    
    // Parse SSE stream and convert to plain text
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("=== Chat API Error ===");
    console.error("Error:", error);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to process chat request",
        details: error?.message || "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
