"use client";
import { useState, useEffect } from "react";
import {
  MessageSquarePlus,
  ChevronLeft,
  ChevronRight,
  BoxIcon,
  MoreVertical,
  Trash2,
  Pencil,
} from "lucide-react";

interface Session {
  session_id: string;
  title: string;
}

interface SidebarProps {
  setSessionId: (id: string | null) => void;
  setChatLog: (log: any[]) => void;
  setChatSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  chatSessions: Session[];
  selectedChat: string | null;
  setSelectedChat: (id: string | null) => void;
}

export default function Sidebar({
  setSessionId,
  setChatLog,
  setChatSessions,
  chatSessions,
  selectedChat,
  setSelectedChat,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renameInputValue, setRenameInputValue] = useState("");

  // 🔁 Fetch token
  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("token");
      setToken(t);
    }
  }, []);

  // 🔁 Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      if (!token) return;

      setLoadingSessions(true);
      try {
        const res = await fetch("http://localhost:8000/chatbot/sessions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (Array.isArray(data)) {
          setChatSessions(data);
        } else {
          console.warn("Unexpected response format for sessions:", data);
          setChatSessions([]);
        }
      } catch (err) {
        console.error("Error fetching chat sessions:", err);
        setChatSessions([]);
      } finally {
        setLoadingSessions(false);
      }
    };

    if (token) {
      fetchSessions();
    }
  }, [token, setChatSessions]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const isDropdownOrButton = target.closest(".dropdown-menu, .dots-button");
      if (!isDropdownOrButton) {
        setDropdownOpenId(null);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // ➕ Start New Chat
  const handleNewChat = () => {
    setSessionId(null);
    setSelectedChat(null);
    setChatLog([]);
  };

  // 🕘 Load chat history
  const handleSelectSession = async (sessionId: string) => {
    if (!sessionId || !token) return;

    setSelectedChat(sessionId);
    setSessionId(sessionId);

    try {
      const res = await fetch(
        `http://localhost:8000/chatbot/history/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        console.warn("Failed to fetch chat history:", res.status);
        setChatLog([]);
        return;
      }

      const history = await res.json();
      setChatLog(Array.isArray(history) ? history : []);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      setChatLog([]);
    }
  };

  // ✏️ Rename session
  const handleRename = async (sessionId: string) => {
    const newTitle = prompt("Enter new title:");
    if (!newTitle?.trim()) return;

    try {
      await fetch(`http://localhost:8000/chatbot/rename-session/${sessionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });

      setChatSessions((prev) =>
        prev.map((s) =>
          s.session_id === sessionId ? { ...s, title: newTitle } : s
        )
      );
    } catch (err) {
      console.error("Rename failed", err);
    } finally {
      setDropdownOpenId(null);
    }
  };

  // 🗑️ Delete session
  const handleDelete = async (sessionId: string) => {
    try {
      await fetch(`http://localhost:8000/chatbot/delete-session/${sessionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setChatSessions((prev) => prev.filter((s) => s.session_id !== sessionId));

      if (selectedChat === sessionId) {
        setSelectedChat(null);
        setChatLog([]);
      }
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDropdownOpenId(null);
    }
  };

  return (
    <div
      className={`bg-[#024a71] text-white h-screen transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-14" : "w-66"
      } flex flex-col justify-start p-2 relative`}
    >
      {/* Collapse/Expand */}
      <div className="mb-4 py-4 px-2">
        {isCollapsed ? (
          <div className="flex justify-center">
            <button onClick={() => setIsCollapsed(false)}>
              <ChevronRight className="text-white" />
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => (window.location.href = "/Client/Dashboard")}
            >
              <BoxIcon width={28} height={28} className="text-white" />
              <h2 className="text-lg font-bold ml-2 hover:underline">Docon. AI</h2>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-white hover:text-gray-300"
            >
              <ChevronLeft />
            </button>
          </div>
        )}

        {/* ➕ New Chat */}
        {isCollapsed ? (
          <div className="flex justify-center mt-4">
            <button className="p-2 rounded" title="New Chat" onClick={handleNewChat}>
              <MessageSquarePlus className="text-white" />
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <button
              className="flex items-center gap-2 pl-0 hover:pl-2 pr-3 w-full py-2 rounded-md transition-all duration-200 ease-in-out font-bold
                hover:text-blue-900 hover:bg-white hover:scale-[1.02] hover:shadow-sm"
              onClick={handleNewChat}
            >
              <MessageSquarePlus />
              <span>New Chat</span>
            </button>
          </div>
        )}
      </div>

      {/* 🔁 Session List */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 text-sm w-full px-2">
          <h3 className="text-white text-sm font-semibold opacity-60 px-1 mb-2 tracking-wide">
            Previous Chats
          </h3>

          {loadingSessions ? (
            <p className="text-white text-sm px-2 italic opacity-50">Loading...</p>
          ) : Array.isArray(chatSessions) && chatSessions.length > 0 ? (
            chatSessions.map((session) => (
              <div key={session.session_id} className="relative group **overflow-visible**">
              {renamingSessionId === session.session_id ? (
  <input
    type="text"
    autoFocus
    className="w-full px-3 py-2 rounded-md bg-white text-black text-sm outline-none"
    value={renameInputValue}
    onChange={(e) => setRenameInputValue(e.target.value)}
    onBlur={() => {
      if (renameInputValue.trim() && renameInputValue !== session.title) {
        fetch(`http://localhost:8000/chatbot/rename-session/${session.session_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: renameInputValue }),
        })
          .then(() => {
            setChatSessions((prev) =>
              prev.map((s) =>
                s.session_id === session.session_id
                  ? { ...s, title: renameInputValue }
                  : s
              )
            );
          })
          .catch((err) => console.error("Rename failed", err));
      }
      setRenamingSessionId(null);
    }}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.currentTarget.blur(); // triggers onBlur
      } else if (e.key === "Escape") {
        setRenamingSessionId(null);
      }
    }}
  />
) : (
  <p
    onClick={() => handleSelectSession(session.session_id)}
    className={`truncate px-3 py-3 rounded-md cursor-pointer transform transition-all duration-200 ease-in-out ${
      selectedChat === session.session_id
        ? "bg-blue-100 text-blue-900 font-semibold"
        : "hover:bg-blue-200 hover:text-blue-900 hover:font-bold text-white  hover:scale-[1.02] hover:shadow-sm"
    }`}
  >
    {session.title || "Untitled"}
  </p>
)}


                <button
                  onClick={() =>
                    setDropdownOpenId((prev) =>
                      prev === session.session_id ? null : session.session_id
                    )
                  }
                  className="absolute right-2 top-2  text-black hover:text-gray-300 p-1 dots-button pl-8 pr-0"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {dropdownOpenId === session.session_id && (
                  <div
                    className="absolute right-[-20px] top-10 mt-1 z-50 dropdown-menu w-36
                               bg-white rounded-md shadow-lg transform origin-top-right transition-all duration-200 ease-out scale-y-100" // Adjusted classes
                    style={{
                      transform: dropdownOpenId === session.session_id ? 'scaleY(1)' : 'scaleY(0)',
                      transformOrigin: 'top right'
                    }}
                  >
                    <button
                      onClick={() => {
  setRenamingSessionId(session.session_id);
  setRenameInputValue(session.title || "");
  setDropdownOpenId(null);
}}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Rename
                    </button>
                    <button
                      onClick={() => handleDelete(session.session_id)}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-white text-sm px-2 italic opacity-50">No previous chats</p>
          )}
        </div>
      )}
    </div>
  );
}