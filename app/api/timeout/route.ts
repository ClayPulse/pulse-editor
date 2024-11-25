export async function GET() {
  // Wait 1 second before returning the suggestion
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return new Response("(Suggestion goes here)");
}
