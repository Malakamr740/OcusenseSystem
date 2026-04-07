import { useEffect, useRef, useState } from "react";
import {
  createChatSession,
  getMyChatSessions,
  getChatMessages,
  sendChatMessage,
  submitChatMessageFeedback,
} from "../api";
import { useAuth } from "../auth/AuthContext";

export default function ChatbotPage() {
  const { token } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [feedbackLoadingId, setFeedbackLoadingId] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    loadSessions();
  }, [token]);

  useEffect(() => {
    if (!token || !selectedSessionId) return;
    loadMessages(selectedSessionId);
  }, [token, selectedSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadSessions() {
    try {
      setLoadingSessions(true);
      setError("");

      const data = await getMyChatSessions(token);
      setSessions(data);

      if (data.length > 0 && !selectedSessionId) {
        setSelectedSessionId(data[0].id);
      }
    } catch (err) {
      setError(err.message || "Failed to load chat sessions");
    } finally {
      setLoadingSessions(false);
    }
  }

  async function loadMessages(sessionId) {
    try {
      setLoadingMessages(true);
      setError("");

      const data = await getChatMessages(sessionId, token);
      setMessages(data);
    } catch (err) {
      setError(err.message || "Failed to load chat messages");
    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleCreateSession() {
    try {
      setError("");
      setSuccess("");

      const newSession = await createChatSession(
        {
          title: "New Eye Chat",
          context_type: "ocular_assistant",
        },
        token
      );

      setSuccess("Chat session created.");
      await loadSessions();
      setSelectedSessionId(newSession.id);
      setMessages([]);
    } catch (err) {
      setError(err.message || "Failed to create chat session");
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();

    if (!newMessage.trim() || !selectedSessionId || sending) return;

    try {
      setSending(true);
      setError("");
      setSuccess("");

      const returnedMessages = await sendChatMessage(
        selectedSessionId,
        { content: newMessage },
        token
      );

      setMessages((prev) => [...prev, ...returnedMessages]);
      setNewMessage("");
      await loadSessions();
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  }

    async function handleFeedback(messageId, rating) {
        try {
        setFeedbackLoadingId(messageId);
        setError("");
        setSuccess("");

        const ratingString = rating === 1 ? "helpful" : "not_helpful";

        await submitChatMessageFeedback(
        messageId,
        {
            rating: ratingString,
            comment: null,
        },
        token
        );

        setFeedbackGiven((prev) => ({
        ...prev,
        [messageId]: rating,
        }));

        setSuccess("Feedback submitted.");
    } catch (err) {
        setError(
        typeof err === "string"
            ? err
            : err?.message || err?.detail || "Failed to submit feedback"
        );
    } finally {
        setFeedbackLoadingId(null);
    }
    }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 16,
          background: "#fff",
          color: "#111",
        }}
      >
        <h3>Chat Sessions</h3>

        <button onClick={handleCreateSession} style={{ marginBottom: 12 }}>
          New Chat
        </button>

        {loadingSessions && <p>Loading sessions...</p>}

        {!loadingSessions && sessions.length === 0 && (
          <p>No chat sessions yet.</p>
        )}

        {!loadingSessions && sessions.length > 0 && (
          <div style={{ display: "grid", gap: 8 }}>
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setSelectedSessionId(session.id)}
                style={{
                  textAlign: "left",
                  padding: 10,
                  borderRadius: 8,
                  border:
                    selectedSessionId === session.id
                      ? "2px solid #2563eb"
                      : "1px solid #ccc",
                  background:
                    selectedSessionId === session.id ? "#eff6ff" : "#fff",
                  color: "#111",
                }}
              >
                <div style={{ fontWeight: "bold" }}>{session.title}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {session.context_type || "general"}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 16,
          background: "#fff",
          color: "#111",
          minHeight: 500,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2>Eye Health Chatbot</h2>
        
        {error && (
        <p style={{ color: "crimson" }}>
            {typeof error === "string"
            ? error
            : error?.detail || JSON.stringify(error)}
        </p>
        )}
        {success && <p style={{ color: "green" }}>{success}</p>}

        {!selectedSessionId && (
          <p>Create or select a chat session to start chatting.</p>
        )}

        {selectedSessionId && (
          <>
            <div
              style={{
                flex: 1,
                border: "1px solid #eee",
                borderRadius: 8,
                padding: 12,
                overflowY: "auto",
                marginBottom: 16,
                background: "#fafafa",
              }}
            >
              {loadingMessages && <p>Loading messages...</p>}

              {!loadingMessages && messages.length === 0 && (
                <p>No messages yet.</p>
              )}

              {!loadingMessages &&
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      marginBottom: 12,
                      textAlign: msg.role === "user" ? "right" : "left",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        padding: 10,
                        borderRadius: 10,
                        background:
                          msg.role === "user" ? "#dbeafe" : "#e5e7eb",
                        color: "#111",
                        maxWidth: "80%",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      <strong>{msg.role === "user" ? "You" : "Assistant"}:</strong>
                      <div>{msg.content}</div>

                      {msg.role === "assistant" && (
                        <div
                          style={{
                            marginTop: 8,
                            display: "flex",
                            gap: 8,
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            onClick={() => handleFeedback(msg.id, 1)}
                            disabled={
                              feedbackLoadingId === msg.id ||
                              feedbackGiven[msg.id] !== undefined
                            }
                          >
                            👍 Helpful
                          </button>

                          <button
                            onClick={() => handleFeedback(msg.id, -1)}
                            disabled={
                              feedbackLoadingId === msg.id ||
                              feedbackGiven[msg.id] !== undefined
                            }
                          >
                            👎 Not Helpful
                          </button>
                        </div>
                      )}

                      {msg.role === "assistant" &&
                        feedbackGiven[msg.id] !== undefined && (
                          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                            Feedback saved
                          </div>
                        )}
                    </div>
                  </div>
                ))}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ display: "flex", gap: 12 }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask about an eye condition..."
                style={{ flex: 1 }}
              />
              <button type="submit" disabled={sending || !newMessage.trim()}>
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}