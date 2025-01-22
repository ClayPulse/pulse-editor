export type Test = {
  a: string;
  b: number;
};

export type TextFileSelection = {
  lineStart: number;
  lineEnd: number;
  text: string;
};

export type ViewFile = {
  fileContent: string;
  filePath: string;
  selections?: TextFileSelection[];
};
