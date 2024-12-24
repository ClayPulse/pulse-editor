export function downloadImage(imageData: string) {
  const link = document.createElement("a");
  link.href = imageData;
  link.download = "image.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
