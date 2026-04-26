const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Send a chat message — non-streaming (simple usage).
 */
export async function askMentor({ messages, studentName, learningMode }) {
  const res = await fetch(`${BASE_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      student_name: studentName,
      learning_mode: learningMode,
    }),
  });
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  return res.json(); // { answer, topic_detected }
}

/**
 * Send a chat message with real-time streaming.
 * onChunk(text, topicDetected) is called for each SSE chunk.
 * Returns the full final text.
 */
export async function askMentorStream({ messages, studentName, learningMode, onChunk, onTopic }) {
  const res = await fetch(`${BASE_URL}/ask/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      student_name: studentName,
      learning_mode: learningMode,
      stream: true,
    }),
  });

  if (!res.ok) throw new Error(`Backend error: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const raw = decoder.decode(value);
    const lines = raw.split("\n").filter((l) => l.startsWith("data: "));

    for (const line of lines) {
      const data = line.replace("data: ", "").trim();
      if (data === "[DONE]") break;
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === "meta" && parsed.topic && onTopic) {
          onTopic(parsed.topic);
        } else if (parsed.type === "text" && parsed.text) {
          fullText += parsed.text;
          if (onChunk) onChunk(fullText);
        } else if (parsed.type === "error") {
          throw new Error(parsed.text);
        }
      } catch (e) {
        if (e.message.startsWith("Backend error") || e.message.startsWith("⚠️")) throw e;
      }
    }
  }

  return fullText;
}

/**
 * Detect which math topic a message relates to.
 */
export async function detectTopic(message) {
  try {
    const res = await fetch(`${BASE_URL}/detect-topic`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

/**
 * Health check.
 */
export async function healthCheck() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
