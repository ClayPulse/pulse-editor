export interface DrawnLine {
  tool: string;
  points: {
    x: number;
    y: number;
  }[];
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
