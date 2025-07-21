"use client";
import { useEffect, useState } from "react";
import Sidebar from "../../../Components/Chatbot/sidebar";
import ChatInput from "../../../Components/Chatbot/ChatInput";
import ChatMessages from "../../../Components/Chatbot/ChatMessages";
import UserProfileMenu from "../../../Components/Common/UserProfileMenu";


interface Session {
  session_id: string;
  title: string;
}

export default function ChatPage() {
  const [chatLog, setChatLog] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<Session[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // ✅ Add loading state

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  // Fetch sessions (with auth) once token is available
  useEffect(() => {
    if (!token) return;

    const fetchSessions = async () => {
      try {
        await fetch(`http://localhost:8000/chatbot/delete-empty-sessions`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const res = await fetch(`http://localhost:8000/chatbot/sessions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setChatSessions(data);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      }
    };

    fetchSessions();
  }, [token]);

  // Fetch chat history when selectedChat changes
  useEffect(() => {
    if (!token || !selectedChat) {
      setChatLog([]);
      setSessionId(null);
      return;
    }

    const fetchChatHistory = async () => {
      try {
        const res = await fetch(`http://localhost:8000/chatbot/history/${selectedChat}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(await res.text());
        const history = await res.json();
        setChatLog(history);
        setSessionId(selectedChat);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };

    fetchChatHistory();
  }, [selectedChat, token]);

  const handleUpdateSessions = (newSessionId: string) => {
    setChatSessions((prev) => [
      { session_id: newSessionId, title: "Untitled" },
      ...prev.filter((s) => s.session_id !== newSessionId),
    ]);
    setSelectedChat(newSessionId);
  };

  const hasMessages = chatLog.length > 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      <div className="fixed top-4 right-4 z-50">
        <UserProfileMenu />
      </div>
      <Sidebar
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
                <ChatMessages messages={chatLog} isLoading={isLoading} /> {/* ✅ Pass isLoading */}
              </div>
            </div>

            <div className="w-full px-4 py-3 sticky bottom-0">
              <div className="max-w-3xl mx-auto w-full">
                <ChatInput
                  chatLog={chatLog}
                  setChatLog={setChatLog}
                  sessionId={sessionId}
                  setSessionId={setSessionId}
                  updateSessions={handleUpdateSessions}
                  setIsLoading={setIsLoading} // ✅ Pass down to control loading animation
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
                updateSessions={handleUpdateSessions}
                setIsLoading={setIsLoading} // ✅ Even for first message
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
