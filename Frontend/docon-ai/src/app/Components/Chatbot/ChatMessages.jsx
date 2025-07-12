import ReactMarkdown from "react-markdown";
export default function ChatMessages({ messages }) {
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
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
