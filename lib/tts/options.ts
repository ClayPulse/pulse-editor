export interface TTSProviderOption {
  provider: string;
  isSupported: boolean;
  models: {
    model: string;
    isSupported: boolean;
  }[];
}

export const ttsProviderOptions: TTSProviderOption[] = [
  {
    provider: "openai",
    isSupported: true,
    models: [
      {
        model: "tts-1",
        isSupported: false,
      }
    ]
  },
  {
    provider: "elevenlabs",
    isSupported: true,
    models: [
      {
        model: "eleven_multilingual_v2",
        isSupported: false,
      },
      {
        model: "eleven_turbo_v2_5",
        isSupported: false,
      }
    ]
  },
  {
    provider: "playht",
    isSupported: true,
    models: [
      {
        model: "Play3.0-mini",
        isSupported: false,
      }
    ]
  }
]