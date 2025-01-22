import { Test } from "@pulse-editor/types";

export default function useTest() {
  function getTest(): Test {
    return {
      a: "a",
      b: 1,
    };
  }

  return {
    getTest,
  };
}
