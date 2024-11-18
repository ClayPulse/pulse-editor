import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { TogetherAI } from "@langchain/community/llms/togetherai";
import { BaseLanguageModel } from "@langchain/core/language_models/base";

export function getModel(
  provider: "openai" | "anthropic" | "togetherai" | "local",
  modelName: string,
  apiKey: string,
  temperature: number,
): BaseLanguageModel {
  switch (provider) {
    case "openai":
      return new ChatOpenAI({
        apiKey,
        model: modelName,
        temperature,
      });
    case "anthropic":
      return new ChatAnthropic({
        apiKey,
        model: modelName,
        temperature,
      });
    case "togetherai":
      return new TogetherAI({
        apiKey,
        model: modelName,
        temperature,
      });
    case "local":
      throw new Error("Local model not implemented yet");
    default:
      return new ChatOpenAI({
        apiKey,
        model: modelName,
        temperature,
      });
  }
}
