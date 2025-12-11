import { createOpenAI } from "@ai-sdk/openai";

export const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export const defaultModel = "mistralai/devstral-2512:free";

export const availableModels = [
  // Reasoning models have issues with multi-turn conversations
  { id: "mistralai/devstral-2512:free", name: "Mistral Devstral (Free)" },
  { id: "z-ai/glm-4.5-air:free", name: "GLM 4.5 Air (Free)" },
  // { id: "anthropic/claude-3.5-haiku", name: "Claude 4.5 Haiku" },
  // { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
];
