export interface LLMProviderOption {
  provider: string;
  isSupported: boolean;
  models: {
    model: string;
    isSupported: boolean;
  }[];
}

export const llmProviderOptions: LLMProviderOption[] = [
  {
    provider: "openai",
    isSupported: true,
    models: [
      {
        model: "gpt-4o",
        isSupported: true,
      },
      {
        model: "gpt-4o-mini",
        isSupported: true,
      },
    ],
  },
  {
    provider: "anthropic",
    isSupported: true,
    models: [
      {
        model: "claude-3-5-sonnet-latest",
        isSupported: false,
      },
      {
        model: "claude-3-5-haiku-latest",
        isSupported: false,
      },
    ],
  },
  {
    provider: "togetherai",
    isSupported: true,
    models: [
      {
        model: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
        isSupported: false,
      },
      {
        model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
        isSupported: false,
      },
      {
        model: "meta-llama/Llama-3.2-3B-Instruct-Turbo",
        isSupported: false,
      },
      {
        model: "codellama/CodeLlama-34b-Instruct-hf",
        isSupported: false,
      },
    ],
  },
  {
    provider: "local",
    isSupported: true,
    models: [
      {
        model: "llama-3.2-3B",
        isSupported: false,
      },
    ],
  },
];
