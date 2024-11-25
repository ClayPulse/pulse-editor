import OpenAI from "openai";
import { ElevenLabsClient } from "elevenlabs";
import { Readable } from "stream";

export class BaseTTS {
  // The model object
  private model: any;
  // A function defines how to generate the output using the model
  private generateFunc: (model: any, text: string) => Promise<Blob>;

  constructor(
    model: any,
    generateFunc: (model: any, text: string) => Promise<Blob>,
  ) {
    this.model = model;
    this.generateFunc = generateFunc;
  }

  public async generate(text: string): Promise<Blob> {
    return await this.generateFunc(this.model, text);
  }
}

export function getModelTTS(
  apiKey: string,
  provider: string,
  modelName: string,
  voiceName?: string,
): BaseTTS {
  let model: any;
  let generateFunc: (model: any, text: string) => Promise<Blob>;

  switch (provider) {
    case "openai":
      model = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
      generateFunc = async (model, text) => {
        const mp3 = await model.audio.speech.create({
          model: modelName,
          voice: voiceName,
          input: text,
        });
        const buffer = Buffer.from(await mp3.arrayBuffer());
        const blob = new Blob([buffer], { type: "audio/mp3" });

        return blob;
      };
      break;
    case "elevenlabs":
      const client = new ElevenLabsClient({
        apiKey: apiKey,
      });
      model = client;

      generateFunc = async (model, text) => {
        const data: Readable = await model.generate({
          text: text,
          model_id: modelName,
          output_format: "mp3_22050_32",
          voice: voiceName,
        });

        const chunks = [];
        for await (const chunk of data) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        const blob = new Blob([buffer], { type: "audio/mp3" });
        return blob;
      };
      break;
    case "playht":
      throw new Error("Playht model not implemented yet");
    default:
      model = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
      generateFunc = async (model, text) => {
        const { audio } = await model.tts.create({
          text,
          model: modelName,
          voice: voiceName,
        });
        return audio;
      };
  }

  return new BaseTTS(model, generateFunc);
}
