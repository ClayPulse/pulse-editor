import { DrawnLine } from "../types";

export function normalizeBoundingRect(rect: DOMRect, parentRect: DOMRect): DOMRect {
  // Get the relative position of the child element
  const x = rect.x - parentRect.x;
  const y = rect.y - parentRect.y;

  const normalized: DOMRect = {
    x,
    y,
    width: rect.width,
    height: rect.height,
    top: y,
    right: x + rect.width,
    bottom: y + rect.height,
    left: x,
    toJSON: function () {
      return {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        top: this.top,
        right: this.right,
        bottom: this.bottom,
        left: this.left,
      };
    },
  };

  return normalized;
}

export function isLineInRect(line: DrawnLine, boundingRect: DOMRect) {
  // Check if the line is within the bounding box
  let isInRect = false;
  line.points.forEach((point) => {
    if (
      point.x >= boundingRect.x &&
      point.x <= boundingRect.x + boundingRect.width &&
      point.y >= boundingRect.y &&
      point.y <= boundingRect.y + boundingRect.height
    ) {
      isInRect = true;
    }
  });

  return isInRect;
}