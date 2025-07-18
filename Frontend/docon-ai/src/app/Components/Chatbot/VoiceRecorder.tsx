"use client";
import { useState, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface VoiceRecorderProps {
  setMessage: (text: string) => void;
}

export default function VoiceRecorder({ setMessage }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioChunksRef.current = [];
        await uploadAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const uploadAudio = async (blob: Blob) => {
  setIsLoading(true);
  try {
    const formData = new FormData();
    formData.append("file", blob, "recording.webm"); // ensure .webm extension matches what you send

    const res = await fetch("http://localhost:8000/chatbot/voice-to-text", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok && data.text) {
      setMessage(data.text);
    } else {
      console.error("Transcription failed:", data);
      alert(`Transcription failed: ${JSON.stringify(data)}`); // show detailed error to user
    }
  } catch (error) {
    console.error("Upload error:", error);
  } finally {
    setIsLoading(false);
  }
};
 
  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all ${
        isRecording ? "text-red-500 animate-pulse" : "text-gray-600"
      }`}
      title={isRecording ? "Stop recording" : "Start voice input"}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isRecording ? (
        <MicOff className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </button>
  );
}
