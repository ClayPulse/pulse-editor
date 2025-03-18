import { useRef, useState } from "react";

export default function useRecorder() {
  // Recording refs
  const inStreamRef = useRef<MediaStream | null>(null);
  const [audioData, setAudioData] = useState<Blob | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  async function getRecorder() {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorder.ondataavailable = (e) => {
      const blob = new Blob([e.data], { type: "audio/wav" });
      setAudioData(blob);
    };
    mediaRecorder.onstop = () => {
      console.log("Recording stopped");
      inStreamRef.current?.getTracks().forEach((track) => track.stop());
    };

    inStreamRef.current = mediaStream;
    recorderRef.current = mediaRecorder;
  }

  async function startRecording() {
    setAudioData(null);
    await getRecorder();
    console.log("Recording started:", recorderRef.current);
    recorderRef.current?.start();
  }

  async function stopRecording() {
    // Close the recorder
    recorderRef.current?.stop();
  }

  return { startRecording, stopRecording, audioData };
}
