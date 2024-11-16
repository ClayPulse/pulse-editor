export type Point = { x: number; y: number };

/**
 * Function to calculate the cross product of two vectors
 * @param p - Starting point
 * @param q - Middle point
 * @param r - End point
 * @returns Positive if counter-clockwise, negative if clockwise, zero if collinear
 */
function crossProduct(p: Point, q: Point, r: Point): number {
  return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
}

/**
 * Graham's scan algorithm to find the convex hull of a set of points.
 * @param points - Array of Point objects with x and y coordinates
 * @returns Array of points that form the convex hull
 */
export function convexHull(points: Point[]): Point[] {
  // Sort the points by x, then by y if x is the same
  points.sort((a, b) => a.x - b.x || a.y - b.y);

  const lower: Point[] = [];
  const upper: Point[] = [];

  // Build the lower hull
  for (const p of points) {
    while (
      lower.length >= 2 &&
      crossProduct(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }

  // Build the upper hull
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    while (
      upper.length >= 2 &&
      crossProduct(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }

  // Remove the last point of each half because it's repeated at the beginning of the other half
  upper.pop();
  lower.pop();

  // Concatenate lower and upper hulls to get the convex hull
  return lower.concat(upper);
}
