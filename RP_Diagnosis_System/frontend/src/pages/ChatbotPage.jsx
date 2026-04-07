import { useEffect, useRef, useState } from "react";
import {
  createChatSession,
  getMyChatSessions,
  getChatMessages,
  sendChatMessage,
  submitChatMessageFeedback,
} from "../api";
import { useAuth } from "../auth/AuthContext";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Alert from "../components/Alert";
import LoadingState from "../components/LoadingState";

/**
 * Professional ChatbotPage
 * 
 * Improves UX by:
 * - PageHeader for professional title
 * - Card-based layout for messages and input
 * - Professional message bubbles with better styling
 * - Alert components for errors/success
 * - LoadingState component
 * - Better session management UI
 * - Professional feedback buttons
 */
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

      setSuccess("Chat session created successfully.");
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

      setSuccess("Thank you for your feedback.");
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
    <div className="page-container">
      <PageHeader 
        title="Eye Health Assistant"
        subtitle="Ask questions about eye conditions and get informed responses"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', marginTop: '2rem', minHeight: '70vh' }}>
        {/* Sidebar with sessions */}
        <Card title="Chat Sessions">
          <button 
            className="btn btn-primary w-100" 
            onClick={handleCreateSession}
            style={{ marginBottom: '1rem' }}
          >
            + New Chat
          </button>

          {loadingSessions && <LoadingState message="Loading sessions..." />}

          {!loadingSessions && sessions.length === 0 && (
            <p style={{ color: '#666', textAlign: 'center' }}>No chat sessions yet.</p>
          )}

          {!loadingSessions && sessions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: selectedSessionId === session.id ? '#007bff' : '#f5f5f5',
                    color: selectedSessionId === session.id ? '#fff' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    borderLeft: selectedSessionId === session.id ? '4px solid #0056b3' : '4px solid transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: selectedSessionId === session.id ? '600' : '500'
                  }}
                >
                  <div>{session.title}</div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    opacity: 0.7,
                    marginTop: '0.25rem'
                  }}>
                    {session.context_type || "general"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Main chat area */}
        <Card title="Conversation">
          {error && (
            <Alert 
              type="danger" 
              message={typeof error === "string" ? error : error?.detail || JSON.stringify(error)}
              dismissible={true}
              onDismiss={() => setError("")}
            />
          )}

          {success && (
            <Alert 
              type="success" 
              message={success}
              dismissible={true}
              onDismiss={() => setSuccess("")}
            />
          )}

          {!selectedSessionId && (
            <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
              Create or select a chat session to start chatting with the Eye Health Assistant.
            </p>
          )}

          {selectedSessionId && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                marginBottom: '1rem',
                minHeight: '400px',
                paddingBottom: '1rem'
              }}>
                {loadingMessages && <LoadingState message="Loading conversation..." />}

                {!loadingMessages && messages.length === 0 && (
                  <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
                    Start the conversation by typing a question below.
                  </p>
                )}

                {!loadingMessages && messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      marginBottom: '1.5rem',
                      display: 'flex',
                      justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <div style={{
                      maxWidth: '80%',
                      backgroundColor: msg.role === "user" ? "#007bff" : "#e9ecef",
                      color: msg.role === "user" ? "#fff" : "#333",
                      padding: '1rem',
                      borderRadius: '12px',
                      borderBottomLeftRadius: msg.role === "user" ? "12px" : "4px",
                      borderBottomRightRadius: msg.role === "user" ? "4px" : "12px",
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.9 }}>
                        {msg.role === "user" ? "You" : "Assistant"}
                      </div>
                      <div>{msg.content}</div>

                      {msg.role === "assistant" && (
                        <div style={{ marginTop: '0.75rem', display: "flex", gap: '0.5rem', justifyContent: "flex-start" }}>
                          <button
                            onClick={() => handleFeedback(msg.id, 1)}
                            disabled={
                              feedbackLoadingId === msg.id ||
                              feedbackGiven[msg.id] !== undefined
                            }
                            style={{
                              padding: '0.4rem 0.8rem',
                              fontSize: '0.85rem',
                              backgroundColor: feedbackGiven[msg.id] === 1 ? '#28a745' : '#fff',
                              color: feedbackGiven[msg.id] === 1 ? '#fff' : '#333',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              opacity: feedbackGiven[msg.id] !== undefined ? 0.6 : 1
                            }}
                          >
                            👍 Helpful
                          </button>

                          <button
                            onClick={() => handleFeedback(msg.id, -1)}
                            disabled={
                              feedbackLoadingId === msg.id ||
                              feedbackGiven[msg.id] !== undefined
                            }
                            style={{
                              padding: '0.4rem 0.8rem',
                              fontSize: '0.85rem',
                              backgroundColor: feedbackGiven[msg.id] === -1 ? '#dc3545' : '#fff',
                              color: feedbackGiven[msg.id] === -1 ? '#fff' : '#333',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              opacity: feedbackGiven[msg.id] !== undefined ? 0.6 : 1
                            }}
                          >
                            👎 Not Helpful
                          </button>
                        </div>
                      )}

                      {msg.role === "assistant" && feedbackGiven[msg.id] !== undefined && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>
                          ✓ Feedback saved
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-control"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask about an eye condition..."
                  style={{ flex: 1 }}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={sending || !newMessage.trim()}
                  style={{ minWidth: '100px' }}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}