// ChatMessage.jsx
// Renders a single chat bubble (user or assistant), with avatar and timestamp.

export default function ChatWindow({ role, content, timestamp }) {
  const isUser = role === "user";

  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && <Avatar role="assistant" />}

      <div
        className={`max-w-[75%] px-4 py-3 shadow-sm text-sm leading-relaxed ${
          isUser
            ? "bg-purple-600 text-white rounded-2xl rounded-br-sm"
            : "bg-white text-gray-800 rounded-2xl rounded-bl-sm"
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {timestamp && (
          <span
            className={`block mt-1 text-[10px] ${
              isUser ? "text-purple-200" : "text-gray-400"
            }`}
          >
            {new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {isUser && <Avatar role="user" />}
    </div>
  );
}

function Avatar({ role }) {
  const isUser = role === "user";
  return (
    <div
      className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shrink-0 ${
        isUser ? "bg-purple-200 text-purple-700" : "bg-emerald-100 text-emerald-700"
      }`}
    >
      {isUser ? "You" : "AI"}
    </div>
  );
}