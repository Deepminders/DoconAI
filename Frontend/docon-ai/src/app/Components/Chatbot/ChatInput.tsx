"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowUp, Mic } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface ChatInputProps {
  chatLog: any[];
  setChatLog: Dispatch<SetStateAction<any[]>>;
  sessionId: string | null;
  setSessionId: (id: string) => void;
  updateSessions?: (newSessionId: string) => void;
  setIsLoading?: (loading: boolean) => void; // ✅ New optional prop
}

export default function ChatInput({
  chatLog,
  setChatLog,
  sessionId,
  setSessionId,
  updateSessions,
  setIsLoading,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) setToken(stored);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const availableHeight = 150;
      const newHeight = Math.min(textareaRef.current.scrollHeight, availableHeight);
      textareaRef.current.style.height = newHeight + "px";
    }
  }, [message]);

  const handleSend = async () => {
    if (!message.trim() || !token) return;

    let currentSessionId = sessionId;

    try {
      if (setIsLoading) setIsLoading(true); // ✅ Start loading

      if (!currentSessionId) {
        const res = await fetch("http://localhost:8000/chatbot/start-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        });

        if (!res.ok) {
          console.error("Failed to create session:", await res.text());
          return;
        }

        const data = await res.json();
        currentSessionId = data.session_id;
        setSessionId(currentSessionId);
        if (updateSessions) updateSessions(currentSessionId);
      }

      setChatLog((prev) => [...prev, { role: "user", content: message }]);

      const res = await fetch("http://localhost:8000/chatbot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          session_id: currentSessionId,
          message,
        }),
      });

      if (!res.ok) {
        console.error("Chat request failed:", await res.text());
        return;
      }

      const data = await res.json();
      setChatLog((prev) => [...prev, { role: "assistant", content: data.reply }]);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      if (setIsLoading) setIsLoading(false); // ✅ End loading
    }
  };

  return (
    <div className="w-full rounded-2xl border border-gray-300 bg-white p-3 flex flex-col space-y-2">
      <textarea
        ref={textareaRef}
        placeholder="Ask DoCon.AI"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
        rows={1}
        className="w-full text-black placeholder-gray-500 resize-none overflow-y-auto focus:outline-none focus:ring-0 min-h-[24px] max-h-[160px] leading-6 px-3 py-2 rounded-lg "
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#5598bd' }}
      />

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => alert("Voice input not implemented yet")}
          className="bg-gray-500 hover:bg-gray-300 p-2 rounded-full flex items-center justify-center"
          title="Voice input"
        >
          <Mic className="w-5 h-5" />
        </button>

        <button
          type="submit"
          onClick={handleSend}
          className="bg-black hover:bg-[#5598bd] p-2 rounded-full flex items-center justify-center"
          title="Send"
        >
          <ArrowUp size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
}
