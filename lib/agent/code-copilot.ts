import {
  CodeCompletionInstruction,
  CodeCompletionResult,
  SelectionInformation,
} from "../interface";
import { BaseLLM } from "../llm/llm";
import { BaseSTT } from "../stt/stt";
import { BaseTTS } from "../tts/tts";

function stringifySelectionInformationList(
  selectionInformationList: SelectionInformation[],
): string {
  function stringifyOneSelectionInformation(
    selectionInformation: SelectionInformation,
    index: number,
  ): string {
    return `\
Selection ${index + 1}:
- line range: line ${selectionInformation.lineStart} to line ${selectionInformation.lineEnd}
- selected text (This is extracted by OCR so not guaranteed to be accurate. Use it as a hint, and use the full code file for accurate reference.):
\`\`\`
${selectionInformation.text}
\`\`\`
`;
  }

  const selections = selectionInformationList
    .map((selectionInformation, index) =>
      stringifyOneSelectionInformation(selectionInformation, index),
    )
    .join("\n");

  return selections;
}

export async function predictCodeCompletion(
  stt: BaseSTT | undefined,
  llm: BaseLLM,
  tts: BaseTTS | undefined,
  // need line number information in the given file
  file: string,
  selectionInformationList: SelectionInformation[],
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
The information about the selected line \
${selectionInformationList.length > 0 ? "and selected text are" : "is"} \
given along with the full \
code file. Finally, you must return in the specified format.

Code file:
\`\`\`
${file}
\`\`\`

${selectionInformationList.length > 0 ? "These are the selection information provided by the developer:" : ""}
${stringifySelectionInformationList(selectionInformationList)}

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
  let llmResult = await llm.generate(llmPrompt);
  // strip the ```json from the beginning and ``` from the end if present
  llmResult = llmResult
    .replace(/^```json/, "")
    .replace(/```$/, "")
    .trim();
  const llmResultJson = JSON.parse(llmResult);
  const codeCompletion = llmResultJson.codeCompletion;
  const explanation = llmResultJson.explanation;
  console.log("Prompt:\n", llmPrompt);
  // Pretty print the result
  console.log("Code completion:\n", codeCompletion);
  console.log("Explanation:\n", explanation);

  // Read out the explanation if TTS is provided
  let ttsResult = undefined;
  if (tts) {
    ttsResult = await tts.generate(explanation);
  }

  const result: CodeCompletionResult = {
    text: llmResult,
    audio: ttsResult,
  };

  return result;
}
