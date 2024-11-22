import {
  CodeCompletionInstruction,
  CodeCompletionResult,
  SelectionInformation,
} from "../interface";
import { BaseLLM } from "../llm/llm";
import { BaseSTT } from "../stt/stt";
import { BaseTTS } from "../tts/tts";

function addLineInfo(fileContent: string, startFrom: number = 1): string {
  const lines = fileContent.split("\n");
  const maxLineNumber = lines.length;
  const maxLineNumberWidth = `line ${maxLineNumber}`.length;

  const linesWithNumbers = lines.map((line, index) => {
    const lineLabel = `line ${index + startFrom}`;
    const paddedLineLabel = lineLabel.padEnd(maxLineNumberWidth);
    return `${paddedLineLabel}|${line}`;
  });

  return linesWithNumbers.join("\n");
}

function stringifySelectionInformationList(
  fileContent: string,
  selectionInformationList: SelectionInformation[],
): string {
  function stringifyOneSelectionInformation(
    fileContent: string,
    selectionInformation: SelectionInformation,
    index: number,
  ): string {
    const slicedContent = fileContent
      .split("\n")
      .slice(selectionInformation.lineStart - 1, selectionInformation.lineEnd)
      .join("\n");

    return `\
Selection ${index + 1}:
- line range: line ${selectionInformation.lineStart} to line ${selectionInformation.lineEnd}
- code:
\`\`\`
${addLineInfo(slicedContent, selectionInformation.lineStart)}
\`\`\`
- highlighted text (This is extracted by OCR so not guaranteed to be accurate. Use it as a hint, and use the full code file for accurate reference.):
\`\`\`
${selectionInformation.text}
\`\`\`
`;
  }

  const selections = selectionInformationList
    .map((selectionInformation, index) =>
      stringifyOneSelectionInformation(
        fileContent,
        selectionInformation,
        index,
      ),
    )
    .join("\n");

  return selections;
}

export async function predictCodeCompletion(
  stt: BaseSTT | undefined,
  llm: BaseLLM,
  tts: BaseTTS | undefined,
  fileContent: string,
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
${
  selectionInformationList.length > 0
    ? "The information about the selected block and highlighted text are given along with the full code file."
    : ""
} 
Finally, you must return in the specified format.

Code file:
\`\`\`
${addLineInfo(fileContent)}
\`\`\`

${selectionInformationList.length > 0 ? "These are the selection information provided by the developer:" : ""}
${stringifySelectionInformationList(fileContent, selectionInformationList)}

After reviewing the code, execute the following instruction:
\`\`\`
${llmInstruction}
\`\`\`

Finally, you must return a JSON containing the code completion and give an \
explanation in the following format:
\`\`\`
{
  "codeCompletion": "The code completion goes here. \
It must be printed out with line number and change status if any. \
You must use the same programming language as the code file. When coming up with the code completion, remember to add line number \
in the following format: \`[+\\-*] line\\d+\\|\`. \
If you have added/deleted/modified any line, you must indicate the line number where it happened. \
'+' means added, '-' means deleted, and '*' means modified.
e.g. if you have added a comment "this is for later" in line 5, it should be: \`+ line5|//this is for later\`;
or if line 6 was originally "console.log('hello world');" and you deleted it, you should return: \`- line6|console.log('hello world');\`;",
  "explanation": "An explanation of the code completion goes here"
}
\`\`\`
`;
  let llmResult = await llm.generate(llmPrompt);
  console.log("LLM result:\n" + llmResult);
  // strip the ```json or ``` from the beginning and ``` from the end if present
  llmResult = llmResult
    .replace(/^```(?:json)?/, "")
    .replace(/```$/, "")
    .trim();
  const llmResultJson = JSON.parse(llmResult);
  const codeCompletion = llmResultJson.codeCompletion;
  const explanation = llmResultJson.explanation;
  console.log("Prompt:\n" + llmPrompt);
  // Pretty print the result
  console.log("Code completion:\n" + codeCompletion);
  console.log("Explanation:\n" + explanation);

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
