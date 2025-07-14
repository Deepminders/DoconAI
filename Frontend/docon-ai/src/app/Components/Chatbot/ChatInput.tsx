"use client";
import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface ChatInputProps {
  chatLog: any[];
  setChatLog: Dispatch<SetStateAction<any[]>>;
  sessionId: string | null;
  setSessionId: (id: string) => void;
  userId: string;
  updateSessions?: (newSessionId: string) => void; // optional: to update sidebar if needed
}

export default function ChatInput({
  chatLog,
  setChatLog,
  sessionId,
  setSessionId,
  userId,
  updateSessions,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!message.trim()) return;

    let currentSessionId = sessionId;

    // 🆕 Create a session if not already created
    if (!currentSessionId) {
      try {
        const res = await fetch("http://localhost:8000/chatbot/start-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });
        const data = await res.json();
        currentSessionId = data.session_id;
        setSessionId(currentSessionId);

        // Optionally update session list (Sidebar)
        if (updateSessions) updateSessions(currentSessionId);
      } catch (err) {
        console.error("Failed to create session:", err);
        return;
      }
    }

    // Add user message to UI
    setChatLog((prev) => [...prev, { role: "user", content: message }]);

    try {
      const res = await fetch("http://localhost:8000/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          session_id: currentSessionId,
          message,
        }),
      });

      const data = await res.json();

      // Add assistant reply
      setChatLog((prev) => [...prev, { role: "assistant", content: data.reply }]);
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Ask DoCon.AI"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        className="w-full border border-gray-300 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-[#66B0DF] placeholder-gray-500 text-black"
      />
      <button
        type="submit"
        onClick={handleSend}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#000000] hover:bg-[#5598bd] p-2 rounded-full flex items-center justify-center cursor-pointer"
      >
        <ArrowUp size={20} className="text-white" />
      </button>
    </div>
  );
}
