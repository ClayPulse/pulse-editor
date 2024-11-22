import {
  CodeCompletionInstruction,
  CodeCompletionResult,
  DrawingInformation,
} from "../interface";
import { BaseLLM } from "../llm/llm";
import { BaseSTT } from "../stt/stt";
import { BaseTTS } from "../tts/tts";

function stringifyDrawingInformationList(
  drawingInformationList: DrawingInformation[],
): string {
  function stringifyOneDrawingInformation(
    drawingInformation: DrawingInformation,
    index: number,
  ): string {
    return `\
Selection ${index + 1}:
- line range: line ${drawingInformation.lineStart} to line ${drawingInformation.lineEnd}
- selected text (This is extracted by OCR so not guaranteed to be accurate. Use it as a hint, and use the full code file for accurate reference.):
\`\`\`
${drawingInformation.text}
\`\`\`
`;
  }

  return drawingInformationList
    .map((drawingInformation, index) =>
      stringifyOneDrawingInformation(drawingInformation, index),
    )
    .join("\n");
}

export async function predictCodeCompletion(
  stt: BaseSTT | undefined,
  llm: BaseLLM,
  tts: BaseTTS | undefined,
  file: string,
  drawingInformationList: DrawingInformation[],
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
The information about the selected line and selected text are given along with the full \
code file. Finally, you must return in the specified format.

Code file:
\`\`\`
${file}
\`\`\`

These are the selection information provided by the developer:
${stringifyDrawingInformationList(drawingInformationList)}


After reviewing the code, execute the following instruction:
\`\`\`
${llmInstruction}
\`\`\`

Finally, you must return a JSON containing the code completion in the following format:
\`\`\`
{
  "codeCompletion": "The code completion goes here",
  "explanation": "An explanation of the code completion goes here"
}
\`\`\`
`;
  const llmResult = await llm.generate(llmPrompt);

  let ttsResult = undefined;
  if (tts) {
    ttsResult = await tts.generate(llmResult);
  }

  const result: CodeCompletionResult = {
    text: llmResult,
    audio: ttsResult,
  };
  console.log("Prompt:\n", llmPrompt);
  // Pretty print the result
  console.log("Code completion result:\n", JSON.stringify(result, null, 2));

  return result;
}
