import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { DrawingInformation } from "../interface";

async function predictText2Text(
  model: BaseLanguageModel,
  file: string,
  drawingInformation: DrawingInformation,
  instruction: string,
): Promise<string> {
  const prompt = `\
You are a helpful code copilot who is helping a developer to code. \
You must review the code and complete instruction from the developer. \
The information about the current line and focused text are given along with the full \
code file. Finally, you must return in the specified format.

Current line: ${drawingInformation.lineStart}-${drawingInformation.lineEnd}
Focused text:
\`\`\`
${drawingInformation.text}
\`\`\`
Code file:
\`\`\`
${file}
\`\`\`

After reviewing the code, the developer has given you the following instruction:
\`\`\`
${instruction}
\`\`\`

Finally, you must return a JSON containing the code completion in the following format:
\`\`\`
{
  "codeCompletion": "The code completion goes here"
}
\`\`\`
`;
  return await model.invoke(prompt);
}

async function predictText2Speech(text: string): Promise<Blob> {
  return new Blob();
}

async function predictSpeech2Text(audioBase64: Blob): Promise<string> {
  return "audio";
}

