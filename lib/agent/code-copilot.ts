import {
  CodeCompletionInstruction,
  CodeCompletionResult,
  DrawingInformation,
} from "../interface";
import { BaseLLM } from "../llm/llm";
import { BaseSTT } from "../stt/stt";
import { BaseTTS } from "../tts/tts";

export async function predictCodeCompletion(
  stt: BaseSTT | undefined,
  llm: BaseLLM,
  tts: BaseTTS | undefined,
  file: string,
  drawingInformation: DrawingInformation,
  instruction: CodeCompletionInstruction,
): Promise<CodeCompletionResult> {
  let llmInstruction;
  if (instruction.text) {
    llmInstruction = instruction.text;
  } else if (stt && instruction.audio) {
    const sttResult = await stt.generate(instruction.audio);
    llmInstruction = sttResult;
  } else if (stt) {
    throw new Error(
      "Both stt and instruction.audio must be provided. Are you missing the instruction audio?",
    );
  } else if (instruction.audio) {
    throw new Error(
      "Both stt and instruction.audio must be provided. Are you missing the STT model?",
    );
  } else {
    throw new Error(
      "Either instruction.text or instruction.audio must be provided.",
    );
  }

  const llmPrompt = `\
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
${llmInstruction}
\`\`\`

Finally, you must return a JSON containing the code completion in the following format:
\`\`\`
{
  "codeCompletion": "The code completion goes here"
}
\`\`\`
`;
  const llmResult = await llm.generate(llmPrompt);

  let ttsResult = undefined;
  if (tts) {
    ttsResult = await tts.generate(llmResult);
  }

  return {
    text: llmResult,
    audio: ttsResult,
  };
}
