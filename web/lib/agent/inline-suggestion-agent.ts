import { InlineSuggestionResult } from "../types";
import { BaseLLM } from "../llm/llm";

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
    signal?: AbortSignal,
  ): Promise<InlineSuggestionResult> {
    const fileContentWithIndicator = this.getContentWithIndicator(
      fileContent,
      cursorX,
      cursorY,
    );

    const llmPrompt = `\
You are a helpful code copilot who helps a software developer to code. \
You will fill in the middle of the code where "<FILL>" is indicated. \

You must make sure your code snippet(s) are related and continue the code before it. \
E.g. if the developer spells "ap" and you suggest "apple", it is continuing the word.

You must also make sure the indentation and line breaks are correct. \
If your snippet contains multiple lines, each line must end with a new line character; \
if "<FILL>" appears at the end of a line and the code before "<FILL>" is a complete line, \
your code snippet(s) must start with a line break. E.g. "\\nconsole.log('hello world');".

If the previous code before "<FILL>" is a comment, you can suggest a code snippet that \
is related to the comment. \

Code file:
\`\`\`
${fileContentWithIndicator}
\`\`\`

Review the above code, then provide ${numberOfSuggestions} inline snippet(s) indicated \
at "<FILL>". You must return a JSON containing the suggestions in the following format:
\`\`\`
{
  "snippets": [${Array.from(
    { length: numberOfSuggestions },
    (_, i) =>
      `"Suggestion ${i + 1} using the same programming language as the code file."`,
  )}]
}
\`\`\`
`;
    // console.log("Prompt:\n" + llmPrompt);
    let llmResult = await this.llm.generate(llmPrompt, signal);
    // console.log("LLM result:\n" + llmResult);
    // strip the ```json or ``` from the beginning and ``` from the end if present
    llmResult = llmResult
      .replace(/^```(?:json)?/, "")
      .replace(/```$/, "")
      .trim();
    const llmResultJson = JSON.parse(llmResult);
    const snippets = llmResultJson.snippets;
    // Pretty print the result
    // console.log("snippets:\n" + snippets);

    const result: InlineSuggestionResult = {
      snippets: snippets,
    };

    return result;
  }

  private getContentWithIndicator(
    fileContent: string,
    cursorX: number,
    cursorY: number,
  ): string {
    const lines = fileContent.split("\n");
    const cursorXNormalized = cursorX - 1;
    const cursorYNormalized = cursorY - 1;

    // Indicate where the agent should suggest the code at
    const suggestIndication = "<FILL>";
    lines[cursorYNormalized] =
      lines[cursorYNormalized].slice(0, cursorXNormalized) +
      suggestIndication +
      lines[cursorYNormalized].slice(cursorXNormalized);

    return lines.join("\n");
  }
}
