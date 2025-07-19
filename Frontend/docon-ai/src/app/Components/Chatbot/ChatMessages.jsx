'use client';

import ReactMarkdown from "react-markdown";

export default function ChatMessages({ messages, isLoading }) {
  return (
    <div className="w-full">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`mb-6 ${
            msg.role === "user" ? "flex justify-end" : "flex justify-start"
          }`}
        >
          <div className={`${msg.role === "user" ? "max-w-[75%]" : "w-full"}`}>
            <p className="text-xs text-gray-500 mb-1">
              {msg.role === "user" ? "You" : "DoCon.AI"}
            </p>

            {msg.role === "user" ? (
              <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow text-base whitespace-pre-wrap">
                {msg.content}
              </div>
            ) : (
              <div className="text-base whitespace-pre-wrap text-black leading-relaxed w-full">
                <div className="bg-gray-200 px-4 py-2 rounded-lg shadow">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {msg.tier && (
                  <div className="mt-1 text-xs italic text-purple-500">
                    Response Source: {formatTier(msg.tier)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Show loading animation if response is being generated */}
      {isLoading && (
        <div className="flex justify-start mb-6">
          <div className="w-full">
            <p className="text-xs text-gray-500 mb-1">DoCon.AI</p>
            <div className="bg-gray-200 px-4 py-2 rounded-lg shadow w-fit">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Utility to format tier string into a readable label
function formatTier(tier) {
  const map = {
    documents: "Project Documents",
    google_search_live: "Live Google Search",
    google_search_cached: "Cached Google Search",
    general_knowledge: "General Knowledge",
  };
  return map[tier] || tier;
}
