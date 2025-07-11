"use client";
import { useState } from "react";
import {
  MessageSquarePlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Session {
  session_id: string;
  title: string;
}

interface SidebarProps {
  userId: string;
  setSessionId: (id: string | null) => void;
  setChatLog: (log: any[]) => void;
  setChatSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  chatSessions: Session[];
  selectedChat: string | null;
  setSelectedChat: (id: string | null) => void;
}

export default function Sidebar({
  userId,
  setSessionId,
  setChatLog,
  setChatSessions,
  chatSessions,
  selectedChat,
  setSelectedChat,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 🟢 Only reset the chat UI — don’t save session unless user sends message
  const handleNewChat = () => {
    setSessionId(null);
    setSelectedChat(null);
    setChatLog([]);
  };

  // 🟢 Load previous chat history
  const handleSelectSession = async (sessionId: string) => {
    setSelectedChat(sessionId);
    setSessionId(sessionId);

    try {
      const res = await fetch(`http://localhost:8000/chatbot/history/${sessionId}`);
      const history = await res.json(); // should be [{ role, content }]
      setChatLog(history);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    }
  };

  return (
    <div
      className={`bg-[#16639475] text-black h-screen transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-14" : "w-60"
      } flex flex-col justify-start p-2 relative`}
    >
      {/* Collapse/Expand Button */}
      <div className="mb-4">
        {isCollapsed ? (
          <div className="flex justify-center">
            <button onClick={() => setIsCollapsed(false)}>
              <ChevronRight className="text-black" />
            </button>
          </div>
        ) : (
          <div className="flex justify-end pr-1">
            <button onClick={() => setIsCollapsed(true)}>
              <ChevronLeft className="text-black" />
            </button>
          </div>
        )}

        {/* New Chat Button */}
        {isCollapsed ? (
          <div className="flex justify-center mt-4">
            <button
              className="p-2 rounded hover:bg-blue-300"
              title="New Chat"
              onClick={handleNewChat}
            >
              <MessageSquarePlus className="text-black" />
            </button>
          </div>
        ) : (
          <div className="mt-4 ml-2">
            <button
              className="flex items-center gap-2 p-2 rounded hover:bg-blue-300"
              onClick={handleNewChat}
            >
              <MessageSquarePlus />
              <span>New Chat</span>
            </button>
          </div>
        )}
      </div>

      {/* Chat Titles (only when not collapsed) */}
      {!isCollapsed && (
  <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 text-sm w-full px-2">
    {chatSessions.map((session) => (
      <p
        key={session.session_id}
        onClick={() => handleSelectSession(session.session_id)}
        className={`truncate px-2 py-1 rounded-md cursor-pointer transition ${
          selectedChat === session.session_id
            ? "bg-blue-100 text-blue-900 font-medium"
            : "hover:bg-blue-300"
        }`}
      >
        {session.title || "Untitled"}
      </p>
    ))}
  </div>
)}

    </div>
  );
}
