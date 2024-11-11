"use client";

import { Button, Textarea } from "@nextui-org/react";
import { useState } from "react";
import { createWorker, recognize } from "tesseract.js";

export default function OCRPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [recognizedText, setRecognizedText] = useState("");

  async function recognizeText() {
    try {
      const worker = await createWorker("eng");

      const {
        data: { text },
      } = await worker.recognize(imageUrl);
      setRecognizedText(text);
      console.log(text);
      await worker.terminate();
    } catch (error) {
      alert(error);
    }
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-2 py-4">
      <div className="w-[400px]">
        <Textarea
          placeholder="Enter image URL here"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>
      <Button onClick={() => recognizeText()}>Recognize</Button>
      <div className="w-[400px]">
        <Textarea value={recognizedText} isReadOnly variant="bordered" />
      </div>
    </div>
  );
}
