"use client";
import { useState } from "react";
import {
  MessageSquarePlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { BoxIcon } from "lucide-react";
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
      className={`bg-[#024a71] text-white  h-screen transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-14" : "w-60"
      } flex flex-col justify-start p-2 relative`}
    >
      {/* Collapse/Expand Button */}
      <div className="mb-4 py-4 px-2">
        {isCollapsed ? (
    <div className="flex justify-center">
      <button onClick={() => setIsCollapsed(false)}>
        <ChevronRight className="text-white" />
      </button>
    </div>
  ) : (
    <div className="flex justify-between items-center">
      <div className="flex items-center cursor-pointer" onClick={() => window.location.href = "/Client/Dashboard"}>
        <BoxIcon width={28} height={28} className="text-white" />
        <h2 className="text-lg font-bold ml-2 hover:underline">Docon. AI</h2>
      </div>
      <button onClick={() => setIsCollapsed(true)} className="text-white hover:text-gray-300">
        <ChevronLeft />
      </button>
    </div>
  )}

        {/* New Chat Button */}
        {isCollapsed ? (
          <div className="flex justify-center mt-4">
            <button
              className="p-2 rounded "
              title="New Chat"
              onClick={handleNewChat}
            >
              <MessageSquarePlus className="text-white" />
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <button
              className="flex items-center gap-2 pl-0 hover:pl-2  pr-3 w-full py-2 rounded-md transition-all duration-200 ease-in-out font-bold
     hover:text-blue-900 hover:bg-white hover:scale-[1.02] hover:shadow-sm "
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
    <h3 className="text-white text-sm  font-semibold opacity-60 px-1 mb-2  tracking-wide">
      Previous Chats
    </h3>
    {chatSessions.map((session) => (
      <p
  key={session.session_id}
  onClick={() => handleSelectSession(session.session_id)}
  className={`truncate px-3 py-3 rounded-md cursor-pointer transform transition-all duration-200 ease-in-out
    ${
      selectedChat === session.session_id
        ? "bg-blue-100 text-blue-900 font-semibold"
        : "hover:bg-blue-200 hover:text-blue-900 hover:font-bold text-white font-bold hover:scale-[1.02] hover:shadow-sm"
    }
  `}
>
        {session.title || "Untitled"}
      </p>
    ))}
  </div>
)}

    </div>
  );
}
