"use client";
import { useEffect, useState } from "react";
import Sidebar from "../../../Components/Chatbot/sidebar";
import ChatInput from "../../../Components/Chatbot/ChatInput";
import ChatMessages from "../../../Components/Chatbot/ChatMessages";

interface Session {
  session_id: string;
  title: string;
}

export default function ChatPage() {
  const [chatLog, setChatLog] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<Session[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const userId = "6818345c2304d86da0d35376"; // Replace with actual auth value

  // Load sessions once on mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
      // Clean up empty sessions first
      await fetch(`http://localhost:8000/chatbot/delete-empty-sessions/${userId}`, {
        method: "DELETE",
      });

      // Then fetch valid sessions
      const res = await fetch(`http://localhost:8000/chatbot/sessions/${userId}`);
      const data = await res.json();
      setChatSessions(data);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      }
    };
    fetchSessions();
  }, [userId]);

  const hasMessages = chatLog.length > 0;

  const handleUpdateSessions = (newSessionId: string) => {
    setChatSessions((prev) => [
      { session_id: newSessionId, title: "Untitled" },
      ...prev,
    ]);
    setSelectedChat(newSessionId);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      <Sidebar
        userId={userId}
        setSessionId={setSessionId}
        setChatLog={setChatLog}
        setChatSessions={setChatSessions}
        chatSessions={chatSessions}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
      />

      <div className="flex flex-col flex-1 relative">
        {hasMessages ? (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-3xl mx-auto w-full">
                <ChatMessages messages={chatLog} />
              </div>
            </div>

            <div className="w-full px-4 py-3 sticky bottom-0">
              <div className="max-w-3xl mx-auto w-full">
                <ChatInput
                  chatLog={chatLog}
                  setChatLog={setChatLog}
                  sessionId={sessionId}
                  setSessionId={setSessionId}
                  userId={userId}
                  updateSessions={handleUpdateSessions}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 px-4">
            <div className="max-w-xl w-full text-center mb-6">
              <h1 className="text-2xl font-semibold text-black">
                How can I help you today?
              </h1>
            </div>
            <div className="w-full max-w-xl">
              <ChatInput
                chatLog={chatLog}
                setChatLog={setChatLog}
                sessionId={sessionId}
                setSessionId={setSessionId}
                userId={userId}
                updateSessions={handleUpdateSessions}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
