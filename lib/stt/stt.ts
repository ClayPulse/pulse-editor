import OpenAI from "openai";

export class BaseSTT {
  // The model object
  model: any;
  // A function defines how to generate the output using the model
  generateFunc: (model: any, audio: Blob) => Promise<string>;

  constructor(
    model: any,
    generateFunc: (model: any, audio: Blob) => Promise<string>,
  ) {
    this.model = model;
    this.generateFunc = generateFunc;
  }

  async generate(audio: Blob): Promise<string> {
    return await this.generateFunc(this.model, audio);
  }
}

export function getModelSTT(
  apiKey: string,
  provider: string,
  modelName: string,
): BaseSTT {
  let model: any;
  let generateFunc: (model: any, audio: Blob) => Promise<string>;

  switch (provider) {
    case "openai":
      model = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
      generateFunc = async (model, audio) => {
        const file = new File([audio], "audio.wav", { type: "audio/wav" });
        const { text } = await model.audio.transcriptions.create({
          file: file,
          model: modelName,
        });
        return text;
      };

    default:
      model = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
      generateFunc = async (model, audio) => {
        const file = new File([audio], "audio.wav", { type: "audio/wav" });
        const { text } = await model.audio.transcriptions.create({
          file: file,
          model: "whisper-1",
        });

        return text;
      };
  }

  return new BaseSTT(model, generateFunc);
}
