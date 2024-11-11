export interface DrawnLine {
  tool: string;
  points: number[];
}

export interface SelectionInformation {
  lineStart: number;
  lineEnd: number;
  colStart: number;
  colEnd: number;
}

export interface MenuStates {
  isDrawingMode: boolean;
}
