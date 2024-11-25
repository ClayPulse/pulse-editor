import {
  CodeCompletionInstruction,
  CodeCompletionResult,
  InlineSuggestionResult,
  LineChange,
  SelectionInformation,
} from "../interface";
import { BaseLLM } from "../llm/llm";
import { BaseSTT } from "../stt/stt";
import { BaseTTS } from "../tts/tts";

export function addLineInfo(
  fileContent: string,
  startFrom: number = 1,
): string {
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

export function getContentWithIndicator(
  fileContent: string,
  cursorX: number,
  cursorY: number,
): string {
  const lines = fileContent.split("\n");
  const cursorXNormalized = cursorX - 1;
  const cursorYNormalized = cursorY - 1;

  // Indicate where the agent should suggest the code at
  const suggestIndication = "(Suggest code snippet here)";
  lines[cursorYNormalized] =
    lines[cursorYNormalized].slice(0, cursorXNormalized) +
    suggestIndication +
    lines[cursorYNormalized].slice(cursorXNormalized);

  return lines.join("\n");
}

export class CodeAgent {
  stt: BaseSTT | undefined;
  llm: BaseLLM;
  tts: BaseTTS | undefined;
  constructor(
    stt: BaseSTT | undefined,
    llm: BaseLLM,
    tts: BaseTTS | undefined,
  ) {
    this.stt = stt;
    this.llm = llm;
    this.tts = tts;
  }

  public getLineChanges(text: string): LineChange[] {
    const lines = text.split("\n");
    const lineChanges: LineChange[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // If line matches the pattern /^[+\-*]\s*line\s*\d+\s*\|/
      const match = line.match(/^([+\-*])\s*line\s*(\d+)\s*\|/);
      // Get the status and line number which is
      if (match) {
        const status = match[1];
        const lineNumber = parseInt(match[2]);
        const content = line.slice(match[0].length);
        lineChanges.push({
          index: lineNumber,
          content: content,
          status:
            status === "+" ? "added" : status === "-" ? "deleted" : "modified",
        });
      }
    }

    return lineChanges;
  }

  public async generateAgentCompletion(
    fileContent: string,
    selectionInformationList: SelectionInformation[],
    instruction: CodeCompletionInstruction,
  ): Promise<CodeCompletionResult> {
    let llmInstruction;
    if (instruction.text) {
      llmInstruction = instruction.text;
    } else if (this.stt && instruction.audio) {
      const sttResult = await this.stt.generate(instruction.audio);
      llmInstruction = sttResult;
    } else if (this.stt) {
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
  ${this.stringifySelectionInformationList(fileContent, selectionInformationList)}
  
  After reviewing the code, execute the following instruction:
  \`\`\`
  ${llmInstruction}
  \`\`\`
  
  Finally, you must return a JSON containing the code completion and give an \
  explanation in the following format:
  \`\`\`
  {
    "codeCompletion": "The code completion goes here which includes lines of code you created. \
You must use the same programming language as the code file. \
It must print out line number and change status if any, each line ends with a new line character. \
When coming up with the code completion, remember to add line number \
in the following format: \`[+\\-*] line \\d+\\|\`. \
If you have added/deleted/modified any line, you must indicate the line number where it happened. \
'+' means added, '-' means deleted, and '*' means modified.
e.g. if you have added a comment "this is for later" in line 5, it should be: \`+ line5|//this is for later\`;
or if line 6 was originally "console.log('hello world');" and you deleted it, you should return: \`- line6|console.log('hello world');\`;\
or if line 7 was modified from "let x = 5;" to "let x = 10;", you should return: \`* line7|let x = 10;\`.",
    "explanation": "An explanation of the code completion goes here. It must be in the same language that the user uses in their instruction."
  }
  \`\`\`
  `;
    let llmResult = await this.llm.generate(llmPrompt);
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
    if (this.tts) {
      ttsResult = await this.tts.generate(explanation);
    }

    const result: CodeCompletionResult = {
      text: llmResultJson,
      audio: ttsResult,
    };

    return result;
  }

  private stringifyOneSelectionInformation(
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

  private stringifySelectionInformationList(
    fileContent: string,
    selectionInformationList: SelectionInformation[],
  ): string {
    const selections = selectionInformationList
      .map((selectionInformation, index) =>
        this.stringifyOneSelectionInformation(
          fileContent,
          selectionInformation,
          index,
        ),
      )
      .join("\n");

    return selections;
  }
}

export class InlineSuggestionAgent {
  llm: BaseLLM;
  constructor(llm: BaseLLM) {
    this.llm = llm;
  }

  public async generateInlineSuggestion(
    fileContent: string,
    cursorX: number,
    cursorY: number,
    numberOfSuggestions: number,
  ): Promise<InlineSuggestionResult> {
    const fileContentWithIndicator = getContentWithIndicator(
      fileContent,
      cursorX,
      cursorY,
    );

    const llmPrompt = `\
  You are a helpful code copilot who is suggesting code snippets to the developer. \
  You must review the code and provide inline suggestions. \
  The developer has indicated where you should suggest the code. \
  You must return in the specified format.

  Code file:
  \`\`\`
  ${fileContentWithIndicator}
  \`\`\`

  After reviewing the code, provide ${numberOfSuggestions} inline suggestion(s) where indicated. Then, \
  return a JSON containing the suggestions in the following format:
  \`\`\`
  {
    "suggestions": [${Array.from(
      { length: numberOfSuggestions },
      (_, i) => `"Suggestion ${i + 1}"`,
    )}]
  }
  \`\`\`
  `;
    let llmResult = await this.llm.generate(llmPrompt);
    console.log("LLM result:\n" + llmResult);
    // strip the ```json or ``` from the beginning and ``` from the end if present
    llmResult = llmResult
      .replace(/^```(?:json)?/, "")
      .replace(/```$/, "")
      .trim();
    const llmResultJson = JSON.parse(llmResult);
    const suggestions = llmResultJson.suggestions;
    console.log("Prompt:\n" + llmPrompt);
    // Pretty print the result
    console.log("Suggestions:\n" + suggestions);

    const result: InlineSuggestionResult = {
      suggestions: suggestions,
    };

    return result;
  }
}
