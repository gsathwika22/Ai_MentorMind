import React from "react";
import { Avatar, TopicBadge } from "./components";

export default function ChatMessage({ message, studentName }) {
  const isUser = message.role === "user";

  return (
    <div style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      gap: 10, alignItems: "flex-start",
      animation: "fadeUp 0.3s ease both",
    }}>
      <Avatar name={studentName} isAI={!isUser} />

      <div style={{
        maxWidth: "72%", display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        gap: 4,
      }}>
        {/* Topic badge — only on mentor messages */}
        {!isUser && message.topic && <TopicBadge topic={message.topic} />}

        {/* Bubble */}
        <div style={{
          padding: "11px 15px",
          borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
          fontSize: 14, lineHeight: 1.65,
          color: "var(--text-primary)",
          whiteSpace: "pre-wrap", wordBreak: "break-word",
          background: isUser
            ? "linear-gradient(135deg, rgba(245,158,11,0.14), rgba(239,68,68,0.1))"
            : "rgba(112,72,232,0.1)",
          border: isUser
            ? "1px solid rgba(245,158,11,0.25)"
            : "1px solid rgba(112,72,232,0.22)",
          boxShadow: isUser
            ? "0 2px 12px rgba(245,158,11,0.08)"
            : "0 2px 12px rgba(112,72,232,0.08)",
        }}>
          {message.content}
          {message.streaming && message.content && (
            <span style={{
              display: "inline-block", width: 2, height: 14,
              background: "var(--purple-light)",
              marginLeft: 2, verticalAlign: "middle",
              animation: "blink-cursor 0.8s ease infinite",
            }} />
          )}
        </div>

        {/* Timestamp */}
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}
